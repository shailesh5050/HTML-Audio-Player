const play = document.querySelector(".play");
const pause = document.querySelector(".pause");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");
const currentduration = document.querySelector(".current-duration");
const totalduration = document.querySelector(".total-duration");
const musicSlider = document.querySelector(".music-slider");
const volumeSlider = document.querySelector(".volume-slider");
const loadingSpinner = document.querySelector(".lds-hourglass");

let isPlaying = false;
let isBuffering = false;
let songPlayed = 0;
let audioTotalDuration = 0;
let audioCurrentDuration = 0;
let songs = [
  "https://pagaliworld.com/files/download/type/320/id/7758",
  "https://pagaliworld.com/files/download/type/320/id/2172",
  "https://pagaliworld.com/files/download/type/320/id/13366",
  "https://dns4.pendusaab.com/download/128k-hrf/Jhalak-Dikhlaja.mp3",
];
let audio = new Audio(songs[0]);
audio.volume = volumeSlider.value / 100;
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }
});

function playSong() {
  if (isBuffering) {
    loadingSpinner.classList.remove("hide");
    audio.addEventListener(
      "playing",
      () => {
        loadingSpinner.classList.add("hide");
        play.classList.add("hide");
        pause.classList.remove("hide");
      },
      { once: true }
    );
  } else {
    play.classList.add("hide");
    pause.classList.remove("hide");
  }
  audio.play();
  isPlaying = true;
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  pause.classList.add("hide");
  play.classList.remove("hide");
}

// Play Pause Song
play.addEventListener("click", playSong);
pause.addEventListener("click", pauseSong);

// Next Song
next.addEventListener("click", () => {
  let currentSongIndex = songs.indexOf(audio.src);
  let nextSongIndex = currentSongIndex + 1;
  if (nextSongIndex >= songs.length) {
    nextSongIndex = 0;
  }
  audio.src = songs[nextSongIndex];
  playSong();
});
// Previous Song
prev.addEventListener("click", () => {
  let currentSongIndex = songs.indexOf(audio.src);
  let prevSongIndex = currentSongIndex - 1;
  if (prevSongIndex < 0) {
    prevSongIndex = songs.length - 1;
  }
  audio.src = songs[prevSongIndex];
  playSong();
});

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.round(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
audio.addEventListener("canplaythrough", () => {
  const duration = audio.duration;
  audioTotalDuration = duration;
  totalDuration = formatDuration(duration);
});
audio.addEventListener("timeupdate", () => {
  const duration = audio.duration;
  const formattedDuration = formatDuration(duration);
  currentduration.innerText = formatDuration(audio.currentTime).toString();
  audioCurrentDuration = audio.currentTime;
  totalduration.innerText = formattedDuration === "NaN:NaN" ? "0:00" : formattedDuration;
  updateSlider();
});

function updateSlider() {
  let percentage = (audioCurrentDuration / audioTotalDuration) * 100;
  musicSlider.value = percentage;
}

musicSlider.addEventListener(
  "click",
  () => {
    let audioCurrentime = (musicSlider.value / 100) * audioTotalDuration;
    audio.currentTime = audioCurrentime;
    console.log(audioCurrentime, musicSlider.value);
  },
  { passive: false }
);

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value / 100;
});

audio.addEventListener("waiting", () => {
  isBuffering = true;
  loadingSpinner.classList.remove("hide");
});

audio.addEventListener("playing", () => {
  isBuffering = false;
  loadingSpinner.classList.add("hide");
});

audio.addEventListener("timeupdate", () => {
  songPlayed = (audio.currentTime / audio.duration) * 100;
  console.log(`Song has played ${songPlayed.toFixed(2)}%`);
  const loadedPercentage = (audio.buffered.end(0) / audio.duration) * 100;
  console.log(`Audio is ${loadedPercentage.toFixed(2)}% loaded`);
  if (songPlayed <= 10 && loadedPercentage < 10) {
    console.log("Less than 10% of the song has loaded, pausing playback");
    audio.pause();
  }
  if (!isPlaying && songPlayed > 10 && loadedPercentage >= 10) {
    console.log("Audio is 10% loaded, starting to play");
    //isPlaying = true;
    if (!isBuffering) {
      audio.play();
    }
  }
  if (isPlaying && !isBuffering && audio.buffered.length === 0) {
    console.log("Audio has started buffering, pausing playback");
    isBuffering = true;
    loadingSpinner.classList.remove("hide");
    audio.pause();
  }
  if (isPlaying && isBuffering && audio.buffered.length > 0 && audio.buffered.end(0) === audio.duration) {
    console.log("Audio has finished buffering, resuming playback");
    isBuffering = false;
    loadingSpinner.classList.add("hide");
    audio.play();
  }
});
