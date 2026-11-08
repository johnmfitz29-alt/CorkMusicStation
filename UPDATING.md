# Updating the Cork Music Station website

All the files you change are in the `site` folder. Open them in Notepad. Change only the words between quotation marks, and keep every comma, bracket and quotation mark in place.

To see your change before it goes online, right-click `preview.ps1` and choose **Run with PowerShell**, then go to http://localhost:8321/ in your browser. Nothing goes online from this. Close the PowerShell window when you've finished.

## Changing the schedule

Open `site/data/schedule.js`. Each show looks like this:

```
{"id":"mon-tim-coughlan-1900","presenter":"Tim Coughlan","time":"7.00 pm - 9.00 pm","start":"19:00","end":"21:00","contact":"For Requests Email {email}","photo":"images/presenters/tim-coughlan-photo-1.jpg"},
```

- Every name and value needs double quotes, and the last item in a list has no comma after it.
- `id` must be different for every show.
- `time` is what visitors read. Use the same style as the other shows.
- `start` and `end` are in 24-hour Irish time and decide when the show is highlighted as on air. If you change the time, change these too.
- If a show runs past midnight, keep counting: `24:00` is midnight, `24:30` is 12.30 am, `26:00` is 2 am. Keep it under the day the show starts.
- To mark a repeat, add `"repeat":true,` to the show.
- `{email}` is filled in with the station's address automatically.
- To add a show, copy a whole entry, including its comma, and change the details.

The clock changes in spring and autumn are handled automatically.

## Adding a gig poster

1. Put the picture in `site/images/posters/`. Use a simple name with no spaces, such as `dance-december.jpg`.
2. Open `site/data/posters.js` and add a line in the list:

```
  {"file":"images/posters/dance-december.jpg","w":800,"h":1100,"lastDate":"2026-12-31"},
```

`lastDate` is the date of the last gig, as year-month-day. The poster disappears the day after. For a poster with no end, use `"noEnd":true` in its place.

`w` and `h` are the picture's width and height in pixels. In File Explorer, right-click the picture and look under Properties, then Details. To remove a poster, delete its line. The last line in the list doesn't need a comma.

## Adding an interview

1. Keep the MP3 under 25 MB. Use a simple name with no spaces, and put it in `site/audio/`.
2. Open `site/data/interviews.js`, find the presenter, and add a line to their list:

```
    { title: "Michelle Interviews Someone New", file: "michelle_interviews_someone_new.mp3" },
```

A new presenter needs a new block, copied from an existing one. The filter button appears by itself.

## Changing the stream address

Open `site/data/config.js` and put the address between the quotes on the `streamUrl` line:

```
streamUrl: "https://your-stream-address-here",
```

It must start with `https://`. Until it is filled in, Listen live says the stream has not been added yet. The email address and station name are in the same file.

The radio tries to start when the site opens. Most browsers wait for the visitor's first tap before allowing sound. To make it wait for Listen live instead, change `autoplay: true` to `autoplay: false`.

## Home page photos

The photos that rotate on the home page are listed in `site/data/home-photos.js`. The updating app planned for later will let you choose them.

## If something stops working

A missing comma or quotation mark in one of these files stops that part of the page from appearing. Check the line you last changed against the examples above, or undo your change.
