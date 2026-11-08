# Cork Music Station rebuild: progress

Last updated 8 November 2026. Stages 3 and 4 are done locally. `site/` is built and tested on this computer, waiting for the owner's review. Nothing has been published.

## Finished

**Stage 1: copy of the current site**
- `source/live/` holds 631 files, about 615 MiB, in their original folder paths.
- `source/manifest.csv` has 660 rows: 632 downloaded, 28 not. The home page has two rows for one file, which is why there are 631 files on disk.
- The server never refused a request.

**Stage 2: audit**
- `source/AUDIT.md` is the full report.
- 6 pages, 24 MP3s, 375 gallery photos in 30 albums, 7 Gig Guide posters, 214 other images.

**Housekeeping**
- `CLAUDE.md` holds the standing rules.
- Git is set up locally, with `source/` in `.gitignore`.

**Admin area, `SPEC.md` Stage 1 (8 November 2026):** code done locally and tested, not committed. See "Stage 1 results" in `SPEC.md`. Waiting on the owner for `TO-APPROVE.md` and `SETUP-CHECKLIST.md`. Node.js was installed with winget to run the tests (`npm test`).

## Not finished

- **Owner's review of `site/`:** not done yet. Screenshots at 390px and 1280px are in `review/`. Run `preview.ps1` to see the site at http://localhost:8321/.
- **Stream:** the Radiojar listener address is in `site/data/config.js`. The broadcast password is not stored in this project and must never be. Full functional test passed in Chrome on 8 November 2026 with the real stream, including from an https page.
- **Not tested yet:** real phones, especially iPhone Safari. Radiojar redirects listeners to a plain http server, which Chrome handled but Safari may treat differently, so test on an iPhone once the site is on https. The two Facebook links cannot be checked automatically.
- **Next:** styling pass with the owner.
- **Git:** the first full build is committed locally as `603d744`. The medium wine-red restyle and `review/style-samples/` are not committed yet. Nothing has been pushed.
- **Stage 4 results, 8 November 2026:** every internal link, image and MP3 passed at both widths in Chrome. After the owner's changes: 691 files, largest 23.3 MiB. `asset-map.csv` shows where each original went. Of 632 downloaded files, 571 are used. The other 61 are 9 old pages and site files (rebuilt), 3 builder files, 21 theme graphics, 5 larger duplicates of home page slides, and 23 files the owner chose to remove.
- **Nothing has been published or pushed.**

`source/` is in `.gitignore`, so the copy, `manifest.csv` and `AUDIT.md` are not in git. They exist only on this computer.

## Decisions made by the owner

From the original brief:

- **Build:** static site in `site/`, plain HTML, CSS and minimal JavaScript, no framework or build step.
- **Keep:** all pages and .html addresses, all content, every photo, all 24 MP3s, the requests email, text-in details, presenter details and memorial tributes.
- **Audience:** older listeners on phones. Large text, high contrast, big tap targets, simple navigation, WCAG AA. Warm, modern look that suits an Irish country music station.
- **Listening:** large Listen button on every page, no autoplay, music keeps playing while browsing (for example a small pop-out player), clear message if the stream is off air.
- **Schedule:** one simple data file, shown in Irish time and correct across clock changes. Highlight the show on air now, show what is next, mark repeats.
- **Gig Guide:** reads a simple posters list. Posters open full size.
- **Gallery:** albums by event, newest first, lightbox, lazy-loaded web-sized images. Alt text comes from the event name; never guess who is pictured.
- **Archives:** audio player and download link for each interview, with filters by presenter.
- **Chat:** clearly marked placeholder for an HTML5 embed, with the requests email as the fallback.
- **Config:** stream URL, chat embed, contact details and station name in one config file. Stream URL and chat embed stay as placeholders.
- **Also add:** page titles, descriptions, social preview images, favicon, sitemap.xml, robots.txt, friendly 404 page, https throughout.
- **Replace** the W3Counter with a privacy-friendly option needing no cookie banner, or explain why not.
- **Remove** the FatCow credit, empty tables and leftover builder markup.
- **Keep originals** in `source/` and out of `site/`.
- **Stage 4 checks:** run locally and give the address. Test every internal link, image and MP3 at phone and desktop widths. Confirm every manifest file is used or explain why not. No file over 25 MiB, and under 20,000 files in `site/`. Write `UPDATING.md` in plain English: changing the schedule, adding a poster, adding an interview, changing the stream address.

## Owner's changes after reviewing the site (8 November 2026)

These replace anything different in the original brief above.

- **Removed from `site/` (originals remain in `source/`):** all 19 interviews in the Mike Murphy and Michelle Murphy sections, leaving 5; the phone-screenshot poster `paddy-ob-nov-2026-copy` (also from the collection album), leaving 8 posters; Lisa McHugh's whole Links entry.
- **Removed features:** the chat room and the visitor counter. Neither is wanted.
- **Radio:** autoplay replaces "no autoplay". It tries to start when the site opens, or on the first tap if the browser blocks it. The player is in the page and keeps playing between pages, replacing the pop-out window.
- **Look (chosen from samples in `review/style-samples/`, `mix-medium`):** a station column holding the original single-disc logo, name, Listen button and menu, across the top on phones and down the side on large screens. Deep wine-red page, darker wine column, ivory Listen button, no badges or crests. One font for all text, Atkinson Hyperlegible, stored in `site/assets/fonts/`. The home page also shows the presenter on air and today's shows.
- **Clock:** shows Irish time and the visitor's own time.
- **Planned, not built:** an updating app for the station's editor, including choosing the home page photos. Those are listed in `site/data/home-photos.js`, ready for it.

## Owner's answers to the Stage 2 questions (8 November 2026)

1. **Schedule times, as confirmed by the owner:**
   - Monday, George F Langan: 10.30 pm - Late (the finish varies, so there is no fixed end time)
   - Tuesday, Jimmy Reidy: 8.00 - 9.00 pm
   - Thursday, John Nip: 7.30 - 9.00 pm
   - Thursday, Danny Tobin: 9.00 - 10.00 pm
   - Thursday, Willie: 10.00 pm - 12.00 midnight
   - Thursday night, Vincent Murray: 12.00 - 2.00 am (Repeat). Technically Friday morning, but it continues on from the Thursday night programme.
   - Saturday, David Marks: 11.00 am - 1.00 pm
   - Saturday, Jimmy Reidy: 1.00 - 2.00 pm
   - Saturday, George F Langan: 8.00 pm - 12.30 am

   **Spelling and punctuation:**
   - Approved, using the suggested wording:
     - Georges Late Show becomes George's Late Show
     - Georges Country Corner becomes George's Country Corner
     - Willies Country Favourites becomes Willie's Country Favourites
     - Barry O\` Halloran becomes Barry O'Halloran
     - Jimmy Reidy Music Show (Saturday repeat) becomes Jimmy Reidy's Music Show
     - Danny becomes Danny Tobin throughout
     - For Request becomes For Requests
     - E mail / e mail to: becomes Email / Email to:
     - Corkmusicstation@gmail.com becomes corkmusicstation@gmail.com
     - (irish Time) becomes (Irish Time)
     - Stray full stops after two schedule entries and two email addresses are removed
     - Our Dear Departed DJ'S becomes Our Dear Departed DJs
     - Gone But Not forgotten becomes Gone But Not Forgotten
     - Seamus Fitzsimmon becomes Seamus Fitzsimmons
   - Stays as written: Normand Boland.
   - Also approved, using the suggested wording:
     - Michelle\`s Thank yous becomes Michelle's Thank yous
     - .Interview With John Molloy. becomes Interview With John Molloy
     - Willie Interviews Michelle. becomes Willie Interviews Michelle Murphy
     - MP3 download names are corrected ("intervies", "morrisey", double dots)
     - Glor Tire becomes Glór Tíre (4 albums)
     - Paddy O\` Brien / Paddy O Brien becomes Paddy O'Brien
     - Hugh O Brien becomes Hugh O'Brien
     - Caroline\`s Fundraiser 2013 becomes Caroline's Fundraiser 2013
     - Tipp F.M Country Music Award's becomes Tipp FM Country Music Awards
     - Gloria,Heart to Heart becomes Gloria, Heart to Heart
     - Gina,Dale Haze becomes Gina, Dale Haze
     - lisaMcHugh becomes Lisa McHugh
     - http://www. dannyolearymusic .com becomes www.dannyolearymusic.com
     - Danny O Leary becomes Danny O'Leary
   - Owner's own wording: Kades Kounty becomes Kade's County.
   - Stays as written: Castleahan (no alternative was suggested).
2. **165 uncaptioned slides:** a "From the station's collection" album, plus a short rotating selection on the home page.
3. **Archives filters:** the five "Interview With…" recordings (Pat Mulchrone, Michelle Murphy, Eddie Lee, Joe Davitt, John Molloy) stay under Mike Murphy. George gets his own filter for the Margo interview.
4. **Posters:** add both home-page-only posters to Gig Guide (`john-joes-dances-2026.jpg`, `paddy-ob-nov-2026-copy.jpg`), making 9.
5. **Undated albums** keep their current position (Liam Cantillon, Salthill, Cahir House, Rally Cars).
6. **Backup:** there is none to compare against.
7. **MP3s over 25 MiB:** compress only those 10 to under 25 MiB for `site/`. The originals stay untouched in `source/`.

## Known problems

- **No backups were compared.** `source/` did not exist before the crawl.
- **Small gallery photos.** The gallery has no full-size links, and 321 of the 375 photos are old uploads, mostly about 333 x 249 pixels. Larger hidden versions were not looked for.
- **MP3s over 25 MiB:** of the 5 interviews kept, Breeda's, George's and Willie's Michelle Murphy interview were compressed with ffmpeg (installed with winget) to mono at 80 to 128 kbps. The originals are untouched in `source/`.
- **Schedule times:** all 9 queried times are now confirmed (see answer 1). George F Langan's Monday show has no fixed end time, so it is highlighted as on air until midnight. The page still reads "10.30 pm - Late".
- **Spelling and name queries** are listed in the audit. Answer 1 records the decision on each. The audit and the copy in `source/` are not changed; approved corrections apply when `site/` is built.
- **Dead on the live site:** the AddonChat server, `lisa-mchugh.com`, the FatCow link, and the old Google Analytics code.
- **Not verified:** two Facebook links in the gallery, because Facebook rejects automated checks.
- **27 home page slides** return 404 under their listed names. All were saved under `_orig` or `published/` names and noted in the manifest.
- **The 165 home page slides have no captions**, so their events are unknown.
- **The crawl scripts were temporary** and are not kept in this project.
- **Git has no name or email set on this computer.** The first commit supplied them for that commit only.
