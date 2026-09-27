# Level 6 — Emberfall Caldera

A 19,000-pixel volcanic stage with basalt stepping ridges, animated lava, drifting embers, an orange moon and warm-lit question/vault doors. Seven question gates and three diamond vaults remain. Seven routes alternate ascent and descent; the final river uses nine stepping stones. There are ten vertical lifts, six collapsing rocks, thirteen aerial sentries, five sweeping cutters and four elevated cannons. Trench projectiles use an ember palette. Falling into the rivers uses the existing checkpoint recovery behavior.

Campaign integration includes the sixth map card, 18-star total, Continue support and completion migration from Level 5. Each subject is partitioned into six disjoint pools (at least seven questions per pool). This repartitions pools from the five-level build; historical questions seen in an older build are not tracked.

Validation: all-level layout tests, subject question tests, and browser campaign tests pass (42 distinct gate questions across six actual level starts). The isolated traversal fixture passed all 51 landings across seven routes with original jump physics. Enemies are removed and hazard damage disabled in that fixture; it does not certify full-combat balance. Physical-device performance has not been measured. See artifacts/level6-ascent for route results and screenshots.
