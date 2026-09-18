# Moonmoss Sanctuary — Level 4

The campaign now has a fourth authored chapter using the supplied Mossy Assets, Plant Animations, Slimes, and BlueWizard archives. Seven sections lead from Wizard Clearing through Hanging Canopy, Springflower Rise, Living Moss Bridge, Slime Garden, Windfern Grove, and Sanctuary Heart. The level contains seven knowledge gates, three diamond vaults, fifteen bones, and five crystals.

The new green and orange slimes retain the existing ground-patrol and armored-enemy rules. Animated wizard landmarks, flowers, ferns, grass, springflowers, and swaying hanging plants give the grove motion. Moss platforms include static steps, two moving platforms, and three collapsing platforms. Existing jump, pulse, wind, and geyser mechanics are reused.

## Background repair

Every chapter now has an animated, full-viewport cosmic haze beneath the stars and planet. The seamless haze is precomputed once as a 512×256 texture, then scrolled by a lightweight shader, preserving sharp star rendering without recalculating noise each frame. It updates with the existing 30 Hz ambient render cadence, independently of gameplay.

A continuous, slowly scrolling panorama replaces the separated distant mountain images. Its cover scale is recomputed after camera zoom and resizing; horizontal and vertical scale stay equal to preserve the artwork's proportions. Its transparent upper sky reveals the animated celestial layer. Landscape, portrait, and desktop dimensions are checked against the camera's internal viewport as well as the displayed canvas.

## Assets and campaign

Run `python3 scripts/process_mossy_assets.py` with the supplied archives under `New assets/` to rebuild the sixteen optimized PNGs and manifest under `assets/adventure/mossy/` (about 1.8 MB). Animation frames share a union crop and consistent frame size, avoiding frame-to-frame shifts. Atlas crops remove adjacent artwork. Source archives remain unchanged.

Level selection uses the engine's campaign metadata. Continue, victory navigation, totals, new-game progress, and save migration now support four chapters. A legacy three-level save with a completed Summit unlocks Moonmoss Sanctuary. The service-worker cache version is updated.

## Verification

Evidence lives under `artifacts/level4/`. Browser checks use Chromium with mobile touch emulation and SwiftShader; these are not physical-phone performance measurements.

- Layout assertions pass for all four chapters.
- Main Level 4 playthrough reaches the cave through seven gates, with three diamonds and no falls.
- All fifteen bones and five crystals pass isolated optional-route reachability checks. Two bone placements were adjusted to make their platform approaches more forgiving.
- Both moving platforms carry the player. All three collapsing platforms warn, fall, and return. The springflower geyser launches correctly.
- All seven checkpoint locations are on solid ground outside enemy patrols and thorns. Touch movement/jump and resize checks pass.
- The rendered background covers 844×390, 390×844, and 1280×720 viewports with uniform artwork scaling. An isolated sky pixel comparison verifies visible animation without character or camera movement.
- Four level cards and legacy Level 4 unlocking pass the campaign migration fixture.

The optional-route fixture starts near each collectible with gates already open, then uses normal jumping and movement. It is distinct from the uninterrupted main-route playthrough. Component fixtures also open gates to prevent unrelated quiz pauses when positioning the player at a platform.

The final uninterrupted touch playthrough saved Level 4 as unlocked with three stars and three diamonds, and hid the next-level button at the campaign's end. It measured about 25 FPS at victory and a 46.7 ms 95th-percentile gameplay frame time under SwiftShader with continuous pulse firing. This does not establish a 55–60 FPS result on a physical mobile device; that performance target remains unverified.
