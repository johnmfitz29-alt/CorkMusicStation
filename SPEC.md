# Cork Music Station admin area: specification

## Context

The station's editor needs to update the website without help. `ADMIN-REQUIREMENTS.md` is the requirements document. This specification applies the owner's interview answers, approved 8 November 2026.

**Status:** no code has been written. Stage 1 starts only when the owner says so, and nothing goes online until the owner asks at each stage.

## 1. Decisions from the interview

| Topic | Decision |
|---|---|
| Device | Windows PC with a desktop icon. Photos are copied over, so HEIC can turn up |
| Login | Cloudflare Access, Google login, one-month session |
| Repository | New public GitHub repository, with a free ruleset blocking force-push and deletion. It holds no secrets or personal email addresses |
| Alerts | Resend free account, key in Cloudflare secrets |
| Posters | He picks the last gig date, or "No end date" |
| Existing 8 posters | The owner gives each a last date or "No end date" before launch. None are guessed |
| Home page photos | **A fifth button**, Home Page Photos. Picks from existing gallery and collection photos only; at least 3 must remain |
| Schedule changes offered | Different time, No show this time, Add a new show. **No "different presenter" option** |
| When a change applies | Just this week / Just one other date / Every week |
| Time text on the public page | **All shows tidied at launch** to `7.00 pm - 9.00 pm`, with one line "All times are Irish time" above the schedule (table in section 5) |
| No fixed finish | Finish list includes "Late, no fixed time"; the clash check treats it as ending at midnight |
| Time words in admin | Morning to 11.45 am, "12.00 midday", afternoon to 5.45 pm, evening to 11.45 pm, "12.00 midnight", "at night" to 5.45 am, morning again from 6.00 am |
| Misspellings | **"Did you mean…?" every time**, even for known misspellings |
| New album titles | `Paddy O'Brien, Hazel Tree Mallow, May 2015`. Existing titles are not touched |
| New presenter | He adds a photo during the task. Contact line defaults to the station email; the owner is told |
| Practice Mode | Separate private `practice` copy, running the full process for real |
| Photos per go | **At most 60**, then "Let's do the first 60, then the rest" |
| Undo | Last 20 changes. Unsafe ones are greyed: "Ask John about this one" |
| Duplicates | Stops and shows both, with "They're different, keep it" |
| Taking things down | He can take down posters, photos and whole albums, with a read-back and Undo. Album removal has an extra read-back with the photo count and emails the owner |

**Where these differ from `ADMIN-REQUIREMENTS.md`, by the owner's choice:** five buttons, not four. Known misspellings ask rather than convert. 200 photos at once is capped at 60. He can remove photos, which the requirements did not list.

**One gap to be aware of:** with no "different presenter" option, a stand-in for one week has to be done as "No show this time" plus "Add a new show". The acceptance test covers that route.

## 2. How it works

- **Layout:** `site/admin/` is the page, and is served at `/admin/`. `functions/api/admin/*` is the server side. The existing `.html` addresses stay. The Pages output folder stays `site`.
- **Login:** Cloudflare Access covers `/admin*` and `/api/admin*` on the custom domain, `*.pages.dev` and preview addresses. The first line of every function handler calls `requireLogin()`, which checks the `Cf-Access-Jwt-Assertion` signature (RS256, keys from the team's certs address, chosen by `kid`), `iss`, `aud`, expiry, and the email against an allow-list held in secrets.
- **Data files:** the page keeps loading `window.X = …`, but the editable files are reformatted as strict JSON inside that wrapper, because the function cannot run JavaScript to read them. `schedule.js` needs this conversion. Content must stay identical, and a test compares before and after.
- **New data files:** one-off schedule changes live in the schedule data with an Irish date. `site.js` applies them for that date and ignores them afterwards, so they revert with no scheduled job. Posters hide the same way. `change-log.js` holds the Undo list. `names.js` holds the names list, which the owner approves and the function cannot write to.
- **Single commit:** the browser resizes and converts photos, then sends them in small batches. Each goes up as a GitHub blob, which is invisible until committed. The function checks each one and returns a signed receipt. The final call checks the receipts, then makes one tree, one commit and one non-forced branch update. A half-finished album leaves nothing on the site.
- **Why this suits the limits:** Cloudflare's free tier allows 10 ms of CPU and 50 subrequests per request, so receipts avoid re-fetching every blob. GitHub also limits how fast content can be created, so uploads are paced. A 60-photo go is about 120 blobs (full size plus thumbnail).
- **Path limit:** GitHub tokens cannot be limited by folder. The function enforces an exact allow-list instead, covering named files in `site/data/` and new files in `site/images/{posters,gallery,collection,presenters}/`, and the build check repeats it.
- **Undo:** each log entry stores the steps that reverse it, and undoing makes a new commit. History is never rewritten. An entry is safe only if the records it touched have not changed since.
- **"It's on the website":** after the commit, the browser polls a small version file on the live site for that change's ID.
- **Build check:** the Pages build command runs a validator and produces no output of its own, so a failure leaves the old site up. This keeps the "no build step" decision for the site itself.
- **Practice:** the server decides from its environment which branch it writes to, never from the browser.

## 3. Acceptance tests (one per requirement)

Each has a fixed result. "Pass" means the listed result was observed.

**Design rule**
- R1 Nothing goes live until read back: with the read-back screen open and not confirmed, the live site and the branch are unchanged.
- R2 Can't break the site: every item in section 4 leaves the live site still working.
- R3 Everything can be undone: each of the task types can be published and then undone, and the data files then match the earlier state.

**Screens**
- R4 Desktop icon opens the admin area with five big buttons plus Get Help (owner's change: five, not four).
- R5 Get Help emails the owner the current screen, task and draft summary within 1 minute.
- R6 Poster accepts JPG, PNG and PDF. A PDF with more than one page asks which page.
- R7 Poster rotate buttons change the saved image's orientation.
- R8 He picks a last date or "No end date", and the choice is saved.
- R9 A poster with a long side under 800 pixels is stopped with a message that doesn't blame him. All 8 current posters would pass.
- R10 The same poster twice, including re-saved or resized, stops and shows both. "They're different, keep it" continues.
- R11 Gig Guide sorts by date, with "No end date" posters last.
- R12 A poster disappears the day after its last date, Irish time, with no new publish.
- R13 Take Down removes a poster or photo after a read-back, and Undo restores it.
- R14 Removing an album shows the photo count, emails the owner, and Undo restores every photo.
- R15 Add Photos lists existing events plus "New event".
- R16 A new event produces a title in the agreed format.
- R17 Thumbnails can be removed before publishing, and removed ones are not sent.
- R18 A cover can be chosen and appears on the album.
- R19 Schedule shows a weekly grid and each show can be tapped.
- R20 The only changes offered are different time, no show, and add a show in an empty slot.
- R21 Stand-in route: No show this week, then Add a new show, then both revert after that date.
- R22 Three choices appear: Just this week, Just one other date, Every week.
- R23 A one-off reverts by itself the day after, with no publish.
- R24 Undo lists plain-English entries such as "Tuesday 3.15 pm: added 12 photos", newest first, at most 20.
- R25 An entry whose records have changed since is greyed with "Ask John about this one", and can't be run.
- R26 Undo itself can be undone, giving the same data as before the first Undo.
- R27 Home Page Photos ticks existing photos, won't go below 3, and the home page shows the result.
- R28 Every task ends with a preview, one read-back sentence, then one green **Put It On The Website**.

**Schedule rules**
- R29 Times are chosen only in 15-minute steps, in the agreed words.
- R30 A past-midnight show reads "finishes Sunday morning at 12.30".
- R31 A clash is blocked and the nearest free time is offered, including across midnight and Sunday into Monday.
- R32 On the last Sundays of March and October 2027, on-air highlighting follows Irish time, tested with a mocked clock.
- R33 "Late, no fixed time" shows as `Late` publicly and blocks up to midnight.
- R34 A new presenter requires a photo. The contact line uses the station email, and the owner is emailed.
- R35 At launch, each show's text matches section 5 and its `start`/`end` values are unchanged.

**Names and spelling**
- R36 Free text is offered only for a new event, venue or presenter.
- R37 Tidy-up fixes spaces, caps lock, stray apostrophes and O'Brien/McHugh style, and the result appears in the read-back.
- R38 Names list contains only owner-approved spellings; "Normand Boland" and "Castleahan" pass unaltered, and fadas are kept.
- R39 A known misspelling shows "Did you mean…?" and is never changed silently (owner's change).
- R40 A close match shows "Did you mean…?" with big buttons.
- R41 No match asks him to confirm it's new, and the owner is told.
- R42 Check that no screen offers removing a presenter, editing the names list, or changing design, and that the functions reject those writes.
- R43 No AI: the code makes no call to any AI service.

**Protection**
- R44 Close the window at any point. On return: "You were adding photos. Carry on?", with the work intact.
- R45 HEIC and sideways photos arrive as upright JPEGs.
- R46 Published JPEGs contain no EXIF or location data, and the server refuses any file that does.
- R47 Awkward filenames become safe generated ones.
- R48 Cut off before the final commit: nothing of the album appears on the branch.
- R49 All photos and data from one go land in exactly one commit.
- R50 Each browser check, bypassed with a hand-made request, is refused by the server.
- R51 Deliberately invalid data fails the build check and the old site stays up.
- R52 A request to write anywhere outside the allow-list is refused, including `..` paths, `site/index.html` and `functions/`.
- R53 "It's on the website" appears only after the live site shows that change's ID.
- R54 On failure he sees exactly: "Nothing is broken. The old page is still there, and John has been told." The owner gets an email.
- R55 Double-clicking the green button produces one commit.
- R56 A second tab is told the task is open elsewhere and can't publish over it.
- R57 Lost internet: he's told to try again later, and the work is kept.

**Security and upkeep**
- R58 Without a login, `/admin/` and every `/api/admin/*` function are refused, on the custom domain, `*.pages.dev` and preview addresses.
- R59 Each function rejects a missing, forged, expired or wrong-audience token, and a valid token for an unlisted email, even if Access is bypassed. A test checks every handler calls `requireLogin()`.
- R60 The token works on this repository only, and is found only in Cloudflare secrets (scan of repository and history).
- R61 Force-push and branch deletion to the main branch are refused.
- R62 One email reaches the owner per publish, with what changed and a link to Undo.
- R63 The owner, and never he, is warned when files approach the host's limits (at 18,000 of 20,000 files, and any file over 20 MiB).
- R64 A 60-photo go completes in small batches with no function hitting its free limits.

**Designed for him**
- R65 Text is at least 24 px, contrast meets WCAG AA or better, using the site's wine-red look.
- R66 No hover-only controls (the whole flow works with hover disabled).
- R67 No timers: 2 hours idle mid-task, then finishing, still works, within the login session.
- R68 Each screen has one main action and a Back button, and Back keeps his work.
- R69 A text scan of all screens and messages finds no "Publish", "upload" or "error".
- R70 Review of every message confirms none blames him.

**Testing before he uses it**
- R71 Every item in section 4 has a recorded result.
- R72 Sabotage set passes: internet pulled mid-upload, window closed mid-publish, double-clicks, two tabs, expired login, owner pushing at the same moment. The last rebuilds on the new commit and keeps both changes.
- R73 Practice Mode shows a yellow banner on every screen, and after a full run the main branch and live site are unchanged.
- R74 He completes each task alone while watched, and each hesitation is logged and fixed.
- R75 For the first two weeks, the owner has reviewed every publish (log checked).
- R76 A one-page printed card shows large pictures of the five buttons.

**Technical constraints from the owner's brief**
- R77 Photos are processed in the browser: the server never decodes or resizes an image.
- R78 Every commit from the admin touches only allow-listed paths (checked across the practice history).
- R79 A login that has expired mid-task returns him to his saved draft after logging back in.

## 4. Realistic bad inputs

**Names, from the real site:** `Paddy O\` Brien`, `Paddy O Brien`, `Hugh O Brien`, `Barry O\` Halloran`, `Georges Late Show`, `Willies Country Favourites`, `Caroline\`s Fundraiser`, `lisaMcHugh`, `Gina,Dale Haze`, `Glor Tire` (missing fadas), `Bumblence`, `bunblence`, `mbleance`, `bumblance`, `Danny` (short for Danny Tobin), `Seamus Fitzsimmon`, `Tipp F.M Country Music Award's`, `Kades Kounty`, trailing full stops, ALL CAPITALS, double spaces, an emoji, 300 characters, `<script>`, and a name made only of spaces. **Must pass unaltered:** Normand Boland, Castleahan, Seán, Glór Tíre.

**Dates and times:** a past date, 29 February in a non-leap year, a poster dated next year by mistake, a gig today, the same show being changed twice, a one-off on a date where the show doesn't run, a clash with the Thursday 12.00 to 2.00 am repeat, Saturday's 12.30 am finish against a Sunday morning show, Sunday night into Monday, a show set at 1.30 am on a clock-change Sunday, finish before start, a "Late" show followed by another show.

**Posters:** a sideways photo of a poster, a phone screenshot, a 300 x 200 picture, a 40 MB scan, a 12-page PDF, a password-protected PDF, a corrupt PDF, a PDF with no pages, the same poster re-saved under a new name.

**Photos:** sideways with EXIF rotation, HEIC, 61 photos, 200 photos, the same photo twice in one go, a photo already in another album, a 30 MB file, a 15,000-pixel panorama, a tiny web image, a GIF, a renamed `.txt`, an empty file, a video, a file named `IMG 001 (2) copy#&.JPG`, a Word document, all photos removed before publishing.

**Requests aimed at the server:** a path with `../`, a write to `site/index.html`, a forged receipt, a receipt reused for a different file, an oversized body, a JPEG with EXIF left in, a script disguised as a picture, a stale version of the data, a repeat of the same publish.

**Environment:** GitHub down, token expired, Resend down (publishing must still work, and the problem is logged), Cloudflare build failing or queued for over 10 minutes, browser storage full, private window, old browser, cleared browser data, monthly build limit reached.

## 5. Approved time text (no actual times change)

| Show | Becomes |
|---|---|
| Mon Tim Coughlan, Wed Tim Coughlan | 7.00 pm - 9.00 pm |
| Mon George F Langan | 10.30 pm - Late |
| Tue Jimmy Reidy, Fri Jimmy Reidy | 8.00 pm - 9.00 pm |
| Tue and Fri Seán Radley | 9.00 pm - 11.00 pm |
| Wed Breeda | 9.00 pm - 11.30 pm |
| Thu John Nip | 7.30 pm - 9.00 pm |
| Thu Danny Tobin | 9.00 pm - 10.00 pm |
| Thu Willie | 10.00 pm - 12.00 midnight |
| Thu Vincent Murray | 12.00 midnight - 2.00 am |
| Sat David Marks | 11.00 am - 1.00 pm |
| Sat Jimmy Reidy | 1.00 pm - 2.00 pm |
| Sat Tim Coughlan | 3.00 pm - 6.00 pm |
| Sat George F Langan | 8.00 pm - 12.30 am |
| Sun Barry O'Halloran | 10.30 am - 12.30 pm |
| Sun Tim Coughlan | 3.00 pm - 5.00 pm |
| Sun Vincent Murray | 8.00 pm - 10.00 pm |
| Sun Jimmy Reidy | 10.00 pm - 11.15 pm |

Also approved by the owner on 8 November 2026: the schedule shows Breeda as Breeda Piggott and Willie as Willie Fitzgerald. Show titles and contact lines are unchanged.

## 6. Four-stage plan

Each stage ends with the owner's review. Nothing is pushed or put online without the owner asking at that point.

**Stage 1: Foundations, no screens for him.** Convert data files to strict JSON, with a before/after comparison. Add dated posters, one-off schedule changes and the time text to `site.js` and pages. Draft `names.js` and the list of 8 posters for the owner to approve. Write the validator. Owner sets up GitHub, Cloudflare Pages, Access and Resend from a written checklist; I don't handle any credentials. Build `requireLogin()`, the path allow-list, and a test of the batch upload, measuring real CPU and rate limits. *Covers R12, R23, R32, R35, R38, R51, R52, R58 to R61, R64, R77.*

**Stage 2: Server functions and all-or-nothing publishing.** Upload with receipts, single commit, retry when the owner pushes at the same time, duplicate requests, Undo, change log, live-site confirmation, email alerts, file-limit warnings, and the practice branch. Test with scripts against the `practice` branch only. *Covers R3, R49, R50, R53 to R55, R62, R63, R72 (server part), R78.*

**Stage 3: His screens.** Five tasks plus Get Help and Undo, read-backs, names checks, photo processing (HEIC, rotation, PDF), drafts, the second-tab guard, large-text design. *Covers R1, R4 to R11, R13 to R22, R24 to R31, R33, R34, R36, R37, R39 to R48, R56, R57, R65 to R70, R79.*

**Stage 4: Test against him, then launch.** Run every bad input and the full sabotage set. Practice Mode with the yellow banner. Watch him do it, and fix each hesitation. Print the card. Update `UPDATING.md` and `PROGRESS.md`. The owner decides when it goes live, then reviews every publish for two weeks. *Covers R2, R71 to R76.*

## 7. Verification

- Automated tests run the section 4 inputs and each function's login check locally with Pages' local runner.
- End-to-end checks run in Chrome and Edge on Windows against the practice copy, using real HEIC, PDF and oversized files.
- A results table in `SPEC.md` records pass or fail for each R-number, with evidence.

## 8. Needed from the owner before or during Stage 1

- Approval of the master names list when it's drafted.
- Last date or "No end date" for each of the 8 posters.
- The domain's current status, and whether it can move to Cloudflare. Resend needs a domain you control.
- His Google address and yours, entered directly in Cloudflare's settings.

## 9. Stage 1 results (8 November 2026)

Local tests: run `npm test`. Build check: run `npm run check`.

| Test | Result | Evidence or what is left |
|---|---|---|
| R11, R12, R21, R23 (date rules) | Pass for the rules | Automated, with a mocked clock. Screens that create these come in Stage 3 |
| R32 clock changes | Pass | Automated for March and October 2027 |
| R35 time text | Pass | Compared with the previous commit; only the time words changed, and `id` and `late` were added |
| R38 names list | Partly | Draft structure passes. Not approved yet, so not in the site |
| R46, R50 refusing EXIF and fakes | Pass for upload checks | Automated. Checked against a real Chrome JPEG's structure. More server checks come in Stage 2 |
| R51 build check | Pass locally | 9 kinds of bad data refused. Not yet seen failing on Cloudflare |
| R52, R78 path limits | Pass | Automated, including `..`, encoded paths and renames |
| R59 login inside functions | Pass | Automated with real RS256 signatures |
| R77 no decoding on the server | Pass | The function reads only the first 4 KB and last bytes |
| R58 Access covers every address | **Not run** | Needs `SETUP-CHECKLIST.md` |
| R60 token, R61 history protection | **Not run** | Needs `SETUP-CHECKLIST.md` |
| R64 free limits | **Local indication only** | About 5 ms CPU per 500 KB photo on this computer. Real figures need the measuring page on Cloudflare |

**Added by Stage 1:** each photo sent is capped at about 500 KB, because a 1 MB photo measured too close to Cloudflare's 10 ms limit. The browser lowers JPEG quality to fit. The admin area's temporary `site/admin/upload-test.html` and `functions/api/admin/upload-test.js` must be deleted before Stage 3.

**Noticed:** the build check warns about 8 undated posters until `TO-APPROVE.md` is answered, and about 3 MP3s of 21 to 23 MiB, which are under the 25 MiB limit.

**Autoplay recheck (8 November 2026):** a Stage 1 fault was found and fixed. The date logic was on only three pages, so moving from Archives, Links, Gallery or the 404 page to the schedule, home or Gig Guide page forced a full reload, which restarts the radio. All 7 pages now load it, and a test guards this. In the browser, the stream started by itself on Archives and kept playing, with no reload, through DJ Schedule, Home and Gig Guide. Stop worked and saved its setting. Not tested: staying stopped after a full page reload (the browser pane stopped responding at that step), a browser that blocks autoplay, where "Tap anywhere to start the music" appears (that code is unchanged since the last commit), and iPhone Safari.

## 10. Decisions during setup (8 November 2026)

- **`.html` addresses:** Cloudflare Pages redirects `/dj-schedule.html` to `/dj-schedule`. The owner accepted this: every old address still works.
- **Admin page:** served only through a function that checks the login first, with no plain admin file on the site. Added after `/admin%2Fupload-test` was found to get past Cloudflare Access to a static page.
- **R80** `/admin%2F` style encoded addresses never show an admin page without a login (run against the deployed site).
- **Order:** Stage 2 starts with Resend and the R64 measurement still open. R64 stays unproven, and `UPLOAD_TEST_ENABLED` stays set on Preview until the figures are in. So far 74 of 74 test pictures reached GitHub with no problems, at about 6.5 seconds each.

## 11. Stage 2 results (8 November 2026)

Tested on this computer against a stand-in GitHub (`tests/fake-github.mjs`). 76 automated tests pass. Nothing here has run on GitHub or Cloudflare yet.

| Test | Result |
|---|---|
| R3, R13, R14, R26 undo and undo of undo | Pass locally, compared with the earlier data |
| R24, R25 reach of 20 and unsafe entries | Pass locally |
| R49 one commit, R48 nothing before the final step | Pass locally, including 60 photos |
| R50 server repeats the checks | Pass locally: forged, altered, borrowed and wrong-kind receipts, undo-only steps |
| R53 confirmation from the live file | Pass locally with a stand-in file |
| R54 failure leaves everything unchanged | Pass locally |
| R55 double clicks, R72 owner pushing at the same moment | Pass locally |
| R62 one email per change | Pass locally. Resend is not set up, so no real email has been sent |
| R63 file-limit warning | Written. Not tested at 18,000 files |
| R31 clashes, R29 steps, R33 Late, R34 new presenter, R27 home photos | Server rules pass locally. Screens come in Stage 3 |
| R64 free limits | **Open, with a risk.** See below |

**R64 risk:** CPU per publish on this computer is about 5 ms for 1 photo, 7 ms for 12 and 18 ms for 60, against Cloudflare's free limit of 10 ms per request. Cloudflare's processors differ, so this is an indication only. It must be measured on the practice copy. If real figures are over the limit, receipts will be checked in smaller groups before the final step, which changes nothing he sees, or the go-size will be reduced.

**Bug caught by the tests:** rewriting `schedule.js` was cut at a mention of its name in the opening comment, which would have broken the file. It is fixed, and every rewritten file must now read back identically before it can be saved.

**Wording chosen:** noon on the public page reads "12.00 midday", matching "12.00 midnight". Section 5 had no example, so the owner may want to confirm it.

**Minimum photo size:** a new gallery photo must be at least 600 pixels on its long side. The spec named a limit only for posters.

## 12. Stage 2 on the real practice copy (9 November 2026)

Real login, GitHub and Cloudflare, using the owner-only rehearsal, with made-up photos of about 100 KB.

| Photos | Sending | Publish | Live after | Undo | Undo live after |
|---|---|---|---|---|---|
| 1 | 3 s | HTTP 200, 3.2 s | 35 s | HTTP 200, 3.7 s | 26 s |
| 12 | 38 s | HTTP 200, 3.3 s | 33 s | HTTP 200, 4.0 s | 33 s |
| 60 | 197 s | HTTP 200, 5.2 s | 33 s | HTTP 200, 3.6 s | 41 s |

R3, R49, R53, R64 and R78 have now passed once on the real system for this path. R64 is not closed until the CPU figures from Cloudflare's Metrics are recorded: one successful run does not show the margin.

Two faults appeared only on Cloudflare and are fixed: the build check treated every file as changed on a partial download, and a `cache` option was passed that Cloudflare may reject.

## 13. Stage 3 progress (9 November 2026)

**Slice 1, done on this computer:** the measuring page and its function are removed. The admin page is packed from `admin-src/` by `tools/build-admin.mjs` and served only through a login-checked function, so no plain admin file exists (R80, still to run on the deployed site). Home screen with five buttons, Undo, Get Help, the shared read-back and ending, the Practice banner, and the second-window guard work against a temporary local server with invented data (R4, R24, R25, R28, R54, R56 in part, R65, R66, R68, R69, R73 in part).

**Still to build:** Add Gig Poster, Add Photos, Change Schedule, Home Page Photos, names checks, photo processing and saved drafts. Those four buttons currently say "This part isn't ready yet."

`UPLOAD_TEST_ENABLED` is no longer used and can be deleted from Preview.

**Slice 2, done on this computer (9 November 2026):** Add Gig Poster and take-down, tested in a browser with the real functions against the stand-in GitHub. Passed: too-small picture, a file that isn't a picture, an awkward file name, rotation, empty and past dates, last date and no end date, a resized and re-saved copy of a real poster (R10, then "They're different, keep it"), a 2-page PDF asking which page, three clicks making one commit (R55), and closing the window then "Carry on?" (R44). Not tested: a real HEIC photo, a password-protected PDF, or any of this on Cloudflare.

**Duplicate check:** a 9 x 8 fingerprint could not separate copies from different posters. Replaced by a 16 x 16 brightness grid. Measured on the 8 real posters: copies differ by at most 5.4, different posters by at least 33, and the threshold is 12.

PDF and HEIC libraries are in `site/assets/vendor/`, unmodified, with their licences.

**Slice 3, done on this computer (9 November 2026):** name checks and Add Photos, tested in a browser with the real functions against the stand-in GitHub. Passed: script text refused, "paddy o brien" and "Hazel Tree Malow" offering the right name, "THE   MILL BAR." tidied and confirmed as new, title format, a mixed batch (too small, unreadable, a repeat in the same go, a photo already in the gallery), remove, cover, closing the window then "Carry on?", two clicks making one commit.

**Known gaps for the next slice:** the public gallery does not yet show the chosen cover first (R18). There is no screen yet for taking down photos or albums (R13, R14), though the server side passes. 60 photos at once, a real HEIC photo and Cloudflare are untested through these screens. Checking against the existing gallery took about 15 seconds locally and will take longer on a slow connection.

Owner confirmed already-hidden posters stay in the take-down list, marked as hidden.

**Slice 4, done on this computer (9 November 2026), completing the Stage 3 screens:** the public gallery shows the chosen cover first (R18), and these were tested in a browser with the real functions against the stand-in GitHub: taking down photos and whole events with the photo count (R14), the home-page guard, Change Schedule with every-week and one-date changes, a wrong-weekday date, the clash message and nearest free time (R31), adding a show for a known and a brand-new presenter with a photo (R34), past-midnight wording (R30), Home Page Photos with its minimum of 3 (R27), and closing the window at the read-back (R44).

**Stage 3 is not signed off.** None of these screens has run on Cloudflare. Not tested: a real HEIC photo, a password-protected PDF, 60 real photos through these screens, signing in again after the login expires (R79), a second window (R56), and the "Late" option through the screen. A window closed before the read-back of a schedule or home-photo change loses those few taps. Time lists have up to 96 entries, which needs watching when he tries it (R74).
