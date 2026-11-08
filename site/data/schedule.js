/* The DJ Schedule. See UPDATING.md for how to change it.
   time    = the words shown on the page
   start, end = 24-hour Irish time, used to highlight the show on air.
   A show running past midnight keeps counting up: 24:00 is midnight, 26:00 is 2 am.
   Leave start and end out if the time is not known; the show then cannot be highlighted.
   {email} is replaced by the address in config.js. */
window.SCHEDULE = [
  { day: "Monday", shows: [
    { presenter: "Tim Coughlan", time: "7.00 pm. - 9.00 pm. (Irish Time)", start: "19:00", end: "21:00",
      contact: "For Requests Email {email}", photo: "images/presenters/tim-coughlan-photo-1.jpg" },
    { presenter: "George F Langan", show: "George's Late Show", time: "10.30 pm - Late (Irish Time)", start: "22:30", end: "24:00",
      contact: "Email George {email}", photo: "images/presenters/george-profile_orig.jpg" }
  ]},
  { day: "Tuesday", shows: [
    { presenter: "Jimmy Reidy", show: "Jimmy Reidy & Friends", time: "8.00 - 9.00 pm", start: "20:00", end: "21:00",
      contact: "Email Jimmy {email}", photo: "images/presenters/jimmy-reidy.jpg" },
    { presenter: "Seán Radley", show: "Radio Treasures", time: "9.00 - 11.00 pm (Irish Time)", start: "21:00", end: "23:00",
      contact: "For Requests Text Seán On 086 8250074 Email {email}", photo: "images/presenters/sean-radley-photo-2.jpg" }
  ]},
  { day: "Wednesday", shows: [
    { presenter: "Tim Coughlan", time: "7.00 pm. - 9.00 pm. (Irish Time)", start: "19:00", end: "21:00",
      contact: "For Requests Email {email}", photo: "images/presenters/tim-coughlan-photo-3.jpg" },
    { presenter: "Breeda", time: "9.00 - 11.30 pm (Irish Time)", start: "21:00", end: "23:30",
      contact: "For Requests Text Breeda On 087 6251029 Email {email}", photo: "images/presenters/675619115.jpg" }
  ]},
  { day: "Thursday", shows: [
    { presenter: "John Nip", show: "The John Nip Show", time: "7.30 - 9.00 pm", start: "19:30", end: "21:00",
      contact: "For Requests Text John Nip 087 2207939 Email {email}", photo: "images/presenters/john-nip_1.jpg" },
    { presenter: "Danny Tobin", show: "The Danny Tobin Show", time: "9.00 - 10.00 pm", start: "21:00", end: "22:00",
      contact: "For Requests Email Danny on {email}", photo: "images/presenters/danny.jpg" },
    { presenter: "Willie", show: "Willie's Country Favourites", time: "10.00 pm - 12.00 midnight (Irish Time)", start: "22:00", end: "24:00",
      contact: "For Requests Text Willie 087 2229874 Email {email}", photo: "images/presenters/144531591.jpg" },
    { presenter: "Vincent Murray", time: "12.00 - 2.00 am", repeat: true, start: "24:00", end: "26:00",
      contact: "For Requests Text Vincent on 086 3746180", photo: "images/presenters/vincent-photo_orig.jpg" }
  ]},
  { day: "Friday", shows: [
    { presenter: "Jimmy Reidy", show: "Jimmy Reidy's Music Show", time: "8.00 pm - 9.00 pm", start: "20:00", end: "21:00",
      contact: "Email Jimmy {email}", photo: "images/presenters/jimmy-reidy-2.jpg" },
    { presenter: "Seán Radley", show: "Radio Treasures", repeat: true, time: "9.00 - 11.00 pm (Irish Time)", start: "21:00", end: "23:00",
      contact: "For Requests Text Seán On 086 8250074 Email {email}", photo: "images/presenters/sean-radley-photo-2_orig.jpg" }
  ]},
  { day: "Saturday", shows: [
    { presenter: "David Marks", show: "Sounds Irish", time: "11.00 am - 1.00 pm (Irish Time)", start: "11:00", end: "13:00",
      contact: "Email David {email}", photo: "images/presenters/davidmarks-pic.jpg" },
    { presenter: "Jimmy Reidy", show: "Jimmy Reidy's Music Show", repeat: true, time: "1.00 - 2.00 pm (Irish Time)", start: "13:00", end: "14:00",
      contact: "Email Jimmy {email}", photo: "images/presenters/jimmy-reidy.jpg" },
    { presenter: "Tim Coughlan", time: "3.00 pm. - 6.00 pm. (Irish Time)", start: "15:00", end: "18:00",
      contact: "For Requests Email {email}", photo: "images/presenters/tim-coughlan-photo-1.jpg" },
    { presenter: "George F Langan", show: "George's Country Corner", time: "8.00 pm - 12.30 am (Irish Time)", start: "20:00", end: "24:30",
      contact: "Email George {email}", photo: "images/presenters/george-profile.jpg" }
  ]},
  { day: "Sunday", shows: [
    { presenter: "Barry O'Halloran", show: "Beautiful Sunday", time: "10.30am - 12.30pm", start: "10:30", end: "12:30",
      contact: "For Requests Text Barry on 087 4129315 Or Email {email}", photo: "images/presenters/dj-barry.jpg" },
    { presenter: "Tim Coughlan", time: "3.00 pm. - 5.00 pm. (Irish Time)", start: "15:00", end: "17:00",
      contact: "For Requests Email {email}", photo: "images/presenters/tim-coughlan-photo-1.jpg" },
    { presenter: "Vincent Murray", time: "8.00 PM - 10.00PM (Irish Time)", start: "20:00", end: "22:00",
      contact: "For Requests Email Vincent {email} or Text Vincent on 086 3746180", photo: "images/presenters/dj-vincent.jpg" },
    { presenter: "Jimmy Reidy", show: "Jimmy Reidy & Friends", repeat: true, time: "10.00 PM - 11.15PM", start: "22:00", end: "23:15",
      contact: "Email Jimmy {email}", photo: "images/presenters/jimmy-reidy-2.jpg" }
  ]}
];
