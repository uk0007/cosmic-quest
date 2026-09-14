/**
 * Cosmic Quest IQ: 2D Stylized Action-Adventure Platformer Engine
 * Powered by Phaser 3 & Three.js with Dog Player & Knowledge Gates
 */

(function(window) {
  'use strict';

  /* ========================================================
     1. THREE.JS CELESTIAL BACKGROUND & PORTAL EFFECTS
     ======================================================== */
  class Background3D {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas || typeof THREE === 'undefined') {
        console.warn('Three.js or canvas not available for 3D background.');
        return;
      }

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
      this.camera.position.z = 600;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.gatePortals = [];
      this.initStarfield();
      this.initCosmicPlanet();
      this.initGatePortals();

      this.scrollOffset = 0;
      this.animFrameId = null;

      window.addEventListener('resize', () => this.onResize());
      this.animate();
    }

    initStarfield() {
      const starCount = 900;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      const colorChoices = [
        new THREE.Color('#38bdf8'), // cyan
        new THREE.Color('#a78bfa'), // violet
        new THREE.Color('#facc15'), // gold
        new THREE.Color('#ffffff')  // white
      ];

      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2400;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

        const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 3.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });

      this.starPoints = new THREE.Points(geometry, material);
      this.scene.add(this.starPoints);
    }

    initCosmicPlanet() {
      const geo = new THREE.SphereGeometry(65, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        wireframe: true,
        transparent: true,
        opacity: 0.22
      });
      this.planet = new THREE.Mesh(geo, mat);
      // Position high in the cosmic sky to act as a distant celestial moon
      this.planet.position.set(450, 360, -420);
      this.scene.add(this.planet);

      // Planet Ring
      const ringGeo = new THREE.RingGeometry(85, 110, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28
      });
      this.planetRing = new THREE.Mesh(ringGeo, ringMat);
      this.planetRing.rotation.x = Math.PI / 2.5;
      this.planet.add(this.planetRing);
    }

    initGatePortals() {
      // 3 Portal rings corresponding to gates at x=750, 1500, 2300
      this.portalRings = [];
      for (let i = 0; i < 3; i++) {
        const torusGeo = new THREE.TorusGeometry(42, 3.5, 16, 48);
        const torusMat = new THREE.MeshBasicMaterial({
          color: 0x8b5cf6,
          transparent: true,
          opacity: 0.4
        });
        const mesh = new THREE.Mesh(torusGeo, torusMat);
        mesh.visible = false;
        this.scene.add(mesh);
        this.portalRings.push(mesh);
      }
    }

    update(phaserCameraX) {
      this.scrollOffset = phaserCameraX || 0;
      if (this.starPoints) {
        this.starPoints.position.x = -this.scrollOffset * 0.12;
      }
      if (this.planet) {
        this.planet.position.x = 450 - this.scrollOffset * 0.05;
        this.planet.rotation.y += 0.003;
      }
    }

    setLevelTheme(levelNum) {
      if (!this.planet || !this.planetRing) return;
      if (levelNum === 2) {
        this.planet.material.color.setHex(0xa855f7); // Amethyst Purple
        this.planetRing.material.color.setHex(0x10b981); // Emerald Ring
      } else if (levelNum === 3) {
        this.planet.material.color.setHex(0x38bdf8); // Celestial Cyan
        this.planetRing.material.color.setHex(0xfacc15); // Golden Star Ring
      } else {
        this.planet.material.color.setHex(0x7c3aed); // Cosmic Violet
        this.planetRing.material.color.setHex(0x38bdf8); // Cyan Ring
      }
    }

    triggerGateBurst(gateIndex) {
      if (!this.portalRings[gateIndex]) return;
      const portal = this.portalRings[gateIndex];
      portal.visible = true;
      portal.material.color.setHex(0x10b981); // emerald green
      portal.material.opacity = 0.9;
      portal.scale.set(1, 1, 1);

      let scale = 1;
      const expand = () => {
        scale += 0.08;
        portal.scale.set(scale, scale, 1);
        portal.material.opacity -= 0.04;
        if (portal.material.opacity > 0) {
          requestAnimationFrame(expand);
        } else {
          portal.visible = false;
          portal.material.color.setHex(0x8b5cf6);
          portal.material.opacity = 0.4;
        }
      };
      expand();
    }

    onResize() {
      if (!this.renderer || !this.camera) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
      this.animFrameId = requestAnimationFrame(() => this.animate());
      if (this.starPoints) {
        this.starPoints.rotation.y += 0.0003;
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    destroy() {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }

  /* ========================================================
     2. ENEMY CONFIGURATION & MULTI-LEVEL BIOMES
     ======================================================== */
  const ENEMY_CONFIG = {
    groundSpeed: 75,
    flySpeed: 65,
    flyHoverRadius: 22,
    damage: 10,
    stompReward: 150,
    bounceVelocity: -340,
    invulnerabilityDuration: 1200,
    knockbackSpeedX: 220,
    knockbackSpeedY: -180
  };

  const PROJECTILE_CONFIG = {
    speed: 720,             // px/s forward velocity
    lifetime: 1050,         // ms max flight duration
    cooldown: 300,          // ms fire rate limiter
    damage: 1,              // damage dealt per hit
    defeatScore: 100,       // points for ranged projectile defeat
    offsetX: 38,            // px forward from dog center
    offsetY: 2,             // px vertical offset from dog center
    poolSize: 14            // maximum active/pooled projectiles
  };

  const LEVEL_CONFIGS = {
    1: {
      id: 1,
      name: "Nebula Plains",
      subtitle: "Verdant Alien Surface",
      levelWidth: 3200,
      totalBones: 10,
      totalCrystals: 3,
      backdrop: 'mountains',
      backdropTint: null,
      groundBackdrop: 'ground_1',
      groundFloor: 'platform',
      groundFloorTint: null,
      steppingTexture: 'platform',
      themeColor: '#818cf8',
      exitType: 'cave', // animated cave portal
      platformSpots: [
        { x: 440, y: -110 },
        { x: 1240, y: -125 },
        { x: 1400, y: -215 },
        { x: 2000, y: -125 },
        { x: 2160, y: -210 },
        { x: 2280, y: -120 }
      ],
      movingSpots: [],
      scenery: [
        { type: 'tree_1', x: 220, scale: 0.58, depth: 2 },
        { type: 'tree_2', x: 620, scale: 0.52, depth: 2 },
        { type: 'rock_1', x: 360, scale: 0.5, depth: 3 },
        { type: 'stone_1', x: 1220, scale: 0.6, depth: 3 },
        { type: 'rune_stone', x: 1340, scale: 0.7, depth: 3 },
        { type: 'tree_1', x: 1460, scale: 0.62, depth: 2 },
        { type: 'tree_2', x: 1980, scale: 0.55, depth: 2 },
        { type: 'rock_1', x: 2080, scale: 0.55, depth: 3 },
        { type: 'stone_1', x: 2680, scale: 0.6, depth: 3 },
        { type: 'tree_1', x: 2740, scale: 0.58, depth: 2 },
        { type: 'rune_stone', x: 2800, scale: 0.7, depth: 3 }
      ],
      boneOffsets: [
        { x: 260, y: -50 },
        { x: 440, y: -165 },
        { x: 620, y: -50 },
        { x: 1240, y: -180 },
        { x: 1400, y: -270 },
        { x: 1480, y: -50 },
        { x: 2000, y: -175 },
        { x: 2160, y: -265 },
        { x: 2280, y: -175 },
        { x: 2700, y: -50 }
      ],
      crystalOffsets: [
        { x: 480, y: -165 },
        { x: 1400, y: -270 },
        { x: 2160, y: -265 }
      ],
      gateLocations: [780, 1540, 2340],
      enemies: [
        { type: 'ground', x: 480, y: -45, minX: 380, maxX: 640, speed: 70 },
        { type: 'fly', x: 1080, y: -130, minX: 960, maxX: 1200, speed: 60 },
        { type: 'ground', x: 1380, y: -45, minX: 1260, maxX: 1480, speed: 75 },
        { type: 'ground', x: 1980, y: -45, minX: 1840, maxX: 2160, speed: 80 }
      ],
      exitX: 2850
    },

    2: {
      id: 2,
      name: "Crystal Caverns",
      subtitle: "Subterranean Amethyst Grotto",
      levelWidth: 3400,
      totalBones: 12,
      totalCrystals: 4,
      backdrop: 'mountains',
      backdropTint: 0x6d28d9, // deep amethyst purple
      groundBackdrop: 'ground_cavern',
      groundFloor: 'platform',
      groundFloorTint: 0xa78bfa, // crystal glow
      steppingTexture: 'platform',
      themeColor: '#a855f7',
      exitType: 'portal',
      platformSpots: [
        { x: 400, y: -115 },
        { x: 1260, y: -130 },
        { x: 1440, y: -120 },
        { x: 2020, y: -125 },
        { x: 2320, y: -125 }
      ],
      movingSpots: [
        { x: 640, y: -180, distanceX: 160, distanceY: 0, duration: 2400 },
        { x: 1320, y: -230, distanceX: 0, distanceY: -110, duration: 2200 },
        { x: 2100, y: -190, distanceX: 160, distanceY: 0, duration: 2500 },
        { x: 2280, y: -220, distanceX: 0, distanceY: -120, duration: 2300 }
      ],
      scenery: [
        { type: 'crystal_cluster', x: 220, scale: 0.9, depth: 2 },
        { type: 'cavern_rock', x: 360, scale: 0.65, depth: 3 },
        { type: 'rune_tablet', x: 540, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 700, scale: 0.95, depth: 2 },
        { type: 'cavern_rock', x: 1220, scale: 0.7, depth: 3 },
        { type: 'crystal_cluster', x: 1440, scale: 0.85, depth: 2 },
        { type: 'rune_tablet', x: 1500, scale: 0.85, depth: 3 },
        { type: 'crystal_cluster', x: 2020, scale: 1.0, depth: 2 },
        { type: 'cavern_rock', x: 2140, scale: 0.75, depth: 3 },
        { type: 'crystal_cluster', x: 2280, scale: 0.9, depth: 2 },
        { type: 'rune_tablet', x: 2720, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 2840, scale: 1.05, depth: 2 }
      ],
      boneOffsets: [
        { x: 250, y: -50 },
        { x: 400, y: -170 },
        { x: 640, y: -240 },
        { x: 740, y: -50 },
        { x: 1260, y: -180 },
        { x: 1320, y: -290 },
        { x: 1440, y: -175 },
        { x: 2020, y: -180 },
        { x: 2100, y: -250 },
        { x: 2280, y: -280 },
        { x: 2720, y: -50 },
        { x: 2880, y: -50 }
      ],
      crystalOffsets: [
        { x: 640, y: -240 },
        { x: 1320, y: -300 },
        { x: 2100, y: -250 },
        { x: 2280, y: -290 }
      ],
      gateLocations: [820, 1580, 2400],
      enemies: [
        { type: 'ground', x: 440, y: -45, minX: 320, maxX: 580, speed: 75 },
        { type: 'fly', x: 680, y: -130, minX: 580, maxX: 760, speed: 65 },
        { type: 'ground', x: 1100, y: -45, minX: 980, maxX: 1220, speed: 75 },
        { type: 'fly', x: 1440, y: -140, minX: 1350, maxX: 1520, speed: 65 },
        { type: 'ground', x: 1920, y: -45, minX: 1780, maxX: 2060, speed: 80 },
        { type: 'ground', x: 2650, y: -45, minX: 2520, maxX: 2820, speed: 85 }
      ],
      exitX: 3000
    },

    3: {
      id: 3,
      name: "Starlight Summit",
      subtitle: "High Celestial Citadel",
      levelWidth: 3600,
      totalBones: 15,
      totalCrystals: 5,
      backdrop: 'mountains_summit',
      backdropTint: 0x0284c7, // luminous sky cyan
      groundBackdrop: 'ground_1',
      groundFloor: 'platform',
      groundFloorTint: 0x38bdf8,
      steppingTexture: 'cloud_platform',
      themeColor: '#38bdf8',
      exitType: 'master_gate',
      platformSpots: [
        { x: 380, y: -115 },
        { x: 1240, y: -130 },
        { x: 1440, y: -125 },
        { x: 2040, y: -130 },
        { x: 2320, y: -125 },
        { x: 2880, y: -130 }
      ],
      movingSpots: [
        { x: 620, y: -200, distanceX: 0, distanceY: -140, duration: 2500 },
        { x: 1340, y: -210, distanceX: 160, distanceY: 0, duration: 2400 },
        { x: 1480, y: -200, distanceX: 0, distanceY: -140, duration: 2500 },
        { x: 2120, y: -210, distanceX: 160, distanceY: 0, duration: 2400 },
        { x: 2800, y: -200, distanceX: 0, distanceY: -140, duration: 2500 }
      ],
      scenery: [
        { type: 'tree_1', x: 200, scale: 0.6, depth: 2 },
        { type: 'rune_stone', x: 340, scale: 0.7, depth: 3 },
        { type: 'rune_tablet', x: 520, scale: 0.85, depth: 3 },
        { type: 'tree_1', x: 1240, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 1360, scale: 0.75, depth: 3 },
        { type: 'tree_2', x: 1460, scale: 0.55, depth: 2 },
        { type: 'rune_tablet', x: 2020, scale: 0.85, depth: 3 },
        { type: 'tree_1', x: 2160, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 2300, scale: 0.75, depth: 3 },
        { type: 'tree_2', x: 2400, scale: 0.55, depth: 2 },
        { type: 'rune_tablet', x: 2780, scale: 0.85, depth: 3 },
        { type: 'tree_1', x: 2980, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 3120, scale: 0.8, depth: 3 }
      ],
      boneOffsets: [
        { x: 240, y: -50 },
        { x: 380, y: -170 },
        { x: 620, y: -260 },
        { x: 740, y: -50 },
        { x: 1240, y: -185 },
        { x: 1340, y: -270 },
        { x: 1440, y: -180 },
        { x: 1480, y: -265 },
        { x: 2040, y: -185 },
        { x: 2120, y: -270 },
        { x: 2320, y: -180 },
        { x: 2800, y: -265 },
        { x: 2880, y: -185 },
        { x: 3050, y: -50 },
        { x: 3200, y: -50 }
      ],
      crystalOffsets: [
        { x: 620, y: -270 },
        { x: 1340, y: -280 },
        { x: 1480, y: -275 },
        { x: 2120, y: -280 },
        { x: 2800, y: -275 }
      ],
      gateLocations: [800, 1600, 2450],
      enemies: [
        { type: 'ground', x: 450, y: -45, minX: 320, maxX: 580, speed: 80 },
        { type: 'fly', x: 680, y: -150, minX: 580, maxX: 750, speed: 70 },
        { type: 'ground', x: 1140, y: -45, minX: 1000, maxX: 1260, speed: 80 },
        { type: 'fly', x: 1420, y: -150, minX: 1300, maxX: 1540, speed: 75 },
        { type: 'ground', x: 2000, y: -45, minX: 1850, maxX: 2180, speed: 85 },
        { type: 'fly', x: 2750, y: -160, minX: 2600, maxX: 2900, speed: 75 }
      ],
      exitX: 3300
    }
  };

  /* ========================================================
     3. ADVENTURE GAME STATE & BRIDGES
     ======================================================== */
  const AdventureState = {
    currentLevel: 1,
    energy: 100,
    maxEnergy: 100,
    bones: 0,
    totalBonesInLevel: 10,
    diamonds: 0,
    totalDiamondsInLevel: 3,
    score: 0,
    streak: 0,
    checkpointX: 140,
    checkpointY: 420,
    gatesTotal: 3,
    gatesCleared: 0,
    activeGateIndex: -1,
    activeQuestion: null,
    gateTimerInterval: null,
    gateTimerSecs: 60,
    gateTimerFrozen: false,
    powerups: { hint: 3, laser: 1, freeze: 1 },
    capsuleCountdownInterval: null,
    isPaused: false,

    reset(levelNum = 1) {
      this.currentLevel = levelNum;
      const cfg = LEVEL_CONFIGS[levelNum] || LEVEL_CONFIGS[1];
      this.totalBonesInLevel = cfg.totalBones;
      this.energy = 100;
      this.bones = 0;
      this.diamonds = 0;
      this.totalDiamondsInLevel = 3;
      this.score = 0;
      this.streak = 0;
      this.checkpointX = 140;
      this.checkpointY = 420;
      this.gatesCleared = 0;
      this.activeGateIndex = -1;
      this.activeQuestion = null;
      this.gateTimerFrozen = false;
      this.powerups = { hint: 3, laser: 1, freeze: 1 };
      this.isPaused = false;
      this.updateHud();
    },

    modifyEnergy(delta) {
      this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + delta));
      this.updateHud();
      if (this.energy <= 0) {
        this.handleOutOfEnergy();
      }
    },

    addScore(pts) {
      const multiplier = 1 + (Math.min(this.streak, 5) * 0.2);
      const earned = Math.round(pts * multiplier);
      this.score += earned;
      this.updateHud();
      return earned;
    },

    updateHud() {
      const fillEl = document.getElementById('adv-energy-fill');
      const textEl = document.getElementById('adv-energy-text');
      const bonesEl = document.getElementById('adv-bones-text');
      const diamondsEl = document.getElementById('adv-diamonds-text');
      const scoreEl = document.getElementById('adv-score-text');
      const streakEl = document.getElementById('adv-streak-text');
      const levelTitleEl = document.getElementById('adv-hud-level-title');

      const cfg = LEVEL_CONFIGS[this.currentLevel] || LEVEL_CONFIGS[1];
      if (levelTitleEl) {
        levelTitleEl.textContent = `🐕 Level ${this.currentLevel}: ${cfg.name}`;
      }

      if (fillEl) {
        const pct = (this.energy / this.maxEnergy) * 100;
        fillEl.style.width = `${pct}%`;
        fillEl.style.background = pct > 50 
          ? 'linear-gradient(90deg, #10b981, #34d399)' 
          : (pct > 25 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #f43f5e, #fb7185)');
      }
      if (textEl) textEl.textContent = `${this.energy}%`;
      if (bonesEl) bonesEl.textContent = `${this.bones} / ${this.totalBonesInLevel}`;
      if (diamondsEl) diamondsEl.textContent = `${this.diamonds} / ${this.totalDiamondsInLevel}`;
      if (scoreEl) scoreEl.textContent = `${this.score.toLocaleString()} PTS`;
      if (streakEl) streakEl.textContent = `${this.streak}`;
    },

    handleOutOfEnergy() {
      if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
      if (window.setSparkyMessage) {
        window.setSparkyMessage("⚠️ <strong>Out of Energy!</strong> Don't give up Cadet! Respawning at your last checkpoint! 🚀");
      }
      setTimeout(() => {
        this.energy = 50;
        this.updateHud();
        if (window.currentAdventureScene) {
          window.currentAdventureScene.respawnDog();
        }
      }, 1200);
    }
  };

  /* ========================================================
     4. PHASER 3 ADVENTURE SCENES
     ======================================================== */
  class AdventurePreloadScene extends Phaser.Scene {
    constructor() {
      super({ key: 'AdventurePreloadScene' });
    }

    preload() {
      const p = 'assets/adventure/';
      // Dog Animation Spritesheets (171x128 per frame)
      this.load.spritesheet('dog_idle', p + 'dog_idle.png', { frameWidth: 171, frameHeight: 128 });
      this.load.spritesheet('dog_walk', p + 'dog_walk.png', { frameWidth: 171, frameHeight: 128 });
      this.load.spritesheet('dog_sniff', p + 'dog_sniff.png', { frameWidth: 171, frameHeight: 128 });
      this.load.spritesheet('dog_bone', p + 'dog_bone.png', { frameWidth: 171, frameHeight: 128 });

      // Animated Cave Portal (260x340 per frame)
      this.load.spritesheet('cave_anim', p + 'cave_anim.png', { frameWidth: 260, frameHeight: 340 });

      // Environment & Biomes
      this.load.image('ground_1', p + 'ground_1.png');
      this.load.image('ground_cavern', p + 'ground_cavern.png');
      this.load.image('platform', p + 'platform.png');
      this.load.image('cloud_platform', p + 'cloud_platform.png');
      this.load.image('tree_1', p + 'tree_1.png');
      this.load.image('tree_2', p + 'tree_2.png');
      this.load.image('rock_1', p + 'rock_1.png');
      this.load.image('stone_1', p + 'stone_1.png');
      this.load.image('cavern_rock', p + 'cavern_rock.png');
      this.load.image('mountains', p + 'mountains.png');
      this.load.image('mountains_summit', p + 'mountains_summit.png');
      this.load.image('cloud', p + 'cloud.png');
      this.load.image('gate_door', p + 'gate_door.png');
      this.load.image('gate_barrier', p + 'gate_barrier.png');
      this.load.image('bone', p + 'bone.png');
      this.load.image('crystal', p + 'crystal.png');
      this.load.image('crystal_cluster', p + 'crystal_cluster.png');
      this.load.image('special_diamond', p + 'special_diamond.png');
      this.load.image('rune_stone', p + 'rune_stone.png');
      this.load.image('rune_tablet', p + 'rune_tablet.png');
    }

    create() {
      // Register Dog Animations
      this.anims.create({
        key: 'dog-idle',
        frames: this.anims.generateFrameNumbers('dog_idle', { start: 0, end: 11 }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: 'dog-walk',
        frames: this.anims.generateFrameNumbers('dog_walk', { start: 0, end: 13 }),
        frameRate: 15,
        repeat: -1
      });

      this.anims.create({
        key: 'dog-sniff',
        frames: this.anims.generateFrameNumbers('dog_sniff', { start: 0, end: 11 }),
        frameRate: 10,
        repeat: 0
      });

      this.anims.create({
        key: 'dog-bone',
        frames: this.anims.generateFrameNumbers('dog_bone', { start: 0, end: 15 }),
        frameRate: 12,
        repeat: -1
      });

      // Register Cave Portal Glow Animation
      this.anims.create({
        key: 'cave-glow',
        frames: this.anims.generateFrameNumbers('cave_anim', { start: 0, end: 15 }),
        frameRate: 8,
        repeat: -1
      });

      // Generate Procedural Enemy Art (Ground Robo-Crab & Cosmo Drone)
      this.generateEnemyTextures();
      this.generateProjectileTextures();

      this.scene.start('AdventureLevelScene', { level: AdventureState.currentLevel || 1 });
    }

    generateEnemyTextures() {
      // 1. Cute Ground Alien Robo-Crab / Beetle (48x36)
      if (!this.textures.exists('enemy_ground')) {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');

        // Outer Carapace Dome
        const grad = ctx.createLinearGradient(0, 8, 0, 32);
        grad.addColorStop(0, '#f43f5e'); // Rose/Crimson outer dome
        grad.addColorStop(0.5, '#be123c');
        grad.addColorStop(1, '#881337');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(24, 22, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fecdd3';
        ctx.stroke();

        // Cyber Visor Eyes
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(18, 20, 4, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(30, 20, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Antennae
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(16, 12);
        ctx.lineTo(12, 4);
        ctx.moveTo(32, 12);
        ctx.lineTo(36, 4);
        ctx.stroke();

        // Antenna Orbs
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(12, 4, 3, 0, Math.PI * 2);
        ctx.arc(36, 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Mechanical Legs
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, 28); ctx.lineTo(4, 34);
        ctx.moveTo(18, 30); ctx.lineTo(14, 35);
        ctx.moveTo(30, 30); ctx.lineTo(34, 35);
        ctx.moveTo(38, 28); ctx.lineTo(44, 34);
        ctx.stroke();

        this.textures.addCanvas('enemy_ground', canvas);
      }

      // 2. Cute Cosmo Drone / Astro-Orb (44x40)
      if (!this.textures.exists('enemy_fly')) {
        const canvas = document.createElement('canvas');
        canvas.width = 44;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // Spherical Saucer Hull
        const grad = ctx.createRadialGradient(22, 18, 2, 22, 18, 16);
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(0.6, '#7e22ce');
        grad.addColorStop(1, '#3b0764');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(22, 18, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f3e8ff';
        ctx.stroke();

        // Stabilizer Fins
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(8, 18); ctx.lineTo(0, 14); ctx.lineTo(6, 22); ctx.closePath();
        ctx.moveTo(36, 18); ctx.lineTo(44, 14); ctx.lineTo(38, 22); ctx.closePath();
        ctx.fill();

        // Scanning Visor Eye
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(22, 18, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(20, 17, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Plasma Thruster Flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(17, 31);
        ctx.lineTo(22, 39);
        ctx.lineTo(27, 31);
        ctx.closePath();
        ctx.fill();

        this.textures.addCanvas('enemy_fly', canvas);
      }
    }

    generateProjectileTextures() {
      // 3. Cosmic Pulse Magical Energy Orb (28x28)
      if (!this.textures.exists('cosmic_pulse')) {
        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        const ctx = canvas.getContext('2d');

        // Outer Aura Glow (Purple/Violet)
        const auraGrad = ctx.createRadialGradient(14, 14, 2, 14, 14, 13);
        auraGrad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
        auraGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.7)');
        auraGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(14, 14, 13, 0, Math.PI * 2);
        ctx.fill();

        // Inner Radiant Cyan Core
        const coreGrad = ctx.createRadialGradient(14, 14, 1, 14, 14, 7);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#38bdf8');
        coreGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(14, 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sparkling Diamond Glint in Center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(13, 13, 2, 0, Math.PI * 2);
        ctx.fill();

        this.textures.addCanvas('cosmic_pulse', canvas);
      }
    }
  }

  /* ========================================================
     5. REUSABLE ENEMY BASE CLASS & PATROL MODULE
     ======================================================== */
  class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, config = {}) {
      super(scene, x, y, textureKey);
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.startX = x;
      this.startY = y;
      this.enemyType = config.type || 'ground';
      this.patrolMinX = (config.minX !== undefined) ? config.minX : (x - 120);
      this.patrolMaxX = (config.maxX !== undefined) ? config.maxX : (x + 120);
      this.speed = config.speed || (this.enemyType === 'fly' ? ENEMY_CONFIG.flySpeed : ENEMY_CONFIG.groundSpeed);
      this.direction = config.initialDirection || 1;
      this.hp = config.hp || 1;
      this.initialHp = this.hp;
      this.isDefeated = false;
      this.hoverRadius = config.hoverRadius || ENEMY_CONFIG.flyHoverRadius;
      this.hoverPhase = Math.random() * Math.PI * 2;

      this.setDepth(4);
      if (this.enemyType === 'ground') {
        this.body.setCollideWorldBounds(true);
        this.body.setSize(38, 28);
        this.body.setOffset(5, 6);
        this.setVelocityX(this.speed * this.direction);
      } else {
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(34, 30);
        this.body.setOffset(5, 5);
        this.setVelocityX(this.speed * this.direction);
      }
    }

    update(time, delta) {
      if (this.isDefeated || !this.body) return;

      if (this.enemyType === 'ground') {
        // Reverse direction at bounds or when hitting solid obstacles
        if (this.x >= this.patrolMaxX && this.direction > 0) {
          this.direction = -1;
          this.setVelocityX(-this.speed);
          this.setFlipX(true);
        } else if (this.x <= this.patrolMinX && this.direction < 0) {
          this.direction = 1;
          this.setVelocityX(this.speed);
          this.setFlipX(false);
        } else if (this.body.blocked.right && this.direction > 0) {
          this.direction = -1;
          this.setVelocityX(-this.speed);
          this.setFlipX(true);
        } else if (this.body.blocked.left && this.direction < 0) {
          this.direction = 1;
          this.setVelocityX(this.speed);
          this.setFlipX(false);
        } else {
          this.setVelocityX(this.speed * this.direction);
        }
        // Subtle walking breathing squish
        this.setScale(1.0 + Math.sin(time * 0.01) * 0.04, 1.0 - Math.sin(time * 0.01) * 0.04);
      } else if (this.enemyType === 'fly') {
        // Horizontal patrol
        if (this.x >= this.patrolMaxX && this.direction > 0) {
          this.direction = -1;
          this.setVelocityX(-this.speed);
          this.setFlipX(true);
        } else if (this.x <= this.patrolMinX && this.direction < 0) {
          this.direction = 1;
          this.setVelocityX(this.speed);
          this.setFlipX(false);
        } else {
          this.setVelocityX(this.speed * this.direction);
        }
        // Sine-wave hovering vertically
        const targetY = this.startY + Math.sin((time * 0.003) + this.hoverPhase) * this.hoverRadius;
        this.setY(targetY);
      }
    }

    takeHit(scene, hitInfo = {}) {
      if (this.isDefeated) return false;
      const dmg = hitInfo.damage || 1;
      this.hp -= dmg;
      if (this.hp <= 0) {
        this.defeat(scene, hitInfo.source || 'cosmic-pulse');
        return true;
      }
      return false;
    }

    defeat(scene, source = 'stomp') {
      if (this.isDefeated) return;
      this.isDefeated = true;
      this.disableBody(true, false); // Turn off physics collisions immediately

      // Child-friendly cartoon squash & pop
      scene.tweens.add({
        targets: this,
        scaleX: 1.4,
        scaleY: 0.15,
        alpha: 0,
        duration: 220,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.setVisible(false);
        }
      });

      // Emit child-friendly sparkle burst
      scene.createDefeatBurst(this.x, this.y);
    }

    reset() {
      this.isDefeated = false;
      this.hp = this.initialHp || 1;
      this.setPosition(this.startX, this.startY);
      this.setScale(1.0, 1.0);
      this.setAlpha(1.0);
      this.setVisible(true);
      this.direction = 1;
      this.setFlipX(false);
      this.enableBody(true, this.startX, this.startY, true, true);
      if (this.enemyType === 'fly') {
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
      }
      this.setVelocityX(this.speed * this.direction);
    }
  }

  /* ========================================================
     5B. COSMIC PULSE PROJECTILE & POOL SYSTEM
     ======================================================== */
  class CosmicPulse extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'cosmic_pulse');
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.setDepth(6);
      this.body.setAllowGravity(false);
      this.body.setSize(18, 18);
      this.body.setOffset(5, 5);
      this.setActive(false);
      this.setVisible(false);
      this.lifespan = 0;
      this.trailTimer = 0;
      this.isReturning = false;
      this.direction = 1;
    }

    fire(x, y, direction) {
      this.isReturning = false;
      this.enableBody(true, x, y, true, true);
      this.setActive(true);
      this.setVisible(true);
      this.setScale(1.0);
      this.setAlpha(1.0);
      this.lifespan = PROJECTILE_CONFIG.lifetime;
      this.trailTimer = 0;
      this.direction = direction;
      this.setVelocityX(PROJECTILE_CONFIG.speed * direction);
      this.setVelocityY(0);
      this.setFlipX(direction < 0);
    }

    deactivate(impact = false) {
      if (this.isReturning) return;
      this.isReturning = true;
      this.disableBody(true, true);
      this.setActive(false);
      this.setVisible(false);
      this.setVelocity(0, 0);
    }

    update(time, delta) {
      if (!this.active) return;
      this.lifespan -= delta;
      this.rotation += 0.12 * this.direction;

      // Subtle sparkle particle trail (low frequency, non-spammy)
      this.trailTimer += delta;
      if (this.trailTimer >= 65) {
        this.trailTimer = 0;
        if (this.scene && this.scene.createPulseTrailParticle) {
          this.scene.createPulseTrailParticle(this.x - (this.direction * 8), this.y);
        }
      }

      if (this.lifespan <= 0) {
        this.deactivate(false);
      }
    }
  }

  class CosmicPulsePool {
    constructor(scene, size = 14) {
      this.scene = scene;
      this.size = size;
      this.group = scene.physics.add.group({
        classType: CosmicPulse,
        maxSize: size,
        runChildUpdate: true
      });

      for (let i = 0; i < size; i++) {
        const pulse = new CosmicPulse(scene, 0, 0);
        this.group.add(pulse);
      }
    }

    getAvailable() {
      const children = this.group.getChildren();
      for (let i = 0; i < children.length; i++) {
        if (!children[i].active) {
          return children[i];
        }
      }
      return null;
    }

    clear() {
      const children = this.group.getChildren();
      children.forEach(p => p.deactivate(false));
    }
  }

  class AdventureLevelScene extends Phaser.Scene {
    constructor() {
      super({ key: 'AdventureLevelScene' });
    }

    init(data) {
      if (data && data.level) {
        AdventureState.currentLevel = data.level;
      }
    }

    create() {
      window.currentAdventureScene = this;
      AdventureState.reset(AdventureState.currentLevel);

      const cfg = LEVEL_CONFIGS[AdventureState.currentLevel] || LEVEL_CONFIGS[1];
      const screenWidth = this.scale.width || window.innerWidth;
      const screenHeight = this.scale.height || (window.innerHeight - 65);

      const levelWidth = cfg.levelWidth || 3200;
      const levelHeight = Math.max(580, screenHeight);

      this.physics.world.setBounds(0, 0, levelWidth, levelHeight);

      const groundY = levelHeight - 85;
      AdventureState.checkpointX = 140;
      AdventureState.checkpointY = groundY - 45;

      // 1. Background Parallax Decor
      this.mountains = this.add.tileSprite(0, groundY - 260, levelWidth, 400, cfg.backdrop || 'mountains')
        .setOrigin(0, 0)
        .setScrollFactor(0.2)
        .setAlpha(0.65)
        .setDepth(1);
      if (cfg.backdropTint) {
        this.mountains.setTint(cfg.backdropTint);
      }

      // Sky / Cavern decor
      if (cfg.id === 2) {
        // Crystal Caverns ceiling stalactites & cavern rocks
        this.add.image(400, 45, 'cavern_rock').setScrollFactor(0.3).setScale(0.85).setAlpha(0.7).setDepth(1);
        this.add.image(1100, 50, 'cavern_rock').setScrollFactor(0.3).setScale(0.95).setAlpha(0.65).setDepth(1);
        this.add.image(1800, 40, 'cavern_rock').setScrollFactor(0.3).setScale(0.8).setAlpha(0.7).setDepth(1);
        this.add.image(2500, 55, 'cavern_rock').setScrollFactor(0.3).setScale(0.9).setAlpha(0.65).setDepth(1);
      } else {
        // Clouds high in the upper cosmic sky
        this.add.image(400, 100, 'cloud').setScrollFactor(0.3).setScale(0.75).setAlpha(0.65).setDepth(1);
        this.add.image(1100, 70, 'cloud').setScrollFactor(0.3).setScale(0.9).setAlpha(0.6).setDepth(1);
        this.add.image(1800, 110, 'cloud').setScrollFactor(0.3).setScale(0.8).setAlpha(0.65).setDepth(1);
        this.add.image(2500, 80, 'cloud').setScrollFactor(0.3).setScale(0.85).setAlpha(0.6).setDepth(1);
      }

      // 2. Platforms & Terrain (Arcade Static Group)
      this.platforms = this.physics.add.staticGroup();

      // Decorative stylized hills & terrain backdrop behind solid floor
      for (let x = 0; x < levelWidth; x += 650) {
        const bgHill = this.add.image(x + 325, groundY + 30, cfg.groundBackdrop || 'ground_1').setScale(0.85, 0.65).setDepth(1).setAlpha(0.8);
        if (cfg.groundFloorTint && (cfg.groundBackdrop === 'ground_1')) {
          bgHill.setTint(cfg.groundFloorTint);
        }
      }

      // Continuous flat solid floor across the entire level
      for (let x = -100; x < levelWidth + 400; x += 420) {
        const floorTile = this.platforms.create(x + 210, groundY + 55, cfg.groundFloor || 'platform').setScale(0.5, 0.85).refreshBody();
        if (cfg.groundFloorTint) floorTile.setTint(cfg.groundFloorTint);
        floorTile.setDepth(3);
      }

      // Solid ground bedrock fill extending below floor tiles
      const bedrockColor = cfg.id === 2 ? 0x170b28 : (cfg.id === 3 ? 0x051b33 : 0x0c101d);
      this.add.rectangle(0, groundY + 45, levelWidth, 450, bedrockColor)
        .setOrigin(0, 0)
        .setDepth(2);

      // 3. Scenic Trees, Rune Stones, & Tablets (Firmly grounded at groundY with setOrigin(0.5, 1.0))
      if (cfg.scenery && cfg.scenery.length > 0) {
        cfg.scenery.forEach(s => {
          this.add.image(s.x, groundY, s.type)
            .setOrigin(0.5, 1.0)
            .setScale(s.scale || 0.6)
            .setScrollFactor(1.0)
            .setDepth(s.depth || 2);
        });
      }

      // 4. Stepping Platforms
      const stepTex = cfg.steppingTexture || 'platform';
      if (cfg.platformSpots && cfg.platformSpots.length > 0) {
        cfg.platformSpots.forEach(p => {
          const plat = this.platforms.create(p.x, groundY + p.y, stepTex).setScale(0.38, 0.35).refreshBody();
          if (cfg.groundFloorTint && stepTex === 'platform') plat.setTint(cfg.groundFloorTint);
          plat.setDepth(3);
        });
      }

      // Moving Platforms (Levels 2 & 3)
      this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
      if (cfg.movingSpots && cfg.movingSpots.length > 0) {
        cfg.movingSpots.forEach(m => {
          const mp = this.movingPlatforms.create(m.x, groundY + m.y, stepTex);
          mp.setScale(0.38, 0.35);
          mp.body.moves = false;
          mp.body.setImmovable(true);
          mp.setDepth(3);
          if (cfg.groundFloorTint && stepTex === 'platform') mp.setTint(cfg.groundFloorTint);
          
          const tweenCfg = {
            targets: mp,
            ease: 'Sine.easeInOut',
            duration: m.duration || 2500,
            yoyo: true,
            repeat: -1
          };
          if (m.distanceX) tweenCfg.x = m.x + m.distanceX;
          if (m.distanceY) tweenCfg.y = (groundY + m.y) + m.distanceY;
          this.tweens.add(tweenCfg);
        });
      }

      // 5. Dog Player
      this.dog = this.physics.add.sprite(AdventureState.checkpointX, groundY - 45, 'dog_idle');
      this.dog.setScale(0.85);
      this.dog.setDepth(5);
      this.dog.body.setSize(84, 76);
      this.dog.body.setOffset(36, 45);
      this.dog.setCollideWorldBounds(true);
      this.dog.setBounce(0.02);
      this.dog.play('dog-idle');

      this.physics.add.collider(this.dog, this.platforms);
      if (this.movingPlatforms) {
        this.physics.add.collider(this.dog, this.movingPlatforms);
      }

      // Coyote time & Jump buffer state
      this.canJumpUntil = 0;
      this.jumpBufferedUntil = 0;
      this.isSniffing = false;

      // 6. Collectibles (Bones & Crystals)
      this.bonesGroup = this.physics.add.group({ allowGravity: false });
      if (cfg.boneOffsets && cfg.boneOffsets.length > 0) {
        cfg.boneOffsets.forEach(bp => {
          const b = this.bonesGroup.create(bp.x, groundY + bp.y, 'bone').setScale(1.1);
          b.setDepth(4);
          b.initialY = groundY + bp.y;
        });
      }

      this.crystalsGroup = this.physics.add.group({ allowGravity: false });
      const crystalTex = cfg.id === 2 ? 'crystal_cluster' : 'crystal';
      if (cfg.crystalOffsets && cfg.crystalOffsets.length > 0) {
        cfg.crystalOffsets.forEach(cp => {
          const c = this.crystalsGroup.create(cp.x, groundY + cp.y, crystalTex).setScale(cfg.id === 2 ? 0.75 : 0.7);
          c.setDepth(4);
          c.initialY = groundY + cp.y;
        });
      }

      this.physics.add.overlap(this.dog, this.bonesGroup, (dog, bone) => this.collectBone(bone));
      this.physics.add.overlap(this.dog, this.crystalsGroup, (dog, crystal) => this.collectCrystal(crystal));

      // 7. Knowledge Gates, Enclosed Vaults, Special Diamonds & Back Obstacles
      this.gates = [];
      this.obstacles = [];
      this.vaultBarriers = [];
      this.specialDiamonds = [];
      this.specialDiamondsGroup = this.physics.add.group({ allowGravity: false });

      // Solid static group for all vault structures (gate, back obstacle, sky beams, roof)
      this.gateWallsGroup = this.physics.add.staticGroup();

      if (cfg.gateLocations && cfg.gateLocations.length > 0) {
        cfg.gateLocations.forEach((gx, idx) => {
          // A. Front Gate Door (facing entrance at gx)
          const gate = this.gateWallsGroup.create(gx, groundY, 'gate_door');
          gate.setOrigin(0.5, 1.0);
          gate.setScale(0.42);
          gate.setDepth(3);
          gate.refreshBody();
          gate.gateIndex = idx;
          gate.isLocked = true;
          this.gates.push(gate);

          // B. Special Diamond securely placed inside the vault chamber (gx + 120)
          const diamond = this.specialDiamondsGroup.create(gx + 120, groundY - 55, 'special_diamond');
          diamond.setScale(0.65);
          diamond.setDepth(4);
          diamond.gateIndex = idx;
          diamond.initialY = groundY - 55;
          diamond.isVanished = false;
          diamond.isCollected = false;
          this.specialDiamonds[idx] = diamond;

          // C. Back Obstacle Barrier (gx + 240): strictly blocks dog approaching diamond from behind
          const obstacle = this.gateWallsGroup.create(gx + 240, groundY, 'gate_barrier');
          obstacle.setOrigin(0.5, 1.0);
          obstacle.setScale(0.35, 0.42);
          obstacle.setDepth(3);
          obstacle.refreshBody();
          obstacle.gateIndex = idx;
          obstacle.isLocked = true;
          this.obstacles.push(obstacle);

          // D. Sky Barrier Pillars (prevent jumping over gate or obstacle under any circumstances)
          // Front vertical beam (gx, groundY - 260)
          const frontSky = this.gateWallsGroup.create(gx, groundY - 260, 'platform');
          frontSky.setScale(0.12, 3.5);
          frontSky.setVisible(false);
          frontSky.refreshBody();
          frontSky.gateIndex = idx;
          this.vaultBarriers.push(frontSky);

          // Rear vertical beam (gx + 240, groundY - 260)
          const rearSky = this.gateWallsGroup.create(gx + 240, groundY - 260, 'platform');
          rearSky.setScale(0.12, 3.5);
          rearSky.setVisible(false);
          rearSky.refreshBody();
          rearSky.gateIndex = idx;
          this.vaultBarriers.push(rearSky);

          // E. Overhead Vault Roof Beam (gx + 120, groundY - 185)
          const roof = this.gateWallsGroup.create(gx + 120, groundY - 185, 'platform');
          roof.setScale(0.55, 0.25);
          roof.setDepth(3);
          if (cfg.themeColor) {
            roof.setTint(Phaser.Display.Color.HexStringToColor(cfg.themeColor).color);
          }
          roof.refreshBody();
          roof.gateIndex = idx;
          this.vaultBarriers.push(roof);
        });
      }

      // 100% Solid Arcade Physics Collider between Dog and Gate Walls Group
      this.physics.add.collider(this.dog, this.gateWallsGroup, (dog, wall) => {
        if (wall.isLocked && !AdventureState.isPaused) {
          if (wall.texture && wall.texture.key === 'gate_door') {
            this.triggerGateArrival(wall);
          } else if (wall.texture && wall.texture.key === 'gate_barrier') {
            if (!this.lastObstacleWarn || this.time.now - this.lastObstacleWarn > 2000) {
              this.lastObstacleWarn = this.time.now;
              this.showFloatingText(wall.x - 30, wall.y - 120, "🔒 LOCKED OBSTACLE! Answer Gate to open! 🐾", "#ef4444");
            }
          }
        }
      });

      // Special Diamond collection - strictly impossible until the question gate is unlocked
      this.physics.add.overlap(this.dog, this.specialDiamondsGroup, (dog, diamond) => {
        if (!diamond.isVanished && !diamond.isCollected) {
          const gate = this.gates && this.gates[diamond.gateIndex];
          if (gate && gate.isLocked) {
            return; // Strict guard: impossible to collect while gate is locked!
          }
          this.collectSpecialDiamond(diamond);
        }
      });

      // 8. Level Finish Portal
      if (cfg.exitType === 'animated_cave') {
        // Level 1: Animated Glowing Cave Portal
        this.finishPortal = this.physics.add.sprite(cfg.exitX, groundY, 'cave_anim');
        this.finishPortal.setOrigin(0.5, 1.0);
        this.finishPortal.setScale(0.72);
        this.finishPortal.play('cave-glow');
        this.finishPortal.setDepth(3);
        this.finishPortal.body.setImmovable(true);
        this.finishPortal.body.allowGravity = false;
        
        this.add.text(cfg.exitX, groundY - 260, "🌌 CAVE TO CRYSTAL CAVERNS 🌌", {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#38bdf8',
          stroke: '#030712',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(4);
      } else if (cfg.exitType === 'crystal_portal') {
        // Level 2: Amethyst Crystal Gate
        this.finishPortal = this.physics.add.staticSprite(cfg.exitX, groundY - 80, 'crystal_cluster').setScale(1.2).refreshBody();
        this.finishPortal.setDepth(3);
        this.finishPortal.setTint(0xc084fc);
        this.add.text(cfg.exitX, groundY - 180, "⚡ ASCENT TO STARLIGHT SUMMIT ⚡", {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#c084fc',
          stroke: '#030712',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(4);
      } else {
        // Level 3: Master Celestial Beacon
        this.finishPortal = this.physics.add.staticSprite(cfg.exitX, groundY - 75, 'rune_stone').setScale(1.2).refreshBody();
        this.finishPortal.setDepth(3);
        this.finishPortal.setTint(0x38bdf8);
        this.add.text(cfg.exitX, groundY - 180, "🏆 GRAND COSMIC BEACON 🏆", {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#38bdf8',
          stroke: '#030712',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(4);
      }

      this.physics.add.overlap(this.dog, this.finishPortal, () => this.triggerVictory());

      // 9. Camera follow - edge to edge across screen
      this.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
      this.cameras.main.startFollow(this.dog, true, 0.08, 0.08, -60, 0);

      // Handle window resize dynamically
      this.scale.on('resize', (gameSize) => {
        const width = gameSize.width;
        const height = gameSize.height;
        if (this.cameras && this.cameras.main) {
          this.cameras.main.setViewport(0, 0, width, height);
        }
      });

      // 10. Enemies (Ground Patrols & Flying Drones)
      this.isInvulnerable = false;
      this.enemiesGroup = this.physics.add.group();
      this.levelEnemies = [];

      if (cfg.enemies && cfg.enemies.length > 0) {
        cfg.enemies.forEach(eCfg => {
          const tex = (eCfg.type === 'fly') ? 'enemy_fly' : 'enemy_ground';
          const spawnY = groundY + (eCfg.y || -45);
          const enemy = new Enemy(this, eCfg.x, spawnY, tex, eCfg);
          this.enemiesGroup.add(enemy);
          this.levelEnemies.push(enemy);
        });
      }

      // Ground enemies collide with solid terrain
      this.physics.add.collider(this.enemiesGroup, this.platforms);

      // Dog and Enemy Overlap (Mario-Style Stomp & Damage)
      this.physics.add.overlap(this.dog, this.enemiesGroup, (dog, enemy) => this.handleDogEnemyCollision(dog, enemy));

      // 10B. Cosmic Pulse Projectile Pool & Colliders
      this.pulsePool = new CosmicPulsePool(this, PROJECTILE_CONFIG.poolSize);
      this.nextFireTime = 0;

      // Projectile vs Enemies (Ranged Defeat)
      this.physics.add.overlap(this.pulsePool.group, this.enemiesGroup, (pulse, enemy) => {
        this.handlePulseEnemyCollision(pulse, enemy);
      });

      // Projectile vs Solid Platforms
      this.physics.add.collider(this.pulsePool.group, this.platforms, (pulse) => {
        if (pulse && pulse.active) {
          this.createPulseImpact(pulse.x, pulse.y);
          pulse.deactivate(true);
        }
      });

      // Projectile vs Gate Walls / Sealed Vault Barriers
      this.physics.add.collider(this.pulsePool.group, this.gateWallsGroup, (pulse) => {
        if (pulse && pulse.active) {
          this.createPulseImpact(pulse.x, pulse.y);
          pulse.deactivate(true);
        }
      });

      // Projectile vs Moving Platforms
      if (this.movingPlatforms) {
        this.physics.add.collider(this.pulsePool.group, this.movingPlatforms, (pulse) => {
          if (pulse && pulse.active) {
            this.createPulseImpact(pulse.x, pulse.y);
            pulse.deactivate(true);
          }
        });
      }

      // 11. Input Keys
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
      this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

      // On-screen touch hooks
      this.touchLeft = false;
      this.touchRight = false;
      this.setupTouchControls();
    }

    setupTouchControls() {
      const bindTouch = (id, onDown, onUp) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.onpointerdown = (e) => { e.preventDefault(); onDown(); };
        el.onpointerup = (e) => { e.preventDefault(); onUp(); };
        el.onpointercancel = (e) => { e.preventDefault(); onUp(); };
      };

      bindTouch('btn-touch-left', () => this.touchLeft = true, () => this.touchLeft = false);
      bindTouch('btn-touch-right', () => this.touchRight = true, () => this.touchRight = false);
      bindTouch('btn-touch-jump', () => this.queueJump(), () => {});
      bindTouch('btn-touch-sniff', () => this.triggerSniff(), () => {});
      bindTouch('btn-touch-pulse', () => this.tryFireCosmicPulse(), () => {});
    }

    queueJump() {
      this.jumpBufferedUntil = this.time.now + 130;
    }

    triggerSniff() {
      if (!this.dog.body.blocked.down || this.isSniffing) return;
      this.isSniffing = true;
      this.dog.setVelocityX(0);
      this.dog.play('dog-sniff');
      if (window.setSparkyMessage) {
        window.setSparkyMessage("👃 <em>*Sniff sniff!*</em> Cosmo Dog smells knowledge nearby!");
      }
      this.dog.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isSniffing = false;
        this.dog.play('dog-idle');
      });
    }

    update(time, delta) {
      if (AdventureState.isPaused) return;

      // Update Three.js background parallax
      if (window.AdventureBackground3D) {
        window.AdventureBackground3D.update(this.cameras.main.scrollX);
      }

      // Update Enemies Patrol & Movement
      if (this.levelEnemies && this.levelEnemies.length > 0) {
        this.levelEnemies.forEach(e => {
          if (e && e.active) e.update(time, delta);
        });
      }

      // Bobbing collectibles
      this.bonesGroup.getChildren().forEach(b => {
        b.y = b.initialY + Math.sin(time * 0.005 + b.x) * 6;
      });
      this.crystalsGroup.getChildren().forEach(c => {
        c.y = c.initialY + Math.sin(time * 0.004 + c.x) * 8;
      });
      if (this.specialDiamondsGroup) {
        this.specialDiamondsGroup.getChildren().forEach(d => {
          if (!d.isVanished && !d.isCollected) {
            d.y = d.initialY + Math.sin(time * 0.005 + d.x) * 6;
          }
        });
      }

      if (this.isSniffing) return;

      const onGround = this.dog.body.blocked.down;
      if (onGround) {
        this.canJumpUntil = time + 110; // Coyote time
      }

      const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchLeft;
      const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.touchRight;
      const wantsJump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                        Phaser.Input.Keyboard.JustDown(this.keyW) || 
                        Phaser.Input.Keyboard.JustDown(this.keySpace);

      if (wantsJump) {
        this.jumpBufferedUntil = time + 130;
      }

      // Lateral Movement
      const speed = 250;
      if (moveLeft) {
        this.dog.setVelocityX(-speed);
        this.dog.setFlipX(true);
        if (onGround && this.dog.anims.currentAnim?.key !== 'dog-walk') {
          this.dog.play('dog-walk');
        }
      } else if (moveRight) {
        this.dog.setVelocityX(speed);
        this.dog.setFlipX(false);
        if (onGround && this.dog.anims.currentAnim?.key !== 'dog-walk') {
          this.dog.play('dog-walk');
        }
      } else {
        this.dog.setVelocityX(0);
        if (onGround && this.dog.anims.currentAnim?.key !== 'dog-idle') {
          this.dog.play('dog-idle');
        }
      }

      // Jump Execution
      const canJump = time < this.canJumpUntil;
      const hasBufferedJump = time < this.jumpBufferedUntil;

      if (hasBufferedJump && canJump) {
        this.dog.setVelocityY(-540);
        this.canJumpUntil = 0;
        this.jumpBufferedUntil = 0;
        if (window.Sound && window.Sound.playJump) {
          window.Sound.playJump();
        }
      }

      // Check sniff key
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.triggerSniff();
      }

      // Check Cosmic Pulse attack keys (F, J, X)
      const wantsPulse = Phaser.Input.Keyboard.JustDown(this.keyF) ||
                         Phaser.Input.Keyboard.JustDown(this.keyJ) ||
                         Phaser.Input.Keyboard.JustDown(this.keyX);
      if (wantsPulse) {
        this.tryFireCosmicPulse();
      }
    }

    collectBone(bone) {
      bone.disableBody(true, true);
      AdventureState.bones++;
      const earned = AdventureState.addScore(50);
      AdventureState.modifyEnergy(2);

      if (window.Sound && window.Sound.playBonePickup) {
        window.Sound.playBonePickup();
      }

      // Pop floating text
      this.showFloatingText(bone.x, bone.y, `+${earned} PTS 🦴`);
    }

    collectCrystal(crystal) {
      crystal.disableBody(true, true);
      AdventureState.modifyEnergy(15);
      AdventureState.addScore(100);

      if (window.Sound && window.Sound.playCrystalPickup) {
        window.Sound.playCrystalPickup();
      }

      this.showFloatingText(crystal.x, crystal.y, `+15 ENERGY ⚡`, '#38bdf8');
    }

    collectSpecialDiamond(diamond) {
      if (diamond.isVanished || diamond.isCollected) return;
      diamond.isCollected = true;
      diamond.disableBody(true, false);

      AdventureState.diamonds++;
      const earned = AdventureState.addScore(500);
      AdventureState.modifyEnergy(25);

      if (window.Sound && window.Sound.playPowerup) {
        window.Sound.playPowerup();
      }

      this.tweens.add({
        targets: diamond,
        y: diamond.y - 65,
        scale: 1.15,
        alpha: 0,
        duration: 550,
        ease: 'Power2',
        onComplete: () => {
          diamond.destroy();
        }
      });

      this.showFloatingText(diamond.x, diamond.y - 30, `+${earned} PTS SPECIAL DIAMOND! 💎`, '#38bdf8');

      if (window.setSparkyMessage) {
        window.setSparkyMessage("💎 <strong>Cosmic Treasure Claimed!</strong> Special Diamond collected (+500 PTS & +25 Energy)! 🌟");
      }
    }

    vanishDiamond(gateIndex) {
      const diamond = this.specialDiamonds && this.specialDiamonds[gateIndex];
      if (!diamond || diamond.isVanished || diamond.isCollected) return;
      diamond.isVanished = true;

      diamond.setTint(0x64748b);
      this.tweens.add({
        targets: diamond,
        y: diamond.y - 40,
        scale: 0.1,
        alpha: 0,
        duration: 750,
        ease: 'Back.easeIn',
        onComplete: () => {
          diamond.disableBody(true, true);
        }
      });

      this.showFloatingText(diamond.x, diamond.y - 20, "DIAMOND VANISHED! 💨💎", "#ef4444");

      if (window.setSparkyMessage) {
        window.setSparkyMessage("💨 <strong>Special Diamond Vanished!</strong> Answer correctly next time to claim the rare diamond!");
      }
    }

    showFloatingText(x, y, message, color = '#facc15') {
      const txt = this.add.text(x, y - 10, message, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: color,
        stroke: '#0f172a',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.tweens.add({
        targets: txt,
        y: y - 45,
        alpha: 0,
        duration: 900,
        ease: 'Power2',
        onComplete: () => txt.destroy()
      });
    }

    triggerGateArrival(gate) {
      AdventureState.isPaused = true;
      this.dog.setVelocity(0, 0);
      this.dog.play('dog-idle');
      this.physics.world.pause();

      if (this.pulsePool) {
        this.pulsePool.clear();
      }

      AdventureState.activeGateIndex = gate.gateIndex;
      AdventureState.checkpointX = gate.x - 70;
      AdventureState.checkpointY = gate.y - 20;

      if (window.Sound && window.Sound.playPowerup) {
        window.Sound.playPowerup();
      }

      openGateModal(gate.gateIndex);
    }

    unlockGate(gateIndex) {
      const gate = this.gates && this.gates[gateIndex];
      if (gate) {
        gate.isLocked = false;
        gate.disableBody(true, false);
        this.tweens.add({
          targets: gate,
          y: gate.y - 130,
          alpha: 0.25,
          duration: 800,
          ease: 'Cubic.easeOut'
        });
      }

      const obstacle = this.obstacles && this.obstacles[gateIndex];
      if (obstacle) {
        obstacle.isLocked = false;
        obstacle.disableBody(true, false);
        this.tweens.add({
          targets: obstacle,
          y: obstacle.y + 120,
          alpha: 0.2,
          duration: 800,
          ease: 'Cubic.easeIn'
        });
      }

      if (this.vaultBarriers) {
        this.vaultBarriers.filter(b => b.gateIndex === gateIndex).forEach(b => {
          b.disableBody(true, true);
        });
      }

      AdventureState.gatesCleared++;

      // Three.js portal burst effect
      if (window.AdventureBackground3D) {
        window.AdventureBackground3D.triggerGateBurst(gateIndex);
      }

      this.physics.world.resume();
      AdventureState.isPaused = false;
    }

    handleDogEnemyCollision(dog, enemy) {
      if (enemy.isDefeated || !enemy.body || !dog.body) return;

      // Mario-Style Stomp Detection:
      // 1. Dog is falling downward (velocity.y > 0)
      // 2. Dog's bottom is contacting near top of enemy
      const isFalling = (dog.body.velocity.y > 0);
      const isAbove = (dog.body.bottom <= enemy.body.top + 26) || (dog.y < enemy.y - 10);

      if (isFalling && isAbove) {
        // --- MARIO-STYLE STOMP SUCCESS ---
        enemy.defeat(this);

        // Upward bounce
        dog.setVelocityY(ENEMY_CONFIG.bounceVelocity);

        // Score reward
        const earned = AdventureState.addScore(ENEMY_CONFIG.stompReward);

        // Pop SFX
        if (window.Sound && window.Sound.playStompPop) {
          window.Sound.playStompPop();
        }

        // Floating score banner
        this.showFloatingText(enemy.x, enemy.y - 20, `+${earned} PTS STOMP! 💥`, '#facc15');

        if (window.setSparkyMessage) {
          window.setSparkyMessage("💥 <strong>Stomp!</strong> Cadet bounced off enemy! +150 PTS! 🌟");
        }
      } else {
        // --- SIDE / BOTTOM COLLISION (DAMAGE) ---
        if (this.isInvulnerable) return; // Prevent repeated damage loops!

        // Extensible Cosmic Shield hook (Requirement 8)
        if (this.hasCosmicShield && this.hasCosmicShield()) {
          this.consumeCosmicShield();
          return;
        }

        // Deduct 10 Energy
        AdventureState.modifyEnergy(-ENEMY_CONFIG.damage);

        // Knockback away from enemy with small hop
        const knockDir = (dog.x < enemy.x) ? -1 : 1;
        dog.setVelocityX(knockDir * ENEMY_CONFIG.knockbackSpeedX);
        dog.setVelocityY(ENEMY_CONFIG.knockbackSpeedY);

        // Hurt SFX
        if (window.Sound && window.Sound.playPlayerHurt) {
          window.Sound.playPlayerHurt();
        }

        // Floating damage alert
        this.showFloatingText(dog.x, dog.y - 30, `-${ENEMY_CONFIG.damage} ENERGY ⚠️`, '#f43f5e');

        // Temporary Invulnerability & Blinking
        this.isInvulnerable = true;
        this.tweens.add({
          targets: dog,
          alpha: 0.35,
          duration: 100,
          yoyo: true,
          repeat: 5, // 6 cycles of 200ms = 1200ms
          onComplete: () => {
            dog.setAlpha(1.0);
            this.isInvulnerable = false;
          }
        });

        if (window.setSparkyMessage) {
          window.setSparkyMessage("⚠️ <strong>Ouch!</strong> Dog collided with enemy! Lost 10 Energy! Watch out Cadet!");
        }
      }
    }

    handlePulseEnemyCollision(pulse, enemy) {
      if (!pulse || !pulse.active || !enemy || enemy.isDefeated) return;

      // 1. Immediately deactivate projectile
      pulse.deactivate(true);

      // 2. Play magical impact burst
      this.createPulseImpact(pulse.x, pulse.y);

      // 3. Take hit on enemy (reusable pipeline for current & future armored enemies)
      const defeated = enemy.takeHit(this, {
        damage: PROJECTILE_CONFIG.damage,
        source: 'cosmic-pulse'
      });

      // 4. Reward score and play sound if defeated
      if (defeated) {
        const earned = AdventureState.addScore(PROJECTILE_CONFIG.defeatScore);
        this.showFloatingText(enemy.x, enemy.y - 30, `+${PROJECTILE_CONFIG.defeatScore} COSMIC HIT! ⚡`, '#38bdf8');
        if (window.Sound && window.Sound.playCosmicPulseHit) {
          window.Sound.playCosmicPulseHit();
        }
      }
    }

    tryFireCosmicPulse() {
      if (AdventureState.isPaused || !this.dog || !this.dog.body) return false;
      const now = this.time.now;
      if (now < this.nextFireTime) return false;

      const pulse = this.pulsePool ? this.pulsePool.getAvailable() : null;
      if (!pulse) return false;

      this.nextFireTime = now + PROJECTILE_CONFIG.cooldown;

      const direction = this.dog.flipX ? -1 : 1;
      const spawnX = this.dog.x + (PROJECTILE_CONFIG.offsetX * direction);
      const spawnY = this.dog.y + PROJECTILE_CONFIG.offsetY;

      pulse.fire(spawnX, spawnY, direction);

      // Visual muzzle spark
      this.createMuzzleSpark(spawnX, spawnY, direction);

      // Web Audio sound
      if (window.Sound && window.Sound.playCosmicPulseFire) {
        window.Sound.playCosmicPulseFire();
      }

      return true;
    }

    createMuzzleSpark(x, y, direction) {
      const spark = this.add.circle(x, y, 7, 0x38bdf8, 0.85);
      spark.setDepth(7);
      this.tweens.add({
        targets: spark,
        scale: 1.6,
        alpha: 0,
        duration: 120,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy()
      });
    }

    createPulseTrailParticle(x, y) {
      const p = this.add.circle(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4, 2.5, 0x38bdf8, 0.7);
      p.setDepth(5);
      this.tweens.add({
        targets: p,
        scale: 0.2,
        alpha: 0,
        duration: 180,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    createPulseImpact(x, y) {
      // Expanding soft aura ring
      const ring = this.add.circle(x, y, 6, 0x38bdf8, 0.85);
      ring.setDepth(7);
      this.tweens.add({
        targets: ring,
        scale: 2.5,
        alpha: 0,
        duration: 220,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });

      // 4 sparkle stars expanding outward
      const colors = [0x38bdf8, 0xa855f7, 0x22d3ee, 0xffffff];
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i + (Math.random() * 0.4 - 0.2);
        const speed = 40 + Math.random() * 25;
        const star = this.add.circle(x, y, 3.5, Phaser.Utils.Array.GetRandom(colors));
        star.setDepth(7);
        this.tweens.add({
          targets: star,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.2,
          duration: 240,
          ease: 'Cubic.easeOut',
          onComplete: () => star.destroy()
        });
      }
    }

    createDefeatBurst(x, y) {
      const colors = [0xfacc15, 0x38bdf8, 0xa855f7, 0xf43f5e, 0xffffff];
      for (let i = 0; i < 10; i++) {
        const p = this.add.circle(x, y, Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom(colors));
        p.setDepth(6);
        const angle = (Math.PI * 2 * i) / 10 + (Math.random() * 0.4 - 0.2);
        const speed = Phaser.Math.Between(40, 110);
        this.tweens.add({
          targets: p,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.2,
          duration: Phaser.Math.Between(350, 500),
          ease: 'Power2',
          onComplete: () => p.destroy()
        });
      }
    }

    resetEnemies() {
      if (this.levelEnemies && this.levelEnemies.length > 0) {
        this.levelEnemies.forEach(e => {
          if (e) e.reset();
        });
      }
    }

    respawnDog() {
      this.dog.setPosition(AdventureState.checkpointX, AdventureState.checkpointY);
      this.dog.setVelocity(0, 0);
      this.dog.play('dog-idle');
      this.resetEnemies();
      if (this.pulsePool) {
        this.pulsePool.clear();
      }
      this.nextFireTime = 0;
    }

    triggerVictory() {
      AdventureState.isPaused = true;
      this.physics.world.pause();

      if (this.pulsePool) {
        this.pulsePool.clear();
      }

      if (window.Sound && window.Sound.playVictory) {
        window.Sound.playVictory();
      }

      showAdventureVictoryScreen();
    }

    shutdown() {
      if (this.pulsePool) {
        this.pulsePool.clear();
      }
    }
  }

  /* ========================================================
     4. KNOWLEDGE GATE MCQ MODAL LOGIC & POWER-UPS
     ======================================================== */
  let _advPowerupListenersAttached = false;

  function openGateModal(gateIndex) {
    const modal = document.getElementById('adv-gate-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.getElementById('adv-gate-capsule').style.display = 'none';

    // Hide clue/hint banner when opening a new question
    const clueBox = document.getElementById('adv-gate-clue-box');
    if (clueBox) {
      clueBox.style.display = 'none';
      clueBox.classList.remove('frozen-mode');
    }

    // Reset timer freeze state for new question
    AdventureState.gateTimerFrozen = false;

    // Pick question from active questionsBank
    const bank = (window.gameState && window.gameState.questionsBank) || [];
    // Pick question corresponding to gateIndex or random from bank
    const qIndex = (gateIndex * 15 + Math.floor(Math.random() * 5)) % Math.max(1, bank.length);
    const q = bank[qIndex] || {
      question: "Which celestial body provides light and energy to our planetary system?",
      options: ["The Moon", "The Sun", "Mars", "Jupiter"],
      answerIndex: 1,
      explanation: "The Sun is the central star of our solar system, providing radiant light and energy."
    };
    AdventureState.activeQuestion = q;

    // Header & Meta
    document.getElementById('adv-gate-title').textContent = `Knowledge Gate #${gateIndex + 1}`;
    document.getElementById('adv-gate-topic').textContent = q.topic || "Olympiad Knowledge";
    document.getElementById('adv-gate-question-text').textContent = q.question;

    // Render 4 Colourful Options (A=Cyan, B=Mint, C=Violet, D=Baby Pink)
    const grid = document.getElementById('adv-gate-options-grid');
    grid.innerHTML = '';

    const optClasses = ['opt-a', 'opt-b', 'opt-c', 'opt-d'];
    q.options.forEach((optText, optIdx) => {
      const letter = chrLetter(optIdx);
      const btn = document.createElement('button');
      btn.className = `adv-gate-option-btn ${optClasses[optIdx] || 'opt-a'}`;
      btn.dataset.index = optIdx;
      btn.innerHTML = `
        <span class="adv-opt-badge">${letter}</span>
        <span class="adv-opt-label">${optText}</span>
      `;
      btn.onclick = () => handleGateAnswer(optIdx, btn);
      grid.appendChild(btn);
    });

    // Initialize power-up event listeners & update power-up buttons
    setupAdvPowerupListeners();
    updateAdvPowerupUI();

    // Start 60s Question Timer
    startGateTimer();
  }

  function chrLetter(idx) {
    return ['A', 'B', 'C', 'D'][idx] || 'A';
  }

  function startGateTimer() {
    clearInterval(AdventureState.gateTimerInterval);
    AdventureState.gateTimerSecs = 60;
    updateGateTimerUI();

    AdventureState.gateTimerInterval = setInterval(() => {
      if (AdventureState.gateTimerFrozen) {
        return; // Clock is paused with Time Freeze power-up!
      }
      AdventureState.gateTimerSecs--;
      updateGateTimerUI();

      if (AdventureState.gateTimerSecs <= 0) {
        clearInterval(AdventureState.gateTimerInterval);
        handleGateTimeout();
      }
    }, 1000);
  }

  function updateGateTimerUI() {
    const el = document.getElementById('adv-gate-timer-secs');
    const pill = document.getElementById('adv-gate-timer-pill');
    if (!pill) return;

    if (AdventureState.gateTimerFrozen) {
      pill.classList.add('frozen');
      pill.classList.remove('urgent-pulse');
      pill.innerHTML = `❄️ <span id="adv-gate-timer-secs">FROZEN</span>`;
      return;
    }

    pill.classList.remove('frozen');
    pill.innerHTML = `⏱️ <span id="adv-gate-timer-secs">${AdventureState.gateTimerSecs}s</span>`;
    if (AdventureState.gateTimerSecs <= 10) {
      pill.style.background = '#f43f5e';
      pill.style.color = '#fff';
      pill.classList.add('urgent-pulse');
    } else if (AdventureState.gateTimerSecs <= 25) {
      pill.style.background = '#f59e0b';
      pill.style.color = '#fff';
      pill.classList.remove('urgent-pulse');
    } else {
      pill.style.background = 'rgba(2, 132, 199, 0.18)';
      pill.style.color = '#38bdf8';
      pill.classList.remove('urgent-pulse');
    }
  }

  function setupAdvPowerupListeners() {
    if (_advPowerupListenersAttached) return;
    _advPowerupListenersAttached = true;

    // 1. STAR HINT (💡)
    const hintBtn = document.getElementById('adv-pu-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (AdventureState.powerups.hint <= 0 || isGateQuestionAnswered()) return;
        if (window.Sound && window.Sound.playPowerup) window.Sound.playPowerup();
        AdventureState.powerups.hint--;
        updateAdvPowerupUI();

        const q = AdventureState.activeQuestion;
        const hintText = q.hint || (q.explanation ? "Clue: " + q.explanation.split('.')[0] + "." : "Carefully eliminate improbable answers and check the key scientific terms!");

        const clueBox = document.getElementById('adv-gate-clue-box');
        const iconEl = document.getElementById('adv-gate-clue-icon');
        const textEl = document.getElementById('adv-gate-clue-text');
        if (clueBox && textEl) {
          clueBox.classList.remove('frozen-mode');
          if (iconEl) iconEl.textContent = '💡';
          textEl.innerHTML = `<strong>Sparky's Clue:</strong> ${hintText}`;
          clueBox.style.display = 'flex';
        }
        if (window.setSparkyMessage) {
          window.setSparkyMessage("💡 <strong>Gate Clue!</strong> Sparky revealed a helpful Olympiad hint!");
        }
      });
    }

    // 2. 50:50 LASER (⚡)
    const laserBtn = document.getElementById('adv-pu-laser');
    if (laserBtn) {
      laserBtn.addEventListener('click', () => {
        if (AdventureState.powerups.laser <= 0 || isGateQuestionAnswered()) return;
        if (window.Sound && window.Sound.playLaserZap) window.Sound.playLaserZap();
        AdventureState.powerups.laser--;
        updateAdvPowerupUI();

        const q = AdventureState.activeQuestion;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== q.answerIndex);
        wrongIndices.sort(() => Math.random() - 0.5);
        const toEliminate = wrongIndices.slice(0, 2);

        document.querySelectorAll('.adv-gate-option-btn').forEach(btn => {
          const idx = parseInt(btn.dataset.index);
          if (toEliminate.includes(idx)) {
            // Laser beam animation across button
            const sliceEl = document.createElement('div');
            sliceEl.className = 'laser-slice-fx';
            btn.appendChild(sliceEl);

            // Smoke poof animation
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

        const clueBox = document.getElementById('adv-gate-clue-box');
        const iconEl = document.getElementById('adv-gate-clue-icon');
        const textEl = document.getElementById('adv-gate-clue-text');
        if (clueBox && textEl) {
          clueBox.classList.remove('frozen-mode');
          if (iconEl) iconEl.textContent = '⚡';
          textEl.innerHTML = `<strong>50:50 Laser Zapped!</strong> Two incorrect options were sliced away!`;
          clueBox.style.display = 'flex';
        }
        if (window.setSparkyMessage) {
          window.setSparkyMessage("⚡ <strong>Laser Zapped!</strong> Two wrong answers eliminated!");
        }
      });
    }

    // 3. TIME FREEZE (❄️)
    const freezeBtn = document.getElementById('adv-pu-freeze');
    if (freezeBtn) {
      freezeBtn.addEventListener('click', () => {
        if (AdventureState.powerups.freeze <= 0 || isGateQuestionAnswered()) return;
        if (window.Sound && window.Sound.playFreeze) window.Sound.playFreeze();
        AdventureState.powerups.freeze--;
        AdventureState.gateTimerFrozen = true;
        updateGateTimerUI();
        updateAdvPowerupUI();

        const frostOverlay = document.getElementById('frost-vignette-overlay');
        if (frostOverlay) {
          frostOverlay.classList.add('active');
          setTimeout(() => frostOverlay.classList.remove('active'), 12000);
        }

        const clueBox = document.getElementById('adv-gate-clue-box');
        const iconEl = document.getElementById('adv-gate-clue-icon');
        const textEl = document.getElementById('adv-gate-clue-text');
        if (clueBox && textEl) {
          clueBox.classList.add('frozen-mode');
          if (iconEl) iconEl.textContent = '❄️';
          textEl.innerHTML = `<strong>Time Freeze Active!</strong> Countdown frozen — take your time to choose the right answer!`;
          clueBox.style.display = 'flex';
        }
        if (window.setSparkyMessage) {
          window.setSparkyMessage("❄️ <strong>Time Freeze!</strong> Timer is frozen — relax and solve the gate!");
        }
      });
    }
  }

  function isGateQuestionAnswered() {
    const anyBtn = document.querySelector('.adv-gate-option-btn');
    if (!anyBtn) return false;
    return !!(document.querySelector('.adv-gate-option-btn.correct') || document.querySelector('.adv-gate-option-btn.wrong'));
  }

  function updateAdvPowerupUI() {
    const hintCount = document.getElementById('adv-pu-hint-count');
    const laserCount = document.getElementById('adv-pu-laser-count');
    const freezeCount = document.getElementById('adv-pu-freeze-count');
    const hintBtn = document.getElementById('adv-pu-hint');
    const laserBtn = document.getElementById('adv-pu-laser');
    const freezeBtn = document.getElementById('adv-pu-freeze');

    if (hintCount) hintCount.textContent = AdventureState.powerups.hint;
    if (laserCount) laserCount.textContent = AdventureState.powerups.laser;
    if (freezeCount) freezeCount.textContent = AdventureState.powerups.freeze;

    const answered = isGateQuestionAnswered();
    if (hintBtn) hintBtn.disabled = (AdventureState.powerups.hint <= 0 || answered);
    if (laserBtn) laserBtn.disabled = (AdventureState.powerups.laser <= 0 || answered);
    if (freezeBtn) freezeBtn.disabled = (AdventureState.powerups.freeze <= 0 || answered);
  }

  function handleGateAnswer(selectedIdx, clickedBtn) {
    clearInterval(AdventureState.gateTimerInterval);

    const q = AdventureState.activeQuestion;
    const isCorrect = (selectedIdx === q.answerIndex);
    const allBtns = document.querySelectorAll('.adv-gate-option-btn');
    allBtns.forEach(b => b.disabled = true);
    updateAdvPowerupUI();

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      AdventureState.streak++;
      AdventureState.modifyEnergy(15);
      AdventureState.addScore(200);

      if (window.Sound && window.Sound.playCorrect) window.Sound.playCorrect();
      if (window.setSparkyMessage) {
        window.setSparkyMessage(`🌟 <strong>Brilliant Answer!</strong> Gate #${AdventureState.activeGateIndex + 1} unlocked! Special Diamond awaits behind! 💎`);
      }
    } else {
      clickedBtn.classList.add('wrong');
      allBtns[q.answerIndex]?.classList.add('correct');
      AdventureState.streak = 0;
      AdventureState.modifyEnergy(-15);

      // Special Diamond vanishes on wrong answer!
      if (window.currentAdventureScene && window.currentAdventureScene.vanishDiamond) {
        window.currentAdventureScene.vanishDiamond(AdventureState.activeGateIndex);
      }

      if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
      if (window.setSparkyMessage) {
        window.setSparkyMessage(`💪 <strong>Good Try!</strong> The correct answer was <strong>${q.options[q.answerIndex]}</strong>. The Special Diamond vanished! 💨💎`);
      }
    }

    // Show Knowledge Capsule Explanation with 15s Timer
    showGateExplanation(isCorrect, q);
  }

  function handleGateTimeout() {
    const q = AdventureState.activeQuestion;
    if (!q) return;
    const allBtns = document.querySelectorAll('.adv-gate-option-btn');
    allBtns.forEach(b => b.disabled = true);
    if (q.answerIndex !== undefined && allBtns[q.answerIndex]) {
      allBtns[q.answerIndex].classList.add('correct');
    }
    updateAdvPowerupUI();

    AdventureState.streak = 0;
    AdventureState.modifyEnergy(-20);

    // Special Diamond vanishes when time runs out (unanswered)!
    if (window.currentAdventureScene && window.currentAdventureScene.vanishDiamond) {
      window.currentAdventureScene.vanishDiamond(AdventureState.activeGateIndex);
    }

    if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
    if (window.setSparkyMessage) {
      window.setSparkyMessage(`⏰ <strong>Time's Up!</strong> Gate unlocked, but the Special Diamond vanished into the void! 💨💎`);
    }

    showGateExplanation(false, q);
  }

  function showGateExplanation(isCorrect, q) {
    const capsule = document.getElementById('adv-gate-capsule');
    const textEl = document.getElementById('adv-capsule-text');
    const nextBtn = document.getElementById('btn-adv-capsule-next');
    if (!capsule) return;

    capsule.style.display = 'block';
    capsule.className = `adv-gate-capsule ${isCorrect ? 'capsule-correct' : 'capsule-wrong'}`;

    let html = `<div>${(q && q.explanation) ? q.explanation : "Reviewing this concept strengthens your Olympiad knowledge!"}</div>`;
    if (isCorrect) {
      html += `<div style="margin-top: 10px; padding: 8px 12px; background: rgba(56, 189, 248, 0.15); border: 1.5px solid #38bdf8; border-radius: 12px; color: #38bdf8; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
        <span>💎</span>
        <span><strong>Special Diamond Unlocked!</strong> Walk past the gate to claim +500 PTS & +25 Energy!</span>
      </div>`;
    } else {
      html += `<div style="margin-top: 10px; padding: 8px 12px; background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; border-radius: 12px; color: #f87171; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
        <span>💨</span>
        <span><strong>Special Diamond Vanished!</strong> Answer correctly next time to claim the rare diamond!</span>
      </div>`;
    }
    textEl.innerHTML = html;

    let countdownSecs = 15;
    if (nextBtn) {
      nextBtn.innerHTML = `<span>Continue Adventure (${countdownSecs}s)</span><span>⏭️</span>`;
    }

    clearInterval(AdventureState.capsuleCountdownInterval);
    AdventureState.capsuleCountdownInterval = setInterval(() => {
      countdownSecs--;
      if (nextBtn && countdownSecs > 0) {
        nextBtn.innerHTML = `<span>Continue Adventure (${countdownSecs}s)</span><span>⏭️</span>`;
      }
    }, 1000);

    const proceed = () => {
      clearInterval(AdventureState.capsuleCountdownInterval);
      document.getElementById('adv-gate-modal').style.display = 'none';
      if (window.currentAdventureScene) {
        window.currentAdventureScene.unlockGate(AdventureState.activeGateIndex);
      }
    };

    nextBtn.onclick = proceed;
    setTimeout(proceed, 15000);
  }

  function showAdventureVictoryScreen() {
    const screen = document.getElementById('screen-adventure-victory');
    if (!screen) return;

    const curLvl = AdventureState.currentLevel || 1;
    const cfg = LEVEL_CONFIGS[curLvl] || LEVEL_CONFIGS[1];

    document.getElementById('adv-stat-bones').textContent = `${AdventureState.bones}/${AdventureState.totalBonesInLevel}`;
    const diamondsEl = document.getElementById('adv-stat-diamonds');
    if (diamondsEl) {
      diamondsEl.textContent = `${AdventureState.diamonds}/${AdventureState.totalDiamondsInLevel}`;
    }
    document.getElementById('adv-stat-gates').textContent = `${AdventureState.gatesCleared}/${AdventureState.gatesTotal}`;
    document.getElementById('adv-stat-energy').textContent = `${AdventureState.energy}%`;
    document.getElementById('adv-stat-score').textContent = `${AdventureState.score.toLocaleString()} PTS`;

    // Calculate stars (1 - 3)
    let starCount = 1;
    const bonePct = AdventureState.bones / Math.max(1, AdventureState.totalBonesInLevel);
    if (AdventureState.energy >= 50 && (AdventureState.diamonds >= 2 || bonePct >= 0.7)) starCount = 3;
    else if (AdventureState.energy >= 25 || AdventureState.diamonds >= 1 || bonePct >= 0.35) starCount = 2;

    const starsEl = document.getElementById('adv-victory-stars');
    if (starsEl) {
      starsEl.innerHTML = '';
      for (let s = 1; s <= 3; s++) {
        starsEl.innerHTML += `<span class="star-icon ${s <= starCount ? 'filled' : ''}">⭐</span>`;
      }
    }

    // Save progress to window.gameState
    if (window.gameState) {
      if (!window.gameState.adventureLevels) {
        window.gameState.adventureLevels = {
          1: { unlocked: true, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
          2: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 },
          3: { unlocked: false, stars: 0, highScore: 0, bones: 0, diamonds: 0 }
        };
      }
      const lvlData = window.gameState.adventureLevels[curLvl] || { unlocked: true, stars: 0, highScore: 0, bones: 0, diamonds: 0 };
      lvlData.stars = Math.max(lvlData.stars || 0, starCount);
      lvlData.highScore = Math.max(lvlData.highScore || 0, AdventureState.score);
      lvlData.bones = Math.max(lvlData.bones || 0, AdventureState.bones);
      lvlData.diamonds = Math.max(lvlData.diamonds || 0, AdventureState.diamonds);
      window.gameState.adventureLevels[curLvl] = lvlData;

      // Unlock next level if available
      if (curLvl < 3) {
        if (!window.gameState.adventureLevels[curLvl + 1]) {
          window.gameState.adventureLevels[curLvl + 1] = { unlocked: true, stars: 0, highScore: 0, bones: 0, diamonds: 0 };
        } else {
          window.gameState.adventureLevels[curLvl + 1].unlocked = true;
        }
      }

      if (window.saveState) {
        window.saveState();
      }
    }

    // Update Next Level button visibility & text
    const nextBtn = document.getElementById('btn-adv-next-level');
    if (nextBtn) {
      if (curLvl < 3) {
        nextBtn.style.display = 'inline-flex';
        const nextCfg = LEVEL_CONFIGS[curLvl + 1] || { name: `Level ${curLvl + 1}` };
        nextBtn.innerHTML = `<span>Next Level: ${nextCfg.name} ⏩</span>`;
        nextBtn.onclick = () => {
          window.CosmicAdventureEngine.startAdventure(curLvl + 1);
        };
      } else {
        nextBtn.style.display = 'none';
      }
    }

    // Level map button
    const mapBtn = document.getElementById('btn-adv-to-levels');
    if (mapBtn) {
      mapBtn.onclick = () => {
        if (window.renderAdventureLevelSelect) window.renderAdventureLevelSelect();
        if (window.showScreen) window.showScreen('screen-adventure-select');
      };
    }

    // Replay button
    const replayBtn = document.getElementById('btn-adv-replay');
    if (replayBtn) {
      replayBtn.onclick = () => {
        window.CosmicAdventureEngine.startAdventure(curLvl);
      };
    }

    // Celebration Dog Bone Feast Badge
    const animContainer = document.getElementById('adv-victory-dog-anim');
    if (animContainer) {
      animContainer.innerHTML = `
        <div class="dog-bone-feast-badge">
          <div class="dog-bone-sprite-box"></div>
          <span class="feast-label">🦴 Victory Feast! +${AdventureState.bones} Bones | +${AdventureState.diamonds} Diamonds 💎</span>
        </div>
      `;
    }

    if (window.showScreen) {
      window.showScreen('screen-adventure-victory');
    }
  }

  /* ========================================================
     5. GLOBAL ENGINE CONTROLLER
     ======================================================== */
  window.CosmicAdventureEngine = {
    game: null,
    _resizeAttached: false,

    startAdventure(levelNum = 1) {
      AdventureState.currentLevel = levelNum;

      if (window.showScreen) {
        window.showScreen('screen-adventure');
      }

      // Initialize Three.js celestial background
      if (!window.AdventureBackground3D) {
        window.AdventureBackground3D = new Background3D('adventure-three-canvas');
      }
      if (window.AdventureBackground3D && window.AdventureBackground3D.setLevelTheme) {
        window.AdventureBackground3D.setLevelTheme(levelNum);
      }

      // Initialize Phaser 3 game with responsive full screen resize mode
      if (!this.game) {
        const config = {
          type: Phaser.AUTO,
          parent: 'phaser-game-container',
          transparent: true,
          scale: {
            mode: Phaser.Scale.RESIZE,
            parent: 'phaser-game-container',
            width: '100%',
            height: '100%'
          },
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 950 },
              debug: false
            }
          },
          scene: [AdventurePreloadScene, AdventureLevelScene]
        };
        this.game = new Phaser.Game(config);
      } else {
        // Restart scene cleanly with specified level
        this.game.scene.start('AdventureLevelScene', { level: levelNum });
      }

      if (!this._resizeAttached) {
        window.addEventListener('resize', () => {
          if (window.AdventureBackground3D) {
            window.AdventureBackground3D.onResize();
          }
          if (this.game && this.game.scale) {
            this.game.scale.refresh();
          }
        });
        this._resizeAttached = true;
      }

      // Ensure full screen dimensions apply smoothly
      setTimeout(() => {
        if (window.AdventureBackground3D) {
          window.AdventureBackground3D.onResize();
        }
        if (this.game && this.game.scale) {
          this.game.scale.refresh();
        }
      }, 80);
      setTimeout(() => {
        if (window.AdventureBackground3D) {
          window.AdventureBackground3D.onResize();
        }
        if (this.game && this.game.scale) {
          this.game.scale.refresh();
        }
      }, 250);
    }
  };

})(window);
