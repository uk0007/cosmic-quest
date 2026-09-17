# Phase 8H — handcrafted level art and composition

Scope: environmental composition and traversal layout using existing mechanics. Seven gates, seven existing enemies, three diamond vaults per level; no bosses, powers, enemy types, or quiz mechanics added. Existing uncommitted redesign work was preserved and corrected.

## Assets used from the pack

Existing optimized assets in `assets/adventure/`: mountain silhouettes (`mountains`, `mountains_3`, `mountains_4`, `mountains_summit`), `cloud`, `platform`, `stone_crag`, `mossy_rock`, `rock_boulder`, `cavern_rock`, `collapsing_rock`, trees and tree clusters, fences, rune pillar/spiral/tablet/stone/arch, crystals, gate doors/barriers, bones, dog animation, and `cave_anim`. Ambient sheets: grass, butterfly, bubble, flies. No new downloaded art.

The nominal stone/cloud platform files were opaque ground crops. Floating surfaces now reuse the pack's material inside cached canvas silhouettes with tapered rock undersides, crystal veins in the cavern, and pale rock on the summit. Artwork uses uniform scaling; the continuous floor repeats a narrow natural-aspect surface rather than stretching one image across each segment.

## Three.js and full-screen layers

The viewport fills `100dvw × 100dvh`. CSS radial atmospheres sit beneath the transparent Three.js and Phaser canvases; no opaque Phaser sky image or full-screen cyan filter is drawn. Three.js uses soft round stars and nebula particles, shaded ringed planets, and background-only shooting stars at 12–26 second intervals. Motion uses elapsed time. Themes: navy/cyan/violet plains, darker indigo/violet cavern with restrained cyan accents, brighter purple/gold/cyan summit.

Desktop: 1,100 stars / 180 nebula particles. Mobile: 450 / 80, with DPR capped at 1.25 (desktop 1.5). Hidden title and gameplay backgrounds skip GPU rendering. Textures are cached and reused. No new collision objects are attached to ambience.

| Layer | Depth | Parallax X / Y |
|---|---:|---|
| Three.js stars / nebula / planet | DOM beneath Phaser | .05 / .03 / .025 horizontal camera multipliers |
| Far mountain silhouettes | 10 | .12 / .18 |
| Upper cloud wisps | 12 | .16 / .12 |
| Mid formations | 20 | .32 / .38 |
| Cave vaults and hanging crystals | 22–23 | .32 / .35 |
| Section landmarks | 24 | 1 / 1 |
| Near silhouettes | 25 | .62 / .70 |
| Summit lower clouds | 26 | .55 / .65 |
| Ground / floating surfaces | 29–30 | 1 / 1 |
| Grass / ambient decoration / cliff stones | 35–40 | 1 / 1 |
| Gates / vault roof | 45 | 1 / 1 |
| Collectibles / enemies / dog | 50 / 60 / 70 | 1 / 1 |
| Gameplay effects / HUD | 80 / DOM overlay | World / fixed |

Cavern ceiling vaults have explicit skylight gaps; the summit has lower drifting cloud masses and ruined stone landmarks. Each terrain segment has a continuous cap, irregular cliff side, dark strata, and edge stones. Decoration stays beneath the player and does not create false footing across trenches.

## Level 1 — Nebula Plains

| Section → gate X | Landmark | Traversal and collectible route |
|---|---|---|
| Grassland Intro → 800 | Ancient tree | Safe ground, one crab, 110px first trench, low bone trail, butterflies and grass |
| Floating Stones → 1660 | Spiral rune | Two stepping stones across 260px gap, crossing bones, diamond 1 |
| Geyser Garden → 2400 | Rune pillar | Existing geyser to upper platforms; two optional high bones and crystal |
| Broken Bridge → 3040 | Crag formation | 280px trench, moving platform and two static rests, bridge bone, diamond 2 |
| Falling Stone Run → 4000 | Mossy boulder | Three 700ms warning stones; safe banks, existing beetle afterward, stone bone trail |
| Twilight Grove → 4700 | Large tree | Thorn bypass, upper branch route, optional high bone |
| Celestial Approach → 5260 | Spiral monument | Floating ascent, high bones, diamond 3, framed cave at 5700 |

## Level 2 — Crystal Caverns

| Section → gate X | Landmark | Traversal and collectible route |
|---|---|---|
| Cave Entrance → 800 | Cavern formation | Short fissure, low bone route, overhead vaults |
| Bubble Chamber → 1660 | Crystal landmark | Crystal slabs across 290px gap, bubbles, slab bones, diamond 1 |
| Crystal Shaft → 2400 | Rune pillar | 145px vertical moving-platform travel toward a high shelf; upper bone/crystal |
| Collapsing Cavern Bridge → 3040 | Rune tablet | Three 650ms warning stones, bridge bones, diamond 2 |
| Deep Moving-platform Trench → 4080 | Crystal formation | Moving slab over 280px trench, floating bone, safe landing before gate |
| Rune Chamber → 4800 | Spiral rune | Existing geyser/high ledge route and upper bone; flies and layered rock |
| Crystal Exit Portal → 5400 | Crystal waystones | Final ledges, diamond 3, portal at 5850 |

## Level 3 — Starlight Summit

| Section → gate X | Landmark | Traversal and collectible route |
|---|---|---|
| Summit Intro → 800 | Rune pillar | 150px sky fissure, safe low bones |
| Celestial Wind Leap → 1740 | Obelisk | Existing wind mechanic assists a 340px crossing, two floating rocks, diamond 1 |
| Floating Ruins → 2470 | Rune arch | Existing geyser and meteor passage, optional upper bone |
| Skybridge Traverse → 3150 | Spiral monument | 380px trench, moving rock with 145px travel, bridge bone, diamond 2 |
| Crumbling Summit → 4080 | Boulder | Three 650ms warning stones, optional abyss bones |
| Obelisk Sanctuary → 4860 | Rune tablet | High double-jump route, two optional high bones |
| Gateway to the Cosmos → 5490 | Spiral waystone | Floating approach, diamond 3, framed portal at 5930 |

Every section has explicit start/gate/recovery coordinates, landmark, traversal description, and collectible route. The layout test checks all 21 sections, vault floor continuity, counts, and checkpoint patrol clearance.

## Cave orientation, scale, platforms, and camera

All three exits use `cave: { flipX: true, scale: 0.70 }`. The source doorway opens toward the right, so horizontal flipping presents the mouth to a dog approaching from the left. A 252×329px cave frame provides a readable doorway relative to the dog. The overlap collider and entrance animation use the mirrored mouth position. Supporting stones, runes/crystals, and subdued glow frame the destination. Cave completion requires all seven gates.

Visible dog length is approximately 120 world pixels. Floating surface standards: small 120px, medium 240px, large 420px; collapsing rocks use 120px width. Uniform scaling preserves silhouettes. Vault roofs use the same stone treatment at 315px width.

Camera zoom remains .68–.92, with smooth ±120px directional look-ahead. The dog is framed around 62% of viewport height during ordinary follow, leaving ground and upcoming landing zones clear of touch controls. A fixed 760px level reference height prevents geometry shifting when the viewport resizes. Vertical bounds allow smooth ascent. Far scenery uses separate vertical parallax.

No permanent debug destination labels remain. Existing temporary cinematic level/gate banners are retained.

## Restored animation and collision behavior

Butterflies, bubbles, flies, collapsing rocks, and thorns had mismatched configuration names and were never instantiated. Their existing authored placements are now connected to the scene. Grass remains active; clouds drift slowly; cave glow is animated.

Additional QA fixes: gate approach beams now open the question instead of trapping the player above the visible door; sparse rear-vault indexing uses gate indices; scene cleanup removes listeners and safely handles already-destroyed projectile groups. Hazard/projectile groups preserve gravity settings so geyser plumes stay anchored and meteors/pulses remain airborne. Wind updates run after movement input so their velocity contribution is retained. Checkpoint-adjacent patrols were moved away.

## QA evidence and acceptance limits

See the JSON logs and original screenshots in `artifacts/phase8h/`. Snapshot runs position the camera for composition review; playthrough runs use traversal inputs and quiz buttons without teleporting or disabling collision. Component tests use isolated spawn fixtures, then unmodified physics for riding/collapse/launch behavior. These are distinct tests.

Physical-device testing is not available in this environment; software-rendered browser emulation does not certify actual iOS/Android GPU, thermals, or battery behavior.

### Full playthrough result

All three levels reached their cave exits through normal movement/jump handlers, continuous firing, quiz answers and the existing explanation-skip button. No movement teleport, invulnerability override, collision disabling, or gate-unlock shortcut was used in these runs. Optional routes were not all traversed by the end-to-end runner; the moving/collapsing/geyser tests cover those mechanics separately.

| Level | Gates | Diamonds | Falls | Victory | Measured FPS | 95th-percentile frame time |
|---|---:|---:|---:|---|---:|---:|
| 1 | 7/7 | 3/3 | 0 | Pass | 48.0 | 26.6 ms |
| 2 | 7/7 | 3/3 | 0 | Pass | 43.0 | 30.0 ms |
| 3 | 7/7 | 3/3 | 0 | Pass | 46.1 | 28.3 ms |

[Mobile playthrough log](../artifacts/phase8h/playthrough-mobile.json). The renderer identifies itself as ANGLE/Vulkan **SwiftShader**, a CPU software renderer. The benchmark includes continuous firing and quiz overlays. It demonstrates functional mobile emulation, not a hardware mobile 60-FPS guarantee. Hidden-background GPU work is eliminated, particle count and DPR are capped, and the visual-only runs are lighter; native-device profiling remains required before declaring the performance criterion fully accepted.

### Visual QA screenshots

All start/middle/final compositions were captured and visually reviewed at desktop 1280×720 and mobile landscape 844×390. The star visibility test freezes the scene, hides only the Three.js star point cloud, and compares screenshot pixels, excluding the HUD/control bands. Positive differences prove that star pixels reach the composited display rather than merely existing in the Three.js scene.

| Level | Desktop start / middle / exit | Mobile start / middle / exit |
|---|---|---|
| 1 | [start](../artifacts/phase8h/level-1-start.png) · [middle](../artifacts/phase8h/level-1-middle.png) · [exit](../artifacts/phase8h/level-1-exit.png) | [start](../artifacts/phase8h/level-1-start-mobile.png) · [middle](../artifacts/phase8h/level-1-middle-mobile.png) · [exit](../artifacts/phase8h/level-1-exit-mobile.png) |
| 2 | [start](../artifacts/phase8h/level-2-start.png) · [middle](../artifacts/phase8h/level-2-middle.png) · [exit](../artifacts/phase8h/level-2-exit.png) | [start](../artifacts/phase8h/level-2-start-mobile.png) · [middle](../artifacts/phase8h/level-2-middle-mobile.png) · [exit](../artifacts/phase8h/level-2-exit-mobile.png) |
| 3 | [start](../artifacts/phase8h/level-3-start.png) · [middle](../artifacts/phase8h/level-3-middle.png) · [exit](../artifacts/phase8h/level-3-exit.png) | [start](../artifacts/phase8h/level-3-start-mobile.png) · [middle](../artifacts/phase8h/level-3-middle-mobile.png) · [exit](../artifacts/phase8h/level-3-exit-mobile.png) |

Desktop star-only screenshot differences: **849–1,425 visible pixels** in every sampled view. Mobile differences are recorded in [visual-mobile.json](../artifacts/phase8h/visual-mobile.json); all nine mobile views also pass. Full logs: [desktop](../artifacts/phase8h/visual.json), [mobile](../artifacts/phase8h/visual-mobile.json). Contact sheets: [desktop](../artifacts/phase8h/desktop-contact-sheet.jpg), [mobile](../artifacts/phase8h/mobile-contact-sheet.jpg).

### Component and rotation results

[Component log](../artifacts/phase8h/components-mobile.json): all 4 moving platforms carry the dog; all 9 collapsing rocks warn, fall, and reset; all 5 geysers launch and remain anchored. All 21 checkpoint positions have solid ground and clear patrol/thorn space. Movement and jumping through touch-button pointer events pass in all three levels. Portrait rotation retains world coordinates and both canvases cover the viewport; landscape is restored afterward. Browser console exceptions and asset HTTP errors: zero.

### Build and reproducibility

- `python3 scripts/build_game.py` — production HTML generated successfully.
- `node --check scripts/adventure_game.js`, both generated inline scripts, and `sw.js` — pass.
- `python3 -m py_compile scripts/build_game.py` — pass.
- `node scripts/test_adventure_layout.cjs` — all 21 authored sections, collectible routes, unchanged counts, vault floors, and safe checkpoints pass.
- `git diff --check` — pass.
- `scripts/test_adventure_browser.cjs` supports `--mobile`, `--components`, and `--snapshots`; requires Playwright and pngjs on `NODE_PATH`, plus the project served at `http://127.0.0.1:8765`.
- Service-worker cache bumped to `cosmic-quest-v4-8h` so the old game build is not retained under the old cache name.

### Git commit

The implementation, generated build, test scripts, this report, and QA evidence are committed together as `Polish handcrafted adventure levels and cosmic composition`. The final response supplies the resulting commit hash. The pre-existing untracked `6000 SVG Silhouette/` directory is excluded.

### Remaining issues / acceptance limits

- Physical Android/iOS performance, touch latency, and sustained thermal behavior remain unverified. Snapshot FPS includes deliberate render-loop freezes for pixel comparisons and is not a gameplay benchmark. Hardware desktop throughput was not benchmarked. No claim of universal smooth 60 FPS is made.
- Automated traversal proves completion and isolated fixtures exercise every moving/collapsing platform and geyser, but it does not replace a child playtester judging difficulty or exhaustively test every optional collectible path.
- The cave openings, layer order, full viewport composition, character contrast, and all 18 sampled views were reviewed. No unresolved visual blocker was identified in those samples; unsampled viewport sizes may still warrant art review.
