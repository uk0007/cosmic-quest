# Level 5 — Obsidian Observatory

A new fifth campaign biome: eclipse-lit ruins with violet atmosphere, carved rune pillars, crystal lamps and rocky observatory platforms. The 18,000-pixel route reuses the supplied pack artwork and tested summit traversal primitives, with a new scene composition and wider layout.

Seven sections: Eclipse Courtyard, Suspended Archive, Astral Liftworks, Clockwork Causeway, Meteor Gallery, Orbital Engine and Observatory Heart. Each ends at one of seven question gates; three diamond vaults remain.

Complexity comes from diagonal lift motion, wider gaps, eleven vertical cutter pillars, two sweeping cutters, four repeating cannons, thirteen enemies and three mandatory timed locks. The added mid-level Eclipse Bridge introduces the timing mechanic before Orbital Lock and Observatory Core. Upper routes offer collectibles while exposing the dog to elevated hazards. Damage values remain unchanged; difficulty comes from route/timing combinations.

Campaign integration adds a fifth map card, 15-star/15-diamond totals, Continue support and Level 4 → Level 5 progression. Existing saves with a completed Level 4 unlock the new level; localhost keeps all levels available for review. Level 5 is the final available stage. Question pools now partition each subject across five levels with at least seven unique questions per level. This reallocates earlier pools when upgrading from the four-level build; historic questions from old versions are not tracked.

Sources: `scripts/level_five.js`, `scripts/adventure_game.js`, `scripts/build_game.py`, `scripts/adventure_questions.js` and generated `index.html`. Static layout and question tests cover all five levels. Browser evidence is in `artifacts/level5/`. Timing fixtures isolate the jump windows; the full playthrough retains combat. Physical-phone performance is not certified.

Results: the full touch playthrough finished seven gates and three diamonds with zero falls and 100% final energy; moving-platform contact was recorded. All three isolated timed crossings passed. Software-rendered average was 10.4 FPS, not a mobile smoothness certification. The local server was restarted during verification because the previous preview process had stopped.
