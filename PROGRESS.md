# Cork Music Station rebuild: progress

Last updated 8 November 2026. Work is stopped at the end of Stage 2, waiting for the owner's approval.

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

## Not finished

- **Stage 2 approval:** not given yet. The questions below are still open.
- **Stage 3, build:** not started. `site/` does not exist.
- **Stage 4, verify:** not started. `UPDATING.md` is not written and the site has not been run locally.
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

## Questions waiting for the owner

1. Which suspected errors in `source/AUDIT.md` are approved for correction, and what are the right times for the unclear shows?
2. Where should the 165 uncaptioned home page slides go? Suggested: a "From the station's collection" album, plus a short rotating selection on the home page.
3. Who presented the five "Interview With…" recordings (Pat Mulchrone, Michelle Murphy, Eddie Lee, Joe Davitt, John Molloy)? They sit under Mike Murphy. Should George get his own filter for the Margo interview?
4. Should the 2 posters found only on the home page go on Gig Guide (`john-joes-dances-2026.jpg`, `paddy-ob-nov-2026-copy.jpg`)?
5. Can the undated albums keep their current position (Liam Cantillon, Salthill, Cahir House, Rally Cars)?
6. Is there a backup somewhere else to compare against?
7. How should the 10 MP3s over 25 MiB be handled (compress or host elsewhere)? The largest is 56 MiB. The brief requires no file over 25 MiB and also all 24 MP3s kept.

## Known problems

- **No backups were compared.** `source/` did not exist before the crawl.
- **Small gallery photos.** The gallery has no full-size links, and 321 of the 375 photos are old uploads, mostly about 333 x 249 pixels. Larger hidden versions were not looked for.
- **10 MP3s are over 25 MiB** (see question 7).
- **Schedule times:** 2 look wrong and 7 are unclear, all listed in the audit. Any show without a clear time cannot be highlighted as on air.
- **Spelling and name queries** are listed in the audit. None have been changed.
- **Dead on the live site:** the AddonChat server, `lisa-mchugh.com`, the FatCow link, and the old Google Analytics code.
- **Not verified:** two Facebook links in the gallery, because Facebook rejects automated checks.
- **27 home page slides** return 404 under their listed names. All were saved under `_orig` or `published/` names and noted in the manifest.
- **The 165 home page slides have no captions**, so their events are unknown.
- **The crawl scripts were temporary** and are not kept in this project.
- **Git has no name or email set on this computer.** The first commit supplied them for that commit only.
