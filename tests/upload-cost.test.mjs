// A local indication only. Cloudflare's real behaviour was measured with the rehearsals in SPEC.md section 12.
import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/admin/upload.js";
import { clearKeyCache } from "../functions/_lib/auth.js";
import { FakeGitHub, ENV, token } from "./fake-github.mjs";

const image = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 1, 1, 0xff, 0xc0, 0x00, 0x08, 8, 0x04, 0xb0, 0x06, 0x40, 1, 0xff, 0xda, 0x00, 0x02]),
  Buffer.alloc(500000, 7), Buffer.from([0xff, 0xd9]),
]).toString("base64");

let gh;
let auth;
test.beforeEach(async () => { clearKeyCache(); gh = new FakeGitHub(); gh.install(); auth = await token(); });
test.afterEach(() => gh.uninstall());
const call = (data = image) => onRequestPost({
  env: ENV,
  request: new Request("https://x.test/api/admin/upload?kind=photo&change=change-000000000000", { method: "POST", headers: { "Cf-Access-Jwt-Assertion": auth }, body: data }),
});

test("oversized body is refused (section 4)", async () => {
  assert.equal((await call("A".repeat(700001))).status, 413);
});

test("a 500 KB photo costs under 10 ms of CPU here (R64, local indication)", async () => {
  await call();
  const rounds = 50;
  const start = process.cpuUsage();
  for (let i = 0; i < rounds; i++) assert.equal((await call()).status, 200);
  const used = process.cpuUsage(start);
  const ms = (used.user + used.system) / 1000 / rounds;
  console.log(`local CPU per 500 KB photo: ${ms.toFixed(2)} ms (includes the test's own overhead)`);
  assert.ok(ms < 10, `${ms} ms`);
});
