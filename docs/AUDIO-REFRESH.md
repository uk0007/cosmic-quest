# Cheerful audio refresh

Correct answers: synthesized party pop, layered handclap noise bursts, soft wordless rising crowd tones, bright major-key fanfare and a confetti-cannon visual in Adventure Mode. No spoken “Wow.”

Wrong answers: short descending triangle-tone trombone/boing phrase. No speech synthesis, “Oh no,” or vocal imitation.

Music: 116 BPM major-key groove with kick, snare, shaker, syncopated bass, chord stabs and mallet-like melody. Audio-clock lookahead scheduling replaces the drifting musical tick timer. Answer feedback briefly ducks the music. Noise samples are reused and completed audio nodes are disconnected. Title music settings now use the current engine API.

These are synthesized effects, not recorded human crowd samples. Browser validation rendered both answer effects into three-second WAV previews, checked nonzero output below clipping, and exercised music stop/restart without script errors. Subjective speaker/headphone listening remains for user review.

Previews and checks: `artifacts/audio-refresh/`. Sources: `scripts/build_game.py`, `scripts/adventure_game.js`, generated `index.html`, and `scripts/test_audio_feedback.cjs`.

## Visible correct-answer celebration

The confetti canvas previously shared the question modal's z-index and was covered by it. It now renders above the modal, with a two-second celebration banner, gold star showers, side cannons and three waves of radial firework particles. Adventure correct answers call the explicitly exported celebration function. Input passes through the overlay, and the banner removes itself after 2.2 seconds. Visual celebration remains independent of the sound toggle.

Applause now lasts roughly 2.5 seconds with 52 layered, fuller claps and a longer music duck; the background composition is unchanged. An actual gate-answer browser test verified visible canvas pixels above the modal, the banner, automatic removal and no script errors. The refreshed correct effect rendered below clipping. Screenshot: `artifacts/answer-celebration/correct.png`.


## Supplied applause recording

Correct answers now play `assets/audio/correct-applause.mp3`, copied unchanged from the user's `pwlpl-applause-sound-effect-521104.mp3`. It replaces the synthesized celebration audio; existing stars, confetti and fireworks stay intact. The recording is decoded once, repeat triggers restart rather than stack, and SFX mute stops it. Background music remains unchanged and ducks while applause plays. `scripts/test_applause_recording.cjs` verifies decoding, playback, repeat behavior and mute.
