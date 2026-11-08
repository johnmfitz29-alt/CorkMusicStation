(function () {
  "use strict";
  var cfg = window.CONFIG || {};
  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var WEEK = 7 * 1440;
  var rotatorTimer = null;

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function emailLink() {
    return '<a href="mailto:' + esc(cfg.email) + '">' + esc(cfg.email) + "</a>";
  }
  function linkContact(text) {
    return esc(text)
      .replace("{email}", emailLink())
      .replace(/\b(08\d) (\d{7})\b/g, function (m, a, b) {
        return '<a href="tel:+353' + a.slice(1) + b + '">' + m + "</a>";
      });
  }

  /* ---------- Radio: stays playing while visitors move between pages ---------- */
  var radio = {
    audio: el("radio"), btn: el("listen"), text: el("listen-text"), status: el("radio-status"),
    on: false, waiting: false
  };
  var MSG_OFF = "The station is off air or cannot be reached at the moment. Try again in a few minutes.";
  var MSG_NONE = "The live stream address has not been added to this website yet.";

  function remember(v) {
    try { if (v) sessionStorage.setItem("cms-stopped", "1"); else sessionStorage.removeItem("cms-stopped"); } catch (e) {}
  }
  function wasStopped() {
    try { return sessionStorage.getItem("cms-stopped") === "1"; } catch (e) { return false; }
  }
  function say(t) { radio.status.textContent = t; }
  function showPlaying(p) {
    radio.text.textContent = p ? "Stop" : "Listen live";
    radio.btn.classList.toggle("playing", p);
  }
  function disarm() {
    radio.waiting = false;
    document.removeEventListener("pointerdown", firstTouch, true);
    document.removeEventListener("keydown", firstTouch, true);
  }
  function firstTouch(e) {
    if (radio.btn.contains(e.target)) return; /* The Listen button does its own starting */
    disarm();
    startRadio(false);
  }
  function arm() {
    if (radio.waiting) return;
    radio.waiting = true;
    document.addEventListener("pointerdown", firstTouch, true);
    document.addEventListener("keydown", firstTouch, true);
  }
  function startRadio(auto) {
    if (!cfg.streamUrl) { if (!auto) say(MSG_NONE); return; }
    say("Connecting to the station...");
    radio.on = true;
    showPlaying(true);
    document.querySelectorAll("main audio").forEach(function (a) { a.pause(); });
    radio.audio.src = cfg.streamUrl;
    var p = radio.audio.play();
    if (p && p.catch) p.catch(function (e) {
      radio.on = false;
      showPlaying(false);
      if (e.name === "NotAllowedError") { say("Tap anywhere to start the music."); arm(); }
      else if (e.name !== "AbortError") { say(MSG_OFF); }
    });
  }
  function stopRadio(silent) {
    radio.on = false;
    radio.audio.pause();
    radio.audio.removeAttribute("src");
    radio.audio.load();
    showPlaying(false);
    say(silent ? "" : "Stopped.");
    remember(true);
  }
  radio.btn.addEventListener("click", function () {
    disarm();
    if (radio.on) { stopRadio(false); } else { remember(false); startRadio(false); }
  });
  radio.audio.addEventListener("playing", function () { if (radio.on) say("Playing live."); });
  radio.audio.addEventListener("waiting", function () { if (radio.on) say("Waiting for the station..."); });
  radio.audio.addEventListener("error", function () {
    if (!radio.on) return;
    radio.on = false; showPlaying(false); say(MSG_OFF);
  });

  /* ---------- Irish time, correct across clock changes ---------- */
  function irishNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Dublin", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var h = parseInt(parts.hour, 10) % 24, m = parseInt(parts.minute, 10);
    var d = DAYS.indexOf(parts.weekday);
    return { day: d, label: parts.hour.replace("24", "00") + ":" + parts.minute, week: d * 1440 + h * 60 + m };
  }
  function localLabel() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function mins(t) { var p = t.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function allShows() {
    var list = [];
    (window.SCHEDULE || []).forEach(function (d) {
      var di = DAYS.indexOf(d.day);
      d.shows.forEach(function (s) {
        if (!s.start || !s.end) return;
        list.push({ s: s, day: d.day, from: di * 1440 + mins(s.start), to: di * 1440 + mins(s.end) });
      });
    });
    return list.sort(function (a, b) { return a.from - b.from; });
  }
  function current() {
    var now = irishNow().week, list = allShows(), on = null, next = null;
    list.forEach(function (x) {
      if ((now >= x.from && now < x.to) || (now + WEEK >= x.from && now + WEEK < x.to)) on = x;
    });
    for (var i = 0; i < list.length; i++) { if (list[i].from > now) { next = list[i]; break; } }
    return { on: on, next: next || list[0] || null };
  }
  function showName(x) { return esc(x.s.presenter) + (x.s.show ? ": " + esc(x.s.show) : ""); }
  function repeatTag(x) { return x.s.repeat ? '<span class="tag">Repeat</span>' : ""; }

  function renderOnAir() {
    var box = el("onair");
    if (!box || !window.SCHEDULE) return;
    var c = current();
    /* The 24/7 line appears in the panel when no show is on, so it is not repeated above it */
    if (el("tagline")) el("tagline").classList.toggle("sr", !c.on);
    var html = (c.on ? '<img class="onair-photo" src="' + esc(c.on.s.photo) + '" alt="' + esc(c.on.s.presenter) + '">' : "") +
      '<div class="now"><p class="label"><span class="tag tag-air">On air now</span></p>';
    if (c.on) {
      html += '<p class="who">' + showName(c.on) + repeatTag(c.on) + "</p><p>" + esc(c.on.s.time) + "</p>";
    } else {
      html += '<p class="who">Music On ' + esc(cfg.stationName) + " 24/7</p>";
    }
    html += '<p class="clocks"><span>Irish time: <b>' + irishNow().label + "</b></span><span>Your time: <b>" + esc(localLabel()) + "</b></span></p></div>";
    if (c.next) {
      html += '<div class="next"><p class="label">Next</p><p class="next-who">' + showName(c.next) + repeatTag(c.next) +
        "</p><p>" + esc(c.next.day) + ", " + esc(c.next.s.time) + "</p></div>";
    }
    box.classList.toggle("has-photo", !!c.on);
    /* Only redraw when something changed, so the photo doesn't flicker */
    if (box.dataset.drawn !== html) { box.innerHTML = html; box.dataset.drawn = html; }
  }

  function renderToday() {
    var box = el("today");
    if (!box || !window.SCHEDULE) return;
    var day = window.SCHEDULE[irishNow().day];
    box.innerHTML = "<h2>" + esc(day.day) + "'s shows</h2>" + day.shows.map(function (s) {
      return '<div class="today-row"><img src="' + esc(s.photo) + '" alt="' + esc(s.presenter) + '" loading="lazy"><div>' +
        '<p class="name">' + esc(s.presenter) + (s.repeat ? '<span class="tag">Repeat</span>' : "") + "</p>" +
        (s.show ? "<p>" + esc(s.show) + "</p>" : "") + "<p>" + esc(s.time) + "</p></div></div>";
    }).join("") + '<p style="margin-top:14px"><a href="dj-schedule.html">See the full schedule</a></p>';
  }

  function renderSchedule() {
    var box = el("schedule");
    if (!box) return;
    var today = DAYS[irishNow().day], c = current(), jump = "", html = "";
    window.SCHEDULE.forEach(function (d) {
      var isToday = d.day === today;
      jump += '<a href="#' + d.day + '"' + (isToday ? ' class="today"' : "") + ">" + d.day + (isToday ? " (today)" : "") + "</a>";
      html += '<section class="day" id="' + d.day + '"><h2>' + d.day + "</h2>";
      d.shows.forEach(function (s) {
        var on = c.on && c.on.s === s;
        html += '<article class="show' + (on ? " on-air" : "") + '"><img src="' + esc(s.photo) + '" alt="' + esc(s.presenter) + '" loading="lazy"><div>' +
          (on ? '<p><span class="tag tag-air">On air now</span></p>' : "") +
          "<h3>" + esc(s.presenter) + "</h3>" +
          (s.show || s.repeat ? "<p>" + esc(s.show || "") + (s.repeat ? '<span class="tag">Repeat</span>' : "") + "</p>" : "") +
          '<p class="time">' + esc(s.time) + "</p><p>" + linkContact(s.contact) + "</p></div></article>";
      });
      html += "</section>";
    });
    el("day-jump").innerHTML = jump;
    box.innerHTML = html;
  }

  function renderPosters() {
    var box = el("posters");
    if (!box) return;
    var total = window.POSTERS.length;
    box.innerHTML = window.POSTERS.map(function (p, i) {
      var name = "Gig poster " + (i + 1) + " of " + total;
      return '<a href="' + esc(p.file) + '" target="_blank" rel="noopener"><img src="' + esc(p.file) + '" width="' + p.w + '" height="' + p.h + '" alt="' + name + '" loading="lazy"><span>Open full size</span></a>';
    }).join("");
  }

  function renderArchives() {
    var box = el("archives");
    if (!box) return;
    var html = "", filters = '<button type="button" data-f="" aria-pressed="true">Everyone</button>';
    window.INTERVIEWS.forEach(function (g) {
      filters += '<button type="button" data-f="' + esc(g.presenter) + '" aria-pressed="false">' + esc(g.presenter) + "</button>";
      html += '<section class="group" data-p="' + esc(g.presenter) + '"><div class="group-head"><img src="' + esc(g.photo) + '" alt="' + esc(g.presenter) + '" loading="lazy"><h2>' + esc(g.heading) + "</h2></div>";
      g.items.forEach(function (it) {
        var url = "audio/" + encodeURIComponent(it.file);
        html += '<article class="item"><h3>' + esc(it.title) + '</h3><audio controls preload="none" src="' + url + '"></audio><a class="btn" href="' + url + '" download>Download this interview</a></article>';
      });
      html += "</section>";
    });
    el("filters").innerHTML = filters;
    box.innerHTML = html;
    el("filters").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      el("filters").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      box.querySelectorAll(".group").forEach(function (s) { s.hidden = !!b.dataset.f && s.dataset.p !== b.dataset.f; });
    });
    /* One sound at a time: an interview stops the radio and any other interview */
    box.addEventListener("play", function (e) {
      if (radio.on) stopRadio(true);
      disarm();
      box.querySelectorAll("audio").forEach(function (a) { if (a !== e.target) a.pause(); });
    }, true);
  }

  function renderGallery() {
    var box = el("gallery");
    if (!box) return;
    var lb = el("lightbox"), img = el("lb-photo"), cap = el("lb-caption"), album = null, idx = 0;
    function titleHtml(t) {
      var out = esc(t), links = window.GALLERY_LINKS || {};
      Object.keys(links).forEach(function (k) {
        out = out.replace(esc(k), '<a href="' + esc(links[k]) + '" target="_blank" rel="noopener">' + esc(k) + "</a>");
      });
      return out;
    }
    function show() {
      var p = album.photos[idx];
      img.src = p.src;
      img.alt = "Photo from " + album.title + ", " + (idx + 1) + " of " + album.photos.length;
      cap.textContent = "Photo " + (idx + 1) + " of " + album.photos.length + ": " + album.title;
    }
    function move(n) { idx = (idx + n + album.photos.length) % album.photos.length; show(); }
    function fill(d, a, ai) {
      if (d.dataset.filled) return;
      d.dataset.filled = "1";
      d.querySelector(".grid").innerHTML = a.photos.map(function (p, i) {
        return '<button type="button" data-a="' + ai + '" data-i="' + i + '"><img src="' + esc(p.thumb) + '" alt="Photo from ' + esc(a.title) + ", " + (i + 1) + " of " + a.photos.length + '" loading="lazy" width="' + p.w + '" height="' + p.h + '"></button>';
      }).join("");
    }
    box.innerHTML = window.GALLERY.map(function (a, i) {
      return '<details class="album"' + (i === 0 ? " open" : "") + "><summary>" + titleHtml(a.title) + "<small>" + a.photos.length + " photos</small></summary><div class=\"grid\"></div></details>";
    }).join("");
    box.querySelectorAll("details").forEach(function (d, i) {
      if (d.open) fill(d, window.GALLERY[i], i);
      d.addEventListener("toggle", function () { if (d.open) fill(d, window.GALLERY[i], i); });
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-a]");
      if (!b) return;
      album = window.GALLERY[+b.dataset.a]; idx = +b.dataset.i;
      show();
      lb.showModal();
    });
    el("lb-close").addEventListener("click", function () { lb.close(); });
    el("lb-prev").addEventListener("click", function () { move(-1); });
    el("lb-next").addEventListener("click", function () { move(1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 60) move(dx < 0 ? 1 : -1);
    });
    lb.addEventListener("close", function () { img.removeAttribute("src"); });
  }

  function renderRotator() {
    clearInterval(rotatorTimer); rotatorTimer = null;
    var box = el("rotator");
    if (!box || !window.HOME_PHOTOS || !window.HOME_PHOTOS.length) return;
    var pics = window.HOME_PHOTOS, i = 0, img = el("rot-img"), btn = el("rot-pause");
    function set() { img.src = pics[i].src; }
    function step(n) { i = (i + n + pics.length) % pics.length; set(); }
    function stop() { clearInterval(rotatorTimer); rotatorTimer = null; btn.textContent = "Play slideshow"; }
    function start() { rotatorTimer = setInterval(function () { step(1); }, 6000); btn.textContent = "Pause slideshow"; }
    set();
    el("rot-prev").addEventListener("click", function () { stop(); step(-1); });
    el("rot-next").addEventListener("click", function () { stop(); step(1); });
    btn.addEventListener("click", function () { if (rotatorTimer) stop(); else start(); });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) stop(); else start();
  }

  function initPage() {
    document.querySelectorAll("[data-cfg=stationName]").forEach(function (n) { n.textContent = cfg.stationName; });
    document.querySelectorAll("[data-cfg=email]").forEach(function (n) {
      n.textContent = cfg.email;
      n.href = "mailto:" + cfg.email;
    });
    renderOnAir();
    renderToday();
    renderSchedule();
    renderPosters();
    renderArchives();
    renderGallery();
    renderRotator();
  }

  /* ---------- Moving between pages without stopping the radio. Addresses stay the same. ---------- */
  var loaded = {};
  document.querySelectorAll("script[src]").forEach(function (s) { loaded[s.getAttribute("src")] = true; });
  var currentPath = location.pathname;

  function loadScript(src) {
    if (loaded[src]) return Promise.resolve();
    return new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = src; s.onload = function () { loaded[src] = true; ok(); }; s.onerror = fail;
      document.body.appendChild(s);
    });
  }
  function go(url, push) {
    return fetch(url).then(function (r) { return r.text(); }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, "text/html");
      var fresh = doc.querySelector("main");
      if (!fresh) throw new Error("No page content");
      var needs = Array.prototype.map.call(doc.querySelectorAll('script[src^="data/"]'), function (s) { return s.getAttribute("src"); });
      return Promise.all(needs.map(loadScript)).then(function () {
        var main = document.querySelector("main");
        main.replaceWith(document.adoptNode(fresh));
        document.title = doc.title;
        var d = doc.querySelector('meta[name="description"]'), here = document.querySelector('meta[name="description"]');
        if (d && here) here.content = d.content;
        document.querySelector(".nav").innerHTML = doc.querySelector(".nav").innerHTML;
        if (push) history.pushState(null, "", url);
        currentPath = location.pathname;
        initPage();
        var target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
        if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
        document.querySelector("main").focus({ preventScroll: true });
      });
    }).catch(function () { location.href = url; });
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download")) return;
    var u = new URL(a.href);
    if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.hash) return;
    e.preventDefault();
    go(u.href, true);
  });
  window.addEventListener("popstate", function () {
    if (location.pathname !== currentPath) go(location.href, false);
  });

  initPage();
  setInterval(renderOnAir, 10000);
  if (cfg.autoplay && cfg.streamUrl && !wasStopped()) startRadio(true);
  window.CMS = { current: current, showName: showName };
})();
