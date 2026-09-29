# Level 9 — The Chrono Rift

A separate 17,500-unit campaign route with seven Knowledge Gates and exactly three special diamonds at gates 2, 4 and 7. Levels 1–8 retain their authored configurations.

## Route

1. Fractured Entry: broken arch, gentle stepping stones, moving slab, slow introductory phase stone.
2. Phase Bridge: five staggered phase platforms over an open void.
3. Gravity Chamber: 0.65 gravity, higher stones, upper bones and one flying guardian.
4. Rotating Ruins: two broad orbiting slabs moving in opposite directions, then a moving exit slab.
5. Cosmic Storm: warned falling orbs, short ground breaks and a pursuing time-storm wall.
6. Time Collapse: stable stone, phase stone, moving slab, low gravity and a safe landing; optional higher bones and a +15 energy crystal.
7. Heart of the Rift: large Three.js vortex, observation stones, five staggered Chrono Bridge platforms, final gate and revealed dimensional portal.

## Implementation

`scripts/level_nine.js` owns the level builder, transparent Phaser decorations, Three.js vortex/debris and reusable `PhasePlatform`, `GravityZone`, `CosmicFallingOrb` classes. `ChronoRiftSystem` connects them to Phaser without changing quiz or streak-power behavior.

- Phase states: SOLID → WARNING → PHASED → RETURNING. Collision returns only above 85% of the return fade and never while overlapping the dog.
- Gravity blends force over 220 ms; velocity is never snapped. Checkpoints restore normal gravity.
- Six preallocated orb objects use 1.1-second warnings, falling motion, visual impact pulses and cooldown. Each fall can hit only once and routes through the existing 8-energy damage/shield/Super Mode handler.
- Respawn resets phase clocks, orbital positions, moving-slab tweens, gravity, orbs and the chase. All seven checkpoints are on stable terrain.
- Audio events have soft, rate-limited synthesized cues through `Sound.playChronoEvent`.
- Nine disjoint question pools use versioned shuffled decks. No new Level 9 questions repeat across levels within a campaign.

## Validation

Production build: `python3 scripts/build_game.py`.

Model/layout checks:

- `node scripts/test_chrono_mechanics.cjs`
- `node scripts/test_adventure_layout.cjs`
- `node scripts/test_adventure_questions.cjs`

Browser checks use Playwright and installed Chrome:

- `node scripts/test_chrono_browser.cjs --fixtures`
- `node scripts/test_chrono_browser.cjs`
- `node scripts/test_chrono_browser.cjs --touch`

Both final automated complete runs reached victory through real keyboard/pointer control handlers, answered all seven quiz modals and collected all three special diamonds. Each recorded zero falls, 12 distinct physical phase-platform contacts, both orbit-platform contacts, and low-gravity traversal. No teleportation, disabled enemies, forced invulnerability, gate bypasses or physics changes were used in these complete runs. These are automated runs, not human playtesting.

Separate fixtures verified all checkpoint resets, return collision safety, warned orb damage, shield consumption, Super Mode immunity, gravity restoration and optional energy-crystal collection. Campaign launch tests verified 63 distinct gate questions across nine level starts. Map tests verified nine non-overlapping nodes without scrolling at 1280×800, 390×844, 844×390 and 320×568.
