# Level 5 — Suspended Observatory redesign

Level 5 is an 18,000-pixel climbing course with seven mandatory elevated crossings. Each crossing climbs a staircase of suspended platforms 375–475 pixels above the gate islands before descending to a safe question area. Broad trenches prevent a ground-level shortcut. Seven question gates, three diamond vaults and the five-level subject question pools remain.

Visuals are specific to Level 5: cyan-lit metal platforms, hanging cables, dark tower silhouettes, animated orbital rings and metal gate islands. Other levels retain their illustrated landscapes.

The seven sections are First Ascent, Elevator Spires, Crumbling Stairway, Cannon Skywalk, Blade Gallery, Orbital Liftworks and Final Sky Citadel. Encounters include four moving lifts (the final one moves diagonally), three collapsing platforms, five sweeping blades, four elevated cannon lanes and thirteen airborne sentries. Rising trench energy remains active. Collectibles guide the upward route; each gate has a solid landing area before it.

Validation: layout and question-bank tests pass. `scripts/test_level5_ascent.cjs` exercises original movement and double-jump physics across all 49 authored landing targets. All seven routes passed, including moving and collapsing supports. This is an isolated traversal fixture: enemies are removed, gates opened and hazard damage disabled. It does not establish full-combat difficulty balance or physical-device frame rate. Evidence is in `artifacts/level5-ascent/`; older `artifacts/level5/` results describe the superseded design.
