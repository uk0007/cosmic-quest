# Project Roadmap: Cosmic Quest IQ

## Phase Overview

```
Phase 1: Question Bank Parser & Data Modeling
  └── Extract and parse all 50 questions from gk.rtf into structured questions.json with hints, categories, and formatted HOTS questions.

Phase 2: Game Core Engine & Audio Synthesizer
  └── Build standalone HTML shell, Web Audio API sound generator, state management (localStorage), timer, and power-up system.

Phase 3: Space Odyssey UI & Sector Journey
  └── Implement Welcome Screen, Avatar Picker, Sector Map (5 zones with star ratings & unlock logic), and responsive game HUD.

Phase 4: Question Gameplay, Micro-Learning & Animations
  └── Build question card rendering (supporting HOTS match-the-column & multi-statement formats), instant answer validation, confetti effects, and "Did You Know?" Knowledge Capsules.

Phase 5: Rewards, Badges, Certificate & Question Bank Replicator
  └── Implement Badge Showcase, End-of-Game Ceremony with printable Galactic Certificate, and Question Bank Importer/Exporter for future sets.
```

## Phase Breakdown

### Phase 1: Question Bank Parser & Data Modeling
- **Goal:** Structure all 50 questions from `gk.rtf` into a clean, typed JSON structure.
- **Deliverables:**
  - `data/questions.json` (all 50 questions with stems, choices, answer index, explanation, hints, and topics).
  - Python parser script `scripts/parse_gk.py` to demonstrate how future question docs can be converted easily.

### Phase 2: Game Core Engine & Audio Synthesizer
- **Goal:** Create zero-dependency audio synthesizer and game state management.
- **Deliverables:**
  - Web Audio API sound FX module (click, correct chime, wrong buzz, power-up hum, victory fanfare, star jingle).
  - Game state store managing score, streak, power-up inventory, stars, and `localStorage` synchronization.

### Phase 3: Space Odyssey UI & Sector Journey
- **Goal:** Craft the visual interface and 5-sector mission map.
- **Deliverables:**
  - High-aesthetic CSS design system (Cosmic gradients, glow effects, glassmorphic cards, fluid layout).
  - Welcome Screen with avatar selector (Cosmo Fox, Astro Owl, Star Bear, Nova Dragon).
  - Mission Control Sector Map with locked/unlocked stages and 3-star ratings.

### Phase 4: Question Gameplay, Micro-Learning & Animations
- **Goal:** The core question-and-answer loop with instant feedback.
- **Deliverables:**
  - Dynamic question display supporting regular MCQs, column matching, and multi-statement HOTS prompts.
  - Power-ups: 50:50 Laser, Star Hint, Time Freeze.
  - Interactive feedback with glowing answers, canvas confetti explosion, and "Knowledge Capsule" popups.

### Phase 5: Rewards, Badges, Certificate & Question Bank Replicator
- **Goal:** Polish, rewards, printable certificate, and replication tools.
- **Deliverables:**
  - Sector summary screen with animated star tallies.
  - Unlocked Badges cabinet with achievements.
  - Printable / saveable "Galactic Champion Certificate" with student name.
  - "Custom Question Pack" import/export tool so new questions can be loaded effortlessly.
  - Complete standalone `index.html` deliverable.

## Milestone 2: 2D Stylized Action-Adventure Platformer ("Cosmic Dog Odyssey")

```
Phase 6: 2D Stylized Adventure Platformer with Phaser 3, Dog Character & Three.js Knowledge Gates [COMPLETED]
  └── Integrated 2D Stylized Adventure Game Asset Pack, Dog player physics, Three.js cosmic canvas, bone/energy collectibles, and physical Knowledge Gates triggering Cosmic Quest MCQs.

Phase 7: Multi-Level Adventure Campaign (Nebula Plains, Crystal Caverns & Starlight Summit) [COMPLETED]
  └── Expand into a 3-level campaign with distinct biomes, Level Select World Map, animated Cave Portal, Dog Bone celebration animation, moving platforms, and per-level star ratings.
```

### Phase 6: 2D Stylized Adventure Platformer with Phaser 3, Dog Character & Knowledge Gates [COMPLETED]
- **Goal:** Build a playable side-scrolling 2D action-adventure platformer level powered by Phaser 3 and Three.js, seamlessly integrating the provided Dog character, environmental assets, and the existing Cosmic Quest MCQ system as locked Knowledge Gates.
- **Deliverables:**
  - Asset pipeline `scripts/process_game_assets.py` extracting, optimizing, and organizing assets from `2D Stylized Adventure Game Asset Pack`.
  - Phaser 3 arcade platformer engine with responsive Cosmo Dog (Idle, Walk, Jump with coyote time/jump buffering, and Sniff).
  - Collectibles (Bones for score, Crystals for energy) and live Energy Bar HUD.
  - Knowledge Gates placed throughout Level 1 that pause gameplay and trigger 60s timed MCQs with 15s explanation feedback countdown.
  - Three.js celestial background canvas (starfield, rotating planet, portal bursts).
  - Level completion victory screen and checkpoint system.
  - Complete preservation of existing quiz mode with dual "Play Adventure Mode 🐕" / "Classic Quiz Odyssey 🚀" entry on the Welcome Screen.

### Phase 7: Multi-Level Adventure Campaign (Nebula Plains, Crystal Caverns & Starlight Summit) [COMPLETED]
- **Goal:** Transform the single-level platformer into a 3-level campaign featuring unique biomes, Level Select Map, animated transitions, and star mastery progression.
- **Deliverables:**
  - Level 1: Nebula Plains (open starry surface leading to an animated Cave Portal).
  - Level 2: Crystal Caverns (underground biome with glowing crystals, moving platforms, and cavern obstacles).
  - Level 3: Starlight Summit (high altitude sky islands, obelisks, and Master Cosmic Gate).
  - Adventure Level Select screen with star ratings (⭐ 0-3 per level, total out of 9).
  - Animated `Cave` portal transition and `Dog_Bone` celebration feast.
  - Persistent progression saved in `localStorage`.

### Phase 8: Adventure Mode Enhancements (Upcoming / Proposed)
- **Proposed Focus Areas:**
  - **Cosmic Hazards & Timed Challenges:** Friendly obstacles like zero-gravity bouncing geysers, floating cosmic meteorites, and wind gusts in Starlight Summit.
  - **Companion Astro-Bot Drone:** Sparky floating alongside Cosmo Dog, shining a spotlight in Crystal Caverns and sniffing out hidden bonus bone caches.
  - **Dog Customization & Accessories:** Space helmet, jetpack booster, and neon collars unlockable via collected bones in a new Adventure Shop.
  - **Endless Star Runner Mode:** Procedurally generated infinite runner mode with online/local leaderboard.
