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
     2. MULTI-LEVEL CONFIGURATIONS & BIOMES
     ======================================================== */
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
        { x: 880, y: -130 },
        { x: 1140, y: -215 },
        { x: 1660, y: -120 },
        { x: 1960, y: -210 },
        { x: 2260, y: -120 }
      ],
      movingSpots: [],
      scenery: [
        { type: 'tree_1', x: 220, scale: 0.58, depth: 2 },
        { type: 'tree_2', x: 620, scale: 0.52, depth: 2 },
        { type: 'rock_1', x: 360, scale: 0.5, depth: 3 },
        { type: 'stone_1', x: 1050, scale: 0.6, depth: 3 },
        { type: 'rune_stone', x: 1340, scale: 0.7, depth: 3 },
        { type: 'tree_1', x: 1420, scale: 0.62, depth: 2 },
        { type: 'tree_2', x: 1820, scale: 0.55, depth: 2 },
        { type: 'rock_1', x: 1920, scale: 0.55, depth: 3 },
        { type: 'stone_1', x: 2420, scale: 0.6, depth: 3 },
        { type: 'tree_1', x: 2540, scale: 0.58, depth: 2 },
        { type: 'rune_stone', x: 2660, scale: 0.7, depth: 3 }
      ],
      boneOffsets: [
        { x: 260, y: -50 },
        { x: 440, y: -165 },
        { x: 620, y: -50 },
        { x: 880, y: -185 },
        { x: 1140, y: -270 },
        { x: 1350, y: -50 },
        { x: 1660, y: -175 },
        { x: 1960, y: -265 },
        { x: 2120, y: -50 },
        { x: 2500, y: -50 }
      ],
      crystalOffsets: [
        { x: 480, y: -165 },
        { x: 1200, y: -270 },
        { x: 2020, y: -265 }
      ],
      gateLocations: [780, 1540, 2340],
      exitX: 2800
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
        { x: 920, y: -130 },
        { x: 1400, y: -120 },
        { x: 1880, y: -125 },
        { x: 2360, y: -125 }
      ],
      movingSpots: [
        { x: 640, y: -180, distanceX: 160, distanceY: 0, duration: 2400 },
        { x: 1160, y: -230, distanceX: 0, distanceY: -110, duration: 2200 },
        { x: 1640, y: -190, distanceX: 180, distanceY: 0, duration: 2500 },
        { x: 2120, y: -220, distanceX: 0, distanceY: -120, duration: 2300 }
      ],
      scenery: [
        { type: 'crystal_cluster', x: 220, scale: 0.9, depth: 2 },
        { type: 'cavern_rock', x: 360, scale: 0.65, depth: 3 },
        { type: 'rune_tablet', x: 540, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 800, scale: 0.95, depth: 2 },
        { type: 'cavern_rock', x: 1040, scale: 0.7, depth: 3 },
        { type: 'crystal_cluster', x: 1300, scale: 0.85, depth: 2 },
        { type: 'rune_tablet', x: 1520, scale: 0.85, depth: 3 },
        { type: 'crystal_cluster', x: 1780, scale: 1.0, depth: 2 },
        { type: 'cavern_rock', x: 2020, scale: 0.75, depth: 3 },
        { type: 'crystal_cluster', x: 2280, scale: 0.9, depth: 2 },
        { type: 'rune_tablet', x: 2520, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 2750, scale: 1.05, depth: 2 }
      ],
      boneOffsets: [
        { x: 250, y: -50 },
        { x: 400, y: -170 },
        { x: 640, y: -240 },
        { x: 850, y: -50 },
        { x: 1160, y: -290 },
        { x: 1400, y: -175 },
        { x: 1640, y: -250 },
        { x: 1880, y: -180 },
        { x: 2120, y: -280 },
        { x: 2360, y: -180 },
        { x: 2600, y: -50 },
        { x: 2800, y: -50 }
      ],
      crystalOffsets: [
        { x: 640, y: -240 },
        { x: 1160, y: -300 },
        { x: 1640, y: -250 },
        { x: 2120, y: -290 }
      ],
      gateLocations: [820, 1580, 2400],
      exitX: 2950
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
        { x: 860, y: -130 },
        { x: 1340, y: -125 },
        { x: 1820, y: -130 },
        { x: 2300, y: -125 },
        { x: 2780, y: -130 }
      ],
      movingSpots: [
        { x: 620, y: -200, distanceX: 0, distanceY: -140, duration: 2500 },
        { x: 1100, y: -210, distanceX: 180, distanceY: 0, duration: 2400 },
        { x: 1580, y: -200, distanceX: 0, distanceY: -150, duration: 2600 },
        { x: 2060, y: -210, distanceX: 180, distanceY: 0, duration: 2400 },
        { x: 2540, y: -200, distanceX: 0, distanceY: -140, duration: 2500 }
      ],
      scenery: [
        { type: 'tree_1', x: 200, scale: 0.6, depth: 2 },
        { type: 'rune_stone', x: 340, scale: 0.7, depth: 3 },
        { type: 'rune_tablet', x: 520, scale: 0.85, depth: 3 },
        { type: 'tree_1', x: 960, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 1220, scale: 0.75, depth: 3 },
        { type: 'tree_2', x: 1440, scale: 0.55, depth: 2 },
        { type: 'rune_tablet', x: 1700, scale: 0.85, depth: 3 },
        { type: 'tree_1', x: 1940, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 2180, scale: 0.75, depth: 3 },
        { type: 'tree_2', x: 2420, scale: 0.55, depth: 2 },
        { type: 'rune_tablet', x: 2660, scale: 0.85, depth: 3 },
        { type: 'tree_1', x: 2900, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 3050, scale: 0.8, depth: 3 }
      ],
      boneOffsets: [
        { x: 240, y: -50 },
        { x: 380, y: -170 },
        { x: 620, y: -260 },
        { x: 860, y: -185 },
        { x: 1100, y: -270 },
        { x: 1340, y: -180 },
        { x: 1580, y: -265 },
        { x: 1820, y: -185 },
        { x: 2060, y: -270 },
        { x: 2300, y: -180 },
        { x: 2540, y: -265 },
        { x: 2780, y: -185 },
        { x: 2950, y: -50 },
        { x: 3100, y: -50 },
        { x: 3200, y: -50 }
      ],
      crystalOffsets: [
        { x: 620, y: -270 },
        { x: 1100, y: -280 },
        { x: 1580, y: -275 },
        { x: 2060, y: -280 },
        { x: 2540, y: -275 }
      ],
      gateLocations: [800, 1600, 2450],
      exitX: 3250
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

      this.scene.start('AdventureLevelScene', { level: AdventureState.currentLevel || 1 });
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

      // 7. Knowledge Gates & Special Diamonds Behind Gates
      this.gates = [];
      this.specialDiamonds = [];
      this.specialDiamondsGroup = this.physics.add.group({ allowGravity: false });

      if (cfg.gateLocations && cfg.gateLocations.length > 0) {
        cfg.gateLocations.forEach((gx, idx) => {
          const gate = this.physics.add.staticSprite(gx, groundY - 75, 'gate_door').setScale(0.42).refreshBody();
          gate.setDepth(3);
          gate.body.setSize(55, 140);
          gate.gateIndex = idx;
          gate.isLocked = true;
          this.gates.push(gate);

          // Special Diamond placed 130px behind the gate (cannot be collected without opening gate)
          const diamond = this.specialDiamondsGroup.create(gx + 130, groundY - 55, 'special_diamond');
          diamond.setScale(0.65);
          diamond.setDepth(4);
          diamond.gateIndex = idx;
          diamond.initialY = groundY - 55;
          diamond.isVanished = false;
          diamond.isCollected = false;
          this.specialDiamonds[idx] = diamond;
        });
      }

      // Block dog physically while gate is locked, and trigger gate arrival
      this.physics.add.collider(this.dog, this.gates, (dog, gate) => {
        if (gate.isLocked && !AdventureState.isPaused) {
          this.triggerGateArrival(gate);
        }
      });
      this.physics.add.overlap(this.dog, this.gates, (dog, gate) => {
        if (gate.isLocked && !AdventureState.isPaused) {
          this.triggerGateArrival(gate);
        }
      });

      // Special Diamond collection - strictly impossible until the question gate is unlocked
      this.physics.add.overlap(this.dog, this.specialDiamondsGroup, (dog, diamond) => {
        if (!diamond.isVanished && !diamond.isCollected) {
          if (this.gates[diamond.gateIndex] && this.gates[diamond.gateIndex].isLocked) {
            return; // Cannot collect through a locked barrier!
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

      // 10. Input Keys
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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

    update(time) {
      if (AdventureState.isPaused) return;

      // Update Three.js background parallax
      if (window.AdventureBackground3D) {
        window.AdventureBackground3D.update(this.cameras.main.scrollX);
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

      AdventureState.activeGateIndex = gate.gateIndex;
      AdventureState.checkpointX = gate.x - 70;
      AdventureState.checkpointY = gate.y - 20;

      if (window.Sound && window.Sound.playPowerup) {
        window.Sound.playPowerup();
      }

      openGateModal(gate.gateIndex);
    }

    unlockGate(gateIndex) {
      const gate = this.gates[gateIndex];
      if (!gate) return;
      gate.isLocked = false;
      AdventureState.gatesCleared++;

      // Animate gate opening / sliding up
      this.tweens.add({
        targets: gate,
        y: gate.y - 120,
        alpha: 0.35,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          gate.disableBody(true, false);
        }
      });

      // Three.js portal burst effect
      if (window.AdventureBackground3D) {
        window.AdventureBackground3D.triggerGateBurst(gateIndex);
      }

      this.physics.world.resume();
      AdventureState.isPaused = false;
    }

    respawnDog() {
      this.dog.setPosition(AdventureState.checkpointX, AdventureState.checkpointY);
      this.dog.setVelocity(0, 0);
      this.dog.play('dog-idle');
    }

    triggerVictory() {
      AdventureState.isPaused = true;
      this.physics.world.pause();

      if (window.Sound && window.Sound.playVictory) {
        window.Sound.playVictory();
      }

      showAdventureVictoryScreen();
    }
  }

  /* ========================================================
     4. KNOWLEDGE GATE MCQ MODAL LOGIC
     ======================================================== */
  function openGateModal(gateIndex) {
    const modal = document.getElementById('adv-gate-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.getElementById('adv-gate-capsule').style.display = 'none';

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

    // Render 4 Options
    const grid = document.getElementById('adv-gate-options-grid');
    grid.innerHTML = '';

    q.options.forEach((optText, optIdx) => {
      const letter = chrLetter(optIdx);
      const btn = document.createElement('button');
      btn.className = 'adv-gate-option-btn';
      btn.innerHTML = `
        <span class="adv-opt-badge">${letter}</span>
        <span class="adv-opt-label">${optText}</span>
      `;
      btn.onclick = () => handleGateAnswer(optIdx, btn);
      grid.appendChild(btn);
    });

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
    if (!el || !pill) return;

    el.textContent = `${AdventureState.gateTimerSecs}s`;
    if (AdventureState.gateTimerSecs <= 10) {
      pill.style.background = '#f43f5e';
      pill.style.color = '#fff';
      pill.classList.add('urgent-pulse');
    } else if (AdventureState.gateTimerSecs <= 25) {
      pill.style.background = '#f59e0b';
      pill.style.color = '#fff';
      pill.classList.remove('urgent-pulse');
    } else {
      pill.style.background = 'rgba(2, 132, 199, 0.15)';
      pill.style.color = '#0284c7';
      pill.classList.remove('urgent-pulse');
    }
  }

  function handleGateAnswer(selectedIdx, clickedBtn) {
    clearInterval(AdventureState.gateTimerInterval);

    const q = AdventureState.activeQuestion;
    const isCorrect = (selectedIdx === q.answerIndex);
    const allBtns = document.querySelectorAll('.adv-gate-option-btn');
    allBtns.forEach(b => b.disabled = true);

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
    const allBtns = document.querySelectorAll('.adv-gate-option-btn');
    allBtns.forEach(b => b.disabled = true);
    allBtns[q.answerIndex]?.classList.add('correct');

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

    let html = `<div>${q.explanation || "Reviewing this concept strengthens your Olympiad knowledge!"}</div>`;
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
