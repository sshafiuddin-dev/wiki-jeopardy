# 🎯 How to Play — Jeopardy Unleashed

Welcome to **Jeopardy Unleashed** — an AI-powered multiplayer trivia game inspired by the classic Jeopardy format. No sign-up required. Just open, set up, and play!

---

## 🚀 Getting Started

1. Open the game at [sshafiuddin-dev.github.io/wiki-jeopardy](https://sshafiuddin-dev.github.io/wiki-jeopardy/)
2. Fill in the **Game Setup** panel on the left
3. Click **"Create Board"** — the AI generates 25 unique trivia questions in seconds
4. Start playing!

> 💡 **Tip:** You can install the game as a PWA (Progressive Web App) on your phone or desktop for offline play — look for the install prompt in your browser's address bar.

---

## 🛠️ Game Setup

| Setting | Description | Options |
|---|---|---|
| **Topics** | Comma-separated trivia categories (max 5) | Any subject — e.g. `Cricket Sport, History, Tech CEOs` |
| **Number of Players** | Total players in this session | 2–8 players |
| **Difficulty** | Controls question complexity and point values | Easy, Mixed, Hard |
| **Team Mode** | Group players into teams instead of individual play | Toggle on/off |

---

## 🎮 How a Round Works

### Step 1 — The Board
After clicking **"Create Board"**, a **5×5 grid** appears with 5 categories across the top and 5 point values down the side (e.g. 100, 200, 300, 400, 500). Each cell is a clue worth that many points.

### Step 2 — Taking Your Turn
- The **current player's turn** is shown in the Setup Panel under **Turn**.
- The active player selects any unclaimed clue on the board by clicking it.
- The **Question Box** opens below the board with the clue text.

### Step 3 — Answering
- Read the clue carefully — remember, **Jeopardy-style** means the clue gives you the answer and you must phrase your response as a question (e.g. *"What is Paris?"*), but in this game simply selecting or stating the correct answer counts.
- **Four answer choices** are displayed. Click the one you believe is correct.
- The **90-second timer** starts automatically — you can also manually start/pause it using the timer buttons.

### Step 4 — Result & Scoring
| Outcome | Points |
|---|---|
| ✅ Correct | Full point value of the clue |
| ❌ Wrong | No points deducted (clue is marked as answered) |
| ⏭️ Pass | Half the clue's point value is **deducted** from your score |

### Step 5 — Next Turn
- After each answer, the turn automatically rotates to the next player.
- The answered clue is marked on the board and can no longer be selected.

---

## 👥 Team Mode

When **Team Mode** is enabled:
- Enter team names instead of individual player names.
- Teams alternate turns just like individual players.
- Points accumulate per team — the leaderboard shows team scores.
- Great for larger groups where 2–4 people share a device or screen.

---

## ⏱️ The Timer

- Each question allows **90 seconds** to answer.
- A **visual countdown ring** displays the remaining time.
- You can **pause** the timer mid-question (useful for group discussions).
- If time runs out, the question is treated as a **pass** (half points deducted).
- For faster games, use the **30-second variant** if available in the timer controls.

---

## 🔄 Replacing a Question

If a question seems unclear, repeated, or broken:
- Click the **🔄 Change Question** button in the Question Box.
- The AI fetches a **fresh replacement question** for that clue only — no need to rebuild the whole board.

---

## 📊 Leaderboard & Stats

The live **Leaderboard** tracks:
- **Points** — total score
- **Q Asked** — clues selected by this player
- **Ans ✅** — correctly answered questions
- **Pass ❌** — questions passed

The **Leader** and **Answered** counters at the top of the Setup Panel update in real time.

---

## 📜 Session History

The **Session History** section records every question answered during the game — category, clue, correct answer, and which player answered it. Useful for reviewing disputed answers or just reliving the glory.

---

## 🏆 Winning the Game

- The game ends when **all 25 clues** have been answered (or passed).
- A **Round Complete** modal pops up showing the final scores and rankings.
- The player or team with the **highest score wins**.
- Click **"New Round"** to replay with the same settings, or **"New Game"** to start fresh.

---

## 🎯 Difficulty Guide

| Level | Point Values | Question Style | Best For |
|---|---|---|---|
| **Easy** | 100 × 5 per category | Beginner-friendly facts | Kids, casual players |
| **Mixed** | 100 – 500 varied | Pub trivia style mix | General groups |
| **Hard** | 500 × 5 per category | Expert-level facts | Trivia enthusiasts |

---

## 🕹️ Demo Mode

Not ready for a full game? Click **"Demo"** to load a pre-built sample board instantly — no AI call needed. Great for learning the interface before your first real game.

---

## ❓ Tips & Rules

- **Only the active player** should select a clue on their turn — take turns fairly!
- **Passes hurt** — you lose half the clue's value, so only pass if you're truly stuck.
- Topics can be **anything** — from niche hobbies to academic subjects. The AI adapts.
- You can mix **very different topics** (e.g. `Cricket Sport, Ancient Rome, K-Pop`) for a wild and varied board.
- The game is entirely **browser-based** — no accounts, no data stored, fully private.
- For the best experience on mobile, **install as a PWA** for full-screen play.

---

## 🔁 Quick Reference

```
1. Enter topics + players + difficulty  →  Click "Create Board"
2. Active player clicks a clue on the board
3. Read the clue → Select your answer within 90 seconds
4. Correct = full points | Wrong = 0 | Pass = −half points
5. Turn rotates → repeat until all 25 clues are done
6. Highest score wins!
```

---

*Built with ❤️ using AI + Vanilla JS. Fork it, deploy it, make it yours!*
