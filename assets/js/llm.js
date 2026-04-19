// ── LLM / Groq API ──
const WORKER_ENDPOINT    = 'https://groq-proxy.sshafiuddin-dev.workers.dev';
const LLM_MODEL          = 'llama-3.3-70b-versatile';
export const ALLOWED_DIFFICULTY = ['easy', 'mixed', 'hard'];
const VALUES             = [100, 200, 300, 400, 500];

// ── Utilities ──
export function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fix: correct regex — hyphen must be first or last in character class
export function sanitizeTopic(t) {
  return t.replace(/[^a-zA-Z0-9 '&-]/g, '').trim().slice(0, 50);
}

export function parseTopics(raw) {
  const parts = (raw || '').split(',').map(x => sanitizeTopic(x)).filter(Boolean);
  const uniq = [];
  for (const p of parts) if (!uniq.includes(p)) uniq.push(p);
  if (uniq.length === 0) return ['Cricket Sport', 'Bollywood Movies', 'Bollywood Music', 'History', 'Geography'];
  while (uniq.length < 5) uniq.push(`General ${uniq.length + 1}`);
  return uniq.slice(0, 10);
}

// ── Generate questions from LLM ──
export async function generateCategoryQuestions(topic, difficulty, count = 5, excludeQuestions = []) {
  const diffHint =
    difficulty === 'easy' ? 'simple, well-known facts suitable for beginners' :
    difficulty === 'hard' ? 'challenging, specific facts for enthusiasts' :
    'a mix of easy and harder facts';
  const safeExclusions = excludeQuestions.map(q => String(q).slice(0, 100));
  const excludeBlock = safeExclusions.length
    ? `\nAvoid reusing or paraphrasing these existing questions:\n- ${safeExclusions.join('\n- ')}` : '';
  const prompt =
    `Generate exactly ${count} multiple-choice trivia questions about the topic: "${topic}".\n` +
    `Difficulty: ${diffHint}.${excludeBlock}\n\nRules:\n` +
    `- Each question must be a natural, engaging pub-trivia style question.\n` +
    `- Do NOT include the answer inside the question text.\n` +
    `- Each question has exactly 4 options. One is correct, three are plausible wrong answers from the same topic.\n` +
    `- Wrong options must be real, recognizable names/titles/facts from the topic \u2014 not made up.\n` +
    `- Return ONLY valid JSON in this exact format, no extra text:\n` +
    `{\n  "questions": [\n    {"q": "Question text?", "options": ["Correct answer", "Wrong 1", "Wrong 2", "Wrong 3"], "answer": "Correct answer"}\n  ]\n}`;

  const res = await fetch(WORKER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL, temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a trivia question generator. Always return valid JSON only, no markdown, no explanation.' },
        { role: 'user',   content: prompt }
      ]
    })
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Worker returned ${res.status}: ${t}`); }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '{}';
  let parsed;
  try { parsed = JSON.parse(content); } catch (e) { throw new Error('LLM returned invalid JSON'); }
  const qs = Array.isArray(parsed?.questions) ? parsed.questions : [];
  if (qs.length === 0) throw new Error('LLM returned 0 questions');
  return qs;
}

// ── Normalize a raw LLM question into a board clue ──
export function normalizeGeneratedQuestion(item, fallbackTopic, fallbackValue) {
  const answer  = (item?.answer || '').trim();
  const opts    = Array.isArray(item?.options) ? item.options.map(x => String(x).trim()).filter(Boolean) : [];
  const seeded  = answer && !opts.includes(answer) ? [answer, ...opts] : opts;
  const fullOpts = [...new Set(seeded)].filter(Boolean);
  while (fullOpts.length < 4) fullOpts.push(`Option ${fullOpts.length + 1}`);
  return {
    id: `${fallbackTopic}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    value: fallbackValue, _origValue: fallbackValue,
    answer: answer || fullOpts[0],
    clue: (item?.q || `Question about ${fallbackTopic}?`).trim(),
    options: shuffle(fullOpts.slice(0, 4)),
    used: false
  };
}

// ── Regenerate one question (refresh button) ──
export async function regenerateSingleQuestion(board, categoryName, currentClue, difficulty) {
  const category = board.find(c => c.name === categoryName);
  const existing = category ? category.clues.map(c => c.clue).filter(Boolean) : [];
  const qs = await generateCategoryQuestions(categoryName, difficulty, 1, existing);
  return normalizeGeneratedQuestion(qs[0], categoryName, currentClue._origValue || currentClue.value || 100);
}

// ── Build full 5x5 board ──
export async function buildBoard(topicNames, difficulty) {
  const valuePlan =
    difficulty === 'easy' ? [100,100,100,100,100] :
    difficulty === 'hard' ? [500,500,500,500,500] : VALUES;
  const categories = [];
  for (const topic of topicNames.slice(0, 5)) {
    let qs;
    try { qs = await generateCategoryQuestions(topic, difficulty, 5); }
    catch (e) { console.warn(`[Board] LLM failed for "${topic}":`, e.message); qs = []; }
    while (qs.length < 5) {
      const n = qs.length + 1;
      qs.push({ q: `Question ${n} about ${topic}?`, options: [`Answer ${n}A`,`Answer ${n}B`,`Answer ${n}C`,`Answer ${n}D`], answer: `Answer ${n}A` });
    }
    categories.push({ name: topic, clues: qs.slice(0,5).map((item,r) => normalizeGeneratedQuestion(item, topic, valuePlan[r] || valuePlan[0])) });
  }
  return categories;
}
