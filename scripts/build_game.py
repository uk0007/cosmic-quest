#!/usr/bin/env python3
"""
Build script that compiles index.html embedding the full question bank,
Web Audio synthesizer, cosmic UI, game loop, certificate generator, and JSON loader.
"""

def build():
    with open("data/questions.json", "r", encoding="utf-8") as f:
        questions_json_str = f.read()

    template = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cosmic Quest IQ: The Galactic Knowledge Odyssey</title>
  <meta name="description" content="An interactive, beautifully designed space adventure trivia game for 10-year-olds featuring 50 Olympiad GK questions, badges, power-ups, and a printable certificate." />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-dark: #070a14;
      --bg-space: #0c1222;
      --bg-card: rgba(18, 26, 47, 0.88);
      --bg-card-hover: rgba(28, 39, 70, 0.95);
      --border-card: rgba(80, 110, 180, 0.25);
      --cyan: #00f0ff;
      --cyan-glow: rgba(0, 240, 255, 0.35);
      --violet: #a855f7;
      --violet-glow: rgba(168, 85, 247, 0.35);
      --gold: #facc15;
      --gold-glow: rgba(250, 204, 21, 0.4);
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.4);
      --rose: #f43f5e;
      --rose-glow: rgba(244, 63, 94, 0.4);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --font-body: 'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --radius-lg: 24px;
      --radius-md: 16px;
      --radius-sm: 10px;
      --shadow-cosmic: 0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.15);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    body {
      background: radial-gradient(circle at 50% 10%, #151d38 0%, #080c18 60%, #03060c 100%);
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

    /* Starfield Canvas Background */
    #space-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
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
      max-width: 900px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px;
    }

    /* Global Navigation / Header Bar */
    header.cosmic-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: rgba(14, 20, 38, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), #818cf8, var(--gold));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      cursor: pointer;
    }

    .nav-stats {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-pill.stars {
      color: var(--gold);
      border-color: rgba(250, 204, 21, 0.3);
      box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
    }

    .stat-pill.score {
      color: var(--cyan);
      border-color: rgba(0, 240, 255, 0.3);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
    }

    .icon-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--text-main);
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: scale(1.08);
    }

    .icon-btn:active {
      transform: scale(0.95);
    }

    /* Screens Management */
    .screen {
      display: none;
      flex-direction: column;
      flex: 1;
      width: 100%;
      animation: fadeIn 0.35s ease-out forwards;
    }

    .screen.active {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.99); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 28px;
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
      box-shadow: 0 6px 25px rgba(6, 182, 212, 0.45);
    }

    .btn-primary:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 10px 30px rgba(6, 182, 212, 0.65);
    }

    .btn-primary:active {
      transform: translateY(1px) scale(0.98);
    }

    .btn-gold {
      background: linear-gradient(135deg, #f59e0b, #eab308);
      color: #0b0f19;
      box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45);
    }

    .btn-gold:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 10px 30px rgba(245, 158, 11, 0.65);
    }

    .btn-emerald {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff;
      box-shadow: 0 6px 25px rgba(16, 185, 129, 0.45);
    }

    .btn-emerald:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.65);
    }

    .btn-ghost {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }

    /* ========================================================
       SCREEN 1: WELCOME / ONBOARDING
       ======================================================== */
    .welcome-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 36px 28px;
      text-align: center;
      margin: auto 0;
      box-shadow: var(--shadow-cosmic);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(168, 85, 247, 0.18);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #d8b4fe;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .welcome-title {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #ffffff 30%, var(--cyan) 70%, var(--violet) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .welcome-subtitle {
      color: var(--text-muted);
      font-size: 1.15rem;
      max-width: 580px;
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .avatar-selection-box {
      width: 100%;
      max-width: 500px;
      margin-bottom: 28px;
    }

    .avatar-label {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 700;
      color: var(--cyan);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .avatar-tile {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 14px 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .avatar-tile .emoji {
      font-size: 2.4rem;
      transition: transform 0.25s ease;
    }

    .avatar-tile .name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .avatar-tile:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(0, 240, 255, 0.5);
      transform: translateY(-4px);
    }

    .avatar-tile.selected {
      background: rgba(0, 240, 255, 0.15);
      border-color: var(--cyan);
      box-shadow: 0 0 20px var(--cyan-glow);
      transform: translateY(-4px) scale(1.04);
    }

    .avatar-tile.selected .emoji {
      transform: scale(1.2);
    }

    .avatar-tile.selected .name {
      color: var(--cyan);
    }

    .name-input-box {
      width: 100%;
      max-width: 420px;
      margin-bottom: 30px;
    }

    .name-input {
      width: 100%;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.07);
      border: 2px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-family: var(--font-body);
      font-size: 1.15rem;
      text-align: center;
      font-weight: 600;
      transition: all 0.2s ease;
      outline: none;
    }

    .name-input:focus {
      border-color: var(--cyan);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 20px var(--cyan-glow);
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
      font-size: 2rem;
      font-weight: 900;
      background: linear-gradient(135deg, #fff, var(--cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }

    .map-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .sector-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .sector-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .sector-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 6px;
      background: var(--cyan);
      opacity: 0.6;
    }

    .sector-card:hover:not(.locked) {
      transform: translateY(-4px);
      background: var(--bg-card-hover);
      border-color: rgba(0, 240, 255, 0.4);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 240, 255, 0.2);
    }

    .sector-card.locked {
      opacity: 0.55;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }

    .sector-card.locked::before {
      background: #64748b;
    }

    .sector-card.completed::before {
      background: var(--emerald);
      box-shadow: 0 0 12px var(--emerald-glow);
    }

    .sector-main-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sector-icon-box {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
    }

    .sector-text-box h3 {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 4px;
    }

    .sector-text-box p {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .sector-stars-box {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 1.3rem;
    }

    .star-icon {
      color: rgba(255, 255, 255, 0.15);
      transition: color 0.3s ease;
    }

    .star-icon.filled {
      color: var(--gold);
      text-shadow: 0 0 10px var(--gold-glow);
    }

    .sector-badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(250, 204, 21, 0.12);
      border: 1px solid rgba(250, 204, 21, 0.3);
      color: var(--gold);
      margin-top: 6px;
    }

    .map-bottom-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* ========================================================
       SCREEN 3: QUESTION PLAYING HUD
       ======================================================== */
    .game-hud {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .hud-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hud-sector-pill {
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(0, 240, 255, 0.12);
      border: 1px solid rgba(0, 240, 255, 0.3);
      color: var(--cyan);
    }

    .progress-bar-wrap {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
      margin: 0 10px;
      position: relative;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--cyan), var(--violet));
      border-radius: 999px;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 12px var(--cyan-glow);
    }

    .hud-streak {
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 800;
      color: #f97316;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Power-ups Tray */
    .powerups-tray {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 18px;
    }

    .powerup-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--text-main);
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .powerup-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .powerup-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .powerup-count {
      background: rgba(255, 255, 255, 0.15);
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 0.75rem;
    }

    /* Question Container & Card */
    .question-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 28px 24px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-cosmic);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .question-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .topic-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--gold);
      background: rgba(250, 204, 21, 0.12);
      border: 1px solid rgba(250, 204, 21, 0.25);
      padding: 4px 12px;
      border-radius: 999px;
    }

    .q-number-pill {
      font-family: var(--font-display);
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 700;
    }

    .question-stem {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.45;
      color: #fff;
      margin-bottom: 20px;
    }

    /* Rich Stem Elements: Tables & Lists */
    .hots-table-wrapper {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      margin-bottom: 18px;
      font-family: var(--font-body);
      font-size: 0.95rem;
    }

    .clue-box {
      background: rgba(168, 85, 247, 0.1);
      border-left: 3px solid var(--violet);
      padding: 10px 14px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      margin-bottom: 16px;
      font-size: 0.95rem;
    }

    .clue-box p {
      margin-bottom: 4px;
    }

    /* Options Grid */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (min-width: 640px) {
      .options-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .option-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      text-align: left;
      font-family: var(--font-body);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-main);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .option-letter {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.95rem;
      color: var(--cyan);
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .option-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--cyan);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.15);
    }

    .option-btn:hover:not(:disabled) .option-letter {
      background: var(--cyan);
      color: #0b0f19;
    }

    .option-btn.correct {
      background: rgba(16, 185, 129, 0.2) !important;
      border-color: var(--emerald) !important;
      box-shadow: 0 0 20px var(--emerald-glow) !important;
      animation: pulseGreen 0.6s ease;
    }

    .option-btn.correct .option-letter {
      background: var(--emerald) !important;
      color: #fff !important;
    }

    .option-btn.wrong {
      background: rgba(244, 63, 94, 0.2) !important;
      border-color: var(--rose) !important;
      box-shadow: 0 0 20px var(--rose-glow) !important;
      animation: shake 0.4s ease;
    }

    .option-btn.wrong .option-letter {
      background: var(--rose) !important;
      color: #fff !important;
    }

    .option-btn.dimmed {
      opacity: 0.25;
      transform: scale(0.98);
      pointer-events: none;
    }

    @keyframes pulseGreen {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }

    /* ========================================================
       KNOWLEDGE CAPSULE (INSTANT FEEDBACK MODAL / SLIDE-IN)
       ======================================================== */
    .knowledge-capsule {
      display: none;
      background: linear-gradient(135deg, rgba(20, 29, 54, 0.95), rgba(12, 17, 33, 0.98));
      backdrop-filter: blur(24px);
      border: 2px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 24px 26px;
      margin-top: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .capsule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .capsule-verdict {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
    }

    .capsule-verdict.correct {
      color: var(--emerald);
    }

    .capsule-verdict.wrong {
      color: var(--rose);
    }

    .capsule-body {
      font-size: 1.05rem;
      line-height: 1.55;
      color: #e2e8f0;
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: var(--radius-md);
      padding: 14px 18px;
      border-left: 4px solid var(--cyan);
    }

    .capsule-body strong {
      color: var(--cyan);
      font-family: var(--font-display);
    }

    .capsule-actions {
      display: flex;
      justify-content: flex-end;
    }

    /* Hint Bubble */
    .hint-bubble {
      display: none;
      background: rgba(250, 204, 21, 0.12);
      border: 1px solid rgba(250, 204, 21, 0.35);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      margin-bottom: 14px;
      color: #fef08a;
      font-size: 0.95rem;
      animation: fadeIn 0.25s ease;
    }

    /* ========================================================
       SCREEN 4: SECTOR DEBRIEF / SUMMARY
       ======================================================== */
    .debrief-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 36px 28px;
      text-align: center;
      margin: auto 0;
      box-shadow: var(--shadow-cosmic);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .debrief-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 900;
      background: linear-gradient(135deg, #fff, var(--cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    .stars-celebration {
      font-size: 3.2rem;
      margin: 16px 0 24px;
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .debrief-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      width: 100%;
      max-width: 520px;
      margin-bottom: 28px;
    }

    .debrief-stat-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .debrief-stat-box .num {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--cyan);
    }

    .debrief-stat-box .label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .unlocked-badge-alert {
      display: none;
      align-items: center;
      gap: 12px;
      background: rgba(168, 85, 247, 0.18);
      border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 12px 20px;
      border-radius: var(--radius-md);
      margin-bottom: 24px;
      color: #e9d5ff;
      font-size: 1rem;
    }

    .debrief-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* ========================================================
       SCREEN 5: CERTIFICATE & BADGE MODALS
       ======================================================== */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(8px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-box {
      background: #0f172a;
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Certificate Styling (Printable) */
    .certificate-container {
      background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
      border: 4px double var(--gold);
      border-radius: var(--radius-lg);
      padding: 36px 30px;
      text-align: center;
      position: relative;
      box-shadow: 0 0 30px rgba(250, 204, 21, 0.25);
    }

    .cert-corner {
      position: absolute;
      width: 28px;
      height: 28px;
      border: 3px solid var(--gold);
    }
    .cert-corner.top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
    .cert-corner.top-right { top: 10px; right: 10px; border-left: none; border-bottom: none; }
    .cert-corner.bottom-left { bottom: 10px; left: 10px; border-right: none; border-top: none; }
    .cert-corner.bottom-right { bottom: 10px; right: 10px; border-left: none; border-top: none; }

    .cert-banner {
      font-size: 3rem;
      margin-bottom: 8px;
    }

    .cert-header {
      font-family: var(--font-display);
      font-size: 1.1rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 6px;
    }

    .cert-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 900;
      color: #fff;
      margin-bottom: 12px;
    }

    .cert-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 16px;
    }

    .cert-name {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--cyan);
      border-bottom: 2px dashed rgba(0, 240, 255, 0.4);
      display: inline-block;
      padding: 0 20px 4px;
      margin-bottom: 18px;
    }

    .cert-desc {
      font-size: 1rem;
      line-height: 1.5;
      color: #cbd5e1;
      max-width: 480px;
      margin: 0 auto 24px;
    }

    .cert-footer {
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 18px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .cert-sig-line {
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--gold);
    }

    /* Badges Drawer */
    .badge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 14px;
      margin-top: 18px;
    }

    .badge-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 16px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .badge-card.unlocked {
      background: rgba(250, 204, 21, 0.1);
      border-color: rgba(250, 204, 21, 0.4);
      box-shadow: 0 0 15px rgba(250, 204, 21, 0.15);
    }

    .badge-card.locked {
      opacity: 0.4;
      filter: grayscale(1);
    }

    .badge-card .badge-icon {
      font-size: 2.2rem;
    }

    .badge-card .badge-title {
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
    }

    /* Custom Question Importer */
    .import-textarea {
      width: 100%;
      height: 180px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      color: #fff;
      font-family: monospace;
      font-size: 0.85rem;
      padding: 12px;
      margin: 12px 0;
      resize: vertical;
    }

    /* Print styles for certificate */
    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      #space-canvas, #confetti-canvas, header.cosmic-nav, .modal-close-btn, .print-hide {
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
      .cert-title, .cert-desc {
        color: #1e293b !important;
      }
      .cert-name {
        color: #0369a1 !important;
      }
    }
  </style>
</head>
<body>

  <!-- Starfield Canvas -->
  <canvas id="space-canvas"></canvas>
  <!-- Confetti Canvas -->
  <canvas id="confetti-canvas"></canvas>

  <div class="app-container">

    <!-- Cosmic Nav Header -->
    <header class="cosmic-nav">
      <div class="nav-brand" id="btn-go-home" title="Go to Mission Map">
        <span>🚀</span>
        <span>Cosmic Quest IQ</span>
      </div>
      <div class="nav-stats">
        <div class="stat-pill stars" title="Total Stars Earned">
          <span>⭐</span>
          <span id="nav-total-stars">0/15</span>
        </div>
        <div class="stat-pill score" title="Galactic Explorer Points">
          <span>⚡</span>
          <span id="nav-total-score">0</span>
        </div>
        <button class="icon-btn" id="btn-sound-toggle" title="Toggle Sound FX">🔊</button>
        <button class="icon-btn" id="btn-badges-modal" title="View Badges">🏆</button>
        <button class="icon-btn" id="btn-settings-modal" title="Settings & Question Bank">⚙️</button>
      </div>
    </header>

    <!-- ========================================================
         SCREEN 1: WELCOME / ONBOARDING
         ======================================================== -->
    <section class="screen active" id="screen-welcome">
      <div class="welcome-card">
        <div class="welcome-badge">
          <span>✨</span>
          <span>Class 6 Olympiad Edition</span>
        </div>
        <h1 class="welcome-title">Cosmic Knowledge Odyssey</h1>
        <p class="welcome-subtitle">
          Embark on an epic space adventure across 5 planetary sectors! Solve 50 Olympiad questions, unleash laser power-ups, earn cosmic stars, and claim your Galactic Champion Certificate!
        </p>

        <div class="avatar-selection-box">
          <div class="avatar-label">Choose Your Explorer Avatar</div>
          <div class="avatar-grid" id="avatar-grid">
            <div class="avatar-tile selected" data-avatar="fox" data-name="Cosmo Fox">
              <span class="emoji">🦊</span>
              <span class="name">Cosmo Fox</span>
            </div>
            <div class="avatar-tile" data-avatar="owl" data-name="Astro Owl">
              <span class="emoji">🦉</span>
              <span class="name">Astro Owl</span>
            </div>
            <div class="avatar-tile" data-avatar="bear" data-name="Rocket Bear">
              <span class="emoji">🐻</span>
              <span class="name">Rocket Bear</span>
            </div>
            <div class="avatar-tile" data-avatar="dragon" data-name="Nova Dragon">
              <span class="emoji">🐲</span>
              <span class="name">Nova Dragon</span>
            </div>
          </div>
        </div>

        <div class="name-input-box">
          <input type="text" id="player-name-input" class="name-input" placeholder="Enter Your Cadet Name..." maxlength="20" value="Cadet Alex" />
        </div>

        <button class="btn btn-primary" id="btn-start-quest">
          <span>Launch Mission</span>
          <span>🚀</span>
        </button>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 2: MISSION CONTROL / SECTOR MAP
         ======================================================== -->
    <section class="screen" id="screen-map">
      <div class="map-header">
        <h2 class="map-title">Mission Control Map</h2>
        <p class="map-subtitle">Select a planetary sector to explore. Earn stars to become a Galactic Master!</p>
      </div>

      <div class="sector-grid" id="sector-grid">
        <!-- Rendered dynamically -->
      </div>

      <div class="map-bottom-actions">
        <button class="btn btn-gold" id="btn-view-certificate" style="display:none;">
          <span>👑 View Galactic Certificate</span>
        </button>
        <button class="btn btn-ghost" id="btn-review-questions">
          <span>📖 Review Question Bank</span>
        </button>
      </div>
    </section>

    <!-- ========================================================
         SCREEN 3: QUESTION GAMEPLAY
         ======================================================== -->
    <section class="screen" id="screen-game">
      <!-- HUD -->
      <div class="game-hud">
        <div class="hud-left">
          <button class="icon-btn" id="btn-exit-to-map" title="Back to Sector Map">⬅️</button>
          <span class="hud-sector-pill" id="hud-sector-name">Sector 1</span>
        </div>

        <div class="progress-bar-wrap" title="Sector Progress">
          <div class="progress-bar-fill" id="hud-progress-fill" style="width: 10%;"></div>
        </div>

        <div class="hud-streak" id="hud-streak-box">
          <span>🔥</span>
          <span id="hud-streak-count">0 Streak</span>
        </div>

        <div class="stat-pill score" style="padding: 4px 10px; font-size: 0.8rem;">
          <span id="hud-question-points">+100</span>
        </div>
      </div>

      <!-- Power-ups Bar -->
      <div class="powerups-tray">
        <button class="powerup-btn" id="pu-laser" title="50:50 Laser - Eliminate 2 wrong choices">
          <span>✂️ 50:50 Laser</span>
          <span class="powerup-count" id="pu-laser-count">1</span>
        </button>
        <button class="powerup-btn" id="pu-hint" title="Cosmic Clue - Get a helpful hint">
          <span>💡 Star Hint</span>
          <span class="powerup-count" id="pu-hint-count">1</span>
        </button>
        <button class="powerup-btn" id="pu-time" title="Time Freeze - Adds +30 seconds buffer">
          <span>⏳ Time Freeze</span>
          <span class="powerup-count" id="pu-time-count">1</span>
        </button>
      </div>

      <!-- Hint bubble -->
      <div class="hint-bubble" id="hint-bubble">
        <span>💡 <strong>Star Hint:</strong> </span>
        <span id="hint-text">Clue goes here!</span>
      </div>

      <!-- Question Card -->
      <div class="question-card">
        <div class="question-meta-row">
          <span class="topic-tag" id="q-topic-tag">Botany</span>
          <span class="q-number-pill" id="q-number-pill">Question 1 / 10</span>
        </div>

        <div class="question-stem" id="q-stem">
          Which carnivorous plant catches insects by snapping its modified leaf lobes shut in less than a second?
        </div>

        <!-- Injected HOTS visual elements (table/clues) if present -->
        <div id="q-rich-content"></div>

        <!-- 4 Options -->
        <div class="options-grid" id="options-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- Micro-Learning Knowledge Capsule (Slide-Up) -->
      <div class="knowledge-capsule" id="knowledge-capsule">
        <div class="capsule-header">
          <div class="capsule-verdict" id="capsule-verdict">
            <span>🎉</span>
            <span>Stellar Work!</span>
          </div>
          <span class="stat-pill" id="capsule-points">+100 PTS</span>
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
          <span style="font-size: 2rem;">🏆</span>
          <div>
            <strong>New Badge Unlocked:</strong>
            <div id="debrief-badge-name" style="color: var(--gold); font-weight: 800;">Nature Scout</div>
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

  </div><!-- /app-container -->

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
            <div style="font-size: 0.8rem; text-transform: uppercase;">Final Score</div>
            <div class="cert-sig-line" id="cert-final-score">4,800 PTS</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase;">Honor Rank</div>
            <div class="cert-sig-line" id="cert-rank">Galactic Grandmaster 👑</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase;">Date Issued</div>
            <div class="cert-sig-line" id="cert-date">Sep 13, 2026</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; display: flex; justify-content: center; gap: 12px;" class="print-hide">
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
      <h2 style="font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 6px;">🏆 Explorer Badges</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Unlock honors by conquering each planetary sector and maintaining high streaks!</p>

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
      <h2 style="font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 6px;">⚙️ Mission Settings</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Manage sound, game progress, and load new custom question sets.</p>

      <div style="margin: 20px 0; display: flex; flex-direction: column; gap: 14px;">
        <button class="btn btn-ghost" id="btn-export-questions">
          <span>📥 Export Current Questions (JSON)</span>
        </button>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
          <h4 style="font-family: var(--font-display); color: var(--cyan); margin-bottom: 6px;">Load Custom Question Pack</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Paste your JSON array of questions to instantly create a new custom quiz!</p>
          <textarea class="import-textarea" id="custom-json-input" placeholder="Paste JSON question array here..."></textarea>
          <button class="btn btn-primary" id="btn-import-questions" style="width: 100%; font-size: 0.95rem;">
            <span>🚀 Load Custom Question Bank</span>
          </button>
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
          <button class="btn btn-ghost" id="btn-reset-progress" style="color: var(--rose); border-color: rgba(244,63,94,0.3); width: 100%;">
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
      <h2 style="font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 6px;">📖 Olympiad Question Review</h2>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;">Browse all 50 questions, correct answers, and rich scientific explanations.</p>

      <div id="review-questions-list" style="display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto; padding-right: 6px;">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>

  <!-- ========================================================
       GAME LOGIC & AUDIO ENGINE SCRIPT
       ======================================================== -->
  <script>
    /* Default Embedded Question Bank */
    const DEFAULT_QUESTIONS = __QUESTIONS_JSON__;

    /* Web Audio API Zero-Dependency Sound Synthesizer */
    class CosmicSoundEngine {
      constructor() {
        this.ctx = null;
        this.enabled = true;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      playClick() {
        if (!this.enabled || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } catch(e) {}
      }

      playCorrect() {
        if (!this.enabled || !this.ctx) return;
        try {
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.08);
            osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
          });
        } catch(e) {}
      }

      playWrong() {
        if (!this.enabled || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, this.ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.26);
        } catch(e) {}
      }

      playPowerup() {
        if (!this.enabled || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.26);
        } catch(e) {}
      }

      playVictory() {
        if (!this.enabled || !this.ctx) return;
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
              osc.frequency.setValueAtTime(freq, this.ctx.currentTime + cIdx * 0.16);
              gain.gain.setValueAtTime(0.2, this.ctx.currentTime + cIdx * 0.16);
              gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + cIdx * 0.16 + 0.35);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(this.ctx.currentTime + cIdx * 0.16);
              osc.stop(this.ctx.currentTime + cIdx * 0.16 + 0.36);
            });
          });
        } catch(e) {}
      }
    }

    /* Global Game State Store */
    const Sound = new CosmicSoundEngine();

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
      totalScore: 0,
      sectorStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sectorHighScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
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
        hint: 1,
        time: 1
      },
      activeQuestionAnswered: false,
      questionsBank: DEFAULT_QUESTIONS
    };

    /* Load from localStorage if present */
    function loadSavedState() {
      try {
        const saved = localStorage.getItem('cosmic_quest_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.playerName) gameState.playerName = parsed.playerName;
          if (parsed.avatar) gameState.avatar = parsed.avatar;
          if (parsed.avatarEmoji) gameState.avatarEmoji = parsed.avatarEmoji;
          if (parsed.totalScore) gameState.totalScore = parsed.totalScore;
          if (parsed.sectorStars) gameState.sectorStars = parsed.sectorStars;
          if (parsed.sectorHighScores) gameState.sectorHighScores = parsed.sectorHighScores;
          if (parsed.unlockedBadges) gameState.unlockedBadges = parsed.unlockedBadges;
        }
      } catch(e) {}
    }

    function saveState() {
      try {
        const toSave = {
          playerName: gameState.playerName,
          avatar: gameState.avatar,
          avatarEmoji: gameState.avatarEmoji,
          totalScore: gameState.totalScore,
          sectorStars: gameState.sectorStars,
          sectorHighScores: gameState.sectorHighScores,
          unlockedBadges: gameState.unlockedBadges
        };
        localStorage.setItem('cosmic_quest_state', JSON.stringify(toSave));
      } catch(e) {}
    }

    /* Screen Transitions */
    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      updateGlobalNav();
    }

    function updateGlobalNav() {
      const totalStars = Object.values(gameState.sectorStars).reduce((a, b) => a + b, 0);
      document.getElementById('nav-total-stars').textContent = `${totalStars}/15`;
      document.getElementById('nav-total-score').textContent = gameState.totalScore.toLocaleString();
    }

    /* Modal Helpers */
    function openModal(modalId) {
      document.getElementById(modalId).classList.add('active');
    }

    function closeModal(modalId) {
      document.getElementById(modalId).classList.remove('active');
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

    document.getElementById('btn-start-quest').addEventListener('click', () => {
      Sound.init();
      Sound.playClick();
      const nameInput = document.getElementById('player-name-input').value.trim();
      if (nameInput) {
        gameState.playerName = nameInput;
      }
      saveState();
      renderSectorMap();
      showScreen('screen-map');
    });

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

      SECTOR_METADATA.forEach((sec, idx) => {
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

        card.innerHTML = `
          <div class="sector-main-info">
            <div class="sector-icon-box">${sec.icon}</div>
            <div class="sector-text-box">
              <h3>Sector ${sec.id}: ${sec.name}</h3>
              <p>${sec.desc} (Questions ${(sec.id-1)*10 + 1}–${sec.id*10})</p>
              <div class="sector-badge-tag">${sec.badge}</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            <div class="sector-stars-box">${isUnlocked ? starsHtml : '🔒 Locked'}</div>
            ${gameState.sectorHighScores[sec.id] ? `<span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">High: ${gameState.sectorHighScores[sec.id]}</span>` : ''}
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
      gameState.powerups = { laser: 1, hint: 1, time: 1 };

      // Filter questions for this sector
      gameState.sectorQuestions = gameState.questionsBank.filter(q => q.sector === sectorId);
      if (gameState.sectorQuestions.length === 0) {
        // Fallback if custom pack is smaller
        gameState.sectorQuestions = gameState.questionsBank.slice((sectorId - 1) * 10, sectorId * 10);
      }

      updatePowerupUI();
      renderQuestion();
      showScreen('screen-game');
    }

    function updatePowerupUI() {
      document.getElementById('pu-laser-count').textContent = gameState.powerups.laser;
      document.getElementById('pu-laser').disabled = gameState.powerups.laser <= 0;

      document.getElementById('pu-hint-count').textContent = gameState.powerups.hint;
      document.getElementById('pu-hint').disabled = gameState.powerups.hint <= 0;

      document.getElementById('pu-time-count').textContent = gameState.powerups.time;
      document.getElementById('pu-time').disabled = gameState.powerups.time <= 0;

      document.getElementById('hint-bubble').style.display = 'none';
    }

    function renderQuestion() {
      gameState.activeQuestionAnswered = false;
      document.getElementById('knowledge-capsule').style.display = 'none';
      document.getElementById('hint-bubble').style.display = 'none';

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const totalInSector = gameState.sectorQuestions.length;

      // Update HUD
      document.getElementById('hud-sector-name').textContent = `Sector ${gameState.currentSector}: ${q.sectorName || 'Mission'}`;
      const progressPct = ((gameState.currentQuestionIndex + 1) / totalInSector) * 100;
      document.getElementById('hud-progress-fill').style.width = `${progressPct}%`;

      document.getElementById('hud-streak-count').textContent = `${gameState.currentStreak} Streak`;
      const multiplier = 1 + (Math.min(gameState.currentStreak, 5) * 0.2);
      document.getElementById('hud-question-points').textContent = `+${Math.round(100 * multiplier)} PTS`;

      document.getElementById('q-topic-tag').textContent = `${q.sectorIcon || '🚀'} ${q.topic}`;
      document.getElementById('q-number-pill').textContent = `Question ${gameState.currentQuestionIndex + 1} of ${totalInSector}`;

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
            <div class="hots-column">
              <pre style="font-family: inherit; white-space: pre-wrap; line-height: 1.6; color: #f8fafc;">${remaining}</pre>
            </div>
          </div>
        `;
      } else if (qText.includes('Identify the country from the following clues') || qText.includes('Identify the organ from the biological clues')) {
        const lines = qText.split('\\n').filter(l => l.trim().length > 0);
        document.getElementById('q-stem').textContent = lines[0];
        const clueLines = lines.slice(1).map(l => `<p>🔹 ${l.trim()}</p>`).join('');
        richBox.innerHTML = `<div class="clue-box">${clueLines}</div>`;
      } else {
        document.getElementById('q-stem').textContent = qText;
      }

      // Render 4 options
      const optGrid = document.getElementById('options-grid');
      optGrid.innerHTML = '';

      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = idx;
        btn.innerHTML = `
          <span class="option-letter">${letters[idx]}</span>
          <span class="option-text">${opt}</span>
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

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const isCorrect = selectedIndex === q.answerIndex;
      const allOptionBtns = document.querySelectorAll('.option-btn');

      if (isCorrect) {
        Sound.playCorrect();
        triggerConfetti(selectedBtn);
        selectedBtn.classList.add('correct');

        gameState.currentStreak += 1;
        if (gameState.currentStreak > gameState.bestSectorStreak) {
          gameState.bestSectorStreak = gameState.currentStreak;
        }

        const streakMultiplier = 1 + (Math.min(gameState.currentStreak - 1, 5) * 0.2);
        const earnedPoints = Math.round(100 * streakMultiplier);
        gameState.sectorScore += earnedPoints;
        gameState.sectorCorrectCount += 1;

        document.getElementById('capsule-verdict').innerHTML = `<span>🎉</span><span>Stellar Work! Correct!</span>`;
        document.getElementById('capsule-verdict').className = 'capsule-verdict correct';
        document.getElementById('capsule-points').textContent = `+${earnedPoints} PTS`;
      } else {
        Sound.playWrong();
        selectedBtn.classList.add('wrong');
        gameState.currentStreak = 0;

        // Highlight correct button
        allOptionBtns.forEach(btn => {
          if (parseInt(btn.dataset.index) === q.answerIndex) {
            btn.classList.add('correct');
          }
        });

        document.getElementById('capsule-verdict').innerHTML = `<span>🚀</span><span>Great Effort!</span>`;
        document.getElementById('capsule-verdict').className = 'capsule-verdict wrong';
        document.getElementById('capsule-points').textContent = `Correct: (${q.answerLetter})`;
      }

      // Disable other options
      allOptionBtns.forEach(btn => {
        if (btn !== selectedBtn && parseInt(btn.dataset.index) !== q.answerIndex) {
          btn.classList.add('dimmed');
        }
      });

      // Show Knowledge Capsule explanation
      document.getElementById('capsule-explanation').textContent = q.explanation;
      document.getElementById('knowledge-capsule').style.display = 'block';

      // Update streak in HUD
      document.getElementById('hud-streak-count').textContent = `${gameState.currentStreak} Streak`;
    }

    /* Next Question / Debrief */
    document.getElementById('btn-capsule-next').addEventListener('click', () => {
      Sound.playClick();
      gameState.currentQuestionIndex += 1;
      if (gameState.currentQuestionIndex < gameState.sectorQuestions.length) {
        renderQuestion();
      } else {
        finishSectorGame();
      }
    });

    /* Power-ups Handlers */
    document.getElementById('pu-laser').addEventListener('click', () => {
      if (gameState.powerups.laser <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playPowerup();
      gameState.powerups.laser -= 1;
      updatePowerupUI();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== q.answerIndex);
      wrongIndices.sort(() => Math.random() - 0.5);
      const toEliminate = wrongIndices.slice(0, 2);

      document.querySelectorAll('.option-btn').forEach(btn => {
        const idx = parseInt(btn.dataset.index);
        if (toEliminate.includes(idx)) {
          btn.classList.add('dimmed');
          btn.disabled = true;
          btn.style.textDecoration = 'line-through';
        }
      });
    });

    document.getElementById('pu-hint').addEventListener('click', () => {
      if (gameState.powerups.hint <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playPowerup();
      gameState.powerups.hint -= 1;
      updatePowerupUI();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      document.getElementById('hint-text').textContent = q.hint || "Think about the key clues in the question stem!";
      document.getElementById('hint-bubble').style.display = 'block';
    });

    document.getElementById('pu-time').addEventListener('click', () => {
      if (gameState.powerups.time <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playPowerup();
      gameState.powerups.time -= 1;
      updatePowerupUI();

      const bubble = document.getElementById('hint-bubble');
      document.getElementById('hint-text').textContent = "⏳ Time Freeze Activated: Relax Cadet, you have unlimited time on this question!";
      bubble.style.display = 'block';
    });

    document.getElementById('btn-exit-to-map').addEventListener('click', () => {
      Sound.playClick();
      renderSectorMap();
      showScreen('screen-map');
    });

    /* ========================================================
       SECTOR COMPLETION & REWARDS
       ======================================================== */
    function finishSectorGame() {
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

      const sectorMeta = SECTOR_METADATA.find(s => s.id === gameState.currentSector);
      let newBadge = null;
      if (sectorMeta && !gameState.unlockedBadges.includes(sectorMeta.badge)) {
        gameState.unlockedBadges.push(sectorMeta.badge);
        newBadge = sectorMeta.badge;
      }

      const totalStars = Object.values(gameState.sectorStars).reduce((a, b) => a + b, 0);
      if (totalStars >= 13 && !gameState.unlockedBadges.includes('Cosmic Grandmaster')) {
        gameState.unlockedBadges.push('Cosmic Grandmaster');
      }

      saveState();
      Sound.playVictory();

      document.getElementById('debrief-sector-title').textContent = `${sectorMeta ? sectorMeta.name : 'Sector'} Cleared!`;
      
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span class="star-icon ${s <= stars ? 'filled' : ''}">⭐</span>`;
      }
      document.getElementById('debrief-stars').innerHTML = starsHtml;

      document.getElementById('debrief-score').textContent = gameState.sectorScore;
      document.getElementById('debrief-accuracy').textContent = `${pct}%`;
      document.getElementById('debrief-streak').textContent = gameState.bestSectorStreak;

      const badgeAlert = document.getElementById('debrief-badge-alert');
      if (newBadge) {
        badgeAlert.style.display = 'flex';
        document.getElementById('debrief-badge-name').textContent = newBadge;
      } else {
        badgeAlert.style.display = 'none';
      }

      showScreen('screen-debrief');
    }

    document.getElementById('btn-debrief-next').addEventListener('click', () => {
      Sound.playClick();
      if (gameState.currentSector < 5) {
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
          <div style="font-size:0.75rem; color:var(--text-muted);">${isUnlocked ? 'Unlocked 🎉' : b.desc}</div>
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
        item.style.cssText = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px;';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="font-weight:700; color:var(--cyan); font-size:0.9rem;">Q${q.id}: ${q.topic}</span>
            <span style="font-size:0.8rem; color:var(--gold);">Sector ${q.sector}</span>
          </div>
          <div style="font-weight:600; margin-bottom:8px; font-size:0.95rem; line-height:1.4;">${q.question.replace(/\\n/g, '<br>')}</div>
          <div style="color:var(--emerald); font-size:0.9rem; font-weight:700; margin-bottom:4px;">
            Correct Answer: (${q.answerLetter}) ${q.options[q.answerIndex]}
          </div>
          <div style="color:var(--text-muted); font-size:0.85rem; line-height:1.4; background: rgba(0,0,0,0.2); padding: 8px 10px; border-radius: 8px;">
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

    /* Sound Toggle */
    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
      Sound.init();
      Sound.enabled = !Sound.enabled;
      document.getElementById('btn-sound-toggle').textContent = Sound.enabled ? '🔊' : '🔇';
    });

    /* ========================================================
       BACKGROUND STARFIELD & CONFETTI PARTICLES
       ======================================================== */
    const spaceCanvas = document.getElementById('space-canvas');
    const spaceCtx = spaceCanvas.getContext('2d');
    let stars = [];

    function resizeSpace() {
      spaceCanvas.width = window.innerWidth;
      spaceCanvas.height = window.innerHeight;
      stars = [];
      const numStars = Math.floor((spaceCanvas.width * spaceCanvas.height) / 4000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * spaceCanvas.width,
          y: Math.random() * spaceCanvas.height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random(),
          speed: Math.random() * 0.01 + 0.003
        });
      }
    }

    function animateSpace() {
      spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        spaceCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
        spaceCtx.beginPath();
        spaceCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        spaceCtx.fill();
      });
      requestAnimationFrame(animateSpace);
    }

    window.addEventListener('resize', resizeSpace);
    resizeSpace();
    animateSpace();

    /* Confetti Burst */
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiParticles = [];

    function triggerConfetti(sourceElement) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
      
      const rect = sourceElement ? sourceElement.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const colors = ['#00f0ff', '#a855f7', '#facc15', '#10b981', '#f43f5e', '#ffffff'];
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 10 + 4;
        confettiParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 2,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5
        });
      }
    }

    function animateConfetti() {
      if (confettiParticles.length > 0) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25; // gravity
          p.alpha -= p.decay;
          p.rotation += p.rotationSpeed;

          confettiCtx.save();
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rotation * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          confettiCtx.globalAlpha = Math.max(0, p.alpha);
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          confettiCtx.restore();

          if (p.alpha <= 0) {
            confettiParticles.splice(index, 1);
          }
        });
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
  </script>
</body>
</html>'''

    full_html = template.replace("__QUESTIONS_JSON__", questions_json_str)

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(full_html)

    print("Successfully compiled index.html with all 50 questions, Web Audio engine, and cosmic UI!")

if __name__ == "__main__":
    build()
