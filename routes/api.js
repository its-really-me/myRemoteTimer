var express = require('express');
var router = express.Router();

// In-memory timer states keyed by timer ID
var timerStates = {};

function getState(id) {
  if (!timerStates[id]) {
    timerStates[id] = {
      setTime: 120,
      timeLeft: 120,
      status: 'stopped',  // 'running' | 'paused' | 'stopped' | 'finished'
      statusChangedAt: Date.now()
    };
  }
  return timerStates[id];
}

// GET /api/status?id=<id> — return current timer state
router.get('/status', function(req, res) {
  res.json(getState(req.query.id));
});

// GET /api/view?id=<id> — render a read-only graphical timer display
router.get('/view', function(req, res) {
  var id = req.query.id;
  var state = Object.assign({ id: id }, getState(id));
  res.render('timer-view', { title: 'Timer View', state: state });
});

// POST /api/status?id=<id> — receive state update from the browser client
router.post('/status', function(req, res) {
  var state = getState(req.query.id);
  var body = req.body;
  if (typeof body.setTime === 'number') state.setTime = body.setTime;
  if (typeof body.timeLeft === 'number') state.timeLeft = body.timeLeft;
  if (typeof body.status === 'string' && body.status !== state.status) {
    state.status = body.status;
    state.statusChangedAt = Date.now();
  }
  res.json(state);
});

module.exports = router;
