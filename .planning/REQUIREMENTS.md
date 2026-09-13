# Requirements: Cosmic Quest IQ

## Functional Requirements

### FR-1: Game Architecture & Playability
- **FR-1.1**: Standalone, single HTML file execution without requiring node, servers, or external assets (Web Audio API for sounds, inline SVG icons, embedded Google Fonts / fallbacks).
- **FR-1.2**: Responsive mobile-friendly UI that plays flawlessly on tablets (iPads/Android), smartphones, laptops, and smartboards.
- **FR-1.3**: Offline persistence via `localStorage` for level progress, stars earned, total score, unlocked badges, and chosen avatar.

### FR-2: Question Journey & Modes
- **FR-2.1**: 5 distinct sectors of 10 questions each:
  - Sector 1: Biosphere & Nature (Flora, Fauna, Ecology, Earth)
  - Sector 2: Science, Space & Civilizations (Physics, Astronomy, History, Civics)
  - Sector 3: Culture, Sports & Logic (Books, Languages, Olympics, Reasoning)
  - Sector 4: Orbit of the Present (2024 Current Affairs, Space, Awards)
  - Sector 5: Mind & Mastery (Life Skills & Achievers HOTS challenges)
- **FR-2.2**: Flexible Navigation: Sector Map / Level Select screen with locked/unlocked stages and star tallies.
- **FR-2.3**: Ability to replay any sector to improve score and star rating.

### FR-3: Interactive Question Screen & Micro-Learning
- **FR-3.1**: Display question prompt, formatted options (A, B, C, D), sector indicator, progress bar, timer (optional toggle), and current streak.
- **FR-3.2**: Rich question formatting supporting multi-line text, match-the-column tables, and multi-statement evaluations (especially for HOTS questions 46-50).
- **FR-3.3**: Interactive answer feedback:
  - Selecting an option locks choices and highlights correct answer in glowing emerald and wrong answer in ruby.
  - Generates particle/confetti burst on correct answer.
  - Plays sound effect (success chime or gentle oops buzz).
  - Automatically pops up "Knowledge Capsule" with the complete educational explanation.
- **FR-3.4**: Power-ups (usable once per sector):
  - ✂️ *50:50 Laser*: Disables 2 incorrect options.
  - 💡 *Cosmic Clue*: Displays a helpful hint without giving away the direct answer.
  - ⏳ *Time Shield*: Freezes the timer or gives safe buffer.

### FR-4: Rewards, Badges & Celebration
- **FR-4.1**: Badge unlocks based on milestones:
  - "Nature Scout" (Clear Sector 1)
  - "Star Astronomer" (Clear Sector 2)
  - "Logic Master" (Clear Sector 3)
  - "Global Citizen" (Clear Sector 4)
  - "Olympiad Titan" (Clear Sector 5)
  - "Cosmic Grandmaster" (Score > 90% across all sectors)
- **FR-4.2**: Sector Victory Screen with star rating animation (1 to 3 stars), score breakdown, accuracy, and options to advance or replay.
- **FR-4.3**: End-of-Game Ceremony:
  - Printable / Downloadable "Galactic Champion Certificate" filled with the player's name, avatar, date, and rank.
  - Full Question Review accordion where kids can revisit all questions, their choices, and the full explanations.

### FR-5: Extensibility & Question Bank Replication
- **FR-5.1**: Clean JSON schema structure for questions: `id`, `section`, `topic`, `question`, `options`, `answerIndex`, `explanation`, `hint`.
- **FR-5.2**: Built-in "Custom Question Bank" modal: allows teachers, parents, or kids to import custom JSON files or paste new question sets directly in the game UI.
- **FR-5.3**: Standalone `questions.json` and a Python/Node parsing script included in repo to convert future RTF/text mocks into game-ready JSON.

## Non-Functional Requirements
- **NFR-1 (Zero Dependencies):** Zero npm installs or build steps needed to play; just double-click `index.html`.
- **NFR-2 (Aesthetics & WOW Factor):** High-energy, joyful space theme, modern glassmorphism, fluid micro-animations, vibrant gradients, and child-friendly typography.
- **NFR-3 (Performance):** Instantaneous load time (<100ms), 60fps animations via GPU-accelerated CSS transforms.
