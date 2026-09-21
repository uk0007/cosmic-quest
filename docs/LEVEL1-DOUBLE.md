# Doubled woodland level

Level 1 grows from 7,300 to **14,600 world pixels**. There are still exactly **seven question gates** and **three diamonds**. Levels 2–4 are unchanged.

Seven new corridors are inserted before the existing gates, preserving the original jump distances and shifting the final cave to x=14,400. Gates now sit at x=1,800 / 3,820 / 5,400 / 7,200 / 9,100 / 10,700 / 13,960.

| Added corridor | Challenge |
|---|---|
| Before Gate 1 | First cutter, thorn bypass and vertical lift |
| Before Gate 2 | Cutter, timed energy ravine and moving bridge |
| Before Gate 3 | Cutter, thorn bypass and vertical lift |
| Before Gate 4 | Cutter, timed energy ravine and moving bridge |
| Before Gate 5 | Cutter, thorn bypass and vertical lift |
| Before Gate 6 | Cutter, timed energy ravine and moving bridge |
| Before Gate 7 | Longer final grove, cutter, thorn bypass and vertical lift |

Totals: nine moving cutters, six energy-shot ravines, eight moving platforms, five thorn hurdles, and the three existing collapsing rocks. Existing enemies and collectible totals remain. Added trees and ground patches frame the new stretches, with solid waiting areas between traps and landings. The nearest following question gate is at least 430 pixels past each gap.

Verification: static checks pass for all four levels; the trap test checks the 14,600-pixel length, 15 trap instances, warning/firing/safe states, cutter retraction and gate clearance. The full touch playthrough completed all seven gates and three diamonds with zero falls and 100% final energy; it recorded moving-platform contact. Software-rendered average was 17.2 FPS, not a physical-device performance measurement. Full touch-playthrough results are recorded in `artifacts/level1-double/playthrough-mobile.json`.

Source changes: `scripts/adventure_game.js`, generated `index.html`, `scripts/test_adventure_browser.cjs` (configurable playthrough timeout), and `scripts/test_woodland_traps.cjs` (new counts and configurable evidence output).
