# Journey map, level numbering and results

Level selection uses a new original SVG atlas background and a numbered winding trail with seven biome stops. Mobile uses a single-column trail; unearned map stars are visibly dimmed.

Frostfall Chasm is now Level 7. Old Level 8 progress is merged into 7 using the best score, stars, bones and diamonds, then the obsolete entry is removed. Its persisted question deck remains available under the new number. Runtime and campaign IDs now run consecutively from 1 to 7.

Results previously updated nonexistent `adv-star-*` elements while markup used `star-slot-*`. The reveal targets now match. The score counter had a similar ID mismatch and is also fixed. Star scoring is now based on correct answers: 7/7 awards three stars, 4–6 awards two, and completing the level with 0–3 awards one. Energy and collectibles remain separate stats. Existing best-star records are retained.

Browser checks cover desktop/mobile rendering, no mobile horizontal overflow, save migration with conflicting old/new records, and visible 1/2/3-star awards including perfect answers with low energy and no collectibles. Depth/checkpoint checks and all 49 campaign questions pass under the new numbering. Evidence: artifacts/journey-map and artifacts/level7-depth.
