// ── All DOM rendering ──
import { state } from './state.js';
import { esc } from './llm.js';

const $ = id => document.getElementById(id);
const points = v => String(v);

export { points };

// ── Theme ──
export function setTheme(t) {
  state.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  $('themeBtn').textContent = t === 'dark' ? 'Light' : 'Dark';
}

// ── Player count label (team vs player mode) ──
export function updateCountLabel() {
  const teamMode = $('teamMode').checked;
  $('playerCountLabel').textContent = teamMode ? 'Number of teams' : 'Number of players';
  $('playerCountHint').textContent = teamMode
    ? 'Use this as the total number of teams.'
    : 'Use this as the total number of players.';
}

// ── Players sidebar ──
export function renderPlayers() {
  $('playersList').innerHTML = '';
  state.players.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'player' + (i === state.turn ? ' active' : '');
    d.innerHTML = `<strong>${esc(p)}</strong><span>${points(state.score[i] || 0)}</span>`;
    $('playersList').appendChild(d);
  });
}

// ── Leaderboard ──
export function renderLeaderboard() {
  $('leaderboard').innerHTML = '';
  [...state.players.map((n, i) => ({
    n, s: state.score[i] || 0,
    q: state.qAsked[i] || 0,
    c: state.qCorrect[i] || 0,
    p: state.qPassed[i] || 0,
    i
  }))]
    .sort((a, b) => b.s - a.s)
    .forEach((pl, r) => {
      const row = document.createElement('div');
      row.className = 'lead' + (pl.i === state.turn ? ' is-turn' : '');
      row.innerHTML = `
        <span><strong>${r + 1}. ${esc(pl.n)}</strong>${pl.i === state.turn ? ' <span style="color:var(--primary)">● turn</span>' : ''}</span>
        <span class="pts" style="text-align:right">${points(pl.s)}</span>
        <span style="text-align:center">${pl.q}</span>
        <span style="text-align:center;color:var(--good)">${pl.c}</span>
        <span style="text-align:center;color:var(--bad)">${pl.p}</span>`;
      $('leaderboard').appendChild(row);
    });
}

// ── Scoreboard stats strip ──
export function renderScoreboard() {
  $('turn').textContent = state.players[state.turn] || '—';
  const li = state.score.length ? state.score.indexOf(Math.max(...state.score)) : -1;
  $('leader').textContent = li > -1 ? `${state.players[li]} (${points(state.score[li])})` : '—';
  $('answered').textContent = `${state.answered}/${state.total}`;
  $('topicLabel').textContent = state.topics.join(', ');
  $('statusPill').textContent = state.answered >= state.total ? 'Complete' : 'In play';
  $('stateMsg').textContent = state.total - state.answered > 0
    ? `${state.total - state.answered} clues left`
    : 'All clues answered';
  renderLeaderboard();
}

// ── Session history table ──
export function renderHistory() {
  const c = $('historyContainer');
  if (!state.history.length) {
    c.innerHTML = '<p class="no-history">No questions answered yet.</p>';
    return;
  }
  let html = `<div style="overflow-x:auto"><table class="history-table">
    <thead><tr>
      <th>#</th><th>Category</th><th>Orig Pts</th><th>Pts Earned</th>
      <th>Question</th><th>Correct Answer</th><th>Answered By</th><th>Type</th><th>Result</th>
    </tr></thead><tbody>`;
  [...state.history].reverse().forEach((h, idx) => {
    const num = state.history.length - idx;
    const typeBadge = h.wasPass
      ? `<span class="hist-pass-badge">Pass</span>`
      : `<span class="hist-orig-badge">Original</span>`;
    const resultCell = h.result === 'correct'
      ? `<span class="hist-correct">✅ Correct</span>`
      : h.result === 'wrong'
        ? `<span class="hist-wrong">❌ Wrong</span>`
        : `<span style="color:var(--muted)">— No one</span>`;
    const earnedPts = h.result === 'correct'
      ? `<span style="font-weight:800;color:var(--good)">+${h.points}</span>`
      : `<span style="color:var(--muted)">—</span>`;
    const origPtsCell = h.origPoints !== h.points && h.result === 'correct'
      ? `<span style="text-decoration:line-through;color:var(--muted);margin-right:4px">${h.origPoints}</span>`
      : `${h.origPoints}`;
    html += `<tr>
      <td style="color:var(--muted)">${num}</td>
      <td><strong>${esc(h.category)}</strong></td>
      <td style="font-weight:800;color:var(--primary)">${origPtsCell}</td>
      <td>${earnedPts}</td>
      <td style="max-width:220px">${esc(h.question)}</td>
      <td style="color:var(--good)">${esc(h.correctAnswer)}</td>
      <td><strong>${esc(h.answeredBy) || '—'}</strong></td>
      <td>${typeBadge}</td>
      <td>${resultCell}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  c.innerHTML = html;
}

// ── Answer option buttons ──
export function renderOptions(clue, onSubmit, onPass) {
  $('answers').innerHTML = '';
  clue.options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'answer';
    b.textContent = opt;
    b.dataset.answer = opt;
    b.onclick = () => onSubmit(opt);
    $('answers').appendChild(b);
  });
  const pb = document.createElement('button');
  pb.className = 'answer';
  pb.style.gridColumn = '1 / -1';
  pb.textContent = '❌ Pass to next player/team';
  pb.onclick = onPass;
  $('answers').appendChild(pb);
}

// ── Mark answer buttons correct / wrong ──
export function markOptions(selected, correct) {
  [...$('answers').children].forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.answer === correct) btn.classList.add('correct');
    if (btn.dataset.answer === selected && selected !== correct) btn.classList.add('wrong');
  });
}

export function disableAllOptions() {
  [...$('answers').children].forEach(btn => btn.disabled = true);
}

// ── Sync the open question panel ──
export function syncActiveQuestionUI(active, currentPlayerLabel, onSubmit, onPass) {
  if (!active) return;
  const { cat, clue } = active;
  $('catName').textContent = cat;
  $('money').textContent = points(clue.value);
  $('activePlayer').textContent = `${currentPlayerLabel}'s turn`;
  $('clue').textContent = clue.clue;
  $('feedback').textContent = '';
  renderOptions(clue, onSubmit, onPass);
  const canRefresh = !active.attemptedBy.length;
  $('refreshQuestionBtn').style.display = 'inline-flex';
  $('refreshQuestionBtn').disabled = !canRefresh;
  $('refreshQuestionBtn').textContent = '🔄 Change Question';
  $('refreshQuestionBtn').title = canRefresh
    ? 'Replace only this question'
    : 'Unavailable after an attempt has been made';
}

// ── Board grid ──
export function renderBoard(board, onTileClick) {
  const rows = board[0] ? board[0].clues.length : 5;
  $('board').innerHTML = '';
  board.forEach(c => {
    const h = document.createElement('div');
    h.className = 'cat';
    h.textContent = c.name;
    $('board').appendChild(h);
  });
  for (let r = 0; r < rows; r++) {
    board.forEach(cat => {
      const clue = cat.clues[r];
      if (!clue) return;
      const b = document.createElement('button');
      b.className = 'tile';
      b.textContent = points(clue.value);
      b.disabled = clue.used;
      b.onclick = () => onTileClick(cat.name, clue, b, r);
      $('board').appendChild(b);
    });
  }
}

// ── Results modal ──
export function showResults(players, scores) {
  const ranked = players
    .map((name, i) => ({ name, score: scores[i] || 0 }))
    .sort((a, b) => b.score - a.score);
  $('finalResults').innerHTML = '';
  ranked.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `<span>${['🥇', '🥈', '🥉'][i] || `${i + 1}.`} ${esc(p.name)}</span><span>${points(p.score)}</span>`;
    $('finalResults').appendChild(row);
  });
  $('resultsModal').classList.add('show');
}
