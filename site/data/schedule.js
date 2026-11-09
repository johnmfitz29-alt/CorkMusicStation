/* The DJ Schedule. This file is strict JSON inside window.SCHEDULE, so the updating app can read it.
   Every name and value needs double quotes, and there is no comma after the last item in a list.
   time = the words shown on the page.
   start, end = 24-hour Irish time. A show running past midnight keeps counting up: 24:00 is midnight, 26:00 is 2 am.
   late = true means the finish varies; end is then midnight, for highlighting only.
   {email} is replaced by the address in config.js.
   oneOffs = changes for a single date, which stop applying by themselves after that date. */
window.SCHEDULE = {
"weekly": [
{ "day": "Monday", "shows": [
  {"id":"mon-tim-coughlan-1900","presenter":"Tim Coughlan","time":"7.00 pm - 9.00 pm","start":"19:00","end":"21:00","contact":"For Requests Email {email}","photo":"images/presenters/tim-coughlan-photo-1.jpg"},
  {"id":"mon-george-f-langan-2230","presenter":"George F Langan","show":"George's Late Show","time":"10.30 pm - Late","start":"22:30","end":"24:00","contact":"Email George {email}","photo":"images/presenters/george-profile_orig.jpg","late":true}
]},
{ "day": "Tuesday", "shows": [
  {"id":"tue-jimmy-reidy-2000","presenter":"Jimmy Reidy","show":"Jimmy Reidy & Friends","time":"8.00 pm - 9.00 pm","start":"20:00","end":"21:00","contact":"Email Jimmy {email}","photo":"images/presenters/jimmy-reidy.jpg"},
  {"id":"tue-sean-radley-2100","presenter":"Seán Radley","show":"Radio Treasures","time":"9.00 pm - 11.00 pm","start":"21:00","end":"23:00","contact":"For Requests Text Seán On 086 8250074 Email {email}","photo":"images/presenters/sean-radley-photo-2.jpg"}
]},
{ "day": "Wednesday", "shows": [
  {"id":"wed-tim-coughlan-1900","presenter":"Tim Coughlan","time":"7.00 pm - 9.00 pm","start":"19:00","end":"21:00","contact":"For Requests Email {email}","photo":"images/presenters/tim-coughlan-photo-3.jpg"},
  {"id":"wed-breeda-2100","presenter":"Breeda Piggott","time":"9.00 pm - 11.30 pm","start":"21:00","end":"23:30","contact":"For Requests Text Breeda On 087 6251029 Email {email}","photo":"images/presenters/675619115.jpg"}
]},
{ "day": "Thursday", "shows": [
  {"id":"thu-john-nip-1930","presenter":"John Nip","show":"The John Nip Show","time":"7.30 pm - 9.00 pm","start":"19:30","end":"21:00","contact":"For Requests Text John Nip 087 2207939 Email {email}","photo":"images/presenters/john-nip_1.jpg"},
  {"id":"thu-danny-tobin-2100","presenter":"Danny Tobin","show":"The Danny Tobin Show","time":"9.00 pm - 10.00 pm","start":"21:00","end":"22:00","contact":"For Requests Email Danny on {email}","photo":"images/presenters/danny.jpg"},
  {"id":"thu-willie-2200","presenter":"Willie Fitzgerald","show":"Willie's Country Favourites","time":"10.00 pm - 12.00 midnight","start":"22:00","end":"24:00","contact":"For Requests Text Willie 087 2229874 Email {email}","photo":"images/presenters/144531591.jpg"},
  {"id":"thu-vincent-murray-2400","presenter":"Vincent Murray","time":"12.00 midnight - 2.00 am","repeat":true,"start":"24:00","end":"26:00","contact":"For Requests Text Vincent on 086 3746180","photo":"images/presenters/vincent-photo_orig.jpg"}
]},
{ "day": "Friday", "shows": [
  {"id":"fri-jimmy-reidy-2000","presenter":"Jimmy Reidy","show":"Jimmy Reidy's Music Show","time":"8.00 pm - 9.00 pm","start":"20:00","end":"21:00","contact":"Email Jimmy {email}","photo":"images/presenters/jimmy-reidy-2.jpg"},
  {"id":"fri-sean-radley-2100","presenter":"Seán Radley","show":"Radio Treasures","repeat":true,"time":"9.00 pm - 11.00 pm","start":"21:00","end":"23:00","contact":"For Requests Text Seán On 086 8250074 Email {email}","photo":"images/presenters/sean-radley-photo-2_orig.jpg"}
]},
{ "day": "Saturday", "shows": [
  {"id":"sat-david-marks-1100","presenter":"David Marks","show":"Sounds Irish","time":"11.00 am - 1.00 pm","start":"11:00","end":"13:00","contact":"Email David {email}","photo":"images/presenters/davidmarks-pic.jpg"},
  {"id":"sat-jimmy-reidy-1300","presenter":"Jimmy Reidy","show":"Jimmy Reidy's Music Show","repeat":true,"time":"1.00 pm - 2.00 pm","start":"13:00","end":"14:00","contact":"Email Jimmy {email}","photo":"images/presenters/jimmy-reidy.jpg"},
  {"id":"sat-tim-coughlan-1500","presenter":"Tim Coughlan","time":"3.00 pm - 6.00 pm","start":"15:00","end":"18:00","contact":"For Requests Email {email}","photo":"images/presenters/tim-coughlan-photo-1.jpg"},
  {"id":"sat-george-f-langan-2000","presenter":"George F Langan","show":"George's Country Corner","time":"8.00 pm - 12.30 am","start":"20:00","end":"24:30","contact":"Email George {email}","photo":"images/presenters/george-profile.jpg"}
]},
{ "day": "Sunday", "shows": [
  {"id":"sun-barry-o-halloran-1030","presenter":"Barry O'Halloran","show":"Beautiful Sunday","time":"10.30 am - 12.30 pm","start":"10:30","end":"12:30","contact":"For Requests Text Barry on 087 4129315 Or Email {email}","photo":"images/presenters/dj-barry.jpg"},
  {"id":"sun-tim-coughlan-1500","presenter":"Tim Coughlan","time":"3.00 pm - 5.00 pm","start":"15:00","end":"17:00","contact":"For Requests Email {email}","photo":"images/presenters/tim-coughlan-photo-1.jpg"},
  {"id":"sun-vincent-murray-2000","presenter":"Vincent Murray","time":"8.00 pm - 10.00 pm","start":"20:00","end":"22:00","contact":"For Requests Email Vincent {email} or Text Vincent on 086 3746180","photo":"images/presenters/dj-vincent.jpg"},
  {"id":"sun-jimmy-reidy-2200","presenter":"Jimmy Reidy","show":"Jimmy Reidy & Friends","repeat":true,"time":"10.00 pm - 11.15 pm","start":"22:00","end":"23:15","contact":"Email Jimmy {email}","photo":"images/presenters/jimmy-reidy-2.jpg"}
]}
],
"oneOffs": [
{"id":"o-chg-1d19-1","date":"2027-06-21","type":"off","showId":"mon-george-f-langan-2230"}
]
};
