# Wiki Jeopardy Multiplayer

A free Jeopardy-style multiplayer quiz app built with static HTML, CSS, and JavaScript. It generates topic-based clues from Wikipedia and supports turn-based competition for 2-8 players.

## Features

- Multiplayer play for competing players
- Player name entry and turn rotation
- Topic-based board generation from Wikipedia
- Automatic scoring and leaderboard
- Pass logic with halving points
- 90s/30s manual timer
- Round results modal
- Team mode
- PWA installable
- Works as a static site on GitHub Pages

## How to play

1. Enter a topic.
2. Add player or team names.
3. Create a board.
4. Players take turns selecting clues and answering.
5. Wrong answer or pass sends question to next team at half points.
6. Highest score wins.

## GitHub Pages

Use the included workflow in `.github/workflows/deploy.yml` and set GitHub Pages to deploy from GitHub Actions.

After deployment, the site will be available at:

`https://sshafiuddin-dev.github.io/wiki-jeopardy/`
