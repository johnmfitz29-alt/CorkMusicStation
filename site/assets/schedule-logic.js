/* Dates, one-off schedule changes and poster hiding. No page drawing happens here,
   so the build check and tests can use exactly the same rules as the site. */
(function (root) {
  "use strict";
  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* The date and time in Ireland at a given moment, correct across clock changes. */
  function irishParts(date) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Dublin", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    var h = parseInt(p.hour, 10) % 24, m = parseInt(p.minute, 10);
    return {
      iso: p.year + "-" + p.month + "-" + p.day,
      day: DAYS.indexOf(p.weekday),
      minutes: h * 60 + m,
      label: pad(h) + ":" + pad(m)
    };
  }

  function isoToUTC(iso) {
    var a = iso.split("-");
    return Date.UTC(+a[0], +a[1] - 1, +a[2]);
  }
  function addDays(iso, n) {
    return new Date(isoToUTC(iso) + n * 86400000).toISOString().slice(0, 10);
  }
  /* 0 is Monday, as in DAYS. */
  function weekdayOf(iso) {
    return (new Date(isoToUTC(iso)).getUTCDay() + 6) % 7;
  }
  function mins(t) {
    var p = t.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function byStart(a, b) { return mins(a.start) - mins(b.start); }
  function copy(o, extra) {
    var out = {}, k;
    for (k in o) out[k] = o[k];
    for (k in extra) out[k] = extra[k];
    return out;
  }

  /* The shows on a date. A show past midnight belongs to the date it starts on,
     so Thursday's 12.00 to 2.00 am belongs to Thursday. */
  function showsForDate(schedule, iso) {
    var day = schedule.weekly[weekdayOf(iso)];
    var shows = day ? day.shows.slice() : [];
    (schedule.oneOffs || []).forEach(function (o) {
      if (o.date !== iso) return;
      var i = -1;
      shows.forEach(function (s, n) { if (s.id === o.showId) i = n; });
      if (o.type === "off" && i >= 0) {
        shows.splice(i, 1);
      } else if (o.type === "move" && i >= 0) {
        var moved = copy(shows[i], { start: o.start, end: o.end, time: o.time });
        if (o.late) moved.late = true; else delete moved.late;
        shows[i] = moved;
      } else if (o.type === "add" && o.show) {
        shows.push(o.show);
      }
    });
    return shows.sort(byStart);
  }

  /* Every show from yesterday (it may still be running after midnight) to a week ahead,
     as minutes counted from the start of today. */
  function occurrences(schedule, now) {
    var list = [];
    for (var offset = -1; offset <= 7; offset++) {
      var iso = addDays(now.iso, offset);
      showsForDate(schedule, iso).forEach(function (s) {
        if (!s.start || !s.end) return;
        list.push({
          s: s, day: DAYS[weekdayOf(iso)], date: iso,
          from: offset * 1440 + mins(s.start), to: offset * 1440 + mins(s.end)
        });
      });
    }
    return list.sort(function (a, b) { return a.from - b.from; });
  }

  function current(schedule, now) {
    var on = null, next = null;
    occurrences(schedule, now).forEach(function (x) {
      if (now.minutes >= x.from && now.minutes < x.to) on = x;
      if (!next && x.from > now.minutes) next = x;
    });
    return { on: on, next: next };
  }

  /* Monday to Sunday, each showing its next date from today onwards. */
  function weekView(schedule, now) {
    return DAYS.map(function (name, i) {
      var iso = addDays(now.iso, (i - now.day + 7) % 7);
      return { day: name, date: iso, shows: showsForDate(schedule, iso) };
    });
  }

  /* Soonest gig first, "no end date" after those, undated last. Past gigs are left out. */
  function visiblePosters(posters, todayIso) {
    function rank(p) { return p.lastDate ? 0 : p.noEnd ? 1 : 2; }
    return posters
      .map(function (p, i) { return { p: p, i: i }; })
      .filter(function (x) { return !x.p.lastDate || x.p.lastDate >= todayIso; })
      .sort(function (a, b) {
        return (rank(a.p) - rank(b.p)) ||
          (a.p.lastDate && b.p.lastDate && a.p.lastDate !== b.p.lastDate ? (a.p.lastDate < b.p.lastDate ? -1 : 1) : 0) ||
          (a.i - b.i);
      })
      .map(function (x) { return x.p; });
  }

  root.CMS_LOGIC = {
    DAYS: DAYS, irishParts: irishParts, addDays: addDays, weekdayOf: weekdayOf, mins: mins,
    showsForDate: showsForDate, occurrences: occurrences, current: current,
    weekView: weekView, visiblePosters: visiblePosters
  };
})(window);
