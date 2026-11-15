/* Station settings. Change the text between the quotes only. See UPDATING.md. */
window.CONFIG = {
  stationName: "Cork Music Station",
  email: "corkmusicstation@gmail.com",

  /* The https address of the live stream, for listeners. Never put the broadcast password here. */
  streamUrl: "https://stream.radiojar.com/tv0hdvbuntpwv",

  /* Where the site reads the song that is playing, from the radio provider.
     Put nothing between the quotes ("") to hide the "Now playing" line. */
  nowPlayingUrl: "https://www.radiojar.com/api/stations/tv0hdvbuntpwv/now_playing/",

  /* true = the radio tries to start when the site opens. false = it waits for Listen live. */
  autoplay: true
};
