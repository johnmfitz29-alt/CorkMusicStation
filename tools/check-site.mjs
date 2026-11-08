// The build check: the last line of defence. It runs as Cloudflare's build command and produces no files.
// If it exits with a failure, Cloudflare keeps the old site up.
//   node tools/check-site.mjs

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseDataFile } from "../functions/_lib/datafile.js";
import { isAllowedWrite } from "../functions/_lib/paths.js";

const FILE_LIMIT = 20000;
const FILE_WARN = 18000;
const MIB = 1024 * 1024;
const SIZE_LIMIT = 25 * MIB;
const SIZE_WARN = 20 * MIB;
const TIME = /^([0-9]{1,2}):(00|15|30|45)$/;
const ANY_TIME = /^[0-9]{1,2}:[0-5][0-9]$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE = /^images\/[a-z]+\/[^/\\]+\.(jpg|jpeg|png|gif)$/i;
const ADMIN_TRAILER = /^Admin-Change:/m;

function realDate(iso) {
  if (!DATE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

function loadLogic(siteDir) {
  const box = { window: {}, Intl, Date };
  vm.runInNewContext(fs.readFileSync(path.join(siteDir, "assets/schedule-logic.js"), "utf8"), box);
  return box.window.CMS_LOGIC;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export function checkSite(root, { overrides = {}, gitLog } = {}) {
  const failures = [];
  const warnings = [];
  const fail = (m) => failures.push(m);
  const siteDir = path.join(root, "site");
  const read = (name, global) => {
    try {
      const text = overrides[name] ?? fs.readFileSync(path.join(siteDir, "data", name), "utf8");
      return parseDataFile(text, global);
    } catch (e) {
      fail(`${name}: cannot be read (${e.message})`);
      return null;
    }
  };

  const needText = (where, value) => {
    if (typeof value !== "string" || !value.trim()) fail(`${where}: missing text`);
    else if (/[<>\u0000-\u001f]/.test(value)) fail(`${where}: contains characters that are not allowed`);
  };
  const needImage = (where, file) => {
    if (typeof file !== "string" || !IMAGE.test(file) || file.includes("..")) return fail(`${where}: bad image path ${file}`);
    if (!fs.existsSync(path.join(siteDir, file))) fail(`${where}: missing image ${file}`);
  };
  const needSize = (where, item) => {
    if (!Number.isInteger(item.w) || !Number.isInteger(item.h) || item.w < 1 || item.h < 1) fail(`${where}: bad width or height`);
  };

  const logic = loadLogic(siteDir);
  const checkShow = (where, s, seen) => {
    if (!s || typeof s.id !== "string" || !s.id) return fail(`${where}: show has no id`);
    if (seen.has(s.id)) fail(`${where}: repeated id ${s.id}`);
    seen.add(s.id);
    needText(`${where} ${s.id} presenter`, s.presenter);
    needText(`${where} ${s.id} time`, s.time);
    needText(`${where} ${s.id} contact`, s.contact);
    if (s.show !== undefined) needText(`${where} ${s.id} show`, s.show);
    needImage(`${where} ${s.id}`, s.photo);
    if (!ANY_TIME.test(s.start || "") || !ANY_TIME.test(s.end || "")) return fail(`${where} ${s.id}: bad start or end`);
    if (logic.mins(s.end) <= logic.mins(s.start)) fail(`${where} ${s.id}: finishes before it starts`);
    if (logic.mins(s.start) >= 1440) {
      // The Thursday repeat starts at exactly midnight, written 24:00. Later starts belong to the next day.
      if (logic.mins(s.start) !== 1440) fail(`${where} ${s.id}: starts after midnight`);
    }
  };

  const schedule = read("schedule.js", "SCHEDULE");
  if (schedule) {
    if (!Array.isArray(schedule.weekly) || schedule.weekly.length !== 7) fail("schedule.js: must list seven days");
    else {
      const seen = new Set();
      const week = [];
      schedule.weekly.forEach((d, i) => {
        if (d.day !== logic.DAYS[i]) fail(`schedule.js: day ${i + 1} should be ${logic.DAYS[i]}`);
        (d.shows || []).forEach((s) => {
          checkShow(`schedule.js ${d.day}`, s, seen);
          if (ANY_TIME.test(s.start || "") && ANY_TIME.test(s.end || "")) {
            week.push({ id: s.id, from: i * 1440 + logic.mins(s.start), to: i * 1440 + logic.mins(s.end) });
          }
        });
      });
      week.sort((a, b) => a.from - b.from);
      week.forEach((x, i) => {
        const next = week[(i + 1) % week.length];
        const start = i + 1 === week.length ? next.from + 7 * 1440 : next.from;
        if (week.length > 1 && x.to > start) fail(`schedule.js: ${x.id} clashes with ${next.id}`);
      });

      if (!Array.isArray(schedule.oneOffs)) fail("schedule.js: oneOffs must be a list");
      else {
        const ids = new Set();
        const dates = new Set();
        schedule.oneOffs.forEach((o, n) => {
          const where = `schedule.js one-off ${n + 1}`;
          if (!o.id || ids.has(o.id)) fail(`${where}: missing or repeated id`);
          ids.add(o.id);
          if (!realDate(o.date)) return fail(`${where}: bad date ${o.date}`);
          dates.add(o.date);
          if (!["off", "move", "add"].includes(o.type)) return fail(`${where}: unknown type ${o.type}`);
          if (o.type === "add") return checkShow(where, o.show, seen);
          const day = schedule.weekly[logic.weekdayOf(o.date)];
          if (!day.shows.some((s) => s.id === o.showId)) fail(`${where}: no such show on that day`);
          if (o.type === "move") {
            needText(`${where} time`, o.time);
            if (!TIME.test(o.start || "") || !TIME.test(o.end || "") || logic.mins(o.end) <= logic.mins(o.start)) fail(`${where}: bad times`);
          }
        });
        for (const iso of dates) {
          const shows = logic.showsForDate(schedule, iso);
          shows.slice(1).forEach((s, i) => {
            if (logic.mins(s.start) < logic.mins(shows[i].end)) fail(`schedule.js ${iso}: ${shows[i].id} clashes with ${s.id}`);
          });
        }
      }
    }
  }

  const posters = read("posters.js", "POSTERS");
  if (posters) {
    if (!Array.isArray(posters)) fail("posters.js: must be a list");
    else {
      let undated = 0;
      posters.forEach((p, i) => {
        const where = `posters.js item ${i + 1}`;
        needImage(where, p.file);
        needSize(where, p);
        if (p.lastDate !== undefined && !realDate(p.lastDate)) fail(`${where}: bad last date ${p.lastDate}`);
        if (p.lastDate && p.noEnd) fail(`${where}: has both a last date and no end date`);
        if (!p.lastDate && !p.noEnd) undated++;
      });
      if (undated) warnings.push(`posters.js: ${undated} poster(s) have no last date or "no end date" yet`);
    }
  }

  const gallery = read("gallery.js", "GALLERY");
  if (gallery) {
    if (!Array.isArray(gallery)) fail("gallery.js: must be a list");
    else gallery.forEach((a, i) => {
      const where = `gallery.js album ${i + 1}`;
      needText(`${where} title`, a.title);
      if (!Array.isArray(a.photos) || a.photos.length === 0) return fail(`${where}: has no photos`);
      a.photos.forEach((p, n) => {
        needImage(`${where} photo ${n + 1}`, p.src);
        needImage(`${where} thumb ${n + 1}`, p.thumb);
        needSize(`${where} photo ${n + 1}`, p);
      });
    });
  }

  const home = read("home-photos.js", "HOME_PHOTOS");
  if (home) {
    if (!Array.isArray(home) || home.length < 3) fail("home-photos.js: needs at least 3 photos");
    else home.forEach((p, i) => {
      needImage(`home-photos.js item ${i + 1}`, p.src);
      needImage(`home-photos.js thumb ${i + 1}`, p.thumb);
    });
  }

  const files = walk(siteDir);
  if (files.length > FILE_LIMIT) fail(`site has ${files.length} files; the limit is ${FILE_LIMIT}`);
  else if (files.length >= FILE_WARN) warnings.push(`site has ${files.length} files, nearing the limit of ${FILE_LIMIT}`);
  for (const file of files) {
    const size = fs.statSync(file).size;
    const name = path.relative(root, file).replaceAll("\\", "/");
    if (size > SIZE_LIMIT) fail(`${name} is over 25 MiB`);
    else if (size > SIZE_WARN) warnings.push(`${name} is ${(size / MIB).toFixed(1)} MiB, nearing the 25 MiB limit`);
  }

  // A commit from the admin area may touch only the allowed paths.
  let log = gitLog;
  if (log === undefined) {
    try {
      log = execFileSync("git", ["show", "--name-status", "--format=%B", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      log = null;
      warnings.push("git history not available, so the last commit's paths were not checked");
    }
  }
  if (log && ADMIN_TRAILER.test(log)) {
    const actions = { A: "create", M: "update", D: "delete" };
    for (const line of log.split("\n")) {
      const match = line.match(/^([AMDRCT])\d*\t(.+)$/);
      if (!match) continue;
      const parts = match[2].split("\t");
      if (!actions[match[1]] || parts.length > 1 || !isAllowedWrite(parts[0], actions[match[1]])) {
        fail(`admin commit touched a path it must not: ${match[2]}`);
      }
    }
  }

  return { failures, warnings, fileCount: files.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const { failures, warnings, fileCount } = checkSite(root);
  for (const w of warnings) console.log(`warning: ${w}`);
  for (const f of failures) console.error(`FAILED: ${f}`);
  console.log(`${fileCount} files checked: ${failures.length} failed, ${warnings.length} warnings`);
  process.exit(failures.length ? 1 : 0);
}
