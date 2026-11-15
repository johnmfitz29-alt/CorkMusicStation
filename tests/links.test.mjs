import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FakeGitHub, ENV, token, jpegBase64, root } from "./fake-github.mjs";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { clearKeyCache } from "../functions/_lib/auth.js";
import { LINK_TYPES, cleanPageUrl } from "../functions/_lib/links.js";
import { isAllowedWrite } from "../functions/_lib/paths.js";
import { checkSite } from "../tools/check-site.mjs";
import { onRequestPost as upload } from "../functions/api/admin/upload.js";
import { onRequestPost as publish } from "../functions/api/admin/publish.js";
import { onRequestPost as undo } from "../functions/api/admin/undo.js";

const HOME = "https://x.test";
let gh;
let auth;
let n = 0;
const id = () => `links-${String(++n).padStart(12, "0")}`;

test.beforeEach(async () => { clearKeyCache(); gh = new FakeGitHub(); gh.install(); auth = await token(); });
test.afterEach(() => gh.uninstall());

const post = (handler, url, body) => handler({
  env: ENV,
  request: new Request(HOME + url, { method: "POST", headers: { "Cf-Access-Jwt-Assertion": auth, Origin: HOME }, body }),
});
const send = async (handler, url, value) => { const r = await post(handler, url, JSON.stringify(value)); return { status: r.status, ...(await r.json()) }; };
const go = (changeId, ops) => send(publish, "/api/admin/publish", { changeId, ops });
const undoIt = (target) => send(undo, "/api/admin/undo", { changeId: id(), target });
const links = () => parseDataFile(gh.text("site/data/links.js"), "LINKS");
const linkFiles = () => [...gh.filesAt().keys()].filter((p) => p.startsWith("site/images/links/")).sort();
let seed = 0;
const picture = async (c, kind = "link") => (await (await post(upload, `/api/admin/upload?kind=${kind}&change=${c}`, jpegBase64(600, 600, ++seed))).json()).receipt;
const FB = { type: "facebook", url: "https://www.facebook.com/corkmusicstation" };
const WEB = { type: "website", url: "https://www.example.ie/" };

test("the Links page still shows the two original entries, now from the data file", () => {
  const list = parseDataFile(fs.readFileSync(path.join(root, "site/data/links.js"), "utf8"), "LINKS");
  assert.deepEqual(list.map((l) => [l.name, l.image, l.pages[0].url]), [
    ["Louise Morrissey", "images/links/694203117.png", "https://www.louisemorrissey.com/"],
    ["Danny O'Leary", "images/links/134130907.jpg", "https://www.dannyolearymusic.com/"],
  ]);
  const html = fs.readFileSync(path.join(root, "site/links.html"), "utf8");
  assert.ok(html.includes('id="links"') && html.includes('src="data/links.js"'));
  assert.deepEqual(checkSite(root, { gitLog: "" }).failures, []);
});

test("a link is added with a picture and pages, in one commit, and undo removes both", async () => {
  const before = JSON.stringify(links());
  const filesBefore = linkFiles();
  const c = id();
  const r = await go(c, [{ op: "addLink", name: "Mike Denver", image: await picture(c), pages: [FB, WEB] }]);
  assert.equal(r.status, 200, JSON.stringify(r));
  const added = links().at(-1);
  assert.equal(added.name, "Mike Denver");
  assert.deepEqual(added.pages.map((p) => p.type), ["website", "facebook"], "kept in a fixed order");
  assert.match(added.image, /^images\/links\/[0-9a-f]{16}\.jpg$/);
  assert.equal(linkFiles().length, filesBefore.length + 1);
  assert.deepEqual(checkSite(root, { overrides: { "links.js": gh.text("site/data/links.js") }, gitLog: "" }).failures.filter((f) => !f.includes("missing image")), []);

  assert.equal((await undoIt(c)).status, 200);
  assert.equal(JSON.stringify(links()), before);
  assert.deepEqual(linkFiles(), filesBefore);
});

test("a link's name, pages and picture can be changed, and each change undone", async () => {
  const first = links()[0];
  const before = JSON.stringify(links());
  const filesBefore = linkFiles();

  const c = id();
  assert.equal((await go(c, [{ op: "editLink", id: first.id, pages: [...first.pages, FB] }])).status, 200);
  assert.deepEqual(links()[0].pages.map((p) => p.type), ["website", "facebook"]);
  assert.equal((await undoIt(c)).status, 200);
  assert.equal(JSON.stringify(links()), before);

  const d = id();
  assert.equal((await go(d, [{ op: "editLink", id: first.id, name: "Louise Morrissey Music", image: await picture(d) }])).status, 200);
  assert.equal(links()[0].name, "Louise Morrissey Music");
  assert.notEqual(links()[0].image, first.image);
  assert.ok(!gh.filesAt().has(`site/${first.image}`), "the old picture is gone");
  const u = await undoIt(d);
  assert.equal(u.status, 200);
  assert.equal(JSON.stringify(links()), before);
  assert.deepEqual(linkFiles(), filesBefore, "the old picture is back and the new one gone");
});

test("a link is taken down with its picture, and undo restores it", async () => {
  const before = JSON.stringify(links());
  const filesBefore = linkFiles();
  const c = id();
  assert.equal((await go(c, [{ op: "removeLink", id: links()[1].id }])).status, 200);
  assert.equal(links().length, 1);
  assert.equal(linkFiles().length, filesBefore.length - 1);
  assert.equal((await undoIt(c)).status, 200);
  assert.equal(JSON.stringify(links()), before);
  assert.deepEqual(linkFiles(), filesBefore);
});

test("only safe addresses of the right kind are accepted", () => {
  const good = [
    ["website", "https://www.louisemorrissey.com", "https://www.louisemorrissey.com/"],
    ["facebook", "https://www.facebook.com/corkmusicstation", "https://www.facebook.com/corkmusicstation"],
    ["youtube", "https://youtu.be/abc123", "https://youtu.be/abc123"],
    ["instagram", "https://INSTAGRAM.com/name", "https://instagram.com/name"],
    ["tiktok", "https://www.tiktok.com/@name", "https://www.tiktok.com/@name"],
    ["spotify", "https://open.spotify.com/artist/1", "https://open.spotify.com/artist/1"],
  ];
  for (const [type, address, expected] of good) assert.equal(cleanPageUrl(type, address), expected, address);
  const bad = [
    ["website", "http://example.ie/"], ["website", "javascript:alert(1)"], ["website", "data:text/html,hi"],
    ["website", "//example.ie"], ["website", "example.ie"], ["website", "https://localhost/"], ["website", "https://192.168.1.1/"],
    ["website", "https://user:pw@example.ie/"], ["website", "https://example.ie:8443/"], ["website", "https://example.ie/a b"],
    ["website", 'https://example.ie/"><script>'], ["website", "https://example.ie/'onmouseover='x"], ["website", `https://example.ie/${"a".repeat(200)}`],
    ["website", ""], ["website", null], ["website", 5], ["website", "https://examрle.ie/"],
    ["facebook", "https://facebook.com@evil.example/page"], ["facebook", "https://evil.example/facebook.com"],
    ["facebook", "https://www.facebook.com.evil.example/x"], ["facebook", "https://www.facebook.com/"], ["facebook", "https://www.youtube.com/@x"],
    ["spotify", "https://spotify.com/artist/1"], ["x", "https://x.com/name"], ["__proto__", "https://example.ie/"], ["constructor", "https://example.ie/"],
  ];
  for (const [type, address] of bad) assert.equal(cleanPageUrl(type, address), null, `${type} ${address}`);
  assert.deepEqual(LINK_TYPES, ["website", "facebook", "youtube", "instagram", "tiktok", "spotify"]);
});

test("bad links are refused by the server and nothing changes", async () => {
  const c = id();
  const image = await picture(c);
  const tries = {
    "unsafe address": [{ op: "addLink", name: "A B", image, pages: [{ type: "website", url: "javascript:alert(1)" }] }],
    "wrong service": [{ op: "addLink", name: "A B", image, pages: [{ type: "facebook", url: "https://evil.example/facebook.com" }] }],
    "no pages": [{ op: "addLink", name: "A B", image, pages: [] }],
    "same kind twice": [{ op: "addLink", name: "A B", image, pages: [FB, FB] }],
    "unknown kind": [{ op: "addLink", name: "A B", image, pages: [{ type: "x", url: "https://x.com/a" }] }],
    "markup in the name": [{ op: "addLink", name: "<b>A</b>", image, pages: [WEB] }],
    "name already used": [{ op: "addLink", name: "louise morrissey", image, pages: [WEB] }],
    "no picture": [{ op: "addLink", name: "A B", pages: [WEB] }],
    "a poster picture": [{ op: "addLink", name: "A B", image: await picture(c, "photo"), pages: [WEB] }],
    "unknown link": [{ op: "editLink", id: "nope", name: "A B" }],
    "nothing changed": [{ op: "editLink", id: links()[0].id, name: links()[0].name }],
    "undo-only step": [{ op: "_linkSet", id: links()[0].id, record: { id: "x", name: "x", image: "../../index.html", pages: [] } }],
    "pages not a list": [{ op: "editLink", id: links()[0].id, pages: "x" }],
  };
  for (const [name, ops] of Object.entries(tries)) {
    const before = gh.head;
    const r = await go(id() === "" ? "" : c, ops);
    assert.ok(r.status >= 400 && r.status < 500, `${name}: ${r.status} ${r.code}`);
    assert.equal(gh.head, before, name);
  }
});

test("link pictures stay in their own folder, and other steps cannot remove them", async () => {
  assert.ok(isAllowedWrite("site/images/links/0123456789abcdef.jpg", "create"));
  assert.ok(isAllowedWrite("site/images/links/694203117.png", "delete"));
  assert.equal(isAllowedWrite("site/images/links/../../index.html", "create"), false);
  assert.ok(isAllowedWrite("site/data/links.js", "update"));
  const before = gh.head;
  for (const ops of [[{ op: "removePoster", file: "images/links/694203117.png" }], [{ op: "setHomePhotos", srcs: ["images/links/694203117.png", "a", "b"] }]]) {
    assert.equal((await go(id(), ops)).status, 422);
  }
  assert.equal(gh.head, before);
});

test("the build check refuses a links file with an unsafe address or missing picture", () => {
  const cases = [
    'window.LINKS = [{"id":"a","name":"A","image":"images/links/694203117.png","pages":[{"type":"website","url":"javascript:alert(1)"}]}];',
    'window.LINKS = [{"id":"a","name":"A","image":"images/links/694203117.png","pages":[{"type":"facebook","url":"https://evil.example/x"}]}];',
    'window.LINKS = [{"id":"a","name":"A","image":"images/links/gone.jpg","pages":[{"type":"website","url":"https://example.ie/"}]}];',
    'window.LINKS = [{"id":"a","name":"A","image":"images/links/694203117.png","pages":[]}];',
    'window.LINKS = [{"id":"a","name":"<b>","image":"images/links/694203117.png","pages":[{"type":"website","url":"https://example.ie/"}]}];',
  ];
  for (const text of cases) assert.ok(checkSite(root, { overrides: { "links.js": text }, gitLog: "" }).failures.length > 0, text);
});

test("the public page writes links safely and opens them in a new tab", () => {
  const js = fs.readFileSync(path.join(root, "site/assets/site.js"), "utf8");
  const part = js.slice(js.indexOf("function renderLinks"), js.indexOf("function renderRotator"));
  assert.ok(part.includes('indexOf("https://") !== 0'), "anything that is not https is left out");
  assert.ok(part.includes("esc(p.url)") && part.includes("esc(l.name)") && part.includes("esc(l.image)"));
  assert.ok(part.includes('rel="noopener"'));
});
