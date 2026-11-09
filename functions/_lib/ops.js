// Every change the admin area can make, written as small steps that are checked here on the server.
// Each step also records the steps that reverse it, which is how Undo works.
// Steps whose names start with "_" exist only for Undo and are refused from the browser.

import { DAYS, dateClash, hhmm, irishToday, mins, realDate, timeText, validTimes, weekdayOf, weeklyClash } from "./schedule.js";

const MAX_PHOTOS = 60;
const MIN_HOME = 3;
const DEFAULT_CONTACT = "For Requests Email {email}";

export class Refusal extends Error {
  constructor(code, detail) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}
const refuse = (code, detail) => { throw new Refusal(code, detail); };

const NEEDS = {
  addPoster: ["posters"], removePoster: ["posters"], _posterRestore: ["posters"],
  addPhotos: ["gallery", "home"], removePhotos: ["gallery", "home"], removeAlbum: ["gallery", "home"],
  _photoRestore: ["gallery", "home"], _albumRestore: ["gallery", "home"],
  setHomePhotos: ["home", "gallery"], _homeRestore: ["home", "gallery"],
};
const SCHEDULE_OPS = ["weeklyMove", "weeklyOff", "weeklyAdd", "oneOffOff", "oneOffMove", "oneOffAdd", "_showSet", "_showRestore", "_showRemove", "_oneOffRemove", "_oneOffRestore"];
for (const name of SCHEDULE_OPS) NEEDS[name] = ["schedule"];
// Removing a photo must not leave a broken schedule or home page, so those are read too.
NEEDS.removePhotos = ["gallery", "home", "schedule", "posters"];
NEEDS.removeAlbum = ["gallery", "home", "schedule", "posters"];
NEEDS.removePoster = ["posters", "gallery", "home", "schedule"];

export function neededFiles(ops) {
  const out = new Set();
  for (const op of ops) {
    if (!NEEDS[op?.op]) refuse("unknown_step", op?.op);
    NEEDS[op.op].forEach((n) => out.add(n));
  }
  return out;
}

export function receiptsIn(ops) {
  const out = [];
  for (const op of ops) {
    if (op.image) out.push(op.image);
    for (const p of op.photos || []) out.push(p.image, p.thumb);
  }
  return out;
}

function text(value, label, max = 120) {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > max || /[<>\u0000-\u001f]/.test(value)) {
    refuse("bad_text", label);
  }
  return value;
}

const site = (file) => `site/${file}`;
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function applyOps(state, ops, ctx) {
  const undo = [];
  const touched = new Set();
  const images = [];
  const newNames = [];
  let serial = 0;
  const today = ctx.today || irishToday();
  const { tree, receipts, changeId } = ctx;

  function take(ref, kind, folder, suffix = "") {
    const r = receipts.get(ref);
    if (!r) refuse("bad_receipt");
    if (r.kind !== kind) refuse("wrong_kind", kind);
    if (r.change !== changeId) refuse("bad_receipt");
    let file = `images/${folder}/${r.sha.slice(0, 16)}${suffix}.jpg`;
    if (tree.has(site(file)) || images.some((i) => i.path === site(file) && i.action === "create")) {
      if (!ctx.allowDuplicate) refuse("duplicate", file);
      file = `images/${folder}/${r.sha.slice(0, 16)}-${changeId.slice(0, 6)}-${++serial}${suffix}.jpg`;
    }
    images.push({ path: site(file), sha: r.sha, action: "create" });
    return { file, w: r.w, h: r.h };
  }

  function usedElsewhere(file) {
    const { posters, gallery, home, schedule } = state;
    if (posters?.some((p) => p.file === file)) return true;
    if (gallery?.some((a) => a.photos.some((p) => p.src === file || p.thumb === file))) return true;
    if (home?.some((p) => p.src === file || p.thumb === file)) return true;
    return !!schedule && [...schedule.weekly.flatMap((d) => d.shows), ...schedule.oneOffs.map((o) => o.show).filter(Boolean)].some((s) => s.photo === file);
  }

  // Call after the record has gone from the data. Returns what is needed to put the file back.
  function deleteFiles(files) {
    const shas = {};
    for (const file of new Set(files)) {
      if (usedElsewhere(file)) continue;
      const sha = tree.get(site(file));
      if (!sha) continue;
      shas[file] = sha;
      images.push({ path: site(file), action: "delete" });
    }
    return shas;
  }

  function restoreFiles(shas) {
    for (const [file, sha] of Object.entries(shas || {})) {
      images.push({ path: site(file), sha, action: "create" });
    }
  }

  const album = (title) => state.gallery.find((a) => a.title === title) || refuse("no_such_album", title);
  const findShow = (id) => {
    for (const [d, day] of state.schedule.weekly.entries()) {
      const i = day.shows.findIndex((s) => s.id === id);
      if (i >= 0) return { d, i, show: day.shows[i], day };
    }
    return refuse("no_such_show", id);
  };
  const sortDay = (day) => day.shows.sort((a, b) => mins(a.start) - mins(b.start));
  const checkWeek = () => {
    const clash = weeklyClash(state.schedule);
    if (clash) refuse("clash", clash);
  };
  const checkDate = (iso) => {
    const clash = dateClash(state.schedule, iso);
    if (clash) refuse("clash", clash);
  };
  const futureDate = (iso) => {
    if (!realDate(iso) || iso < today) refuse("bad_date", iso);
    return iso;
  };
  const times = (op) => {
    if (!validTimes(op.start, op.end, op.late)) refuse("bad_times");
    const end = op.late ? "24:00" : op.end;
    return { start: op.start, end, late: !!op.late, time: timeText(op.start, end, !!op.late) };
  };
  const onDay = (id, iso) => {
    const found = findShow(id);
    if (found.d !== weekdayOf(iso)) refuse("not_on_that_day");
    return found;
  };
  const oneOffId = () => `o-${changeId.slice(0, 8)}-${++serial}`;

  function newShow(op, base) {
    const presenter = text(op.presenter, "presenter");
    const show = { id: base, presenter };
    if (op.show !== undefined) show.show = text(op.show, "show");
    const t = times(op);
    Object.assign(show, { time: t.time, start: t.start, end: t.end });
    if (op.repeat === true) show.repeat = true;
    if (t.late) show.late = true;
    show.contact = DEFAULT_CONTACT;
    if (op.image) {
      show.photo = take(op.image, "presenter", "presenters").file;
      newNames.push(presenter);
    } else {
      if (typeof op.photo !== "string" || !state.schedule.weekly.some((d) => d.shows.some((s) => s.photo === op.photo))) refuse("no_photo");
      show.photo = op.photo;
      const known = state.schedule.weekly.flatMap((d) => d.shows).find((s) => s.presenter === presenter);
      if (known) show.contact = known.contact;
    }
    return show;
  }

  for (const op of ops) {
    switch (op.op) {
      case "addPoster": {
        if (op.noEnd === true && op.lastDate !== undefined) refuse("bad_date");
        if (op.noEnd !== true) futureDate(op.lastDate);
        const { file, w, h } = take(op.image, "poster", "posters");
        if (Math.max(w, h) < 800) refuse("too_small");
        state.posters.push(op.noEnd === true ? { file, w, h, noEnd: true } : { file, w, h, lastDate: op.lastDate });
        undo.unshift({ op: "removePoster", file });
        touched.add(`poster:${file}`);
        break;
      }
      case "removePoster": {
        const index = state.posters.findIndex((p) => p.file === op.file);
        if (index < 0) refuse("no_such_poster", op.file);
        const [record] = state.posters.splice(index, 1);
        undo.unshift({ op: "_posterRestore", record, index, shas: deleteFiles([record.file]) });
        touched.add(`poster:${record.file}`);
        break;
      }
      case "_posterRestore": {
        state.posters.splice(Math.min(op.index, state.posters.length), 0, op.record);
        restoreFiles(op.shas);
        undo.unshift({ op: "removePoster", file: op.record.file });
        touched.add(`poster:${op.record.file}`);
        break;
      }
      case "addPhotos": {
        const count = Array.isArray(op.photos) ? op.photos.length : 0;
        if (count < 1 || count > MAX_PHOTOS) refuse("photo_count");
        let target;
        const isNew = op.newAlbum !== undefined;
        if (isNew) {
          text(op.newAlbum, "album", 200);
          if (state.gallery.some((a) => a.title === op.newAlbum)) refuse("album_exists");
          target = { title: op.newAlbum, photos: [] };
          state.gallery.unshift(target);
        } else {
          target = album(op.album);
        }
        const added = op.photos.map((p) => {
          const full = take(p.image, "photo", "gallery");
          const thumb = take(p.thumb, "thumb", "gallery", "-t");
          return { src: full.file, thumb: thumb.file, w: full.w, h: full.h };
        });
        target.photos.push(...added);
        if (Number.isInteger(op.cover) && op.cover >= 0 && op.cover < added.length) target.cover = added[op.cover].src;
        undo.unshift(isNew ? { op: "removeAlbum", album: target.title } : { op: "removePhotos", album: target.title, srcs: added.map((p) => p.src) });
        touched.add(`album:${target.title}`);
        break;
      }
      case "removePhotos": {
        const target = album(op.album);
        if (!Array.isArray(op.srcs) || !op.srcs.length) refuse("photo_count");
        if (op.srcs.length >= target.photos.length) refuse("album_would_be_empty");
        const items = [];
        const previousCover = target.cover;
        for (const src of op.srcs) {
          if (state.home.some((p) => p.src === src)) refuse("on_home_page", src);
          const index = target.photos.findIndex((p) => p.src === src);
          if (index < 0) refuse("no_such_photo", src);
          const [photo] = target.photos.splice(index, 1);
          items.unshift({ photo, index });
          if (target.cover === src) delete target.cover;
        }
        const shas = deleteFiles(items.flatMap((x) => [x.photo.src, x.photo.thumb]));
        undo.unshift({ op: "_photoRestore", album: target.title, items, shas, cover: previousCover });
        touched.add(`album:${target.title}`);
        break;
      }
      case "_photoRestore": {
        const target = album(op.album);
        for (const { photo, index } of op.items) target.photos.splice(Math.min(index, target.photos.length), 0, photo);
        if (op.cover) target.cover = op.cover;
        restoreFiles(op.shas);
        undo.unshift({ op: "removePhotos", album: target.title, srcs: op.items.map((x) => x.photo.src) });
        touched.add(`album:${target.title}`);
        break;
      }
      case "removeAlbum": {
        const index = state.gallery.findIndex((a) => a.title === op.album);
        if (index < 0) refuse("no_such_album", op.album);
        const record = state.gallery[index];
        for (const p of record.photos) if (state.home.some((h) => h.src === p.src)) refuse("on_home_page", p.src);
        state.gallery.splice(index, 1);
        const shas = deleteFiles(record.photos.flatMap((p) => [p.src, p.thumb]));
        undo.unshift({ op: "_albumRestore", record, index, shas });
        touched.add(`album:${record.title}`);
        break;
      }
      case "_albumRestore": {
        state.gallery.splice(Math.min(op.index, state.gallery.length), 0, op.record);
        restoreFiles(op.shas);
        undo.unshift({ op: "removeAlbum", album: op.record.title });
        touched.add(`album:${op.record.title}`);
        break;
      }
      case "setHomePhotos": {
        if (!Array.isArray(op.srcs) || op.srcs.length < MIN_HOME || new Set(op.srcs).size !== op.srcs.length) refuse("home_count");
        const known = new Map(state.home.map((p) => [p.src, p]));
        for (const a of state.gallery) for (const p of a.photos) if (!known.has(p.src)) known.set(p.src, p);
        const next = op.srcs.map((src) => {
          const p = known.get(src) || refuse("no_such_photo", src);
          return { src: p.src, thumb: p.thumb, w: p.w, h: p.h };
        });
        undo.unshift({ op: "_homeRestore", list: state.home });
        state.home = next;
        touched.add("home");
        break;
      }
      case "_homeRestore": {
        undo.unshift({ op: "_homeRestore", list: state.home });
        state.home = op.list;
        touched.add("home");
        break;
      }
      case "weeklyMove": {
        const found = findShow(op.showId);
        const t = times(op);
        const before = found.show;
        const after = { ...before, start: t.start, end: t.end, time: t.time };
        if (t.late) after.late = true; else delete after.late;
        found.day.shows[found.i] = after;
        sortDay(found.day);
        checkWeek();
        undo.unshift({ op: "_showSet", showId: before.id, record: before });
        touched.add(`show:${before.id}`);
        break;
      }
      case "_showSet": {
        const found = findShow(op.showId);
        undo.unshift({ op: "_showSet", showId: op.showId, record: found.show });
        found.day.shows[found.i] = op.record;
        sortDay(found.day);
        touched.add(`show:${op.showId}`);
        break;
      }
      case "weeklyOff": {
        const found = findShow(op.showId);
        found.day.shows.splice(found.i, 1);
        undo.unshift({ op: "_showRestore", day: DAYS[found.d], show: found.show });
        touched.add(`show:${op.showId}`);
        break;
      }
      case "_showRestore": {
        const day = state.schedule.weekly.find((d) => d.day === op.day);
        day.shows.push(op.show);
        sortDay(day);
        checkWeek();
        undo.unshift({ op: "_showRemove", showId: op.show.id });
        touched.add(`show:${op.show.id}`);
        break;
      }
      case "_showRemove": {
        const found = findShow(op.showId);
        found.day.shows.splice(found.i, 1);
        undo.unshift({ op: "_showRestore", day: DAYS[found.d], show: found.show });
        touched.add(`show:${op.showId}`);
        break;
      }
      case "weeklyAdd": {
        const d = DAYS.indexOf(op.day);
        if (d < 0) refuse("bad_day");
        const stem = `${op.day.slice(0, 3).toLowerCase()}-${slug(text(op.presenter, "presenter"))}-${hhmm(mins(op.start || "0:00")).replace(":", "")}`;
        const taken = new Set(state.schedule.weekly.flatMap((x) => x.shows.map((s) => s.id)));
        const id = taken.has(stem) ? `${stem}-${changeId.slice(0, 6)}` : stem;
        const show = newShow(op, id);
        state.schedule.weekly[d].shows.push(show);
        sortDay(state.schedule.weekly[d]);
        checkWeek();
        undo.unshift({ op: "_showRemove", showId: id });
        touched.add(`show:${id}`);
        break;
      }
      case "oneOffOff":
      case "oneOffMove": {
        futureDate(op.date);
        const { show } = onDay(op.showId, op.date);
        const entry = { id: oneOffId(), date: op.date, type: op.op === "oneOffOff" ? "off" : "move", showId: show.id };
        if (op.op === "oneOffMove") {
          const t = times(op);
          Object.assign(entry, { start: t.start, end: t.end, time: t.time });
          if (t.late) entry.late = true;
        }
        state.schedule.oneOffs.push(entry);
        checkDate(op.date);
        undo.unshift({ op: "_oneOffRemove", id: entry.id });
        touched.add(`oneoff:${entry.id}`);
        break;
      }
      case "oneOffAdd": {
        futureDate(op.date);
        const id = oneOffId();
        const entry = { id, date: op.date, type: "add", show: newShow(op, `add-${id}`) };
        state.schedule.oneOffs.push(entry);
        checkDate(op.date);
        undo.unshift({ op: "_oneOffRemove", id });
        touched.add(`oneoff:${id}`);
        break;
      }
      case "_oneOffRemove": {
        const index = state.schedule.oneOffs.findIndex((o) => o.id === op.id);
        if (index < 0) refuse("no_such_change", op.id);
        const [entry] = state.schedule.oneOffs.splice(index, 1);
        undo.unshift({ op: "_oneOffRestore", entry, index });
        touched.add(`oneoff:${op.id}`);
        break;
      }
      case "_oneOffRestore": {
        state.schedule.oneOffs.splice(Math.min(op.index, state.schedule.oneOffs.length), 0, op.entry);
        checkDate(op.entry.date);
        undo.unshift({ op: "_oneOffRemove", id: op.entry.id });
        touched.add(`oneoff:${op.entry.id}`);
        break;
      }
      default:
        refuse("unknown_step", op.op);
    }
  }
  return { undo, touched: [...touched], images, newNames };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// The plain-English words shown in Undo. Built on the server from the steps themselves.
export function describe(ops) {
  return ops.map((op) => {
    switch (op.op) {
      case "addPoster": return "added a gig poster";
      case "removePoster": return "took down a gig poster";
      case "addPhotos": return `added ${plural(op.photos.length, "photo")} to ${op.newAlbum ?? op.album}`;
      case "removePhotos": return `took down ${plural(op.srcs.length, "photo")} from ${op.album}`;
      case "removeAlbum": return `took down the album ${op.album}`;
      case "setHomePhotos": return "changed the home page photos";
      case "weeklyMove": return "changed a show's time, every week";
      case "weeklyOff": return "took a show off, every week";
      case "weeklyAdd": return `added ${op.presenter} on ${op.day}s`;
      case "oneOffOff": return `took a show off for ${op.date}`;
      case "oneOffMove": return `changed a show's time for ${op.date}`;
      case "oneOffAdd": return `added ${op.presenter} for ${op.date}`;
      default: return "put back an earlier change";
    }
  }).join(", ");
}
