import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireLogin, clearKeyCache } from "../functions/_lib/auth.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEAM = "test-team.cloudflareaccess.com";
const AUD = "audience-tag";
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ALLOWED_EMAILS: "editor@example.com, Owner@Example.com" };

const pair = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const stranger = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k1" };

let certCalls = 0;
const fetcher = async (url) => {
  certCalls++;
  assert.equal(url, `https://${TEAM}/cdn-cgi/access/certs`);
  return new Response(JSON.stringify({ keys: [jwk] }));
};

const b = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");
const now = () => Math.floor(Date.now() / 1000);
const goodClaims = () => ({ iss: `https://${TEAM}`, aud: [AUD], exp: now() + 3600, email: "editor@example.com" });

async function sign(claims, { key = pair.privateKey, header = { alg: "RS256", kid: "k1" } } = {}) {
  const head = `${b(header)}.${b(claims)}`;
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head));
  return `${head}.${Buffer.from(sig).toString("base64url")}`;
}

function ctx(token, e = env) {
  const headers = token ? { "Cf-Access-Jwt-Assertion": token } : {};
  return { request: new Request("https://x.test/api/admin/a", { headers }), env: e };
}

test("a valid login passes and gives the email", async () => {
  assert.deepEqual(await requireLogin(ctx(await sign(goodClaims())), fetcher), { email: "editor@example.com" });
});

test("email allow-list ignores capital letters", async () => {
  const r = await requireLogin(ctx(await sign({ ...goodClaims(), email: "OWNER@example.com" })), fetcher);
  assert.equal(r.email, "owner@example.com");
});

test("every bad login is refused (R59)", async () => {
  const cases = {
    missing: [null, 401],
    garbage: ["abc", 401],
    "too many parts": [`${await sign(goodClaims())}.x`, 401],
    "forged signature": [await sign(goodClaims(), { key: stranger.privateKey }), 401],
    expired: [await sign({ ...goodClaims(), exp: now() - 10 }), 401],
    "no expiry": [await sign({ ...goodClaims(), exp: undefined }), 401],
    "not yet valid": [await sign({ ...goodClaims(), nbf: now() + 3600 }), 401],
    "wrong audience": [await sign({ ...goodClaims(), aud: ["other"] }), 401],
    "wrong issuer": [await sign({ ...goodClaims(), iss: "https://evil.cloudflareaccess.com" }), 401],
    "unlisted email": [await sign({ ...goodClaims(), email: "someone@example.com" }), 403],
    "no email": [await sign({ ...goodClaims(), email: undefined }), 403],
    "alg none": [`${b({ alg: "none", kid: "k1" })}.${b(goodClaims())}.x`, 401],
    "unknown key": [await sign(goodClaims(), { header: { alg: "RS256", kid: "nope" } }), 401],
  };
  for (const [name, [token, status]] of Object.entries(cases)) {
    const r = await requireLogin(ctx(token), fetcher);
    assert.ok(r instanceof Response, name);
    assert.equal(r.status, status, name);
  }
});

test("a body swapped under a valid signature is refused (R59)", async () => {
  const [h, , s] = (await sign(goodClaims())).split(".");
  const r = await requireLogin(ctx(`${h}.${b({ ...goodClaims(), email: "owner@example.com" })}.${s}`), fetcher);
  assert.equal(r.status, 401);
});

test("missing settings refuse everyone", async () => {
  const token = await sign(goodClaims());
  for (const drop of ["ACCESS_TEAM_DOMAIN", "ACCESS_AUD", "ALLOWED_EMAILS"]) {
    const r = await requireLogin(ctx(token, { ...env, [drop]: "" }), fetcher);
    assert.equal(r.status, 500, drop);
  }
});

test("certificate outage refuses, and does not let anyone in", async () => {
  clearKeyCache();
  const down = async () => new Response("", { status: 503 });
  assert.equal((await requireLogin(ctx(await sign(goodClaims())), down)).status, 401);
});

test("keys are cached, and an unknown key forces a refresh", async () => {
  clearKeyCache();
  certCalls = 0;
  const token = await sign(goodClaims());
  await requireLogin(ctx(token), fetcher);
  await requireLogin(ctx(token), fetcher);
  assert.equal(certCalls, 1);
  await requireLogin(ctx(await sign(goodClaims(), { header: { alg: "RS256", kid: "new" } })), fetcher);
  assert.equal(certCalls, 2);
});

function handlers(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...handlers(full));
    else if (e.name.endsWith(".js")) out.push(full);
  }
  return out;
}

test("every handler checks the login first (R59)", () => {
  const files = [...handlers(path.join(root, "functions/api")), ...handlers(path.join(root, "functions/admin"))];
  assert.ok(files.length > 0);
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const found = [...text.matchAll(/export\s+(?:async\s+)?function\s+(onRequest\w*)\s*\(context\)\s*\{\s*([^\n]*)\n\s*([^\n]*)/g)];
    assert.ok(found.length > 0, `${file} has no handler in the expected form`);
    assert.ok(!/export\s+const\s+onRequest/.test(text), `${file} exports a handler in an unchecked form`);
    for (const [, name, first, second] of found) {
      assert.equal(first, "const login = await requireLogin(context);", `${file} ${name}`);
      assert.equal(second, "if (login instanceof Response) return login;", `${file} ${name}`);
    }
  }
});
