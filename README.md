# Jeopardy Unleashed — AI-Powered Multiplayer Trivia (v2)

**Jeopardy Unleashed** is a free, PWA-installable Jeopardy-style multiplayer trivia game built with static HTML, CSS, and JavaScript. Questions are generated in real time by **Llama 3.3 70B via the Groq API** (through a Cloudflare Worker proxy) — no Wikipedia scraping, no static question banks. Every board is unique.

## 🎯 How to Play

> 📖 **[Full Player Guide → HOW_TO_PLAY.md](./HOW_TO_PLAY.md)**

Quick summary:

1. **Enter topics** (comma-separated, max 5), **number of players** (2–8), and **difficulty**
2. Click **"Create Board"** — AI generates a 5×5 grid of 25 trivia clues
3. The active player picks a clue → reads it → selects an answer within **90 seconds**
4. **Scoring**: Correct = full points | Wrong = 0 | Pass = −half points
5. Turn rotates until all 25 clues are answered — **highest score wins!**

> 💡 Use **Demo** mode to try the game instantly without an AI call. Install as a **PWA** for offline play.

## ✨ Key Features

- **Multiplayer (2–8 players)**: Player/team name entry with automatic turn rotation
- **AI-Powered Content**: Real-time trivia generation using Llama 3.3 70B via Groq API (Cloudflare Worker proxy)
- **CSP Hardened**: Strict Content Security Policy — no unsafe-inline scripts/styles
- **Progressive Web App**: Fully installable, offline-capable with service worker
- **Responsive Design**: Swipeable board, mobile-optimized, dark/light theme toggle
- **Smart Gameplay**: 90s/30s timers, pass logic (halves points), auto-scoring, round results modal
- **Advanced Stats**: Leaderboard with questions asked/answered/pass tracking, session history
- **Difficulty Levels**: Easy / Mixed / Hard with tailored question complexity
- **Single-Question Refresh**: Replace any clue without rebuilding the whole board

## 🛠️ Tech Stack

```
Core:       Vanilla HTML5 / CSS3 / ES Modules
AI:         Llama 3.3 70B via Groq API (Cloudflare Worker proxy)
Modular JS: main.js → state.js, render.js, game.js, llm.js, timer.js, audio.js
CSP:        Strict policy via meta tag (frame-ancestors via HTTP header)
PWA:        manifest.json + sw.js (cache-first strategy)
Deploy:     Static GitHub Pages
```

**CSP Policy** (delivered via meta tag):
```
default-src 'self';
script-src 'self';
style-src 'self';
connect-src 'self' https://groq-proxy.sshafiuddin-dev.workers.dev;
img-src 'self' data:;
font-src 'self';
```
No external fonts/CDNs, system fonts only. Zero inline scripts/styles.

## 🚀 Quick Start

1. **Navigate** to [sshafiuddin-dev.github.io/jeopardy](https://sshafiuddin-dev.github.io/jeopardy/)
2. **Enter topics** (comma-separated, max 5): `Cricket Sport, Bollywood Movies, History, Geography, Tech CEOs`
3. **Set players** (2–8) and **difficulty** (Easy / Mixed / Hard)
4. **Click "Create board"** → AI generates a 5×5 grid of 25 questions
5. **Game flow**: Select clue → Answer within 90s → Correct / wrong / pass → Next turn
6. **Win**: Highest score after all 25 questions

**Demo mode** available for instant testing — no AI call needed.

## 📁 File Structure (v2 Modular)

```
├── index.html              # Main app + CSP meta tag
├── HOW_TO_PLAY.md          # Full player instructions & rules
├── favicon.png             # App icon (standard)
├── favicon-512.png         # App icon (PWA 512px)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first)
├── assets/
│   ├── css/style.css       # Responsive Jeopardy styling
│   └── js/
│       ├── main.js         # App entry / orchestration
│       ├── state.js        # Game state management
│       ├── render.js       # DOM rendering
│       ├── game.js         # Core game logic
│       ├── llm.js          # AI question generation (Groq API)
│       ├── timer.js        # 90s / 30s countdown
│       ├── audio.js        # Sound effects
│       └── register-sw.js
└── .github/workflows/      # GitHub Pages deployment
```

## 📦 Deployment (GitHub Pages)

1. Enable GitHub Pages on `main` branch (or via GitHub Actions)
2. Workflow: `.github/workflows/deploy.yml` auto-deploys on every push
3. Live at: `https://<username>.github.io/jeopardy`

**Live Demo**: https://sshafiuddin-dev.github.io/jeopardy/

## 🎨 Customization

- **Topics**: Any comma-separated subject — auto-sanitized (alphanumeric + spaces/ampersand)
- **AI Model**: `llama-3.3-70b-versatile` (configurable in `llm.js`)
- **Difficulty**:

  | Level | Point Values | Question Style |
  |-------|--------------|----------------|
  | Easy  | 100 × 5      | Beginner facts |
  | Mixed | 100 – 500    | Pub trivia mix |
  | Hard  | 500 × 5      | Expert facts   |

## 🔒 CSP Hardening Notes (v2)

- Modular ES modules — no inline scripts
- External CSS/JS only from `'self'`
- Single external API endpoint: `groq-proxy.sshafiuddin-dev.workers.dev`
- No `unsafe-eval`, no external fonts or CDNs
- `referrer: no-referrer`, `robots: noindex`

**Browser Support**: Chrome 58+, Firefox 52+, Safari 10+

## 💻 Local Development

```bash
# Local dev server (serves with correct headers)
npx http-server -c-1 --cors

# No build step needed — pure static files
# Open index.html directly (note: strict CSP applies)
```

## 🙏 Credits

- **AI Backend**: Groq + Llama 3.3 70B via custom Cloudflare Worker proxy
- **Design**: Jeopardy-inspired, mobile-first responsive grid
- **Hosting**: GitHub Pages

---

⭐ **Install as PWA** for offline play. **Fork & deploy** your own branded version!
