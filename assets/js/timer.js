// ── Countdown Timer — timestamp-based (no setInterval drift) ──
const $ = id => document.getElementById(id);

let _rafId   = null;
let _endTime = 0;
let _onExpire = null;

function updateDisplay(remaining) {
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  $('timeLeft').textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

function tick() {
  const remaining = Math.max(0, _endTime - Date.now());
  updateDisplay(remaining);
  if (remaining <= 0) {
    $('timerRing').classList.remove('running');
    $('timerDisplay').classList.add('expired');
    if (typeof _onExpire === 'function') { const cb = _onExpire; _onExpire = null; cb(); }
    return;
  }
  _rafId = requestAnimationFrame(tick);
}

export function startTimer(ms, onExpire) {
  stopTimer();
  _endTime  = Date.now() + ms;
  _onExpire = onExpire || null;
  $('timerRing').classList.add('running');
  $('timerDisplay').classList.remove('expired');
  updateDisplay(ms);
  _rafId = requestAnimationFrame(tick);
}

export function stopTimer() {
  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId    = null;
  _onExpire = null;
  $('timerRing').classList.remove('running');
}
