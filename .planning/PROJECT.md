# Project: Cosmic Quest IQ (Interactive GK Game for Kids)

## 1. Vision & Overview
An interactive, beautifully designed, single-file HTML educational adventure game built for 10-year-olds (Grade 5–6 / IGKO Olympiad level). The game turns 50 high-quality General Knowledge questions into an engaging cosmic odyssey across 5 planetary zones with avatars, power-ups, instant "Did You Know?" micro-learning cards, sound effects, badges, and a shareable championship certificate.

The architecture is built from the ground up to be **completely self-contained and shareable** (can run directly in any browser offline or on mobile/tablet, shared via WhatsApp/email) while having a **modular, replicable question engine** that allows easy addition or replacement of question packs in the future.

## 2. Target Audience
- **Primary Audience:** Kids aged 9–12 (specifically Grade 5–6 preparing for Olympiads or curious young minds).
- **Tone & Feel:** Adventurous, uplifting, colorful, gamified, non-intimidating, and intellectually rewarding.

## 3. Core Mechanics & Design Pillars
- **Visuals:** Space/Cosmic Odyssey aesthetic with deep navy/indigo palettes, glowing neon accents (cyan, magenta, gold, emerald), playful avatars, and fluid CSS animations.
- **Audio Engine:** Built-in zero-dependency Web Audio API synthesizer for retro-arcade sound effects (click, correct chime, buzz, streak fanfare, power-up hum) with mute toggle.
- **Stage Progression:** 5 distinct sectors/levels of 10 questions each, structured logically from natural science to global affairs, life skills, and Olympiad Achievers HOTS questions.
- **Micro-Learning Loop:** Immediate interactive feedback on answer selection with vibrant green/red states, confetti for correct answers, and a popup "Cosmic Knowledge Capsule" presenting the question's rich explanation.
- **Gamification:**
  - Avatars (Cosmo Fox, Astro Owl, Star Bear, Nova Dragon)
  - 3 Power-ups per zone (50:50 Laser, Star Hint, Time Freeze)
  - Streak multipliers & score combos
  - Star ratings (1 to 3 stars per sector) saved in `localStorage`
  - 6 collectible explorer badges
  - Customizable, printable/downloadable "Galactic Scholar Certificate"
- **Extensibility & Replicability:**
  - Clean standardized JSON schema for question items (stem, options, correct answer, explanation, category, hint).
  - Built-in "Load Custom Question Bank / JSON Import" modal to swap questions on the fly without touching code.

## 4. Source Data
- 50 questions sourced from `gk.rtf` covering:
  1. General Awareness (Biology, Earth Science, Astronomy, History, Geography, Inventions, Literature, Sports, Reasoning)
  2. Current Affairs & Global Developments (Chandrayaan-3, Aditya-L1, Nobel Prizes 2024, NATO 2024, T20 World Cup, Olympics)
  3. Life Skills & Values (Collaboration, Cyber Safety, Fake News, Stress Management, Empathy)
  4. Achievers Section HOTS (Discoveries match, World Heritage Sites, Country riddle, Organ riddle, International Days match)
