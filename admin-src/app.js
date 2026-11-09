(function () {
  "use strict";

  /* Every sentence he reads lives here, so the wording can be checked in one place. */
  var WORDS = /*WORDS-START*/{
    home: "What would you like to do?",
    poster: "Add Gig Poster",
    photos: "Add Photos",
    schedule: "Change Schedule",
    homePhotos: "Home Page Photos",
    undo: "Undo",
    back: "Back",
    goHome: "Back to the start",
    putItOn: "Put It On The Website",
    loading: "One moment…",
    undoTitle: "Undo",
    undoIntro: "Tap the change you want to take back.",
    undoNone: "There are no changes to take back yet.",
    undoThis: "Take this back",
    askJohn: "Ask John about this one",
    undoCheck: "This will take back the change below.",
    sending: "Putting it on the website. Please wait…",
    checking: "Nearly there. Checking the website. This can take a minute or two…",
    done: "It's on the website.",
    failed: "Nothing is broken. The old page is still there, and John has been told.",
    tryLater: "The internet seems to have dropped. Your work is kept. Please try again later.",
    busy: "The website is busy just now. Your work is kept. Please try again in a few minutes.",
    signIn: "You need to sign in again. Your work is kept.",
    signInButton: "Sign in",
    tryAgain: "Try again",
    otherWindow: "This is already open in another window. Please use that one, or close it and tap below.",
    helpCheck: "Would you like John to help?",
    helpYes: "Yes, tell John",
    helpSent: "John has been told and will be in touch.",
    helpFailed: "That didn't get through. Please phone John.",
    posterTitle: "Add Gig Poster",
    posterNew: "Add a new poster",
    posterCurrent: "Posters on the website now",
    posterEnds: "Last gig:",
    posterNoEnd: "No end date",
    posterDown: "Take this one down",
    posterDownCheck: "This takes this poster off the website.",
    posterGone: "Past gig, already hidden",
    choose: "Choose a picture",
    chooseHelp: "Choose a photo or a PDF of the poster from your computer.",
    reading: "Opening the picture…",
    pageTitle: "Which page is the poster?",
    pageLabel: "Page",
    turnTitle: "Is it the right way up?",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    rightWayUp: "Yes, it's the right way up",
    dateTitle: "When is the last gig on this poster?",
    dateLabel: "Date of the last gig",
    dateNext: "Next",
    dateOpen: "This poster has no end date",
    dateNeeded: "Please choose the date of the last gig, or tap \"This poster has no end date\".",
    datePast: "That date has already gone by. Please choose the day of the last gig.",
    dupTitle: "You've already put this one up",
    dupNew: "The new one",
    dupOld: "Already on the website",
    dupKeep: "They're different, keep it",
    dupSkip: "Leave it out",
    tooSmall: "This picture is too small to read on the website. Is there a bigger copy?",
    cannotOpen: "That file can't be opened as a picture. Please choose a photo or a PDF.",
    tooLarge: "That file is too big to open. Is there a smaller copy?",
    pdfLocked: "That PDF is locked with a password, so it can't be opened.",
    pdfEmpty: "That PDF has no pages in it.",
    saidEnds: "Gig poster. Last gig: ",
    saidThen: ". It comes off the website after that day.",
    saidOpen: "Gig poster with no end date. It stays up until it's taken down.",
    carryPoster: "You were adding a poster. Carry on?",
    carryYes: "Yes, carry on",
    carryNo: "No, start again",
    duplicate: "That exact picture is already on the website, so it hasn't been added again.",
    photosTitle: "Add Photos",
    photosIntro: "Which event are these photos from?",
    newEvent: "New event",
    eventName: "What is the event called?",
    eventHint: "For example: Paddy O'Brien, or Glór Tíre Final",
    venueName: "Where was it?",
    venueHint: "For example: Hazel Tree Mallow",
    whenName: "When was it?",
    month: "Month",
    year: "Year",
    needText: "Please type something in the box first.",
    badText: "Please use only letters, numbers and ordinary punctuation.",
    tooLong: "That's a bit long. Please shorten it.",
    albumExists: "There's already an event with that name. Please go back and choose it from the list.",
    didYouMean: "Did you mean…",
    keepTyped: "No, keep what I typed:",
    isNewTitle: "This is a new name.",
    isNewCheck: "Is this spelled the way you want it?",
    isNewYes: "Yes, that's right",
    isNewNo: "No, let me change it",
    choosePhotos: "Choose the photos",
    choosePhotosHelp: "You can choose up to 60 at a time.",
    firstSixty: "That's a lot of photos. Let's do the first 60, then the rest.",
    gettingReady: "Getting photos ready: ",
    of: " of ",
    checkingPhotos: "Checking these against the photos already on the website…",
    reviewTitle: "Here are your photos",
    reviewHelp: "Tap Remove on any you don't want. Tap Use as cover for the one that should go first.",
    remove: "Remove",
    useCover: "Use as cover",
    isCover: "This is the cover",
    keepGoing: "These are right",
    addMore: "Add more photos",
    noneLeft: "There are no photos left. Please choose some more.",
    skippedSmall: " too small to use.",
    skippedBad: " couldn't be opened.",
    dupPhotos: "These look like photos already on the website. They've been left out.",
    keepThis: "They're different, keep it",
    saidPhotos1: "Add ",
    saidPhotos2: " photos to: ",
    saidPhoto2: " photo to: ",
    sendingPhotos: "Sending photos: ",
    carryPhotos: "You were adding photos. Carry on?",
    carryChange: "You were part-way through this change. Carry on?",
    takeDownPhotos: "Take down photos",
    takeDownWhich: "Which event?",
    takeDownOne: "Take this one down",
    takeDownAlbum: "Take down the whole event",
    saidTakeOne: "This takes one photo off the website, from: ",
    saidTakeAll1: "This takes all ",
    saidTakeAll2: " photos off the website, from: ",
    onHome: "That photo is on the home page. Please take it off the home page first.",
    clashNow: "That time has just been taken by another show. Please go back and choose another time.",
    scheduleTitle: "Change Schedule",
    scheduleIntro: "Tap a show, or add a new one.",
    addShowOn: "Add a new show on ",
    whatChanges: "What would you like to change?",
    diffTime: "A different time",
    noShow: "No show this time",
    howLong: "Just this week, or every week?",
    justThisWeek: "Just this week",
    otherDate: "Just one other date",
    everyWeek: "Every week",
    chooseDate: "Which date?",
    wrongDay: "That date isn't a ",
    pickStart: "It starts at",
    pickEnd: "It finishes at",
    lateFinish: "Late, no fixed time",
    finishes: "finishes ",
    morningAt: " morning at ",
    clashed: "That clashes with another show.",
    nearest: "The nearest free time starts at ",
    useNearest: "Use that time",
    finishBefore: "The finish has to be after the start.",
    presenterName: "Who is presenting?",
    presenterHint: "Type the presenter's name",
    isRepeat: "Is this a repeat?",
    yes: "Yes",
    no: "No",
    presenterPhoto: "Please choose a photo of this presenter",
    onDay: " at ",
    forDate: "Just on ",
    eachWeek: "Every week.",
    onlyWeek: "Just this week, on ",
    saidOff: "No show: ",
    saidFinish: ", finishing ",
    saidLate: ", finishing late",
    homeTitle: "Home Page Photos",
    homeIntro: "These photos take turns on the home page.",
    homeAdd: "Add a photo from an event",
    homeWhich: "Which event?",
    homePick: "Tap a photo to add it.",
    homeAdded: "Added",
    homeNeed: "The home page needs at least 3 photos.",
    homeNext: "These are right",
    saidHome1: "The home page will show these ",
    saidHome2: " photos."
  }/*WORDS-END*/;

  var main = document.getElementById("main");
  var DONE_WAIT_MS = 600000;
  var current = "home";
  var lockHeld = false;

  function make(tag, props, parent) {
    var n = document.createElement(tag), k;
    for (k in props) n[k] = props[k];
    if (parent) parent.appendChild(n);
    return n;
  }
  function screen(title) {
    main.textContent = "";
    if (title) make("h1", { textContent: title }, main);
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return main;
  }
  function button(text, parent, action, cls) {
    var b = make("button", { type: "button", textContent: text, className: cls || "" }, parent);
    if (action) b.addEventListener("click", action);
    return b;
  }
  function backTo(action) {
    var box = make("div", { className: "back" }, main);
    button(WORDS.back, box, action, "plain");
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function newId() {
    var a = new Uint8Array(12);
    crypto.getRandomValues(a);
    return "chg-" + Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }

  /* Tells apart "the internet dropped" and "the sign-in ran out", because he is told different things. */
  function call(path, options) {
    return fetch("/api/admin/" + path, Object.assign({ redirect: "manual", cache: "no-store" }, options || {})).then(function (r) {
      if (r.type === "opaqueredirect" || r.status === 401) return { signIn: true };
      return r.json().catch(function () { return { ok: false, code: "try_later" }; });
    }, function () { return { offline: true }; });
  }
  function send(path, value) {
    return call(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
  }
  function tell(details) { return send("notify", { type: "failed", details: details }); }

  function showSignIn() {
    screen();
    make("p", { textContent: WORDS.signIn, className: "readback" }, main);
    button(WORDS.signInButton, main, function () { location.reload(); });
  }
  function showRetry(message, again, back) {
    screen();
    make("p", { textContent: message, className: "readback" }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.tryAgain, box, again);
    button(WORDS.back, box, back, "plain");
  }

  /* The ending every task shares. The change has one ID however many times he tries, so it can only happen once. */
  function finish(sentence, path, makeBody, back, opts) {
    opts = opts || {};
    var id = opts.id || newId();
    function ready() {
      screen();
      if (opts.preview) opts.preview(main);
      make("p", { textContent: sentence, className: "readback" }, main);
      var go = button(WORDS.putItOn, main, function () {
        go.disabled = true;
        attempt();
      }, "go");
      backTo(back);
    }
    function attempt() {
      screen();
      make("p", { textContent: WORDS.sending, className: "readback", id: "progress" }, main);
      function stopped(r) {
        if (r.signIn) { showSignIn(); return true; }
        if (r.offline) { showRetry(WORDS.tryLater, attempt, ready); return true; }
        if (r.code === "busy" || r.code === "slow_down") { showRetry(WORDS.busy, attempt, ready); return true; }
        var refused = { on_home_page: WORDS.onHome, clash: WORDS.clashNow }[r.code];
        if (refused) {
          screen();
          make("p", { textContent: refused, className: "readback" }, main);
          backTo(back);
          return true;
        }
        if (r.code === "duplicate") {
          screen();
          make("p", { textContent: WORDS.duplicate, className: "readback" }, main);
          if (opts.done) opts.done();
          button(WORDS.goHome, main, home);
          return true;
        }
        if (!r.ok) {
          tell(path + " stopped: " + r.code + " " + sentence);
          failed();
          return true;
        }
        return false;
      }
      (opts.prepare ? opts.prepare(id) : Promise.resolve({ ok: true })).then(function (ready2) {
        if (stopped(ready2)) return null;
        return send(path, makeBody(id, ready2)).then(function (r) {
          if (!stopped(r)) confirmLive(id);
        });
      });
    }
    function confirmLive(changeId) {
      document.getElementById("progress").textContent = WORDS.checking;
      var began = Date.now();
      (function poll() {
        call("confirm?id=" + changeId).then(function (r) {
          if (r.live) return succeeded();
          if (Date.now() - began > DONE_WAIT_MS) {
            tell("Not live after 10 minutes: " + sentence);
            return failed();
          }
          wait(6000).then(poll);
        });
      })();
    }
    function succeeded() {
      if (opts.done) opts.done();
      screen();
      make("p", { textContent: WORDS.done, className: "readback" }, main);
      button(WORDS.goHome, main, home);
    }
    function failed() {
      screen();
      make("p", { textContent: WORDS.failed, className: "readback" }, main);
      button(WORDS.goHome, main, home);
    }
    ready();
  }

  /* "Tuesday 3.15 pm", in Irish time whatever the computer's clock says. */
  function whenText(iso) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Dublin", weekday: "long", hour: "numeric", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(iso)).forEach(function (x) { p[x.type] = x.value; });
    var h = parseInt(p.hour, 10), twelve = h % 12 === 0 ? 12 : h % 12;
    return p.weekday + " " + twelve + "." + p.minute + (h < 12 ? " am" : " pm");
  }

  function undoScreen() {
    current = "undo";
    screen(WORDS.undoTitle);
    make("p", { textContent: WORDS.loading }, main);
    call("changes").then(function (r) {
      if (r.signIn) return showSignIn();
      if (r.offline || !r.ok) return showRetry(WORDS.tryLater, undoScreen, home);
      showPractice(r.practice);
      screen(WORDS.undoTitle);
      make("p", { textContent: r.changes.length ? WORDS.undoIntro : WORDS.undoNone }, main);
      r.changes.forEach(function (c) {
        var box = make("div", { className: "entry" }, main);
        var label = whenText(c.at) + ": " + c.summary;
        make("p", { textContent: label, className: "note" }, box);
        if (c.canUndo) {
          button(WORDS.undoThis, box, function () {
            finish(WORDS.undoCheck + " " + label, "undo", function (id) { return { changeId: id, target: c.id }; }, undoScreen);
          }, "plain");
        } else {
          make("p", { textContent: WORDS.askJohn }, box);
        }
      });
      backTo(home);
    });
  }

  /* ---------- Saved work: survives a crash or a closed window ---------- */
  var drafts = {
    open: function () {
      return new Promise(function (ok, no) {
        var r = indexedDB.open("cms-admin", 1);
        r.onupgradeneeded = function () { r.result.createObjectStore("d"); };
        r.onsuccess = function () { ok(r.result); };
        r.onerror = function () { no(r.error); };
      });
    },
    run: function (mode, work) {
      return drafts.open().then(function (db) {
        return new Promise(function (ok, no) {
          var t = db.transaction("d", mode), req = work(t.objectStore("d"));
          t.oncomplete = function () { ok(req.result); };
          t.onerror = t.onabort = function () { no(t.error); };
        });
      }).catch(function () { return undefined; });
    },
    get: function () { return drafts.run("readonly", function (s) { return s.get("current"); }); },
    set: function (v) { return drafts.run("readwrite", function (s) { return s.put(v, "current"); }); },
    clear: function () { return drafts.run("readwrite", function (s) { return s.delete("current"); }); }
  };

  /* ---------- Opening pictures, all done here in the browser ---------- */
  var MAX_FILE = 80 * 1024 * 1024, WORK_SIDE = 2400, FINAL_SIDE = 1600, MAX_BASE64 = 700000, POSTER_MIN = 800;
  var VENDOR = "/assets/vendor/";

  function problem(word) { var e = new Error(word); e.word = word; return e; }
  function canvasOf(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function fit(w, h, side) { var s = Math.min(1, side / Math.max(w, h)); return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))]; }
  function drawn(source, w, h, side) {
    var size = fit(w, h, side), c = canvasOf(size[0], size[1]), x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(source, 0, 0, c.width, c.height);
    c.originalLong = Math.max(w, h);
    return c;
  }
  function kindOf(bytes) {
    var head = String.fromCharCode.apply(null, bytes.subarray(0, 12));
    if (head.slice(0, 5) === "%PDF-") return "pdf";
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image";
    if (head.slice(1, 4) === "PNG") return "image";
    if (head.slice(4, 8) === "ftyp" && /^(heic|heix|hevc|hevx|mif1|msf1)/.test(head.slice(8, 12))) return "heic";
    return null;
  }
  function openImage(file) {
    return createImageBitmap(file, { imageOrientation: "from-image" }).then(function (b) {
      return drawn(b, b.width, b.height, WORK_SIDE);
    }, function () { throw problem(WORDS.cannotOpen); });
  }
  function openHeic(bytes) {
    return import(VENDOR + "libheif-bundle.mjs").then(function (m) {
      var lib = typeof m.default === "function" ? m.default() : m.default;
      var images = new lib.HeifDecoder().decode(bytes);
      if (!images || !images.length) throw problem(WORDS.cannotOpen);
      var img = images[0], w = img.get_width(), h = img.get_height();
      return new Promise(function (ok, no) {
        var data = new ImageData(w, h);
        img.display(data, function (out) {
          if (!out) return no(problem(WORDS.cannotOpen));
          var c = canvasOf(w, h);
          c.getContext("2d").putImageData(out, 0, 0);
          ok(drawn(c, w, h, WORK_SIDE));
        });
      });
    }).catch(function (e) { throw e.word ? e : problem(WORDS.cannotOpen); });
  }
  function openPdf(bytes) {
    return import(VENDOR + "pdf.min.mjs").then(function (pdfjs) {
      pdfjs.GlobalWorkerOptions.workerSrc = VENDOR + "pdf.worker.min.mjs";
      return pdfjs.getDocument({ data: bytes }).promise;
    }).catch(function (e) {
      throw problem(e && e.name === "PasswordException" ? WORDS.pdfLocked : WORDS.cannotOpen);
    });
  }
  function renderPage(doc, number, side) {
    return doc.getPage(number).then(function (page) {
      var base = page.getViewport({ scale: 1 }), scale = side / Math.max(base.width, base.height);
      var vp = page.getViewport({ scale: scale }), c = canvasOf(Math.ceil(vp.width), Math.ceil(vp.height)), x = c.getContext("2d");
      x.fillStyle = "#fff";
      x.fillRect(0, 0, c.width, c.height);
      return page.render({ canvasContext: x, viewport: vp }).promise.then(function () {
        c.originalLong = Math.max(c.width, c.height);
        return c;
      });
    });
  }
  function turned(canvas, quarter) {
    var q = ((quarter % 4) + 4) % 4, sideways = q % 2 === 1;
    var c = canvasOf(sideways ? canvas.height : canvas.width, sideways ? canvas.width : canvas.height), x = c.getContext("2d");
    x.translate(c.width / 2, c.height / 2);
    x.rotate(q * Math.PI / 2);
    x.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    return c;
  }
  /* Drawing to a canvas leaves behind location and camera details. */
  function jpegText(canvas, side) {
    var c = drawn(canvas, canvas.width, canvas.height, side), text;
    for (var q = 0.85; q > 0.3; q -= 0.07) {
      text = c.toDataURL("image/jpeg", q).split(",")[1];
      if (text.length <= MAX_BASE64) break;
    }
    return text;
  }
  /* A rough fingerprint, so a re-saved or resized copy still matches. */
  function fingerprint(source, w, h) {
    /* The average brightness of a 16 x 16 grid. Measured on the real posters: copies differ by at most 5.4
       (even at half size and poor quality), and different posters by at least 33. */
    var step = source, sw = w, sh = h;
    while (sw > 128 || sh > 128) {
      var nw = Math.max(64, sw >> 1), nh = Math.max(64, sh >> 1), half = canvasOf(nw, nh), hx = half.getContext("2d");
      hx.imageSmoothingQuality = "high";
      hx.drawImage(step, 0, 0, sw, sh, 0, 0, nw, nh);
      step = half; sw = nw; sh = nh;
    }
    var c = canvasOf(64, 64), x = c.getContext("2d", { willReadFrequently: true });
    x.imageSmoothingQuality = "high";
    x.fillStyle = "#fff";
    x.fillRect(0, 0, 64, 64);
    x.drawImage(step, 0, 0, sw, sh, 0, 0, 64, 64);
    var d = x.getImageData(0, 0, 64, 64).data, grid = new Array(256).fill(0);
    for (var y = 0; y < 64; y++) for (var i = 0; i < 64; i++) {
      var p = (y * 64 + i) * 4;
      grid[(y >> 2) * 16 + (i >> 2)] += (d[p] * 0.3 + d[p + 1] * 0.59 + d[p + 2] * 0.11) / 16;
    }
    var mean = grid.reduce(function (a, b) { return a + b; }) / 256;
    return grid.map(function (v) { return v - mean; });
  }
  function sameFingerprint(a, b) {
    var total = 0;
    a.forEach(function (v, i) { total += Math.abs(v - b[i]); });
    return total / 256 <= 12;
  }
  function loadImg(src) {
    return new Promise(function (ok, no) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = no;
      img.src = src;
    });
  }
  function readData(file, name) {
    return fetch("/data/" + file + "?t=" + Date.now(), { cache: "no-store", redirect: "manual" }).then(function (r) {
      if (r.type === "opaqueredirect") return { signIn: true };
      if (!r.ok) return { offline: true };
      return r.text().then(function (text) {
        var m = text.match(new RegExp("window\\." + name + "\\s*=\\s*([\\s\\S]*?);?\\s*$"));
        return { ok: true, value: JSON.parse(m[1]) };
      });
    }, function () { return { offline: true }; });
  }
  function todayIrish() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }
  function dateWords(iso) {
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function shown(canvas, parent, alt) {
    var img = make("img", { src: canvas.toDataURL("image/jpeg", 0.8), alt: alt || "", className: "picture" }, parent);
    return img;
  }

  /* ---------- Add Gig Poster ---------- */
  var poster = null;

  function savePoster() {
    return new Promise(function (ok) { poster.base.toBlob(ok, "image/jpeg", 0.92); }).then(function (blob) {
      return drafts.set({ task: "poster", id: poster.id, blob: blob, quarter: poster.quarter, lastDate: poster.lastDate, noEnd: poster.noEnd, keepDuplicate: poster.keepDuplicate });
    });
  }
  function posterFinal() { return turned(poster.base, poster.quarter); }

  function posterScreen() {
    current = WORDS.posterTitle;
    screen(WORDS.posterTitle);
    make("p", { textContent: WORDS.loading }, main);
    readData("posters.js", "POSTERS").then(function (r) {
      if (r.signIn) return showSignIn();
      if (!r.ok) return showRetry(WORDS.tryLater, posterScreen, home);
      screen(WORDS.posterTitle);
      button(WORDS.posterNew, main, posterChoose);
      if (r.value.length) make("h2", { textContent: WORDS.posterCurrent }, main);
      var today = todayIrish();
      r.value.forEach(function (p) {
        var box = make("div", { className: "entry" }, main);
        make("img", { src: "/" + p.file, alt: "Poster", className: "picture small", loading: "lazy" }, box);
        var ends = p.lastDate ? WORDS.posterEnds + " " + dateWords(p.lastDate) : WORDS.posterNoEnd;
        make("p", { textContent: p.lastDate && p.lastDate < today ? ends + ". " + WORDS.posterGone : ends, className: "note" }, box);
        button(WORDS.posterDown, box, function () {
          finish(WORDS.posterDownCheck + " " + ends + ".", "publish", function (id) {
            return { changeId: id, ops: [{ op: "removePoster", file: p.file }] };
          }, posterScreen, { preview: function (at) { make("img", { src: "/" + p.file, alt: "Poster", className: "picture" }, at); } });
        }, "plain");
      });
      backTo(home);
    });
  }

  function posterChoose() {
    current = WORDS.posterNew;
    screen(WORDS.choose);
    make("p", { textContent: WORDS.chooseHelp }, main);
    var input = make("input", { type: "file", accept: "image/*,.heic,.heif,application/pdf", hidden: true, id: "file" }, main);
    button(WORDS.choose, main, function () { input.click(); });
    backTo(posterScreen);
    input.addEventListener("change", function () { if (input.files[0]) posterOpen(input.files[0]); });
  }

  function posterRefused(word) {
    screen();
    make("p", { textContent: word, className: "readback" }, main);
    button(WORDS.choose, main, posterChoose);
    backTo(posterScreen);
  }

  function posterOpen(file) {
    screen();
    make("p", { textContent: WORDS.reading, className: "readback" }, main);
    if (file.size > MAX_FILE) return posterRefused(WORDS.tooLarge);
    file.arrayBuffer().then(function (buffer) {
      var bytes = new Uint8Array(buffer), kind = kindOf(bytes);
      if (kind === "pdf") {
        return openPdf(bytes).then(function (doc) {
          if (doc.numPages < 1) throw problem(WORDS.pdfEmpty);
          if (doc.numPages === 1) return renderPage(doc, 1, WORK_SIDE).then(posterAccept);
          return posterPages(doc);
        });
      }
      if (kind === "heic") return openHeic(bytes).then(posterAccept);
      if (kind === "image") return openImage(file).then(posterAccept);
      throw problem(WORDS.cannotOpen);
    }).catch(function (e) { posterRefused(e.word || WORDS.cannotOpen); });
  }

  function posterPages(doc) {
    screen(WORDS.pageTitle);
    var box = make("div", { className: "pages" }, main), total = Math.min(doc.numPages, 24), chain = Promise.resolve();
    backTo(posterChoose);
    for (var n = 1; n <= total; n++) {
      (function (number) {
        chain = chain.then(function () { return renderPage(doc, number, 320); }).then(function (thumb) {
          var b = button("", box, function () {
            renderPage(doc, number, WORK_SIDE).then(posterAccept);
          }, "plain");
          shown(thumb, b, WORDS.pageLabel + " " + number);
          make("span", { textContent: WORDS.pageLabel + " " + number }, b);
        });
      })(n);
    }
  }

  function posterAccept(canvas) {
    if (canvas.originalLong < POSTER_MIN) return posterRefused(WORDS.tooSmall);
    poster = { id: newId(), base: canvas, quarter: 0, lastDate: "", noEnd: false, keepDuplicate: false };
    savePoster();
    posterTurn();
  }

  function posterTurn() {
    current = WORDS.turnTitle;
    screen(WORDS.turnTitle);
    var view = shown(posterFinal(), main, "The poster");
    var row = make("div", { className: "row" }, main);
    function spin(by) {
      poster.quarter += by;
      view.src = posterFinal().toDataURL("image/jpeg", 0.8);
      savePoster();
    }
    button(WORDS.turnLeft, row, function () { spin(-1); }, "plain");
    button(WORDS.turnRight, row, function () { spin(1); }, "plain");
    button(WORDS.rightWayUp, main, posterDate);
    backTo(posterChoose);
  }

  function posterDate() {
    current = WORDS.dateTitle;
    screen(WORDS.dateTitle);
    var label = make("label", { textContent: WORDS.dateLabel }, main);
    var input = make("input", { type: "date", min: todayIrish(), value: poster.lastDate }, label);
    var note = make("p", { className: "readback", hidden: true, role: "status" }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.dateNext, box, function () {
      var value = input.value;
      note.hidden = false;
      if (!value) { note.textContent = WORDS.dateNeeded; return; }
      if (value < todayIrish()) { note.textContent = WORDS.datePast; return; }
      poster.lastDate = value;
      poster.noEnd = false;
      savePoster();
      posterDuplicates();
    });
    button(WORDS.dateOpen, box, function () {
      poster.lastDate = "";
      poster.noEnd = true;
      savePoster();
      posterDuplicates();
    }, "plain");
    backTo(posterTurn);
  }

  function posterDuplicates() {
    if (poster.keepDuplicate) return posterReadback();
    screen();
    make("p", { textContent: WORDS.loading, className: "readback" }, main);
    readData("posters.js", "POSTERS").then(function (r) {
      if (r.signIn) return showSignIn();
      if (!r.ok) return showRetry(WORDS.tryLater, posterDuplicates, posterDate);
      var mine = posterFinal(), print = fingerprint(mine, mine.width, mine.height), match = null;
      return r.value.reduce(function (chain, p) {
        return chain.then(function () {
          if (match) return null;
          return loadImg("/" + p.file).then(function (img) {
            if (sameFingerprint(print, fingerprint(img, img.naturalWidth, img.naturalHeight))) match = p;
          }, function () {});
        });
      }, Promise.resolve()).then(function () { match ? posterDuplicate(match) : posterReadback(); });
    });
  }

  function posterDuplicate(old) {
    current = WORDS.dupTitle;
    screen(WORDS.dupTitle);
    var row = make("div", { className: "row" }, main), one = make("div", {}, row), two = make("div", {}, row);
    make("p", { textContent: WORDS.dupNew, className: "note" }, one);
    shown(posterFinal(), one, WORDS.dupNew);
    make("p", { textContent: WORDS.dupOld, className: "note" }, two);
    make("img", { src: "/" + old.file, alt: WORDS.dupOld, className: "picture" }, two);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.dupKeep, box, function () { poster.keepDuplicate = true; savePoster(); posterReadback(); });
    button(WORDS.dupSkip, box, function () { drafts.clear(); poster = null; posterScreen(); }, "plain");
  }

  function posterReadback() {
    var sentence = poster.noEnd ? WORDS.saidOpen : WORDS.saidEnds + dateWords(poster.lastDate) + WORDS.saidThen;
    var final = posterFinal();
    finish(sentence, "publish", function (id, ready) {
      var op = { op: "addPoster", image: ready.receipt };
      if (poster.noEnd) op.noEnd = true; else op.lastDate = poster.lastDate;
      return { changeId: id, ops: [op], allowDuplicate: poster.keepDuplicate };
    }, posterDate, {
      id: poster.id,
      preview: function (at) { shown(final, at, "The poster"); },
      prepare: function (id) {
        return call("upload?kind=poster&change=" + id, { method: "POST", headers: { "content-type": "text/plain" }, body: jpegText(final, FINAL_SIDE) });
      },
      done: function () { drafts.clear(); poster = null; }
    });
  }

  /* ---------- Names: tidy, then the list, then "Did you mean…?" ---------- */
  var namesList = null;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function loadNames() {
    if (namesList) return Promise.resolve({ ok: true });
    return readData("names.js", "NAMES").then(function (r) { if (r.ok) namesList = r.value; return r; });
  }
  function plain(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function capitalWord(w) {
    var low = w.toLocaleLowerCase("en-IE");
    var parts = low.match(/^(o')(.+)$/) || low.match(/^(mc)(.+)$/);
    if (parts) return parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    return low.charAt(0).toUpperCase() + low.slice(1);
  }
  function tidy(text) {
    var s = text.normalize("NFC").replace(/[`´‘’]/g, "'").replace(/\s+/g, " ").trim();
    s = s.replace(/\b([Oo])'\s+(?=\p{L})/gu, "$1'").replace(/\s*,\s*/g, ", ").replace(/[.\s]+$/, "");
    var letters = s.replace(/[^\p{L}]/gu, "");
    if (letters && (letters === letters.toLocaleUpperCase("en-IE") || letters === letters.toLocaleLowerCase("en-IE"))) {
      s = s.split(" ").map(capitalWord).join(" ");
    }
    return s.replace(/\b([Oo]')(\p{Ll})/gu, function (m, o, c) { return o.toUpperCase() + c.toLocaleUpperCase("en-IE"); });
  }
  function distance(a, b) {
    var row = [], i, j;
    for (j = 0; j <= b.length; j++) row[j] = j;
    for (i = 1; i <= a.length; i++) {
      var prev = row[0];
      row[0] = i;
      for (j = 1; j <= b.length; j++) {
        var was = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = was;
      }
    }
    return row[b.length];
  }
  /* Returns what to do with a typed name: use it, offer alternatives, or confirm that it's new. */
  function lookUp(typed, kind) {
    var value = tidy(typed), low = value.toLocaleLowerCase("en-IE");
    var list = namesList[kind].concat(namesList.protected);
    var exact = list.find(function (n) { return n.toLocaleLowerCase("en-IE") === low; });
    if (exact) return { use: exact };
    var offers = [];
    Object.keys(namesList.misspellings).forEach(function (wrong) {
      var at = low.indexOf(wrong.toLocaleLowerCase("en-IE"));
      if (at >= 0) offers.push(value.slice(0, at) + namesList.misspellings[wrong] + value.slice(at + wrong.length));
    });
    var flat = plain(value);
    list.map(function (n) { return { name: n, gap: distance(flat, plain(n)) }; })
      .filter(function (x) { return x.gap <= Math.min(3, Math.floor(flat.length / 4)); })
      .sort(function (a, b) { return a.gap - b.gap; })
      .slice(0, 3)
      .forEach(function (x) { offers.push(x.name); });
    offers = offers.filter(function (o, i) { return offers.indexOf(o) === i && o !== value; });
    return offers.length ? { value: value, offers: offers } : { value: value, isNew: true };
  }
  function nameProblem(text) {
    var s = text.trim();
    if (!s) return WORDS.needText;
    if (s.length > 60) return WORDS.tooLong;
    if (!/^[\p{L}\p{N} '`´‘’&,.\-]+$/u.test(s)) return WORDS.badText;
    return null;
  }
  /* Asks for one name and calls done(name, isNew). */
  function askName(title, hint, kind, initial, done, back) {
    function entry() {
      screen(title);
      make("p", { textContent: hint }, main);
      var input = make("input", { type: "text", value: initial || "", className: "text", autocomplete: "off", spellcheck: false }, main);
      input.setAttribute("aria-label", title);
      var note = make("p", { className: "readback", hidden: true, role: "status" }, main);
      button(WORDS.dateNext, main, function () {
        var bad = nameProblem(input.value);
        if (bad) { note.hidden = false; note.textContent = bad; return; }
        initial = input.value;
        var found = lookUp(input.value, kind);
        if (found.use) return done(found.use, false);
        if (found.offers) return offer(found);
        confirmNew(found.value);
      });
      backTo(back);
      input.focus();
    }
    function offer(found) {
      screen(WORDS.didYouMean);
      var box = make("div", { className: "stack" }, main);
      found.offers.forEach(function (name) { button(name, box, function () { done(name, false); }); });
      make("p", { textContent: WORDS.keepTyped, className: "note" }, box);
      button(found.value, box, function () { confirmNew(found.value); }, "plain");
      backTo(entry);
    }
    function confirmNew(value) {
      screen(WORDS.isNewTitle);
      make("p", { textContent: WORDS.isNewCheck }, main);
      make("p", { textContent: value, className: "readback" }, main);
      var box = make("div", { className: "stack" }, main);
      button(WORDS.isNewYes, box, function () { done(value, true); });
      button(WORDS.isNewNo, box, entry, "plain");
    }
    entry();
  }

  /* ---------- Add Photos ---------- */
  var album = null, MAX_PHOTOS = 60, PHOTO_MIN = 600, THUMB_SIDE = 400;

  function base64Blob(text) {
    var bin = atob(text), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: "image/jpeg" });
  }
  function blobBase64(blob) {
    return new Promise(function (ok, no) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(",")[1]); };
      r.onerror = no;
      r.readAsDataURL(blob);
    });
  }
  function saveAlbum() {
    return drafts.set({ task: "photos", album: album });
  }
  function photosScreen() {
    current = WORDS.photosTitle;
    screen(WORDS.photosTitle);
    make("p", { textContent: WORDS.loading }, main);
    Promise.all([readData("gallery.js", "GALLERY"), loadNames()]).then(function (all) {
      var r = all[0];
      if (r.signIn || all[1].signIn) return showSignIn();
      if (!r.ok || !all[1].ok) return showRetry(WORDS.tryLater, photosScreen, home);
      var titles = r.value.map(function (a) { return a.title; });
      screen(WORDS.photosTitle);
      make("p", { textContent: WORDS.photosIntro }, main);
      var box = make("div", { className: "stack" }, main);
      button(WORDS.newEvent, box, function () { newEvent(titles); });
      button(WORDS.takeDownPhotos, box, takeDownScreen, "plain");
      titles.forEach(function (title) {
        button(title, box, function () { startAlbum({ existing: title }); }, "plain");
      });
      backTo(home);
    });
  }
  function startAlbum(target) {
    album = Object.assign({ id: newId(), items: [], cover: null, names: [] }, target);
    saveAlbum();
    photosChoose();
  }
  function newEvent(titles) {
    var event, venue, names = [];
    function askEvent() {
      askName(WORDS.eventName, WORDS.eventHint, "events", event, function (name, isNew) {
        event = name;
        names = isNew ? [name] : [];
        askVenue();
      }, photosScreen);
    }
    function askVenue() {
      askName(WORDS.venueName, WORDS.venueHint, "venues", venue, function (name, isNew) {
        venue = name;
        if (isNew) names = names.concat(name);
        askWhen();
      }, askEvent);
    }
    function askWhen() {
      screen(WORDS.whenName);
      var now = new Date(todayIrish() + "T12:00:00Z");
      var l1 = make("label", { textContent: WORDS.month }, main);
      var m = make("select", {}, l1);
      MONTHS.forEach(function (name, i) { make("option", { value: name, textContent: name, selected: i === now.getUTCMonth() }, m); });
      var l2 = make("label", { textContent: WORDS.year }, main);
      var y = make("select", {}, l2);
      for (var year = now.getUTCFullYear(); year >= 2005; year--) make("option", { value: String(year), textContent: String(year) }, y);
      var note = make("p", { className: "readback", hidden: true, role: "status" }, main);
      button(WORDS.dateNext, main, function () {
        var title = event + ", " + venue + ", " + m.value + " " + y.value;
        if (titles.indexOf(title) >= 0) { note.hidden = false; note.textContent = WORDS.albumExists; return; }
        startAlbum({ title: title, names: names });
      });
      backTo(askVenue);
    }
    askEvent();
  }
  function photosChoose() {
    current = WORDS.choosePhotos;
    screen(WORDS.choosePhotos);
    make("p", { textContent: WORDS.choosePhotosHelp }, main);
    var input = make("input", { type: "file", accept: "image/*,.heic,.heif", multiple: true, hidden: true, id: "file" }, main);
    button(WORDS.choosePhotos, main, function () { input.click(); });
    backTo(album.items.length ? photosReview : photosScreen);
    input.addEventListener("change", function () { if (input.files.length) prepareFiles(Array.prototype.slice.call(input.files)); });
  }
  var knownPrints = null;
  function loadPrints() {
    if (knownPrints) return Promise.resolve(knownPrints);
    return readData("gallery.js", "GALLERY").then(function (r) {
      var list = [];
      if (!r.ok) return list;
      r.value.forEach(function (a) { a.photos.forEach(function (p) { list.push(p.thumb); }); });
      var out = [], next = 0;
      function worker() {
        if (next >= list.length) return Promise.resolve();
        var src = list[next++];
        return loadImg("/" + src).then(function (img) {
          out.push({ src: src, print: fingerprint(img, img.naturalWidth, img.naturalHeight) });
        }, function () {}).then(worker);
      }
      return Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () { knownPrints = out; return out; });
    });
  }
  function prepareFiles(files) {
    var room = MAX_PHOTOS - album.items.length, over = files.length > room;
    var chosen = files.slice(0, Math.max(room, 0)), small = 0, bad = 0, done = 0;
    screen();
    var note = make("p", { className: "readback", role: "status" }, main);
    if (over) make("p", { textContent: WORDS.firstSixty, className: "note" }, main);
    note.textContent = WORDS.checkingPhotos;
    loadPrints().then(function (known) {
      return chosen.reduce(function (chain, file) {
        return chain.then(function () {
          note.textContent = WORDS.gettingReady + (++done) + WORDS.of + chosen.length;
          if (file.size > MAX_FILE) { bad++; return null; }
          return file.arrayBuffer().then(function (buffer) {
            var bytes = new Uint8Array(buffer), kind = kindOf(bytes);
            if (kind === "heic") return openHeic(bytes);
            if (kind === "image") return openImage(file);
            throw problem(WORDS.cannotOpen);
          }).then(function (canvas) {
            if (canvas.originalLong < PHOTO_MIN) { small++; return null; }
            var print = fingerprint(canvas, canvas.width, canvas.height), id = "p" + newId();
            var item = { key: id, full: base64Blob(jpegText(canvas, FINAL_SIDE)), thumb: base64Blob(jpegText(canvas, THUMB_SIDE)), print: print, keep: true };
            var old = known.find(function (k) { return sameFingerprint(print, k.print); });
            var twin = album.items.find(function (it) { return sameFingerprint(print, it.print); });
            if (old) { item.keep = false; item.oldSrc = "/" + old.src; }
            else if (twin) { item.keep = false; item.twin = twin.key; }
            album.items.push(item);
            return null;
          }).catch(function () { bad++; });
        });
      }, Promise.resolve());
    }).then(function () {
      album.small = small;
      album.bad = bad;
      album.tooMany = over;
      saveAlbum();
      photosReview();
    });
  }
  function photoImg(blob, parent) {
    var img = make("img", { alt: "Photo", className: "thumb" }, parent);
    img.src = URL.createObjectURL(blob);
    return img;
  }
  function photosReview() {
    current = WORDS.reviewTitle;
    screen(WORDS.reviewTitle);
    if (album.tooMany) make("p", { textContent: WORDS.firstSixty, className: "note" }, main);
    if (album.small) make("p", { textContent: album.small + WORDS.skippedSmall, className: "note" }, main);
    if (album.bad) make("p", { textContent: album.bad + WORDS.skippedBad, className: "note" }, main);
    var kept = album.items.filter(function (i) { return i.keep; });
    var left = album.items.filter(function (i) { return !i.keep; });
    if (album.cover && !kept.some(function (i) { return i.key === album.cover; })) album.cover = null;
    if (kept.length) make("p", { textContent: WORDS.reviewHelp }, main);
    var grid = make("div", { className: "grid" }, main);
    kept.forEach(function (item) {
      var card = make("div", { className: "card" + (album.cover === item.key ? " chosen" : "") }, grid);
      photoImg(item.thumb, card);
      button(WORDS.remove, card, function () {
        album.items = album.items.filter(function (i) { return i !== item; });
        saveAlbum();
        photosReview();
      }, "plain");
      button(album.cover === item.key ? WORDS.isCover : WORDS.useCover, card, function () {
        album.cover = item.key;
        saveAlbum();
        photosReview();
      }, "plain");
    });
    if (left.length) {
      make("h2", { textContent: WORDS.dupPhotos }, main);
      left.forEach(function (item) {
        var row = make("div", { className: "entry" }, main), pair = make("div", { className: "row" }, row);
        photoImg(item.thumb, pair);
        if (item.oldSrc) make("img", { src: item.oldSrc, alt: "Photo already on the website", className: "thumb" }, pair);
        else {
          var twin = album.items.find(function (i) { return i.key === item.twin; });
          if (twin) photoImg(twin.thumb, pair);
        }
        button(WORDS.keepThis, row, function () { item.keep = true; item.forced = true; saveAlbum(); photosReview(); }, "plain");
      });
    }
    var box = make("div", { className: "stack" }, main);
    if (kept.length) button(WORDS.keepGoing, box, photosReadback);
    else make("p", { textContent: WORDS.noneLeft, className: "readback" }, box);
    if (album.items.length < MAX_PHOTOS) button(WORDS.addMore, box, photosChoose, "plain");
    backTo(photosScreen);
  }
  function sendPicture(kind, blob, id) {
    return blobBase64(blob).then(function again(text) {
      return call("upload?kind=" + kind + "&change=" + id, { method: "POST", headers: { "content-type": "text/plain" }, body: text }).then(function (r) {
        if (r.code === "slow_down") return wait((r.retryAfter || 60) * 1000).then(function () { return again(text); });
        return r;
      });
    });
  }
  function photosReadback() {
    var kept = album.items.filter(function (i) { return i.keep; });
    var name = album.title || album.existing;
    var sentence = WORDS.saidPhotos1 + kept.length + (kept.length === 1 ? WORDS.saidPhoto2 : WORDS.saidPhotos2) + name;
    finish(sentence, "publish", function (id) {
      var op = { op: "addPhotos", photos: kept.map(function (i) { return { image: i.fullReceipt, thumb: i.thumbReceipt }; }) };
      if (album.title) op.newAlbum = album.title; else op.album = album.existing;
      var at = kept.findIndex(function (i) { return i.key === album.cover; });
      if (at >= 0) op.cover = at;
      return { changeId: id, ops: [op], allowDuplicate: kept.some(function (i) { return i.forced; }), newNames: album.names };
    }, photosReview, {
      id: album.id,
      preview: function (at) {
        var grid = make("div", { className: "grid" }, at);
        kept.slice(0, 12).forEach(function (item) { photoImg(item.thumb, grid); });
      },
      prepare: function (id) {
        var note = document.getElementById("progress"), n = 0, stop = null;
        return kept.reduce(function (chain, item) {
          return chain.then(function () {
            if (stop) return null;
            n++;
            note.textContent = WORDS.sendingPhotos + n + WORDS.of + kept.length;
            if (item.fullReceipt && item.thumbReceipt) return null;
            return sendPicture("photo", item.full, id).then(function (a) {
              if (!a.ok) { stop = a; return null; }
              item.fullReceipt = a.receipt;
              return wait(800).then(function () { return sendPicture("thumb", item.thumb, id); }).then(function (b) {
                if (!b.ok) { stop = b; return null; }
                item.thumbReceipt = b.receipt;
                saveAlbum();
                return wait(800);
              });
            });
          });
        }, Promise.resolve()).then(function () { return stop || { ok: true }; });
      },
      done: function () { drafts.clear(); album = null; knownPrints = null; }
    });
  }
  /* ---------- Taking down photos and whole events ---------- */
  function takeDownScreen() {
    current = WORDS.takeDownPhotos;
    screen(WORDS.takeDownWhich);
    make("p", { textContent: WORDS.loading }, main);
    readData("gallery.js", "GALLERY").then(function (r) {
      if (r.signIn) return showSignIn();
      if (!r.ok) return showRetry(WORDS.tryLater, takeDownScreen, photosScreen);
      screen(WORDS.takeDownWhich);
      var box = make("div", { className: "stack" }, main);
      r.value.forEach(function (a) {
        button(a.title, box, function () { takeDownAlbum(a); }, "plain");
      });
      backTo(photosScreen);
    });
  }
  function takeDownAlbum(a) {
    screen(a.title);
    function back() { takeDownAlbum(a); }
    var grid = make("div", { className: "grid" }, main);
    a.photos.forEach(function (p) {
      var card = make("div", { className: "card" }, grid);
      make("img", { src: "/" + p.thumb, alt: "Photo", className: "thumb", loading: "lazy" }, card);
      if (a.photos.length > 1) {
        button(WORDS.takeDownOne, card, function () {
          finish(WORDS.saidTakeOne + a.title, "publish", function (id) {
            return { changeId: id, ops: [{ op: "removePhotos", album: a.title, srcs: [p.src] }] };
          }, back, { preview: function (at) { make("img", { src: "/" + p.thumb, alt: "Photo", className: "thumb" }, at); } });
        }, "plain");
      }
    });
    button(WORDS.takeDownAlbum, main, function () {
      finish(WORDS.saidTakeAll1 + a.photos.length + WORDS.saidTakeAll2 + a.title, "publish", function (id) {
        return { changeId: id, ops: [{ op: "removeAlbum", album: a.title }] };
      }, back);
    }, "plain");
    backTo(takeDownScreen);
  }

  /* ---------- Change Schedule ---------- */
  var FIFTEEN = 15;
  function toClock(m) { return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2); }
  function toMins(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function clockWords(total) {
    var m = total % 1440;
    if (m === 0) return "12.00 midnight";
    if (m === 720) return "12.00 midday";
    var h = Math.floor(m / 60), twelve = h % 12 === 0 ? 12 : h % 12, text = twelve + "." + ("0" + (m % 60)).slice(-2);
    if (h < 6) return text + " at night";
    if (h < 12) return text + " in the morning";
    if (h < 18) return text + " in the afternoon";
    return text + " in the evening";
  }
  var DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  function isoWeekday(iso) { return (new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7; }
  function addDaysIso(iso, n) { return new Date(Date.parse(iso + "T12:00:00Z") + n * 86400000).toISOString().slice(0, 10); }
  function nextDateOf(day) {
    var today = todayIrish();
    return addDaysIso(today, (day - isoWeekday(today) + 7) % 7);
  }
  function endWords(start, end, day) {
    if (end === 1440) return WORDS.finishes.trim() + " at 12.00 midnight";
    if (end > 1440) {
      var m = end - 1440;
      return WORDS.finishes + DAY_NAMES[(day + 1) % 7] + WORDS.morningAt + (Math.floor(m / 60) || 12) + "." + ("0" + (m % 60)).slice(-2);
    }
    return WORDS.finishes + "at " + clockWords(end);
  }
  function showsOnDate(s, iso) {
    var list = s.weekly[isoWeekday(iso)].shows.slice();
    s.oneOffs.forEach(function (o) {
      if (o.date !== iso) return;
      if (o.type === "off") list = list.filter(function (x) { return x.id !== o.showId; });
      if (o.type === "move") list = list.map(function (x) { return x.id === o.showId ? Object.assign({}, x, { start: o.start, end: o.end }) : x; });
      if (o.type === "add") list.push(o.show);
    });
    return list;
  }
  /* Everything already booked, as minutes from the start of the day being changed. */
  function bookedAround(s, plan) {
    var out = [];
    function add(list, offset) {
      list.forEach(function (x) {
        if (x.id !== plan.showId) out.push([offset * 1440 + toMins(x.start), offset * 1440 + toMins(x.end)]);
      });
    }
    if (plan.date) {
      add(showsOnDate(s, addDaysIso(plan.date, -1)), -1);
      add(showsOnDate(s, plan.date), 0);
      add(showsOnDate(s, addDaysIso(plan.date, 1)), 1);
    } else {
      s.weekly.forEach(function (d, i) {
        [-7, 0, 7].forEach(function (wrap) { add(d.shows, i - plan.day + wrap); });
      });
    }
    return out;
  }
  function isFree(booked, from, to) {
    return !booked.some(function (b) { return from < b[1] && to > b[0]; });
  }
  function nearestFree(booked, from, length, late) {
    for (var step = FIFTEEN; step <= 720; step += FIFTEEN) {
      var options = [from + step, from - step];
      for (var i = 0; i < 2; i++) {
        var at = options[i], to = late ? 1440 : at + length;
        if (at >= FIFTEEN && at <= 1440 && to > at && isFree(booked, at, to)) return at;
      }
    }
    return null;
  }

  function scheduleScreen() {
    current = WORDS.scheduleTitle;
    screen(WORDS.scheduleTitle);
    make("p", { textContent: WORDS.loading }, main);
    Promise.all([readData("schedule.js", "SCHEDULE"), loadNames()]).then(function (all) {
      var r = all[0];
      if (r.signIn || all[1].signIn) return showSignIn();
      if (!r.ok || !all[1].ok) return showRetry(WORDS.tryLater, scheduleScreen, home);
      var s = r.value;
      screen(WORDS.scheduleTitle);
      make("p", { textContent: WORDS.scheduleIntro }, main);
      s.weekly.forEach(function (d, day) {
        make("h2", { textContent: d.day }, main);
        var box = make("div", { className: "stack" }, main);
        d.shows.forEach(function (show) {
          var b = button("", box, function () { whatChanges(s, day, show); }, "plain");
          make("span", { textContent: clockWords(toMins(show.start)), className: "when" }, b);
          make("span", { textContent: show.presenter }, b);
        });
        button(WORDS.addShowOn + d.day, box, function () { addShow(s, day); }, "plain");
      });
      backTo(home);
    });
  }
  function whatChanges(s, day, show) {
    current = WORDS.whatChanges;
    screen(show.presenter + ", " + DAY_NAMES[day]);
    make("p", { textContent: WORDS.whatChanges }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.diffTime, box, function () {
      chooseScope(day, function (scope) { chooseTimes(s, day, { showId: show.id, scope: scope, presenter: show.presenter, show: show }, function () { whatChanges(s, day, show); }); }, function () { whatChanges(s, day, show); });
    });
    button(WORDS.noShow, box, function () {
      chooseScope(day, function (scope) { readbackOff(s, day, show, scope); }, function () { whatChanges(s, day, show); });
    });
    backTo(scheduleScreen);
  }
  function chooseScope(day, done, back) {
    current = WORDS.howLong;
    screen(WORDS.howLong);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.justThisWeek, box, function () { done({ date: nextDateOf(day), kind: "week" }); });
    button(WORDS.otherDate, box, function () { pickDate(day, done, function () { chooseScope(day, done, back); }); });
    button(WORDS.everyWeek, box, function () { done({ every: true }); });
    backTo(back);
  }
  function pickDate(day, done, back) {
    screen(WORDS.chooseDate);
    var label = make("label", { textContent: WORDS.chooseDate }, main);
    var input = make("input", { type: "date", min: todayIrish() }, label);
    var note = make("p", { className: "readback", hidden: true, role: "status" }, main);
    button(WORDS.dateNext, main, function () {
      note.hidden = false;
      if (!input.value) { note.textContent = WORDS.needText; return; }
      if (input.value < todayIrish()) { note.textContent = WORDS.datePast; return; }
      if (isoWeekday(input.value) !== day) { note.textContent = WORDS.wrongDay + DAY_NAMES[day] + "."; return; }
      done({ date: input.value, kind: "date" });
    });
    backTo(back);
  }
  function scopeWords(scope) {
    if (scope.every) return WORDS.eachWeek;
    return (scope.kind === "week" ? WORDS.onlyWeek : WORDS.forDate) + dateWords(scope.date) + ".";
  }
  function chooseTimes(s, day, plan, back) {
    current = WORDS.pickStart;
    screen(plan.presenter + ", " + DAY_NAMES[day]);
    var startLabel = make("label", { textContent: WORDS.pickStart }, main);
    var start = make("select", {}, startLabel);
    for (var m = FIFTEEN; m <= 1440; m += FIFTEEN) make("option", { value: String(m), textContent: clockWords(m) }, start);
    var endLabel = make("label", { textContent: WORDS.pickEnd }, main);
    var end = make("select", {}, endLabel);
    var note = make("p", { className: "readback", hidden: true, role: "status" }, main);
    var extra = make("div", {}, main);
    var was = plan.show ? toMins(plan.show.start) : 1200, wasEnd = plan.show ? toMins(plan.show.end) : 1260;
    start.value = String(was);
    function fillEnd(chosen) {
      end.textContent = "";
      var from = +start.value;
      for (var e = from + FIFTEEN; e <= 1800; e += FIFTEEN) make("option", { value: String(e), textContent: endWords(from, e, day) }, end);
      if (from < 1440) make("option", { value: "late", textContent: WORDS.lateFinish }, end);
      end.value = chosen && end.querySelector('option[value="' + chosen + '"]') ? chosen : String(from + 60);
    }
    fillEnd(plan.show && plan.show.late ? "late" : String(wasEnd));
    start.addEventListener("change", function () { fillEnd(end.value); });
    button(WORDS.dateNext, main, function () {
      var from = +start.value, late = end.value === "late", to = late ? 1440 : +end.value;
      var scope = plan.scope, booked = bookedAround(s, { showId: plan.showId, day: day, date: scope.date });
      extra.textContent = "";
      note.hidden = true;
      if (isFree(booked, from, to)) return plan.next ? plan.next(from, to, late) : readbackMove(s, day, plan, from, to, late);
      note.hidden = false;
      note.textContent = WORDS.clashed;
      var free = nearestFree(booked, from, to - from, late);
      if (free !== null) {
        make("p", { textContent: WORDS.nearest + clockWords(free) + ".", className: "note" }, extra);
        button(WORDS.useNearest, extra, function () {
          var length = to - from;
          start.value = String(free);
          fillEnd(late ? "late" : String(free + length));
          note.hidden = true;
          extra.textContent = "";
        }, "plain");
      }
    });
    backTo(back);
  }
  function timeSentence(day, from, to, late) {
    var s = DAY_NAMES[day] + WORDS.onDay + clockWords(from);
    return late ? s + WORDS.saidLate : s + ", " + endWords(from, to, day);
  }
  function backToSchedule() { scheduleScreen(); }
  /* A change with no pictures, kept safe from the read-back onwards in case the window closes. */
  function finishSaved(sentence, ops, back, names, preview) {
    var id = newId();
    drafts.set({ task: "pending", id: id, sentence: sentence, ops: ops, names: names || [] });
    finish(sentence, "publish", function (changeId) {
      return { changeId: changeId, ops: ops, newNames: names || [] };
    }, function () { drafts.clear(); back(); }, { id: id, preview: preview, done: function () { drafts.clear(); } });
  }
  function readbackMove(s, day, plan, from, to, late) {
    var sentence = timeSentence(day, from, to, late) + ": " + plan.presenter + ". " + scopeWords(plan.scope);
    var op = plan.scope.every ? { op: "weeklyMove", showId: plan.showId } : { op: "oneOffMove", date: plan.scope.date, showId: plan.showId };
    op.start = toClock(from);
    if (late) op.late = true; else op.end = toClock(to);
    finishSaved(sentence, [op], backToSchedule);
  }
  function readbackOff(s, day, show, scope) {
    var sentence = WORDS.saidOff + show.presenter + ", " + DAY_NAMES[day] + WORDS.onDay + clockWords(toMins(show.start)) + ". " + scopeWords(scope);
    finishSaved(sentence, [scope.every ? { op: "weeklyOff", showId: show.id } : { op: "oneOffOff", date: scope.date, showId: show.id }], backToSchedule);
  }
  function addShow(s, day) {
    var back = scheduleScreen;
    askName(WORDS.presenterName, WORDS.presenterHint, "presenters", "", function (name, isNew) {
      screen(WORDS.isRepeat);
      make("p", { textContent: name, className: "note" }, main);
      var box = make("div", { className: "stack" }, main);
      button(WORDS.yes, box, function () { afterRepeat(name, isNew, true); });
      button(WORDS.no, box, function () { afterRepeat(name, isNew, false); });
      backTo(back);
    }, back);
    function afterRepeat(name, isNew, repeat) {
      var known = [].concat.apply([], s.weekly.map(function (d) { return d.shows; })).find(function (x) { return x.presenter === name; });
      if (known) return goScope(name, repeat, known.photo, null, isNew);
      screen(WORDS.presenterPhoto);
      var input = make("input", { type: "file", accept: "image/*,.heic,.heif", hidden: true, id: "file" }, main);
      var note = make("p", { className: "readback", hidden: true, role: "status" }, main);
      button(WORDS.choose, main, function () { input.click(); });
      backTo(back);
      input.addEventListener("change", function () {
        var file = input.files[0];
        if (!file) return;
        file.arrayBuffer().then(function (buffer) {
          var bytes = new Uint8Array(buffer), kind = kindOf(bytes);
          if (kind === "heic") return openHeic(bytes);
          if (kind === "image") return openImage(file);
          throw problem(WORDS.cannotOpen);
        }).then(function (canvas) {
          if (canvas.originalLong < 200) throw problem(WORDS.tooSmall);
          goScope(name, repeat, null, canvas, true);
        }).catch(function (e) { note.hidden = false; note.textContent = e.word || WORDS.cannotOpen; });
      });
    }
    function goScope(name, repeat, photo, canvas, isNew) {
      chooseScope(day, function (scope) {
        chooseTimes(s, day, {
          scope: scope, presenter: name,
          next: function (from, to, late) { readbackAdd(day, name, repeat, photo, canvas, isNew, scope, from, to, late); }
        }, back);
      }, back);
    }
  }
  function readbackAdd(day, name, repeat, photo, canvas, isNew, scope, from, to, late) {
    var sentence = timeSentence(day, from, to, late) + ": " + name + ". " + scopeWords(scope);
    if (!canvas) {
      var plainOp = scope.every ? { op: "weeklyAdd", day: DAY_NAMES[day] } : { op: "oneOffAdd", date: scope.date };
      Object.assign(plainOp, { presenter: name, start: toClock(from), repeat: repeat, photo: photo });
      if (late) plainOp.late = true; else plainOp.end = toClock(to);
      return finishSaved(sentence, [plainOp], backToSchedule, isNew ? [name] : []);
    }
    finish(sentence, "publish", function (id, ready) {
      var op = scope.every ? { op: "weeklyAdd", day: DAY_NAMES[day] } : { op: "oneOffAdd", date: scope.date };
      Object.assign(op, { presenter: name, start: toClock(from), repeat: repeat });
      if (late) op.late = true; else op.end = toClock(to);
      if (ready.receipt) op.image = ready.receipt; else op.photo = photo;
      return { changeId: id, ops: [op], newNames: isNew && !canvas ? [name] : [] };
    }, backToSchedule, canvas ? {
      prepare: function (id) {
        return call("upload?kind=presenter&change=" + id, { method: "POST", headers: { "content-type": "text/plain" }, body: jpegText(canvas, 800) });
      }
    } : {});
  }

  /* ---------- Home Page Photos ---------- */
  var homeList = null;
  function homeScreen() {
    current = WORDS.homeTitle;
    screen(WORDS.homeTitle);
    make("p", { textContent: WORDS.loading }, main);
    Promise.all([readData("home-photos.js", "HOME_PHOTOS"), readData("gallery.js", "GALLERY")]).then(function (all) {
      if (all[0].signIn || all[1].signIn) return showSignIn();
      if (!all[0].ok || !all[1].ok) return showRetry(WORDS.tryLater, homeScreen, home);
      homeList = all[0].value.slice();
      homeShow(all[1].value);
    });
  }
  function homeShow(gallery) {
    current = WORDS.homeTitle;
    screen(WORDS.homeTitle);
    make("p", { textContent: WORDS.homeIntro }, main);
    var grid = make("div", { className: "grid" }, main);
    homeList.forEach(function (p) {
      var card = make("div", { className: "card" }, grid);
      make("img", { src: "/" + p.thumb, alt: "Photo", className: "thumb", loading: "lazy" }, card);
      var b = button(WORDS.remove, card, function () {
        homeList = homeList.filter(function (x) { return x.src !== p.src; });
        homeShow(gallery);
      }, "plain");
      b.disabled = homeList.length <= 3;
    });
    if (homeList.length <= 3) make("p", { textContent: WORDS.homeNeed, className: "note" }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.homeAdd, box, function () { homePickAlbum(gallery); }, "plain");
    button(WORDS.homeNext, box, function () { homeReadback(gallery); });
    backTo(home);
  }
  function homePickAlbum(gallery) {
    screen(WORDS.homeWhich);
    var box = make("div", { className: "stack" }, main);
    gallery.forEach(function (a) { button(a.title, box, function () { homePickPhoto(gallery, a); }, "plain"); });
    backTo(function () { homeShow(gallery); });
  }
  function homePickPhoto(gallery, a) {
    screen(a.title);
    make("p", { textContent: WORDS.homePick }, main);
    var grid = make("div", { className: "grid" }, main);
    a.photos.forEach(function (p) {
      var chosen = homeList.some(function (x) { return x.src === p.src; });
      var b = button("", grid, function () {
        homeList.push(p);
        b.disabled = true;
        label.textContent = WORDS.homeAdded;
      }, "plain card");
      b.disabled = chosen;
      make("img", { src: "/" + p.thumb, alt: "Photo", className: "thumb", loading: "lazy" }, b);
      var label = make("span", { textContent: chosen ? WORDS.homeAdded : "" }, b);
    });
    backTo(function () { homePickAlbum(gallery); });
  }
  function homeReadback(gallery) {
    var chosen = homeList.slice();
    finishSaved(WORDS.saidHome1 + chosen.length + WORDS.saidHome2, [{ op: "setHomePhotos", srcs: chosen.map(function (p) { return p.src; }) }], function () { homeShow(gallery); }, [], function (at) {
      var grid = make("div", { className: "grid" }, at);
      chosen.forEach(function (p) { make("img", { src: "/" + p.thumb, alt: "Photo", className: "thumb" }, grid); });
    });
  }
  function resumePending(d) {
    current = "resume";
    screen();
    make("p", { textContent: WORDS.carryChange, className: "readback" }, main);
    make("p", { textContent: d.sentence, className: "note" }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.carryYes, box, function () {
      finish(d.sentence, "publish", function (id) {
        return { changeId: id, ops: d.ops, newNames: d.names };
      }, function () { drafts.clear(); home(); }, { id: d.id, done: function () { drafts.clear(); } });
    });
    button(WORDS.carryNo, box, function () { drafts.clear(); home(); }, "plain");
  }

  function resumePhotos(d) {
    current = "resume";
    screen();
    make("p", { textContent: WORDS.carryPhotos, className: "readback" }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.carryYes, box, function () {
      album = d.album;
      loadNames().then(function () { album.items.length ? photosReview() : photosChoose(); });
    });
    button(WORDS.carryNo, box, function () { drafts.clear(); home(); }, "plain");
  }

  function resumeDraft(d) {
    current = "resume";
    screen();
    make("p", { textContent: WORDS.carryPoster, className: "readback" }, main);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.carryYes, box, function () {
      createImageBitmap(d.blob).then(function (b) {
        var c = canvasOf(b.width, b.height);
        c.getContext("2d").drawImage(b, 0, 0);
        c.originalLong = Math.max(b.width, b.height);
        poster = { id: d.id, base: c, quarter: d.quarter, lastDate: d.lastDate, noEnd: d.noEnd, keepDuplicate: d.keepDuplicate };
        posterTurn();
      }, function () { drafts.clear(); home(); });
    });
    button(WORDS.carryNo, box, function () { drafts.clear(); home(); }, "plain");
  }

  function home() {
    current = "home";
    screen(WORDS.home);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.poster, box, posterScreen);
    button(WORDS.photos, box, photosScreen);
    button(WORDS.schedule, box, scheduleScreen);
    button(WORDS.homePhotos, box, homeScreen);
    button(WORDS.undo, box, undoScreen);
  }

  function showPractice(on) { document.getElementById("practice").hidden = !on; }

  document.getElementById("help").addEventListener("click", function () {
    var was = current;
    screen(WORDS.helpCheck);
    var box = make("div", { className: "stack" }, main);
    button(WORDS.helpYes, box, function () {
      send("notify", { type: "help", details: "Screen: " + was }).then(function (r) {
        screen();
        if (r.signIn) return showSignIn();
        make("p", { textContent: r.sent ? WORDS.helpSent : WORDS.helpFailed, className: "readback" }, main);
        button(WORDS.goHome, main, home);
      });
    });
    button(WORDS.back, box, home, "plain");
  });

  /* Only one window at a time can make changes. */
  function start() {
    if (!navigator.locks) { lockHeld = true; return begin(); }
    navigator.locks.request("cms-admin", { ifAvailable: true }, function (lock) {
      if (!lock) {
        screen();
        make("p", { textContent: WORDS.otherWindow, className: "readback" }, main);
        button(WORDS.tryAgain, main, start);
        return undefined;
      }
      lockHeld = true;
      begin();
      return new Promise(function () {}); /* Held until this window closes. */
    });
  }
  function begin() {
    home();
    call("changes").then(function (r) { if (r.ok) showPractice(r.practice); });
    drafts.get().then(function (d) {
      if (d && d.task === "poster") resumeDraft(d);
      if (d && d.task === "photos") resumePhotos(d);
      if (d && d.task === "pending") resumePending(d);
    });
  }
  start();
})();
