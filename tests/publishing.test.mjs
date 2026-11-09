import test from "node:test";
import assert from "node:assert/strict";
import { FakeGitHub, ENV, token, jpegBase64 } from "./fake-github.mjs";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { clearKeyCache } from "../functions/_lib/auth.js";
import { signReceipt } from "../functions/_lib/receipts.js";
import { timeText } from "../functions/_lib/schedule.js";
import { onRequestPost as upload } from "../functions/api/admin/upload.js";
import { onRequestPost as publish } from "../functions/api/admin/publish.js";
import { onRequestPost as undo } from "../functions/api/admin/undo.js";
import { onRequestPost as notify } from "../functions/api/admin/notify.js";
import { onRequestGet as changes } from "../functions/api/admin/changes.js";
import { onRequestGet as confirm } from "../functions/api/admin/confirm.js";

const FUTURE = "2030-01-03"; // A Thursday
let id = 0;
const newId = () => `change-${String(++id).padStart(12, "0")}`;
let gh;
let env;
let auth;

test.beforeEach(async () => {
  clearKeyCache();
  gh = new FakeGitHub();
  gh.install();
  env = { ...ENV };
  auth = await token();
});
test.afterEach(() => gh.uninstall());

const data = (name, global) => parseDataFile(gh.text(`site/data/${name}`), global);
const schedule = () => data("schedule.js", "SCHEDULE");
const posters = () => data("posters.js", "POSTERS");
const gallery = () => data("gallery.js", "GALLERY");
const home = () => data("home-photos.js", "HOME_PHOTOS");
const headers = () => ({ "Cf-Access-Jwt-Assertion": auth });
const post = (handler, url, body) => handler({ env, request: new Request(`https://x.test${url}`, { method: "POST", headers: headers(), body }) });
const send = async (handler, path, value) => {
  const r = await post(handler, path, JSON.stringify(value));
  return { status: r.status, ...(await r.json()) };
};
const go = (changeId, ops, extra = {}) => send(publish, "/api/admin/publish", { changeId, ops, ...extra });
const undoIt = (target, changeId = newId()) => send(undo, "/api/admin/undo", { changeId, target });

let seed = 1000;
async function picture(kind, changeId, w = 1600, h = 1200) {
  const r = await post(upload, `/api/admin/upload?kind=${kind}&change=${changeId}`, jpegBase64(w, h, ++seed));
  const body = await r.json();
  assert.equal(r.status, 200, JSON.stringify(body));
  return body.receipt;
}
const pair = async (c) => ({ image: await picture("photo", c), thumb: await picture("thumb", c, 400, 300) });

function changedPaths() {
  const now = gh.filesAt();
  const was = gh.filesAt(gh.commits.get(gh.head).parent);
  return [...new Set([...now.keys(), ...was.keys()])].filter((p) => now.get(p) !== was.get(p)).sort();
}

test("a poster goes up in exactly one commit, touching only allowed paths (R49, R78)", async () => {
  const c = newId();
  const before = gh.commitCount();
  const r = await go(c, [{ op: "addPoster", image: await picture("poster", c), lastDate: FUTURE }]);
  assert.equal(r.status, 200, JSON.stringify(r));
  assert.equal(gh.commitCount(), before + 1);
  assert.equal(posters().at(-1).lastDate, FUTURE);
  const paths = changedPaths();
  assert.equal(paths.length, 4, paths.join());
  assert.ok(paths.every((p) => p.startsWith("site/data/") || p.startsWith("site/images/posters/")));
  assert.match(gh.commits.get(gh.head).message, new RegExp(`Admin-Change: ${c}`));
  assert.equal(JSON.parse(gh.text("site/data/last-change.json")).id, c);
});

test("nothing appears on the branch until the final step (R1, R48)", async () => {
  const c = newId();
  const before = gh.head;
  await pair(c);
  await picture("poster", c);
  assert.equal(gh.head, before);
});

test("sixty photos and their data land in one commit (R49, R64)", async () => {
  const c = newId();
  const photos = [];
  for (let i = 0; i < 60; i++) photos.push(await pair(c));
  const before = gh.commitCount();
  const r = await go(c, [{ op: "addPhotos", newAlbum: "Paddy O'Brien, Hazel Tree Mallow, May 2030", photos, cover: 2 }]);
  assert.equal(r.status, 200, JSON.stringify(r));
  assert.equal(gh.commitCount(), before + 1);
  const album = gallery()[0];
  assert.equal(album.title, "Paddy O'Brien, Hazel Tree Mallow, May 2030");
  assert.equal(album.photos.length, 60);
  assert.equal(album.cover, album.photos[2].src);
  assert.match(album.photos[0].src, /^images\/gallery\/[0-9a-f]{16}\.jpg$/);
  assert.equal(album.photos[0].w, 1600);
});

test("more than 60 photos are refused", async () => {
  const c = newId();
  const p = await pair(c);
  const r = await go(c, [{ op: "addPhotos", newAlbum: "Big", photos: Array(61).fill(p) }]);
  assert.equal(r.code, "photo_count");
});

test("the same request twice makes one commit (R55)", async () => {
  const c = newId();
  const ops = [{ op: "addPoster", image: await picture("poster", c), noEnd: true }];
  await go(c, ops);
  const before = gh.commitCount();
  const again = await go(c, ops);
  assert.equal(again.status, 200);
  assert.equal(again.already, true);
  assert.equal(gh.commitCount(), before);
});

test("a double click arriving together still makes one commit (R55)", async () => {
  const c = newId();
  const ops = [{ op: "addPoster", image: await picture("poster", c), noEnd: true }];
  const before = gh.commitCount();
  const [a, b] = await Promise.all([go(c, ops), go(c, ops)]);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(gh.commitCount(), before + 1);
  assert.equal(posters().filter((p) => p.noEnd).length, 1);
});

test("the owner pushing at the same moment keeps both changes (R72)", async () => {
  const c = newId();
  const ops = [{ op: "addPoster", image: await picture("poster", c), noEnd: true }];
  gh.beforeMove = () => gh.outsidePush("site/index.html", "the owner's edit");
  const r = await go(c, ops);
  assert.equal(r.status, 200);
  assert.equal(gh.text("site/index.html"), "the owner's edit");
  assert.ok(posters().some((p) => p.noEnd));
});

test("a change that keeps colliding stops without changing anything", async () => {
  const c = newId();
  const ops = [{ op: "addPoster", image: await picture("poster", c), noEnd: true }];
  let pushes = 0;
  const collide = () => { pushes++; gh.outsidePush("site/index.html", `edit ${pushes}`); gh.beforeMove = collide; };
  gh.beforeMove = collide;
  const r = await go(c, ops);
  assert.equal(r.code, "busy");
  assert.ok(!posters().some((p) => p.noEnd));
});

test("only the server chooses the branch", async () => {
  const c = newId();
  const receipt = await picture("poster", c);
  env.PUBLISH_BRANCH = "anything-else";
  assert.equal((await go(c, [{ op: "addPoster", image: receipt, noEnd: true }], { branch: "main" })).code, "not_configured");
  env.PUBLISH_BRANCH = undefined;
  assert.equal((await go(c, [{ op: "addPoster", image: receipt, noEnd: true }])).code, "not_configured");
});

test("bad pictures are refused on upload (R9, R46, R50)", async () => {
  const c = newId();
  const tryUpload = async (kind, body, change = c) => {
    const r = await post(upload, `/api/admin/upload?kind=${kind}&change=${change}`, body);
    return { status: r.status, ...(await r.json()) };
  };
  assert.equal((await tryUpload("poster", jpegBase64(300, 200))).code, "too_small");
  assert.equal((await tryUpload("photo", jpegBase64(300, 200))).code, "too_small");
  assert.equal((await tryUpload("poster", Buffer.from("<script>alert(1)</script>.....").toString("base64"))).code, "not_jpeg");
  assert.equal((await tryUpload("poster", "A".repeat(700001))).code, "too_big");
  assert.equal((await tryUpload("video", jpegBase64(1600, 1200))).code, "bad_request");
  assert.equal((await tryUpload("__proto__", jpegBase64(1600, 1200))).code, "bad_request");
  assert.equal((await tryUpload("poster", jpegBase64(1600, 1200), "../../x")).code, "bad_request");
});

test("forged, altered, misused and borrowed receipts are refused (R50)", async () => {
  const c = newId();
  const good = await picture("poster", c);
  const forged = await signReceipt("wrong-key", { sha: "abc", kind: "poster", w: 1600, h: 1200, change: c });
  const attempt = (image, change = c) => go(change, [{ op: "addPoster", image, noEnd: true }]);
  assert.equal((await attempt(forged)).code, "bad_receipt");
  assert.equal((await attempt(`${good.split(".")[0]}.AAAA`)).code, "bad_receipt");
  assert.equal((await attempt("nonsense")).code, "bad_receipt");
  assert.equal((await attempt(good, newId())).code, "bad_receipt");
  const photo = await picture("photo", c);
  assert.equal((await attempt(photo)).code, "wrong_kind");
});

test("exact duplicates are refused unless he says they're different (R10)", async () => {
  const first = newId();
  seed = 5000;
  await go(first, [{ op: "addPoster", image: await picture("poster", first), noEnd: true }]);
  const c = newId();
  seed = 5000;
  const receipt = await picture("poster", c);
  assert.equal((await go(c, [{ op: "addPoster", image: receipt, noEnd: true }])).code, "duplicate");
  assert.equal((await go(c, [{ op: "addPoster", image: receipt, noEnd: true }], { allowDuplicate: true })).status, 200);
  assert.equal(new Set(posters().map((p) => p.file)).size, posters().length);
});

test("undo-only steps and unknown steps are refused from the browser (R42, R50)", async () => {
  for (const op of ["_homeRestore", "_showSet", "removePresenter", "editNames", "constructor", "__proto__"]) {
    const r = await go(newId(), [{ op }]);
    assert.equal(r.status, 422, op);
  }
  for (const bad of [null, "x", {}]) assert.ok((await go(newId(), [bad])).status >= 400);
  assert.equal((await go(newId(), [{ op: "addPhotos", newAlbum: "x", photos: [null] }])).status, 422);
  assert.equal((await go("../bad", [{ op: "removePoster", file: "x" }])).code, "bad_request");
});

test("text with script or stray characters is refused", async () => {
  const r = await go(newId(), [{ op: "weeklyAdd", day: "Monday", presenter: "<script>", start: "09:00", end: "10:00", photo: "images/presenters/dj-barry.jpg" }]);
  assert.equal(r.code, "bad_text");
});

test("posters can be taken down and restored, picture included (R3, R13)", async () => {
  const target = posters()[0];
  const before = JSON.stringify(posters());
  const file = `site/${target.file}`;
  const sha = gh.filesAt().get(file);
  const c = newId();
  assert.equal((await go(c, [{ op: "removePoster", file: target.file }])).status, 200);
  assert.ok(!gh.filesAt().has(file));
  assert.equal((await undoIt(c)).status, 200);
  assert.equal(gh.filesAt().get(file), sha);
  assert.equal(JSON.stringify(posters()), before);
});

test("undo can itself be undone (R26)", async () => {
  const c = newId();
  await go(c, [{ op: "addPoster", image: await picture("poster", c), noEnd: true }]);
  const added = JSON.stringify(posters());
  const u = newId();
  await undoIt(c, u);
  assert.notEqual(JSON.stringify(posters()), added);
  assert.equal((await undoIt(u)).status, 200);
  assert.equal(JSON.stringify(posters()), added);
});

test("older photos with underscores or .png can be taken down and put back (R14)", async () => {
  const before = JSON.stringify(gallery());
  const album = gallery().find((a) => a.photos.some((p) => p.src.includes("_orig")) && a.title.includes("2022"));
  const count = album.photos.length;
  const c = newId();
  const r = await go(c, [{ op: "removeAlbum", album: album.title }]);
  assert.equal(r.status, 200, JSON.stringify(r));
  assert.ok(!gallery().some((a) => a.title === album.title));
  assert.equal((await undoIt(c)).status, 200);
  assert.equal(JSON.stringify(gallery()), before);
  assert.equal(gallery().find((a) => a.title === album.title).photos.length, count);
});

test("taking photos down never empties an album or breaks the home page", async () => {
  const album = gallery()[0];
  const all = album.photos.map((p) => p.src);
  assert.equal((await go(newId(), [{ op: "removePhotos", album: album.title, srcs: all }])).code, "album_would_be_empty");
  const shown = home()[0].src;
  const owner = gallery().find((a) => a.photos.some((p) => p.src === shown));
  if (owner) assert.equal((await go(newId(), [{ op: "removeAlbum", album: owner.title }])).code, "on_home_page");
});

test("adding photos to an album, then undoing, restores it (R3, R13)", async () => {
  const before = JSON.stringify(gallery());
  const c = newId();
  await go(c, [{ op: "addPhotos", album: "Rally Cars", photos: [await pair(c)] }]);
  assert.notEqual(JSON.stringify(gallery()), before);
  await undoIt(c);
  assert.equal(JSON.stringify(gallery()), before);
});

test("an entry is unsafe once something newer touched the same record (R25)", async () => {
  const first = newId();
  const show = "thu-danny-tobin-2100";
  await go(first, [{ op: "oneOffOff", date: FUTURE, showId: show }]);
  const c = newId();
  await go(c, [{ op: "addPoster", image: await picture("poster", c), noEnd: true }]);
  // Different records, so both remain safe.
  let list = await (await changes({ env, request: new Request("https://x.test/api/admin/changes", { headers: headers() }) })).json();
  assert.deepEqual(list.changes.map((e) => e.canUndo), [true, true]);
  assert.equal(list.practice, true);

  const u = newId();
  await undoIt(c, u);
  list = await (await changes({ env, request: new Request("https://x.test/api/admin/changes", { headers: headers() }) })).json();
  assert.equal(list.changes.find((e) => e.id === c).canUndo, false);
  assert.equal((await undoIt(c)).code, "not_safe_to_undo");
  assert.equal((await undoIt(u)).status, 200);
});

test("undo reaches only the last 20 changes (R24)", async () => {
  const ids = [];
  for (let i = 0; i < 22; i++) {
    const c = newId();
    ids.push(c);
    // A different Thursday each time, so that every entry touches its own record.
    const date = new Date(Date.parse(`${FUTURE}T00:00:00Z`) + i * 7 * 86400000).toISOString().slice(0, 10);
    assert.equal((await go(c, [{ op: "oneOffOff", date, showId: "thu-danny-tobin-2100" }])).status, 200);
  }
  const list = await (await changes({ env, request: new Request("https://x.test/api/admin/changes", { headers: headers() }) })).json();
  assert.equal(list.changes.length, 20);
  assert.equal((await undoIt(ids[0])).code, "not_safe_to_undo");
});

test("a time change every week applies, words included, and undoes (R29, R35)", async () => {
  const before = JSON.stringify(schedule());
  const c = newId();
  const r = await go(c, [{ op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "18:00", end: "20:00" }]);
  assert.equal(r.status, 200, JSON.stringify(r));
  const show = schedule().weekly[0].shows[0];
  assert.equal(show.time, "6.00 pm - 8.00 pm");
  assert.equal(show.start, "18:00");
  await undoIt(c);
  assert.equal(JSON.stringify(schedule()), before);
});

test("times not on a 15-minute step are refused (R29)", async () => {
  assert.equal((await go(newId(), [{ op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "18:10", end: "20:00" }])).code, "bad_times");
  assert.equal((await go(newId(), [{ op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "20:00", end: "18:00" }])).code, "bad_times");
});

test("clashes are refused, across midnight and Sunday into Monday (R31)", async () => {
  const clash = async (ops) => (await go(newId(), ops)).code;
  assert.equal(await clash([{ op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "19:00", end: "23:00" }]), "clash");
  assert.equal(await clash([{ op: "weeklyAdd", day: "Friday", presenter: "David Marks", start: "00:00", end: "01:00", photo: "images/presenters/davidmarks-pic.jpg" }]), "clash");
  assert.equal(await clash([{ op: "weeklyMove", showId: "sun-jimmy-reidy-2200", start: "22:00", end: "24:00" }]), undefined);
  assert.equal(await clash([{ op: "weeklyAdd", day: "Sunday", presenter: "David Marks", start: "23:30", end: "44:00", photo: "images/presenters/davidmarks-pic.jpg" }]), "bad_times");
});

test("Thursday's midnight repeat blocks a Friday-morning one-off (R31)", async () => {
  const r = await go(newId(), [{ op: "oneOffAdd", date: "2030-01-04", presenter: "David Marks", start: "01:00", end: "03:00", photo: "images/presenters/davidmarks-pic.jpg" }]);
  assert.equal(r.code, "clash");
});

test("one-off changes are stored by date and undo (R21, R23)", async () => {
  const before = JSON.stringify(schedule());
  const c = newId();
  const r = await go(c, [
    { op: "oneOffOff", date: FUTURE, showId: "thu-danny-tobin-2100" },
    { op: "oneOffAdd", date: FUTURE, presenter: "David Marks", start: "21:00", end: "22:00", photo: "images/presenters/davidmarks-pic.jpg" },
  ]);
  assert.equal(r.status, 200, JSON.stringify(r));
  assert.equal(schedule().oneOffs.length, 2);
  assert.equal(schedule().oneOffs[1].show.contact, "Email David {email}");
  await undoIt(c);
  assert.equal(JSON.stringify(schedule()), before);
});

test("one-offs are refused for past dates, impossible dates and wrong days", async () => {
  const off = async (date) => (await go(newId(), [{ op: "oneOffOff", date, showId: "thu-danny-tobin-2100" }])).code;
  assert.equal(await off("2020-01-02"), "bad_date");
  assert.equal(await off("2030-02-30"), "bad_date");
  assert.equal(await off("2030-01-04"), "not_on_that_day");
});

test("a Late finish reads Late and blocks to midnight (R33)", async () => {
  assert.equal(timeText("22:30", "24:00", true), "10.30 pm - Late");
  const c = newId();
  await go(c, [{ op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "19:00", late: true }]);
  assert.equal((await go(newId(), [])).status, 400);
  const clash = await go(newId(), [{ op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "21:00", late: true }]);
  assert.equal(clash.code, "clash");
});

test("wording of times matches the approved style", () => {
  assert.equal(timeText("24:00", "26:00"), "12.00 midnight - 2.00 am");
  assert.equal(timeText("22:00", "24:00"), "10.00 pm - 12.00 midnight");
  assert.equal(timeText("20:00", "24:30"), "8.00 pm - 12.30 am");
  assert.equal(timeText("11:00", "13:00"), "11.00 am - 1.00 pm");
  assert.equal(timeText("10:00", "12:00"), "10.00 am - 12.00 midday");
});

test("a new presenter needs a photo, gets the station email, and the owner is told (R34, R41)", async () => {
  env = { ...env, RESEND_API_KEY: "k", OWNER_EMAIL: "owner@example.com", ALERT_FROM: "a@example.com" };
  assert.equal((await go(newId(), [{ op: "weeklyAdd", day: "Monday", presenter: "New Person", start: "09:00", end: "10:00" }])).code, "no_photo");
  const c = newId();
  const r = await go(c, [{ op: "weeklyAdd", day: "Monday", presenter: "New Person", start: "09:00", end: "10:00", image: await picture("presenter", c, 400, 400) }]);
  assert.equal(r.status, 200, JSON.stringify(r));
  const show = schedule().weekly[0].shows[0];
  assert.equal(show.contact, "For Requests Email {email}");
  assert.match(show.photo, /^images\/presenters\//);
  assert.match(gh.emails.at(-1).text, /New names to check: New Person/);
});

test("home photos need at least 3 and take sizes from existing photos (R27)", async () => {
  const before = JSON.stringify(home());
  const list = gallery()[1].photos.slice(0, 3).map((p) => p.src);
  assert.equal((await go(newId(), [{ op: "setHomePhotos", srcs: list.slice(0, 2) }])).code, "home_count");
  assert.equal((await go(newId(), [{ op: "setHomePhotos", srcs: ["images/gallery/nope.jpg", ...list] }])).code, "no_such_photo");
  const c = newId();
  assert.equal((await go(c, [{ op: "setHomePhotos", srcs: list }])).status, 200);
  assert.equal(home().length, 3);
  assert.ok(home()[0].thumb && home()[0].w);
  await undoIt(c);
  assert.equal(JSON.stringify(home()), before);
});

test("one email per change, naming it, with a link to Undo (R62)", async () => {
  env = { ...env, RESEND_API_KEY: "k", OWNER_EMAIL: "owner@example.com", ALERT_FROM: "a@example.com" };
  const c = newId();
  await go(c, [{ op: "addPoster", image: await picture("poster", c), noEnd: true }]);
  assert.equal(gh.emails.length, 1);
  assert.match(gh.emails[0].subject, /^\[Practice\] Website changed: added a gig poster/);
  assert.match(gh.emails[0].text, /https:\/\/x\.test\/admin\//);
  assert.deepEqual(gh.emails[0].to, ["owner@example.com"]);
});

test("publishing still succeeds if email is down or unset (section 4)", async () => {
  const c = newId();
  assert.equal((await go(c, [{ op: "addPoster", image: await picture("poster", c), noEnd: true }])).status, 200);
  env = { ...env, RESEND_API_KEY: "k", OWNER_EMAIL: "o@example.com", ALERT_FROM: "a@example.com" };
  gh.failEmail = true;
  const d = newId();
  assert.equal((await go(d, [{ op: "addPoster", image: await picture("poster", d), noEnd: true }])).status, 200);
});

test("if GitHub fails, nothing changes and the owner is told (R54)", async () => {
  env = { ...env, RESEND_API_KEY: "k", OWNER_EMAIL: "o@example.com", ALERT_FROM: "a@example.com" };
  const c = newId();
  const ops = [{ op: "addPoster", image: await picture("poster", c), noEnd: true }];
  const before = gh.head;
  gh.failAt = "/git/trees";
  const r = await go(c, ops);
  assert.equal(r.code, "try_later");
  assert.equal(gh.head, before);
  assert.match(gh.emails.at(-1).subject, /failed/);
});

test("a picture GitHub no longer holds asks for it to be sent again", async () => {
  const c = newId();
  const ops = [{ op: "addPoster", image: await signReceipt(env.RECEIPT_KEY, { sha: "f".repeat(40), kind: "poster", w: 1600, h: 1200, change: c }), noEnd: true }];
  assert.equal((await go(c, ops)).code, "send_pictures_again");
});

test("oversized and malformed requests are refused", async () => {
  assert.equal((await post(publish, "/api/admin/publish", "x".repeat(300000))).status, 413);
  assert.equal((await post(publish, "/api/admin/publish", "{not json")).status, 400);
  assert.equal((await post(undo, "/api/admin/undo", "{not json")).status, 400);
});

test("Get Help and failure reports reach the owner (R5, R54)", async () => {
  env = { ...env, RESEND_API_KEY: "k", OWNER_EMAIL: "o@example.com", ALERT_FROM: "a@example.com" };
  const r = await send(notify, "/api/admin/notify", { type: "help", details: "Adding photos, step 2" });
  assert.equal(r.sent, true);
  assert.match(gh.emails[0].text, /editor@example\.com[\s\S]*Adding photos/);
  assert.equal((await send(notify, "/api/admin/notify", { type: "spam" })).code, "bad_request");
});

test("'on the website' is true only when the live file shows that change (R53)", async () => {
  const c = newId();
  const ask = async (live) => {
    env.ASSETS = { fetch: async () => live };
    const r = await confirm({ env, request: new Request(`https://x.test/api/admin/confirm?id=${c}`, { headers: headers() }) });
    return (await r.json()).live;
  };
  assert.equal(await ask(new Response(JSON.stringify({ id: "older-change-000000" }))), false);
  assert.equal(await ask(new Response("", { status: 404 })), false);
  assert.equal(await ask(new Response(JSON.stringify({ id: c }))), true);
});

test("a stranger is refused by every new function (R59)", async () => {
  auth = await token("stranger@example.com");
  assert.equal((await go(newId(), [{ op: "removePoster", file: "x" }])).status, 403);
  assert.equal((await post(upload, "/api/admin/upload", "x")).status, 403);
  assert.equal((await undoIt(newId())).status, 403);
  assert.equal((await send(notify, "/api/admin/notify", { type: "help" })).status, 403);
});

test("a publish stays inside the 50-request limit", async () => {
  const c = newId();
  const ops = [{ op: "addPoster", image: await picture("poster", c), noEnd: true }];
  gh.calls = [];
  gh.beforeMove = () => gh.outsidePush("site/index.html", "x");
  await go(c, ops);
  assert.ok(gh.calls.length < 48, `${gh.calls.length} requests`);
});

test("what the engine writes passes the build check and the site's own rules (R51)", async () => {
  const { checkSite } = await import("../tools/check-site.mjs");
  const { root } = await import("./fake-github.mjs");
  const { default: vm } = await import("node:vm");
  const { default: fs } = await import("node:fs");
  const { default: path } = await import("node:path");
  await go(newId(), [
    { op: "weeklyMove", showId: "mon-tim-coughlan-1900", start: "18:00", end: "20:00" },
    { op: "oneOffOff", date: FUTURE, showId: "thu-danny-tobin-2100" },
    { op: "oneOffAdd", date: FUTURE, presenter: "David Marks", start: "21:00", end: "22:00", photo: "images/presenters/davidmarks-pic.jpg" },
  ]);
  const src = gh.text("site/data/schedule.js");
  assert.deepEqual(checkSite(root, { overrides: { "schedule.js": src }, gitLog: "" }).failures, []);
  const box = { window: {}, Intl, Date };
  vm.runInNewContext(src, box);
  vm.runInNewContext(fs.readFileSync(path.join(root, "site/assets/schedule-logic.js"), "utf8"), box);
  const shows = box.window.CMS_LOGIC.showsForDate(box.window.SCHEDULE, FUTURE);
  assert.ok(shows.some((s) => s.presenter === "David Marks"));
  assert.ok(!shows.some((s) => s.id === "thu-danny-tobin-2100"));
  assert.match(src, /^\/\* The DJ Schedule\./);
});

test("a full 60-photo publish, CPU indication on this computer (R64)", async () => {
  const c = newId();
  const photos = [];
  for (let i = 0; i < 60; i++) photos.push(await pair(c));
  const body = JSON.stringify({ changeId: c, ops: [{ op: "addPhotos", newAlbum: "CPU", photos }] });
  const start = process.cpuUsage();
  const r = await post(publish, "/api/admin/publish", body);
  const used = process.cpuUsage(start);
  assert.equal(r.status, 200);
  console.log(`local CPU for a 60-photo publish: ${((used.user + used.system) / 1000).toFixed(1)} ms, including the stand-in GitHub`);
});
