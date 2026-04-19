// ── Core game logic ──
import { state } from './state.js';
import { SFX } from './audio.js';
import { startTimer, stopTimer } from './timer.js';
import {
  renderPlayers, renderScoreboard, renderBoard,
  renderOptions, markOptions, disableAllOptions,
  syncActiveQuestionUI, showResults, renderHistory, points
} from './render.js';
import {
  buildBoard, regenerateSingleQuestion, parseTopics,
  ALLOWED_DIFFICULTY, esc
} from './llm.js';
import { setStartCooldown, setRefreshCooldown } from './state.js';

const $ = id => document.getElementById(id);

const COOLDOWN_MS = 3000;
const BASE_TIME   = 90000;
const PASS_TIME   = 30000;

// ── Helpers ──
function currentLabel() { return state.players[state.turn] || '—'; }
function playerLabel(i, team = false) { return team ? `Team ${i + 1}` : `Player ${i + 1}`; }

// ── Turn management ──
function nextAfter(index) { return (index + 1) % state.players.length; }

export function setTurn(index) {
  state.turn = ((index % state.players.length) + state.players.length) % state.players.length;
  renderPlayers();
  renderScoreboard();
}

function nextTurn() { setTurn(nextAfter(state.turn)); }

function resolveTurnAfterClue() {
  if (!state.active) return;
  setTurn(nextAfter(state.active.originTurn));
}

function logHistory(entry) {
  state.history.push(entry);
  renderHistory();
}

// ── Open a question tile ──
export function openQ(cat, clue, tile, rowIndex) {
  if (clue.used) return;
  if (state.active && state.active.resolved) $('questionBox').classList.remove('open');
  state.active = { cat, clue, tile, rowIndex, attemptedBy: [], originTurn: state.turn, resolved: false };
  stopTimer();
  $('timerDisplay').classList.remove('expired');
  $('questionBox').classList.add('open');
  $('timerBtns').style.display = 'flex';
  syncActiveQuestionUI(state.active, currentLabel(), submitAnswer, handlePass);
}

// ── Refresh / replace current question ──
export async function refreshActiveQuestion() {
  if (!state.active || state.active.attemptedBy.length || state.refreshCooldown) return;
  const btn = $('refreshQuestionBtn');
  try {
    stopTimer();
    btn.disabled = true;
    btn.textContent = '🔄 Refreshing...';
    $('feedback').textContent = 'Generating a replacement question...';
    const difficulty = ALLOWED_DIFFICULTY.includes($('difficulty').value) ? $('difficulty').value : 'mixed';
    const replacement = await regenerateSingleQuestion(
      state.board, state.active.cat, state.active.clue, difficulty
    );
    replacement.value = state.active.clue.value;
    replacement._origValue = state.active.clue._origValue || state.active.clue.value;
    const category = state.board.find(c => c.name === state.active.cat);
    if (!category) throw new Error('Category not found');
    category.clues[state.active.rowIndex] = replacement;
    state.active.clue = replacement;
    syncActiveQuestionUI(state.active, currentLabel(), submitAnswer, handlePass);
    $('feedback').textContent = '✅ Question updated. Everything else stays the same.';
    renderBoard(state.board, openQ);
    setRefreshCooldown(true);
    btn.disabled = true;
    btn.textContent = '⏳ Cooldown...';
    setTimeout(() => {
      setRefreshCooldown(false);
      if (state.active && !state.active.attemptedBy.length) {
        btn.disabled = false;
        btn.textContent = '🔄 Change Question';
      }
    }, COOLDOWN_MS);
  } catch (e) {
    $('feedback').textContent = `Could not refresh question: ${esc(e.message)}`;
    setRefreshCooldown(false);
    btn.disabled = false;
    btn.textContent = '🔄 Change Question';
  }
}

// ── Submit an answer ──
export function submitAnswer(selected) {
  if (!state.active) return;
  const { clue, tile, attemptedBy } = state.active;
  stopTimer();
  const isPass = attemptedBy.length > 0;
  attemptedBy.push(state.turn);
  $('refreshQuestionBtn').disabled = true;
  state.qAsked[state.turn] = (state.qAsked[state.turn] || 0) + 1;

  if (selected === clue.answer) {
    clue.used = true;
    tile.disabled = true;
    state.answered++;
    state.correct++;
    state.score[state.turn] = (state.score[state.turn] || 0) + clue.value;
    state.qCorrect[state.turn] = (state.qCorrect[state.turn] || 0) + 1;
    markOptions(selected, clue.answer);
    SFX.correct();
    $('feedback').textContent = `✅ Correct! ${currentLabel()} earns ${points(clue.value)}.`;
    logHistory({
      category: state.active.cat, question: clue.clue, correctAnswer: clue.answer,
      answeredBy: currentLabel(), wasPass: isPass, result: 'correct',
      points: clue.value, origPoints: clue._origValue || clue.value
    });
    state.active.resolved = true;
    resolveTurnAfterClue();
    if (state.answered >= state.total) { SFX.roundEnd(); showResults(state.players, state.score); }
    disableAllOptions();
    $('timerBtns').style.display = 'none';
    return;
  }

  markOptions(selected, clue.answer);
  SFX.wrong();
  state.qPassed[state.turn] = (state.qPassed[state.turn] || 0) + 1;
  clue.value = Math.max(5, Math.floor(clue.value / 2));

  if (attemptedBy.length >= state.players.length) {
    clue.used = true;
    tile.disabled = true;
    state.answered++;
    $('feedback').textContent = `No one got it. Correct answer: ${clue.answer}.`;
    logHistory({
      category: state.active.cat, question: clue.clue, correctAnswer: clue.answer,
      answeredBy: null, wasPass: false, result: 'nobody',
      points: 0, origPoints: clue._origValue || clue.value
    });
    state.active.resolved = true;
    resolveTurnAfterClue();
    if (state.answered >= state.total) { SFX.roundEnd(); showResults(state.players, state.score); }
    disableAllOptions();
    $('timerBtns').style.display = 'none';
    return;
  }

  nextTurn();
  $('money').textContent = points(clue.value);
  $('activePlayer').textContent = `${currentLabel()}'s turn`;
  $('feedback').textContent = `❌ Wrong. Next player/team tries for ${points(clue.value)}.`;
  renderOptions(clue, submitAnswer, handlePass);
  startTimer(PASS_TIME, handlePass);
}

// ── Handle pass ──
export function handlePass() {
  if (!state.active) return;
  const { clue, tile, attemptedBy } = state.active;
  stopTimer();
  SFX.pass();
  state.qAsked[state.turn] = (state.qAsked[state.turn] || 0) + 1;
  state.qPassed[state.turn] = (state.qPassed[state.turn] || 0) + 1;
  attemptedBy.push(state.turn);
  $('refreshQuestionBtn').disabled = true;
  clue.value = Math.max(5, Math.floor(clue.value / 2));

  if (attemptedBy.length >= state.players.length) {
    clue.used = true;
    tile.disabled = true;
    state.answered++;
    $('feedback').textContent = `All passed. Correct answer: ${clue.answer}.`;
    logHistory({
      category: state.active.cat, question: clue.clue, correctAnswer: clue.answer,
      answeredBy: null, wasPass: false, result: 'nobody',
      points: 0, origPoints: clue._origValue || clue.value
    });
    state.active.resolved = true;
    resolveTurnAfterClue();
    if (state.answered >= state.total) { SFX.roundEnd(); showResults(state.players, state.score); }
    disableAllOptions();
    $('timerBtns').style.display = 'none';
    return;
  }

  nextTurn();
  $('money').textContent = points(clue.value);
  $('activePlayer').textContent = `${currentLabel()}'s turn`;
  $('feedback').textContent = `Passed. Next player/team tries for ${points(clue.value)}.`;
  renderOptions(clue, submitAnswer, handlePass);
  startTimer(PASS_TIME, handlePass);
}

// ── Start game ──
export async function start() {
  if (state.startCooldown) return;
  const topics = parseTopics($('topic').value);
  const rawN = Number($('players').value || 2);
  if (rawN < 2 || rawN > 8 || !Number.isInteger(rawN)) {
    $('stateMsg').textContent = '⚠️ Player count must be a whole number between 2 and 8.';
    return;
  }
  const difficulty = ALLOWED_DIFFICULTY.includes($('difficulty').value) ? $('difficulty').value : 'mixed';
  const teamMode = $('teamMode').checked;
  state.players = [...Array(rawN)].map((_, i) => playerLabel(i, teamMode));
  state.topics = topics;
  state.score = state.players.map(() => 0);
  state.qAsked = state.players.map(() => 0);
  state.qCorrect = state.players.map(() => 0);
  state.qPassed = state.players.map(() => 0);
  state.history = [];
  state.turn = 0; state.answered = 0; state.correct = 0;
  state.total = 25; state.board = []; state.active = null;
  $('questionBox').classList.remove('open');
  $('board').innerHTML = '';
  $('feedback').textContent = '';
  renderHistory(); renderPlayers(); renderScoreboard();

  try {
    $('startBtn').disabled = true;
    $('startBtn').textContent = 'Generating...';
    $('statusPill').textContent = 'AI generating questions…';
    state.board = await buildBoard(topics.slice(0, 5), difficulty);
    state.total = state.board.reduce((s, c) => s + c.clues.length, 0);
    renderBoard(state.board, openQ);
    $('statusPill').textContent = 'Ready';
    $('stateMsg').textContent = `${state.total} AI-generated trivia clues ready.`;
    renderScoreboard();
  } catch (e) {
    const msg = document.createElement('span');
    msg.style.color = 'var(--bad)';
    msg.textContent = e.message;
    $('stateMsg').textContent = '';
    $('stateMsg').appendChild(msg);
    $('statusPill').textContent = 'Error';
  } finally {
    setStartCooldown(true);
    $('startBtn').disabled = true;
    $('startBtn').textContent = 'Please wait...';
    setTimeout(() => {
      setStartCooldown(false);
      $('startBtn').disabled = false;
      $('startBtn').textContent = 'Create board';
    }, COOLDOWN_MS);
  }
}

// ── Reset game ──
export function reset() {
  state.score = state.players.map(() => 0);
  state.qAsked = state.players.map(() => 0);
  state.qCorrect = state.players.map(() => 0);
  state.qPassed = state.players.map(() => 0);
  state.history = [];
  state.turn = 0; state.answered = 0; state.correct = 0;
  state.board = []; state.active = null;
  stopTimer();
  $('questionBox').classList.remove('open');
  $('board').innerHTML = '';
  $('feedback').textContent = '';
  $('refreshQuestionBtn').style.display = 'none';
  renderHistory(); renderPlayers(); renderScoreboard();
  $('statusPill').textContent = 'Waiting';
  $('stateMsg').textContent = 'Create a board to begin.';
  const { updateCountLabel } = window.__jeopardy__ || {};
  if (updateCountLabel) updateCountLabel();
}
