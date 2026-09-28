# Distinct level mechanics

The shared cutter-and-cannon encounters have been replaced with a primary obstacle family per biome. Mechanical guns remain in Level 5. Each family has seven authored encounters (ten icicle zones in Level 7), a first-encounter hint and visible warning indicators. Later sections shorten cycle periods. Existing geometry, seven question gates and three diamond vaults remain.

| Level | Main obstacle | Player decision | Enemy identity |
|---|---|---|---|
| 1 | Rolling roots | Jump over a low moving obstacle | Charging beetles |
| 2 | Crystal beams | Wait for the tall beam to turn off | Crystal sentries that stop and patrol |
| 3 | Lightning | Read the warning and cross after the strike | Diving rays, hoppers and armored crabs |
| 4 | Bouncing spores | Judge the bounce height before crossing | Mushroom slimes with hopping ground variants |
| 5 | Orbital pendulums | Cross as the pendulum swings away; dodge gun lanes | Drones with alternating patrol speed |
| 6 | Lava vents | Cross or land after the eruption ends | Flame wisps with broad vertical motion |
| 7 | Falling icicles | Bait a falling shard, then descend onto the shelf | Ice bats with diving flight |

Obstacle clocks stop during quiz pauses. Damage remains eight per contact with the existing invulnerability window. Scene creation now clears optional thorn/collapsing-group references; this fixes a destroyed-group collision error when moving from a level with thorns to one without them.

Validation: all-level layout and question tests pass. The seven-level browser fixture verifies warning/active/rest states, physics overlap damage, moving trajectories, biome-specific enemies, and paused clocks; it finishes without browser errors. A real jump-input fixture also clears a moving root without damage. These fixtures isolate hazards from enemies and do not certify a full combat playthrough. Old cannon/timing-trial artifacts describe the superseded shared encounter design. New evidence is in artifacts/biome-challenges.
