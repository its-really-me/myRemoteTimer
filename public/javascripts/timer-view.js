var setTime = Number(INITIAL_STATE.setTime) || 120;
var timerStatus = INITIAL_STATE.status;
// Normalise timeLeft based on status so the view is always consistent
var timeLeft = timerStatus === 'stopped' ? setTime
             : timerStatus === 'finished' ? 0
             : timerStatus === 'running' ? Math.max(0, Number(INITIAL_STATE.timeLeft) - 1)
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

if (timerStatus === 'running') {
  var timerInterval = setInterval(function() {
    timeLeft -= 1;
    if (timeLeft < 0) timeLeft = 0;
    document.getElementById('base-timer-label').innerHTML = formatTime(timeLeft);
    updateRing(timeLeft);
    if (timeLeft === 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

// Stop refreshing if paused/stopped for more than 1 minute; show Sync button instead
var idleSince = INITIAL_STATE.statusChangedAt || Date.now();
var idleMs = Date.now() - idleSince;
var inactive = (timerStatus === 'paused' || timerStatus === 'stopped') && idleMs > 180000;

if (!inactive) {
  setTimeout(function() { location.reload(); }, 3000);
} else {
  var btn = document.createElement('button');
  btn.textContent = 'Sync again';
  btn.style.width = '150px';
  btn.onclick = function() { location.reload(); };
  document.body.appendChild(btn);
}

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
