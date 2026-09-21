# Cheerful audio refresh

Correct answers: synthesized party pop, layered handclap noise bursts, soft wordless rising crowd tones, bright major-key fanfare and a confetti-cannon visual in Adventure Mode. No spoken “Wow.”

Wrong answers: short descending triangle-tone trombone/boing phrase. No speech synthesis, “Oh no,” or vocal imitation.

Music: 116 BPM major-key groove with kick, snare, shaker, syncopated bass, chord stabs and mallet-like melody. Audio-clock lookahead scheduling replaces the drifting musical tick timer. Answer feedback briefly ducks the music. Noise samples are reused and completed audio nodes are disconnected. Title music settings now use the current engine API.

These are synthesized effects, not recorded human crowd samples. Browser validation rendered both answer effects into three-second WAV previews, checked nonzero output below clipping, and exercised music stop/restart without script errors. Subjective speaker/headphone listening remains for user review.

Previews and checks: `artifacts/audio-refresh/`. Sources: `scripts/build_game.py`, `scripts/adventure_game.js`, generated `index.html`, and `scripts/test_audio_feedback.cjs`.
