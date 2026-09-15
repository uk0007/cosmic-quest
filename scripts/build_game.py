#!/usr/bin/env python3
"""
Build script that compiles index.html using the exact visual design provided by the user:
- Beautiful fantasy cosmic landscape background (floating islands, observatory, robot, rainbow road, planets).
- 3D bubbly 'Cosmic Quest IQ' header with rocket and stat pills.
- Capsule HUD with Earth icon, progress bar, streak flame, and PTS.
- Main question card with sunny gold border, Zoology/topic tag, and colourful options (Pink A, Blue B, Orange C, Green D).
- Side POWERS card with large glossy orbs: HINT (💡), 50:50 (✂️), and FREEZE (❄️).
- Joyful upbeat arcade soundtrack synthesized via Web Audio API.
"""

import base64

def build():
    # Read questions JSON for IGKO, ISO, and IEO
    with open("data/questions.json", "r", encoding="utf-8") as f:
        gk_questions_str = f.read()

    with open("data/iso_questions.json", "r", encoding="utf-8") as f:
        iso_questions_str = f.read()

    with open("data/ieo_questions.json", "r", encoding="utf-8") as f:
        ieo_questions_str = f.read()

    with open("scripts/adventure_game.js", "r", encoding="utf-8") as f:
        adventure_js_str = f.read()

    # Read and base64-encode user artwork for 100% self-contained standalone HTML
    with open("assets/game_art.jpg", "rb") as img_f:
        bg_b64 = base64.b64encode(img_f.read()).decode("utf-8")

    bg_data_uri = f"data:image/jpeg;base64,{bg_b64}"

    template = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cosmic Quest IQ: The Galactic Knowledge Odyssey</title>
  <meta name="description" content="An interactive, super colourful and upbeat trivia adventure game for 10-year-olds with 50 Olympiad questions, power-ups, avatars, and a printable certificate!" />
  
  <!-- PWA & Mobile Web App Meta Tags -->
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="theme-color" content="#090d16">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Cosmic Quest">
  <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png">

  <!-- Google Fonts: Fredoka, Nunito & Outfit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800&family=Nunito:wght@500;600;700;800;900&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">

  <!-- Phaser 3 & Three.js CDN Engines for 2D Adventure Platformer Mode -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <style>
    :root {
      --sky-blue: #0284c7;
      --sky-blue-light: #e0f2fe;
      --candy-pink: #ec4899;
      --candy-pink-light: #fff1f5;
      --sun-yellow: #f59e0b;
      --sun-yellow-light: #fefce8;
      --mint-green: #10b981;
      --mint-green-light: #f0fdf4;
      --purple: #9333ea;
      --purple-light: #fdf4ff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --font-body: 'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --radius-xl: 28px;
      --radius-lg: 20px;
      --radius-md: 14px;
      /* Sector Color Palette */
      --sector-1: #3b82f6;
      --sector-2: #10b981;
      --sector-3: #f59e0b;
      --sector-4: #8b5cf6;
      --sector-5: #f43f5e;
      /* Glass tokens */
      --glass-bg: rgba(255, 255, 255, 0.82);
      --glass-border: rgba(255, 255, 255, 0.65);
      --glass-blur: blur(22px) saturate(1.5);
      --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    body {
      background-color: #0f172a;
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      position: relative;
    }

    /* Living Cosmic Background Artwork (Gentle 60fps Parallax Float) */
    .bg-cosmic-artwork {
      position: fixed;
      top: -3%;
      left: -3%;
      width: 106%;
      height: 106%;
      background-image: url('__BG_IMAGE_URI__');
      background-position: center center;
      background-size: cover;
      background-repeat: no-repeat;
      z-index: 0;
      transform-origin: center center;
      animation: cosmicArtFloat 26s ease-in-out infinite alternate;
      will-change: transform;
      pointer-events: none;
    }

    @keyframes cosmicArtFloat {
      0% {
        transform: scale(1) translate(0, 0);
      }
      50% {
        transform: scale(1.035) translate(-12px, -8px);
      }
      100% {
        transform: scale(1.018) translate(10px, 8px);
      }
    }

    /* Living Cosmic Starfield & Shooting Stars Canvas */
    #cosmic-stars-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
    }

    /* Soft overlay for readability — enriched cosmic tint */
    .bg-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background:
        radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.06) 0%, transparent 55%),
        radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.03) 0%, rgba(15, 23, 42, 0.22) 100%);
      pointer-events: none;
      z-index: 2;
    }

    /* Confetti Canvas */
    #confetti-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    }

    /* Main Container */
    .app-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 1080px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
    }

    /* ========================================================
       TOP HEADER (ROCKET + 3D TITLE + STAT CAPSULES)
       ======================================================== */
    header.cosmic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 2px solid var(--glass-border);
      border-radius: 999px;
      margin-bottom: 16px;
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.12),
        0 4px 0 rgba(203, 213, 225, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.85);
      position: relative;
    }
    /* Animated glow underline */
    header.cosmic-header::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 15%;
      width: 70%;
      height: 4px;
      border-radius: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6);
      background-size: 300% 100%;
      animation: headerGlowShift 6s linear infinite;
      opacity: 0.7;
    }
    @keyframes headerGlowShift {
      0% { background-position: 0% 50%; }
      100% { background-position: 300% 50%; }
    }

    .header-main-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .brand-rocket {
      font-size: 2.2rem;
      animation: rocketBounce 2.5s ease-in-out infinite alternate;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes rocketBounce {
      0% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-4px) rotate(-6deg); }
      100% { transform: translateY(2px) rotate(4deg); }
    }

    .brand-title {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: -0.5px;
    }

    .title-cosmic-quest {
      color: #0284c7;
      text-shadow: 0 3px 0 #0369a1, 0 6px 12px rgba(2, 132, 199, 0.4);
      -webkit-text-stroke: 1px #ffffff;
    }

    .title-iq {
      color: #facc15;
      text-shadow: 0 3px 0 #b45309, 0 6px 12px rgba(250, 204, 21, 0.5);
      -webkit-text-stroke: 1px #ffffff;
    }

    .header-stats-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 999px;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      box-shadow: 0 3px 0 rgba(0,0,0,0.06);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .stat-pill.pop-anim {
      animation: statPillPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes statPillPop {
      0% { transform: scale(1); }
      40% { transform: scale(1.25) rotate(3deg); filter: brightness(1.2); }
      100% { transform: scale(1); }
    }

    .stat-pill.stars {
      background: linear-gradient(135deg, #fef9c3, #fef3c7);
      border: 2px solid #fde047;
      color: #854d0e;
    }

    .stat-pill.score {
      background: linear-gradient(135deg, #e0f2fe, #dbeafe);
      border: 2px solid #bae6fd;
      color: #0369a1;
    }

    .header-actions-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .round-action-btn {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #e2e8f0;
      color: var(--text-main);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.15rem;
      box-shadow: 0 3px 0 #cbd5e1;
      transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .round-action-btn:hover {
      background: #f8fafc;
      transform: translateY(-2px) scale(1.08);
      box-shadow: 0 5px 0 #cbd5e1;
    }

    .round-action-btn:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 #cbd5e1;
    }

    /* Mobile Header Layout: Fits 100% on screen, never hidden on side */
    @media (max-width: 860px) {
      header.cosmic-header {
        flex-direction: column;
        border-radius: 20px;
        padding: 10px 14px 12px 14px;
        gap: 10px;
        align-items: stretch;
      }
      .header-main-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .brand-title {
        font-size: 1.35rem;
        gap: 4px;
      }
      .brand-rocket {
        font-size: 1.5rem;
      }
      .header-stats-group {
        gap: 6px;
      }
      .stat-pill {
        padding: 5px 10px;
        font-size: 0.8rem;
        gap: 4px;
      }
      .header-actions-group {
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding-top: 8px;
        border-top: 1px solid rgba(226, 232, 240, 0.7);
        gap: 4px;
      }
      .round-action-btn {
        width: 38px;
        height: 38px;
        font-size: 1.05rem;
      }
    }

    /* ========================================================
       SUB-HEADER HUD CAPSULE (PLANET + PROGRESS + STREAK + PTS)
       ======================================================== */
    .sub-hud-capsule {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 2px solid var(--glass-border);
      border-radius: 999px;
      padding: 8px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1), 0 3px 0 rgba(203, 213, 225, 0.5), inset 0 1px 0 rgba(255,255,255,0.8);
    }

    .sub-hud-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .planet-badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8, #0284c7);
      border: 2px solid #ffffff;
      box-shadow: 0 3px 8px rgba(2, 132, 199, 0.3), 0 0 16px rgba(56, 189, 248, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .sector-name-text {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }

    .progress-bar-wrap {
      flex: 1;
      height: 16px;
      background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
      border-radius: 999px;
      overflow: hidden;
      margin: 0 14px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.12);
      position: relative;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #06b6d4, #10b981, #8b5cf6);
      background-size: 200% 100%;
      border-radius: 999px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    /* Animated shimmer sweep on progress bar */
    .progress-bar-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: -50%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
      animation: shimmerSweep 2.2s infinite;
    }
    @keyframes shimmerSweep {
      0% { left: -50%; }
      100% { left: 150%; }
    }

    .hud-tags-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .streak-pill {
      background: #fef3c7;
      border: 2px solid #fde68a;
      border-radius: 999px;
      padding: 6px 14px;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      color: #b45309;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.25s ease;
    }

    /* Blazing Streak Fire & Plasma Mode (Triggered on 3+ Streak) */
    .streak-pill.blazing-streak {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
      border-color: #f97316;
      color: #c2410c;
      box-shadow: 0 0 16px rgba(249, 115, 22, 0.65), 0 3px 0 #ea580c;
      animation: blazingFirePulse 0.85s infinite alternate ease-in-out;
    }
    .streak-pill.blazing-streak #hud-streak-count::before {
      content: '🔥 ';
      display: inline-block;
      animation: flameFlicker 0.4s infinite alternate;
    }
    @keyframes blazingFirePulse {
      0% { transform: scale(1); box-shadow: 0 0 8px rgba(249, 115, 22, 0.4), 0 3px 0 #ea580c; }
      100% { transform: scale(1.08); box-shadow: 0 0 20px rgba(234, 88, 12, 0.85), 0 0 10px #facc15, 0 3px 0 #ea580c; }
    }
    @keyframes flameFlicker {
      0% { transform: scale(1) rotate(-4deg); }
      100% { transform: scale(1.25) rotate(4deg); }
    }

    .pts-pill {
      background: #e0f2fe;
      border: 2px solid #bae6fd;
      border-radius: 999px;
      padding: 6px 14px;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      color: #0369a1;
    }

    /* ========================================================
       60-SECOND QUESTION TIMER STYLES
       ======================================================== */
    .timer-pill,
    .question-timer-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.95rem;
      background: #eff6ff;
      border: 2px solid #60a5fa;
      color: #1d4ed8;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
      transition: all 0.3s ease;
    }
    .timer-pill.timer-warning,
    .question-timer-pill.timer-warning {
      background: #fffbeb;
      border-color: #f59e0b;
      color: #b45309;
      box-shadow: 0 2px 10px rgba(245, 158, 11, 0.25);
    }
    .timer-pill.timer-danger,
    .question-timer-pill.timer-danger {
      background: #fef2f2;
      border-color: #ef4444;
      color: #b91c1c;
      animation: timerPulseDanger 0.8s infinite alternate ease-in-out;
      box-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
    }
    @keyframes timerPulseDanger {
      0% { transform: scale(1); }
      100% { transform: scale(1.08); }
    }
    .timer-pill.timer-frozen,
    .question-timer-pill.timer-frozen {
      background: #f0fdf4;
      border-color: #38bdf8;
      color: #0284c7;
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.5);
    }
    .question-timer-bar-wrap {
      width: 100%;
      height: 6px;
      background: rgba(226, 232, 240, 0.7);
      overflow: hidden;
      position: relative;
    }
    .question-timer-bar-fill {
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      transition: width 1s linear, background 0.4s ease;
      border-radius: 0 4px 4px 0;
    }
    .question-timer-bar-fill.timer-warning {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }
    .question-timer-bar-fill.timer-danger {
      background: linear-gradient(90deg, #ef4444, #f43f5e);
    }
    .question-timer-bar-fill.timer-frozen {
      background: linear-gradient(90deg, #38bdf8, #a7f3d0);
    }
    @media (max-width: 768px) {
      .sub-hud-capsule {
        padding: 6px 14px;
        gap: 8px;
        border-radius: var(--radius-lg);
        flex-wrap: wrap;
      }
      .hud-tags-group {
        gap: 6px;
      }
      .timer-pill,
      .streak-pill,
      .pts-pill {
        padding: 4px 10px;
        font-size: 0.84rem;
      }
      .question-timer-pill {
        padding: 4px 10px;
        font-size: 0.84rem;
      }
    }

    /* Screen Transitions */
    .screen {
      display: none;
      flex-direction: column;
      flex: 1;
      width: 100%;
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .screen.active {
      display: flex;
    }

    @keyframes popIn {
      from { opacity: 0; transform: translateY(14px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* 3D Tactile Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 32px;
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      border-radius: var(--radius-lg);
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
      position: relative;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      color: #ffffff;
      box-shadow: 0 6px 0 #0369a1, 0 12px 25px rgba(2, 132, 199, 0.35);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 9px 0 #0369a1, 0 16px 30px rgba(2, 132, 199, 0.45);
    }

    .btn-primary:active {
      transform: translateY(3px);
      box-shadow: 0 3px 0 #0369a1;
    }

    .btn-gold {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      color: #78350f;
      box-shadow: 0 6px 0 #d97706, 0 12px 25px rgba(245, 158, 11, 0.35);
    }

    .btn-gold:hover {
      transform: translateY(-3px);
      box-shadow: 0 9px 0 #d97706, 0 16px 30px rgba(245, 158, 11, 0.45);
    }

    .btn-ghost {
      background: #ffffff;
      color: var(--text-main);
      border: 2px solid #e2e8f0;
      box-shadow: 0 5px 0 #cbd5e1;
    }

    .btn-ghost:hover {
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 7px 0 #cbd5e1;
    }

    /* ========================================================
       SCREEN 3: QUESTION PLAYING AREA (CARD + POWERS STATION)
       ======================================================== */
    .gameplay-layout-grid {
      display: grid;
      grid-template-columns: 1fr 130px;
      gap: 18px;
      align-items: stretch;
      width: 100%;
    }

    @media (max-width: 860px) {
      .gameplay-layout-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Main Question Card with Gold Border — Glassmorphism + Sector Top Strip */
    .question-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 3px solid rgba(250, 204, 21, 0.5);
      border-radius: var(--radius-xl);
      padding: 0 0 28px 0;
      box-shadow:
        0 16px 40px rgba(0, 0, 0, 0.1),
        0 5px 0 rgba(226, 232, 240, 0.7),
        0 0 40px rgba(250, 204, 21, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    /* Colored top gradient strip — adapts to sector color */
    .question-card::before {
      content: '';
      display: block;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, var(--sector-1), var(--sector-4), var(--candy-pink));
      flex-shrink: 0;
      margin-bottom: 24px;
    }
    .question-card > .question-meta-row,
    .question-card > .question-stem,
    .question-card > #q-rich-content,
    .question-card > .options-grid {
      padding-left: 28px;
      padding-right: 28px;
    }

    .question-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .topic-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      color: #854d0e;
      background: #fef9c3;
      border: 2px solid #fde047;
      padding: 6px 16px;
      border-radius: 999px;
    }

    .q-number-text {
      font-family: var(--font-display);
      font-size: 1rem;
      color: var(--text-muted);
      font-weight: 800;
    }

    .question-stem {
      font-family: var(--font-display);
      font-size: 1.55rem;
      font-weight: 900;
      line-height: 1.45;
      color: #0f172a;
      margin-bottom: 26px;
    }

    /* Rich Stem Elements: Tables & Lists */
    .hots-table-wrapper {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: 20px;
      font-family: var(--font-body);
      font-size: 1.05rem;
      box-shadow: 0 3px 0 #e2e8f0;
    }

    .clue-box {
      background: #fdf4ff;
      border: 2px solid #f5d0fe;
      border-left: 6px solid var(--purple);
      padding: 14px 18px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      font-size: 1.05rem;
      color: #6b21a8;
    }

    /* Options Grid (2x2 with Pink, Blue, Orange, Green pills) */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }

    @media (min-width: 640px) {
      .options-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .option-btn {
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      text-align: left;
      font-family: var(--font-body);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      backdrop-filter: blur(4px);
    }

    /* Option A: Royal Violet */
    .option-btn:nth-child(1) {
      background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
      border: 3px solid #ddd6fe;
      box-shadow: 0 5px 0 #a78bfa;
    }
    .option-btn:nth-child(1) .option-letter-badge {
      background: #7c3aed;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(124, 58, 237, 0.4);
    }

    /* Option B: Sky Blue */
    .option-btn:nth-child(2) {
      background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%);
      border: 3px solid #bae6fd;
      box-shadow: 0 5px 0 #38bdf8;
    }
    .option-btn:nth-child(2) .option-letter-badge {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.4);
    }

    /* Option C: Orange/Amber */
    .option-btn:nth-child(3) {
      background: linear-gradient(180deg, #ffffff 0%, #fefce8 100%);
      border: 3px solid #fde68a;
      box-shadow: 0 5px 0 #facc15;
    }
    .option-btn:nth-child(3) .option-letter-badge {
      background: #f97316;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(249, 115, 22, 0.4);
    }

    /* Option D: Baby Pink */
    .option-btn:nth-child(4) {
      background: linear-gradient(180deg, #ffffff 0%, #fff1f5 100%);
      border: 3px solid #fbcfe8;
      box-shadow: 0 5px 0 #f472b6;
    }
    .option-btn:nth-child(4) .option-letter-badge {
      background: #f472b6;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(244, 114, 182, 0.4);
    }

    .option-letter-badge {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 1.15rem;
      flex-shrink: 0;
      border: 2px solid #ffffff;
    }

    .option-btn:hover:not(:disabled) {
      transform: translateY(-5px) scale(1.012);
    }

    .option-btn:nth-child(1):hover:not(:disabled) { box-shadow: 0 8px 0 #a78bfa, 0 12px 24px rgba(124, 58, 237, 0.25); }
    .option-btn:nth-child(2):hover:not(:disabled) { box-shadow: 0 8px 0 #38bdf8, 0 12px 24px rgba(56, 189, 248, 0.2); }
    .option-btn:nth-child(3):hover:not(:disabled) { box-shadow: 0 8px 0 #facc15, 0 12px 24px rgba(250, 204, 21, 0.2); }
    .option-btn:nth-child(4):hover:not(:disabled) { box-shadow: 0 8px 0 #f472b6, 0 12px 24px rgba(244, 114, 182, 0.25); }

    .option-btn.correct {
      background: #ecfdf5 !important;
      border-color: #10b981 !important;
      box-shadow: 0 6px 0 #059669, 0 10px 20px rgba(16, 185, 129, 0.3) !important;
      animation: pulseGreen 0.6s ease;
    }

    .option-btn.correct .option-letter-badge {
      background: #10b981 !important;
      color: #fff !important;
    }

    .option-btn.wrong {
      background: #fff1f2 !important;
      border-color: #f43f5e !important;
      box-shadow: 0 6px 0 #e11d48, 0 10px 20px rgba(244, 63, 94, 0.3) !important;
      animation: shake 0.4s ease;
    }

    .option-btn.wrong .option-letter-badge {
      background: #f43f5e !important;
      color: #fff !important;
    }

    .option-btn.dimmed {
      opacity: 0.28;
      transform: scale(0.98);
      pointer-events: none;
    }

    @keyframes pulseGreen {
      0% { transform: scale(1); }
      50% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }

    /* ========================================================
       SIDE POWERS CARD (MATCHING USER SCREENSHOT)
       ======================================================== */
    .powers-side-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px) saturate(1.3);
      -webkit-backdrop-filter: blur(20px) saturate(1.3);
      border: 2px solid rgba(192, 132, 252, 0.5);
      border-radius: var(--radius-xl);
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow:
        0 16px 40px rgba(0, 0, 0, 0.1),
        0 5px 0 rgba(226, 232, 240, 0.6),
        0 0 30px rgba(147, 51, 234, 0.06);
    }

    .powers-card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 900;
      color: #9333ea;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .side-orb-btn {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .side-orb-btn .orb-icon-glyph {
      font-size: 1.75rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .side-orb-btn .orb-text-label {
      font-family: var(--font-display);
      font-size: 0.68rem;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-top: 3px;
      text-transform: uppercase;
    }

    .side-orb-btn .orb-counter-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: #ffffff;
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    /* Hint Orb (Lightbulb / Gold) */
    .side-orb-btn.hint-btn {
      background: radial-gradient(circle at 35% 35%, #fffbeb, #fde047 60%, #f59e0b 100%);
      box-shadow: 0 5px 0 #d97706, 0 8px 18px rgba(245, 158, 11, 0.35);
      color: #78350f;
    }
    .side-orb-btn.hint-btn .orb-counter-badge {
      background: #e11d48;
    }
    .side-orb-btn.hint-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 7px 0 #d97706, 0 12px 22px rgba(245, 158, 11, 0.45);
    }

    /* 50:50 Laser Orb (Blue) */
    .side-orb-btn.laser-btn {
      background: radial-gradient(circle at 35% 35%, #f0f9ff, #7dd3fc 60%, #0284c7 100%);
      box-shadow: 0 5px 0 #0369a1, 0 8px 18px rgba(2, 132, 199, 0.35);
      color: #0369a1;
    }
    .side-orb-btn.laser-btn .orb-counter-badge {
      background: #0284c7;
    }
    .side-orb-btn.laser-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 7px 0 #0369a1, 0 12px 22px rgba(2, 132, 199, 0.45);
    }

    /* FREEZE Orb (Snowflake / Purple) */
    .side-orb-btn.freeze-btn {
      background: radial-gradient(circle at 35% 35%, #fdf4ff, #d8b4fe 60%, #9333ea 100%);
      box-shadow: 0 5px 0 #7e22ce, 0 8px 18px rgba(147, 51, 234, 0.35);
      color: #581c87;
    }
    .side-orb-btn.freeze-btn .orb-counter-badge {
      background: #7e22ce;
    }
    .side-orb-btn.freeze-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 7px 0 #7e22ce, 0 12px 22px rgba(147, 51, 234, 0.45);
    }

    .side-orb-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      filter: grayscale(1);
      transform: none !important;
      box-shadow: 0 2px 0 #94a3b8 !important;
    }

    /* Living Powerup Energy Pulse */
    .side-orb-btn:not(:disabled) {
      animation: orbFloatPulse 3.6s ease-in-out infinite;
    }
    .side-orb-btn.hint-btn:not(:disabled) { animation-delay: 0s; }
    .side-orb-btn.laser-btn:not(:disabled) { animation-delay: 1.2s; }
    .side-orb-btn.freeze-btn:not(:disabled) { animation-delay: 2.4s; }
    @keyframes orbFloatPulse {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .side-orb-btn:hover:not(:disabled) .orb-icon-glyph {
      animation: orbSpin 0.4s ease-out;
    }
    @keyframes orbSpin {
      0% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.25) rotate(16deg); }
      100% { transform: scale(1.1) rotate(0deg); }
    }

    @media (max-width: 860px) {
      .powers-side-card {
        flex-direction: row;
        justify-content: space-around;
        padding: 12px 18px;
        border-radius: 999px;
      }
      .powers-card-title {
        display: none;
      }
      .side-orb-btn {
        width: 58px;
        height: 58px;
      }
      .side-orb-btn .orb-icon-glyph {
        font-size: 1.4rem;
      }
    }

    /* ========================================================
       KNOWLEDGE CAPSULE & HINT BUBBLE
       ======================================================== */
    .knowledge-capsule {
      display: none;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 2px solid var(--glass-border);
      border-radius: var(--radius-xl);
      padding: 0;
      margin-top: 18px;
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.15), 0 6px 0 rgba(203, 213, 225, 0.5);
      animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      overflow: hidden;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .capsule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 28px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
      border-bottom: 2px solid rgba(16, 185, 129, 0.15);
    }
    /* Correct answer capsule gets green gradient header */
    .knowledge-capsule.capsule-correct .capsule-header {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.08) 100%);
      border-bottom-color: rgba(16, 185, 129, 0.2);
    }
    /* Wrong answer capsule gets red gradient header */
    .knowledge-capsule.capsule-wrong .capsule-header {
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(251, 113, 133, 0.06) 100%);
      border-bottom-color: rgba(244, 63, 94, 0.15);
    }

    .capsule-verdict {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 900;
    }

    .capsule-verdict.correct {
      color: #059669;
    }

    .capsule-verdict.wrong {
      color: #e11d48;
    }

    .capsule-body {
      font-size: 1.15rem;
      line-height: 1.6;
      color: #334155;
      margin: 20px 28px 22px;
      background: rgba(248, 250, 252, 0.7);
      border-radius: var(--radius-md);
      padding: 18px 22px;
      border: 2px solid rgba(226, 232, 240, 0.6);
      border-left-width: 6px;
      border-left-color: var(--sky-blue);
    }

    .capsule-body strong {
      color: var(--sky-blue);
      font-family: var(--font-display);
    }

    .capsule-actions {
      display: flex;
      justify-content: flex-end;
      padding: 0 28px 24px;
    }

    /* Hint Bubble */
    .hint-bubble {
      display: none;
      background: #fefce8;
      border: 3px solid #fef08a;
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: 18px;
      color: #854d0e;
      font-size: 1.08rem;
      animation: fadeIn 0.25s ease;
      box-shadow: 0 4px 0 #fef08a;
    }

    /* ========================================================
       SCREEN 1: WELCOME / ONBOARDING
       ======================================================== */
    .welcome-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 2px solid rgba(250, 204, 21, 0.4);
      border-radius: var(--radius-xl);
      padding: 0 32px 42px;
      text-align: center;
      margin: auto 0;
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.12),
        0 6px 0 rgba(203, 213, 225, 0.5),
        0 0 60px rgba(250, 204, 21, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    /* Aurora gradient strip at top of welcome card */
    .welcome-card::before {
      content: '';
      display: block;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6);
      background-size: 300% 100%;
      animation: headerGlowShift 5s linear infinite;
      flex-shrink: 0;
      margin-bottom: 36px;
    }

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border-radius: 999px;
      background: #fdf2f8;
      border: 2px solid #fbcfe8;
      color: #db2777;
      font-size: 1rem;
      font-weight: 800;
      margin-bottom: 18px;
    }

    .welcome-title {
      font-family: var(--font-display);
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #0284c7 0%, #8b5cf6 50%, #f43f5e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .welcome-subtitle {
      color: var(--text-muted);
      font-size: 1.2rem;
      max-width: 620px;
      margin-bottom: 30px;
      line-height: 1.55;
    }

    .avatar-selection-box {
      width: 100%;
      max-width: 560px;
      margin-bottom: 30px;
    }

    .avatar-label {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--sky-blue);
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .avatar-tile {
      background: #ffffff;
      border: 3px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: 18px 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      box-shadow: 0 5px 0 #cbd5e1;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .avatar-tile .emoji {
      font-size: 2.8rem;
      transition: transform 0.2s ease;
    }

    .avatar-tile .name {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--text-muted);
    }

    .avatar-tile:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 0 #cbd5e1;
      border-color: #38bdf8;
    }

    .avatar-tile.selected {
      background: #f0f9ff;
      border-color: #0284c7;
      box-shadow: 0 6px 0 #0369a1, 0 10px 20px rgba(2, 132, 199, 0.2);
      transform: translateY(-4px) scale(1.05);
    }

    .avatar-tile.selected .emoji {
      transform: scale(1.2);
    }

    .avatar-tile.selected .name {
      color: #0284c7;
    }

    .name-input-box {
      width: 100%;
      max-width: 440px;
      margin-bottom: 30px;
    }

    .name-input {
      width: 100%;
      padding: 16px 22px;
      border-radius: var(--radius-md);
      background: #ffffff;
      border: 3px solid #cbd5e1;
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 1.25rem;
      text-align: center;
      font-weight: 700;
      box-shadow: 0 5px 0 #e2e8f0 inset;
      outline: none;
      transition: all 0.2s ease;
    }

    .name-input:focus {
      border-color: var(--sky-blue);
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.25);
    }

    /* ========================================================
       SCREEN 2: MISSION CONTROL / SECTOR MAP
       ======================================================== */
    .map-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .map-title {
      font-family: var(--font-display);
      font-size: 2.4rem;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), 0 0 30px rgba(139, 92, 246, 0.3);
      margin-bottom: 6px;
    }

    .map-subtitle {
      color: #f8fafc;
      font-size: 1.1rem;
      font-weight: 700;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    .sector-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .sector-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 2px solid var(--glass-border);
      border-radius: var(--radius-xl);
      padding: 22px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 14px 34px rgba(0,0,0,0.12), 0 5px 0 rgba(203, 213, 225, 0.5), inset 0 1px 0 rgba(255,255,255,0.8);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .sector-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 7px;
      border-radius: 0 4px 4px 0;
    }
    /* Unique sector color accents */
    .sector-card:nth-child(1)::before { background: linear-gradient(180deg, #3b82f6, #60a5fa); }
    .sector-card:nth-child(2)::before { background: linear-gradient(180deg, #10b981, #34d399); }
    .sector-card:nth-child(3)::before { background: linear-gradient(180deg, #f59e0b, #fbbf24); }
    .sector-card:nth-child(4)::before { background: linear-gradient(180deg, #8b5cf6, #a78bfa); }
    .sector-card:nth-child(5)::before { background: linear-gradient(180deg, #f43f5e, #fb7185); }

    .sector-card:not(.locked) {
      animation: sectorFloat 4.2s ease-in-out infinite;
    }
    .sector-card:nth-child(1) { animation-delay: 0s; }
    .sector-card:nth-child(2) { animation-delay: 0.8s; }
    .sector-card:nth-child(3) { animation-delay: 1.6s; }
    .sector-card:nth-child(4) { animation-delay: 2.4s; }
    .sector-card:nth-child(5) { animation-delay: 3.2s; }
    @keyframes sectorFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .sector-card:nth-child(1):hover:not(.locked) { border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 18px 36px rgba(59, 130, 246, 0.15), 0 7px 0 rgba(203,213,225,0.5); }
    .sector-card:nth-child(2):hover:not(.locked) { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 18px 36px rgba(16, 185, 129, 0.15), 0 7px 0 rgba(203,213,225,0.5); }
    .sector-card:nth-child(3):hover:not(.locked) { border-color: rgba(245, 158, 11, 0.5); box-shadow: 0 18px 36px rgba(245, 158, 11, 0.15), 0 7px 0 rgba(203,213,225,0.5); }
    .sector-card:nth-child(4):hover:not(.locked) { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 18px 36px rgba(139, 92, 246, 0.15), 0 7px 0 rgba(203,213,225,0.5); }
    .sector-card:nth-child(5):hover:not(.locked) { border-color: rgba(244, 63, 94, 0.5); box-shadow: 0 18px 36px rgba(244, 63, 94, 0.15), 0 7px 0 rgba(203,213,225,0.5); }
    .sector-card:hover:not(.locked) {
      transform: translateY(-6px) scale(1.012);
    }

    .sector-card.locked {
      opacity: 0.55;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }

    .sector-card.locked::before {
      background: #94a3b8 !important;
    }

    .sector-card.completed::before {
      background: linear-gradient(180deg, #10b981, #06d6a0) !important;
    }

    .sector-main-info {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .sector-icon-box {
      width: 66px;
      height: 66px;
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.3rem;
      flex-shrink: 0;
      transition: background 0.2s ease;
    }
    /* Sector icon box color-matched backgrounds */
    .sector-card:nth-child(1) .sector-icon-box { background: rgba(59, 130, 246, 0.08); border: 2px solid rgba(59, 130, 246, 0.2); box-shadow: 0 4px 0 rgba(59, 130, 246, 0.12); }
    .sector-card:nth-child(2) .sector-icon-box { background: rgba(16, 185, 129, 0.08); border: 2px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 0 rgba(16, 185, 129, 0.12); }
    .sector-card:nth-child(3) .sector-icon-box { background: rgba(245, 158, 11, 0.08); border: 2px solid rgba(245, 158, 11, 0.2); box-shadow: 0 4px 0 rgba(245, 158, 11, 0.12); }
    .sector-card:nth-child(4) .sector-icon-box { background: rgba(139, 92, 246, 0.08); border: 2px solid rgba(139, 92, 246, 0.2); box-shadow: 0 4px 0 rgba(139, 92, 246, 0.12); }
    .sector-card:nth-child(5) .sector-icon-box { background: rgba(244, 63, 94, 0.08); border: 2px solid rgba(244, 63, 94, 0.2); box-shadow: 0 4px 0 rgba(244, 63, 94, 0.12); }

    .sector-text-box h3 {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .sector-text-box p {
      font-size: 0.98rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .sector-stars-box {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 1.5rem;
    }

    .star-icon {
      color: #e2e8f0;
      transition: color 0.3s ease;
    }

    .star-icon.filled {
      color: #f59e0b;
      filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4));
    }

    .sector-badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
      background: #fef3c7;
      border: 2px solid #fde68a;
      color: #92400e;
      margin-top: 6px;
    }

    .map-bottom-actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* ========================================================
       SCREEN 4: SECTOR DEBRIEF / SUMMARY
       ======================================================== */
    .debrief-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 2px solid rgba(250, 204, 21, 0.4);
      border-radius: var(--radius-xl);
      padding: 0 32px 40px;
      text-align: center;
      margin: auto 0;
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.12),
        0 6px 0 rgba(203, 213, 225, 0.5),
        0 0 40px rgba(250, 204, 21, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
    }
    /* Aurora strip on debrief card */
    .debrief-card::before {
      content: '';
      display: block;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #f59e0b);
      background-size: 250% 100%;
      animation: headerGlowShift 4s linear infinite;
      flex-shrink: 0;
      margin-bottom: 34px;
    }

    .debrief-title {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .stars-celebration {
      font-size: 3.6rem;
      margin: 16px 0 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .debrief-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      width: 100%;
      max-width: 540px;
      margin-bottom: 30px;
    }

    .debrief-stat-box {
      background: rgba(255, 255, 255, 0.75);
      border: 2px solid rgba(226, 232, 240, 0.6);
      border-radius: var(--radius-lg);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 0 rgba(203, 213, 225, 0.4);
      backdrop-filter: blur(8px);
      transition: transform 0.2s ease;
    }
    .debrief-stat-box:hover {
      transform: translateY(-3px);
    }

    .debrief-stat-box .num {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 900;
      color: #0284c7;
    }

    .debrief-stat-box .label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .unlocked-badge-alert {
      display: none;
      align-items: center;
      gap: 12px;
      background: #fdf4ff;
      border: 2px solid #f5d0fe;
      padding: 14px 22px;
      border-radius: var(--radius-md);
      margin-bottom: 26px;
      color: #86198f;
      font-size: 1.1rem;
      box-shadow: 0 4px 0 #f5d0fe;
    }

    .debrief-buttons {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* ========================================================
       MODALS (CERTIFICATE, BADGES, SETTINGS, REVIEW)
       ======================================================== */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(12px) saturate(1.2);
      -webkit-backdrop-filter: blur(12px) saturate(1.2);
      z-index: 2000;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-box {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
      border: 2px solid transparent;
      border-image: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(56, 189, 248, 0.3), rgba(236, 72, 153, 0.2)) 1;
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.35), 0 0 40px rgba(139, 92, 246, 0.05);
      position: relative;
    }
    /* border-image doesn't work with border-radius, so use outline trick */
    .modal-box {
      border-image: none;
      border: 2px solid rgba(139, 92, 246, 0.2);
      outline: 1px solid rgba(56, 189, 248, 0.1);
      outline-offset: 2px;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #f1f5f9;
      border: 2px solid #cbd5e1;
      color: #475569;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      transition: all 0.15s ease;
    }

    .modal-close-btn:hover {
      background: #e2e8f0;
      transform: scale(1.1);
    }

    /* Certificate Styling (Printable & Bright) */
    .certificate-container {
      background: #fffbeb;
      border: 6px double #d97706;
      border-radius: var(--radius-xl);
      padding: 40px 32px;
      text-align: center;
      position: relative;
      box-shadow: 0 10px 30px rgba(217, 119, 6, 0.15);
    }

    .cert-corner {
      position: absolute;
      width: 32px;
      height: 32px;
      border: 4px solid #d97706;
    }
    .cert-corner.top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; }
    .cert-corner.top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; }
    .cert-corner.bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; }
    .cert-corner.bottom-right { bottom: 12px; right: 12px; border-left: none; border-top: none; }

    .cert-banner {
      font-size: 3.4rem;
      margin-bottom: 8px;
    }

    .cert-header {
      font-family: var(--font-display);
      font-size: 1.15rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #b45309;
      font-weight: 900;
      margin-bottom: 6px;
    }

    .cert-title {
      font-family: var(--font-display);
      font-size: 2.4rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .cert-subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-bottom: 16px;
    }

    .cert-name {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 900;
      color: #0284c7;
      border-bottom: 3px dashed #38bdf8;
      display: inline-block;
      padding: 0 24px 6px;
      margin-bottom: 20px;
    }

    .cert-desc {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #334155;
      max-width: 500px;
      margin: 0 auto 26px;
    }

    .cert-footer {
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 2px solid #fed7aa;
      padding-top: 20px;
      font-size: 1rem;
      color: var(--text-muted);
    }

    .cert-sig-line {
      font-family: var(--font-display);
      font-weight: 800;
      color: #b45309;
    }

    /* Badges Drawer */
    .badge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }

    .badge-card {
      background: rgba(248, 250, 252, 0.8);
      border: 2px solid rgba(226, 232, 240, 0.6);
      border-radius: var(--radius-lg);
      padding: 18px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 0 rgba(203, 213, 225, 0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .badge-card:hover {
      transform: translateY(-3px);
    }

    .badge-card.unlocked {
      background: linear-gradient(135deg, #fef9c3, #fefce8);
      border-color: #facc15;
      box-shadow: 0 4px 0 #eab308, 0 0 16px rgba(250, 204, 21, 0.15);
    }

    .badge-card.locked {
      opacity: 0.45;
      filter: grayscale(1);
    }

    .badge-card .badge-icon {
      font-size: 2.4rem;
    }

    .badge-card .badge-title {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }

    /* Custom Question Importer & Studio */
    .import-textarea {
      width: 100%;
      height: 140px;
      background: #f8fafc;
      border: 2px solid #cbd5e1;
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: monospace;
      font-size: 0.9rem;
      padding: 14px;
      margin: 12px 0;
      resize: vertical;
    }

    /* Question Studio Modal Styles */
    .studio-tabs {
      display: flex;
      gap: 10px;
      margin: 18px 0;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      flex-wrap: wrap;
    }
    .studio-tab-btn {
      background: #f8fafc;
      border: 2px solid #cbd5e1;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      color: #475569;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .studio-tab-btn:hover {
      border-color: #0284c7;
      color: #0284c7;
    }
    .studio-tab-btn.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }
    .studio-tab-content {
      display: none;
    }
    .studio-tab-content.active {
      display: block;
    }
    .studio-form-group {
      margin-bottom: 14px;
    }
    .studio-label {
      display: block;
      font-weight: 800;
      font-size: 0.9rem;
      color: #1e293b;
      margin-bottom: 6px;
    }
    .studio-input, .studio-select, .studio-textarea {
      width: 100%;
      padding: 11px 14px;
      border-radius: var(--radius-md);
      border: 2px solid #cbd5e1;
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: #0f172a;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .studio-input:focus, .studio-select:focus, .studio-textarea:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }
    .studio-option-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-md);
    }
    .studio-option-radio {
      accent-color: #16a34a;
      width: 22px;
      height: 22px;
      cursor: pointer;
    }
    .studio-option-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 0.9rem;
      flex-shrink: 0;
    }
    .badge-opt-a { background: #fce7f3; color: #be185d; border: 2px solid #f472b6; }
    .badge-opt-b { background: #e0f2fe; color: #0369a1; border: 2px solid #38bdf8; }
    .badge-opt-c { background: #fef3c7; color: #b45309; border: 2px solid #facc15; }
    .badge-opt-d { background: #dcfce7; color: #15803d; border: 2px solid #4ade80; }
    
    .studio-card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 52vh;
      overflow-y: auto;
      padding-right: 6px;
    }
    .studio-q-item {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 14px;
      position: relative;
    }
    .studio-q-item.is-custom {
      border-color: #38bdf8;
      background: #f0f9ff;
    }
    .studio-q-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .studio-tag {
      font-size: 0.78rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .studio-tag.custom {
      background: #dbeafe;
      color: #1d4ed8;
      border: 1px solid #93c5fd;
    }
    .studio-tag.default {
      background: #f1f5f9;
      color: #64748b;
    }
    .delete-q-btn {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #dc2626;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .delete-q-btn:hover {
      background: #ef4444;
      color: #ffffff;
    }
    .download-hero-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 3px dashed #0284c7;
      border-radius: var(--radius-lg);
      padding: 24px;
      text-align: center;
      margin-bottom: 16px;
    }

    /* Olympiad Subject Switcher Pills */
    .olympiad-selector-box {
      margin: 18px 0 16px;
      width: 100%;
    }
    .olympiad-selector-label {
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 1.05rem;
      color: #0f172a;
      margin-bottom: 10px;
      text-align: center;
    }
    .olympiad-pills-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      width: 100%;
    }
    .olympiad-pill-btn {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      border: 2.5px solid rgba(203, 213, 225, 0.6);
      border-radius: var(--radius-lg);
      padding: 12px 20px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.95rem;
      color: #475569;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 0 rgba(203, 213, 225, 0.5);
    }
    .olympiad-pill-btn:hover {
      border-color: #0284c7;
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #cbd5e1;
    }
    .olympiad-pill-btn.active {
      transform: translateY(-2px);
    }
    .olympiad-pill-btn.active[data-subject="igko"] {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-color: #0284c7;
      color: #0369a1;
      box-shadow: 0 4px 0 #0284c7;
    }
    .olympiad-pill-btn.active[data-subject="iso"] {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
      color: #15803d;
      box-shadow: 0 4px 0 #16a34a;
    }
    .olympiad-pill-btn.active[data-subject="ieo"] {
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
      border-color: #9333ea;
      color: #7e22ce;
      box-shadow: 0 4px 0 #9333ea;
    }
    .pill-count {
      font-size: 0.78rem;
      background: rgba(0, 0, 0, 0.08);
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 900;
    }

    /* Read-Aloud Voice Button (TTS) */
    .btn-read-aloud {
      background: #f0fdf4;
      border: 2px solid #86efac;
      color: #15803d;
      padding: 6px 14px;
      border-radius: 50px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      box-shadow: 0 2px 0 #86efac;
    }
    .btn-read-aloud:hover {
      background: #dcfce7;
      transform: scale(1.05);
    }
    .btn-read-aloud.speaking {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
      animation: pulseGlow 1.1s infinite alternate;
    }
    @keyframes pulseGlow {
      from { box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
      to { box-shadow: 0 0 14px rgba(239, 68, 68, 0.8); }
    }

    /* Mascot Companion Widget (Sparky the Astro-Bot) - Mobile Optimized */
    .mascot-companion-widget {
      position: fixed;
      bottom: 20px;
      right: 22px;
      z-index: 85;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      pointer-events: auto;
      animation: mascotHoverBob 3.4s ease-in-out infinite;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    .mascot-companion-widget.hidden {
      display: none !important;
    }
    @keyframes mascotHoverBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .mascot-speech-bubble {
      background: #ffffff;
      border: 3px solid #38bdf8;
      border-radius: 18px 18px 4px 18px;
      padding: 10px 30px 10px 14px;
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 0.88rem;
      color: #0f172a;
      max-width: 250px;
      box-shadow: 0 8px 24px rgba(2, 132, 199, 0.28);
      margin-bottom: 8px;
      position: relative;
      animation: bounceIn 0.3s ease-out;
      line-height: 1.4;
      transition: opacity 0.25s ease, transform 0.25s ease;
      cursor: pointer;
    }
    .mascot-bubble-close {
      position: absolute;
      top: 5px;
      right: 7px;
      background: rgba(2, 132, 199, 0.12);
      border: none;
      color: #0284c7;
      font-size: 0.72rem;
      font-weight: 900;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      transition: background 0.15s, color 0.15s;
    }
    .mascot-bubble-close:hover {
      background: #0284c7;
      color: #ffffff;
    }
    .mascot-speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -10px;
      right: 22px;
      border-width: 10px 10px 0 0;
      border-style: solid;
      border-color: #38bdf8 transparent transparent transparent;
      display: block;
      width: 0;
    }
    .mascot-avatar-container {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .mascot-avatar-btn {
      background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
      border: 3px solid #ffffff;
      border-radius: 50px;
      padding: 6px 14px 6px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    .mascot-avatar-btn::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 18px;
      width: 7px;
      height: 7px;
      background: #38bdf8;
      border-radius: 50%;
      box-shadow: 0 0 8px #38bdf8;
      animation: antennaPulse 1.8s infinite;
    }
    @keyframes antennaPulse {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.6); opacity: 1; box-shadow: 0 0 12px #38bdf8, 0 0 4px #fff; }
    }
    .mascot-avatar-btn:hover {
      transform: scale(1.08) rotate(-3deg);
      box-shadow: 0 8px 24px rgba(2, 132, 199, 0.55);
    }
    .mascot-avatar-btn:active {
      transform: scale(0.95);
    }
    .mascot-emoji {
      font-size: 1.65rem;
      display: inline-block;
      animation: robotBlink 4s infinite;
    }
    @keyframes robotBlink {
      0%, 94%, 98%, 100% { transform: scale(1); }
      96% { transform: scaleY(0.15); }
    }
    .mascot-badge-name {
      font-family: var(--font-display);
      font-weight: 900;
      color: #ffffff;
      font-size: 0.92rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    .mascot-hide-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      color: #ffffff;
      border: 2px solid #ffffff;
      border-radius: 50%;
      font-size: 0.65rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      opacity: 0.75;
      transition: opacity 0.2s, transform 0.2s;
      padding: 0;
      line-height: 1;
      z-index: 2;
    }
    .mascot-hide-btn:hover {
      opacity: 1;
      transform: scale(1.15);
    }

    /* Mobile Responsive Sparky: Compact, unobtrusive & non-hindering */
    @media (max-width: 768px) {
      .mascot-companion-widget {
        bottom: 12px;
        right: 12px;
        z-index: 70;
      }
      .mascot-avatar-btn {
        padding: 6px;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        justify-content: center;
        gap: 0;
      }
      .mascot-badge-name {
        display: none !important; /* On mobile screens, only show the 44px round icon */
      }
      .mascot-emoji {
        font-size: 1.4rem !important;
      }
      .mascot-avatar-btn::before {
        left: 17px;
        top: -2px;
      }
      .mascot-speech-bubble {
        max-width: min(220px, calc(100vw - 32px));
        font-size: 0.8rem;
        padding: 7px 26px 7px 9px;
        border-width: 2px;
        margin-bottom: 6px;
      }
      .mascot-speech-bubble::after {
        right: 14px;
        border-width: 8px 8px 0 0;
        bottom: -8px;
      }
    }

    /* Reduced Motion / Low Animation Performance Override */
    body.reduced-motion .bg-cosmic-artwork,
    body.reduced-motion .sector-card,
    body.reduced-motion .mascot-companion-widget,
    body.reduced-motion .side-orb-btn,
    body.reduced-motion .streak-pill.blazing-streak {
      animation: none !important;
      transform: none !important;
    }
    body.reduced-motion #cosmic-stars-canvas {
      display: none !important;
    }

    /* Print styles for certificate */
    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      #space-canvas, #confetti-canvas, .bg-overlay, header.cosmic-header, .sub-hud-capsule, .powers-side-card, .modal-close-btn, .print-hide {
        display: none !important;
      }
      .modal-overlay {
        position: static !important;
        background: none !important;
        padding: 0 !important;
      }
      .modal-box {
        box-shadow: none !important;
        border: none !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      .certificate-container {
        background: #fff !important;
        color: #000 !important;
        border: 4px solid #b45309 !important;
        box-shadow: none !important;
      }
    }

    /* ========================================================
       ALL-IN-ONE ANIMATION UPGRADE STYLES
       ======================================================== */
    /* 1. Hyperdrive Warp Flash Overlay */
    #warp-flash-overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(56, 189, 248, 0.5) 60%, transparent 100%);
      opacity: 0;
      pointer-events: none;
      z-index: 105;
      transition: opacity 0.2s ease-out;
    }
    #warp-flash-overlay.active {
      opacity: 1;
    }

    /* 2. Frost Screen Vignette Overlay & Floating Snowflakes */
    #frost-vignette-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10001;
      opacity: 0;
      transition: opacity 0.45s ease;
      box-shadow: inset 0 0 75px rgba(56, 189, 248, 0.6), inset 0 0 160px rgba(14, 165, 233, 0.35);
      background: radial-gradient(circle at center, transparent 65%, rgba(186, 230, 253, 0.25) 100%);
    }
    #frost-vignette-overlay.active {
      opacity: 1;
    }
    .frost-snowflake {
      position: absolute;
      font-size: 1.6rem;
      color: #bae6fd;
      text-shadow: 0 0 8px rgba(56, 189, 248, 0.9);
      animation: snowflakeDrift 6.5s infinite linear;
      opacity: 0.85;
      pointer-events: none;
    }
    @keyframes snowflakeDrift {
      0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
      20% { opacity: 0.95; }
      85% { opacity: 0.95; }
      100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
    }

    /* 3. 50:50 Laser Beam Slice & Smoke Poof */
    .option-btn {
      position: relative;
      overflow: hidden;
    }
    .laser-slice-fx {
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 5px;
      background: linear-gradient(90deg, transparent, #ef4444, #f43f5e, #ffffff, #f43f5e, #ef4444, transparent);
      box-shadow: 0 0 14px #ef4444, 0 0 28px #f43f5e;
      transform: scaleX(0);
      transform-origin: left;
      animation: laserSliceAnim 0.35s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
      z-index: 20;
      pointer-events: none;
    }
    @keyframes laserSliceAnim {
      0% { transform: scaleX(0); opacity: 1; }
      70% { transform: scaleX(1); opacity: 1; }
      100% { transform: scaleX(1); opacity: 0; }
    }
    .smoke-poof-fx {
      position: absolute;
      font-size: 1.9rem;
      top: 50%;
      right: 18px;
      transform: translateY(-50%) scale(0.4);
      animation: smokePoofAnim 0.5s ease-out forwards;
      pointer-events: none;
      z-index: 21;
    }
    @keyframes smokePoofAnim {
      0% { transform: translateY(-50%) scale(0.3); opacity: 0; }
      35% { transform: translateY(-50%) scale(1.4); opacity: 1; }
      100% { transform: translateY(-75%) scale(1.7); opacity: 0; }
    }

    /* 4. Cadet Avatar Companion Widget & Reactive Emotes */
    .pilot-avatar-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      border: 2px solid #facc15;
      border-radius: 50px;
      padding: 3px 10px 3px 6px;
      font-weight: 800;
      font-size: 0.85rem;
      color: #1e293b;
      box-shadow: 0 3px 10px rgba(250, 204, 21, 0.35);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .pilot-avatar-emoji {
      font-size: 1.35rem;
      display: inline-block;
      transition: transform 0.3s ease;
    }
    .pilot-avatar-badge.victory-bounce .pilot-avatar-emoji {
      animation: avatarVictorySpin 0.75s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes avatarVictorySpin {
      0% { transform: scale(1) rotate(0deg); }
      35% { transform: scale(1.7) translateY(-14px) rotate(-15deg); }
      70% { transform: scale(1.4) translateY(-8px) rotate(375deg); }
      100% { transform: scale(1) translateY(0) rotate(360deg); }
    }
    .pilot-avatar-badge.sad-wobble .pilot-avatar-emoji {
      animation: avatarSadWobble 0.65s ease;
    }
    @keyframes avatarSadWobble {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-16deg) scale(0.92); }
      50% { transform: rotate(16deg) scale(0.92); }
      75% { transform: rotate(-8deg); }
    }
    .pilot-avatar-badge.blazing-pilot {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-color: #f97316;
      box-shadow: 0 0 16px rgba(249, 115, 22, 0.65), 0 0 6px #facc15;
      animation: pilotFireGlow 1.2s infinite alternate;
    }
    @keyframes pilotFireGlow {
      from { box-shadow: 0 0 8px rgba(249, 115, 22, 0.5); }
      to { box-shadow: 0 0 22px rgba(249, 115, 22, 0.9), 0 0 6px #facc15; }
    }

    /* 5. Flying Star HUD Impact Pop */
    .hud-badge-pop {
      animation: hudBadgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    @keyframes hudBadgePop {
      0% { transform: scale(1); }
      50% { transform: scale(1.32) rotate(3deg); filter: drop-shadow(0 0 14px #facc15); }
      100% { transform: scale(1); }
    }

    /* 6. Smooth 3D Question Card Slide Transitions */
    .question-card {
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease;
      transform-style: preserve-3d;
    }
    .question-card.slide-out-left {
      transform: translateX(-48px) scale(0.96) rotateY(-6deg);
      opacity: 0;
    }
    .question-card.slide-in-right {
      animation: cardSlideInSpring 0.38s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
    }
    @keyframes cardSlideInSpring {
      0% { transform: translateX(54px) scale(0.96) rotateY(6deg); opacity: 0; }
      100% { transform: translateX(0) scale(1) rotateY(0deg); opacity: 1; }
    }

    /* 7. 3D Star Slam Victory Ceremony */
    .star-slam-item {
      font-size: 3.4rem;
      display: inline-block;
      opacity: 0;
      transform: scale(3.5) translateY(-80px) rotate(-30deg);
      transition: all 0.3s ease;
    }
    .star-slam-item.slam-active {
      animation: starSlamImpact 0.48s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes starSlamImpact {
      0% { opacity: 0; transform: scale(3.5) translateY(-80px) rotate(-30deg); }
      65% { opacity: 1; transform: scale(0.85) translateY(4px) rotate(4deg); }
      100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); filter: drop-shadow(0 4px 16px rgba(250, 204, 21, 0.85)); }
    }
    .screen-shake {
      animation: screenShakeImpact 0.25s ease;
    }
    @keyframes screenShakeImpact {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(-5px, 5px); }
      40% { transform: translate(5px, -4px); }
      60% { transform: translate(-4px, -3px); }
      80% { transform: translate(3px, 3px); }
    }

    /* ========================================================
       2D ADVENTURE PLATFORMER MODE (Phaser 3 + Three.js)
       ======================================================== */
    #screen-adventure {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .adventure-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
    .adventure-hud {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 960px;
      background: rgba(15, 23, 42, 0.86);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 2px solid rgba(129, 140, 248, 0.45);
      border-radius: 20px;
      padding: 10px 18px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      flex-wrap: wrap;
      gap: 10px;
      box-sizing: border-box;
    }
    .adv-hud-left, .adv-hud-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .adv-hud-btn {
      background: linear-gradient(135deg, #334155, #1e293b);
      color: #f8fafc;
      border: 1.5px solid #64748b;
      border-radius: 12px;
      padding: 6px 14px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Nunito', var(--font-body);
      transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .adv-hud-btn:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, #475569, #334155);
      border-color: #94a3b8;
    }
    .adv-hud-icon-btn {
      background: linear-gradient(135deg, #334155, #1e293b);
      color: #f8fafc;
      border: 1.5px solid rgba(148, 163, 184, 0.4);
      border-radius: 12px;
      padding: 6px 10px;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      min-width: 38px;
      min-height: 34px;
    }
    .adv-hud-icon-btn:hover {
      background: linear-gradient(135deg, #475569, #334155);
      border-color: #38bdf8;
      transform: translateY(-2px);
    }
    .adv-hud-icon-btn:active {
      transform: scale(0.94);
    }
    .adv-mobile-only {
      display: none !important;
    }
    .adv-energy-meter {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.45);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .adv-bar-track {
      width: 90px;
      height: 12px;
      background: #334155;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .adv-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #06b6d4);
      border-radius: 8px;
      transition: width 0.3s ease;
    }
    .adv-stat-val {
      font-size: 0.85rem;
      font-weight: 800;
      color: #38bdf8;
      min-width: 38px;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-title-badge {
      font-family: 'Fredoka', var(--font-display);
      font-weight: 800;
      font-size: 1.1rem;
      background: linear-gradient(135deg, #facc15, #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.5px;
    }
    .adv-stat-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      color: #f8fafc;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-stat-pill.gold {
      border-color: rgba(250, 204, 21, 0.5);
      color: #fde047;
    }

    /* Mobile-compact HUD Overrides */
    @media (max-width: 768px), (max-height: 520px) {
      .adv-desktop-only {
        display: none !important;
      }
      .adv-mobile-only {
        display: inline-flex !important;
      }
      .adventure-hud {
        padding: max(6px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) 6px max(10px, env(safe-area-inset-left));
        gap: 6px;
        border-radius: 16px;
        margin-bottom: 6px;
      }
      .adv-hud-left, .adv-hud-right {
        gap: 6px;
      }
      .adv-energy-meter {
        padding: 3px 8px;
        border-radius: 10px;
      }
      .adv-bar-track {
        width: 60px;
        height: 10px;
      }
      .adv-stat-val {
        font-size: 0.78rem;
        min-width: 32px;
      }
      .adv-stat-pill {
        padding: 3px 8px;
        font-size: 0.8rem;
        border-radius: 10px;
      }
    }

    /* Mobile Secondary Menu Drawer Modal */
    .adv-mobile-menu-drawer {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.84);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeInDown 0.25s ease;
    }
    .adv-menu-card {
      background: linear-gradient(145deg, #090d16, #111827, #1e1b4b);
      border: 2px solid rgba(56, 189, 248, 0.45);
      border-radius: 22px;
      padding: 20px;
      max-width: 320px;
      width: 100%;
      box-shadow: 0 16px 48px rgba(0,0,0,0.85), 0 0 24px rgba(56, 189, 248, 0.25);
      color: #f8fafc;
      box-sizing: border-box;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding-bottom: 10px;
    }
    .adv-menu-title {
      font-family: 'Fredoka', var(--font-display);
      font-weight: 800;
      font-size: 1.1rem;
      color: #38bdf8;
    }
    .adv-menu-close-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #cbd5e1;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }
    .adv-menu-close-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .adv-menu-stat-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 8px 12px;
      margin-bottom: 14px;
      font-weight: 800;
      font-size: 0.92rem;
      color: #fde047;
    }
    .adv-menu-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .adv-menu-btn {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1.5px solid rgba(148, 163, 184, 0.3);
      border-radius: 14px;
      padding: 11px 16px;
      color: #f8fafc;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-menu-btn:hover {
      border-color: #38bdf8;
      background: linear-gradient(135deg, #334155, #1e293b);
      transform: translateY(-2px);
    }
    .adv-menu-btn.adv-menu-exit {
      border-color: rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }
    .adv-menu-btn.adv-menu-exit:hover {
      border-color: #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), #0f172a);
    }

    .adventure-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #090d16;
    }
    .adventure-three-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }
    .adventure-phaser-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }
    .adventure-phaser-layer canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Controls / Help Toast Banner: Compact, Auto-dismissible & Toggleable */
    .adventure-hint-toast {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid rgba(250, 204, 21, 0.65);
      color: #fef08a;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.84rem;
      font-weight: 700;
      z-index: 20;
      box-shadow: 0 4px 18px rgba(0,0,0,0.5);
      animation: fadeInDown 0.3s ease;
      text-align: center;
      max-width: 90%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s ease;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-toast-text {
      flex: 1;
    }
    .adv-toast-close {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #fef08a;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.75rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }
    .adv-toast-close:hover {
      background: rgba(255, 255, 255, 0.35);
    }
    .adventure-hint-toast.toast-hidden {
      opacity: 0;
      visibility: hidden;
      transform: translateX(-50%) translateY(-12px);
      pointer-events: none;
    }

    /* Touch Controls: Clean Translucent Frosted Glass, High Usability */
    .adv-touch-controls {
      display: none;
      position: absolute;
      bottom: max(10px, env(safe-area-inset-bottom));
      left: 0;
      right: 0;
      padding: 0 max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
      justify-content: space-between;
      align-items: flex-end;
      z-index: 25;
      pointer-events: none;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
    @media (hover: none) and (pointer: coarse), (max-width: 900px) {
      .adv-touch-controls {
        display: flex;
      }
    }
    .adv-dpad, .adv-actions {
      display: flex;
      gap: 14px;
      pointer-events: auto;
      align-items: center;
      touch-action: none;
    }
    .adv-touch-btn {
      width: 66px;
      height: 66px;
      min-width: 66px;
      min-height: 66px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.62);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 2px solid rgba(56, 189, 248, 0.38);
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
      -webkit-touch-callout: none;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.45);
      transition: transform 0.05s ease, background 0.05s ease, border-color 0.05s ease, box-shadow 0.05s ease, opacity 0.15s ease;
      cursor: pointer;
      opacity: 0.48;
      -webkit-tap-highlight-color: transparent;
    }
    .adv-touch-btn:active, .adv-touch-btn.touch-active {
      opacity: 1;
      transform: scale(0.92);
      background: rgba(56, 189, 248, 0.9);
      border-color: #ffffff;
      box-shadow: 0 0 32px rgba(56, 189, 248, 0.95);
    }
    .adv-jump-btn {
      width: 74px;
      height: 74px;
      min-width: 74px;
      min-height: 74px;
      font-size: 1.75rem;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.7), rgba(234, 88, 12, 0.7));
      border-color: rgba(253, 224, 71, 0.6);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(245, 158, 11, 0.3);
      opacity: 0.55;
    }
    .adv-jump-btn:active, .adv-jump-btn.touch-active {
      opacity: 1;
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.98), rgba(245, 158, 11, 0.98));
      border-color: #ffffff;
      box-shadow: 0 0 32px rgba(250, 204, 21, 0.95);
    }
    .adv-btn-pulse {
      width: 66px;
      height: 66px;
      font-size: 1.45rem;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.55), rgba(168, 85, 247, 0.55));
      border-color: rgba(56, 189, 248, 0.5);
      opacity: 0.50;
    }
    .adv-btn-pulse:active, .adv-btn-pulse.touch-active {
      opacity: 1;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.95), rgba(168, 85, 247, 0.95));
      border-color: #ffffff;
      box-shadow: 0 0 32px rgba(56, 189, 248, 0.95);
    }
    .adv-btn-sniff {
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      font-size: 1.15rem;
      background: rgba(30, 41, 59, 0.6);
      border-color: rgba(148, 163, 184, 0.4);
      opacity: 0.75;
    }

    /* Portrait Orientation Friendly Overlay */
    .adv-rotate-prompt {
      position: absolute;
      inset: 0;
      background: rgba(3, 7, 18, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      animation: fadeInDown 0.3s ease;
    }
    .adv-rotate-card {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95));
      border: 2px solid #38bdf8;
      border-radius: 24px;
      padding: 28px 24px;
      max-width: 320px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.3);
      color: #f8fafc;
    }
    .adv-rotate-icon {
      font-size: 3.2rem;
      margin-bottom: 12px;
      animation: bounceRotate 2s infinite ease-in-out;
    }
    @keyframes bounceRotate {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(90deg) scale(1.1); }
    }
    .adv-rotate-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }
    .adv-rotate-text {
      font-size: 0.92rem;
      color: #cbd5e1;
      line-height: 1.45;
    }

    /* ========================================================
       KNOWLEDGE GATE MCQ MODAL STYLES (ENHANCED & COLOURFUL)
       ======================================================== */
    @keyframes advGatePopIn {
      0% {
        transform: scale(0.86) translateY(24px);
        opacity: 0;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    .adv-gate-modal-card {
      display: flex;
      flex-direction: column;
      max-width: 660px;
      width: 100%;
      max-height: min(94dvh, 700px);
      background: linear-gradient(145deg, #090d16 0%, #111827 50%, #1e1b4b 100%) !important;
      border: 2px solid transparent !important;
      background-image: linear-gradient(145deg, #090d16 0%, #111827 50%, #1e1b4b 100%), linear-gradient(135deg, #38bdf8, #a855f7, #ec4899, #f59e0b) !important;
      background-origin: border-box !important;
      background-clip: padding-box, border-box !important;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(168, 85, 247, 0.35), 0 0 70px rgba(56, 189, 248, 0.25) !important;
      color: #f8fafc;
      padding: 0 !important;
      border-radius: 24px !important;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      animation: advGatePopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-gate-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: rgba(15, 23, 42, 0.96);
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
    }
    .adv-gate-badge {
      font-family: 'Fredoka', var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      background: linear-gradient(90deg, #facc15, #fb923c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 8px rgba(250, 204, 21, 0.45));
    }
    .adv-gate-timer {
      background: rgba(2, 132, 199, 0.2);
      border: 2px solid #38bdf8;
      color: #38bdf8;
      padding: 5px 14px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1.05rem;
      font-family: 'Fredoka', var(--font-display);
      transition: all 0.25s ease;
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.25);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .adv-gate-timer.urgent-pulse {
      animation: advTimerUrgentPulse 1s infinite alternate ease-in-out;
    }
    @keyframes advTimerUrgentPulse {
      0% { transform: scale(1); box-shadow: 0 0 14px rgba(244, 63, 94, 0.6); }
      100% { transform: scale(1.06); box-shadow: 0 0 24px rgba(244, 63, 94, 0.95); }
    }
    .adv-gate-timer.frozen {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(59, 130, 246, 0.35)) !important;
      border-color: #67e8f9 !important;
      color: #a5f3fc !important;
      box-shadow: 0 0 20px rgba(103, 232, 249, 0.6) !important;
      animation: frostPulse 2s infinite ease-in-out;
    }
    @keyframes frostPulse {
      0%, 100% { box-shadow: 0 0 16px rgba(103, 232, 249, 0.5); }
      50% { box-shadow: 0 0 28px rgba(103, 232, 249, 0.85); }
    }

    /* Scrollable Internal Body */
    .adv-gate-body-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      padding: 16px 20px;
    }

    /* Sticky Footer for Power-Ups Action Bar */
    .adv-gate-footer {
      flex-shrink: 0;
      padding: 10px 20px 12px;
      background: rgba(15, 23, 42, 0.96);
      border-top: 1.5px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
    }
    .adv-gate-powerups-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 8px 14px;
      margin: 0;
    }
    .adv-pu-title {
      font-size: 0.82rem;
      font-weight: 900;
      letter-spacing: 1px;
      color: #facc15;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'Fredoka', var(--font-display);
    }
    .adv-pu-buttons {
      display: flex;
      gap: 8px;
    }
    .adv-pu-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      border: 1.5px solid transparent;
      color: #ffffff;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-pu-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.04);
      filter: brightness(1.15);
    }
    .adv-pu-btn:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }
    .adv-pu-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      filter: grayscale(0.85);
    }
    .adv-pu-btn.adv-pu-hint {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-color: #fde68a;
      box-shadow: 0 3px 12px rgba(245, 158, 11, 0.4);
    }
    .adv-pu-btn.adv-pu-laser {
      background: linear-gradient(135deg, #f43f5e, #be123c);
      border-color: #fecdd3;
      box-shadow: 0 3px 12px rgba(244, 63, 94, 0.4);
    }
    .adv-pu-btn.adv-pu-freeze {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border-color: #bae6fd;
      box-shadow: 0 3px 12px rgba(2, 132, 199, 0.4);
    }
    .adv-pu-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.45);
      padding: 1px 6px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 900;
      min-width: 18px;
    }

    /* Clue / Freeze Announcement Box */
    .adv-gate-clue-box {
      background: rgba(254, 240, 138, 0.12);
      border: 2px solid #facc15;
      border-radius: 14px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: #fef08a;
      font-size: 0.92rem;
      font-weight: 700;
      line-height: 1.4;
      animation: fadeInDown 0.25s ease;
      box-shadow: 0 0 16px rgba(250, 204, 21, 0.25);
    }
    .adv-gate-clue-box.frozen-mode {
      background: rgba(6, 182, 212, 0.15);
      border-color: #38bdf8;
      color: #a5f3fc;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
    }
    .adv-gate-clue-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    /* Question Container */
    .adv-gate-question-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 16px 18px;
      margin-bottom: 16px;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .adv-gate-topic {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ede9fe;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
      margin-bottom: 8px;
      font-family: 'Nunito', var(--font-body);
    }
    .adv-gate-question-text {
      font-family: 'Nunito', var(--font-body);
      font-size: 1.18rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.45;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    /* Options Grid: 2-column desktop, 1-column mobile */
    .adv-gate-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .adv-gate-option-btn {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      padding: 14px 16px;
      min-height: 52px;
      color: #f8fafc;
      font-family: 'Nunito', var(--font-body);
      font-size: 0.98rem;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 12px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.06);
      box-sizing: border-box;
    }

    /* OPTION A: Radiant Cyan / Blue */
    .adv-gate-option-btn.opt-a {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.22), rgba(14, 165, 233, 0.08));
      border-color: rgba(56, 189, 248, 0.5);
      color: #f0f9ff;
    }
    .adv-gate-option-btn.opt-a .adv-opt-badge {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
    }
    .adv-gate-option-btn.opt-a:hover:not(:disabled) {
      border-color: #38bdf8;
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.42), rgba(14, 165, 233, 0.2));
      box-shadow: 0 6px 20px rgba(56, 189, 248, 0.35);
      transform: translateY(-2px);
    }

    /* OPTION B: Emerald / Mint Green */
    .adv-gate-option-btn.opt-b {
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.22), rgba(16, 185, 129, 0.08));
      border-color: rgba(52, 211, 153, 0.5);
      color: #f0fdf4;
    }
    .adv-gate-option-btn.opt-b .adv-opt-badge {
      background: linear-gradient(135deg, #059669, #34d399);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
    }
    .adv-gate-option-btn.opt-b:hover:not(:disabled) {
      border-color: #34d399;
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.42), rgba(16, 185, 129, 0.2));
      box-shadow: 0 6px 20px rgba(52, 211, 153, 0.35);
      transform: translateY(-2px);
    }

    /* OPTION C: Royal Purple / Violet */
    .adv-gate-option-btn.opt-c {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.22), rgba(168, 85, 247, 0.08));
      border-color: rgba(192, 132, 252, 0.5);
      color: #faf5ff;
    }
    .adv-gate-option-btn.opt-c .adv-opt-badge {
      background: linear-gradient(135deg, #7c3aed, #c084fc);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(192, 132, 252, 0.6);
    }
    .adv-gate-option-btn.opt-c:hover:not(:disabled) {
      border-color: #c084fc;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.42), rgba(168, 85, 247, 0.2));
      box-shadow: 0 6px 20px rgba(192, 132, 252, 0.35);
      transform: translateY(-2px);
    }

    /* OPTION D: User-Requested Baby Pink */
    .adv-gate-option-btn.opt-d {
      background: linear-gradient(135deg, rgba(244, 114, 182, 0.24), rgba(251, 207, 232, 0.12));
      border-color: #f472b6;
      color: #fdf2f8;
    }
    .adv-gate-option-btn.opt-d .adv-opt-badge {
      background: linear-gradient(135deg, #ec4899, #f472b6);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(244, 114, 182, 0.6);
    }
    .adv-gate-option-btn.opt-d:hover:not(:disabled) {
      border-color: #fbcfe8;
      background: linear-gradient(135deg, rgba(244, 114, 182, 0.45), rgba(251, 207, 232, 0.24));
      box-shadow: 0 6px 20px rgba(244, 114, 182, 0.45);
      transform: translateY(-2px);
    }

    .adv-opt-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: 900;
      font-size: 0.92rem;
      font-family: 'Fredoka', var(--font-display);
      flex-shrink: 0;
    }

    .adv-gate-option-btn.correct {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(5, 150, 105, 0.6)) !important;
      border-color: #34d399 !important;
      color: #ffffff !important;
      box-shadow: 0 0 25px rgba(52, 211, 153, 0.8) !important;
    }
    .adv-gate-option-btn.wrong {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(185, 28, 28, 0.6)) !important;
      border-color: #f87171 !important;
      color: #ffffff !important;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.8) !important;
    }
    .adv-gate-option-btn.dimmed {
      opacity: 0.3 !important;
      filter: grayscale(0.85) !important;
      pointer-events: none !important;
      text-decoration: line-through !important;
      transform: scale(0.96) !important;
    }
    /* Stage Container */
    .adv-gate-stage {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    /* Stage 2: Verdict & Explanation Styles */
    .adv-verdict-pill {
      font-family: 'Fredoka', var(--font-display);
      font-weight: 800;
      font-size: 0.88rem;
      padding: 4px 12px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .verdict-pill-correct {
      background: rgba(16, 185, 129, 0.25);
      border: 1.5px solid #34d399;
      color: #6ee7b7;
      box-shadow: 0 0 12px rgba(52, 211, 153, 0.35);
    }
    .verdict-pill-wrong {
      background: rgba(245, 158, 11, 0.25);
      border: 1.5px solid #f59e0b;
      color: #fde68a;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
    }

    .adv-verdict-banner {
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 12px;
      text-align: center;
      animation: fadeInDown 0.3s ease;
    }
    .adv-verdict-banner.banner-correct {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.35));
      border: 2px solid #34d399;
      box-shadow: 0 0 24px rgba(52, 211, 153, 0.3);
    }
    .adv-verdict-banner.banner-wrong {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35));
      border: 2px solid #f87171;
      box-shadow: 0 0 24px rgba(239, 68, 68, 0.3);
    }
    .adv-verdict-title {
      font-family: 'Fredoka', var(--font-display);
      font-size: 1.25rem;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .banner-correct .adv-verdict-title {
      color: #34d399;
      text-shadow: 0 0 12px rgba(52, 211, 153, 0.6);
    }
    .banner-wrong .adv-verdict-title {
      color: #fca5a5;
      text-shadow: 0 0 12px rgba(248, 113, 113, 0.6);
    }
    .adv-verdict-sub {
      font-size: 0.96rem;
      font-weight: 700;
      color: #fef08a;
    }
    .adv-verdict-badges {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .adv-vbadge {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 3px 10px;
      font-size: 0.8rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
    }

    .adv-explanation-card {
      background: rgba(15, 23, 42, 0.9);
      border: 1.5px solid rgba(56, 189, 248, 0.4);
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 8px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    .adv-explanation-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Fredoka', var(--font-display);
      font-size: 1rem;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }
    .adv-exp-content {
      font-size: 0.94rem;
      line-height: 1.5;
      color: #e2e8f0;
      font-weight: 600;
    }
    .adv-diamond-notice {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .notice-unlocked {
      background: rgba(56, 189, 248, 0.16);
      border: 1.5px solid #38bdf8;
      color: #38bdf8;
    }
    .notice-lost {
      background: rgba(239, 68, 68, 0.16);
      border: 1.5px solid #ef4444;
      color: #f87171;
    }
    .notice-gate-cleared {
      background: rgba(16, 185, 129, 0.16);
      border: 1.5px solid #10b981;
      color: #34d399;
    }
    .notice-gate-opened {
      background: rgba(245, 158, 11, 0.16);
      border: 1.5px solid #f59e0b;
      color: #fde68a;
    }

    .adv-skip-btn {
      width: 100%;
      padding: 12px 20px;
      font-family: 'Fredoka', var(--font-display);
      font-size: 1.1rem;
      font-weight: 900;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #db2777 100%) !important;
      border: 2px solid #fde68a !important;
      box-shadow: 0 6px 24px rgba(234, 88, 12, 0.5), 0 0 16px rgba(253, 230, 138, 0.35) !important;
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      letter-spacing: 0.5px;
    }
    .adv-skip-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 10px 30px rgba(234, 88, 12, 0.7), 0 0 24px rgba(253, 230, 138, 0.5) !important;
    }
    .adv-skip-btn:active {
      transform: translateY(1px) scale(0.98);
    }

    /* Dedicated Mobile-First Question Modal Overrides (Guarantees 100% single screen fit) */
    @media (max-width: 640px), (max-height: 540px) {
      .adv-gate-modal-card {
        max-height: 96dvh;
        width: 96vw;
        border-radius: 18px !important;
      }
      .adv-gate-header {
        padding: 6px 14px;
      }
      .adv-gate-badge {
        font-size: 1rem;
      }
      .adv-gate-timer {
        font-size: 0.85rem;
        padding: 3px 8px;
      }
      .adv-gate-body-scroll {
        padding: 8px 12px;
      }
      .adv-gate-clue-box {
        padding: 6px 10px;
        margin-bottom: 6px;
        font-size: 0.82rem;
      }
      .adv-gate-question-box {
        padding: 8px 12px;
        margin-bottom: 8px;
        border-radius: 12px;
      }
      .adv-gate-topic {
        font-size: 0.68rem;
        padding: 2px 6px;
        margin-bottom: 3px;
      }
      .adv-gate-question-text {
        font-size: 0.94rem;
        line-height: 1.35;
      }
      .adv-gate-options-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 6px 8px;
      }
      .adv-gate-option-btn {
        padding: 6px 10px;
        min-height: 38px;
        font-size: 0.86rem;
        border-radius: 12px;
        gap: 6px;
      }
      .adv-opt-badge {
        width: 24px;
        height: 24px;
        font-size: 0.78rem;
      }
      .adv-gate-footer {
        padding: 6px 12px;
      }
      .adv-gate-powerups-bar {
        padding: 4px 8px;
        gap: 4px;
      }
      .adv-pu-title {
        display: none;
      }
      .adv-pu-buttons {
        width: 100%;
        justify-content: space-between;
        gap: 6px;
      }
      .adv-pu-btn {
        padding: 4px 6px;
        font-size: 0.7rem;
        gap: 4px;
        border-radius: 10px;
      }
      .adv-pu-badge {
        font-size: 0.65rem;
        padding: 1px 4px;
      }

      /* Stage 2 Mobile Adjustments */
      .adv-verdict-banner {
        padding: 8px 12px;
        margin-bottom: 6px;
      }
      .adv-verdict-title {
        font-size: 1.05rem;
        margin-bottom: 3px;
      }
      .adv-verdict-sub {
        font-size: 0.84rem;
      }
      .adv-explanation-card {
        padding: 8px 12px;
        margin-bottom: 6px;
      }
      .adv-explanation-card-header {
        font-size: 0.88rem;
        margin-bottom: 4px;
      }
      .adv-exp-content {
        font-size: 0.82rem;
        line-height: 1.35;
      }
      .adv-diamond-notice {
        margin-top: 6px;
        padding: 5px 8px;
        font-size: 0.78rem;
      }
      .adv-skip-btn {
        padding: 9px 14px;
        font-size: 0.95rem;
        border-radius: 12px;
      }
    }

    /* Start Button Enhancements */
    .btn-adventure-mode {
      background: linear-gradient(135deg, #f59e0b, #ea580c) !important;
      color: #ffffff !important;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.45) !important;
      position: relative;
      overflow: visible;
    }
    .btn-adventure-mode:hover {
      box-shadow: 0 12px 30px rgba(245, 158, 11, 0.6) !important;
      transform: translateY(-3px) scale(1.02);
    }
    .adv-launch-badge {
      position: absolute;
      top: -10px;
      right: 14px;
      background: #ec4899;
      color: white;
      font-size: 0.72rem;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 10px;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      letter-spacing: 0.5px;
      animation: pulse 1.8s infinite;
    }

    /* Fullscreen Mode & PWA Adaptations for 2D Adventure */
    @media (display-mode: standalone), (display-mode: fullscreen) {
      body {
        user-select: none;
        -webkit-user-select: none;
      }
    }

    body.adventure-mode-active .cosmic-header,
    body.adventure-mode-active #mascot-widget,
    body.adventure-mode-active .sub-hud-capsule,
    body:has(#screen-welcome.active) .cosmic-header,
    body:has(#screen-welcome.active) #mascot-widget,
    body:has(#screen-welcome.active) .sub-hud-capsule,
    body:has(#screen-adventure.active) .cosmic-header,
    body:has(#screen-adventure.active) #mascot-widget,
    body:has(#screen-adventure.active) .sub-hud-capsule,
    body:has(#screen-adventure-select.active) .cosmic-header,
    body:has(#screen-adventure-select.active) #mascot-widget,
    body:has(#screen-adventure-victory.active) .cosmic-header,
    body:has(#screen-adventure-victory.active) #mascot-widget {
      display: none !important;
    }

    body.adventure-mode-active .app-container,
    body:has(#screen-welcome.active) .app-container,
    body:has(#screen-adventure.active) .app-container,
    body:has(#screen-adventure-victory.active) .app-container {
      max-width: 100vw !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100vw !important;
      min-height: 100vh !important;
    }

    #screen-adventure.active,
    :fullscreen #screen-adventure,
    :-webkit-full-screen #screen-adventure,
    #screen-adventure.is-fullscreen {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      width: 100dvw !important;
      height: 100vh !important;
      height: 100dvh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      z-index: 50 !important;
      background: #090d16 !important;
      overflow: hidden !important;
      touch-action: none !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
    }

    #screen-adventure.active .adventure-wrapper,
    #screen-adventure.active .adventure-viewport,
    body.adventure-mode-active .adventure-wrapper,
    body.adventure-mode-active .adventure-viewport {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }

    /* Minimal Corner Overlay HUD */
    .adv-corner-hud {
      position: absolute;
      top: max(12px, env(safe-area-inset-top));
      z-index: 1000 !important;
      display: flex;
      gap: 8px;
      pointer-events: none !important;
    }
    .adv-corner-hud * {
      pointer-events: auto !important;
    }
    .adv-hud-tl {
      left: max(14px, env(safe-area-inset-left));
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
    .adv-hud-tr {
      right: max(14px, env(safe-area-inset-right));
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }
    .adv-hud-pill {
      background: rgba(15, 23, 42, 0.76);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid rgba(129, 140, 248, 0.4);
      border-radius: 9999px;
      padding: 5px 12px;
      color: #f8fafc;
      font-family: 'Fredoka', var(--font-body);
      font-weight: 700;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .adv-energy-pill {
      border-color: rgba(245, 158, 11, 0.5);
    }
    .adv-energy-pill .adv-bar-track.mini {
      width: 64px;
      height: 10px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .adv-energy-pill .adv-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #10b981 100%);
      transition: width 0.2s ease;
    }
    .adv-hud-streak-badge {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(245, 158, 11, 0.85));
      border: 1.5px solid rgba(254, 240, 138, 0.6);
      border-radius: 9999px;
      padding: 3px 10px;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.78rem;
      letter-spacing: 0.5px;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
      animation: streakPulse 1.5s infinite alternate;
    }
    @keyframes streakPulse {
      0% { transform: scale(0.96); }
      100% { transform: scale(1.04); }
    }
    .adv-hud-pause-btn {
      background: rgba(15, 23, 42, 0.76);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid rgba(148, 163, 184, 0.45);
      border-radius: 50%;
      width: 38px;
      height: 38px;
      color: #f8fafc;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    }
    .adv-hud-pause-btn:hover {
      background: rgba(30, 41, 59, 0.95);
      border-color: #38bdf8;
      transform: scale(1.08);
    }
    .adv-hud-pause-btn:active {
      transform: scale(0.92);
    }
    .adv-hud-home-btn {
      background: rgba(15, 23, 42, 0.8) !important;
      border-color: rgba(56, 189, 248, 0.45) !important;
      font-size: 1.05rem !important;
    }
    .adv-hud-home-btn:hover {
      background: rgba(30, 41, 59, 0.95) !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.5) !important;
    }

    /* Cinematic Level Start Banner & Gate Announcement */
    .adv-cinematic-title {
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 95;
      text-align: center;
      pointer-events: none;
    }
    .adv-cine-sub {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      letter-spacing: 5px;
      color: #38bdf8;
      font-weight: 800;
      text-transform: uppercase;
      text-shadow: 0 2px 12px rgba(56, 189, 248, 0.5);
    }
    .adv-cine-main {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 5.5vw, 3.4rem);
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 4px 24px rgba(56, 189, 248, 0.7), 0 0 50px rgba(99, 102, 241, 0.5);
    }
    @keyframes cinematicTitleIn {
      0% { opacity: 0; transform: translate(-50%, -40%) scale(0.85); filter: blur(6px); }
      20% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
      75% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
      100% { opacity: 0; transform: translate(-50%, -60%) scale(1.08); filter: blur(4px); }
    }

    .adv-gate-announce {
      position: absolute;
      top: max(14px, env(safe-area-inset-top));
      left: 50%;
      transform: translateX(-50%);
      z-index: 95;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 2px solid #818cf8;
      border-radius: 9999px;
      padding: 6px 20px;
      color: #f8fafc;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: clamp(0.85rem, 2vw, 1.05rem);
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(129, 140, 248, 0.4);
      pointer-events: none;
    }
    @keyframes gateAnnounceIn {
      0% { opacity: 0; transform: translate(-50%, -12px) scale(0.9); }
      15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      80% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -12px) scale(0.95); }
    }

    /* ========================================================
       GAME TITLE SCREEN (Full-Screen Animated)
       ======================================================== */
    #screen-welcome.active {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      width: 100dvw !important;
      height: 100vh !important;
      height: 100dvh !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: radial-gradient(circle at 50% 35%, #151e36 0%, #080c16 75%, #03050a 100%) !important;
      z-index: 50 !important;
    }
    .title-three-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }
    .title-cosmic-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 35%, rgba(56, 189, 248, 0.16) 0%, transparent 65%);
      z-index: 2;
      pointer-events: none;
    }
    .title-screen-container {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      max-width: 560px;
      padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
      box-sizing: border-box;
      text-align: center;
    }
    .title-branding {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .title-badge-pill {
      background: rgba(56, 189, 248, 0.15);
      border: 1.5px solid rgba(56, 189, 248, 0.4);
      border-radius: 9999px;
      padding: 3px 14px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #38bdf8;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .title-game-name {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2.4rem, 6.5vw, 3.8rem);
      font-weight: 900;
      letter-spacing: 2px;
      margin: 0;
      line-height: 1.05;
      text-transform: uppercase;
    }
    .title-word-cosmic {
      background: linear-gradient(135deg, #ffffff 30%, #93c5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 35px rgba(147, 197, 253, 0.5);
    }
    .title-word-iq {
      background: linear-gradient(135deg, #f59e0b 20%, #ef4444 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 35px rgba(245, 158, 11, 0.6);
      margin-left: 6px;
    }
    .title-tagline {
      font-family: 'Fredoka', var(--font-body);
      font-size: clamp(0.95rem, 2.5vw, 1.15rem);
      color: #94a3b8;
      letter-spacing: 1px;
      font-weight: 600;
      margin: 0;
    }
    .title-hero-showcase {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 4px 0;
    }
    .title-dog-pedestal {
      position: relative;
      width: 171px;
      height: 128px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title-dog-glow {
      position: absolute;
      bottom: 0;
      width: 150px;
      height: 36px;
      background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.45) 0%, transparent 70%);
      border-radius: 50%;
      animation: dogGlowPulse 2.5s ease-in-out infinite alternate;
    }
    .title-dog-sprite {
      width: 171px;
      height: 128px;
      background: url('assets/adventure/dog_idle.png') left center no-repeat;
      background-size: 2052px 128px;
      animation: titleDogIdle 1.1s steps(12) infinite;
    }
    @keyframes titleDogIdle {
      from { background-position: 0 0; }
      to { background-position: -2052px 0; }
    }
    .title-hero-name {
      font-family: 'Fredoka', var(--font-body);
      font-size: 0.95rem;
      font-weight: 700;
      color: #e2e8f0;
      margin-top: -6px;
    }
    .title-actions-menu {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 280px;
    }
    .title-btn {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.12rem;
      letter-spacing: 1px;
      padding: 13px 24px;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    .title-btn:hover {
      transform: translateY(-2px) scale(1.02);
      filter: brightness(1.1);
    }
    .title-btn:active {
      transform: scale(0.97);
    }
    .title-btn-new-game {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 6px 24px rgba(16, 185, 129, 0.45);
    }
    .title-btn-continue {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      box-shadow: 0 6px 24px rgba(245, 158, 11, 0.45);
    }
    .title-btn-settings {
      background: rgba(30, 41, 59, 0.85);
      border: 1.5px solid rgba(148, 163, 184, 0.35);
      color: #e2e8f0;
    }
    .title-btn-levels {
      background: rgba(30, 41, 59, 0.85);
      border: 1.5px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      font-size: 1rem;
      padding: 10px 20px;
    }
    /* Mission Topic Selector on Welcome / Title Screen */
    .title-topic-selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin: 4px 0 6px 0;
      width: 100%;
      max-width: 320px;
    }
    .title-topic-label {
      font-family: 'Outfit', sans-serif;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .title-topic-pills {
      display: flex;
      gap: 10px;
      width: 100%;
      justify-content: center;
    }
    .title-topic-pill {
      flex: 1;
      max-width: 96px;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid rgba(148, 163, 184, 0.35);
      border-radius: 14px;
      padding: 8px 6px;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.82rem;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    }
    .title-topic-pill .title-topic-icon {
      font-size: 1.28rem;
      transition: transform 0.2s ease;
    }
    .title-topic-pill:hover {
      border-color: rgba(56, 189, 248, 0.6);
      color: #ffffff;
      transform: translateY(-2px);
    }
    .title-topic-pill:hover .title-topic-icon {
      transform: scale(1.15);
    }
    .title-topic-pill.active {
      color: #ffffff;
      transform: translateY(-2px);
    }
    .title-topic-pill.active[data-subject="igko"] {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.85), rgba(14, 165, 233, 0.55));
      border-color: #38bdf8;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.5);
    }
    .title-topic-pill.active[data-subject="iso"] {
      background: linear-gradient(135deg, rgba(22, 163, 74, 0.85), rgba(34, 197, 94, 0.55));
      border-color: #4ade80;
      box-shadow: 0 0 16px rgba(74, 222, 128, 0.5);
    }
    .title-topic-pill.active[data-subject="ieo"] {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.85), rgba(168, 85, 247, 0.55));
      border-color: #c084fc;
      box-shadow: 0 0 16px rgba(192, 132, 252, 0.5);
    }
    .title-install-bar {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 9999px;
      padding: 6px 14px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 0.82rem;
      color: #e2e8f0;
      margin-top: 4px;
    }
    .title-install-btn {
      background: linear-gradient(135deg, #38bdf8, #0284c7);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 4px 12px;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .title-install-dismiss {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 0 4px;
    }
    .title-footer-links {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 6px;
    }
    .title-subtle-link {
      background: transparent;
      border: none;
      color: #64748b;
      font-family: 'Fredoka', var(--font-body);
      font-size: 0.85rem;
      cursor: pointer;
      transition: color 0.15s ease;
    }
    .title-subtle-link:hover {
      color: #38bdf8;
      text-decoration: underline;
    }
    .title-sep {
      color: #475569;
      font-size: 0.8rem;
    }

    /* Landscape Mode Mobile Optimization for Title Screen */
    @media (max-height: 520px) and (orientation: landscape) {
      .title-screen-container {
        flex-direction: row !important;
        max-width: 800px !important;
        gap: 28px !important;
        justify-content: space-evenly !important;
      }
      .title-branding {
        align-items: center !important;
      }
      .title-game-name {
        font-size: 2.1rem !important;
      }
      .title-tagline {
        display: none !important;
      }
      .title-dog-pedestal {
        width: 120px !important;
        height: 90px !important;
      }
      .title-dog-sprite {
        transform: scale(0.72);
        transform-origin: center bottom;
      }
      .title-actions-menu {
        max-width: 240px !important;
        gap: 8px !important;
      }
      .title-btn {
        padding: 9px 18px !important;
        font-size: 0.98rem !important;
      }
      .title-install-bar {
        display: none !important;
      }
    }

    /* Pause Modal */
    .adv-pause-card {
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 2px solid rgba(129, 140, 248, 0.5);
      border-radius: 24px;
      padding: 24px 28px;
      width: 100%;
      max-width: 380px;
      text-align: center;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65);
    }
    .adv-pause-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .adv-pause-icon {
      font-size: 1.6rem;
    }
    .adv-pause-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.7rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0;
    }
    .adv-pause-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .adv-pause-btn {
      width: 100%;
      padding: 12px 18px;
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 14px;
    }
    .adv-pause-exit {
      color: #f43f5e !important;
      border-color: rgba(244, 63, 94, 0.4) !important;
    }

    /* Settings Modal */
    .settings-dialog-card {
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 2px solid rgba(129, 140, 248, 0.5);
      border-radius: 24px;
      padding: 24px 28px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65);
    }
    .settings-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .settings-dialog-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0;
    }
    .settings-options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .settings-opt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 14px;
      padding: 10px 16px;
    }
    .settings-opt-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .settings-opt-name {
      font-weight: 700;
      color: #f8fafc;
      font-size: 0.95rem;
    }
    .settings-opt-desc {
      color: #94a3b8;
      font-size: 0.78rem;
    }
    .settings-toggle-btn {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 6px 14px;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      min-width: 60px;
      transition: background 0.15s ease;
    }
    .settings-toggle-btn.off {
      background: #475569;
      color: #cbd5e1;
    }

    /* Confirm Modal */
    .confirm-card {
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(244, 63, 94, 0.5);
      border-radius: 24px;
      padding: 24px 28px;
      width: 100%;
      max-width: 380px;
      text-align: center;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
    }
    .confirm-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 8px;
    }
    .confirm-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      color: #f8fafc;
      margin: 0 0 8px 0;
    }
    .confirm-desc {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 20px;
    }
    .confirm-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    /* Results / Level Complete Screen */
    #screen-adventure-victory.active {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      width: 100dvw !important;
      height: 100vh !important;
      height: 100dvh !important;
      overflow: hidden !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: radial-gradient(circle at 50% 40%, #151e36 0%, #080c16 80%, #03050a 100%) !important;
      z-index: 50 !important;
    }
    .adv-results-card {
      position: relative;
      z-index: 10;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 2px solid rgba(129, 140, 248, 0.5);
      border-radius: 28px;
      padding: 20px 28px;
      width: 100%;
      max-width: 540px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
      box-sizing: border-box;
    }
    .adv-results-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.92rem;
      letter-spacing: 2px;
      padding: 5px 18px;
      border-radius: 9999px;
      margin-bottom: 10px;
    }
    .adv-results-dog-wrap {
      display: flex;
      justify-content: center;
      margin: 4px 0;
    }
    .adv-results-stars {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: 8px 0 12px;
    }
    .adv-star-slot {
      font-size: 2.6rem;
      color: #334155;
      filter: grayscale(1) opacity(0.35);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.35s ease;
      display: inline-block;
    }
    .adv-star-slot.revealed {
      filter: none;
      animation: starSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes starSlam {
      0% { transform: scale(2.2) rotate(-25deg); opacity: 0; }
      70% { transform: scale(0.88) rotate(5deg); opacity: 1; }
      100% { transform: scale(1) rotate(0); opacity: 1; filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.8)); }
    }
    .adv-results-score-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.15));
      border: 1.5px solid rgba(245, 158, 11, 0.5);
      border-radius: 16px;
      padding: 8px 24px;
      margin-bottom: 14px;
    }
    .adv-score-star {
      font-size: 1.4rem;
    }
    .adv-score-num {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      font-weight: 900;
      color: #fbbf24;
      letter-spacing: 1px;
    }
    .adv-results-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .adv-stat-tile {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 14px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      text-align: left;
    }
    .adv-stat-tile .adv-stat-icon {
      font-size: 1.3rem;
    }
    .adv-stat-content {
      display: flex;
      flex-direction: column;
    }
    .adv-stat-label {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .adv-stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 1.05rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .adv-results-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .adv-results-btn {
      flex: 1;
      min-width: 140px;
      padding: 12px 18px;
      font-size: 1rem;
      font-weight: 800;
      border-radius: 14px;
    }

    /* Reduced Motion mode */
    body.reduced-motion * {
      animation-duration: 0.001s !important;
      transition-duration: 0.001s !important;
    }

    /* ========================================================
       ADVENTURE LEVEL SELECT WORLD MAP
       ======================================================== */
    #screen-adventure-select {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px 16px 40px;
    }
    .adventure-select-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .adventure-select-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(12px);
      border: 1.5px solid rgba(129, 140, 248, 0.35);
      border-radius: 20px;
      padding: 18px 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
      flex-wrap: wrap;
      gap: 16px;
    }
    .adv-select-titles {
      flex: 1;
      min-width: 260px;
    }
    .adv-select-title {
      font-family: var(--font-display);
      font-size: 1.9rem;
      color: #f8fafc;
      margin: 4px 0;
      letter-spacing: -0.02em;
    }
    .adv-select-sub {
      color: #94a3b8;
      font-size: 0.98rem;
      margin: 0;
    }
    .adv-total-stars-pill {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15));
      border: 1.5px solid rgba(245, 158, 11, 0.5);
      color: #fbbf24;
      padding: 10px 18px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
    }
    .adventure-levels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 20px;
    }
    .adv-level-card {
      border: 2px solid rgba(100, 116, 139, 0.35);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .adv-level-card.unlocked:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
    }
    .adv-level-card.locked {
      opacity: 0.72;
      filter: grayscale(0.25);
    }
    .adv-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .adv-card-biome-badge {
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 5px 12px;
      border-radius: 12px;
      border: 1px solid currentColor;
    }
    .adv-card-stars {
      display: flex;
      gap: 2px;
      font-size: 1.15rem;
    }
    .adv-card-title {
      font-family: var(--font-display);
      font-size: 1.35rem;
      color: #f8fafc;
      margin: 0 0 6px 0;
    }
    .adv-card-desc {
      color: #cbd5e1;
      font-size: 0.92rem;
      line-height: 1.45;
      margin: 0;
    }
    .adv-card-stats {
      display: flex;
      gap: 16px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 12px;
      padding: 10px 14px;
    }
    .adv-card-stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .adv-card-stat-item .stat-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }
    .adv-card-stat-item .stat-val {
      font-size: 1rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .adv-card-footer {
      margin-top: auto;
      padding-top: 6px;
    }
    .adv-locked-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(30, 41, 59, 0.85);
      border: 1.5px dashed rgba(148, 163, 184, 0.4);
      color: #94a3b8;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 12px;
      border-radius: 14px;
      text-align: center;
    }

    /* Celebration Dog Bone Feast Badge */
    .dog-bone-feast-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 15px auto;
      padding: 12px 20px;
      background: rgba(245, 158, 11, 0.12);
      border: 2px solid rgba(245, 158, 11, 0.35);
      border-radius: 18px;
      max-width: 320px;
    }
    .dog-bone-sprite-box {
      width: 171px;
      height: 128px;
      background: url('assets/adventure/dog_bone.png') left center no-repeat;
      background-size: 2736px 128px;
      animation: dogBoneChew 1.2s steps(16) infinite;
    }
    @keyframes dogBoneChew {
      from { background-position: 0 0; }
      to { background-position: -2736px 0; }
    }
    .feast-label {
      font-weight: 700;
      color: #f59e0b;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>

  <div class="bg-cosmic-artwork" id="bg-cosmic-artwork"></div>
  <canvas id="cosmic-stars-canvas"></canvas>
  <div class="bg-overlay"></div>
  <canvas id="confetti-canvas"></canvas>
  <div id="warp-flash-overlay"></div>
  <div id="frost-vignette-overlay">
    <div class="frost-snowflake" style="left: 10%; animation-delay: 0s;">❄️</div>
    <div class="frost-snowflake" style="left: 30%; animation-delay: 2.2s;">❄️</div>
    <div class="frost-snowflake" style="left: 65%; animation-delay: 1.1s;">❄️</div>
    <div class="frost-snowflake" style="left: 85%; animation-delay: 3.5s;">❄️</div>
  </div>

  <div class="app-container">

    <!-- Top Header Bar (Matching Reference Image) -->
    <header class="cosmic-header">
      <div class="header-main-row">
        <div class="brand-group" id="btn-go-home" title="Go to Mission Map">
          <span class="brand-rocket">🚀</span>
          <div class="brand-title">
            <span class="title-cosmic-quest">Cosmic Quest</span>
            <span class="title-iq">IQ</span>
          </div>
        </div>

        <div class="header-stats-group">
          <div class="stat-pill stars" title="Total Stars Earned">
            <span>⭐</span>
            <span id="nav-total-stars">0/15</span>
          </div>
          <div class="stat-pill score" title="Explorer Points">
            <span>⚡</span>
            <span id="nav-total-score">0</span>
          </div>
        </div>
      </div>

      <div class="header-actions-group">
        <button class="round-action-btn" id="btn-music-toggle" title="Toggle Upbeat Music">🎵</button>
        <button class="round-action-btn" id="btn-sound-toggle" title="Toggle Sound FX">🔊</button>
        <button class="round-action-btn" id="btn-studio-header" title="Question Studio (Add / Edit Questions)">✏️</button>
        <button class="round-action-btn" id="btn-badges-modal" title="View Badges">🏆</button>
        <button class="round-action-btn" id="btn-settings-modal" title="Settings & Questions">⚙️</button>
      </div>
    </header>

    <!-- Sub-Header HUD Capsule (Earth + Progress + Streak + PTS) -->
    <div class="sub-hud-capsule" id="sub-hud-capsule" style="display: none;">
      <div class="sub-hud-left">
        <button class="round-action-btn" id="btn-exit-to-map" title="Back to Map" style="width: 36px; height: 36px; font-size: 1rem;">⬅️</button>
        <div class="planet-badge">🌍</div>
        <div class="sector-name-text" id="hud-sector-name">Sector 1: Biosphere & Living World</div>
      </div>

      <div class="progress-bar-wrap" title="Sector Progress">
        <div class="progress-bar-fill" id="hud-progress-fill" style="width: 10%;"></div>
      </div>

      <div class="hud-tags-group">
        <div class="timer-pill" id="hud-timer-pill" title="Time remaining for this question">
          <span id="hud-timer-icon">⏱️</span>
          <span id="hud-timer-val">60s</span>
        </div>
        <div class="streak-pill">
          <span>🔥</span>
          <span id="hud-streak-count">0 Streak</span>
        </div>
        <div class="pts-pill" id="hud-question-points">+100 PTS</div>
      </div>
    </div>

    <!-- ========================================================
         SCREEN 1: WELCOME / ONBOARDING
         ======================================================== -->
    <section class="screen active" id="screen-welcome">
      <!-- Fullscreen Animated Three.js Canvas for Title Screen -->
      <canvas id="title-three-canvas" class="title-three-layer"></canvas>
      <div class="title-cosmic-glow"></div>

      <!-- Title Content Container -->
      <div class="title-screen-container">
        <!-- Game Logo & Subtitle -->
        <div class="title-branding">
          <div class="title-badge-pill">
            <span>✨</span>
            <span>GALACTIC ADVENTURE EDITION</span>
          </div>
          <h1 class="title-game-name">
            <span class="title-word-cosmic">COSMIC QUEST</span>
            <span class="title-word-iq">IQ</span>
          </h1>
          <p class="title-tagline">Explore • Learn • Power Up</p>
        </div>

        <!-- Hero Cosmo Dog Character Showcase -->
        <div class="title-hero-showcase">
          <div class="title-dog-pedestal">
            <div class="title-dog-glow"></div>
            <div class="title-dog-sprite"></div>
          </div>
          <div class="title-hero-name">Cosmo Dog 🐕</div>
        </div>

        <!-- Topic Selection: GK, Science, English -->
        <div class="title-topic-selector" id="title-topic-selector">
          <div class="title-topic-label">CHOOSE MISSION TOPIC</div>
          <div class="title-topic-pills">
            <button class="title-topic-pill active" data-subject="igko" id="title-topic-igko" title="General Knowledge (GK)">
              <span class="title-topic-icon">🌍</span>
              <span class="title-topic-name">GK</span>
            </button>
            <button class="title-topic-pill" data-subject="iso" id="title-topic-iso" title="Science Olympiad (ISO)">
              <span class="title-topic-icon">🔬</span>
              <span class="title-topic-name">Science</span>
            </button>
            <button class="title-topic-pill" data-subject="ieo" id="title-topic-ieo" title="English Olympiad (IEO)">
              <span class="title-topic-icon">📚</span>
              <span class="title-topic-name">English</span>
            </button>
          </div>
        </div>

        <!-- Primary Title Action Buttons -->
        <div class="title-actions-menu">
          <button class="title-btn title-btn-new-game" id="btn-title-new-game">
            <span class="title-btn-icon">▶️</span>
            <span class="title-btn-text">NEW GAME</span>
          </button>

          <button class="title-btn title-btn-continue" id="btn-title-continue" style="display: none;">
            <span class="title-btn-icon">⏩</span>
            <span class="title-btn-text">CONTINUE</span>
          </button>

          <button class="title-btn title-btn-settings" id="btn-title-settings">
            <span class="title-btn-icon">⚙️</span>
            <span class="title-btn-text">SETTINGS</span>
          </button>

          <button class="title-btn title-btn-levels" id="btn-title-levels">
            <span class="title-btn-icon">🗺️</span>
            <span class="title-btn-text">LEVELS</span>
          </button>
        </div>

        <!-- Discreet Install PWA Prompt (dismissible, small, non-intrusive) -->
        <div class="title-install-bar" id="title-install-bar" style="display: none;">
          <span>📲 Install Cosmic Quest for Full-Screen Play</span>
          <button class="title-install-btn" id="btn-title-install">Install</button>
          <button class="title-install-dismiss" id="btn-title-install-dismiss" aria-label="Dismiss">✕</button>
        </div>

        <!-- Discreet Link to Classic Quiz (retained outside main adventure flow) -->
        <div class="title-footer-links">
          <button class="title-subtle-link" id="btn-title-classic-quiz">
            <span>🚀 Classic Quiz Odyssey</span>
          </button>
          <span class="title-sep">•</span>
          <button class="title-subtle-link" id="btn-title-studio">
            <span>✏️ Question Studio</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 2: MISSION CONTROL / SECTOR MAP
         ======================================================== -->
    <section class="screen" id="screen-map">
      <div class="map-header">
        <h2 class="map-title" id="map-subject-title">Mission Control: General Knowledge (IGKO)</h2>
        <p class="map-subtitle" id="map-subject-subtitle">Select a planetary sector to explore and conquer all 100 questions!</p>
        
        <!-- Subject switcher on map -->
        <div class="olympiad-pills-row" style="margin-top: 12px;">
          <button class="olympiad-pill-btn active map-subj-btn" data-subject="igko">
            <span>🌍 IGKO GK</span>
          </button>
          <button class="olympiad-pill-btn map-subj-btn" data-subject="iso">
            <span>🔬 ISO Science</span>
          </button>
          <button class="olympiad-pill-btn map-subj-btn" data-subject="ieo">
            <span>📚 IEO English</span>
          </button>
        </div>
      </div>

      <div class="sector-grid" id="sector-grid">
        <!-- Rendered dynamically -->
      </div>

      <div class="map-bottom-actions">
        <button class="btn btn-gold" id="btn-view-certificate" style="display:none;">
          <span>👑 View Galactic Certificate</span>
        </button>
        <button class="btn btn-primary" id="btn-studio-map" style="font-size: 0.95rem;">
          <span>✏️ Add / Manage Questions</span>
        </button>
        <button class="btn btn-ghost" id="btn-review-questions">
          <span>📖 Review Question Bank</span>
        </button>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 3: QUESTION GAMEPLAY (MATCHING USER REFERENCE DESIGN)
         ======================================================== -->
    <section class="screen" id="screen-game">
      <!-- Hint bubble -->
      <div class="hint-bubble" id="hint-bubble">
        <span>💡 <strong>Star Hint:</strong> </span>
        <span id="hint-text">Clue goes here!</span>
      </div>

      <div class="gameplay-layout-grid">
        <!-- Main Question Card with Gold Border -->
        <div class="question-card">
          <!-- 60-Second Question Timer Bar -->
          <div class="question-timer-bar-wrap" title="60-Second Question Timer">
            <div class="question-timer-bar-fill" id="question-timer-bar-fill"></div>
          </div>

          <div class="question-meta-row">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <div class="pilot-avatar-badge" id="pilot-avatar-badge" title="Your Cadet Explorer">
                <span class="pilot-avatar-emoji" id="pilot-avatar-emoji">🦊</span>
                <span id="pilot-avatar-name">Cosmo Fox</span>
              </div>
              <div class="topic-pill" id="q-topic-tag">
                <span id="q-topic-icon">🌿</span>
                <span id="q-topic-name">Zoology</span>
              </div>
              <button class="btn-read-aloud" id="btn-read-aloud" title="Read Question Aloud">
                <span class="tts-icon">🔊</span>
                <span class="tts-text">Read to Me</span>
              </button>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <div class="question-timer-pill" id="question-timer-pill" title="Time remaining for this question">
                <span class="timer-icon" id="q-timer-icon">⏱️</span>
                <span class="timer-val" id="q-timer-val">60s</span>
              </div>
              <div class="q-number-text" id="q-number-pill">Question 1 of 10</div>
            </div>
          </div>

          <div class="question-stem" id="q-stem">
            Which flightless bird native to New Zealand has nostrils located at the tip of its long bill to sniff out insects underground?
          </div>

          <!-- Injected HOTS visual elements if present -->
          <div id="q-rich-content"></div>

          <!-- 4 Options Grid (Pink A, Blue B, Orange C, Green D) -->
          <div class="options-grid" id="options-grid">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Side POWERS Card (Matching Reference Image) -->
        <aside class="powers-side-card">
          <div class="powers-card-title">POWERS</div>

          <!-- 1. HINT Orb with Lightbulb -->
          <button class="side-orb-btn hint-btn" id="pu-hint" title="Star Hint (3 uses per sector)">
            <span class="orb-counter-badge" id="pu-hint-count">3</span>
            <span class="orb-icon-glyph">💡</span>
            <span class="orb-text-label">HINT</span>
          </button>

          <!-- 2. 50:50 Laser Orb -->
          <button class="side-orb-btn laser-btn" id="pu-laser" title="50:50 Laser - Eliminate 2 wrong choices">
            <span class="orb-counter-badge" id="pu-laser-count">1</span>
            <span class="orb-icon-glyph">✂️</span>
            <span class="orb-text-label">50:50</span>
          </button>

          <!-- 3. FREEZE Orb with Snowflake -->
          <button class="side-orb-btn freeze-btn" id="pu-time" title="Time Freeze Clock - Relaxed thinking">
            <span class="orb-counter-badge" id="pu-time-count">1</span>
            <span class="orb-icon-glyph">❄️</span>
            <span class="orb-text-label">FREEZE</span>
          </button>
        </aside>
      </div>

      <!-- Micro-Learning Knowledge Capsule (Slide-Up) -->
      <div class="knowledge-capsule" id="knowledge-capsule">
        <div class="capsule-header">
          <div class="capsule-verdict" id="capsule-verdict">
            <span>🎉</span>
            <span>Stellar Work! Correct!</span>
          </div>
          <span class="stat-pill score" id="capsule-points">+100 PTS</span>
        </div>

        <div class="capsule-body">
          <strong>Cosmic Fact:</strong> <span id="capsule-explanation">Explanation text goes here.</span>
        </div>

        <div class="capsule-actions">
          <button class="btn btn-primary" id="btn-capsule-next">
            <span>Continue Quest</span>
            <span>➡️</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 4: SECTOR DEBRIEF / SUMMARY
         ======================================================== -->
    <section class="screen" id="screen-debrief">
      <div class="debrief-card">
        <div class="welcome-badge">
          <span>🌌</span>
          <span>Sector Mission Accomplished</span>
        </div>

        <h2 class="debrief-title" id="debrief-sector-title">Planet Terra Cleared!</h2>

        <div class="stars-celebration" id="debrief-stars">
          <span class="star-icon filled">⭐</span>
          <span class="star-icon filled">⭐</span>
          <span class="star-icon filled">⭐</span>
        </div>

        <div class="unlocked-badge-alert" id="debrief-badge-alert">
          <span style="font-size: 2.2rem;">🏆</span>
          <div>
            <strong>New Badge Unlocked:</strong>
            <div id="debrief-badge-name" style="color: #9333ea; font-weight: 900;">Nature Scout</div>
          </div>
        </div>

        <div class="debrief-stats-grid">
          <div class="debrief-stat-box">
            <span class="num" id="debrief-score">900</span>
            <span class="label">Sector Score</span>
          </div>
          <div class="debrief-stat-box">
            <span class="num" id="debrief-accuracy">90%</span>
            <span class="label">Accuracy</span>
          </div>
          <div class="debrief-stat-box">
            <span class="num" id="debrief-streak">5</span>
            <span class="label">Best Streak</span>
          </div>
        </div>

        <div class="debrief-buttons">
          <button class="btn btn-primary" id="btn-debrief-next">
            <span>Next Sector</span>
            <span>🚀</span>
          </button>
          <button class="btn btn-ghost" id="btn-debrief-replay">
            <span>Replay Sector 🔄</span>
          </button>
          <button class="btn btn-ghost" id="btn-debrief-map">
            <span>Mission Map 🗺️</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SCREEN: ADVENTURE LEVEL SELECT WORLD MAP
         ======================================================== -->
    <section class="screen" id="screen-adventure-select">
      <div class="adventure-select-container">
        <div class="adventure-select-header">
          <button class="btn btn-ghost adv-back-btn" id="btn-adv-select-back">◀ Main Menu</button>
          <div class="adv-select-titles">
            <div class="welcome-badge" style="background: linear-gradient(135deg, #0284c7, #6366f1); color: white; display: inline-flex; margin-bottom: 8px;">
              <span>🗺️</span>
              <span>Cosmic Adventure Campaign</span>
            </div>
            <h2 class="adv-select-title">Cosmo Dog Star Map</h2>
            <p class="adv-select-sub">Guide Cosmo Dog across 3 mystical biomes, unlock Knowledge Gates, and master all 9 Stars! ⭐</p>
          </div>
          <div class="adv-total-stars-pill" id="adv-select-total-stars">
            <span>⭐ Total Stars: 0 / 9</span>
          </div>
        </div>

        <!-- Level Cards Grid -->
        <div class="adventure-levels-grid" id="adventure-levels-grid">
          <!-- Dynamic cards populated by renderAdventureLevelSelect() -->
        </div>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 5: 2D ADVENTURE PLATFORMER (COSMO DOG ODYSSEY)
         ======================================================== -->
    <section class="screen" id="screen-adventure">
      <div class="adventure-wrapper">
        <!-- Canvas Viewport with Three.js Background & Phaser 3 Game -->
        <div class="adventure-viewport" id="adventure-viewport">
          <canvas id="adventure-three-canvas" class="adventure-three-layer"></canvas>
          <div id="phaser-game-container" class="adventure-phaser-layer"></div>

          <!-- Minimal Corner Overlay HUD (Top-Left) -->
          <div class="adv-corner-hud adv-hud-tl" id="adv-hud-top-left">
            <div class="adv-hud-pill adv-energy-pill" title="Dog Energy Level">
              <span class="adv-pill-icon">⚡</span>
              <div class="adv-bar-track mini">
                <div class="adv-bar-fill" id="adv-energy-fill" style="width: 100%;"></div>
              </div>
              <span class="adv-pill-val" id="adv-energy-text">100%</span>
            </div>
            <div class="adv-hud-streak-badge" id="adv-streak-badge" style="display: none;">
              <span id="adv-streak-badge-text">🔥 Streak 2</span>
            </div>
          </div>

          <!-- Minimal Corner Overlay HUD (Top-Right) -->
          <div class="adv-corner-hud adv-hud-tr" id="adv-hud-top-right">
            <div class="adv-hud-pill" title="Special Diamonds Collected">
              <span>💎</span>
              <span id="adv-diamonds-text">0 / 3</span>
            </div>
            <div class="adv-hud-pill" title="Bones Collected">
              <span>🦴</span>
              <span id="adv-bones-text">0 / 10</span>
            </div>
            <button class="adv-hud-pause-btn adv-hud-home-btn" id="btn-adv-home" title="Return to Main Menu" aria-label="Main Menu">
              <span>🏠</span>
            </button>
            <button class="adv-hud-pause-btn" id="btn-adv-pause" title="Pause Game / Menu" aria-label="Pause Menu">
              <span>⏸️</span>
            </button>
          </div>

          <!-- Cinematic Level Start Title Banner (fades out after ~2s) -->
          <div class="adv-cinematic-title" id="adv-cinematic-title" style="display: none;">
            <div class="adv-cine-sub">LEVEL 1</div>
            <div class="adv-cine-main">NEBULA PLAINS</div>
          </div>

          <!-- Knowledge Gate Approach Announcement Toast -->
          <div class="adv-gate-announce" id="adv-gate-announce" style="display: none;">
            <span class="adv-gate-icon">⛩️</span>
            <span id="adv-gate-announce-text">KNOWLEDGE GATE 1 / 7</span>
          </div>

          <!-- Toast Banner for Guidance (Compact & Dismissible) -->
          <div class="adventure-hint-toast" id="adv-toast">
            <span class="adv-toast-text">🐕 Arrow Keys / A-D to Move • Space to Jump • ⚡ Cosmic Pulse (F / J)</span>
            <button class="adv-toast-close" id="btn-adv-toast-close" title="Dismiss Guide" aria-label="Dismiss">✕</button>
          </div>

          <!-- Mobile On-Screen Touch Controls -->
          <div class="adv-touch-controls" id="adv-touch-controls">
            <div class="adv-dpad">
              <button class="adv-touch-btn adv-btn-left" id="btn-touch-left" aria-label="Move Left">◀</button>
              <button class="adv-touch-btn adv-btn-right" id="btn-touch-right" aria-label="Move Right">▶</button>
            </div>
            <div class="adv-actions">
              <button class="adv-touch-btn adv-btn-pulse" id="btn-touch-pulse" title="Cosmic Pulse (F / J / X)" aria-label="Cosmic Pulse">⚡</button>
              <button class="adv-touch-btn adv-btn-sniff" id="btn-touch-sniff" title="Sniff Knowledge (E)" aria-label="Sniff Knowledge">👃</button>
              <button class="adv-touch-btn adv-jump-btn" id="btn-touch-jump" title="Jump / Double Jump (Space / W / Up)" aria-label="Jump">⤒</button>
            </div>
          </div>

          <!-- Portrait Orientation Friendly Overlay -->
          <div class="adv-rotate-prompt" id="adv-rotate-prompt" style="display: none;">
            <div class="adv-rotate-card">
              <div class="adv-rotate-icon">📱↻</div>
              <h3 class="adv-rotate-title">Rotate Your Device</h3>
              <p class="adv-rotate-text">Rotate your device to landscape for the best adventure experience!</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 6: ADVENTURE VICTORY / ODYSSEY CLEAR
         ======================================================== -->
    <section class="screen" id="screen-adventure-victory">
      <div class="adv-results-card">
        <div class="adv-results-badge">
          <span>🐕</span>
          <span id="adv-results-level-tag">LEVEL COMPLETE!</span>
        </div>

        <!-- Animated Dog Bone Feast Celebration Badge -->
        <div class="adv-results-dog-wrap">
          <div class="dog-bone-sprite-box"></div>
        </div>

        <!-- Star Reveal Container (animated 1 by 1) -->
        <div class="adv-results-stars" id="adv-victory-stars">
          <span class="adv-star-slot" id="star-slot-1">⭐</span>
          <span class="adv-star-slot" id="star-slot-2">⭐</span>
          <span class="adv-star-slot" id="star-slot-3">⭐</span>
        </div>

        <!-- Big Total Score -->
        <div class="adv-results-score-box">
          <span class="adv-score-star">⭐</span>
          <span class="adv-score-num" id="adv-stat-score">0 PTS</span>
        </div>

        <!-- Grid of Animated Stat Counters -->
        <div class="adv-results-stats-grid">
          <div class="adv-stat-tile">
            <span class="adv-stat-icon">🦴</span>
            <div class="adv-stat-content">
              <span class="adv-stat-label">Bones</span>
              <span class="adv-stat-val" id="adv-stat-bones">0 / 10</span>
            </div>
          </div>
          <div class="adv-stat-tile">
            <span class="adv-stat-icon">💎</span>
            <div class="adv-stat-content">
              <span class="adv-stat-label">Diamonds</span>
              <span class="adv-stat-val" id="adv-stat-diamonds">0 / 3</span>
            </div>
          </div>
          <div class="adv-stat-tile">
            <span class="adv-stat-icon">🚪</span>
            <div class="adv-stat-content">
              <span class="adv-stat-label">Gates</span>
              <span class="adv-stat-val" id="adv-stat-gates">0 / 7</span>
            </div>
          </div>
          <div class="adv-stat-tile">
            <span class="adv-stat-icon">🧠</span>
            <div class="adv-stat-content">
              <span class="adv-stat-label">Correct</span>
              <span class="adv-stat-val" id="adv-stat-correct">0 / 7</span>
            </div>
          </div>
          <div class="adv-stat-tile">
            <span class="adv-stat-icon">🔥</span>
            <div class="adv-stat-content">
              <span class="adv-stat-label">Streak</span>
              <span class="adv-stat-val" id="adv-stat-streak">0</span>
            </div>
          </div>
          <div class="adv-stat-tile">
            <span class="adv-stat-icon">⚡</span>
            <div class="adv-stat-content">
              <span class="adv-stat-label">Energy</span>
              <span class="adv-stat-val" id="adv-stat-energy">100%</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="adv-results-actions" id="adv-results-actions">
          <button class="btn btn-primary adv-results-btn" id="btn-adv-next-level" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
            <span>Next Level ⏩</span>
          </button>
          <button class="btn btn-secondary adv-results-btn" id="btn-adv-replay" style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: white;">
            <span>🔄 Replay</span>
          </button>
          <button class="btn btn-secondary adv-results-btn" id="btn-adv-to-levels" style="background: linear-gradient(135deg, #0284c7, #2563eb); color: white;">
            <span>🗺️ Level Map</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Floating Mascot Companion (Sparky the Astro-Bot) -->
    <div class="mascot-companion-widget" id="mascot-widget">
      <div class="mascot-speech-bubble" id="mascot-bubble" onclick="dismissSparkyBubble()" title="Tap to dismiss message">
        <button class="mascot-bubble-close" onclick="event.stopPropagation(); dismissSparkyBubble();" title="Dismiss message">✕</button>
        <span id="mascot-message">Hi Cadet! I'm Sparky, your Astro-Bot companion! 🚀</span>
      </div>
      <div class="mascot-avatar-container">
        <button class="mascot-avatar-btn" id="mascot-avatar-btn" title="Click Sparky for a Cosmic Fun Fact!">
          <span class="mascot-emoji">🤖</span>
          <span class="mascot-badge-name">Sparky</span>
        </button>
        <button class="mascot-hide-btn" id="mascot-hide-btn" onclick="toggleSparkyVisibility(false)" title="Hide Sparky (Re-enable in Settings)">✕</button>
      </div>
    </div>

  </div><!-- /app-container -->

  <!-- Modal: Adventure Pause Menu (Root Level) -->
  <div class="modal-overlay" id="modal-adventure-pause" style="display: none; z-index: 99998; justify-content: center; align-items: center;">
    <div class="adv-pause-card">
      <div class="adv-pause-header">
        <span class="adv-pause-icon">⏸️</span>
        <h2 class="adv-pause-title">Game Paused</h2>
      </div>
      <div class="adv-pause-buttons">
        <button class="btn btn-primary adv-pause-btn" id="btn-pause-resume" style="background: linear-gradient(135deg, #10b981, #059669);">
          <span>▶️ Resume Game</span>
        </button>
        <button class="btn btn-secondary adv-pause-btn" id="btn-pause-restart" style="background: linear-gradient(135deg, #f59e0b, #ea580c);">
          <span>🔄 Restart Level</span>
        </button>
        <button class="btn btn-secondary adv-pause-btn" id="btn-pause-settings">
          <span>⚙️ Settings</span>
        </button>
        <button class="btn btn-secondary adv-pause-btn" id="btn-pause-level-map">
          <span>🗺️ Level Select Map</span>
        </button>
        <button class="btn btn-ghost adv-pause-btn adv-pause-exit" id="btn-pause-exit">
          <span>🏠 Exit to Title</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: Compact Game Settings (Root Level) -->
  <div class="modal-overlay" id="modal-game-settings" style="display: none; z-index: 99999; justify-content: center; align-items: center;">
    <div class="settings-dialog-card">
      <div class="settings-dialog-header">
        <h2 class="settings-dialog-title">⚙️ Game Settings</h2>
        <button class="modal-close-btn" id="btn-game-settings-close" aria-label="Close Settings">✕</button>
      </div>
      <div class="settings-options-list">
        <div class="settings-opt-row">
          <div class="settings-opt-info">
            <span class="settings-opt-name">🎵 Background Music</span>
            <span class="settings-opt-desc">Upbeat cosmic soundtrack</span>
          </div>
          <button class="settings-toggle-btn" id="toggle-opt-music">ON</button>
        </div>

        <div class="settings-opt-row">
          <div class="settings-opt-info">
            <span class="settings-opt-name">🔊 Sound Effects</span>
            <span class="settings-opt-desc">Jumps, pulses, chimes</span>
          </div>
          <button class="settings-toggle-btn" id="toggle-opt-sfx">ON</button>
        </div>

        <div class="settings-opt-row">
          <div class="settings-opt-info">
            <span class="settings-opt-name">⛶ Fullscreen Mode</span>
            <span class="settings-opt-desc">Immersive display experience</span>
          </div>
          <button class="settings-toggle-btn" id="toggle-opt-fullscreen">TOGGLE</button>
        </div>

        <div class="settings-opt-row">
          <div class="settings-opt-info">
            <span class="settings-opt-name">✨ Reduced Motion</span>
            <span class="settings-opt-desc">Minimize screen shakes & flashes</span>
          </div>
          <button class="settings-toggle-btn off" id="toggle-opt-motion">OFF</button>
        </div>

        <div class="settings-opt-row" id="row-settings-install" style="display: none;">
          <div class="settings-opt-info">
            <span class="settings-opt-name">📲 Install App</span>
            <span class="settings-opt-desc">Add Cosmic Quest to home screen</span>
          </div>
          <button class="btn btn-primary" id="btn-settings-install" style="padding: 6px 14px; font-size: 0.85rem;">INSTALL</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Confirm New Game (Root Level) -->
  <div class="modal-overlay" id="modal-confirm-new-game" style="display: none; z-index: 99999; justify-content: center; align-items: center;">
    <div class="confirm-card">
      <span class="confirm-icon">🚀</span>
      <h3 class="confirm-title">Start a New Adventure?</h3>
      <p class="confirm-desc">This will reset your Adventure progression to Level 1. Your Classic Quiz scores will remain safe!</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" id="btn-newgame-cancel">Cancel</button>
        <button class="btn btn-primary" id="btn-newgame-proceed" style="background: linear-gradient(135deg, #f43f5e, #e11d48);">Start Over</button>
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL: KNOWLEDGE GATE MCQ OVERLAY (MOBILE-OPTIMIZED)
       ======================================================== -->
  <div class="modal-overlay" id="adv-gate-modal" style="display: none; z-index: 9999; justify-content: center; align-items: center;">
    <div class="adv-gate-modal-card">
      <!-- STAGE 1: QUESTION & OPTIONS SCREEN (100% SINGLE SCREEN FIT) -->
      <div id="adv-gate-stage-question" class="adv-gate-stage">
        <!-- STICKY HEADER (Always Visible) -->
        <div class="adv-gate-header">
          <div class="adv-gate-badge">
            <span id="adv-gate-title">⛩️ Knowledge Gate #1</span>
          </div>
          <div class="adv-gate-timer" id="adv-gate-timer-pill">
            ⏱️ <span id="adv-gate-timer-secs">60s</span>
          </div>
        </div>

        <!-- INTERNAL BODY -->
        <div class="adv-gate-body-scroll" id="adv-gate-body-scroll">
          <!-- Dynamic Clue/Hint/Freeze Message Banner -->
          <div class="adv-gate-clue-box" id="adv-gate-clue-box" style="display: none;">
            <span class="adv-gate-clue-icon" id="adv-gate-clue-icon">💡</span>
            <span class="adv-gate-clue-text" id="adv-gate-clue-text">Hint text goes here</span>
          </div>

          <div class="adv-gate-question-box">
            <div class="adv-gate-topic" id="adv-gate-topic">SCIENCE</div>
            <h3 class="adv-gate-question-text" id="adv-gate-question-text">Loading question...</h3>
          </div>

          <div class="adv-gate-options-grid" id="adv-gate-options-grid">
            <!-- Option buttons dynamically generated -->
          </div>
        </div>

        <!-- STICKY FOOTER: POWER-UPS BAR -->
        <div class="adv-gate-footer">
          <div class="adv-gate-powerups-bar">
            <div class="adv-pu-title">⚡ POWERS:</div>
            <div class="adv-pu-buttons">
              <button type="button" class="adv-pu-btn adv-pu-hint" id="adv-pu-hint" title="Star Hint - Reveal helpful Olympiad clue">
                <span class="adv-pu-icon">💡</span>
                <span class="adv-pu-name">HINT</span>
                <span class="adv-pu-badge" id="adv-pu-hint-count">3</span>
              </button>
              <button type="button" class="adv-pu-btn adv-pu-laser" id="adv-pu-laser" title="50:50 Laser - Zap 2 wrong choices">
                <span class="adv-pu-icon">⚡</span>
                <span class="adv-pu-name">50:50</span>
                <span class="adv-pu-badge" id="adv-pu-laser-count">1</span>
              </button>
              <button type="button" class="adv-pu-btn adv-pu-freeze" id="adv-pu-freeze" title="Time Freeze - Stop the 60s countdown">
                <span class="adv-pu-icon">❄️</span>
                <span class="adv-pu-name">FREEZE</span>
                <span class="adv-pu-badge" id="adv-pu-freeze-count">1</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STAGE 2: DEDICATED EXPLANATION & SKIP TO GAME SCREEN -->
      <div id="adv-gate-stage-explanation" class="adv-gate-stage" style="display: none;">
        <div class="adv-gate-header adv-explanation-header">
          <div class="adv-gate-badge">
            <span id="adv-explanation-title">💡 Olympiad Concept Capsule</span>
          </div>
          <div class="adv-verdict-pill" id="adv-verdict-pill">
            <span id="adv-verdict-pill-text">✨ CLEARED</span>
          </div>
        </div>

        <div class="adv-gate-body-scroll adv-explanation-body">
          <div class="adv-verdict-banner" id="adv-verdict-banner"></div>

          <div class="adv-explanation-card">
            <div class="adv-explanation-card-header">
              <span class="adv-exp-icon">🔬</span>
              <span>Scientific Concept & Explanation</span>
            </div>
            <div id="adv-capsule-text" class="adv-capsule-text"></div>
          </div>
        </div>

        <div class="adv-gate-footer adv-explanation-footer">
          <button class="btn btn-primary adv-skip-btn" id="btn-adv-capsule-next">
            <span>Skip to Game (15s)</span>
            <span class="adv-skip-icon">🚀</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL 1: GALACTIC CHAMPION CERTIFICATE
       ======================================================== -->
  <div class="modal-overlay" id="modal-certificate">
    <div class="modal-box">
      <button class="modal-close-btn" onclick="closeModal('modal-certificate')">✕</button>
      
      <div class="certificate-container" id="printable-certificate">
        <div class="cert-corner top-left"></div>
        <div class="cert-corner top-right"></div>
        <div class="cert-corner bottom-left"></div>
        <div class="cert-corner bottom-right"></div>

        <div class="cert-banner">🌟 🚀 🌟</div>
        <div class="cert-header">Galactic Knowledge Olympiad</div>
        <h2 class="cert-title">Certificate of Achievement</h2>
        <div class="cert-subtitle">This certifies that intrepid space explorer</div>

        <div class="cert-name" id="cert-player-name">Cadet Alex</div>

        <p class="cert-desc">
          has triumphantly cleared all 5 Planetary Sectors, mastering 50 Class 6 General Knowledge Olympiad challenges across Biosphere, Cosmos, Global Affairs, and Achievers HOTS with stellar distinction!
        </p>

        <div class="cert-footer">
          <div>
            <div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800;">Final Score</div>
            <div class="cert-sig-line" id="cert-final-score">4,800 PTS</div>
          </div>
          <div>
            <div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800;">Honor Rank</div>
            <div class="cert-sig-line" id="cert-rank">Galactic Grandmaster 👑</div>
          </div>
          <div>
            <div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800;">Date Issued</div>
            <div class="cert-sig-line" id="cert-date">Sep 13, 2026</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; display: flex; justify-content: center; gap: 14px;" class="print-hide">
        <button class="btn btn-gold" onclick="window.print()">
          <span>🖨️ Print / Save as PDF</span>
        </button>
        <button class="btn btn-ghost" onclick="closeModal('modal-certificate')">
          <span>Close</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL 2: BADGES CABINET
       ======================================================== -->
  <div class="modal-overlay" id="modal-badges">
    <div class="modal-box">
      <button class="modal-close-btn" onclick="closeModal('modal-badges')">✕</button>
      <h2 style="font-family: var(--font-display); font-size: 1.9rem; margin-bottom: 6px; color:#0f172a;">🏆 Explorer Badges</h2>
      <p style="color: var(--text-muted); font-size: 1rem; font-weight: 600;">Unlock shiny honors by conquering each planetary sector and maintaining high streaks!</p>

      <div class="badge-grid" id="badges-grid">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL 3: SETTINGS & CUSTOM QUESTION BANK
       ======================================================== -->
  <div class="modal-overlay" id="modal-settings">
    <div class="modal-box">
      <button class="modal-close-btn" onclick="closeModal('modal-settings')">✕</button>
      <h2 style="font-family: var(--font-display); font-size: 1.9rem; margin-bottom: 6px; color:#0f172a;">⚙️ Game Settings</h2>
      <p style="color: var(--text-muted); font-size: 1rem; font-weight: 600;">Manage music, sound, game progress, and load new custom question sets.</p>

      <div style="margin: 20px 0; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-ghost" id="btn-toggle-bgm-settings" style="flex: 1;">
            <span>🎵 Music: ON</span>
          </button>
          <button class="btn btn-ghost" id="btn-toggle-sfx-settings" style="flex: 1;">
            <span>🔊 Sound FX: ON</span>
          </button>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-ghost" id="btn-toggle-anim-settings" style="flex: 1; min-width: 140px; border-color: #818cf8; color: #4338ca;">
            <span>✨ Animations: Full Cosmic 🌟</span>
          </button>
          <button class="btn btn-ghost" id="btn-toggle-sparky-settings" style="flex: 1; min-width: 140px; border-color: #38bdf8; color: #0284c7;">
            <span>🤖 Sparky Mascot: ON 🚀</span>
          </button>
        </div>

        <div style="background: #fdf2f8; border: 2px solid #fbcfe8; border-radius: var(--radius-md); padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="font-family: var(--font-display); font-weight: 800; color: #db2777; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
              <span>🗣️ Voice Narration (Read Aloud)</span>
            </label>
            <span style="font-size: 0.8rem; background: #f43f5e; color: #fff; padding: 2px 8px; border-radius: 999px; font-weight: 800;">🌸 Female / Natural</span>
          </div>
          <select id="settings-voice-select" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 2px solid #f472b6; font-family: inherit; font-size: 0.92rem; font-weight: 700; color: #831843; background: #ffffff; cursor: pointer; outline: none;">
            <option value="auto">🌸 Auto-Select Best Natural Female Voice (Recommended)</option>
          </select>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <button class="btn btn-ghost" id="btn-test-voice" style="padding: 6px 14px; font-size: 0.85rem; border-color: #f472b6; color: #db2777;">
              <span>▶️ Test Voice Sample</span>
            </button>
            <span id="current-voice-label" style="font-size: 0.82rem; color: #9d174d; font-weight: 700;">Active: Natural Female</span>
          </div>
        </div>

        <button class="btn btn-primary" id="btn-studio-settings" style="width: 100%; font-size: 1rem;">
          <span>✏️ Open Question Studio (Add / Edit / Export)</span>
        </button>

        <button class="btn btn-ghost" id="btn-export-questions">
          <span>📥 Export Current Questions (JSON)</span>
        </button>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
          <h4 style="font-family: var(--font-display); color: #0284c7; margin-bottom: 6px; font-size: 1.1rem;">Load Custom Question Pack</h4>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Paste your JSON array of questions to instantly create a new custom quiz!</p>
          <textarea class="import-textarea" id="custom-json-input" placeholder="Paste JSON question array here..."></textarea>
          <button class="btn btn-primary" id="btn-import-questions" style="width: 100%; font-size: 1rem;">
            <span>🚀 Load Custom Question Bank</span>
          </button>
        </div>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
          <button class="btn btn-ghost" id="btn-reset-progress" style="color: #e11d48; border-color: #fecdd3; width: 100%;">
            <span>⚠️ Reset All Game Progress</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL 4: FULL QUESTION BANK REVIEW
       ======================================================== -->
  <div class="modal-overlay" id="modal-review">
    <div class="modal-box" style="max-width: 750px;">
      <button class="modal-close-btn" onclick="closeModal('modal-review')">✕</button>
      <h2 style="font-family: var(--font-display); font-size: 1.9rem; margin-bottom: 6px; color:#0f172a;">📖 Olympiad Question Review</h2>
      <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 18px; font-weight: 600;">Browse all questions, correct answers, and scientific explanations.</p>

      <div id="review-questions-list" style="display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto; padding-right: 6px;">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL 5: QUESTION STUDIO (ADD / EDIT / DOWNLOAD STANDALONE)
       ======================================================== -->
  <div class="modal-overlay" id="modal-studio">
    <div class="modal-box" style="max-width: 760px;">
      <button class="modal-close-btn" onclick="closeModal('modal-studio')">✕</button>
      <h2 style="font-family: var(--font-display); font-size: 1.85rem; margin-bottom: 4px; color:#0f172a;">✏️ Cosmic Question Studio</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem; font-weight: 600;">Add custom questions, browse the question bank, or download an updated standalone HTML file to share!</p>

      <div class="studio-tabs">
        <button class="studio-tab-btn active" id="tab-btn-add">
          <span>➕ Add Single Question</span>
        </button>
        <button class="studio-tab-btn" id="tab-btn-list">
          <span>📚 Question Bank (<span id="studio-q-count">50</span>)</span>
        </button>
        <button class="studio-tab-btn" id="tab-btn-export">
          <span>💾 Share & Download Game</span>
        </button>
      </div>

      <!-- TAB 1: ADD QUESTION FORM -->
      <div class="studio-tab-content active" id="studio-tab-add">
        <form id="studio-add-form">
          <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
            <div class="studio-form-group" style="flex: 1; min-width: 220px; margin-bottom: 0;">
              <label class="studio-label">Planetary Sector</label>
              <select class="studio-select" id="sq-sector">
                <option value="1">Sector 1: Biosphere & Living World</option>
                <option value="2">Sector 2: Cosmos & Human Ingenuity</option>
                <option value="3">Sector 3: Culture, Sports & Logic</option>
                <option value="4">Sector 4: Orbit of the Present (2024)</option>
                <option value="5">Sector 5: Mind Mastery & HOTS Achievers</option>
              </select>
            </div>
            <div class="studio-form-group" style="flex: 1; min-width: 180px; margin-bottom: 0;">
              <label class="studio-label">Topic / Subject</label>
              <input type="text" class="studio-input" id="sq-topic" placeholder="e.g., Zoology, Space, History..." required />
            </div>
          </div>

          <div class="studio-form-group">
            <label class="studio-label">Question Text</label>
            <textarea class="studio-textarea" id="sq-text" rows="3" placeholder="Type your question here..." required></textarea>
          </div>

          <div class="studio-form-group">
            <label class="studio-label">4 Options (Select radio button for Correct Answer):</label>
            
            <div class="studio-option-row">
              <input type="radio" name="sq-correct-radio" value="0" class="studio-option-radio" checked title="Mark as correct" />
              <div class="studio-option-badge badge-opt-a">A</div>
              <input type="text" class="studio-input" id="sq-opt-0" placeholder="Option A text..." required />
            </div>

            <div class="studio-option-row">
              <input type="radio" name="sq-correct-radio" value="1" class="studio-option-radio" title="Mark as correct" />
              <div class="studio-option-badge badge-opt-b">B</div>
              <input type="text" class="studio-input" id="sq-opt-1" placeholder="Option B text..." required />
            </div>

            <div class="studio-option-row">
              <input type="radio" name="sq-correct-radio" value="2" class="studio-option-radio" title="Mark as correct" />
              <div class="studio-option-badge badge-opt-c">C</div>
              <input type="text" class="studio-input" id="sq-opt-2" placeholder="Option C text..." required />
            </div>

            <div class="studio-option-row">
              <input type="radio" name="sq-correct-radio" value="3" class="studio-option-radio" title="Mark as correct" />
              <div class="studio-option-badge badge-opt-d">D</div>
              <input type="text" class="studio-input" id="sq-opt-3" placeholder="Option D text..." required />
            </div>
          </div>

          <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
            <div class="studio-form-group" style="flex: 1; min-width: 220px; margin-bottom: 0;">
              <label class="studio-label">💡 Star Hint (Optional)</label>
              <input type="text" class="studio-input" id="sq-hint" placeholder="Clue to help kids think..." />
            </div>
            <div class="studio-form-group" style="flex: 1; min-width: 220px; margin-bottom: 0;">
              <label class="studio-label">🔬 Fun Fact / Explanation (Optional)</label>
              <input type="text" class="studio-input" id="sq-explanation" placeholder="Did You Know? explanation..." />
            </div>
          </div>

          <div id="studio-form-msg" style="display: none; margin-bottom: 12px; padding: 10px 14px; border-radius: 8px; font-weight: 800; font-size: 0.95rem;"></div>

          <div style="display: flex; gap: 12px;">
            <button type="submit" class="btn btn-primary" style="flex: 2;">
              <span>✨ Save Question to Game</span>
            </button>
            <button type="reset" class="btn btn-ghost" style="flex: 1;">
              <span>Clear</span>
            </button>
          </div>
        </form>
      </div>

      <!-- TAB 2: VIEW QUESTION BANK -->
      <div class="studio-tab-content" id="studio-tab-list">
        <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
          <select class="studio-select" id="sq-filter-sector" style="flex: 1; min-width: 180px;">
            <option value="all">All Sectors</option>
            <option value="1">Sector 1: Biosphere</option>
            <option value="2">Sector 2: Cosmos</option>
            <option value="3">Sector 3: Culture & Logic</option>
            <option value="4">Sector 4: Orbit 2024</option>
            <option value="5">Sector 5: Mind Mastery</option>
          </select>
          <input type="text" class="studio-input" id="sq-search-query" style="flex: 2; min-width: 200px;" placeholder="🔍 Search questions..." />
        </div>

        <div class="studio-card-list" id="studio-question-card-list">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- TAB 3: SHARE & DOWNLOAD GAME -->
      <div class="studio-tab-content" id="studio-tab-export">
        <div class="download-hero-box">
          <div style="font-size: 2.8rem; margin-bottom: 6px;">📥</div>
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #0369a1; margin-bottom: 6px;">Download Standalone Game (.html)</h3>
          <p style="color: #475569; font-size: 0.95rem; margin-bottom: 16px; max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.5;">
            Download a 100% self-contained HTML file containing all your new questions! Anyone you send this file to (500 miles away) can open it on their laptop, iPad, or phone and play immediately without needing any server or installation.
          </p>
          <button class="btn btn-primary" id="btn-download-standalone-html" style="font-size: 1.05rem; padding: 14px 28px;">
            <span>📥 Download CosmicQuest_Game.html</span>
          </button>
        </div>

        <div style="border: 2px solid #e2e8f0; border-radius: var(--radius-md); padding: 16px; margin-bottom: 14px; background: #ffffff;">
          <h4 style="font-family: var(--font-display); color: #0f172a; margin-bottom: 6px; font-size: 1rem;">Export or Backup Questions (JSON)</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 10px;">Download raw question data or copy to clipboard for safe keeping.</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-ghost" id="btn-studio-download-json" style="font-size: 0.88rem; padding: 8px 14px;">
              <span>💾 Download questions.json</span>
            </button>
            <button class="btn btn-ghost" id="btn-studio-copy-json" style="font-size: 0.88rem; padding: 8px 14px;">
              <span>📋 Copy All to Clipboard</span>
            </button>
          </div>
        </div>

        <div style="border: 2px solid #fecdd3; border-radius: var(--radius-md); padding: 16px; background: #fff1f2;">
          <h4 style="font-family: var(--font-display); color: #be123c; margin-bottom: 4px; font-size: 1rem;">Reset Questions to Default</h4>
          <p style="color: #9f1239; font-size: 0.88rem; margin-bottom: 10px;">Clear all custom questions and revert back to the original 50 Olympiad questions.</p>
          <button class="btn btn-ghost" id="btn-studio-reset-defaults" style="color: #be123c; border-color: #fca5a5; font-size: 0.88rem; padding: 8px 14px;">
            <span>🔄 Revert to Original 50 Questions</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       UPBEAT ARCADE AUDIO SYNTHESIZER & GAME LOGIC
       ======================================================== -->
  <script>
    /* Default Embedded Question Banks (IGKO, ISO, IEO) */
    const DEFAULT_QUESTIONS = __QUESTIONS_JSON__;
    const ISO_QUESTIONS = __ISO_QUESTIONS_JSON__;
    const IEO_QUESTIONS = __IEO_QUESTIONS_JSON__;

    /* Upbeat Arcade Sound Synthesizer (Bouncy 8-bit / 16-bit Catchy Game Groove) */
    class UpbeatAudioEngine {
      constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.bgmGain = null;
        this.sfxGain = null;
        this.bgmInterval = null;
        this.step = 0;
        this.bpm = 126;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
            
            // SFX Master Gain
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
            this.sfxGain.connect(this.ctx.destination);

            // BGM Master Gain (cheerful and buoyant)
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(0.16, this.ctx.currentTime);
            this.bgmGain.connect(this.ctx.destination);
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if (this.bgmEnabled && !this.bgmInterval) {
          this.startUpbeatMusic();
        }
      }

      /* Play Catchy Upbeat Arcade Music (126 BPM) */
      startUpbeatMusic() {
        if (!this.ctx || this.bgmInterval) return;

        // Upbeat Bass notes for 4-bar loop (C - G - Am - F)
        const bassNotes = [
          130.81, 130.81, 164.81, 196.00, // C3, C3, E3, G3
          98.00,  98.00,  123.47, 146.83, // G2, G2, B2, D3
          110.00, 110.00, 130.81, 164.81, // A2, A2, C3, E3
          87.31,  87.31,  110.00, 130.81  // F2, F2, A2, C3
        ];

        // Catchy Chiptune Melody (Joyful, bouncy arpeggiated lead)
        const leadNotes = [
          523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 659.25, // Bar 1 (C major bounce)
          392.00, 587.33, 783.99, 987.77,  783.99, 587.33, 493.88, 587.33, // Bar 2 (G major bounce)
          440.00, 523.25, 659.25, 880.00,  659.25, 523.25, 440.00, 523.25, // Bar 3 (A minor bounce)
          349.23, 440.00, 523.25, 698.46,  880.00, 783.99, 659.25, 587.33  // Bar 4 (F major resolution)
        ];

        const stepDuration = 60 / (this.bpm * 2); // 8th note duration (~0.238s)

        const playTick = () => {
          if (!this.bgmEnabled || !this.ctx || this.ctx.state !== 'running') return;
          const now = this.ctx.currentTime;
          const currentStep = this.step % 32;
          this.step++;

          // 1. Play Bouncy Bass Note (Every 2 steps = quarter note)
          if (currentStep % 2 === 0) {
            const bassIdx = Math.floor(currentStep / 2) % bassNotes.length;
            const bFreq = bassNotes[bassIdx];
            try {
              const bOsc = this.ctx.createOscillator();
              const bGain = this.ctx.createGain();
              bOsc.type = 'triangle';
              bOsc.frequency.setValueAtTime(bFreq, now);

              bGain.gain.setValueAtTime(0.08, now);
              bGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

              bOsc.connect(bGain);
              bGain.connect(this.bgmGain);
              bOsc.start(now);
              bOsc.stop(now + stepDuration * 1.8);
            } catch(e) {}
          }

          // 2. Play Cheerful Melody Lead (Plucky, Mario/Kirby style)
          const mFreq = leadNotes[currentStep];
          if (mFreq) {
            try {
              const mOsc = this.ctx.createOscillator();
              const mGain = this.ctx.createGain();
              mOsc.type = 'square'; // Classic retro chiptune sound!
              mOsc.frequency.setValueAtTime(mFreq, now);

              // Lowpass filter for smooth, non-piercing pleasant tone
              const mFilter = this.ctx.createBiquadFilter();
              mFilter.type = 'lowpass';
              mFilter.frequency.setValueAtTime(1200, now);

              mGain.gain.setValueAtTime(0.035, now);
              mGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

              mOsc.connect(mFilter);
              mFilter.connect(mGain);
              mGain.connect(this.bgmGain);

              mOsc.start(now);
              mOsc.stop(now + stepDuration * 0.95);
            } catch(e) {}
          }

          // 3. Rhythmic Percussion (Subtle cheerful click/drum)
          if (currentStep % 4 === 2) {
            try {
              const pOsc = this.ctx.createOscillator();
              const pGain = this.ctx.createGain();
              pOsc.type = 'sine';
              pOsc.frequency.setValueAtTime(220, now);
              pOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

              pGain.gain.setValueAtTime(0.05, now);
              pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

              pOsc.connect(pGain);
              pGain.connect(this.bgmGain);
              pOsc.start(now);
              pOsc.stop(now + 0.09);
            } catch(e) {}
          }
        };

        playTick();
        this.bgmInterval = setInterval(playTick, Math.round(stepDuration * 1000));
      }

      stopUpbeatMusic() {
        if (this.bgmInterval) {
          clearInterval(this.bgmInterval);
          this.bgmInterval = null;
        }
      }

      toggleBgm() {
        this.init();
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
          this.startUpbeatMusic();
        } else {
          this.stopUpbeatMusic();
        }
        return this.bgmEnabled;
      }

      toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
      }

      /* Sound FX */
      playClick() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1150, this.ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } catch(e) {}
      }

      /* Cheerful "Wow!" + Clapping Applause for Correct Answers */
      playCorrect() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Spoken "Wow!" via SpeechSynthesis
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance("Wow!");
            utter.pitch = 1.45;
            utter.rate = 1.15;
            utter.volume = 0.95;
            window.speechSynthesis.speak(utter);
          }
        } catch(e) {}

        // 2. Synthesized Vocal Formant "W-O-W" in Web Audio (cross-platform audio)
        try {
          const vOsc = this.ctx.createOscillator();
          const vGain = this.ctx.createGain();
          const vFilter = this.ctx.createBiquadFilter();
          vOsc.type = 'sawtooth';

          vOsc.frequency.setValueAtTime(280, now);
          vOsc.frequency.exponentialRampToValueAtTime(460, now + 0.18);
          vOsc.frequency.exponentialRampToValueAtTime(360, now + 0.42);

          vFilter.type = 'bandpass';
          vFilter.Q.setValueAtTime(2.8, now);
          vFilter.frequency.setValueAtTime(550, now);
          vFilter.frequency.exponentialRampToValueAtTime(1250, now + 0.18);
          vFilter.frequency.exponentialRampToValueAtTime(650, now + 0.42);

          vGain.gain.setValueAtTime(0.001, now);
          vGain.gain.linearRampToValueAtTime(0.24, now + 0.06);
          vGain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

          vOsc.connect(vFilter);
          vFilter.connect(vGain);
          vGain.connect(this.sfxGain);
          vOsc.start(now);
          vOsc.stop(now + 0.48);
        } catch(e) {}

        // 3. Synthesized Crowd Clapping / Applause (Burst of hand claps over 1.4s)
        try {
          const sampleRate = this.ctx.sampleRate;
          const noiseBuffer = this.ctx.createBuffer(1, sampleRate * 0.08, sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const clapCount = 24;
          for (let i = 0; i < clapCount; i++) {
            const delay = 0.12 + (i * 0.048) + (Math.random() * 0.05);
            const clapTime = now + delay;

            const noiseSrc = this.ctx.createBufferSource();
            noiseSrc.buffer = noiseBuffer;

            const clapFilter = this.ctx.createBiquadFilter();
            clapFilter.type = 'bandpass';
            clapFilter.frequency.setValueAtTime(1100 + (Math.random() * 1100), clapTime);
            clapFilter.Q.setValueAtTime(1.8 + Math.random() * 0.8, clapTime);

            const clapGain = this.ctx.createGain();
            const clapVol = 0.15 + (Math.random() * 0.12);
            clapGain.gain.setValueAtTime(0.001, clapTime);
            clapGain.gain.linearRampToValueAtTime(clapVol, clapTime + 0.004);
            clapGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.035 + (Math.random() * 0.025));

            noiseSrc.connect(clapFilter);
            clapFilter.connect(clapGain);
            clapGain.connect(this.sfxGain);

            noiseSrc.start(clapTime);
            noiseSrc.stop(clapTime + 0.07);
          }
        } catch(e) {}

        // 4. Cheerful Musical Sparkle Chime (C5, E5, G5, C6)
        try {
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.20, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.24);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.25);
          });
        } catch(e) {}
      }

      /* Sorrowful "Ooooo" for Wrong Answers */
      playWrong() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Spoken gentle sorrow "Oh nooo" via SpeechSynthesis
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance("Oh noooo");
            utter.pitch = 0.78;
            utter.rate = 0.85;
            utter.volume = 0.90;
            window.speechSynthesis.speak(utter);
          }
        } catch(e) {}

        // 2. Synthesized Cartoon Sorrow Descending "Ooooo..." in Web Audio
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(265, now);
          osc.frequency.exponentialRampToValueAtTime(105, now + 1.25);

          lfo.frequency.setValueAtTime(5.5, now);
          lfoGain.gain.setValueAtTime(8, now);
          lfo.connect(osc.frequency);
          lfo.start(now);
          lfo.stop(now + 1.3);

          filter.type = 'bandpass';
          filter.Q.setValueAtTime(3.2, now);
          filter.frequency.setValueAtTime(440, now);
          filter.frequency.exponentialRampToValueAtTime(290, now + 1.25);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.26, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);

          osc.start(now);
          osc.stop(now + 1.28);
        } catch(e) {}

        // 3. Sub-bass mournful harmonic drone
        try {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(132, now);
          subOsc.frequency.exponentialRampToValueAtTime(65, now + 1.25);

          subGain.gain.setValueAtTime(0.18, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          subOsc.connect(subGain);
          subGain.connect(this.sfxGain);
          subOsc.start(now);
          subOsc.stop(now + 1.25);
        } catch(e) {}
      }

      playPowerup() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1700, this.ctx.currentTime + 0.26);
          gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.26);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.27);
        } catch(e) {}
      }

      playWarp() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.38);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.65);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300, now);
          filter.frequency.exponentialRampToValueAtTime(3600, now + 0.38);
          filter.frequency.exponentialRampToValueAtTime(400, now + 0.65);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.26, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.7);
        } catch(e) {}
      }

      playLaserZap() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2600, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.19);

          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.21);
        } catch(e) {}
      }

      playFreeze() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        try {
          [987.77, 1318.51, 1760.00, 2093.00].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0.18, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.48);
          });
        } catch(e) {}
      }

      playCoinTick() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1567.98, now);
          osc.frequency.setValueAtTime(2093.00, now + 0.06);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.18);
        } catch(e) {}
      }

      playStarSlam() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        try {
          // Low punch
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(38, now + 0.22);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.25);

          // High star chime
          const chime = this.ctx.createOscillator();
          const cGain = this.ctx.createGain();
          chime.type = 'sine';
          chime.frequency.setValueAtTime(1046.50, now);
          cGain.gain.setValueAtTime(0.25, now);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          chime.connect(cGain);
          cGain.connect(this.sfxGain);
          chime.start(now);
          chime.stop(now + 0.36);
        } catch(e) {}
      }

      playVictory() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const chords = [
            [523.25, 659.25, 783.99],
            [587.33, 739.99, 880.00],
            [659.25, 830.61, 987.77],
            [783.99, 987.77, 1174.66]
          ];
          chords.forEach((chord, cIdx) => {
            chord.forEach(freq => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, this.ctx.currentTime + cIdx * 0.15);
              gain.gain.setValueAtTime(0.22, this.ctx.currentTime + cIdx * 0.15);
              gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + cIdx * 0.15 + 0.35);
              osc.connect(gain);
              gain.connect(this.sfxGain);
              osc.start(this.ctx.currentTime + cIdx * 0.15);
              osc.stop(this.ctx.currentTime + cIdx * 0.15 + 0.36);
            });
          });
        } catch(e) {}
      }

      /* 2D Adventure Dog SFX */
      playJump() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.15);
        } catch(e) {}
      }

      playBonePickup() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880.00, now + 0.05);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.16);
        } catch(e) {}
      }

      playCrystalPickup() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          [1046.5, 1318.51, 1567.98].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.04);
            gain.gain.setValueAtTime(0.18, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.2);
          });
        } catch(e) {}
      }

      playStompPop() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          // Punchy upward cartoon pop
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(180, now);
          osc1.frequency.exponentialRampToValueAtTime(620, now + 0.1);
          gain1.gain.setValueAtTime(0.28, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc1.connect(gain1);
          gain1.connect(this.sfxGain);
          osc1.start(now);
          osc1.stop(now + 0.15);

          // Star sparkle chime
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1174.66, now + 0.05); // D6
          osc2.frequency.setValueAtTime(1567.98, now + 0.1);  // G6
          gain2.gain.setValueAtTime(0.18, now + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(now + 0.05);
          osc2.stop(now + 0.24);
        } catch(e) {}
      }

      playPlayerHurt() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.2);
        } catch(e) {}
      }

      playCosmicPulseFire() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(460, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(0.20, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.1);
        } catch(e) {}
      }

      playCosmicPulseHit() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          // Dual magical chime pop
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1318.51, now); // E6
          gain1.gain.setValueAtTime(0.22, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc1.connect(gain1);
          gain1.connect(this.sfxGain);
          osc1.start(now);
          osc1.stop(now + 0.2);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1760.00, now + 0.03); // A6
          gain2.gain.setValueAtTime(0.18, now + 0.03);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(now + 0.03);
          osc2.stop(now + 0.24);
        } catch(e) {}
      }

      playArmoredHit() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          // Crisp sci-fi metallic armor clink
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.06);
          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.18);
        } catch(e) {}
      }

      playArmoredBreak() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          // Resonant crystalline armor shatter chime
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1046.50, now); // C6
          osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08); // G6
          gain1.gain.setValueAtTime(0.26, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc1.connect(gain1);
          gain1.connect(this.sfxGain);
          osc1.start(now);
          osc1.stop(now + 0.26);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(523.25, now);
          osc2.frequency.exponentialRampToValueAtTime(261.63, now + 0.15);
          gain2.gain.setValueAtTime(0.20, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(now);
          osc2.stop(now + 0.24);
        } catch(e) {}
      }

      playArmoredStompBlocked() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          // Springy metallic deflection tone
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.16);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.24);
        } catch(e) {}
      }

      playTouchPress() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.06);
        } catch(e) {}
      }

      playGeyserCharge() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(520, now + 0.22);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.25);
        } catch(e) {}
      }

      playGeyserBurst() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(320, now);
          osc1.frequency.exponentialRampToValueAtTime(960, now + 0.12);
          gain1.gain.setValueAtTime(0.26, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc1.connect(gain1);
          gain1.connect(this.sfxGain);
          osc1.start(now);
          osc1.stop(now + 0.3);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(640, now);
          osc2.frequency.exponentialRampToValueAtTime(1280, now + 0.16);
          gain2.gain.setValueAtTime(0.20, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(now);
          osc2.stop(now + 0.26);
        } catch(e) {}
      }

      playMeteorHit() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.24);
        } catch(e) {}
      }

      playWindGust() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(320, now + 0.18);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.38);
          gain.gain.setValueAtTime(0.10, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.4);
        } catch(e) {}
      }

      playTrenchFall() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.45);
          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.5);
        } catch(e) {}
      }

      playRockShake() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.setValueAtTime(95, now + 0.05);
          osc.frequency.setValueAtTime(110, now + 0.10);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.18);
        } catch(e) {}
      }

      playRockDrop() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.26);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.3);
        } catch(e) {}
      }

      playThornHit() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(540, now);
          osc.frequency.exponentialRampToValueAtTime(210, now + 0.14);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.2);
        } catch(e) {}
      }

      playPlatformMove() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.16);
        } catch(e) {}
      }

      playLevelComplete() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const notes = [440, 554.37, 659.25, 880, 1108.73];
          notes.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = this.ctx.currentTime + idx * 0.11;
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.24, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.45);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.48);
          });
        } catch(e) {}
      }

      playStatTick() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750 + Math.random() * 200, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.05);
        } catch(e) {}
      }

      playStarReveal(starIdx = 1) {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
          const baseFreq = freqs[Math.min(starIdx - 1, 2)] || 523.25;
          const now = this.ctx.currentTime;
          [baseFreq, baseFreq * 1.5].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.05);
            gain.gain.setValueAtTime(0.26, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.55);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.6);
          });
        } catch(e) {}
      }

      playPerfectResult() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.09);
            gain.gain.setValueAtTime(0.24, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.09 + 0.65);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.7);
          });
        } catch(e) {}
      }
    }

    /* Global Game State Store */
    const Sound = new UpbeatAudioEngine();
    window.Sound = Sound;

    const OLYMPIAD_SUBJECTS = {
      igko: {
        id: 'igko',
        name: 'General Knowledge (IGKO)',
        shortName: 'IGKO GK',
        icon: '🌍',
        badge: 'Cosmic Grandmaster',
        color: '#0284c7',
        sectors: [
          { id: 1, name: "Biosphere & Living World", icon: "🌿", badge: "Nature Scout", desc: "Flora, Fauna, Ecology & Earth" },
          { id: 2, name: "Cosmos & Human Ingenuity", icon: "🚀", badge: "Star Voyager", desc: "Space, Inventions, Civics & History" },
          { id: 3, name: "Culture, Sports & Logic", icon: "🏆", badge: "Logic Master", desc: "Literature, Languages, Olympics & Reasoning" },
          { id: 4, name: "Orbit of the Present (2024)", icon: "🛰️", badge: "Global Citizen", desc: "Chandrayaan-3, Nobel Prizes, T20 World Cup" },
          { id: 5, name: "Mind Mastery & HOTS Achievers", icon: "👑", badge: "Olympiad Titan", desc: "Life Skills, Cyber Safety, Match Discoveries & HOTS" }
        ],
        defaultQuestions: DEFAULT_QUESTIONS
      },
      iso: {
        id: 'iso',
        name: 'Science Olympiad (ISO)',
        shortName: 'ISO Science',
        icon: '🔬',
        badge: 'Science Grandmaster',
        color: '#16a34a',
        sectors: [
          { id: 1, name: "Logical Reasoning & Patterns", icon: "🧩", badge: "Logic Pioneer", desc: "Series, Codes, Directions & Puzzles" },
          { id: 2, name: "Living World, Food & Plants", icon: "🌱", badge: "Bio Explorer", desc: "Plants, Human Body, Food & Ecosystems" },
          { id: 3, name: "Physics, Motion & Electricity", icon: "⚡", badge: "Photon Master", desc: "Circuits, Motion, Shadows & Magnets" },
          { id: 4, name: "Matter, Magnets & Changes", icon: "🧪", badge: "Alchemist Titan", desc: "Reactions, Solutions, Fibres & Separation" },
          { id: 5, name: "Science Achievers & HOTS Mastery", icon: "🔬", badge: "Science Grandmaster", desc: "Advanced Experiments, Circuit Analysis & Multi-Steps" }
        ],
        defaultQuestions: ISO_QUESTIONS
      },
      ieo: {
        id: 'ieo',
        name: 'English Olympiad (IEO)',
        shortName: 'IEO English',
        icon: '📚',
        badge: 'Linguistic Titan',
        color: '#9333ea',
        sectors: [
          { id: 1, name: "Word Power & Vocabulary", icon: "📖", badge: "Lexicon Wizard", desc: "Nouns, Adjectives, Articles & Synonyms" },
          { id: 2, name: "Grammar & Sentence Structure", icon: "✒️", badge: "Grammar Guru", desc: "Tenses, Prepositions, Conjunctions & Voice" },
          { id: 3, name: "Reading Comprehension & Context", icon: "🔍", badge: "Story Navigator", desc: "Passages, Inferences, Themes & Poetry" },
          { id: 4, name: "Spoken & Written Expression", icon: "💬", badge: "Eloquent Voice", desc: "Dialogue Completion, Situational Nuances & Etiquette" },
          { id: 5, name: "English Achievers & HOTS Mastery", icon: "👑", badge: "Linguistic Titan", desc: "Complex Idioms, Proverbs, Phrasal Verbs & Error Spotting" }
        ],
        defaultQuestions: IEO_QUESTIONS
      }
    };
    window.OLYMPIAD_SUBJECTS = OLYMPIAD_SUBJECTS;

    function getActiveSectors() {
      const sub = gameState.currentSubject || 'igko';
      return OLYMPIAD_SUBJECTS[sub]?.sectors || OLYMPIAD_SUBJECTS.igko.sectors;
    }

    const BADGES = [
      { id: 'b1', name: 'Nature Scout', sector: 1, icon: '🌿', desc: 'Conquer the Biosphere & Living World' },
      { id: 'b2', name: 'Star Voyager', sector: 2, icon: '🚀', desc: 'Master Cosmos, History & Human Ingenuity' },
      { id: 'b3', name: 'Logic Master', sector: 3, icon: '🏆', desc: 'Triumph over Culture, Sports & Logic' },
      { id: 'b4', name: 'Global Citizen', sector: 4, icon: '🛰️', desc: 'Excel in Orbit of the Present 2024' },
      { id: 'b5', name: 'Olympiad Titan', sector: 5, icon: '👑', desc: 'Achieve victory in Life Skills & HOTS' },
      { id: 'b6', name: 'Cosmic Grandmaster', sector: 'all', icon: '🌟', desc: 'Clear all 5 sectors with high honor' }
    ];

    let gameState = {
      playerName: 'Cadet Alex',
      avatar: 'fox',
      avatarEmoji: '🦊',
      currentSubject: 'igko',
      subjectsProgress: {
        igko: { stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, highScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        iso: { stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, highScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        ieo: { stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, highScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
      },
      totalScore: 0,
      sectorStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sectorHighScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      adventureLevels: {
        1: { unlocked: true, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
        2: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
        3: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 }
      },
      unlockedBadges: [],
      currentSector: 1,
      currentQuestionIndex: 0,
      sectorQuestions: [],
      sectorScore: 0,
      sectorCorrectCount: 0,
      currentStreak: 0,
      bestSectorStreak: 0,
      powerups: {
        laser: 1,
        hint: 3, // 3 hints per sector
        time: 1
      },
      activeQuestionAnswered: false,
      questionsBank: DEFAULT_QUESTIONS
    };
    window.gameState = gameState;

    /* Load from localStorage if present */
    function loadSavedQuestions() {
      const sub = gameState.currentSubject || 'igko';
      const defaultQs = OLYMPIAD_SUBJECTS[sub]?.defaultQuestions || DEFAULT_QUESTIONS;
      try {
        const custom = localStorage.getItem(`cosmic_quest_questions_${sub}`);
        if (custom) {
          const parsed = JSON.parse(custom);
          if (Array.isArray(parsed) && parsed.length >= defaultQs.length) {
            gameState.questionsBank = parsed;
            return;
          }
        }
      } catch(e) {}
      gameState.questionsBank = [...defaultQs];
    }

    function switchOlympiadSubject(subKey) {
      if (!OLYMPIAD_SUBJECTS[subKey]) return;
      stopSpeech();
      gameState.currentSubject = subKey;
      loadSavedQuestions();

      // Sync progress for subject
      if (!gameState.subjectsProgress[subKey]) {
        gameState.subjectsProgress[subKey] = { stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, highScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }
      gameState.sectorStars = gameState.subjectsProgress[subKey].stars;
      gameState.sectorHighScores = gameState.subjectsProgress[subKey].highScores;

      // Update pills in Welcome, Title Screen, and Map
      document.querySelectorAll('.olympiad-pill-btn, .map-subj-btn, .title-topic-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.subject === subKey);
      });

      // Clear Adventure used question cache when switching subjects
      if (window.AdventureState && window.AdventureState.usedQuestionIds) {
        window.AdventureState.usedQuestionIds.clear();
      }
      saveState();

      // Update Map Header
      const subInfo = OLYMPIAD_SUBJECTS[subKey];
      const titleEl = document.getElementById('map-subject-title');
      if (titleEl) titleEl.textContent = `Mission Control: ${subInfo.name}`;
      const subtitleEl = document.getElementById('map-subject-subtitle');
      if (subtitleEl) subtitleEl.textContent = `Select a planetary sector to explore and conquer all ${gameState.questionsBank.length} questions!`;

      renderSectorMap();
      updateStudioCount();
      updateWelcomeSubtitle();

      // Mascot cheers on subject switch
      setSparkyMessage(`${subInfo.icon} <strong>${subInfo.name} Quest</strong> activated! Ready to conquer all ${gameState.questionsBank.length} questions, Cadet? 🚀`);
    }

    function updateWelcomeSubtitle() {
      const welcomeSub = document.getElementById('welcome-subtitle');
      if (welcomeSub) {
        const count = gameState.questionsBank.length;
        welcomeSub.textContent = `Embark on an epic adventure across 5 planetary sectors! Solve ${count} Olympiad questions, unleash floating power-ups, earn cosmic stars, and win your Champion Certificate!`;
      }
    }

    function loadSavedState() {
      try {
        const saved = localStorage.getItem('cosmic_quest_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.playerName) gameState.playerName = parsed.playerName;
          if (parsed.avatar) gameState.avatar = parsed.avatar;
          if (parsed.avatarEmoji) gameState.avatarEmoji = parsed.avatarEmoji;
          if (parsed.currentSubject && OLYMPIAD_SUBJECTS[parsed.currentSubject]) gameState.currentSubject = parsed.currentSubject;
          if (parsed.subjectsProgress) gameState.subjectsProgress = parsed.subjectsProgress;
          if (parsed.totalScore) gameState.totalScore = parsed.totalScore;
          if (parsed.unlockedBadges) gameState.unlockedBadges = parsed.unlockedBadges;
          if (parsed.adventureLevels) gameState.adventureLevels = parsed.adventureLevels;
        }
      } catch(e) {}

      loadSavedQuestions();
      const currentProg = gameState.subjectsProgress[gameState.currentSubject] || { stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, highScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      gameState.sectorStars = currentProg.stars;
      gameState.sectorHighScores = currentProg.highScores;

      // Sync active pills and map headers
      document.querySelectorAll('.olympiad-pill-btn, .map-subj-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.subject === gameState.currentSubject);
      });
      const subInfo = OLYMPIAD_SUBJECTS[gameState.currentSubject] || OLYMPIAD_SUBJECTS.igko;
      const titleEl = document.getElementById('map-subject-title');
      if (titleEl) titleEl.textContent = `Mission Control: ${subInfo.name}`;
      const subtitleEl = document.getElementById('map-subject-subtitle');
      if (subtitleEl) subtitleEl.textContent = `Select a planetary sector to explore and conquer all ${gameState.questionsBank.length} questions!`;
      updateWelcomeSubtitle();
    }

    function saveState() {
      try {
        if (!gameState.subjectsProgress[gameState.currentSubject]) {
          gameState.subjectsProgress[gameState.currentSubject] = { stars: gameState.sectorStars, highScores: gameState.sectorHighScores };
        } else {
          gameState.subjectsProgress[gameState.currentSubject].stars = gameState.sectorStars;
          gameState.subjectsProgress[gameState.currentSubject].highScores = gameState.sectorHighScores;
        }

        const toSave = {
          playerName: gameState.playerName,
          avatar: gameState.avatar,
          avatarEmoji: gameState.avatarEmoji,
          currentSubject: gameState.currentSubject,
          subjectsProgress: gameState.subjectsProgress,
          totalScore: gameState.totalScore,
          unlockedBadges: gameState.unlockedBadges,
          adventureLevels: gameState.adventureLevels
        };
        localStorage.setItem('cosmic_quest_state', JSON.stringify(toSave));
      } catch(e) {}
    }

    /* ========================================================
       PLAN 2: TEXT-TO-SPEECH READ ALOUD (NATURAL FEMALE VOICE)
       ======================================================== */
    let isSpeaking = false;

    function getBestNaturalFemaleVoice() {
      if (!('speechSynthesis' in window)) return null;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      // 1. Check user custom selection from Settings
      const savedPref = localStorage.getItem('cosmic_quest_voice');
      if (savedPref && savedPref !== 'auto') {
        const customVoice = voices.find(v => v.voiceURI === savedPref || v.name === savedPref);
        if (customVoice) return customVoice;
      }

      // 2. High-quality neural / natural Google UK English Female or Google US English
      const googleFemale = voices.find(v => 
        v.name.includes('Google UK English Female') || 
        (v.name.includes('Google') && v.name.toLowerCase().includes('female'))
      );
      if (googleFemale) return googleFemale;

      // 3. Apple/System natural female voices: Samantha, Flo, Karen, Moira, Tessa, Tara, Shelley
      const topFemaleNames = ['Samantha', 'Flo (English (United States))', 'Flo', 'Karen', 'Moira', 'Tessa', 'Tara', 'Victoria', 'Serena', 'Shelley', 'Sandy', 'Kathy'];
      for (const name of topFemaleNames) {
        const found = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
        if (found) return found;
      }

      // 4. Any voice with "Female" in the name
      const anyFemale = voices.find(v => 
        v.name.toLowerCase().includes('female') && v.lang.startsWith('en')
      );
      if (anyFemale) return anyFemale;

      // 5. Microsoft Natural (Jenny / Aria) on Windows / Edge
      const msNatural = voices.find(v => 
        (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Natural')) && 
        v.lang.startsWith('en')
      );
      if (msNatural) return msNatural;

      // 6. Clean English voice (non-novelty)
      const noveltyList = ['bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester', 'organ', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox', 'fred', 'albert'];
      const cleanEnglish = voices.find(v => 
        v.lang.startsWith('en') && !noveltyList.some(n => v.name.toLowerCase().includes(n))
      );
      if (cleanEnglish) return cleanEnglish;

      return voices[0];
    }

    function populateVoiceList() {
      const select = document.getElementById('settings-voice-select');
      if (!select || !('speechSynthesis' in window)) return;
      
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const currentSaved = localStorage.getItem('cosmic_quest_voice') || 'auto';
      const bestFemale = getBestNaturalFemaleVoice();

      select.innerHTML = '';

      // Auto Option
      const autoOpt = document.createElement('option');
      autoOpt.value = 'auto';
      autoOpt.textContent = `🌸 Auto-Selected Best Female: ${bestFemale ? bestFemale.name : 'Natural Female'}`;
      select.appendChild(autoOpt);

      // Filter English voices
      const noveltyList = ['bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester', 'organ', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox'];
      const englishVoices = voices.filter(v => v.lang.startsWith('en') && !noveltyList.some(n => v.name.toLowerCase().includes(n)));

      // Known female names to tag
      const knownFemale = ['samantha', 'karen', 'flo', 'moira', 'tessa', 'tara', 'shelley', 'sandy', 'kathy', 'victoria', 'serena', 'female', 'jenny', 'aria', 'grandma'];

      englishVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI || v.name;
        const isFem = knownFemale.some(f => v.name.toLowerCase().includes(f));
        opt.textContent = `${isFem ? '👩 ' : '🎙️ '}${v.name} (${v.lang})${isFem ? ' — Female' : ''}`;
        select.appendChild(opt);
      });

      select.value = currentSaved;

      const currentLabel = document.getElementById('current-voice-label');
      if (currentLabel) {
        currentLabel.textContent = `Active: ${bestFemale ? bestFemale.name : 'Natural Female'}`;
      }
    }

    function testVoiceSample() {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const sampleText = "Hello Cadet! I will be your navigator and read all questions clearly for you. Are you ready for the mission?";
      const utterance = new SpeechSynthesisUtterance(sampleText);
      const chosenVoice = getBestNaturalFemaleVoice();
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      }
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    function stopSpeech() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isSpeaking = false;
      const btn = document.getElementById('btn-read-aloud');
      if (btn) {
        btn.classList.remove('speaking');
        const icon = btn.querySelector('.tts-icon');
        if (icon) icon.textContent = '🔊';
        const text = btn.querySelector('.tts-text');
        if (text) text.textContent = 'Read to Me';
      }
    }

    function toggleReadAloud() {
      if (!('speechSynthesis' in window)) {
        alert("Text-to-speech is not supported in this browser.");
        return;
      }
      if (isSpeaking) {
        stopSpeech();
        return;
      }

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      if (!q) return;

      window.speechSynthesis.cancel();
      isSpeaking = true;
      const btn = document.getElementById('btn-read-aloud');
      if (btn) {
        btn.classList.add('speaking');
        btn.querySelector('.tts-icon').textContent = '⏹️';
        btn.querySelector('.tts-text').textContent = 'Stop Reading';
      }

      // Natural speech script with conversational cadence and breath pauses
      let cleanStem = (q.question || '')
        .split(String.fromCharCode(10)).join(', ')
        .replace(/\\s+/g, ' ')
        .trim();

      const fullText = `${cleanStem}. ... ... Option A: ${q.options[0]}. ... Option B: ${q.options[1]}. ... Option C: ${q.options[2]}. ... Option D: ${q.options[3]}.`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      const chosenVoice = getBestNaturalFemaleVoice();
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      }
      utterance.rate = 0.92; // Articulate, warm, child-friendly pacing
      utterance.pitch = 1.05; // Warm, natural female pitch

      utterance.onend = () => stopSpeech();
      utterance.onerror = () => stopSpeech();

      window.speechSynthesis.speak(utterance);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    /* ========================================================
       PLAN 2: SPARKY THE ASTRO-BOT MASCOT COMPANION
       ======================================================== */
    const COSMIC_TRIVIA_FACTS = [
      "Did you know? One day on Venus is longer than its entire year!",
      "Did you know? Octopuses have three hearts and blue blood!",
      "Did you know? A teaspoon of a neutron star weighs about 6 billion tons!",
      "Did you know? Honey found in ancient Egyptian tombs 3,000 years ago is still edible!",
      "Did you know? There are more trees on Earth than stars in the Milky Way galaxy!",
      "Did you know? Lightning strikes Earth around 8 million times every single day!",
      "Did you know? Saturn's rings are made mostly of ice chunks and cosmic dust!",
      "Did you know? The blue whale's heart is as big as a small car!",
      "Did you know? Sound cannot travel in space because there is no air for vibrations!",
      "Did you know? Diamonds can literally rain on Neptune and Uranus!"
    ];

    let sparkyBubbleTimer = null;

    function isSparkyEnabled() {
      return localStorage.getItem('cosmic_quest_sparky') !== 'off';
    }

    function toggleSparkyVisibility(enabled) {
      if (enabled === undefined) {
        enabled = !isSparkyEnabled();
      }
      localStorage.setItem('cosmic_quest_sparky', enabled ? 'on' : 'off');
      const widget = document.getElementById('mascot-widget');
      if (widget) {
        widget.classList.toggle('hidden', !enabled);
      }
      updateSparkySettingsBtn();
      if (!enabled) {
        dismissSparkyBubble();
      }
    }

    function updateSparkySettingsBtn() {
      const btn = document.getElementById('btn-toggle-sparky-settings');
      if (btn) {
        const enabled = isSparkyEnabled();
        btn.innerHTML = `<span>🤖 Sparky Mascot: ${enabled ? 'ON 🚀' : 'OFF 💤'}</span>`;
        btn.style.borderColor = enabled ? '#38bdf8' : '#cbd5e1';
        btn.style.color = enabled ? '#0284c7' : '#64748b';
      }
    }

    function setSparkyMessage(msg) {
      if (!isSparkyEnabled()) return;
      const bubble = document.getElementById('mascot-bubble');
      const msgEl = document.getElementById('mascot-message');
      if (!bubble || !msgEl) return;
      msgEl.innerHTML = msg;
      bubble.style.display = 'block';
      bubble.style.opacity = '1';
      bubble.style.pointerEvents = 'auto';
      bubble.style.animation = 'none';
      bubble.offsetHeight; // trigger reflow
      bubble.style.animation = 'bounceIn 0.35s ease-out';

      // Auto-dismiss bubble after 4.2 seconds so it never hinders options or mobile screen
      if (sparkyBubbleTimer) clearTimeout(sparkyBubbleTimer);
      sparkyBubbleTimer = setTimeout(() => {
        dismissSparkyBubble();
      }, 4200);
    }

    function dismissSparkyBubble() {
      if (sparkyBubbleTimer) {
        clearTimeout(sparkyBubbleTimer);
        sparkyBubbleTimer = null;
      }
      const bubble = document.getElementById('mascot-bubble');
      if (!bubble) return;
      bubble.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      bubble.style.opacity = '0';
      bubble.style.pointerEvents = 'none';
      setTimeout(() => {
        if (bubble.style.opacity === '0') {
          bubble.style.display = 'none';
        }
      }, 260);
    }

    function sparkyFunFact() {
      Sound.init();
      Sound.playVictory();
      const avatarBtn = document.getElementById('mascot-avatar-btn');
      if (avatarBtn) {
        avatarBtn.style.transform = 'scale(1.15) rotate(360deg)';
        setTimeout(() => {
          avatarBtn.style.transform = '';
        }, 500);
      }
      const randomFact = COSMIC_TRIVIA_FACTS[Math.floor(Math.random() * COSMIC_TRIVIA_FACTS.length)];
      setSparkyMessage(`🌟 <strong>Sparky's Cosmic Fact:</strong><br>${randomFact}`);
    }

    /* Screen Transitions */
    function showScreen(screenId) {
      if (screenId !== 'screen-game') {
        stopQuestionTimer();
      }
      stopSpeech();
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Manage adventure-mode-active body class for true edge-to-edge fullscreen
      if (screenId === 'screen-adventure') {
        document.body.classList.add('adventure-mode-active');
      } else {
        document.body.classList.remove('adventure-mode-active');
      }

      if (screenId === 'screen-welcome') {
        if (typeof updateTitleScreenState === 'function') {
          updateTitleScreenState();
        }
        if (typeof window.initTitleBackground === 'function') {
          window.initTitleBackground();
        }
      }

      // Show/Hide Sub-Header Capsule only during Question Gameplay
      const subHud = document.getElementById('sub-hud-capsule');
      if (screenId === 'screen-game') {
        subHud.style.display = 'flex';
      } else {
        subHud.style.display = 'none';
      }

      updateGlobalNav();
    }
    window.showScreen = showScreen;

    function updateGlobalNav() {
      const totalStars = Object.values(gameState.sectorStars).reduce((a, b) => a + b, 0);
      const navStars = document.getElementById('nav-total-stars');
      if (navStars) navStars.textContent = `${totalStars}/15`;
      const navScore = document.getElementById('nav-total-score');
      if (navScore) navScore.textContent = gameState.totalScore.toLocaleString();
    }

    /* Modal Helpers */
    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('active');
    }

    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    }

    /* ========================================================
       AVATAR & ONBOARDING
       ======================================================== */
    const AVATAR_MAP = {
      fox: '🦊',
      owl: '🦉',
      bear: '🐻',
      dragon: '🐲'
    };

    document.querySelectorAll('.avatar-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        document.querySelectorAll('.avatar-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        gameState.avatar = tile.dataset.avatar;
        gameState.avatarEmoji = AVATAR_MAP[gameState.avatar] || '🦊';
      });
    });

    const startQuestBtn = document.getElementById('btn-start-quest');
    if (startQuestBtn) {
      startQuestBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const nameInputEl = document.getElementById('player-name-input');
        const nameInput = nameInputEl ? nameInputEl.value.trim() : '';
        if (nameInput) {
          gameState.playerName = nameInput;
        }
        saveState();
        renderSectorMap();
        showScreen('screen-map');
      });
    }

    function toggleAdventureFullscreen(forceEnter = false) {
      const docEl = document.documentElement;
      const isCurrentlyFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (forceEnter || !isCurrentlyFs) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }

    function exitAdventureFullscreen() {
      document.body.classList.remove('adventure-mode-active');
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }

    function startAdventureLevel(levelNum = 1) {
      Sound.init();
      Sound.playClick();
      loadSavedQuestions();
      toggleAdventureFullscreen(true);
      if (window.CosmicAdventureEngine) {
        window.CosmicAdventureEngine.startAdventure(levelNum);
      }
    }
    window.startAdventureLevel = startAdventureLevel;

    function renderAdventureLevelSelect() {
      const grid = document.getElementById('adventure-levels-grid');
      const totalStarsEl = document.getElementById('adv-select-total-stars');
      if (!grid) return;

      const levelsConfig = [
        {
          id: 1,
          name: "Nebula Plains",
          biome: "Open Starry Wilderness",
          desc: "Run across the stellar plains, overcome knowledge gates, and reach the ancient glowing Cave Portal.",
          bgGrad: "linear-gradient(135deg, rgba(30, 58, 138, 0.75), rgba(15, 23, 42, 0.92))",
          accentColor: "#38bdf8",
          icon: "🌌",
          totalBones: 10
        },
        {
          id: 2,
          name: "Crystal Caverns",
          biome: "Deep Amethyst Depths",
          desc: "Descend into glowing underground caverns with floating platforms, crystal clusters, and moving elevators.",
          bgGrad: "linear-gradient(135deg, rgba(88, 28, 135, 0.75), rgba(15, 23, 42, 0.92))",
          accentColor: "#c084fc",
          icon: "🔮",
          totalBones: 12
        },
        {
          id: 3,
          name: "Starlight Summit",
          biome: "Celestial Cloud Citadel",
          desc: "Ascend to celestial heights across moving cloud elevators to awaken the Grand Cosmic Beacon.",
          bgGrad: "linear-gradient(135deg, rgba(3, 105, 161, 0.75), rgba(15, 23, 42, 0.92))",
          accentColor: "#0284c7",
          icon: "☁️",
          totalBones: 15
        }
      ];

      if (!gameState.adventureLevels) {
        gameState.adventureLevels = {
          1: { unlocked: true, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
          2: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
          3: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 }
        };
      }

      let totalStars = 0;
      let totalBones = 0;
      let totalDiamonds = 0;
      Object.values(gameState.adventureLevels).forEach(lvl => {
        totalStars += (lvl.stars || 0);
        totalBones += (lvl.bones || 0);
        totalDiamonds += (lvl.diamonds || 0);
      });

      if (totalStarsEl) {
        totalStarsEl.innerHTML = `<span>⭐ Stars: <strong>${totalStars} / 9</strong> &nbsp;|&nbsp; 💎 Diamonds: <strong>${totalDiamonds} / 9</strong> &nbsp;|&nbsp; 🦴 Bones: <strong>${totalBones}</strong></span>`;
      }

      grid.innerHTML = '';
      levelsConfig.forEach(lvl => {
        const lvlData = gameState.adventureLevels[lvl.id] || { unlocked: (lvl.id === 1), stars: 0, highScore: 0, bones: 0, diamonds: 0 };
        const isUnlocked = !!lvlData.unlocked;
        const starsCount = lvlData.stars || 0;

        let starsHtml = '';
        for (let s = 1; s <= 3; s++) {
          starsHtml += `<span class="star-icon ${s <= starsCount ? 'filled' : ''}">⭐</span>`;
        }

        const card = document.createElement('div');
        card.className = `adv-level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.style.background = lvl.bgGrad;
        card.style.borderColor = isUnlocked ? lvl.accentColor : 'rgba(100, 116, 139, 0.35)';

        card.innerHTML = `
          <div class="adv-card-top">
            <span class="adv-card-biome-badge" style="color: ${lvl.accentColor}; background: rgba(255,255,255,0.08);">
              ${lvl.icon} ${lvl.biome}
            </span>
            <div class="adv-card-stars">${starsHtml}</div>
          </div>

          <div class="adv-card-body">
            <h3 class="adv-card-title">Level ${lvl.id}: ${lvl.name}</h3>
            <p class="adv-card-desc">${lvl.desc}</p>
          </div>

          <div class="adv-card-stats">
            <div class="adv-card-stat-item">
              <span class="stat-label">Diamonds</span>
              <span class="stat-val">${lvlData.diamonds || 0}/3 💎</span>
            </div>
            <div class="adv-card-stat-item">
              <span class="stat-label">Bones</span>
              <span class="stat-val">${lvlData.bones || 0}/${lvl.totalBones} 🦴</span>
            </div>
            <div class="adv-card-stat-item">
              <span class="stat-label">High Score</span>
              <span class="stat-val">${(lvlData.highScore || 0).toLocaleString()} PTS</span>
            </div>
          </div>

          <div class="adv-card-footer">
            ${isUnlocked ? `
              <button class="btn btn-primary adv-play-level-btn" style="width: 100%; background: linear-gradient(135deg, ${lvl.accentColor}, #4f46e5);" data-level="${lvl.id}">
                <span>Play Level ${lvl.id} ▶</span>
              </button>
            ` : `
              <div class="adv-locked-badge">
                <span>🔒 Complete Level ${lvl.id - 1} to Unlock</span>
              </div>
            `}
          </div>
        `;

        if (isUnlocked) {
          const playBtn = card.querySelector('.adv-play-level-btn');
          if (playBtn) {
            playBtn.addEventListener('click', () => {
              startAdventureLevel(lvl.id);
            });
          }
        }

        grid.appendChild(card);
      });
    }
    window.renderAdventureLevelSelect = renderAdventureLevelSelect;

    function hasSavedAdventureProgress() {
      if (!gameState || !gameState.adventureLevels) return false;
      const l1 = gameState.adventureLevels[1];
      const l2 = gameState.adventureLevels[2];
      const l3 = gameState.adventureLevels[3];
      return (l1 && (l1.stars > 0 || l1.highScore > 0 || l1.bones > 0 || l1.diamonds > 0)) ||
             (l2 && l2.unlocked) || (l3 && l3.unlocked);
    }

    function updateTitleScreenState() {
      const hasProgress = hasSavedAdventureProgress();
      const contBtn = document.getElementById('btn-title-continue');
      if (contBtn) {
        contBtn.style.display = hasProgress ? 'flex' : 'none';
      }
      const curSub = gameState.currentSubject || 'igko';
      document.querySelectorAll('.title-topic-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subject === curSub);
      });
    }
    window.updateTitleScreenState = updateTitleScreenState;

    // Title Screen Button: NEW GAME
    const titleNewGameBtn = document.getElementById('btn-title-new-game');
    if (titleNewGameBtn) {
      titleNewGameBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        if (hasSavedAdventureProgress()) {
          const confirmModal = document.getElementById('modal-confirm-new-game');
          if (confirmModal) confirmModal.style.display = 'flex';
        } else {
          startAdventureLevel(1);
        }
      });
    }

    // New Game Confirmation Handlers
    const newGameProceedBtn = document.getElementById('btn-newgame-proceed');
    if (newGameProceedBtn) {
      newGameProceedBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const confirmModal = document.getElementById('modal-confirm-new-game');
        if (confirmModal) confirmModal.style.display = 'none';
        // Reset only adventure progress
        gameState.adventureLevels = {
          1: { unlocked: true, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
          2: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
          3: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 }
        };
        saveState();
        startAdventureLevel(1);
      });
    }

    const newGameCancelBtn = document.getElementById('btn-newgame-cancel');
    if (newGameCancelBtn) {
      newGameCancelBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const confirmModal = document.getElementById('modal-confirm-new-game');
        if (confirmModal) confirmModal.style.display = 'none';
      });
    }

    // Title Screen Button: CONTINUE
    const titleContinueBtn = document.getElementById('btn-title-continue');
    if (titleContinueBtn) {
      titleContinueBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        let contLvl = 1;
        if (gameState.adventureLevels && gameState.adventureLevels[3] && gameState.adventureLevels[3].unlocked) contLvl = 3;
        else if (gameState.adventureLevels && gameState.adventureLevels[2] && gameState.adventureLevels[2].unlocked) contLvl = 2;
        startAdventureLevel(contLvl);
      });
    }

    // Title Screen Button: SETTINGS
    const titleSettingsBtn = document.getElementById('btn-title-settings');
    if (titleSettingsBtn) {
      titleSettingsBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const modal = document.getElementById('modal-game-settings');
        if (modal) modal.style.display = 'flex';
      });
    }

    // Title Screen Button: LEVELS
    const titleLevelsBtn = document.getElementById('btn-title-levels');
    if (titleLevelsBtn) {
      titleLevelsBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        renderAdventureLevelSelect();
        showScreen('screen-adventure-select');
      });
    }

    // Title Screen Discreet Links: Classic Quiz & Question Studio
    const titleClassicBtn = document.getElementById('btn-title-classic-quiz');
    if (titleClassicBtn) {
      titleClassicBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        renderSectorMap();
        showScreen('screen-map');
      });
    }

    const titleStudioBtn = document.getElementById('btn-title-studio');
    if (titleStudioBtn) {
      titleStudioBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        showScreen('screen-studio');
      });
    }

    // Settings Modal Handlers
    const gameSettingsCloseBtn = document.getElementById('btn-game-settings-close');
    if (gameSettingsCloseBtn) {
      gameSettingsCloseBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const modal = document.getElementById('modal-game-settings');
        if (modal) modal.style.display = 'none';
      });
    }

    const toggleMusicBtn = document.getElementById('toggle-opt-music');
    if (toggleMusicBtn) {
      toggleMusicBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        Sound.musicEnabled = !Sound.musicEnabled;
        toggleMusicBtn.textContent = Sound.musicEnabled ? 'ON' : 'OFF';
        toggleMusicBtn.classList.toggle('off', !Sound.musicEnabled);
        if (!Sound.musicEnabled) {
          Sound.stopMusic();
        } else {
          Sound.playMusic();
        }
      });
    }

    const toggleSfxBtn = document.getElementById('toggle-opt-sfx');
    if (toggleSfxBtn) {
      toggleSfxBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        Sound.sfxEnabled = !Sound.sfxEnabled;
        toggleSfxBtn.textContent = Sound.sfxEnabled ? 'ON' : 'OFF';
        toggleSfxBtn.classList.toggle('off', !Sound.sfxEnabled);
      });
    }

    const toggleFsBtn = document.getElementById('toggle-opt-fullscreen');
    if (toggleFsBtn) {
      toggleFsBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        toggleAdventureFullscreen();
      });
    }

    const toggleMotionBtn = document.getElementById('toggle-opt-motion');
    if (toggleMotionBtn) {
      toggleMotionBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const isReduced = document.body.classList.toggle('reduced-motion');
        toggleMotionBtn.textContent = isReduced ? 'ON' : 'OFF';
        toggleMotionBtn.classList.toggle('off', !isReduced);
      });
    }

    // In-Game Pause Menu & Navigation Handlers
    const advPauseBtn = document.getElementById('btn-adv-pause');
    const advHomeBtn = document.getElementById('btn-adv-home');
    const advPauseModal = document.getElementById('modal-adventure-pause');
    const btnPauseResume = document.getElementById('btn-pause-resume');
    const btnPauseRestart = document.getElementById('btn-pause-restart');
    const btnPauseSettings = document.getElementById('btn-pause-settings');
    const btnPauseLevelMap = document.getElementById('btn-pause-level-map');
    const btnPauseExit = document.getElementById('btn-pause-exit');

    function openAdventurePauseMenu() {
      Sound.init();
      Sound.playClick();
      if (window.AdventureState) window.AdventureState.isPaused = true;
      if (window.currentAdventureScene && window.currentAdventureScene.physics && window.currentAdventureScene.physics.world) {
        window.currentAdventureScene.physics.world.pause();
      } else if (window.CosmicAdventureEngine && window.CosmicAdventureEngine.game) {
        const scenes = window.CosmicAdventureEngine.game.scene.scenes;
        if (scenes) {
          scenes.forEach(s => {
            if (s.physics && s.physics.world) s.physics.world.pause();
          });
        }
      }
      if (advPauseModal) advPauseModal.style.display = 'flex';
    }

    function resumeAdventureFromPause() {
      Sound.init();
      Sound.playClick();
      if (advPauseModal) advPauseModal.style.display = 'none';
      if (window.currentAdventureScene && window.currentAdventureScene.physics && window.currentAdventureScene.physics.world) {
        window.currentAdventureScene.physics.world.resume();
      } else if (window.CosmicAdventureEngine && window.CosmicAdventureEngine.game) {
        const scenes = window.CosmicAdventureEngine.game.scene.scenes;
        if (scenes) {
          scenes.forEach(s => {
            if (s.physics && s.physics.world) s.physics.world.resume();
          });
        }
      }
      if (window.AdventureState) window.AdventureState.isPaused = false;
    }

    function returnAdventureToMainMenu() {
      Sound.init();
      Sound.playClick();
      if (window.AdventureState) window.AdventureState.isPaused = true;
      if (window.currentAdventureScene && window.currentAdventureScene.physics && window.currentAdventureScene.physics.world) {
        window.currentAdventureScene.physics.world.pause();
      }
      if (advPauseModal) advPauseModal.style.display = 'none';
      exitAdventureFullscreen();
      updateTitleScreenState();
      showScreen('screen-welcome');
    }

    if (advPauseBtn) advPauseBtn.addEventListener('click', openAdventurePauseMenu);
    if (advHomeBtn) advHomeBtn.addEventListener('click', returnAdventureToMainMenu);
    if (btnPauseResume) btnPauseResume.addEventListener('click', resumeAdventureFromPause);
    if (btnPauseExit) btnPauseExit.addEventListener('click', returnAdventureToMainMenu);

    // Escape or P keyboard shortcuts for pause
    window.addEventListener('keydown', (e) => {
      const advScreen = document.getElementById('screen-adventure');
      if (advScreen && advScreen.classList.contains('active')) {
        const gateModal = document.getElementById('adv-gate-modal');
        if (gateModal && gateModal.style.display === 'flex') return;
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          if (advPauseModal && advPauseModal.style.display === 'flex') {
            resumeAdventureFromPause();
          } else {
            openAdventurePauseMenu();
          }
        }
      }
    });

    // Wire Title Screen Topic Selection Pills (GK, Science, English)
    document.querySelectorAll('.title-topic-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.dataset.subject;
        if (sub) {
          Sound.init();
          Sound.playClick();
          switchOlympiadSubject(sub);
        }
      });
    });

    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        if (advPauseModal) advPauseModal.style.display = 'none';
        const curLvl = (window.AdventureState && window.AdventureState.currentLevel) || 1;
        startAdventureLevel(curLvl);
      });
    }
    if (btnPauseSettings) {
      btnPauseSettings.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const settingsModal = document.getElementById('modal-game-settings');
        if (settingsModal) settingsModal.style.display = 'flex';
      });
    }
    if (btnPauseLevelMap) {
      btnPauseLevelMap.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        if (advPauseModal) advPauseModal.style.display = 'none';
        exitAdventureFullscreen();
        renderAdventureLevelSelect();
        showScreen('screen-adventure-select');
      });
    }

    const advSelectBackBtn = document.getElementById('btn-adv-select-back');
    if (advSelectBackBtn) {
      advSelectBackBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        updateTitleScreenState();
        showScreen('screen-welcome');
      });
    }

    // Help / Controls Guide Toast Handlers
    const advHelpToggleBtn = document.getElementById('btn-adv-help-toggle');
    const advToast = document.getElementById('adv-toast');
    const advToastCloseBtn = document.getElementById('btn-adv-toast-close');

    if (advHelpToggleBtn && advToast) {
      advHelpToggleBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        advToast.classList.toggle('toast-hidden');
      });
    }

    if (advToastCloseBtn && advToast) {
      advToastCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Sound.init();
        Sound.playClick();
        advToast.classList.add('toast-hidden');
      });
    }

    const advReplayBtn = document.getElementById('btn-adv-replay');
    if (advReplayBtn) {
      advReplayBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const curLvl = (window.AdventureState && window.AdventureState.currentLevel) || 1;
        startAdventureLevel(curLvl);
      });
    }

    const advToLevelsBtn = document.getElementById('btn-adv-to-levels');
    if (advToLevelsBtn) {
      advToLevelsBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        exitAdventureFullscreen();
        renderAdventureLevelSelect();
        showScreen('screen-adventure-select');
      });
    }

    const advToClassicBtn = document.getElementById('btn-adv-to-classic');
    if (advToClassicBtn) {
      advToClassicBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        exitAdventureFullscreen();
        renderSectorMap();
        showScreen('screen-map');
      });
    }

    document.getElementById('btn-go-home').addEventListener('click', () => {
      Sound.init();
      Sound.playClick();
      renderSectorMap();
      showScreen('screen-map');
    });

    /* ========================================================
       SECTOR MAP RENDERING
       ======================================================== */
    const SECTOR_METADATA = [
      { id: 1, name: "Biosphere & Living World", icon: "🌿", badge: "Nature Scout", desc: "Flora, Fauna, Ecology & Earth" },
      { id: 2, name: "Cosmos & Human Ingenuity", icon: "🚀", badge: "Star Voyager", desc: "Space, Inventions, Civics & History" },
      { id: 3, name: "Culture, Sports & Logic", icon: "🏆", badge: "Logic Master", desc: "Literature, Languages, Olympics & Reasoning" },
      { id: 4, name: "Orbit of the Present (2024)", icon: "🛰️", badge: "Global Citizen", desc: "Chandrayaan-3, Nobel Prizes, T20 World Cup" },
      { id: 5, name: "Mind Mastery & HOTS Achievers", icon: "👑", badge: "Olympiad Titan", desc: "Life Skills, Cyber Safety, Match Discoveries & HOTS" }
    ];

    function renderSectorMap() {
      const grid = document.getElementById('sector-grid');
      grid.innerHTML = '';

      let allCompleted = true;
      const currentSectors = getActiveSectors();

      currentSectors.forEach((sec, idx) => {
        const isUnlocked = sec.id === 1 || (gameState.sectorStars[sec.id - 1] > 0);
        const stars = gameState.sectorStars[sec.id] || 0;
        const isCompleted = stars > 0;
        if (!isCompleted) allCompleted = false;

        const card = document.createElement('div');
        card.className = `sector-card ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}`;

        let starsHtml = '';
        for (let s = 1; s <= 3; s++) {
          starsHtml += `<span class="star-icon ${s <= stars ? 'filled' : ''}">⭐</span>`;
        }

        const secQuestions = gameState.questionsBank.filter(q => (q.sector === sec.id || q.sectorId === sec.id));
        const qCount = secQuestions.length;

        card.innerHTML = `
          <div class="sector-main-info">
            <div class="sector-icon-box">${sec.icon}</div>
            <div class="sector-text-box">
              <h3>Sector ${sec.id}: ${sec.name}</h3>
              <p>${sec.desc} (${qCount} Questions)</p>
              <div class="sector-badge-tag">${sec.badge}</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            <div class="sector-stars-box">${isUnlocked ? starsHtml : '🔒 Locked'}</div>
            ${gameState.sectorHighScores[sec.id] ? `<span style="font-size:0.85rem; color:#0284c7; font-weight:800;">High: ${gameState.sectorHighScores[sec.id]}</span>` : ''}
          </div>
        `;

        if (isUnlocked) {
          card.addEventListener('click', () => {
            Sound.init();
            Sound.playClick();
            startSectorGame(sec.id);
          });
        }

        grid.appendChild(card);
      });

      // Show certificate button if all completed or total stars >= 10
      const totalStars = Object.values(gameState.sectorStars).reduce((a, b) => a + b, 0);
      document.getElementById('nav-total-stars').textContent = `${totalStars}/${currentSectors.length * 3}`;
      document.getElementById('nav-total-score').textContent = gameState.totalScore.toLocaleString();

      const certBtn = document.getElementById('btn-view-certificate');
      if (allCompleted || totalStars >= 10) {
        certBtn.style.display = 'inline-flex';
      } else {
        certBtn.style.display = 'none';
      }
    }

    /* ========================================================
       GAMEPLAY LOOP
       ======================================================== */
    function startSectorGame(sectorId) {
      gameState.currentSector = sectorId;
      gameState.currentQuestionIndex = 0;
      gameState.sectorScore = 0;
      gameState.sectorCorrectCount = 0;
      gameState.currentStreak = 0;
      gameState.bestSectorStreak = 0;
      // 3 Hints per sector!
      gameState.powerups = { laser: 1, hint: 3, time: 1 };

      // Filter questions for this sector
      gameState.sectorQuestions = gameState.questionsBank.filter(q => (q.sector === sectorId || q.sectorId === sectorId));
      if (gameState.sectorQuestions.length === 0) {
        gameState.sectorQuestions = gameState.questionsBank.slice((sectorId - 1) * 10, sectorId * 10);
      }

      updatePowerupUI();

      // Hyperdrive Warp Jump Transition
      Sound.playWarp();
      if (window.CosmicEngine && window.CosmicEngine.enabled) {
        window.CosmicEngine.triggerWarpJump(650, () => {
          showScreen('screen-game');
          renderQuestion();
        });
      } else {
        showScreen('screen-game');
        renderQuestion();
      }
    }

    function updatePowerupUI() {
      // Hint Orb
      document.getElementById('pu-hint-count').textContent = gameState.powerups.hint;
      document.getElementById('pu-hint').disabled = gameState.powerups.hint <= 0;

      // 50:50 Laser Orb
      document.getElementById('pu-laser-count').textContent = gameState.powerups.laser;
      document.getElementById('pu-laser').disabled = gameState.powerups.laser <= 0;

      // Time Freeze Clock Orb
      document.getElementById('pu-time-count').textContent = gameState.powerups.time;
      document.getElementById('pu-time').disabled = gameState.powerups.time <= 0;

      document.getElementById('hint-bubble').style.display = 'none';
    }

    /* ========================================================
       60-SECOND QUESTION TIMER & AUTO-SKIP LOGIC
       ======================================================== */
    let questionTimer = null;
    let questionSecondsLeft = 60;
    let isQuestionTimerFrozen = false;
    let autoAdvanceTimer = null;

    function startQuestionTimer() {
      stopQuestionTimer();
      questionSecondsLeft = 60;
      isQuestionTimerFrozen = false;
      updateQuestionTimerUI();

      questionTimer = setInterval(() => {
        if (isQuestionTimerFrozen) return; // Time Freeze powerup active!
        if (gameState.activeQuestionAnswered) {
          stopQuestionTimer();
          return;
        }

        questionSecondsLeft--;
        updateQuestionTimerUI();

        if (questionSecondsLeft <= 0) {
          stopQuestionTimer();
          handleQuestionTimeout();
        }
      }, 1000);
    }

    let autoCountdownInterval = null;

    function stopQuestionTimer() {
      if (questionTimer) {
        clearInterval(questionTimer);
        questionTimer = null;
      }
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
      if (autoCountdownInterval) {
        clearInterval(autoCountdownInterval);
        autoCountdownInterval = null;
      }
    }

    function updateQuestionTimerUI() {
      const qTimerVal = document.getElementById('q-timer-val');
      const hudTimerVal = document.getElementById('hud-timer-val');
      const qTimerPill = document.getElementById('question-timer-pill');
      const hudTimerPill = document.getElementById('hud-timer-pill');
      const barFill = document.getElementById('question-timer-bar-fill');

      const text = isQuestionTimerFrozen ? '❄️ FREEZE' : `${questionSecondsLeft}s`;
      if (qTimerVal) qTimerVal.textContent = text;
      if (hudTimerVal) hudTimerVal.textContent = text;

      const pct = Math.max(0, Math.min(100, (questionSecondsLeft / 60) * 100));
      if (barFill) {
        barFill.style.width = isQuestionTimerFrozen ? '100%' : `${pct}%`;
      }

      const elements = [qTimerPill, hudTimerPill, barFill].filter(Boolean);
      elements.forEach(el => {
        el.classList.remove('timer-warning', 'timer-danger', 'timer-frozen');
        if (isQuestionTimerFrozen) {
          el.classList.add('timer-frozen');
        } else if (questionSecondsLeft <= 10) {
          el.classList.add('timer-danger');
        } else if (questionSecondsLeft <= 20) {
          el.classList.add('timer-warning');
        }
      });
    }

    function handleQuestionTimeout() {
      if (gameState.activeQuestionAnswered) return;
      gameState.activeQuestionAnswered = true;
      stopSpeech();

      // Audio cue for timeout
      Sound.playWrong();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const allOptionBtns = document.querySelectorAll('.option-btn');

      // Reveal correct answer and dim other options
      allOptionBtns.forEach(btn => {
        btn.disabled = true;
        const idx = parseInt(btn.dataset.index);
        if (idx === q.answerIndex) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('dimmed');
        }
      });

      // Break streak on timeout
      gameState.currentStreak = 0;
      document.getElementById('hud-streak-count').textContent = `0 Streak`;
      const streakPillEl = document.querySelector('.streak-pill');
      if (streakPillEl) streakPillEl.classList.remove('blazing-streak');

      // Pilot Avatar reacts with sympathetic wobble
      const pilotBadgeEl = document.getElementById('pilot-avatar-badge');
      if (pilotBadgeEl) {
        pilotBadgeEl.classList.remove('victory-bounce', 'sad-wobble', 'blazing-pilot');
        void pilotBadgeEl.offsetWidth;
        pilotBadgeEl.classList.add('sad-wobble');
      }

      // Show Knowledge Capsule indicating timeout & skipped
      const capsuleVerdict = document.getElementById('capsule-verdict');
      if (capsuleVerdict) {
        capsuleVerdict.innerHTML = `<span>⏰</span><span>Time's Up! (Question Skipped)</span>`;
        capsuleVerdict.className = 'capsule-verdict wrong';
      }
      document.getElementById('capsule-points').textContent = `Correct: (${q.answerLetter})`;
      document.getElementById('capsule-explanation').textContent = q.explanation;
      const capsuleEl = document.getElementById('knowledge-capsule');
      capsuleEl.classList.remove('capsule-correct');
      capsuleEl.classList.add('capsule-wrong');
      capsuleEl.style.display = 'block';

      // Update next button with countdown indicator (15s reading timer)
      const nextBtn = document.getElementById('btn-capsule-next');
      let countdownSecs = 15;
      if (nextBtn) {
        nextBtn.innerHTML = `<span>Next Question (${countdownSecs}s)</span><span>⏭️</span>`;
      }

      setSparkyMessage(`⏰ <strong>60s Time's Up!</strong> Question skipped! The correct answer was <strong>${q.options[q.answerIndex]}</strong>!`);

      // Ticking countdown before auto-advancing to next question
      if (autoCountdownInterval) clearInterval(autoCountdownInterval);
      autoCountdownInterval = setInterval(() => {
        countdownSecs--;
        if (nextBtn && countdownSecs > 0) {
          nextBtn.innerHTML = `<span>Next Question (${countdownSecs}s)</span><span>⏭️</span>`;
        }
      }, 1000);

      // Auto-advance to next question after 15 seconds
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(() => {
        if (autoCountdownInterval) {
          clearInterval(autoCountdownInterval);
          autoCountdownInterval = null;
        }
        advanceToNextQuestion();
      }, 15000);
    }

    function renderQuestion() {
      stopSpeech();
      gameState.activeQuestionAnswered = false;
      document.getElementById('knowledge-capsule').style.display = 'none';
      document.getElementById('knowledge-capsule').classList.remove('capsule-correct', 'capsule-wrong');
      document.getElementById('hint-bubble').style.display = 'none';

      // Start 60-Second Question Timer
      startQuestionTimer();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const totalInSector = gameState.sectorQuestions.length;

      // Sync Cadet Pilot Avatar in header
      const pilotEmojiEl = document.getElementById('pilot-avatar-emoji');
      const pilotNameEl = document.getElementById('pilot-avatar-name');
      const pilotBadgeEl = document.getElementById('pilot-avatar-badge');
      if (pilotEmojiEl) pilotEmojiEl.textContent = gameState.avatarEmoji || '🦊';
      if (pilotNameEl) pilotNameEl.textContent = gameState.playerName || 'Cadet';
      if (pilotBadgeEl) {
        pilotBadgeEl.classList.toggle('blazing-pilot', gameState.currentStreak >= 3);
      }

      // Update Sub-Header HUD Capsule
      document.getElementById('hud-sector-name').textContent = `Sector ${gameState.currentSector}: ${q.sectorName || 'Mission'}`;
      const progressPct = ((gameState.currentQuestionIndex + 1) / totalInSector) * 100;
      document.getElementById('hud-progress-fill').style.width = `${progressPct}%`;

      document.getElementById('hud-streak-count').textContent = `${gameState.currentStreak} Streak`;
      const streakPillEl = document.querySelector('.streak-pill');
      if (streakPillEl) streakPillEl.classList.toggle('blazing-streak', gameState.currentStreak >= 3);
      const multiplier = 1 + (Math.min(gameState.currentStreak, 5) * 0.2);
      document.getElementById('hud-question-points').textContent = `+${Math.round(100 * multiplier)} PTS`;

      // Update Question Card Meta
      const currentSectors = getActiveSectors();
      const currentSecInfo = currentSectors.find(s => s.id === gameState.currentSector);
      const iconEl = document.getElementById('q-topic-icon');
      if (iconEl) iconEl.textContent = q.sectorIcon || (currentSecInfo ? currentSecInfo.icon : '🚀');
      document.getElementById('q-topic-name').textContent = q.topic || (currentSecInfo ? currentSecInfo.name : 'Knowledge');
      document.getElementById('q-number-pill').textContent = `Question ${gameState.currentQuestionIndex + 1} of ${totalInSector}`;

      // Mascot companion helpful cue
      if (gameState.currentQuestionIndex === 0) {
        setSparkyMessage(`🚀 Welcome to Sector ${gameState.currentSector}! You've got this, Cadet!`);
      } else if (gameState.currentStreak >= 3) {
        setSparkyMessage(`🔥 Streak of ${gameState.currentStreak}! You're unstoppable!`);
      } else {
        setSparkyMessage(`🤔 Read carefully! Click <strong>🔊 Read to Me</strong> if you want me to read it aloud!`);
      }

      // Check if question has rich structure (match columns or clues)
      const qText = q.question;
      const richBox = document.getElementById('q-rich-content');
      richBox.innerHTML = '';

      if (qText.includes('Column I') && qText.includes('Column II')) {
        const colIdx = qText.indexOf('Column I');
        const intro = qText.substring(0, colIdx).trim();
        document.getElementById('q-stem').textContent = intro;

        const remaining = qText.substring(colIdx);
        richBox.innerHTML = `
          <div class="hots-table-wrapper">
            <pre style="font-family: inherit; white-space: pre-wrap; line-height: 1.6; color: #1e293b; font-weight: 600;">${remaining}</pre>
          </div>
        `;
      } else if (qText.includes('Identify the country from the following clues') || qText.includes('Identify the organ from the biological clues')) {
        const lines = qText.split(String.fromCharCode(10)).filter(l => l.trim().length > 0);
        document.getElementById('q-stem').textContent = lines[0];
        const clueLines = lines.slice(1).map(l => `<p>🔹 ${l.trim()}</p>`).join('');
        richBox.innerHTML = `<div class="clue-box">${clueLines}</div>`;
      } else {
        document.getElementById('q-stem').textContent = qText;
      }

      // Render 4 options matching user design (Pink A, Blue B, Orange C, Green D)
      const optGrid = document.getElementById('options-grid');
      optGrid.innerHTML = '';

      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = idx;
        btn.innerHTML = `
          <span class="option-letter-badge">${letters[idx]}</span>
          <span class="option-text-val">${opt}</span>
        `;

        btn.addEventListener('click', () => {
          handleOptionSelect(idx, btn);
        });

        optGrid.appendChild(btn);
      });
    }

    function handleOptionSelect(selectedIndex, selectedBtn) {
      if (gameState.activeQuestionAnswered) return;
      gameState.activeQuestionAnswered = true;
      stopQuestionTimer();
      stopSpeech();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const isCorrect = selectedIndex === q.answerIndex;
      const allOptionBtns = document.querySelectorAll('.option-btn');

      // Pilot Avatar Reacts
      const pilotBadgeEl = document.getElementById('pilot-avatar-badge');

      if (isCorrect) {
        Sound.playCorrect();
        triggerConfetti(selectedBtn);
        
        // Spawn Flying Golden Stars toward the score badge
        const targetHud = document.getElementById('hud-question-points') || document.querySelector('.streak-pill');
        spawnFlyingStars(selectedBtn, targetHud);

        selectedBtn.classList.add('correct');

        gameState.currentStreak += 1;
        if (gameState.currentStreak > gameState.bestSectorStreak) {
          gameState.bestSectorStreak = gameState.currentStreak;
        }

        const streakMultiplier = 1 + (Math.min(gameState.currentStreak - 1, 5) * 0.2);
        const earnedPoints = Math.round(100 * streakMultiplier);
        gameState.sectorScore += earnedPoints;
        gameState.sectorCorrectCount += 1;

        // Pilot Avatar victory bounce
        if (pilotBadgeEl) {
          pilotBadgeEl.classList.remove('victory-bounce', 'sad-wobble');
          void pilotBadgeEl.offsetWidth;
          pilotBadgeEl.classList.add('victory-bounce');
          if (gameState.currentStreak >= 3) pilotBadgeEl.classList.add('blazing-pilot');
        }

        document.getElementById('capsule-verdict').innerHTML = `<span>🎉</span><span>Stellar Work! Correct!</span>`;
        document.getElementById('capsule-verdict').className = 'capsule-verdict correct';
        document.getElementById('capsule-points').textContent = `+${earnedPoints} PTS`;

        // Stat pill pop animation
        const scorePill = document.querySelector('.stat-pill.score');
        if (scorePill) { scorePill.classList.remove('pop-anim'); void scorePill.offsetWidth; scorePill.classList.add('pop-anim'); }

        setSparkyMessage(`🎉 <strong>Stellar work!</strong> Correct answer! +${earnedPoints} PTS!`);
      } else {
        Sound.playWrong();
        selectedBtn.classList.add('wrong');
        gameState.currentStreak = 0;

        // Pilot Avatar sympathetic wobble
        if (pilotBadgeEl) {
          pilotBadgeEl.classList.remove('victory-bounce', 'sad-wobble', 'blazing-pilot');
          void pilotBadgeEl.offsetWidth;
          pilotBadgeEl.classList.add('sad-wobble');
        }

        // Highlight correct button
        allOptionBtns.forEach(btn => {
          if (parseInt(btn.dataset.index) === q.answerIndex) {
            btn.classList.add('correct');
          }
        });

        document.getElementById('capsule-verdict').innerHTML = `<span>🚀</span><span>Great Effort!</span>`;
        document.getElementById('capsule-verdict').className = 'capsule-verdict wrong';
        document.getElementById('capsule-points').textContent = `Correct: (${q.answerLetter})`;

        setSparkyMessage(`💡 <strong>Good try!</strong> Check the capsule explanation below to master this concept!`);
      }

      // Disable other options
      allOptionBtns.forEach(btn => {
        if (btn !== selectedBtn && parseInt(btn.dataset.index) !== q.answerIndex) {
          btn.classList.add('dimmed');
        }
      });

      // Show Knowledge Capsule explanation
      document.getElementById('capsule-explanation').textContent = q.explanation;
      const capsuleEl = document.getElementById('knowledge-capsule');
      capsuleEl.classList.remove('capsule-correct', 'capsule-wrong');
      capsuleEl.classList.add(isCorrect ? 'capsule-correct' : 'capsule-wrong');
      capsuleEl.style.display = 'block';

      // Update streak in HUD
      document.getElementById('hud-streak-count').textContent = `${gameState.currentStreak} Streak`;
      const streakPillEl = document.querySelector('.streak-pill');
      if (streakPillEl) streakPillEl.classList.toggle('blazing-streak', gameState.currentStreak >= 3);

      // Auto-move to next question after confirming wrong or right with explanation (15s reading timer)
      let countdownSecs = 15;
      const nextBtn = document.getElementById('btn-capsule-next');
      if (nextBtn) {
        nextBtn.innerHTML = `<span>Next Question (${countdownSecs}s)</span><span>⏭️</span>`;
      }

      if (autoCountdownInterval) clearInterval(autoCountdownInterval);
      autoCountdownInterval = setInterval(() => {
        countdownSecs--;
        if (nextBtn && countdownSecs > 0) {
          nextBtn.innerHTML = `<span>Next Question (${countdownSecs}s)</span><span>⏭️</span>`;
        }
      }, 1000);

      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(() => {
        if (autoCountdownInterval) {
          clearInterval(autoCountdownInterval);
          autoCountdownInterval = null;
        }
        advanceToNextQuestion();
      }, 15000);
    }

    /* Next Question with Smooth 3D Slide Transition */
    function advanceToNextQuestion() {
      stopQuestionTimer();
      stopSpeech();
      const nextBtn = document.getElementById('btn-capsule-next');
      if (nextBtn) {
        nextBtn.innerHTML = `<span>Next Question</span><span>🚀</span>`;
      }
      gameState.currentQuestionIndex += 1;
      if (gameState.currentQuestionIndex < gameState.sectorQuestions.length) {
        const qCard = document.querySelector('.question-card');
        if (qCard) {
          qCard.classList.add('slide-out-left');
          setTimeout(() => {
            renderQuestion();
            qCard.classList.remove('slide-out-left');
            qCard.classList.add('slide-in-right');
            setTimeout(() => qCard.classList.remove('slide-in-right'), 380);
          }, 200);
        } else {
          renderQuestion();
        }
      } else {
        finishSectorGame();
      }
    }

    document.getElementById('btn-capsule-next').addEventListener('click', () => {
      Sound.playClick();
      advanceToNextQuestion();
    });

    /* Side POWERS Buttons Handlers */
    // 1. HINT Button (3 per sector)
    document.getElementById('pu-hint').addEventListener('click', () => {
      if (gameState.powerups.hint <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playPowerup();
      gameState.powerups.hint -= 1;
      updatePowerupUI();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      document.getElementById('hint-text').textContent = q.hint || "Think about the key clues in the question stem!";
      document.getElementById('hint-bubble').style.display = 'block';
      setSparkyMessage("💡 <strong>Psst!</strong> Sparky's clue is shown in the yellow hint box!");
    });

    // 2. 50:50 Laser Button with Laser Slice & Smoke Poof FX
    document.getElementById('pu-laser').addEventListener('click', () => {
      if (gameState.powerups.laser <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playLaserZap();
      gameState.powerups.laser -= 1;
      updatePowerupUI();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== q.answerIndex);
      wrongIndices.sort(() => Math.random() - 0.5);
      const toEliminate = wrongIndices.slice(0, 2);

      document.querySelectorAll('.option-btn').forEach(btn => {
        const idx = parseInt(btn.dataset.index);
        if (toEliminate.includes(idx)) {
          // Laser beam animation across button
          const sliceEl = document.createElement('div');
          sliceEl.className = 'laser-slice-fx';
          btn.appendChild(sliceEl);

          // Cartoon smoke poof
          const poofEl = document.createElement('div');
          poofEl.className = 'smoke-poof-fx';
          poofEl.textContent = '💨';
          btn.appendChild(poofEl);

          setTimeout(() => {
            btn.classList.add('dimmed');
            btn.disabled = true;
            btn.style.textDecoration = 'line-through';
          }, 320);
        }
      });
      setSparkyMessage("⚡ <strong>Laser Zapped!</strong> Two wrong answers sliced away!");
    });

    // 3. FREEZE Clock Button with Icy Frost Vignette
    document.getElementById('pu-time').addEventListener('click', () => {
      if (gameState.powerups.time <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playFreeze();
      gameState.powerups.time -= 1;
      updatePowerupUI();

      // Freeze the 60-second question timer!
      isQuestionTimerFrozen = true;
      updateQuestionTimerUI();

      const frostOverlay = document.getElementById('frost-vignette-overlay');
      if (frostOverlay) {
        frostOverlay.classList.add('active');
        setTimeout(() => {
          frostOverlay.classList.remove('active');
        }, 12000);
      }

      const bubble = document.getElementById('hint-bubble');
      document.getElementById('hint-text').textContent = "❄️ Time Freeze Activated: Relax Cadet, your 60s timer is frozen with unlimited time!";
      bubble.style.display = 'block';
      setSparkyMessage("❄️ <strong>Time Freeze!</strong> Icy frost active - your 60s timer is frozen!");
    });

    document.getElementById('btn-exit-to-map').addEventListener('click', () => {
      stopQuestionTimer();
      Sound.playClick();
      renderSectorMap();
      showScreen('screen-map');
    });

    /* ========================================================
       SECTOR COMPLETION & REWARDS (WITH 3D STAR SLAM & CONFETTI)
       ======================================================== */
    function finishSectorGame() {
      stopQuestionTimer();
      const totalQ = gameState.sectorQuestions.length;
      const correct = gameState.sectorCorrectCount;
      const pct = Math.round((correct / totalQ) * 100);

      let stars = 1;
      if (pct >= 85) stars = 3;
      else if (pct >= 65) stars = 2;

      const prevStars = gameState.sectorStars[gameState.currentSector] || 0;
      if (stars > prevStars) {
        gameState.sectorStars[gameState.currentSector] = stars;
      }

      if (gameState.sectorScore > (gameState.sectorHighScores[gameState.currentSector] || 0)) {
        gameState.sectorHighScores[gameState.currentSector] = gameState.sectorScore;
      }

      gameState.totalScore += gameState.sectorScore;

      const currentSectors = getActiveSectors();
      const sectorMeta = currentSectors.find(s => s.id === gameState.currentSector);
      let newBadge = null;
      if (sectorMeta && !gameState.unlockedBadges.includes(sectorMeta.badge)) {
        gameState.unlockedBadges.push(sectorMeta.badge);
        newBadge = sectorMeta.badge;
      }

      const totalStars = Object.values(gameState.sectorStars).reduce((a, b) => a + b, 0);
      const subInfo = OLYMPIAD_SUBJECTS[gameState.currentSubject] || OLYMPIAD_SUBJECTS.igko;
      if (totalStars >= 13 && !gameState.unlockedBadges.includes(subInfo.badge)) {
        gameState.unlockedBadges.push(subInfo.badge);
      }

      saveState();
      Sound.playVictory();

      // Trigger twin confetti cannons
      triggerDualConfettiCannons();

      document.getElementById('debrief-sector-title').textContent = `${sectorMeta ? sectorMeta.name : 'Sector'} Cleared!`;
      
      // Setup 3D Star Slam sequence
      const starsContainer = document.getElementById('debrief-stars');
      starsContainer.innerHTML = `
        <span class="star-slam-item" id="star-slam-1">⭐</span>
        <span class="star-slam-item" id="star-slam-2">⭐</span>
        <span class="star-slam-item" id="star-slam-3">⭐</span>
      `;

      document.getElementById('debrief-score').textContent = '0';
      document.getElementById('debrief-accuracy').textContent = `${pct}%`;
      document.getElementById('debrief-streak').textContent = gameState.bestSectorStreak;

      const badgeAlert = document.getElementById('debrief-badge-alert');
      if (newBadge) {
        badgeAlert.style.display = 'flex';
        document.getElementById('debrief-badge-name').textContent = newBadge;
      } else {
        badgeAlert.style.display = 'none';
      }

      setSparkyMessage("🏆 <strong>Sector Cleared!</strong> Outstanding mission accomplishment, Cadet!");
      showScreen('screen-debrief');

      // Sequentially slam stars into place with impact thump and screen shake
      const targetStars = stars;
      for (let s = 1; s <= 3; s++) {
        const starEl = document.getElementById(`star-slam-${s}`);
        if (s <= targetStars) {
          setTimeout(() => {
            if (starEl) {
              starEl.classList.add('slam-active');
              Sound.playStarSlam();
              const debriefCard = document.querySelector('.debrief-card');
              if (debriefCard) {
                debriefCard.classList.add('screen-shake');
                setTimeout(() => debriefCard.classList.remove('screen-shake'), 260);
              }
            }
          }, 320 + (s - 1) * 380);
        } else {
          setTimeout(() => {
            if (starEl) {
              starEl.style.opacity = '0.22';
              starEl.style.transform = 'scale(0.85) translateY(0)';
            }
          }, 320 + (s - 1) * 380);
        }
      }

      // Rolling score odometer
      const scoreEl = document.getElementById('debrief-score');
      const targetScore = gameState.sectorScore;
      let currScore = 0;
      const stepScore = Math.max(10, Math.ceil(targetScore / 22));
      const scoreInterval = setInterval(() => {
        currScore += stepScore;
        if (currScore >= targetScore) {
          currScore = targetScore;
          clearInterval(scoreInterval);
        }
        scoreEl.textContent = currScore.toLocaleString();
        Sound.playCoinTick();
      }, 45);
    }

    document.getElementById('btn-debrief-next').addEventListener('click', () => {
      Sound.playClick();
      const currentSectors = getActiveSectors();
      if (gameState.currentSector < currentSectors.length) {
        startSectorGame(gameState.currentSector + 1);
      } else {
        openCertificateModal();
      }
    });

    document.getElementById('btn-debrief-replay').addEventListener('click', () => {
      Sound.playClick();
      startSectorGame(gameState.currentSector);
    });

    document.getElementById('btn-debrief-map').addEventListener('click', () => {
      Sound.playClick();
      renderSectorMap();
      showScreen('screen-map');
    });

    /* ========================================================
       CERTIFICATE & BADGES MODALS
       ======================================================== */
    function openCertificateModal() {
      Sound.playVictory();
      document.getElementById('cert-player-name').textContent = `${gameState.avatarEmoji} ${gameState.playerName}`;
      document.getElementById('cert-final-score').textContent = `${gameState.totalScore.toLocaleString()} PTS`;
      
      const totalStars = Object.values(gameState.sectorStars).reduce((a, b) => a + b, 0);
      let rank = "Galactic Scout 🌟";
      if (totalStars >= 14) rank = "Galactic Grandmaster 👑";
      else if (totalStars >= 10) rank = "Cosmic Commander 🚀";
      else if (totalStars >= 6) rank = "Star Navigator 🧭";
      document.getElementById('cert-rank').textContent = rank;

      const now = new Date();
      document.getElementById('cert-date').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      openModal('modal-certificate');
    }

    document.getElementById('btn-view-certificate').addEventListener('click', openCertificateModal);

    function renderBadges() {
      const grid = document.getElementById('badges-grid');
      grid.innerHTML = '';

      BADGES.forEach(b => {
        const isUnlocked = gameState.unlockedBadges.includes(b.name);
        const card = document.createElement('div');
        card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-title">${b.name}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">${isUnlocked ? 'Unlocked 🎉' : b.desc}</div>
        `;
        grid.appendChild(card);
      });
    }

    document.getElementById('btn-badges-modal').addEventListener('click', () => {
      Sound.playClick();
      renderBadges();
      openModal('modal-badges');
    });

    document.getElementById('btn-settings-modal').addEventListener('click', () => {
      Sound.playClick();
      openModal('modal-settings');
    });

    /* Review All Questions */
    document.getElementById('btn-review-questions').addEventListener('click', () => {
      Sound.playClick();
      const list = document.getElementById('review-questions-list');
      list.innerHTML = '';

      gameState.questionsBank.forEach((q, idx) => {
        const item = document.createElement('div');
        item.style.cssText = 'background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 16px; box-shadow: 0 3px 0 #cbd5e1;';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-weight:800; color:#0284c7; font-size:0.95rem;">Q${q.id}: ${q.topic}</span>
            <span style="font-size:0.85rem; color:#b45309; font-weight:800; background:#fef3c7; padding:2px 8px; border-radius:6px;">Sector ${q.sector}</span>
          </div>
          <div style="font-weight:700; margin-bottom:10px; font-size:1.02rem; line-height:1.45; color:#0f172a;">${q.question.split('\\n').join('<br>')}</div>
          <div style="color:#059669; font-size:0.95rem; font-weight:800; margin-bottom:6px;">
            Correct Answer: (${q.answerLetter}) ${q.options[q.answerIndex]}
          </div>
          <div style="color:#475569; font-size:0.9rem; line-height:1.45; background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            💡 ${q.explanation}
          </div>
        `;
        list.appendChild(item);
      });

      openModal('modal-review');
    });

    /* Custom Question Import/Export */
    document.getElementById('btn-export-questions').addEventListener('click', () => {
      Sound.playClick();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState.questionsBank, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", "questions.json");
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    });

    document.getElementById('btn-import-questions').addEventListener('click', () => {
      Sound.playClick();
      const text = document.getElementById('custom-json-input').value.trim();
      if (!text) {
        alert("Please paste a valid JSON array of questions.");
        return;
      }
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          gameState.questionsBank = parsed;
          alert(`Success! Loaded ${parsed.length} custom questions into Cosmic Quest IQ.`);
          closeModal('modal-settings');
          renderSectorMap();
        } else {
          alert("Invalid question format: must be an array of questions.");
        }
      } catch(err) {
        alert("JSON syntax error. Please ensure the pasted text is valid JSON.");
      }
    });

    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      if (confirm("Reset all stars, scores, and badges?")) {
        localStorage.removeItem('cosmic_quest_state');
        gameState.totalScore = 0;
        gameState.sectorStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        gameState.sectorHighScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        gameState.unlockedBadges = [];
        closeModal('modal-settings');
        renderSectorMap();
        updateGlobalNav();
      }
    });

    /* ========================================================
       QUESTION STUDIO LOGIC (ADD / EDIT / EXPORT / DOWNLOAD)
       ======================================================== */
    function updateStudioCount() {
      const el = document.getElementById('studio-q-count');
      if (el) el.textContent = gameState.questionsBank.length;
    }

    function switchStudioTab(tabId) {
      document.querySelectorAll('.studio-tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.studio-tab-content').forEach(c => c.classList.remove('active'));

      const targetBtn = document.getElementById(`tab-btn-${tabId}`);
      const targetContent = document.getElementById(`studio-tab-${tabId}`);
      if (targetBtn) targetBtn.classList.add('active');
      if (targetContent) targetContent.classList.add('active');

      if (tabId === 'list') {
        renderStudioQuestionList();
      }
      updateStudioCount();
    }

    // Tab buttons
    document.getElementById('tab-btn-add').addEventListener('click', () => switchStudioTab('add'));
    document.getElementById('tab-btn-list').addEventListener('click', () => switchStudioTab('list'));
    document.getElementById('tab-btn-export').addEventListener('click', () => switchStudioTab('export'));

    // Open Studio buttons
    const studioOpenTriggers = ['btn-studio-welcome', 'btn-studio-map', 'btn-studio-header', 'btn-studio-settings'];
    studioOpenTriggers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          Sound.init();
          Sound.playClick();
          closeModal('modal-settings');
          updateStudioCount();
          switchStudioTab('add');
          openModal('modal-studio');
        });
      }
    });

    // Form submission for Add Question
    document.getElementById('studio-add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      Sound.init();

      const sectorVal = parseInt(document.getElementById('sq-sector').value, 10);
      const topicVal = document.getElementById('sq-topic').value.trim();
      const textVal = document.getElementById('sq-text').value.trim();
      const opt0 = document.getElementById('sq-opt-0').value.trim();
      const opt1 = document.getElementById('sq-opt-1').value.trim();
      const opt2 = document.getElementById('sq-opt-2').value.trim();
      const opt3 = document.getElementById('sq-opt-3').value.trim();
      const hintVal = document.getElementById('sq-hint').value.trim();
      const explVal = document.getElementById('sq-explanation').value.trim();

      const correctRadio = document.querySelector('input[name="sq-correct-radio"]:checked');
      const answerIndex = correctRadio ? parseInt(correctRadio.value, 10) : 0;
      const letters = ['A', 'B', 'C', 'D'];

      if (!textVal || !opt0 || !opt1 || !opt2 || !opt3) {
        alert("Please fill in the question and all 4 options!");
        return;
      }

      const newId = gameState.questionsBank.length ? Math.max(...gameState.questionsBank.map(q => q.id || 0)) + 1 : 1;

      const newQ = {
        id: newId,
        sector: sectorVal,
        sectorName: SECTOR_METADATA.find(s => s.id === sectorVal)?.name || `Sector ${sectorVal}`,
        sectorBadge: SECTOR_METADATA.find(s => s.id === sectorVal)?.badge || "Explorer",
        sectorIcon: SECTOR_METADATA.find(s => s.id === sectorVal)?.icon || "🌟",
        topic: topicVal || "General Knowledge",
        question: textVal,
        options: [opt0, opt1, opt2, opt3],
        answerIndex: answerIndex,
        answerLetter: letters[answerIndex],
        explanation: explVal || `Correct Answer: (${letters[answerIndex]}) ${[opt0, opt1, opt2, opt3][answerIndex]}.`,
        hint: hintVal || `Focus on option (${letters[answerIndex]})!`,
        isCustom: true
      };

      gameState.questionsBank.push(newQ);
      localStorage.setItem('cosmic_quest_questions_custom', JSON.stringify(gameState.questionsBank));

      Sound.playVictory();
      updateStudioCount();
      renderSectorMap();

      const msgEl = document.getElementById('studio-form-msg');
      msgEl.style.display = 'block';
      msgEl.style.background = '#dcfce7';
      msgEl.style.color = '#15803d';
      msgEl.style.border = '2px solid #86efac';
      msgEl.innerHTML = `🎉 <strong>Success!</strong> Question #${newId} saved to <em>Sector ${sectorVal}</em>! Total questions: ${gameState.questionsBank.length}.`;

      // Reset text fields
      document.getElementById('sq-text').value = '';
      document.getElementById('sq-opt-0').value = '';
      document.getElementById('sq-opt-1').value = '';
      document.getElementById('sq-opt-2').value = '';
      document.getElementById('sq-opt-3').value = '';
      document.getElementById('sq-hint').value = '';
      document.getElementById('sq-explanation').value = '';

      setTimeout(() => {
        msgEl.style.display = 'none';
      }, 5000);
    });

    // Render Studio Question List
    function renderStudioQuestionList() {
      const container = document.getElementById('studio-question-card-list');
      if (!container) return;
      container.innerHTML = '';

      const sectorFilter = document.getElementById('sq-filter-sector').value;
      const searchQuery = (document.getElementById('sq-search-query').value || '').toLowerCase().trim();

      let list = gameState.questionsBank;
      if (sectorFilter !== 'all') {
        const sId = parseInt(sectorFilter, 10);
        list = list.filter(q => (q.sector === sId || q.sectorId === sId));
      }
      if (searchQuery) {
        list = list.filter(q => (
          (q.question && q.question.toLowerCase().includes(searchQuery)) ||
          (q.topic && q.topic.toLowerCase().includes(searchQuery)) ||
          (q.options && q.options.some(o => o.toLowerCase().includes(searchQuery)))
        ));
      }

      if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b; font-weight:700;">No questions found matching your filter.</div>`;
        return;
      }

      list.forEach((q) => {
        const card = document.createElement('div');
        card.className = `studio-q-item ${q.isCustom ? 'is-custom' : ''}`;
        
        let optionsHtml = '';
        (q.options || []).forEach((opt, idx) => {
          const isCorrect = idx === q.answerIndex;
          optionsHtml += `
            <div style="font-size:0.88rem; margin:3px 0; color:${isCorrect ? '#15803d' : '#475569'}; font-weight:${isCorrect ? '800' : '600'};">
              ${isCorrect ? '✅ ' : '⚪ '}(${['A','B','C','D'][idx]}) ${opt}
            </div>
          `;
        });

        card.innerHTML = `
          <div class="studio-q-header">
            <div>
              <span class="studio-tag ${q.isCustom ? 'custom' : 'default'}">${q.isCustom ? '✨ Custom Question' : 'Olympiad Default'}</span>
              <strong style="color:#0284c7; margin-left:6px; font-size:0.9rem;">#${q.id} • ${q.topic || 'General'}</strong>
              <span style="font-size:0.8rem; color:#b45309; background:#fef3c7; padding:2px 8px; border-radius:6px; font-weight:800; margin-left:6px;">Sector ${q.sector}</span>
            </div>
            ${q.isCustom ? `<button class="delete-q-btn" onclick="deleteStudioQuestion(${q.id})">🗑️ Delete</button>` : ''}
          </div>
          <div style="font-weight:700; color:#0f172a; margin:8px 0; font-size:0.98rem; line-height:1.45;">
            ${(q.question || '').split(String.fromCharCode(10)).join('<br>')}
          </div>
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; margin-bottom:6px;">
            ${optionsHtml}
          </div>
          ${q.hint ? `<div style="font-size:0.82rem; color:#b45309; margin-top:4px;">💡 <em>Hint:</em> ${q.hint}</div>` : ''}
          ${q.explanation ? `<div style="font-size:0.82rem; color:#475569; margin-top:2px;">🔬 <em>Explanation:</em> ${q.explanation}</div>` : ''}
        `;
        container.appendChild(card);
      });
    }

    // Delete a Question
    window.deleteStudioQuestion = function(qId) {
      if (!confirm(`Are you sure you want to delete question #${qId}?`)) return;
      Sound.init();
      Sound.playClick();
      gameState.questionsBank = gameState.questionsBank.filter(q => q.id !== qId);
      localStorage.setItem('cosmic_quest_questions_custom', JSON.stringify(gameState.questionsBank));
      renderSectorMap();
      renderStudioQuestionList();
      updateStudioCount();
    };

    // Filter and search listeners
    document.getElementById('sq-filter-sector').addEventListener('change', renderStudioQuestionList);
    document.getElementById('sq-search-query').addEventListener('input', renderStudioQuestionList);

    // Download Standalone Game (.html)
    document.getElementById('btn-download-standalone-html').addEventListener('click', () => {
      Sound.init();
      Sound.playVictory();

      // Clone document to preserve current page view
      const clone = document.documentElement.cloneNode(true);

      // Make sure welcome screen is active in exported file
      clone.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const welcomeScreen = clone.querySelector('#screen-welcome');
      if (welcomeScreen) welcomeScreen.classList.add('active');

      // Close all modals in clone
      clone.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));

      // Hide sub-hud
      const subHud = clone.querySelector('#sub-hud-capsule');
      if (subHud) subHud.style.display = 'none';

      let htmlContent = clone.outerHTML;

      // Inject the current updated questionsBank into DEFAULT_QUESTIONS
      const updatedJson = JSON.stringify(gameState.questionsBank);
      const startMarker = "const DEFAULT_QUESTIONS = ";
      const endMarker = ";" + String.fromCharCode(10) + String.fromCharCode(10) + "    /* Upbeat Arcade";
      const sIdx = htmlContent.indexOf(startMarker);
      const eIdx = htmlContent.indexOf(endMarker, sIdx);
      if (sIdx !== -1 && eIdx !== -1) {
        htmlContent = htmlContent.substring(0, sIdx + startMarker.length) + updatedJson + htmlContent.substring(eIdx);
      }

      if (!htmlContent.startsWith("<!DOCTYPE")) {
        htmlContent = "<!DOCTYPE html>" + String.fromCharCode(10) + htmlContent;
      }

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `CosmicQuest_Game_${gameState.questionsBank.length}Q.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      alert(`🎉 Downloaded CosmicQuest_Game_${gameState.questionsBank.length}Q.html!\n\nThis file is 100% self-contained and ready to share with anyone via WhatsApp, email, or USB.`);
    });

    // Download JSON
    document.getElementById('btn-studio-download-json').addEventListener('click', () => {
      Sound.playClick();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState.questionsBank, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `cosmic_quest_${gameState.questionsBank.length}_questions.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    });

    // Copy JSON to clipboard
    document.getElementById('btn-studio-copy-json').addEventListener('click', () => {
      Sound.playClick();
      navigator.clipboard.writeText(JSON.stringify(gameState.questionsBank, null, 2)).then(() => {
        alert("📋 Copied all questions JSON to clipboard!");
      }).catch(() => {
        alert("Could not copy automatically. Please use Download JSON button.");
      });
    });

    // Reset to defaults
    document.getElementById('btn-studio-reset-defaults').addEventListener('click', () => {
      const subInfo = OLYMPIAD_SUBJECTS[gameState.currentSubject] || OLYMPIAD_SUBJECTS.igko;
      const defQs = subInfo.defaultQuestions || DEFAULT_QUESTIONS;
      if (!confirm(`Are you sure you want to revert to the default ${defQs.length} Olympiad questions for ${subInfo.name}? All custom added questions will be removed.`)) return;
      Sound.init();
      Sound.playClick();
      localStorage.removeItem(`cosmic_quest_questions_${gameState.currentSubject}`);
      localStorage.removeItem('cosmic_quest_questions_custom');
      gameState.questionsBank = [...defQs];
      updateStudioCount();
      renderSectorMap();
      renderStudioQuestionList();
      alert(`Reverted to default ${gameState.questionsBank.length} questions!`);
    });

    /* Upbeat Music & Sound Toggles */
    const musicBtn = document.getElementById('btn-music-toggle');
    const musicSettingsBtn = document.getElementById('btn-toggle-bgm-settings');
    const sfxBtn = document.getElementById('btn-sound-toggle');
    const sfxSettingsBtn = document.getElementById('btn-toggle-sfx-settings');

    function updateAudioButtons() {
      musicBtn.textContent = Sound.bgmEnabled ? '🎵' : '🔇';
      musicBtn.title = Sound.bgmEnabled ? 'Music: ON (Click to Mute)' : 'Music: OFF (Click to Play)';
      musicSettingsBtn.textContent = `🎵 Music: ${Sound.bgmEnabled ? 'ON' : 'OFF'}`;

      sfxBtn.textContent = Sound.sfxEnabled ? '🔊' : '🔈';
      sfxBtn.title = Sound.sfxEnabled ? 'Sound FX: ON' : 'Sound FX: OFF';
      sfxSettingsBtn.textContent = `🔊 Sound FX: ${Sound.sfxEnabled ? 'ON' : 'OFF'}`;
    }

    musicBtn.addEventListener('click', () => {
      Sound.toggleBgm();
      updateAudioButtons();
    });

    musicSettingsBtn.addEventListener('click', () => {
      Sound.toggleBgm();
      updateAudioButtons();
    });

    sfxBtn.addEventListener('click', () => {
      Sound.init();
      Sound.toggleSfx();
      updateAudioButtons();
    });

    sfxSettingsBtn.addEventListener('click', () => {
      Sound.init();
      Sound.toggleSfx();
      updateAudioButtons();
    });

    /* ========================================================
       FULL COSMIC PACKAGE: LIVING STARFIELD, STARDUST & SHOOTING STARS
       ======================================================== */
    class CosmicCanvasEngine {
      constructor() {
        this.canvas = document.getElementById('cosmic-stars-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.enabled = localStorage.getItem('cosmic_quest_animations') !== 'reduced';
        this.stars = [];
        this.dustParticles = [];
        this.shootingStars = [];
        this.cursorSparks = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.nextCometTime = Date.now() + 1500;
        this.animId = null;

        this.init();
      }

      init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createStars(85);
        this.createDust(35);

        // Desktop gentle cursor stardust
        window.addEventListener('mousemove', (e) => {
          if (!this.enabled || Math.random() > 0.4) return;
          this.cursorSparks.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 1.6,
            vy: (Math.random() - 0.5) * 1.6 - 0.4,
            size: Math.random() * 2.5 + 1.2,
            color: ['#facc15', '#38bdf8', '#c084fc', '#4ade80'][Math.floor(Math.random() * 4)],
            alpha: 1,
            decay: 0.035
          });
          if (this.cursorSparks.length > 35) this.cursorSparks.shift();
        });

        if (this.enabled) {
          this.start();
        } else {
          document.body.classList.add('reduced-motion');
        }
      }

      resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        if (this.canvas) {
          this.canvas.width = this.width;
          this.canvas.height = this.height;
        }
      }

      createStars(count) {
        this.stars = [];
        const starColors = ['#ffffff', '#fef08a', '#e0f2fe', '#fbcfe8', '#ddd6fe'];
        for (let i = 0; i < count; i++) {
          this.stars.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            baseRadius: Math.random() * 1.8 + 0.6,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            twinkleSpeed: Math.random() * 0.04 + 0.015,
            phase: Math.random() * Math.PI * 2,
            depth: Math.random() * 0.6 + 0.4
          });
        }
      }

      createDust(count) {
        this.dustParticles = [];
        for (let i = 0; i < count; i++) {
          this.dustParticles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 2.2 + 0.8,
            vy: -(Math.random() * 0.35 + 0.15),
            vx: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.5 + 0.25,
            color: ['#38bdf8', '#facc15', '#ec4899', '#a855f7'][Math.floor(Math.random() * 4)]
          });
        }
      }

      spawnComet() {
        const startFromTop = Math.random() > 0.35;
        const startX = startFromTop ? Math.random() * (this.width * 0.7) : 0;
        const startY = startFromTop ? 0 : Math.random() * (this.height * 0.45);
        const speed = Math.random() * 12 + 10;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25;

        this.shootingStars.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: Math.random() * 110 + 75,
          thickness: Math.random() * 2 + 1.8,
          alpha: 1,
          decay: 0.016,
          color: ['#38bdf8', '#facc15', '#ffffff', '#e879f9'][Math.floor(Math.random() * 4)]
        });
      }

      triggerWarpJump(duration = 650, callback = null) {
        if (!this.enabled) {
          if (callback) callback();
          return;
        }
        this.warpActive = true;
        this.warpStart = Date.now();
        this.warpDuration = duration;
        this.warpCallback = callback;
        this.warpProgress = 0;

        const flashEl = document.getElementById('warp-flash-overlay');
        if (flashEl) {
          flashEl.classList.add('active');
          setTimeout(() => flashEl.classList.remove('active'), 280);
        }
      }

      start() {
        if (!this.animId) {
          const loop = () => {
            this.update();
            this.render();
            if (this.enabled) {
              this.animId = requestAnimationFrame(loop);
            } else {
              this.animId = null;
            }
          };
          this.animId = requestAnimationFrame(loop);
        }
      }

      stop() {
        if (this.animId) {
          cancelAnimationFrame(this.animId);
          this.animId = null;
        }
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.width, this.height);
        }
      }

      toggleAnimations() {
        this.enabled = !this.enabled;
        localStorage.setItem('cosmic_quest_animations', this.enabled ? 'full' : 'reduced');
        document.body.classList.toggle('reduced-motion', !this.enabled);
        if (this.enabled) {
          this.start();
        } else {
          this.stop();
        }
        return this.enabled;
      }

      update() {
        const now = Date.now();

        // Warp mode update
        if (this.warpActive) {
          const elapsed = now - this.warpStart;
          this.warpProgress = Math.min(1, elapsed / this.warpDuration);
          if (this.warpProgress >= 1) {
            this.warpActive = false;
            if (this.warpCallback) {
              const cb = this.warpCallback;
              this.warpCallback = null;
              cb();
            }
          }
        }

        if (now > this.nextCometTime) {
          this.spawnComet();
          this.nextCometTime = now + Math.random() * 6000 + 4500; // Next in 4.5 to 10.5 seconds
        }

        // Update Comets
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
          const c = this.shootingStars[i];
          c.x += c.vx;
          c.y += c.vy;
          c.alpha -= c.decay;
          if (c.alpha <= 0 || c.x > this.width || c.y > this.height) {
            this.shootingStars.splice(i, 1);
          }
        }

        // Update Dust Particles (rising softly)
        this.dustParticles.forEach(d => {
          d.y += d.vy;
          d.x += d.vx;
          if (d.y < -10) {
            d.y = this.height + 10;
            d.x = Math.random() * this.width;
          }
        });

        // Update Cursor Sparks
        for (let i = this.cursorSparks.length - 1; i >= 0; i--) {
          const s = this.cursorSparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= s.decay;
          if (s.alpha <= 0) {
            this.cursorSparks.splice(i, 1);
          }
        }
      }

      render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Twinkling Stars
        this.stars.forEach(s => {
          s.phase += s.twinkleSpeed;
          const currentAlpha = 0.35 + Math.sin(s.phase) * 0.45;
          const r = Math.max(0.4, s.baseRadius * (0.8 + Math.sin(s.phase) * 0.3));

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
          this.ctx.fillStyle = s.color;
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
          this.ctx.fill();

          // Soft subtle cross sparkle on brighter stars
          if (r > 1.6 && currentAlpha > 0.65) {
            this.ctx.strokeStyle = s.color;
            this.ctx.lineWidth = 0.75;
            this.ctx.beginPath();
            this.ctx.moveTo(s.x - r * 2.2, s.y);
            this.ctx.lineTo(s.x + r * 2.2, s.y);
            this.ctx.moveTo(s.x, s.y - r * 2.2);
            this.ctx.lineTo(s.x, s.y + r * 2.2);
            this.ctx.stroke();
          }
          this.ctx.restore();
        });

        // Warp Speed Streak Lines
        if (this.warpActive) {
          const cx = this.width / 2;
          const cy = this.height / 2;
          const p = this.warpProgress;
          const intensity = Math.sin(p * Math.PI);

          this.ctx.save();
          this.stars.forEach(s => {
            const dx = s.x - cx;
            const dy = s.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const streakLen = (dist * 0.45 + 50) * intensity;
            const nx = dx / dist;
            const ny = dy / dist;

            const grad = this.ctx.createLinearGradient(s.x, s.y, s.x + nx * streakLen, s.y + ny * streakLen);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, s.color || '#38bdf8');
            grad.addColorStop(1, 'transparent');

            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = Math.max(1.5, 3.2 * intensity);
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(s.x + nx * streakLen, s.y + ny * streakLen);
            this.ctx.stroke();
          });
          this.ctx.restore();
        }

        // 2. Draw Rising Cosmic Dust
        this.dustParticles.forEach(d => {
          this.ctx.save();
          this.ctx.globalAlpha = d.alpha;
          this.ctx.fillStyle = d.color;
          this.ctx.beginPath();
          this.ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        });

        // 3. Draw Shooting Stars / Comets with neon tail
        this.shootingStars.forEach(c => {
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, c.alpha);
          
          const tailX = c.x - (c.vx / 12) * c.length;
          const tailY = c.y - (c.vy / 12) * c.length;

          const grad = this.ctx.createLinearGradient(c.x, c.y, tailX, tailY);
          grad.addColorStop(0, c.color);
          grad.addColorStop(0.3, '#ffffff');
          grad.addColorStop(1, 'transparent');

          this.ctx.strokeStyle = grad;
          this.ctx.lineWidth = c.thickness;
          this.ctx.lineCap = 'round';

          this.ctx.beginPath();
          this.ctx.moveTo(tailX, tailY);
          this.ctx.lineTo(c.x, c.y);
          this.ctx.stroke();

          // Glowing starhead
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(c.x, c.y, c.thickness * 1.4, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.restore();
        });

        // 4. Draw Cursor Sparks
        this.cursorSparks.forEach(s => {
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, s.alpha);
          this.ctx.fillStyle = s.color;
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        });
      }
    }

    /* Confetti Burst & Flying Star System */
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiParticles = [];
    let flyingStars = [];

    function triggerConfetti(sourceElement) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
      
      const rect = sourceElement ? sourceElement.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const colors = ['#0ea5e9', '#8b5cf6', '#facc15', '#10b981', '#f43f5e', '#fb923c'];
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 12 + 5;
        confettiParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 3,
          size: Math.random() * 9 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 12 - 6,
          isStar: false
        });
      }
    }

    function triggerDualConfettiCannons() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
      const colors = ['#0ea5e9', '#8b5cf6', '#facc15', '#10b981', '#f43f5e', '#fb923c', '#ffffff'];

      // Left Cannon (blasts up-right)
      for (let i = 0; i < 65; i++) {
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        const velocity = Math.random() * 16 + 10;
        confettiParticles.push({
          x: 40,
          y: window.innerHeight - 30,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 11 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.012 + 0.008,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 14 - 7,
          isStar: Math.random() > 0.55
        });
      }

      // Right Cannon (blasts up-left)
      for (let i = 0; i < 65; i++) {
        const angle = -Math.PI * 0.75 + (Math.random() - 0.5) * 0.5;
        const velocity = Math.random() * 16 + 10;
        confettiParticles.push({
          x: window.innerWidth - 40,
          y: window.innerHeight - 30,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 11 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.012 + 0.008,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 14 - 7,
          isStar: Math.random() > 0.55
        });
      }
    }

    function spawnFlyingStars(sourceElement, targetElement) {
      if (!sourceElement || !targetElement) return;
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;

      const sRect = sourceElement.getBoundingClientRect();
      const tRect = targetElement.getBoundingClientRect();

      const startX = sRect.left + sRect.width / 2;
      const startY = sRect.top + sRect.height / 2;
      const targetX = tRect.left + tRect.width / 2;
      const targetY = tRect.top + tRect.height / 2;

      for (let i = 0; i < 5; i++) {
        const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 160;
        const midY = Math.min(startY, targetY) - 50 - Math.random() * 90;
        flyingStars.push({
          startX: startX + (Math.random() - 0.5) * 24,
          startY: startY + (Math.random() - 0.5) * 24,
          targetX,
          targetY,
          cpX: midX,
          cpY: midY,
          progress: -(i * 0.08),
          speed: 0.038 + Math.random() * 0.015,
          size: 22 + Math.random() * 8,
          trail: [],
          targetElement: targetElement
        });
      }
    }

    function animateConfetti() {
      if (confettiParticles.length > 0 || flyingStars.length > 0) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        // Update & Render Confetti
        for (let index = confettiParticles.length - 1; index >= 0; index--) {
          const p = confettiParticles[index];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.28;
          p.alpha -= p.decay;
          p.rotation += p.rotationSpeed;

          confettiCtx.save();
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rotation * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          confettiCtx.globalAlpha = Math.max(0, p.alpha);

          if (p.isStar) {
            confettiCtx.font = `${Math.round(p.size * 1.3)}px sans-serif`;
            confettiCtx.textAlign = 'center';
            confettiCtx.textBaseline = 'middle';
            confettiCtx.fillText('⭐', 0, 0);
          } else {
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          }
          confettiCtx.restore();

          if (p.alpha <= 0 || p.y > confettiCanvas.height + 20) {
            confettiParticles.splice(index, 1);
          }
        }

        // Update & Render Flying Stars
        for (let i = flyingStars.length - 1; i >= 0; i--) {
          const s = flyingStars[i];
          s.progress += s.speed;
          if (s.progress < 0) continue;

          const t = Math.min(1, s.progress);
          const curX = (1 - t) * (1 - t) * s.startX + 2 * (1 - t) * t * s.cpX + t * t * s.targetX;
          const curY = (1 - t) * (1 - t) * s.startY + 2 * (1 - t) * t * s.cpY + t * t * s.targetY;

          s.trail.push({ x: curX, y: curY });
          if (s.trail.length > 8) s.trail.shift();

          // Render Trail
          s.trail.forEach((tp, tIdx) => {
            confettiCtx.save();
            confettiCtx.fillStyle = '#facc15';
            confettiCtx.globalAlpha = (tIdx / s.trail.length) * 0.6;
            confettiCtx.beginPath();
            confettiCtx.arc(tp.x, tp.y, 4, 0, Math.PI * 2);
            confettiCtx.fill();
            confettiCtx.restore();
          });

          // Render Star
          confettiCtx.save();
          confettiCtx.translate(curX, curY);
          confettiCtx.font = `${Math.round(s.size)}px sans-serif`;
          confettiCtx.textAlign = 'center';
          confettiCtx.textBaseline = 'middle';
          confettiCtx.shadowColor = '#facc15';
          confettiCtx.shadowBlur = 14;
          confettiCtx.fillText('⭐', 0, 0);
          confettiCtx.restore();

          if (s.progress >= 1) {
            Sound.playCoinTick();
            if (s.targetElement) {
              s.targetElement.classList.remove('hud-badge-pop');
              void s.targetElement.offsetWidth;
              s.targetElement.classList.add('hud-badge-pop');
              setTimeout(() => s.targetElement.classList.remove('hud-badge-pop'), 420);
            }
            flyingStars.splice(i, 1);
          }
        }
      }
      requestAnimationFrame(animateConfetti);
    }
    animateConfetti();

    /* Keyboard Shortcuts */
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const capsule = document.getElementById('knowledge-capsule');
        if (capsule && capsule.style.display === 'block') {
          document.getElementById('btn-capsule-next').click();
        }
      }
    });

    /* Init */
    loadSavedState();
    updateGlobalNav();
    updateAudioButtons();

    // Subject switcher pill buttons (Welcome screen & Map screen)
    document.querySelectorAll('.olympiad-pill-btn, .map-subj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        const subKey = btn.dataset.subject;
        switchOlympiadSubject(subKey);
      });
    });

    // Read Aloud TTS button
    const readAloudBtn = document.getElementById('btn-read-aloud');
    if (readAloudBtn) {
      readAloudBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        toggleReadAloud();
      });
    }

    // Sparky Mascot Companion & Settings
    const mascotBtn = document.getElementById('mascot-avatar-btn');
    if (mascotBtn) {
      mascotBtn.addEventListener('click', sparkyFunFact);
    }
    const sparkyToggleBtn = document.getElementById('btn-toggle-sparky-settings');
    if (sparkyToggleBtn) {
      sparkyToggleBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        toggleSparkyVisibility();
      });
    }
    // Initialize Sparky state from localStorage
    if (!isSparkyEnabled()) {
      const widget = document.getElementById('mascot-widget');
      if (widget) widget.classList.add('hidden');
    }
    updateSparkySettingsBtn();

    // Voice Narration Settings Listeners
    const voiceSelect = document.getElementById('settings-voice-select');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        localStorage.setItem('cosmic_quest_voice', e.target.value);
        populateVoiceList();
        testVoiceSample();
      });
    }

    const testVoiceBtn = document.getElementById('btn-test-voice');
    if (testVoiceBtn) {
      testVoiceBtn.addEventListener('click', () => {
        testVoiceSample();
      });
    }

    // Populate voices immediately and after slight delay for browser readiness
    populateVoiceList();
    setTimeout(populateVoiceList, 400);

    // Initialize Full Cosmic Living Canvas Engine
    window.CosmicEngine = new CosmicCanvasEngine();

    // Wire animation performance toggle in Settings modal
    const animToggleBtn = document.getElementById('btn-toggle-anim-settings');
    if (animToggleBtn) {
      const updateAnimBtnState = () => {
        const isFull = localStorage.getItem('cosmic_quest_animations') !== 'reduced';
        animToggleBtn.innerHTML = `<span>✨ Animations: ${isFull ? 'Full Cosmic 🌟' : 'Reduced ⚡'}</span>`;
        animToggleBtn.style.borderColor = isFull ? '#818cf8' : '#cbd5e1';
        animToggleBtn.style.color = isFull ? '#4338ca' : '#64748b';
      };
      updateAnimBtnState();

      animToggleBtn.addEventListener('click', () => {
        Sound.init();
        Sound.playClick();
        if (window.CosmicEngine) {
          window.CosmicEngine.toggleAnimations();
          updateAnimBtnState();
        }
      });
    }

    // PWA Install Prompt Handling
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (!isStandalone && !localStorage.getItem('cq_install_dismissed')) {
        const titleBar = document.getElementById('title-install-bar');
        if (titleBar) titleBar.style.display = 'inline-flex';
        const settingsRow = document.getElementById('row-settings-install');
        if (settingsRow) settingsRow.style.display = 'flex';
      }
    });

    const triggerPwaInstall = () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(() => {
          deferredInstallPrompt = null;
          const titleBar = document.getElementById('title-install-bar');
          if (titleBar) titleBar.style.display = 'none';
        });
      } else {
        alert('To install Cosmic Quest, tap your browser share or menu button and select "Add to Home Screen" 📲');
      }
    };

    const titleInstallBtn = document.getElementById('btn-title-install');
    if (titleInstallBtn) titleInstallBtn.addEventListener('click', triggerPwaInstall);

    const settingsInstallBtn = document.getElementById('btn-settings-install');
    if (settingsInstallBtn) settingsInstallBtn.addEventListener('click', triggerPwaInstall);

    const titleInstallDismissBtn = document.getElementById('btn-title-install-dismiss');
    if (titleInstallDismissBtn) {
      titleInstallDismissBtn.addEventListener('click', () => {
        const titleBar = document.getElementById('title-install-bar');
        if (titleBar) titleBar.style.display = 'none';
        localStorage.setItem('cq_install_dismissed', 'true');
      });
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.log('ServiceWorker registration note:', err);
        });
      });
    }

    // Initialize Title Screen State on page load
    if (typeof updateTitleScreenState === 'function') {
      updateTitleScreenState();
    }
    window.addEventListener('DOMContentLoaded', () => {
      if (typeof updateTitleScreenState === 'function') {
        updateTitleScreenState();
      }
    });
  </script>

  <!-- 2D Dog Action-Adventure Engine (Phaser 3 & Three.js) -->
  <script>
__ADVENTURE_JS__
  </script>
</body>
</html>'''

    full_html = template.replace("__QUESTIONS_JSON__", gk_questions_str)
    full_html = full_html.replace("__ISO_QUESTIONS_JSON__", iso_questions_str)
    full_html = full_html.replace("__IEO_QUESTIONS_JSON__", ieo_questions_str)
    full_html = full_html.replace("__BG_IMAGE_URI__", bg_data_uri)
    full_html = full_html.replace("__ADVENTURE_JS__", adventure_js_str)

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(full_html)

    print("Successfully compiled index.html replicating user reference design 1-to-1!")

if __name__ == "__main__":
    build()
