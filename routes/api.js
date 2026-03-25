var express = require('express');
var router = express.Router();

// In-memory timer state — updated by the client on every tick and state change
var timerState = {
  setTime: 120,
  timeLeft: 120,
  status: 'stopped'  // 'running' | 'paused' | 'stopped' | 'finished'
};

// GET /api/status — return current timer state
router.get('/status', function(req, res) {
  res.json(timerState);
});

// POST /api/status — receive state update from the browser client
router.post('/status', function(req, res) {
  var body = req.body;
  if (typeof body.setTime === 'number') timerState.setTime = body.setTime;
  if (typeof body.timeLeft === 'number') timerState.timeLeft = body.timeLeft;
  if (typeof body.status === 'string') timerState.status = body.status;
  res.json(timerState);
});

module.exports = router;
