# Wiki Jeopardy Multiplayer - v2 (Modular CSP Hardened)

**Jeopardy Unleashed** is a free, PWA-installable Jeopardy-style multiplayer quiz app built with static HTML, CSS, and JavaScript. It generates topic-based trivia from Wikipedia-style content via AI and supports 2-8 players in turn-based competition.

## Key Features

- **Multiplayer (2-8 players)**: Player/team name entry with automatic turn rotation
- **AI-Powered Content**: Real-time trivia generation using Llama 3.3 70B via custom Cloudflare Worker proxy (Groq API)
- **CSP Hardened**: Strict Content Security Policy with no unsafe-inline scripts/styles
- **Progressive Web App**: Fully installable, offline-capable with service worker
- **Responsive Design**: Swipeable board, mobile-optimized, dark/light theme toggle
- **Smart Gameplay**: 90s/30s timers, pass logic (halves points), auto-scoring, round results modal
- **Advanced Stats**: Leaderboard with questions asked/answered/pass tracking, session history
- **Difficulty Levels**: Easy/Mixed/Hard with tailored question complexity
- **Single-Question Refresh**: Replace problematic questions without rebuilding board

## Tech Stack

```
Core: Vanilla HTML5/CSS3/ES Modules
AI: Llama 3.3 70B via Groq (Cloudflare Worker proxy)
Modular JS: main.js → state.js, render.js, game.js, llm.js, timer.js, audio.js
CSP: Strict policy via meta tag (frame-ancestors via HTTP header)
PWA: manifest.json + sw.js (cache-first strategy)
Deployment: Static GitHub Pages
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

## Quick Start

1. **Navigate** to [sshafiuddin-dev.github.io/wiki-jeopardy](https://sshafiuddin-dev.github.io/wiki-jeopardy/)
2. **Enter topics** (comma-separated, max 5): `Cricket Sport, Bollywood Movies, History, Geography, Tech CEOs`
3. **Set players** (2-8) and **difficulty** (Easy/Mixed/Hard)
4. **Click "Create board"** → AI generates 5x5 grid (25 questions)
5. **Game flow**: Select clue → Answer within 90s → Correct/wrong/pass → Next turn
6. **Win**: Highest score after all 25 questions

**Demo mode** available for instant testing.

## File Structure (v2 Modular)

```
├── index.html          # Main app + CSP meta tag
├── assets/
│   ├── css/style.css   # Responsive Jeopardy styling
│   └── js/
│       ├── main.js     # App entry/orchestration
│       ├── state.js    # Game state management
│       ├── render.js   # DOM rendering
│       ├── game.js     # Core game logic
│       ├── llm.js      # AI question generation[cite:8]
│       ├── timer.js    # 90s/30s countdown
│       ├── audio.js    # Sound effects
│       └── register-sw.js
├── sw.js              # Service worker
├── manifest.json      # PWA manifest
└── .github/workflows/ # GitHub Pages deployment
```

## Deployment (GitHub Pages)

1. Enable GitHub Pages on `main` or `gh-pages` branch
2. Workflow: `.github/workflows/deploy.yml` auto-deploys on push
3. Access: `https://<username>.github.io/wiki-jeopardy`

**Live Demo**: https://sshafiuddin-dev.github.io/wiki-jeopardy/

## Customization

- **Topics**: Comma-separated, auto-sanitized (alphanumeric + spaces/ampersand)
- **AI Model**: `llama-3.3-70b-versatile` (configurable in `llm.js`)
- **Difficulty**:
  | Level | Point Values | Question Style |
  |-------|--------------|----------------|
  | Easy  | 100×5        | Beginner facts |
  | Mixed | 100-500      | Pub trivia mix |
  | Hard  | 500×5        | Expert facts |

## CSP Hardening Notes

**v2 Key Changes**:
- Modular ES modules (no inline scripts)
- External CSS/JS only from `'self'`
- Single external API: `groq-proxy.sshafiuddin-dev.workers.dev`
- No unsafe-eval, no external fonts/CDNs
- `referrer: no-referrer`, `robots: noindex`

**Browser Support**: Chrome 58+, Firefox 52+, Safari 10+ (strict CSP)

## Development

```bash
# Local dev server (with CSP headers)
npx http-server -c-1 --cors

# Build: None (static files only)
# Test: Open index.html directly (CSP limits apply)
```

## Credits
- **AI Backend**: Groq + Llama 3.3 70B via custom Worker proxy
- **Design**: Jeopardy-inspired, mobile-first responsive grid

***

⭐ **Install as PWA** for offline play. **Fork & deploy** your own branded version!
