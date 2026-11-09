// A stand-in for GitHub and Cloudflare's key server, seeded from the real site, so tests touch nothing online.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEAM = "t.cloudflareaccess.com";
const pair = await globalThis.crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await globalThis.crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k" };
const b = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");

export const ENV = {
  ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: "a", ALLOWED_EMAILS: "editor@example.com",
  GITHUB_REPO: "o/r", GITHUB_TOKEN: "t", RECEIPT_KEY: "test-receipt-key", PUBLISH_BRANCH: "practice",
};

export async function token(email = "editor@example.com") {
  const head = `${b({ alg: "RS256", kid: "k" })}.${b({ iss: `https://${TEAM}`, aud: ["a"], exp: Math.floor(Date.now() / 1000) + 3600, email })}`;
  const sig = await globalThis.crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(head));
  return `${head}.${Buffer.from(sig).toString("base64url")}`;
}

const sha = (text) => crypto.createHash("sha1").update(text).digest("hex");
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

export class FakeGitHub {
  constructor() {
    this.blobs = new Map();
    this.trees = new Map();
    this.commits = new Map();
    this.emails = [];
    this.calls = [];
    this.branch = "practice";
    this.failEmail = false;
    this.beforeMove = null; // Runs once, just before the branch moves: stands in for someone else pushing.
    this.failAt = null;

    const files = new Map();
    for (const name of ["schedule.js", "posters.js", "gallery.js", "home-photos.js"]) {
      const text = fs.readFileSync(path.join(root, "site/data", name), "utf8");
      files.set(`site/data/${name}`, this.blob(text));
    }
    for (const folder of ["posters", "gallery", "collection", "presenters"]) {
      for (const name of fs.readdirSync(path.join(root, "site/images", folder))) {
        files.set(`site/images/${folder}/${name}`, this.blob(`image ${folder}/${name}`));
      }
    }
    this.head = this.commit("start", files, null);
  }

  blob(text) { const id = sha(text); this.blobs.set(id, text); return id; }
  commit(message, files, parent) {
    const tree = sha(`tree${JSON.stringify([...files])}`);
    this.trees.set(tree, files);
    const id = sha(`commit${message}${tree}${parent}${this.commits.size}`);
    this.commits.set(id, { message, tree, parent });
    return id;
  }
  filesAt(commit = this.head) { return this.trees.get(this.commits.get(commit).tree); }
  text(file, commit = this.head) { const id = this.filesAt(commit).get(file); return id ? this.blobs.get(id) : undefined; }
  commitCount() { let n = 0; for (let c = this.head; c; c = this.commits.get(c).parent) n++; return n; }

  // Someone else's change arriving, directly on the branch.
  outsidePush(file, text) {
    const files = new Map(this.filesAt());
    files.set(file, this.blob(text));
    this.head = this.commit("outside change", files, this.head);
  }

  install() {
    this.real = globalThis.fetch;
    globalThis.fetch = (url, init) => this.handle(String(url), init || {});
  }
  uninstall() { globalThis.fetch = this.real; }

  async handle(url, { method = "GET", body }) {
    if (url.includes("/cdn-cgi/access/certs")) return json({ keys: [jwk] });
    if (url.startsWith("https://api.resend.com")) {
      if (this.failEmail) return new Response("", { status: 500 });
      this.emails.push(JSON.parse(body));
      return json({ id: "1" });
    }
    const route = url.replace("https://api.github.com/repos/o/r", "");
    this.calls.push(`${method} ${route.split("?")[0]}`);
    if (this.failAt && route.includes(this.failAt)) return new Response("", { status: 500 });
    const data = body ? JSON.parse(body) : null;

    if (route === `/git/ref/heads/${this.branch}`) return json({ object: { sha: this.head } });
    if (route.startsWith("/git/commits/")) return json({ tree: { sha: this.commits.get(route.split("/").pop()).tree } });
    if (route.startsWith("/git/trees/")) {
      const files = this.trees.get(route.split("/").pop().split("?")[0]);
      return json({ truncated: false, tree: [...files].map(([p, s]) => ({ path: p, sha: s, type: "blob" })) });
    }
    if (route.startsWith("/contents/")) {
      const [file, query] = route.replace("/contents/", "").split("?ref=");
      const text = this.text(file, query);
      return text === undefined ? new Response("", { status: 404 }) : new Response(text);
    }
    if (route === "/git/blobs") return json({ sha: this.blob(data.content) }, 201);
    if (route === "/git/trees") {
      const files = new Map(this.trees.get(data.base_tree));
      for (const e of data.tree) {
        if (e.sha === null) files.delete(e.path);
        else if (e.content !== undefined) files.set(e.path, this.blob(e.content));
        else {
          if (!this.blobs.has(e.sha)) return new Response("", { status: 422 });
          files.set(e.path, e.sha);
        }
      }
      const id = sha(`tree${JSON.stringify([...files])}`);
      this.trees.set(id, files);
      return json({ sha: id }, 201);
    }
    if (route === "/git/commits" && method === "POST") {
      const id = sha(`commit${data.message}${data.tree}${data.parents[0]}${this.commits.size}`);
      this.commits.set(id, { message: data.message, tree: data.tree, parent: data.parents[0] });
      return json({ sha: id }, 201);
    }
    if (route === `/git/refs/heads/${this.branch}`) {
      if (this.beforeMove) { const run = this.beforeMove; this.beforeMove = null; run(); }
      if (data.force !== false) throw new Error("A forced update was attempted");
      if (this.commits.get(data.sha).parent !== this.head) return new Response("", { status: 422 });
      this.head = data.sha;
      return json({});
    }
    throw new Error(`Unexpected request: ${method} ${route}`);
  }
}

// A JPEG header of the given size followed by unique filler, as browser-made pictures would look.
export function jpegBase64(w, h, seed = 0) {
  const start = [0xff, 0xd8, 0xff, 0xe0, 0, 4, 1, 1, 0xff, 0xc0, 0, 8, 8, h >> 8, h & 255, w >> 8, w & 255, 1, 0xff, 0xda, 0, 2];
  return Buffer.concat([Buffer.from(start), Buffer.from(`filler ${seed}`), Buffer.from([0xff, 0xd9])]).toString("base64");
}
