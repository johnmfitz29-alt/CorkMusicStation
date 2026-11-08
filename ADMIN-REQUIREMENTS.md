**Design rule: he can't break the site, nothing goes live until he has read it back, and everything can be undone.** No system can stop a correctly entered wrong date or photo, so read-backs, Undo and an alert to you cover that gap.

**His screens**

Desktop icon → four big buttons, plus **Get Help**, which emails you what he was doing.

| Task | What he does | What the system does |
|---|---|---|
| **Add Gig Poster** | Chooses a picture or PDF, checks it's the right way up, picks the date | Blocks unreadably small files, spots duplicates, sorts by date, hides the poster after the gig |
| **Add Photos** | Picks an event or "New event", then adds photos | Builds the title in one format (event, venue, month, year), shows thumbnails to remove, chooses a cover |
| **Change Schedule** | Taps a show on a weekly grid, then picks what changes | Asks "**Just this week, or every week?**" One-off changes revert by themselves |
| **Undo** | Taps a plain-English entry: "Tuesday 3.15 pm: added 12 photos" | Restores it, offers only safe undos, and Undo can itself be undone |

Every task ends the same way: a preview, a sentence such as "Thursday at 9 in the evening: Danny Tobin", then one green **Put It On The Website**.

**Schedule rules**
- Times are picked in 15-minute steps, in words, such as "9.00 in the evening".
- Past-midnight shows read "finishes Sunday morning at 12.30".
- Clashes are blocked, and it offers the nearest free time.
- Times are always Irish time, including across clock changes.

**Names and spelling**

Free text exists only for a new event, venue or presenter. Each entry passes through this order, and no AI is involved:
1. **Automatic tidy-up:** spaces, caps lock, stray apostrophes, and Irish capitalisation such as O'Brien and McHugh.
2. **Master names list,** built from the current site once you've approved the spellings. Known misspellings convert automatically (Bumblence → Bumbleance). Fadas are protected.
3. **Close match:** "Did you mean…?" with big buttons.
4. **No match:** he confirms it's new, and you're told.

Removing presenters, editing the master list and changing the design stay with you. He's never offered them.

**What protects him behind the scenes**
- **Drafts save constantly.** After a crash or closed window: "You were adding photos. Carry on?"
- **Photos:** phone formats are converted, photos rotated, location data removed, and files renamed safely.
- **All or nothing:** photos and their data are published as one change, so an album can't go half live.
- **Double checking:** the server repeats every check, and the build check is the last line of defence.
- **Restricted reach:** the function can write only to the data and image folders.
- **Real confirmation:** "It's on the website" appears only after the live site has been checked. If it fails: "Nothing is broken. The old page is still there, and John has been told."
- **Interruptions:** double clicks, a second open tab and lost internet are all handled. It tells him to try again later and keeps his work.

**Security and upkeep**
- Cloudflare Access must protect both the page and its functions, and the function must verify the login itself.
- Use a GitHub token limited to this repository, and block deletion or overwriting of the main history.
- You get an email for each publish, so you can check and undo from anywhere.
- It should warn you, never him, as file counts near the host's limits. Upload photos in small batches to stay inside the free function limits.

**Designed for him**
- Very large text, high contrast, no hover menus and no time limits.
- One main action per screen, and a Back button everywhere.
- Words such as "Publish", "upload" and "error" never appear.
- Messages never blame him.

**Testing before he touches it**
- **Bad input:** every real error from the current site, plus sideways photos, huge files, a PDF poster, the same photo twice and 200 photos at once.
- **Sabotage:** pull the internet mid-upload, close the window mid-publish, double-click everything, open two tabs, let the login expire, and have you push a change at the same moment.
- **Practice Mode:** a yellow banner and a copy of the site, so nothing he does counts.
- **Watch him do it** with no help, and fix each hesitation.
- **First two weeks:** you review every publish.
- **A one-page printed card** with large pictures of the four buttons.

To build it, give this message to Claude Code in plan mode with the starter prompt from my last message. Ask it to treat this as the requirements and produce one acceptance test per bullet. Do you want this as a doc you can keep with the rebuild guide?