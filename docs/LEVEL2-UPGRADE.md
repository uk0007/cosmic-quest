# Crystal Caverns upgrade

Level 2 is now 15,200 world pixels, with seven question gates and three diamonds. Its seven expanded chambers retain rock ceilings, layered cavern walls and local crystal glows.

Each chamber adds a cutter and traversal challenge. Chambers 2 and 4 introduce new moving crossings with energy-shot ravines; chambers 1, 3 and 5 use thorn bypasses and vertical lifts. Chambers 6 and 7 combine ground patrols, flying enemies, armored guards, repeating cannon fire, sweeping cutters and timed barriers.

Totals: 13 enemies, nine vertical cutters, two sweeping cutters, four cannons, eight energy-shot gaps, nine moving platforms and two timed trials. Existing collapsing rocks remain.

Compared with Level 1, cannon shots travel at 350 rather than 320 pixels/second; fire intervals are 1.15/1.45 seconds. Late trial openings last 2.0 and 1.7 seconds. Expanded-chamber lifts have modestly quicker cycles. Damage stays at the existing 8 energy, and question checkpoints remain outside patrol ranges. Nearby warning lights and countdown signs provide advance notice. Projectile fire inside each timed gap stops during its advertised opening.

Level 1 is unchanged. The shared cannon/cutter implementation is now driven by the Level 2 configuration and uses the same pause, damage and projectile-pool behavior.

Validation: static layout/checkpoint assertions pass all four levels. Browser evidence under `artifacts/level2-upgrade/` contains the full touch playthrough and isolated timing fixtures. Timing fixtures open gates and remove enemies to isolate jumping; the full playthrough retains enemies and hazards. Physical-device performance has not been verified.

Both isolated timed crossings passed. The full playthrough finished with seven gates, three diamonds, 100% final energy and zero falls; it recorded contact with moving and collapsing platforms. Concurrent software-rendered testing averaged 4.9 FPS, so this establishes functional completion rather than mobile performance certification. Timing fixtures use a longer wall-clock allowance for slow rendering without changing gameplay timing.
