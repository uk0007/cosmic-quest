# Terrain and grounding refinement

The ground and floating ledges now use the same layered stone material in each biome. Plains and Sanctuary have moss fringes; Caverns use purple mineral stone; Summit uses pale blue stone. Continuous rock faces replace the large, nearly blank cliff panels and scattered stone decals. Floating platforms have substantial rock undersides and a flat, readable top aligned with their collision surface. Collapsing platforms use the same biome material.

The dog's collision-body bottom now matches the opaque paw baseline at source row 121. Ground textures start at the collision line with an opaque lip, so transparent foliage cannot make the dog appear suspended. The cave is anchored using its opaque floor baseline at row 462 of each 470-pixel frame, rather than an arbitrary vertical offset.

Sanctuary's inherited stone decorations, gate doors, and rear vault barriers have been replaced with moss assets. Question-gate collision handling now identifies doors by their gameplay role, independent of texture. The cave's flanking stones use the moss pack. Repeated middle-distance mountain art is reduced in scale to give the foreground more space.

Verification scripts:

- `scripts/test_adventure_layout.cjs`: authored section, checkpoint, and vault assertions.
- `scripts/test_adventure_surface_alignment.cjs`: paw, body, cave, and ledge surface alignment in all four levels; Sanctuary gate role checks.
- `scripts/test_adventure_browser.cjs`: screenshots and uninterrupted touch-input campaign playthroughs, with isolated component checks for moving and collapsing platforms.

Screenshots and browser results are under `artifacts/terrain-refinement/`. Screenshot fixtures reposition the camera for inspection; playthrough fixtures use ordinary movement/jump/fire inputs and quiz button clicks. Browser tests use software rendering and do not establish physical-device frame rates.

Final results: all four uninterrupted playthroughs reached victory with seven gates, three diamonds, and zero falls; no page errors or failed assets were recorded. Baseline checks reported zero body, ledge, and cave gaps (paw differences below floating-point precision). Level 4's two moving platforms, three collapsing ledges, geyser, touch controls, safe checkpoints, and responsive viewport checks passed.
