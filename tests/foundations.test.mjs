import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { isAllowedWrite } from "../functions/_lib/paths.js";
import { inspectJpegBase64, inspectJpegHeader } from "../functions/_lib/jpeg.js";
import { checkSite } from "../tools/check-site.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataText = (n) => fs.readFileSync(path.join(root, "site/data", n), "utf8");
const schedule = () => parseDataFile(dataText("schedule.js"), "SCHEDULE");

function logic() {
  const box = { window: {}, Intl, Date };
  vm.runInNewContext(fs.readFileSync(path.join(root, "site/assets/schedule-logic.js"), "utf8"), box);
  return box.window.CMS_LOGIC;
}
const L = logic();
const at = (utc) => L.irishParts(new Date(utc));
const clean = (v) => JSON.parse(JSON.stringify(v));
const FULL_NAMES = { Breeda: "Breeda Piggott", Willie: "Willie Fitzgerald" }; // approved by the owner, 8 November 2026

test("every editable data file is strict JSON", () => {
  assert.equal(schedule().weekly.length, 7);
  assert.ok(Array.isArray(parseDataFile(dataText("posters.js"), "POSTERS")));
  assert.equal(parseDataFile(dataText("gallery.js"), "GALLERY").length, 31);
  assert.ok(parseDataFile(dataText("home-photos.js"), "HOME_PHOTOS").length >= 3);
});

test("schedule conversion changed only the approved time text and two approved names (R35)", () => {
  const oldText = execFileSync("git", ["show", "2350161:site/data/schedule.js"], { cwd: root, encoding: "utf8" });
  const box = { window: {} };
  vm.runInNewContext(oldText, box);
  const before = clean(box.window.SCHEDULE);
  const after = schedule().weekly;
  assert.equal(after.length, before.length);
  before.forEach((day, d) => {
    assert.equal(after[d].day, day.day);
    assert.equal(after[d].shows.length, day.shows.length);
    day.shows.forEach((show, s) => {
      const { id, late, time, ...rest } = after[d].shows[s];
      const { time: oldTime, ...oldRest } = show;
      assert.deepEqual(rest, { ...oldRest, presenter: FULL_NAMES[oldRest.presenter] ?? oldRest.presenter });
      assert.ok(id);
    });
  });
});

test("section 5 time text is exact (R35)", () => {
  const text = (day, name) => schedule().weekly.find((d) => d.day === day).shows.find((s) => s.presenter === name).time;
  assert.equal(text("Monday", "George F Langan"), "10.30 pm - Late");
  assert.equal(text("Thursday", "Vincent Murray"), "12.00 midnight - 2.00 am");
  assert.equal(text("Saturday", "George F Langan"), "8.00 pm - 12.30 am");
  assert.equal(text("Sunday", "Jimmy Reidy"), "10.00 pm - 11.15 pm");
  assert.ok(!dataText("schedule.js").includes("(Irish Time)"));
});

test("on air follows Irish time across the March 2027 clock change (R32)", () => {
  // Saturday night's show, still on at 00:15 before the clocks go forward.
  assert.equal(L.current(schedule(), at("2027-03-28T00:15:00Z")).on.s.id, "sat-george-f-langan-2000");
  // Sunday 28 March, 20:30 Irish summer time is 19:30 UTC.
  assert.equal(L.current(schedule(), at("2027-03-28T19:30:00Z")).on.s.id, "sun-vincent-murray-2000");
});

test("on air follows Irish time across the October 2027 clock change (R32)", () => {
  // Sunday 31 October, 20:30 Irish winter time is 20:30 UTC.
  assert.equal(L.current(schedule(), at("2027-10-31T20:30:00Z")).on.s.id, "sun-vincent-murray-2000");
  // 19:30 UTC is 19:30 Irish, before Vincent starts.
  assert.equal(L.current(schedule(), at("2027-10-31T19:30:00Z")).on, null);
});

test("a show past midnight is on air the next morning", () => {
  // Friday 12 November 2027, 01:00 Irish: Thursday night's repeat.
  assert.equal(L.current(schedule(), at("2027-11-12T01:00:00Z")).on.s.id, "thu-vincent-murray-2400");
});

test("next show wraps from Sunday night to Monday", () => {
  const c = L.current(schedule(), at("2027-11-14T23:30:00Z"));
  assert.equal(c.on, null);
  assert.equal(c.next.s.id, "mon-tim-coughlan-1900");
  assert.equal(c.next.day, "Monday");
});

function withOneOffs(oneOffs) {
  return { ...schedule(), oneOffs };
}

test("a one-off off date applies only to that date (R23)", () => {
  const s = withOneOffs([{ id: "a", date: "2027-12-23", type: "off", showId: "thu-danny-tobin-2100" }]);
  assert.ok(!L.showsForDate(s, "2027-12-23").some((x) => x.id === "thu-danny-tobin-2100"));
  assert.ok(L.showsForDate(s, "2027-12-16").some((x) => x.id === "thu-danny-tobin-2100"));
  assert.ok(L.showsForDate(s, "2027-12-30").some((x) => x.id === "thu-danny-tobin-2100"));
});

test("a one-off move changes that date and reverts (R23)", () => {
  const s = withOneOffs([{ id: "a", date: "2027-12-20", type: "move", showId: "mon-tim-coughlan-1900", start: "18:00", end: "20:00", time: "6.00 pm - 8.00 pm" }]);
  assert.equal(L.showsForDate(s, "2027-12-20")[0].start, "18:00");
  assert.equal(L.showsForDate(s, "2027-12-27")[0].start, "19:00");
  assert.equal(schedule().weekly[0].shows[0].start, "19:00");
});

test("stand-in route: off plus add, both gone afterwards (R21)", () => {
  const show = { id: "add-1", presenter: "Stand In", time: "9.00 pm - 10.00 pm", start: "21:00", end: "22:00", contact: "c", photo: "p" };
  const s = withOneOffs([
    { id: "a", date: "2027-12-23", type: "off", showId: "thu-danny-tobin-2100" },
    { id: "b", date: "2027-12-23", type: "add", show },
  ]);
  assert.ok(L.showsForDate(s, "2027-12-23").some((x) => x.id === "add-1"));
  assert.ok(!L.showsForDate(s, "2027-12-30").some((x) => x.id === "add-1"));
  assert.equal(L.current(s, at("2027-12-23T21:30:00Z")).on.s.id, "add-1");
});

test("posters hide the day after their last date, Irish time (R12)", () => {
  const list = [{ file: "a", lastDate: "2027-06-10" }];
  // 23:30 UTC on 10 June is already 11 June in Ireland in summer.
  assert.equal(L.visiblePosters(list, at("2027-06-10T22:59:00Z").iso).length, 1);
  assert.equal(L.visiblePosters(list, at("2027-06-10T23:30:00Z").iso).length, 0);
});

test("posters sort by date, then no end date, then undated (R11)", () => {
  const list = [
    { file: "u" }, { file: "n", noEnd: true }, { file: "late", lastDate: "2027-09-01" }, { file: "soon", lastDate: "2027-07-01" },
  ];
  assert.deepEqual(clean(L.visiblePosters(list, "2027-01-01")).map((p) => p.file), ["soon", "late", "n", "u"]);
});

test("allow-list accepts only the intended paths (R52)", () => {
  assert.ok(isAllowedWrite("site/data/schedule.js", "update"));
  assert.ok(isAllowedWrite("site/images/gallery/event-001.jpg", "create"));
  assert.ok(isAllowedWrite("site/images/posters/poster-1.jpg", "delete"));
  assert.ok(isAllowedWrite("site/images/presenters/new-person.jpg", "create"));
  for (const bad of [
    "site/index.html", "functions/api/admin/upload-test.js", "tools/check-site.mjs", "package.json",
    "site/data/names.js", "site/data/config.js", "site/data/interviews.js", "site/assets/site.js",
    "site/images/../index.html", "site/images/gallery/../../index.html", "../site/data/schedule.js",
    "/site/data/schedule.js", "site\\data\\schedule.js", "site/data/schedule.js/", "site/images/logo.jpg",
    "site/images/gallery/UPPER.JPG", "site/images/gallery/a b.jpg", "site/images/gallery/a.jpg.exe",
    "site/images/gallery/sub/a.jpg", "site/images/constructor/a.jpg", "site/images/__proto__/a.jpg", "site/data/%2e%2e/index.html", "",
  ]) {
    assert.equal(isAllowedWrite(bad, "create"), false, bad);
    assert.equal(isAllowedWrite(bad, "update"), false, bad);
  }
  assert.equal(isAllowedWrite("site/images/presenters/existing.jpg", "delete"), false);
  assert.equal(isAllowedWrite("site/images/gallery/existing.jpg", "update"), false);
  assert.equal(isAllowedWrite("site/data/schedule.js", "delete"), false);
  assert.equal(isAllowedWrite(null, "create"), false);
});

function jpeg(...segments) {
  const parts = [0xff, 0xd8];
  for (const s of segments) parts.push(...s);
  return Uint8Array.from(parts);
}
const JFIF = [0xff, 0xe0, 0x00, 0x04, 1, 1];
const SOF = [0xff, 0xc0, 0x00, 0x08, 8, 0x03, 0x00, 0x04, 0x00, 1];
const SOS = [0xff, 0xda, 0x00, 0x02];
const EXIF = [0xff, 0xe1, 0x00, 0x04, 1, 1];
const ICC = [0xff, 0xe2, 0x00, 0x04, 1, 1];
const COMMENT = [0xff, 0xfe, 0x00, 0x04, 1, 1];
const IPTC = [0xff, 0xed, 0x00, 0x04, 1, 1];
const b64 = (bytes) => Buffer.from(bytes).toString("base64");

test("a clean browser-style JPEG is accepted with its size", () => {
  assert.deepEqual(inspectJpegHeader(jpeg(JFIF, SOF, SOS)), { ok: true, w: 1024, h: 768 });
  assert.equal(inspectJpegHeader(jpeg(JFIF, ICC, SOF, SOS)).ok, true, "Chrome adds a colour profile");
  assert.equal(inspectJpegBase64(b64([...jpeg(JFIF, SOF, SOS), 1, 2, 3, 0xff, 0xd9])).ok, true);
});

test("server refuses EXIF, fakes and truncated files (R46, R50)", () => {
  assert.equal(inspectJpegHeader(jpeg(EXIF, JFIF, SOF, SOS)).code, "has_metadata");
  assert.equal(inspectJpegHeader(jpeg(JFIF, IPTC, SOF, SOS)).code, "has_metadata");
  assert.equal(inspectJpegHeader(jpeg(JFIF, COMMENT, SOF, SOS)).code, "has_metadata");
  assert.equal(inspectJpegBase64(b64(Buffer.from("<script>alert(1)</script>........"))).code, "not_jpeg");
  assert.equal(inspectJpegBase64(b64([...jpeg(JFIF, SOF, SOS), 1, 2, 3, 4])).code, "not_jpeg");
  assert.equal(inspectJpegBase64("").code, "not_jpeg");
  assert.equal(inspectJpegBase64("!!!!not base64!!!!").code, "not_jpeg");
  assert.equal(inspectJpegBase64(null).code, "not_jpeg");
  assert.equal(inspectJpegHeader(jpeg(JFIF, [0xff, 0xc0, 0x00, 0x08, 8, 0x40, 0x00, 0x40, 0x00, 1], SOS)).code, "bad_size");
  assert.equal(inspectJpegHeader(jpeg(JFIF, SOS)).code, "not_jpeg");
});

test("the real site passes the build check", () => {
  const r = checkSite(root, { gitLog: "" });
  assert.deepEqual(r.failures, []);
  assert.ok(r.fileCount > 600);
});

const scheduleText = () => dataText("schedule.js");

test("build check catches invalid data (R51)", () => {
  const cases = {
    "broken JSON": { "schedule.js": scheduleText().replace('"weekly": [', '"weekly": [,') },
    "clash": { "schedule.js": scheduleText().replace('"start":"21:00","end":"22:00"', '"start":"20:00","end":"22:00"') },
    "finish before start": { "schedule.js": scheduleText().replace('"start":"19:30","end":"21:00"', '"start":"21:00","end":"19:30"') },
    "missing photo": { "schedule.js": scheduleText().replace("tim-coughlan-photo-3.jpg", "nobody.jpg") },
    "script in name": { "schedule.js": scheduleText().replace('"presenter":"David Marks"', '"presenter":"<script>"') },
    "impossible poster date": { "posters.js": 'window.POSTERS=[{"file":"images/posters/pob-2026.jpg","w":1,"h":1,"lastDate":"2027-02-29"}];' },
    "missing poster": { "posters.js": 'window.POSTERS=[{"file":"images/posters/gone.jpg","w":1,"h":1}];' },
    "too few home photos": { "home-photos.js": "window.HOME_PHOTOS=[];" },
    "one-off on the wrong day": { "schedule.js": scheduleText().replace('"oneOffs": []', '"oneOffs": [{"id":"a","date":"2027-12-20","type":"off","showId":"thu-danny-tobin-2100"}]') },
  };
  for (const [name, overrides] of Object.entries(cases)) {
    assert.ok(checkSite(root, { overrides, gitLog: "" }).failures.length > 0, name);
  }
});

test("build check catches an admin commit outside the allow-list (R52, R78)", () => {
  const good = "Add photos\n\nAdmin-Change: 1\n\nM\tsite/data/gallery.js\nA\tsite/images/gallery/a-1.jpg\n";
  const bad = "Add photos\n\nAdmin-Change: 1\n\nM\tsite/index.html\n";
  const renamed = "Add photos\n\nAdmin-Change: 1\n\nR100\tsite/images/gallery/a.jpg\tsite/index.html\n";
  const owner = "Owner edit\n\nM\tsite/index.html\n";
  assert.deepEqual(checkSite(root, { gitLog: good }).failures, []);
  assert.ok(checkSite(root, { gitLog: bad }).failures.length);
  assert.ok(checkSite(root, { gitLog: renamed }).failures.length);
  assert.deepEqual(checkSite(root, { gitLog: owner }).failures, []);
});

test("approved names list holds protected spellings and no known misspelling as a correct name (R38)", () => {
  const names = parseDataFile(fs.readFileSync(path.join(root, "site/data/names.js"), "utf8"), "NAMES");
  const all = [...names.presenters, ...names.events, ...names.venues, ...names.protected];
  for (const keep of ["Normand Boland", "Castleahan", "Seán Radley", "Glór Tíre"]) {
    assert.ok(all.some((n) => n.includes(keep)), keep);
  }
  for (const [wrong, right] of Object.entries(names.misspellings)) {
    assert.ok(!all.includes(wrong), wrong);
    assert.equal(typeof right, "string");
  }
});

test("every page loads the date logic before site.js, so moving between pages keeps the radio playing", () => {
  const pages = fs.readdirSync(path.join(root, "site")).filter((f) => f.endsWith(".html"));
  assert.ok(pages.length >= 7);
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, "site", page), "utf8");
    const logicAt = html.indexOf('src="assets/schedule-logic.js"');
    const siteAt = html.indexOf('src="assets/site.js"');
    assert.ok(siteAt > 0, page);
    assert.ok(logicAt > 0 && logicAt < siteAt, page);
  }
});
