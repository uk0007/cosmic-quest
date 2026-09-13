#!/usr/bin/env python3
"""
Build script that compiles index.html with:
1. Bright, vibrant, playful, and colourful light-theme design (kids age 10 love this).
2. Upbeat, cheerful, catchy arcade background music synthesized natively via Web Audio API.
3. 3 Hints per sector with large floating side screen power-ups station (Hint !, 50-50, Clock Freeze).
4. Full 50 GK Olympiad questions bank with rich HOTS support.
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
  <meta name="description" content="An interactive, super colourful and upbeat trivia adventure game for 10-year-olds with 50 Olympiad questions, power-ups, avatars, and a printable certificate!" />
  
  <!-- Google Fonts: Fredoka (rounded fun), Outfit (punchy headers), Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">

  <style>
    :root {
      /* Bright, Joyful, Candy Palette */
      --bg-gradient: linear-gradient(135deg, #e0f2fe 0%, #fef08a 32%, #fce7f3 68%, #ede9fe 100%);
      --card-bg: rgba(255, 255, 255, 0.92);
      --card-border: rgba(255, 255, 255, 0.95);
      --card-shadow: 0 14px 34px rgba(99, 102, 241, 0.12), 0 6px 0 #cbd5e1;
      
      /* Vibrant Accents */
      --sky-blue: #0ea5e9;
      --sky-blue-deep: #0284c7;
      --candy-pink: #f43f5e;
      --candy-pink-deep: #e11d48;
      --sun-yellow: #f59e0b;
      --sun-yellow-deep: #d97706;
      --mint-green: #10b981;
      --mint-green-deep: #059669;
      --violet: #8b5cf6;
      --violet-deep: #7c3aed;
      
      /* Text */
      --text-main: #1e293b;
      --text-muted: #64748b;
      --text-light: #475569;
      
      /* Typography */
      --font-body: 'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      
      --radius-xl: 32px;
      --radius-lg: 24px;
      --radius-md: 18px;
      --radius-sm: 12px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    body {
      background: var(--bg-gradient);
      background-attachment: fixed;
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

    /* Cheerful Animated Background Clouds & Sparkles */
    .bg-cloud {
      position: fixed;
      background: rgba(255, 255, 255, 0.55);
      border-radius: 999px;
      filter: blur(12px);
      pointer-events: none;
      z-index: 1;
      animation: floatCloud 22s ease-in-out infinite alternate;
    }
    .cloud-1 {
      width: 450px;
      height: 220px;
      top: -40px;
      left: -80px;
    }
    .cloud-2 {
      width: 500px;
      height: 260px;
      bottom: -60px;
      right: -100px;
      animation-duration: 28s;
    }
    .cloud-3 {
      width: 320px;
      height: 160px;
      top: 35%;
      left: 10%;
      animation-duration: 18s;
      opacity: 0.4;
    }

    @keyframes floatCloud {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(35px, 20px) scale(1.06); }
      100% { transform: translate(-25px, 35px) scale(0.96); }
    }

    /* Starfield Canvas Background */
    #space-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2;
      opacity: 0.6;
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
      padding: 14px 22px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(16px);
      border: 2px solid #ffffff;
      border-radius: var(--radius-lg);
      margin-bottom: 20px;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.08), 0 4px 0 #e2e8f0;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 900;
      background: linear-gradient(135deg, #0284c7, #8b5cf6 50%, #f43f5e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      cursor: pointer;
      letter-spacing: -0.5px;
    }

    .nav-stats {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 999px;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      box-shadow: 0 3px 0 rgba(0, 0, 0, 0.06);
    }

    .stat-pill.stars {
      background: #fef9c3;
      color: #b45309;
      border: 2px solid #fde047;
    }

    .stat-pill.score {
      background: #e0f2fe;
      color: #0369a1;
      border: 2px solid #bae6fd;
    }

    .icon-btn {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      color: var(--text-main);
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.25rem;
      box-shadow: 0 4px 0 #cbd5e1;
      transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .icon-btn:hover {
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #cbd5e1;
    }

    .icon-btn:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #cbd5e1;
    }

    /* Screens Management */
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
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* 3D Tactile Buttons (Nintendo / Duolingo Style) */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 32px;
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      border-radius: var(--radius-md);
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

    .btn-gold:active {
      transform: translateY(3px);
      box-shadow: 0 3px 0 #d97706;
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

    .btn-ghost:active {
      transform: translateY(2px);
      box-shadow: 0 3px 0 #cbd5e1;
    }

    /* ========================================================
       SCREEN 1: WELCOME / ONBOARDING
       ======================================================== */
    .welcome-card {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 3px solid var(--card-border);
      border-radius: var(--radius-xl);
      padding: 42px 32px;
      text-align: center;
      margin: auto 0;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
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
      color: var(--text-light);
      font-size: 1.2rem;
      max-width: 600px;
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
      color: var(--sky-blue-deep);
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
      border-color: var(--sky-blue-deep);
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
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }

    .map-subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .sector-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .sector-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 3px solid #ffffff;
      border-radius: var(--radius-xl);
      padding: 22px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: var(--card-shadow);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .sector-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 8px;
      background: var(--sky-blue);
    }

    .sector-card:hover:not(.locked) {
      transform: translateY(-4px);
      box-shadow: 0 18px 36px rgba(99, 102, 241, 0.18), 0 8px 0 #cbd5e1;
      border-color: #bae6fd;
    }

    .sector-card.locked {
      opacity: 0.55;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }

    .sector-card.locked::before {
      background: #94a3b8;
    }

    .sector-card.completed::before {
      background: var(--mint-green);
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
      background: #f0f9ff;
      border: 2px solid #bae6fd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.3rem;
      flex-shrink: 0;
      box-shadow: 0 4px 0 #bae6fd;
    }

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
       SCREEN 3: QUESTION PLAYING HUD
       ======================================================== */
    .game-hud {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border: 2px solid #ffffff;
      border-radius: var(--radius-lg);
      padding: 14px 20px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.08), 0 4px 0 #e2e8f0;
    }

    .hud-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hud-sector-pill {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 999px;
      background: #e0f2fe;
      border: 2px solid #bae6fd;
      color: #0369a1;
    }

    .progress-bar-wrap {
      flex: 1;
      height: 12px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin: 0 10px;
      position: relative;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #8b5cf6, #f43f5e);
      border-radius: 999px;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .hud-streak {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 800;
      color: #ea580c;
      display: flex;
      align-items: center;
      gap: 4px;
      background: #ffedd5;
      padding: 4px 12px;
      border-radius: 999px;
      border: 2px solid #fed7aa;
    }

    /* ========================================================
       LARGE FLOATING SIDE POWER-UPS STATION (CLOCK / ARCADE STYLE)
       ======================================================== */
    .floating-powerups-station {
      position: fixed;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(18px);
      border: 3px solid #ffffff;
      border-radius: 36px;
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      box-shadow: 0 14px 40px rgba(99, 102, 241, 0.2), 0 6px 0 #cbd5e1;
      animation: floatStation 3.5s ease-in-out infinite alternate;
    }

    @keyframes floatStation {
      0% { transform: translateY(-50%); }
      100% { transform: translateY(-54%); }
    }

    .station-title {
      font-family: var(--font-display);
      font-size: 0.78rem;
      font-weight: 900;
      color: #6366f1;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      margin-bottom: 4px;
    }

    /* Large Floating Candy Orb Buttons */
    .floating-orb-btn {
      width: 66px;
      height: 66px;
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

    .floating-orb-btn .orb-icon {
      font-size: 1.65rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .floating-orb-btn .orb-label {
      font-family: var(--font-display);
      font-size: 0.68rem;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-top: 3px;
      text-transform: uppercase;
    }

    /* Floating Count Badge */
    .floating-orb-btn .orb-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ef4444;
      color: #fff;
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }

    /* Hint Orb (Bright Sunshine Yellow with !) */
    .floating-orb-btn.hint-orb {
      background: linear-gradient(135deg, #fef08a, #facc15);
      box-shadow: 0 6px 0 #d97706, 0 10px 20px rgba(245, 158, 11, 0.35);
      color: #78350f;
    }
    .floating-orb-btn.hint-orb .orb-badge {
      background: #e11d48;
    }
    .floating-orb-btn.hint-orb:hover:not(:disabled) {
      transform: scale(1.12);
      box-shadow: 0 8px 0 #d97706, 0 14px 25px rgba(245, 158, 11, 0.45);
    }

    /* 50-50 Orb (Sky Blue) */
    .floating-orb-btn.laser-orb {
      background: linear-gradient(135deg, #bae6fd, #38bdf8);
      box-shadow: 0 6px 0 #0284c7, 0 10px 20px rgba(14, 165, 233, 0.35);
      color: #0369a1;
    }
    .floating-orb-btn.laser-orb .orb-badge {
      background: #0284c7;
    }
    .floating-orb-btn.laser-orb:hover:not(:disabled) {
      transform: scale(1.12);
      box-shadow: 0 8px 0 #0284c7, 0 14px 25px rgba(14, 165, 233, 0.45);
    }

    /* Time Freeze Orb (Clock / Lilac Purple) */
    .floating-orb-btn.time-orb {
      background: linear-gradient(135deg, #ddd6fe, #a78bfa);
      box-shadow: 0 6px 0 #7c3aed, 0 10px 20px rgba(139, 92, 246, 0.35);
      color: #5b21b6;
    }
    .floating-orb-btn.time-orb .orb-badge {
      background: #7c3aed;
    }
    .floating-orb-btn.time-orb:hover:not(:disabled) {
      transform: scale(1.12);
      box-shadow: 0 8px 0 #7c3aed, 0 14px 25px rgba(139, 92, 246, 0.45);
    }

    .floating-orb-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
      transform: none !important;
      box-shadow: 0 2px 0 #94a3b8 !important;
    }

    /* Mobile Responsive Dock for Floating Station */
    @media (max-width: 860px) {
      .floating-powerups-station {
        position: fixed;
        right: 12px;
        bottom: 16px;
        top: auto;
        transform: none;
        flex-direction: row;
        border-radius: 999px;
        padding: 8px 14px;
        gap: 14px;
        animation: none;
      }
      .station-title {
        display: none;
      }
      .floating-orb-btn {
        width: 56px;
        height: 56px;
      }
      .floating-orb-btn .orb-icon {
        font-size: 1.35rem;
      }
      .floating-orb-btn .orb-label {
        display: none;
      }
    }

    /* Question Container & Card */
    .question-card {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 3px solid #ffffff;
      border-radius: var(--radius-xl);
      padding: 32px 28px;
      margin-bottom: 20px;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .question-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .topic-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      color: #92400e;
      background: #fef3c7;
      border: 2px solid #fde68a;
      padding: 6px 16px;
      border-radius: 999px;
    }

    .q-number-pill {
      font-family: var(--font-display);
      font-size: 0.95rem;
      color: var(--text-muted);
      font-weight: 800;
    }

    .question-stem {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 800;
      line-height: 1.45;
      color: #0f172a;
      margin-bottom: 24px;
    }

    /* Rich Stem Elements: Tables & Lists */
    .hots-table-wrapper {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: 20px;
      font-family: var(--font-body);
      font-size: 1rem;
      box-shadow: 0 4px 0 #e2e8f0;
    }

    .clue-box {
      background: #f5f3ff;
      border: 2px solid #ddd6fe;
      border-left: 6px solid var(--violet);
      padding: 14px 18px;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
      font-size: 1.05rem;
      color: #4c1d95;
    }

    .clue-box p {
      margin-bottom: 6px;
    }

    /* Options Grid (Colourful and Distinct) */
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
      background: #ffffff;
      border: 3px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      text-align: left;
      font-family: var(--font-body);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      box-shadow: 0 5px 0 #cbd5e1;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    /* Distinct Option Colours */
    .option-btn:nth-child(1) {
      border-color: #fbcfe8;
    }
    .option-btn:nth-child(1) .option-letter {
      background: #fdf2f8;
      color: #db2777;
      border: 2px solid #f472b6;
    }

    .option-btn:nth-child(2) {
      border-color: #bae6fd;
    }
    .option-btn:nth-child(2) .option-letter {
      background: #f0f9ff;
      color: #0284c7;
      border: 2px solid #38bdf8;
    }

    .option-btn:nth-child(3) {
      border-color: #fde68a;
    }
    .option-btn:nth-child(3) .option-letter {
      background: #fefce8;
      color: #b45309;
      border: 2px solid #facc15;
    }

    .option-btn:nth-child(4) {
      border-color: #a7f3d0;
    }
    .option-btn:nth-child(4) .option-letter {
      background: #f0fdf4;
      color: #059669;
      border: 2px solid #34d399;
    }

    .option-letter {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 1.1rem;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .option-btn:hover:not(:disabled) {
      transform: translateY(-4px);
      box-shadow: 0 9px 0 #cbd5e1;
    }

    .option-btn.correct {
      background: #ecfdf5 !important;
      border-color: #10b981 !important;
      box-shadow: 0 6px 0 #059669, 0 10px 20px rgba(16, 185, 129, 0.3) !important;
      animation: pulseGreen 0.6s ease;
    }

    .option-btn.correct .option-letter {
      background: #10b981 !important;
      color: #fff !important;
      border-color: #10b981 !important;
    }

    .option-btn.wrong {
      background: #fff1f2 !important;
      border-color: #f43f5e !important;
      box-shadow: 0 6px 0 #e11d48, 0 10px 20px rgba(244, 63, 94, 0.3) !important;
      animation: shake 0.4s ease;
    }

    .option-btn.wrong .option-letter {
      background: #f43f5e !important;
      color: #fff !important;
      border-color: #f43f5e !important;
    }

    .option-btn.dimmed {
      opacity: 0.3;
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
       KNOWLEDGE CAPSULE (INSTANT FEEDBACK MODAL / SLIDE-IN)
       ======================================================== */
    .knowledge-capsule {
      display: none;
      background: #ffffff;
      border: 3px solid #e2e8f0;
      border-radius: var(--radius-xl);
      padding: 26px 28px;
      margin-top: 18px;
      box-shadow: 0 16px 45px rgba(99, 102, 241, 0.2), 0 6px 0 #cbd5e1;
      animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .capsule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
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
      margin-bottom: 22px;
      background: #f8fafc;
      border-radius: var(--radius-md);
      padding: 18px 22px;
      border-left: 6px solid var(--sky-blue-deep);
      border: 2px solid #e2e8f0;
      border-left-width: 6px;
      border-left-color: var(--sky-blue-deep);
    }

    .capsule-body strong {
      color: var(--sky-blue-deep);
      font-family: var(--font-display);
    }

    .capsule-actions {
      display: flex;
      justify-content: flex-end;
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
       SCREEN 4: SECTOR DEBRIEF / SUMMARY
       ======================================================== */
    .debrief-card {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 3px solid var(--card-border);
      border-radius: var(--radius-xl);
      padding: 40px 32px;
      text-align: center;
      margin: auto 0;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
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
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 0 #cbd5e1;
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
       SCREEN 5: CERTIFICATE & BADGE MODALS
       ======================================================== */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      z-index: 2000;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-box {
      background: #ffffff;
      border: 3px solid #e2e8f0;
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.35);
      position: relative;
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
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: 18px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 0 #cbd5e1;
    }

    .badge-card.unlocked {
      background: #fef9c3;
      border-color: #facc15;
      box-shadow: 0 4px 0 #eab308;
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

    /* Custom Question Importer */
    .import-textarea {
      width: 100%;
      height: 180px;
      background: #f8fafc;
      border: 2px solid #cbd5e1;
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: monospace;
      font-size: 0.9rem;
      padding: 14px;
      margin: 14px 0;
      resize: vertical;
    }

    /* Print styles for certificate */
    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      #space-canvas, #confetti-canvas, .bg-cloud, header.cosmic-nav, .floating-powerups-station, .modal-close-btn, .print-hide {
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

  <!-- Cheerful Ambient Background Clouds -->
  <div class="bg-cloud cloud-1"></div>
  <div class="bg-cloud cloud-2"></div>
  <div class="bg-cloud cloud-3"></div>

  <!-- Sparkles Canvas -->
  <canvas id="space-canvas"></canvas>
  <!-- Confetti Canvas -->
  <canvas id="confetti-canvas"></canvas>

  <!-- Large Floating Side Screen Power-ups Station (Clock / Arcade Style) -->
  <aside class="floating-powerups-station" id="floating-powerups" style="display: none;">
    <div class="station-title">POWERS</div>

    <!-- Power-up 1: Hint with bold '!' symbol, 3 counts per sector -->
    <button class="floating-orb-btn hint-orb" id="pu-hint" title="Star Clue (3 per sector)">
      <span class="orb-badge" id="pu-hint-count">3</span>
      <span class="orb-icon">!</span>
      <span class="orb-label">Hint</span>
    </button>

    <!-- Power-up 2: 50-50 Laser -->
    <button class="floating-orb-btn laser-orb" id="pu-laser" title="50:50 Laser - Eliminate 2 wrong choices">
      <span class="orb-badge" id="pu-laser-count">1</span>
      <span class="orb-icon">✂️</span>
      <span class="orb-label">50:50</span>
    </button>

    <!-- Power-up 3: Time Freeze (Clock / Stopwatch) -->
    <button class="floating-orb-btn time-orb" id="pu-time" title="Time Freeze Clock - Relaxed thinking">
      <span class="orb-badge" id="pu-time-count">1</span>
      <span class="orb-icon">⏱️</span>
      <span class="orb-label">Freeze</span>
    </button>
  </aside>

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
        <button class="icon-btn" id="btn-music-toggle" title="Toggle Upbeat Background Music">🎵</button>
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
          Embark on a super fun, colourful adventure across 5 planetary sectors! Solve 50 Olympiad questions, unleash floating power-ups, earn cosmic stars, and win your Champion Certificate!
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
        <p class="map-subtitle">Pick a colourful sector to explore and earn 3 shiny stars in each!</p>
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

        <div class="stat-pill score" style="padding: 6px 12px; font-size: 0.9rem;">
          <span id="hud-question-points">+100</span>
        </div>
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
          <span class="stat-pill" id="capsule-points" style="background: #e0f2fe; color: #0369a1; border: 2px solid #bae6fd;">+100 PTS</span>
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
      <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 18px; font-weight: 600;">Browse all 50 questions, correct answers, and scientific explanations.</p>

      <div id="review-questions-list" style="display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto; padding-right: 6px;">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>

  <!-- ========================================================
       UPBEAT ARCADE AUDIO SYNTHESIZER & GAME LOGIC
       ======================================================== */
  -->
  <script>
    /* Default Embedded Question Bank */
    const DEFAULT_QUESTIONS = __QUESTIONS_JSON__;

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
            // Snare / pop on offbeat
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

      playCorrect() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
            gain.gain.setValueAtTime(0.28, this.ctx.currentTime + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.07 + 0.22);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(this.ctx.currentTime + idx * 0.07);
            osc.stop(this.ctx.currentTime + idx * 0.07 + 0.23);
          });
        } catch(e) {}
      }

      playWrong() {
        if (!this.sfxEnabled || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, this.ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.24);
          gain.gain.setValueAtTime(0.24, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.24);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
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
    }

    /* Global Game State Store */
    const Sound = new UpbeatAudioEngine();

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
        hint: 3, // 3 hints per sector!
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

      // Show/Hide Floating Powerups Station only during Question Gameplay
      const floatingStation = document.getElementById('floating-powerups');
      if (screenId === 'screen-game') {
        floatingStation.style.display = 'flex';
      } else {
        floatingStation.style.display = 'none';
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
      gameState.sectorQuestions = gameState.questionsBank.filter(q => q.sector === sectorId);
      if (gameState.sectorQuestions.length === 0) {
        gameState.sectorQuestions = gameState.questionsBank.slice((sectorId - 1) * 10, sectorId * 10);
      }

      updatePowerupUI();
      renderQuestion();
      showScreen('screen-game');
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
            <pre style="font-family: inherit; white-space: pre-wrap; line-height: 1.6; color: #1e293b; font-weight: 600;">${remaining}</pre>
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

    /* Floating Power-ups Handlers */
    // 1. Hint Power-up (Available 3 times per sector)
    document.getElementById('pu-hint').addEventListener('click', () => {
      if (gameState.powerups.hint <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playPowerup();
      gameState.powerups.hint -= 1;
      updatePowerupUI();

      const q = gameState.sectorQuestions[gameState.currentQuestionIndex];
      document.getElementById('hint-text').textContent = q.hint || "Think about the key clues in the question stem!";
      document.getElementById('hint-bubble').style.display = 'block';
    });

    // 2. 50:50 Laser Power-up
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

    // 3. Time Freeze Clock Power-up
    document.getElementById('pu-time').addEventListener('click', () => {
      if (gameState.powerups.time <= 0 || gameState.activeQuestionAnswered) return;
      Sound.playPowerup();
      gameState.powerups.time -= 1;
      updatePowerupUI();

      const bubble = document.getElementById('hint-bubble');
      document.getElementById('hint-text').textContent = "⏱️ Time Freeze Clock Activated: Relax Cadet, your timer is frozen with unlimited time!";
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
       BACKGROUND SPARKLES & CONFETTI PARTICLES
       ======================================================== */
    const spaceCanvas = document.getElementById('space-canvas');
    const spaceCtx = spaceCanvas.getContext('2d');
    let stars = [];

    function resizeSpace() {
      spaceCanvas.width = window.innerWidth;
      spaceCanvas.height = window.innerHeight;
      stars = [];
      const numStars = Math.floor((spaceCanvas.width * spaceCanvas.height) / 4500);
      const starColors = ['#0284c7', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * spaceCanvas.width,
          y: Math.random() * spaceCanvas.height,
          radius: Math.random() * 2 + 1,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.015 + 0.005
        });
      }
    }

    function animateSpace() {
      spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 0.8 || s.alpha < 0.2) s.speed = -s.speed;
        spaceCtx.fillStyle = s.color;
        spaceCtx.globalAlpha = Math.abs(s.alpha);
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
          rotationSpeed: Math.random() * 12 - 6
        });
      }
    }

    function animateConfetti() {
      if (confettiParticles.length > 0) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.28; // gravity
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
    updateAudioButtons();
  </script>
</body>
</html>'''

    full_html = template.replace("__QUESTIONS_JSON__", questions_json_str)

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(full_html)

    print("Successfully compiled index.html with light, colourful, joyful theme and upbeat arcade music!")

if __name__ == "__main__":
    build()
