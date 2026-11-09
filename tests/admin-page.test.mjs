import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FakeGitHub, ENV, token, root } from "./fake-github.mjs";
import { clearKeyCache } from "../functions/_lib/auth.js";
import { packAdmin } from "../tools/build-admin.mjs";
import packed from "../functions/_lib/admin-page.js";
import { onRequestGet } from "../functions/admin/[[path]].js";

const src = (f) => fs.readFileSync(path.join(root, "admin-src", f), "utf8").replace(/\r\n/g, "\n");
const words = () => src("app.js").match(/\/\*WORDS-START\*\/([\s\S]*?)\/\*WORDS-END\*\//)[1];
const bodyText = () => src("index.html").match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script>[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");

test("the packed page is up to date with admin-src", () => {
  assert.equal(`// Made by tools/build-admin.mjs from admin-src/. Do not edit by hand.\nexport default ${JSON.stringify(packed)};\n`, packAdmin());
});

test("he never reads the words Publish, upload or error (R69)", () => {
  for (const text of [words(), bodyText()]) {
    assert.ok(!/publish|upload|error/i.test(text), text.match(/.{0,30}(publish|upload|error).{0,30}/i)?.[0]);
  }
});

test("the agreed sentences are exact (R28, R54)", () => {
  const w = words();
  assert.ok(w.includes('"Put It On The Website"'));
  assert.ok(w.includes('"Nothing is broken. The old page is still there, and John has been told."'));
  assert.ok(w.includes('"Ask John about this one"'));
  assert.ok(w.includes(`"It's on the website."`));
});

test("no hover-only controls and text at least 24 px (R65, R66)", () => {
  const html = src("index.html");
  assert.ok(!/:hover/.test(html));
  assert.ok(Number(html.match(/html \{ font-size: (\d+)px/)[1]) >= 24);
  for (const [, size] of html.matchAll(/font-size: ([\d.]+)rem/g)) assert.ok(Number(size) >= 1, size);
});

test("no timers that end his session (R67)", () => {
  assert.ok(!/session|idle|timeout/i.test(src("app.js").replace(/setTimeout/g, "")));
});

test("no plain admin file exists on the site (R80)", () => {
  assert.equal(fs.existsSync(path.join(root, "site/admin")), false);
});

test("the admin page refuses without a login, and serves with one (R58, R59)", async () => {
  clearKeyCache();
  const gh = new FakeGitHub();
  gh.install();
  try {
    const none = await onRequestGet({ env: ENV, request: new Request("https://x.test/admin/") });
    assert.equal(none.status, 401);
    const bad = await onRequestGet({ env: ENV, request: new Request("https://x.test/admin/", { headers: { "Cf-Access-Jwt-Assertion": await token("stranger@example.com") } }) });
    assert.equal(bad.status, 403);
    const good = await onRequestGet({ env: ENV, request: new Request("https://x.test/admin/", { headers: { "Cf-Access-Jwt-Assertion": await token() } }) });
    assert.equal(good.status, 200);
    assert.equal(good.headers.get("cache-control"), "no-store");
    assert.match(await good.text(), /Get Help/);
  } finally {
    gh.uninstall();
  }
});
