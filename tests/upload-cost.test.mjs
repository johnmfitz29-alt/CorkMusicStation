// A local indication only. Cloudflare's real figures come from site/admin/upload-test.html once the site is deployed.
import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/admin/upload-test.js";
import { clearKeyCache } from "../functions/_lib/auth.js";

const TEAM = "t.cloudflareaccess.com";
const pair = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k" };
const b = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
const head = `${b({ alg: "RS256", kid: "k" })}.${b({ iss: `https://${TEAM}`, aud: ["a"], exp: Math.floor(Date.now() / 1000) + 3600, email: "d@e.com" })}`;
const sig = Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(head))).toString("base64url");
const token = `${head}.${sig}`;
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: "a", ALLOWED_EMAILS: "d@e.com", UPLOAD_TEST_ENABLED: "1", GITHUB_REPO: "o/r", GITHUB_TOKEN: "t" };

const body = Buffer.alloc(500000, 7);
const image = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 1, 1, 0xff, 0xc0, 0x00, 0x08, 8, 0x04, 0xb0, 0x06, 0x40, 1, 0xff, 0xda, 0x00, 0x02]),
  body, Buffer.from([0xff, 0xd9]),
]);
const payload = image.toString("base64");
const call = (e, data = payload) => onRequestPost({
  env: e, request: new Request("https://x.test/api/admin/upload-test", { method: "POST", headers: { "Cf-Access-Jwt-Assertion": token }, body: data }),
});

const realFetch = globalThis.fetch;
test.beforeEach(() => {
  clearKeyCache();
  globalThis.fetch = async (url) => String(url).includes("/certs")
    ? new Response(JSON.stringify({ keys: [jwk] }))
    : new Response(JSON.stringify({ sha: "abc" }), { status: 201, headers: { "x-ratelimit-remaining": "4999" } });
});
test.after(() => { globalThis.fetch = realFetch; });

test("measuring route is off unless switched on", async () => {
  assert.equal((await call({ ...env, UPLOAD_TEST_ENABLED: undefined })).status, 404);
});

test("oversized body is refused (section 4)", async () => {
  const big = "A".repeat(700001);
  assert.equal((await call(env, big)).status, 413);
});

test("a 500 KB photo costs under 10 ms of CPU here (R64, local indication)", async () => {
  await call(env);
  const rounds = 50;
  const start = process.cpuUsage();
  for (let i = 0; i < rounds; i++) {
    const r = await call(env);
    assert.equal(r.status, 200);
  }
  const used = process.cpuUsage(start);
  const ms = (used.user + used.system) / 1000 / rounds;
  console.log(`local CPU per 500 KB photo: ${ms.toFixed(2)} ms (includes the test's own overhead)`);
  assert.ok(ms < 10, `${ms} ms`);
});
