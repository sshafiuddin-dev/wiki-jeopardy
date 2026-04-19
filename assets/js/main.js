// ── Entry point: event listeners & init ──
import { state, setAudioEnabled, audioEnabled } from './state.js';
import { setTheme, updateCountLabel }           from './render.js';
import { start, reset, refreshActiveQuestion }  from './game.js';
import { stopTimer, startTimer }                from './timer.js';

const $ = id => document.getElementById(id);
const BASE_TIME = 90000;

function toggleMute() {
  setAudioEnabled(!audioEnabled);
  $('muteBtn').textContent = audioEnabled ? '🔊' : '🔇';
}

$('themeBtn').onclick    = () => setTheme(state.theme === 'dark' ? 'light' : 'dark');
$('muteBtn').onclick     = toggleMute;
$('teamMode').onchange   = updateCountLabel;
$('resetBtn').onclick    = reset;
$('startBtn').onclick    = start;
$('demoBtn').onclick     = () => { $('topic').value = 'Cricket Sport, Bollywood Movies, Bollywood Music, History, Geography'; start(); };
$('newRoundBtn').onclick = () => { $('resultsModal').classList.remove('show'); start(); };
$('newGameBtn').onclick  = () => {
  $('resultsModal').classList.remove('show');
  reset();
  $('topic').value   = 'Cricket Sport, Bollywood Movies, Bollywood Music, History, Geography';
  $('players').value = 2;
};
$('startTimerBtn').onclick       = () => startTimer(BASE_TIME, null);
$('pauseTimerBtn').onclick       = stopTimer;
$('refreshQuestionBtn').onclick  = refreshActiveQuestion;

// ── Init ──
setTheme('light');
reset();
