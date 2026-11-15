// Schedule rules for the server. The browser's own copy is site/assets/schedule-logic.js.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STEP = /^([0-9]{1,2}):(00|15|30|45)$/;
const WEEK = 7 * 1440;

export function mins(t) {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
}

export function hhmm(total) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// A start may be at most midnight (24:00). A finish may run to noon the next day.
export function validTimes(start, end, late) {
  if (!STEP.test(start || "")) return false;
  const from = mins(start);
  if (from > 1440) return false;
  if (late) return from < 1440;
  if (!STEP.test(end || "")) return false;
  const to = mins(end);
  return to > from && to <= 2160;
}

function clock(total) {
  const m = total % 1440;
  if (m === 0) return "12.00 midnight";
  if (m === 720) return "12.00 midday";
  const hour = Math.floor(m / 60);
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}.${String(m % 60).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
}

// The public wording, in the style the owner approved.
export function timeText(start, end, late) {
  return late ? `${clock(mins(start))} - Late` : `${clock(mins(start))} - ${clock(mins(end))}`;
}

export function weekdayOf(iso) {
  return (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
}

function addDays(iso, n) {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
}

export function realDate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

export function irishToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function weeklyClash(schedule) {
  const list = [];
  schedule.weekly.forEach((day, d) => day.shows.forEach((s) => {
    list.push({ id: s.id, from: d * 1440 + mins(s.start), to: d * 1440 + mins(s.end) });
  }));
  list.sort((a, b) => a.from - b.from);
  for (let i = 0; i < list.length && list.length > 1; i++) {
    const next = list[(i + 1) % list.length];
    const start = i + 1 === list.length ? next.from + WEEK : next.from;
    if (list[i].to > start) return [list[i].id, next.id];
  }
  return null;
}

function showsForDate(schedule, iso) {
  let shows = schedule.weekly[weekdayOf(iso)].shows.slice();
  for (const o of schedule.oneOffs) {
    if (o.date !== iso) continue;
    if (o.type === "off") shows = shows.filter((s) => s.id !== o.showId);
    if (o.type === "move") shows = shows.map((s) => (s.id === o.showId ? { ...s, start: o.start, end: o.end } : s));
    if (o.type === "add") shows.push(o.show);
  }
  return shows;
}

// Checks one date against itself and the nights on either side, which can run across midnight.
export function dateClash(schedule, iso) {
  const list = [];
  for (const offset of [-1, 0, 1]) {
    for (const s of showsForDate(schedule, addDays(iso, offset))) {
      list.push({ id: s.id, from: offset * 1440 + mins(s.start), to: offset * 1440 + mins(s.end) });
    }
  }
  list.sort((a, b) => a.from - b.from);
  for (let i = 1; i < list.length; i++) {
    if (list[i].from < list[i - 1].to) return [list[i - 1].id, list[i].id];
  }
  return null;
}
