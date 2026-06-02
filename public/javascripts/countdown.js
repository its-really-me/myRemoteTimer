// Credit: Mateusz Rybczonec 
let time_limit = 120;
const FULL_DASH_ARRAY = 283;
let WARNING_THRESHOLD = time_limit / 4;
let ALERT_THRESHOLD = time_limit / 10;
let min = getMin(time_limit);
let sec = getSec(time_limit);

const COLOR_CODES = {
  info: { 
    color: "green",
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD,
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD,
  },
};

let timePassed = 0;
let timeLeft = time_limit;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;
document.getElementById("controls").innerHTML = `
  <div class="controls">
  <!-- Buttons to start, stop and reset the countdown and to open the dialog to change the duration-->
    <button id="change-button" class="change-button" onclick="openForm()">Setup</button>
    <button id="start-button" onclick="startTimer()">Start</button>
    <button id="pause-button" disabled onclick="pauseCountdown()">Pause</button>
    <button id="reset-button" disabled onclick="resetCountdown()">Reset</button>
    <!-- The form to change the duration -->
    <div class="form-popup" id="changeForm">
      <form id="duration-form" onsubmit="return changeDuration(this)" class="form-container">
        <h1>Change duration</h1>
        <label for="min"><b>Min</b></label>
        <input id="minutes" type="number" value=${min} name="minutes" required">
        <label for="duration"><b>Sec</b></label>
        <input id="duration" type="number" value=${sec} name="duration" required">
        <button type="submit" class="btn" onclick="closeForm()">Change</button>
        <button type="button" class="btn cancel" onclick="closeForm()">Close</button>
      </form>
    </div>
  </div>
`;

function openForm() {
  document.getElementById("changeForm").style.display = "block";
}

function closeForm() {
  document.getElementById("changeForm").style.display = "none";
}

function syncState(status) {
  fetch('/api/status?id=' + TIMER_ID, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ setTime: Number(time_limit), timeLeft: timeLeft, status: status })
  }).catch(function() {});
}

function pauseCountdown() {
  clearInterval(timerInterval);
  setButtonStates("paused");
  syncState('paused');
  new Audio("jingles/pause.mp3").play();
}

function resetCountdown() {
  clearInterval(timerInterval);
  timePassed = 0;
  timeLeft = time_limit;
  timerInterval = null;
  remainingPathColor = COLOR_CODES.info.color;
  setCircleDasharray();
  setRemainingPathColor(timeLeft);
  setButtonStates("reset");
  document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
  syncState('stopped');
  new Audio("jingles/reset.mp3").play();
}

function onTimesUp() {
  clearInterval(timerInterval);
  setButtonStates("reset");
  syncState('finished');
  new Audio("jingles/chime.mp3").play();
}

function changeDuration(form) {
  var totalSeconds = Number(form.minutes.value) * 60 + Number(form.duration.value);
  if (totalSeconds <= 0) return false;

  time_limit = totalSeconds;
  WARNING_THRESHOLD = time_limit / 4;
  ALERT_THRESHOLD = time_limit / 10;
  COLOR_CODES.warning.threshold = WARNING_THRESHOLD;
  COLOR_CODES.alert.threshold = ALERT_THRESHOLD;

  clearInterval(timerInterval);
  timePassed = 0;
  timeLeft = time_limit;
  timerInterval = null;

  setCircleDasharray();
  setRemainingPathColor(timeLeft);
  setButtonStates("reset");
  document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
  syncState('stopped');

  min = getMin(time_limit);
  sec = getSec(time_limit);
  form.minutes.value = min;
  form.duration.value = sec;

  return false;
}


function startTimer() {
  syncState('running');
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = time_limit - timePassed;
    document.getElementById("base-timer-label").innerHTML =
      formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
    setButtonStates("started");
    syncState('running');

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function getMin(time) {
  return Math.floor(time / 60);
}

function getSec(time) {
  return time % 60;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setButtonStates(state) {
  const start = document.getElementById("start-button");
  const reset = document.getElementById("reset-button");
  const pause = document.getElementById("pause-button");
  const change = document.getElementById("change-button");
  if (state == "started") {
    start.setAttribute("disabled", "");
    change.setAttribute("disabled", "");
    reset.removeAttribute("disabled");
    pause.removeAttribute("disabled");
  } else if (state == "reset") {
    start.removeAttribute("disabled");
    change.removeAttribute("disabled");
    reset.setAttribute("disabled", "");
    pause.setAttribute("disabled", "");
  } else if (state == "paused") {
    start.removeAttribute("disabled");
    reset.removeAttribute("disabled");
    pause.setAttribute("disabled", "");
  }
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning } = COLOR_CODES;
  const path = document.getElementById("base-timer-path-remaining");
  path.classList.remove("green", "orange", "red");
  if (timeLeft <= alert.threshold) {
    path.classList.add("red");
  } else if (timeLeft <= warning.threshold) {
    path.classList.add("orange");
  } else {
    path.classList.add("green");
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / time_limit;
  return rawTimeFraction - (1 / time_limit) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

