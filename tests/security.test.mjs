// Attacks that were tried against the site on 15 November 2026. Each must keep failing.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FakeGitHub, ENV, token, jpegBase64, root } from "./fake-github.mjs";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { clearKeyCache } from "../functions/_lib/auth.js";
import { readText } from "../functions/_lib/body.js";
import { onRequestPost as upload } from "../functions/api/admin/upload.js";
import { onRequestPost as publish } from "../functions/api/admin/publish.js";
import { onRequestPost as undo } from "../functions/api/admin/undo.js";
import { onRequestPost as notify } from "../functions/api/admin/notify.js";
import { onRequestGet as changes } from "../functions/api/admin/changes.js";
import { onRequestGet as adminPage } from "../functions/admin/[[path]].js";

const HOME = "https://x.test";
let gh;
let auth;
let n = 0;
const id = () => `secure-${String(++n).padStart(12, "0")}`;

test.beforeEach(async () => { clearKeyCache(); gh = new FakeGitHub(); gh.install(); auth = await token(); });
test.afterEach(() => gh.uninstall());

const post = (handler, url, body, headers = { Origin: HOME }) => handler({
  env: ENV,
  request: new Request(HOME + url, { method: "POST", headers: { "Cf-Access-Jwt-Assertion": auth, ...headers }, body, duplex: "half" }),
});
const posters = () => parseDataFile(gh.text("site/data/posters.js"), "POSTERS");
const takeDown = () => JSON.stringify({ changeId: id(), ops: [{ op: "removePoster", file: posters()[0].file }] });

test("another website cannot make a signed-in editor's browser change the site", async () => {
  const before = gh.head;
  const tries = {
    "other site": { Origin: "https://evil.example" },
    "other site, plain form": { Origin: "https://evil.example", "content-type": "text/plain", "Sec-Fetch-Site": "cross-site" },
    "no origin at all": {},
    "null origin": { Origin: "null" },
    "lookalike": { Origin: "https://x.test.evil.example" },
    "same site but another subdomain": { Origin: HOME, "Sec-Fetch-Site": "same-site" },
    "plain http": { Origin: "http://x.test" },
  };
  for (const [name, headers] of Object.entries(tries)) {
    for (const [handler, url, body] of [
      [publish, "/api/admin/publish", takeDown()],
      [undo, "/api/admin/undo", "{}"],
      [notify, "/api/admin/notify", JSON.stringify({ type: "help" })],
      [upload, `/api/admin/upload?kind=photo&change=${id()}`, jpegBase64(1600, 1200, 1)],
    ]) {
      const r = await post(handler, url, body, headers);
      assert.equal(r.status, 403, `${name} ${url}`);
      assert.equal((await r.json()).code, "cross_site");
    }
  }
  assert.equal(gh.head, before);
  assert.equal((await post(publish, "/api/admin/publish", takeDown())).status, 200, "this site's own page still works");
});

test("reading stays possible without an Origin header, and changes nothing", async () => {
  const r = await changes({ env: ENV, request: new Request(HOME + "/api/admin/changes", { headers: { "Cf-Access-Jwt-Assertion": auth } }) });
  assert.equal(r.status, 200);
});

test("a body is cut off at its limit, whatever length it declares", async () => {
  const stream = (mb) => new ReadableStream({
    start(c) { const chunk = new TextEncoder().encode("A".repeat(1024 * 1024)); for (let i = 0; i < mb; i++) c.enqueue(chunk); c.close(); },
  });
  for (const [handler, url] of [[undo, "/api/admin/undo"], [notify, "/api/admin/notify"], [publish, "/api/admin/publish"], [upload, `/api/admin/upload?kind=photo&change=${id()}`]]) {
    assert.equal((await post(handler, url, stream(8))).status, 413, url);
  }
  let pulled = 0;
  const endless = new ReadableStream({ pull(c) { pulled++; c.enqueue(new Uint8Array(65536)); } });
  assert.equal(await readText(new Request(HOME, { method: "POST", body: endless, duplex: "half" }), 100000), null);
  assert.ok(pulled < 50, `stopped after ${pulled} chunks`);
  assert.equal(await readText(new Request(HOME, { method: "POST", body: "café" }), 100), "café");
});

test("a flood of made-up key IDs causes one key download, not one each", async () => {
  let downloads = 0;
  const inner = globalThis.fetch;
  globalThis.fetch = (u, i) => { if (String(u).includes("/certs")) downloads++; return inner(u, i); };
  const b = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  for (let i = 0; i < 40; i++) {
    const fake = `${b({ alg: "RS256", kid: `made-up-${i}` })}.${b({ email: "editor@example.com" })}.AAAA`;
    const r = await post(publish, "/api/admin/publish", "{}", { Origin: HOME, "Cf-Access-Jwt-Assertion": fake });
    assert.equal(r.status, 401);
  }
  globalThis.fetch = inner;
  assert.equal(downloads, 1);
});

test("login token tricks are refused", async () => {
  const crypto = await import("node:crypto");
  const b = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const claims = { iss: `https://${ENV.ACCESS_TEAM_DOMAIN}`, aud: ["a"], exp: Math.floor(Date.now() / 1000) + 3600, email: "editor@example.com" };
  const hs = `${b({ alg: "HS256", kid: "k" })}.${b(claims)}`;
  const tokens = [
    `${b({ alg: "none", kid: "k" })}.${b(claims)}.`,
    `${hs}.${crypto.createHmac("sha256", "k").update(hs).digest("base64url")}`,
    `${b({ alg: "RS256", kid: "k", jwk: { kty: "RSA", n: "AQAB", e: "AQAB" } })}.${b(claims)}.AAAA`,
    `${b({ alg: "RS256", kid: "__proto__" })}.${b(claims)}.AAAA`,
  ];
  for (const t of tokens) {
    const r = await post(publish, "/api/admin/publish", takeDown(), { Origin: HOME, "Cf-Access-Jwt-Assertion": t });
    assert.equal(r.status, 401);
  }
});

test("names cannot carry markup, line breaks, or invisible and direction-flipping characters", async () => {
  const c = id();
  const pic = async (kind, w, h) => (await (await post(upload, `/api/admin/upload?kind=${kind}&change=${c}`, jpegBase64(w, h, Math.random()))).json()).receipt;
  const photos = [{ image: await pic("photo", 1600, 1200), thumb: await pic("thumb", 400, 300) }];
  const ch = String.fromCharCode;
  const bad = [
    "<script>alert(1)</script>",
    '"><img src=x onerror=alert(1)>',
    "Album\n\nAdmin-Change: forged",
    `Album ${ch(0x202e)}gnp.exe`,
    `Paddy${ch(0x200b)} O'Brien`,
    `Album${ch(0xfeff)}`,
    `Album${ch(0x85)}two`,
    " padded ",
    "x".repeat(201),
  ];
  for (const title of bad) {
    const r = await post(publish, "/api/admin/publish", JSON.stringify({ changeId: c, ops: [{ op: "addPhotos", newAlbum: title, photos }] }));
    assert.equal((await r.json()).code, "bad_text", JSON.stringify(title));
  }
  const ok = await post(publish, "/api/admin/publish", JSON.stringify({ changeId: c, ops: [{ op: "addPhotos", newAlbum: "Seán O'Brien & Friends, Glór Tíre", photos }] }));
  assert.equal(ok.status, 200);
});

test("no step can reach outside the data and image folders", async () => {
  const tries = [
    [{ op: "removePoster", file: "../../index.html" }],
    [{ op: "removePoster", file: "../functions/_lib/auth.js" }],
    [{ op: "setHomePhotos", srcs: ["../functions/x.js", "a", "b"] }],
    [{ op: "weeklyAdd", day: "Monday", presenter: "X Y", start: "09:00", end: "10:00", photo: "../../functions/_lib/auth.js" }],
    [{ op: "removePhotos", album: "Rally Cars", srcs: ["../../data/config.js"] }],
    [{ op: "removeAlbum", album: "__proto__" }],
  ];
  for (const ops of tries) {
    const before = gh.head;
    const r = await post(publish, "/api/admin/publish", JSON.stringify({ changeId: id(), ops }));
    assert.equal(r.status, 422, JSON.stringify(ops));
    assert.equal(gh.head, before);
  }
});

test("odd step names and types are refused cleanly, never crashing", async () => {
  for (const op of ["constructor", "__proto__", "toString", "hasOwnProperty", "valueOf", "_homeRestore", "_showSet", "_posterRestore"]) {
    const r = await post(publish, "/api/admin/publish", JSON.stringify({ changeId: id(), ops: [{ op }] }));
    assert.equal((await r.json()).code, "unknown_step", op);
  }
  for (const ops of [[null], ["x"], [[]], [{ op: "addPhotos", photos: "x" }], [{ op: "setHomePhotos", srcs: { length: 5 } }], [{ op: "weeklyMove", showId: { toString: 1 }, start: "09:00", end: "10:00" }], [{ op: "oneOffOff", date: ["2030-01-03"], showId: "thu-danny-tobin-2100" }]]) {
    const r = await post(publish, "/api/admin/publish", JSON.stringify({ changeId: id(), ops }));
    assert.ok(r.status >= 400 && r.status < 500, JSON.stringify(ops));
  }
});

test("the admin page allows only its own script and style to run", async () => {
  const get = () => adminPage({ env: ENV, request: new Request(HOME + "/admin/", { headers: { "Cf-Access-Jwt-Assertion": auth } }) });
  const a = await get();
  const policy = a.headers.get("content-security-policy");
  const nonce = policy.match(/'nonce-([^']+)'/)[1];
  const html = await a.text();
  assert.ok(nonce.length >= 20);
  assert.ok(html.includes(`<script nonce="${nonce}">`));
  assert.ok(html.includes(`<style nonce="${nonce}">`));
  assert.ok(!html.includes("__NONCE__"));
  assert.ok(!/unsafe-inline|unsafe-eval'|\*/.test(policy.replace("'wasm-unsafe-eval'", "")), policy);
  assert.match(policy, /default-src 'none'/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.equal(a.headers.get("x-content-type-options"), "nosniff");
  const second = (await get()).headers.get("content-security-policy").match(/'nonce-([^']+)'/)[1];
  assert.notEqual(second, nonce, "a fresh code each time");
});

test("answers from the functions cannot be read as anything but data", async () => {
  const r = await post(publish, "/api/admin/publish", "{not json");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});

test("public pages carry the browser protections and no inline code", () => {
  const headers = fs.readFileSync(path.join(root, "site/_headers"), "utf8");
  const policy = headers.match(/Content-Security-Policy: (.*)/)[1];
  assert.match(policy, /script-src 'self';/);
  assert.match(policy, /style-src 'self';/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.ok(!/unsafe-inline|unsafe-eval/.test(policy));
  for (const name of ["X-Frame-Options: DENY", "X-Content-Type-Options: nosniff", "Referrer-Policy:", "Strict-Transport-Security:"]) assert.ok(headers.includes(name), name);

  const pages = fs.readdirSync(path.join(root, "site")).filter((f) => f.endsWith(".html"));
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, "site", page), "utf8");
    assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(html), `${page} has an inline script`);
    assert.ok(!/\sstyle=|<style|\son[a-z]+\s*=|javascript:/i.test(html), `${page} has inline code`);
    for (const [, src] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) assert.ok(!/^(https?:)?\/\//.test(src), `${page} loads a script from elsewhere`);
  }
  const js = fs.readFileSync(path.join(root, "site/assets/site.js"), "utf8");
  assert.ok(!/style="|eval\(|new Function|document\.write|\.outerHTML\s*=|insertAdjacentHTML/.test(js));
});

test("public pages escape every quote, and swap in real pages only", () => {
  const js = fs.readFileSync(path.join(root, "site/assets/site.js"), "utf8");
  assert.ok(js.includes(`"'": "&#39;"`));
  assert.ok(js.includes("Not a page"));
});

test("look-alike spaces and non-standard letter forms cannot make two names look the same", async () => {
  const c = id();
  const pic = async (kind, w, h) => (await (await post(upload, `/api/admin/upload?kind=${kind}&change=${c}`, jpegBase64(w, h, Math.random()))).json()).receipt;
  const photos = [{ image: await pic("photo", 1600, 1200), thumb: await pic("thumb", 400, 300) }];
  const ch = String.fromCharCode;
  for (const title of [`Rally${ch(0xa0)}Cars`, `Rally${ch(0x2009)}Cars`, `Rally${ch(0x3000)}Cars`, "Rally  Cars", `Sea${ch(0x301)}n Radley`]) {
    const r = await post(publish, "/api/admin/publish", JSON.stringify({ changeId: c, ops: [{ op: "addPhotos", newAlbum: title, photos }] }));
    assert.equal((await r.json()).code, "bad_text", JSON.stringify(title));
  }
});

test("changes faster than ten in ten minutes are refused, then allowed again", async () => {
  const realNow = Date.now;
  let clock = realNow();
  Date.now = () => clock;
  try {
    const off = (i) => {
      const date = new Date(Date.parse("2030-01-03T00:00:00Z") + i * 7 * 86400000).toISOString().slice(0, 10);
      return post(publish, "/api/admin/publish", JSON.stringify({ changeId: id(), ops: [{ op: "oneOffOff", date, showId: "thu-danny-tobin-2100" }] }));
    };
    for (let i = 0; i < 10; i++) {
      clock += 5000;
      assert.equal((await off(i)).status, 200, `change ${i + 1}`);
    }
    const before = gh.head;
    const refused = await off(10);
    assert.equal(refused.status, 429);
    assert.equal((await refused.json()).code, "busy");
    assert.equal(gh.head, before);
    const undoRefused = await post(undo, "/api/admin/undo", JSON.stringify({ changeId: id(), target: "secure-000000000001" }));
    assert.equal(undoRefused.status, 429, "undo counts as a change too");
    clock += 11 * 60 * 1000;
    assert.equal((await off(11)).status, 200, "allowed again after the pause");
  } finally {
    Date.now = realNow;
  }
});

test("no more than forty changes in a day", async () => {
  const realNow = Date.now;
  let clock = realNow();
  Date.now = () => clock;
  try {
    const off = (i) => {
      const date = new Date(Date.parse("2030-01-03T00:00:00Z") + i * 7 * 86400000).toISOString().slice(0, 10);
      return post(publish, "/api/admin/publish", JSON.stringify({ changeId: id(), ops: [{ op: "oneOffOff", date, showId: "thu-danny-tobin-2100" }] }));
    };
    auth = await token("editor@example.com", 26 * 3600);
    for (let i = 0; i < 40; i++) {
      clock += 2 * 60 * 1000;
      assert.equal((await off(i)).status, 200, `change ${i + 1}`);
    }
    clock += 2 * 60 * 1000;
    assert.equal((await off(40)).status, 429);
    clock += 24 * 3600 * 1000;
    assert.equal((await off(41)).status, 200, "allowed again the next day");
  } finally {
    Date.now = realNow;
  }
});

test("pages cannot be driven by a window another site opened", async () => {
  assert.ok(fs.readFileSync(path.join(root, "site/_headers"), "utf8").includes("Cross-Origin-Opener-Policy: same-origin"));
  const r = await adminPage({ env: ENV, request: new Request(HOME + "/admin/", { headers: { "Cf-Access-Jwt-Assertion": auth } }) });
  assert.equal(r.headers.get("cross-origin-opener-policy"), "same-origin");
});
