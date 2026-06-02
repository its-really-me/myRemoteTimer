var setTime = Number(INITIAL_STATE.setTime) || 120;
var timerStatus = INITIAL_STATE.status;
// Normalise timeLeft based on status so the view is always consistent
var timeLeft = timerStatus === 'stopped'  ? setTime
             : timerStatus === 'finished' ? 0
             : timerStatus === 'running'  ? Math.max(0, Number(INITIAL_STATE.timeLeft) - 1)
             : Number(INITIAL_STATE.timeLeft);

var FULL_DASH_ARRAY = 283;
var WARNING_THRESHOLD = setTime / 4;
var ALERT_THRESHOLD = setTime / 10;

var COLOR_CODES = {
  info:    { color: 'green' },
  warning: { color: 'orange', threshold: WARNING_THRESHOLD },
  alert:   { color: 'red',    threshold: ALERT_THRESHOLD }
};

// Determine initial ring color
var remainingPathColor = COLOR_CODES.info.color;
if (timeLeft <= ALERT_THRESHOLD) {
  remainingPathColor = COLOR_CODES.alert.color;
} else if (timeLeft <= WARNING_THRESHOLD) {
  remainingPathColor = COLOR_CODES.warning.color;
}

document.getElementById('app').innerHTML =
  '<div class="base-timer">' +
    '<svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="base-timer__circle">' +
        '<circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>' +
        '<path id="base-timer-path-remaining"' +
          ' stroke-dasharray="283"' +
          ' class="base-timer__path-remaining ' + remainingPathColor + '"' +
          ' d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0">' +
        '</path>' +
      '</g>' +
    '</svg>' +
    '<span id="base-timer-label" class="base-timer__label">' + formatTime(timeLeft) + '</span>' +
  '</div>';

updateRing(timeLeft);

var SOUNDS = {
  finished: '/jingles/chime.mp3',
  paused:   '/jingles/pause.mp3',
  stopped:  '/jingles/reset.mp3'
};

var prevStatus = timerStatus;
var timerId = INITIAL_STATE.id;
var audioEnabled = false;

var soundBtn = document.getElementById('sound-toggle');
var soundIcon = document.getElementById('sound-icon');

soundBtn.onclick = function() {
  audioEnabled = !audioEnabled;
  soundIcon.className = audioEnabled ? 'fa fa-volume-up' : 'fa fa-volume-off';
  soundBtn.classList.toggle('enabled', audioEnabled);
};

setInterval(function() {
  fetch('/api/status?id=' + timerId)
    .then(function(r) { return r.json(); })
    .then(function(state) {
      setTime = Number(state.setTime) || setTime;
      WARNING_THRESHOLD = setTime / 4;
      ALERT_THRESHOLD = setTime / 10;

      timeLeft = state.status === 'stopped'  ? setTime
               : state.status === 'finished' ? 0
               : state.status === 'running'  ? Math.max(0, Number(state.timeLeft) - 1)
               : Number(state.timeLeft);

      document.getElementById('base-timer-label').innerHTML = formatTime(timeLeft);
      updateRing(timeLeft);

      if (state.status !== prevStatus) {
        if (audioEnabled && SOUNDS[state.status]) new Audio(SOUNDS[state.status]).play();
        prevStatus = state.status;
      }
    })
    .catch(function() {});
}, 1000);

function formatTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;
  return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

function calculateTimeFraction(tLeft) {
  var raw = tLeft / setTime;
  return raw - (1 / setTime) * (1 - raw);
}

function updateRing(tLeft) {
  var dasharray = (calculateTimeFraction(tLeft) * FULL_DASH_ARRAY).toFixed(0) + ' 283';
  var path = document.getElementById('base-timer-path-remaining');
  path.setAttribute('stroke-dasharray', dasharray);

  path.classList.remove('green', 'orange', 'red');
  if (tLeft <= ALERT_THRESHOLD) {
    path.classList.add('red');
  } else if (tLeft <= WARNING_THRESHOLD) {
    path.classList.add('orange');
  } else {
    path.classList.add('green');
  }
}
