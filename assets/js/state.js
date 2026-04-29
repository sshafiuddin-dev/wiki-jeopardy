// ── Shared mutable game state ──
export const state = {
  players: ['Player 1', 'Player 2'],
  turn: 0,
  score: [],
  qAsked: [],
  qCorrect: [],
  qPassed: [],
  board: [],
  answered: 0,
  correct: 0,
  total: 25,
  topics: ['Cricket Sport', 'Bollywood Movies', 'Bollywood Music', 'History', 'Geography'],
  active: null,
  theme: 'light',
  history: []
};

// Mutable flags as module-level variables
export let audioEnabled  = true;
export let startCooldown = false;
export let refreshCooldown = false;

export function setAudioEnabled(v)   { audioEnabled   = v; }
export function setStartCooldown(v)  { startCooldown  = v; }
export function setRefreshCooldown(v){ refreshCooldown = v; }
