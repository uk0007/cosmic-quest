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

  const ARMORED_BEETLE_CONFIG = {
    hp: 2,
    scoreReward: 250,
    speed: 58,             // slightly slower than Robo-Crab (75)
    damage: 10,
    stompDamage: 0,
    normalCosmicPulseDamage: 1,
    superCosmicPulseDamage: 2,
    bounceVelocity: -340
  };

  const HAZARD_CONFIG = {
    meteorDamage: 8,
    meteorKnockbackX: 180,
    meteorKnockbackY: -200,
    geyserLaunchVelocity: -640,
    geyserIdleTime: 700,
    geyserWarningTime: 700,
    geyserBurstTime: 950,
    geyserCooldownTime: 750,
    windMaxForce: 85
  };

  const LEVEL_CONFIGS = {
    1: {
      id: 1,
      name: "Nebula Plains",
      subtitle: "Verdant Alien Surface",
      levelWidth: 5400,
      questionGateCount: 7,
      diamondGateIndices: [1, 3, 6], // Gates 2, 4, 7 hold the 3 Special Diamonds
      totalBones: 12,
      totalCrystals: 4,
      backdrop: 'mountains',
      backdropTint: null,
      groundBackdrop: 'ground_1',
      groundFloor: 'platform',
      groundFloorTint: null,
      steppingTexture: 'platform',
      themeColor: '#818cf8',
      exitType: 'cave', // animated cave portal
      trenches: [
        { startX: 1040, endX: 1220 }, // 180px gap with stepping stone
        { startX: 2420, endX: 2680 }, // 260px gap with moving platform
        { startX: 3820, endX: 4120 }  // 300px ravine with 2 collapsing rocks
      ],
      platformSpots: [
        { x: 380, y: -116, tex: 'platform' },
        { x: 1130, y: -90, tex: 'stepping_stone' }, // Safe stepping stone in Trench 1
        { x: 1780, y: -240, tex: 'platform' },      // High Secret route from geyser
        { x: 1950, y: -260, tex: 'platform_stone' }, // High Secret vista
        { x: 3260, y: -116, tex: 'platform' },
        { x: 4620, y: -116, tex: 'platform' }
      ],
      movingSpots: [
        { x: 2550, y: -95, distanceX: 70, distanceY: 0, duration: 2300, tex: 'platform' }
      ],
      collapsingRocks: [
        { x: 3910, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 4030, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 }
      ],
      thorns: [
        { x: 4520, y: 0, scale: 0.9, damage: 8 }
      ],
      scenery: [
        { type: 'tree_1', x: 200, scale: 0.58, depth: 2 },
        { type: 'fence_1', x: 340, scale: 0.45, depth: 3 },
        { type: 'rock_1', x: 460, scale: 0.5, depth: 3 },
        { type: 'tree_2', x: 550, scale: 0.52, depth: 2 },
        { type: 'rune_stone', x: 920, scale: 0.65, depth: 3 },
        { type: 'tree_3', x: 1350, scale: 0.55, depth: 2 },
        { type: 'fence_2', x: 1550, scale: 0.45, depth: 3 },
        { type: 'rock_1', x: 1740, scale: 0.55, depth: 3 },
        { type: 'rune_arch', x: 1950, scale: 0.75, depth: 2 }, // Landmark over secret path
        { type: 'tree_4', x: 2340, scale: 0.55, depth: 2 },
        { type: 'stone_1', x: 2720, scale: 0.6, depth: 3 },
        { type: 'rune_stone', x: 3160, scale: 0.7, depth: 3 },
        { type: 'tree_1', x: 3440, scale: 0.58, depth: 2 },
        { type: 'fence_1', x: 3750, scale: 0.45, depth: 3 },
        { type: 'tree_2', x: 4240, scale: 0.55, depth: 2 },
        { type: 'stone_1', x: 4420, scale: 0.6, depth: 3 },
        { type: 'tree_3', x: 4820, scale: 0.55, depth: 2 },
        { type: 'rune_stone', x: 5260, scale: 0.75, depth: 3 }
      ],
      ambientButterflies: [
        { x: 380, y: -80, dx: 45, dy: -25 },
        { x: 1680, y: -90, dx: 40, dy: -20 },
        { x: 3350, y: -85, dx: 50, dy: -25 }
      ],
      ambientGrass: [240, 480, 880, 1460, 2260, 2980, 3680, 4420, 5180],
      boneOffsets: [
        { x: 240, y: -50 },
        { x: 380, y: -175 },
        { x: 1060, y: -45 }, // Guide into Trench 1
        { x: 1130, y: -140 }, // High arc over Trench 1
        { x: 1200, y: -45 },
        { x: 1780, y: -290 }, // Secret high route
        { x: 1950, y: -310 }, // Secret vista bone
        { x: 2450, y: -50 }, // Guide to moving platform
        { x: 2550, y: -150 },
        { x: 3260, y: -175 },
        { x: 3910, y: -150 }, // Collapsing rock guide
        { x: 4030, y: -150 }
      ],
      crystalOffsets: [
        { x: 1950, y: -310 }, // Secret vista crystal reward!
        { x: 1220, y: -110 },
        { x: 2640, y: -110 },
        { x: 4620, y: -175 }
      ],
      gateLocations: [680, 1400, 2120, 2840, 3560, 4280, 5000],
      enemies: [
        { type: 'ground', x: 420, y: -45, minX: 300, maxX: 560, speed: 70 },
        { type: 'fly', x: 950, y: -130, minX: 820, maxX: 1120, speed: 60 },
        { type: 'ground', x: 1880, y: -45, minX: 1750, maxX: 2020, speed: 75 },
        { type: 'fly', x: 2420, y: -140, minX: 2280, maxX: 2620, speed: 65 },
        { type: 'ground', x: 3320, y: -45, minX: 3180, maxX: 3460, speed: 80 },
        { type: 'armored', x: 4350, y: -45, minX: 4220, maxX: 4500, speed: 58 },
        { type: 'fly', x: 4700, y: -140, minX: 4500, maxX: 4860, speed: 70 }
      ],
      hazards: [
        { type: 'geyser', x: 1650, launchVelocity: -640 },
        { type: 'geyser', x: 3050, launchVelocity: -640 },
        { type: 'meteor', x: 2550, y: -90, minX: 2420, maxX: 2680, speed: 50 }
      ],
      exitX: 5350
    },

    2: {
      id: 2,
      name: "Crystal Caverns",
      subtitle: "Subterranean Amethyst Grotto",
      levelWidth: 5600,
      questionGateCount: 7,
      diamondGateIndices: [1, 3, 6],
      totalBones: 14,
      totalCrystals: 5,
      backdrop: 'mountains',
      backdropTint: 0x6d28d9, // deep amethyst purple
      groundBackdrop: 'ground_cavern',
      groundFloor: 'platform',
      groundFloorTint: 0xa78bfa, // crystal glow
      steppingTexture: 'platform',
      themeColor: '#a855f7',
      exitType: 'portal',
      caveEntrance: { x: 120 },
      trenches: [
        { startX: 1040, endX: 1280 }, // 240px gap with vertical moving platform
        { startX: 1800, endX: 2040 }, // 240px gap with collapsing rock series
        { startX: 2520, endX: 2780 }, // 260px gap with horizontal moving platform
        { startX: 3960, endX: 4260 }  // 300px chasm with collapsing rock series
      ],
      platformSpots: [
        { x: 380, y: -116, tex: 'platform' },
        { x: 1980, y: -240, tex: 'platform_stone' }, // Secret upper crystal grotto
        { x: 3300, y: -116, tex: 'platform' },
        { x: 4760, y: -116, tex: 'platform' }
      ],
      movingSpots: [
        { x: 1160, y: -95, distanceX: 0, distanceY: -75, duration: 2200, tex: 'platform' },
        { x: 2650, y: -95, distanceX: 80, distanceY: 0, duration: 2400, tex: 'platform' }
      ],
      collapsingRocks: [
        { x: 1880, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 1970, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 4050, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 4170, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 }
      ],
      thorns: [
        { x: 3350, y: 0, scale: 0.95, damage: 8 },
        { x: 4800, y: 0, scale: 0.95, damage: 8 }
      ],
      scenery: [
        { type: 'crystal_cluster', x: 240, scale: 0.9, depth: 2 },
        { type: 'cavern_rock', x: 420, scale: 0.65, depth: 3 },
        { type: 'rune_tablet', x: 560, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 880, scale: 0.95, depth: 2 },
        { type: 'cavern_rock', x: 1360, scale: 0.7, depth: 3 },
        { type: 'crystal_cluster', x: 1680, scale: 0.85, depth: 2 },
        { type: 'rune_tablet', x: 1980, scale: 0.85, depth: 2 }, // Secret grotto tablet
        { type: 'crystal_cluster', x: 2340, scale: 1.0, depth: 2 },
        { type: 'cavern_rock', x: 2900, scale: 0.75, depth: 3 },
        { type: 'crystal_cluster', x: 3240, scale: 0.9, depth: 2 },
        { type: 'rune_tablet', x: 3680, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 4360, scale: 1.05, depth: 2 },
        { type: 'cavern_rock', x: 4620, scale: 0.8, depth: 3 },
        { type: 'crystal_cluster', x: 4940, scale: 1.0, depth: 2 }
      ],
      ambientBubbles: [
        { x: 860, y: -30 },
        { x: 2360, y: -30 },
        { x: 3820, y: -30 }
      ],
      ambientFlies: [
        { x: 1360, y: -110 },
        { x: 3080, y: -100 },
        { x: 4620, y: -110 }
      ],
      boneOffsets: [
        { x: 250, y: -50 },
        { x: 380, y: -175 },
        { x: 860, y: -50 },
        { x: 1160, y: -150 }, // Moving platform bones
        { x: 1160, y: -210 },
        { x: 1880, y: -150 }, // Collapsing rock bones
        { x: 1970, y: -150 },
        { x: 1980, y: -290 }, // Secret grotto bone
        { x: 2650, y: -150 },
        { x: 3300, y: -175 },
        { x: 4050, y: -150 },
        { x: 4170, y: -150 },
        { x: 4760, y: -175 },
        { x: 5350, y: -50 }
      ],
      crystalOffsets: [
        { x: 1980, y: -290 }, // Secret grotto crystal reward!
        { x: 1200, y: -220 },
        { x: 2680, y: -200 },
        { x: 3440, y: -110 },
        { x: 4170, y: -200 }
      ],
      gateLocations: [700, 1440, 2180, 2920, 3660, 4400, 5140],
      enemies: [
        { type: 'ground', x: 440, y: -45, minX: 320, maxX: 580, speed: 75 },
        { type: 'fly', x: 960, y: -130, minX: 840, maxX: 1100, speed: 65 },
        { type: 'ground', x: 1600, y: -45, minX: 1480, maxX: 1740, speed: 75 },
        { type: 'armored', x: 2360, y: -45, minX: 2240, maxX: 2480, speed: 58 },
        { type: 'ground', x: 3360, y: -45, minX: 3220, maxX: 3500, speed: 80 },
        { type: 'armored', x: 4650, y: -45, minX: 4500, maxX: 4780, speed: 58 },
        { type: 'fly', x: 4850, y: -140, minX: 4700, maxX: 5000, speed: 75 }
      ],
      hazards: [
        { type: 'geyser', x: 1100, launchVelocity: -650 },
        { type: 'geyser', x: 2900, launchVelocity: -650 },
        { type: 'meteor', x: 1950, y: -100, minX: 1820, maxX: 2060, speed: 58 },
        { type: 'meteor', x: 3750, y: -90, minX: 3620, maxX: 3880, speed: 62 }
      ],
      exitX: 5500
    },

    3: {
      id: 3,
      name: "Starlight Summit",
      subtitle: "High Celestial Citadel",
      levelWidth: 5800,
      questionGateCount: 7,
      diamondGateIndices: [1, 3, 6],
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
      trenches: [
        { startX: 1080, endX: 1340 }, // 260px gap with cloud platforms
        { startX: 1820, endX: 2100 }, // 280px gap with moving platform
        { startX: 3260, endX: 3620 }, // 360px ravine with 3 collapsing rocks
        { startX: 4060, endX: 4380 }  // 320px ravine with vertical moving platform
      ],
      platformSpots: [
        { x: 380, y: -116, tex: 'cloud_platform' },
        { x: 1160, y: -95, tex: 'cloud_platform' }, // Cloud platform in Trench 1
        { x: 1260, y: -95, tex: 'cloud_platform' }, // Cloud platform in Trench 1
        { x: 2560, y: -116, tex: 'cloud_platform' },
        { x: 3340, y: -260, tex: 'cloud_platform' }, // Celestial High Secret route
        { x: 3500, y: -270, tex: 'cloud_platform' }, // Celestial High Secret vista
        { x: 4860, y: -116, tex: 'cloud_platform' }
      ],
      movingSpots: [
        { x: 1960, y: -95, distanceX: 90, distanceY: 0, duration: 2400, tex: 'cloud_platform' },
        { x: 4220, y: -105, distanceX: 0, distanceY: -80, duration: 2500, tex: 'cloud_platform' }
      ],
      collapsingRocks: [
        { x: 3340, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 3440, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 3540, y: -95, warningMs: 650, fallSpeed: 340, resetMs: 2800 }
      ],
      thorns: [
        { x: 1840, y: 0, scale: 0.95, damage: 8 },
        { x: 2750, y: 0, scale: 0.95, damage: 8 }
      ],
      scenery: [
        { type: 'tree_1', x: 200, scale: 0.6, depth: 2 },
        { type: 'fence_1', x: 340, scale: 0.45, depth: 3 },
        { type: 'rune_tablet', x: 520, scale: 0.85, depth: 3 },
        { type: 'tree_3', x: 920, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 1380, scale: 0.75, depth: 3 },
        { type: 'tree_2', x: 1720, scale: 0.55, depth: 2 },
        { type: 'rune_tablet', x: 2140, scale: 0.85, depth: 3 },
        { type: 'fence_2', x: 2360, scale: 0.45, depth: 3 },
        { type: 'tree_4', x: 2780, scale: 0.6, depth: 2 },
        { type: 'rune_arch', x: 3500, scale: 0.8, depth: 2 }, // High summit arch
        { type: 'tree_1', x: 3880, scale: 0.65, depth: 2 },
        { type: 'rune_stone', x: 4420, scale: 0.8, depth: 3 },
        { type: 'tree_2', x: 4760, scale: 0.55, depth: 2 },
        { type: 'rune_tablet', x: 5120, scale: 0.85, depth: 3 },
        { type: 'rune_stone', x: 5560, scale: 0.85, depth: 3 }
      ],
      ambientGrass: [240, 480, 880, 1500, 2280, 3020, 3780, 4560, 5320],
      boneOffsets: [
        { x: 240, y: -50 },
        { x: 380, y: -175 },
        { x: 880, y: -50 },
        { x: 1160, y: -150 }, // Trench 1 cloud bones
        { x: 1260, y: -150 },
        { x: 1960, y: -150 }, // Moving platform bones
        { x: 2560, y: -175 },
        { x: 3340, y: -150 }, // Collapsing rock bone arc
        { x: 3440, y: -150 },
        { x: 3540, y: -150 },
        { x: 3500, y: -320 }, // High secret vista bone
        { x: 4220, y: -160 }, // Moving platform bone
        { x: 4860, y: -175 },
        { x: 5460, y: -50 },
        { x: 5580, y: -50 }
      ],
      crystalOffsets: [
        { x: 3500, y: -320 }, // High secret vista crystal reward!
        { x: 1220, y: -200 },
        { x: 1980, y: -200 },
        { x: 2700, y: -110 },
        { x: 4220, y: -220 }
      ],
      gateLocations: [720, 1480, 2240, 3000, 3760, 4520, 5280],
      enemies: [
        { type: 'ground', x: 450, y: -45, minX: 320, maxX: 580, speed: 80 },
        { type: 'fly', x: 960, y: -150, minX: 840, maxX: 1120, speed: 70 },
        { type: 'armored', x: 1640, y: -45, minX: 1520, maxX: 1760, speed: 58 },
        { type: 'fly', x: 2480, y: -150, minX: 2360, maxX: 2640, speed: 75 },
        { type: 'armored', x: 2950, y: -45, minX: 2800, maxX: 3100, speed: 58 },
        { type: 'fly', x: 3960, y: -160, minX: 3820, maxX: 4100, speed: 75 },
        { type: 'armored', x: 4980, y: -45, minX: 4850, maxX: 5120, speed: 58 }
      ],
      hazards: [
        { type: 'geyser', x: 950, launchVelocity: -640 },
        { type: 'geyser', x: 3150, launchVelocity: -650 },
        { type: 'meteor', x: 1200, y: -110, minX: 1080, maxX: 1320, speed: 65 },
        { type: 'meteor', x: 3950, y: -100, minX: 3820, maxX: 4080, speed: 68 },
        { type: 'wind', minX: 2350, maxX: 2750, forceX: -80 },
        { type: 'wind', minX: 4500, maxX: 4900, forceX: 75 }
      ],
      exitX: 5650
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
    gatesTotal: 7,
    gatesCleared: 0,
    activeGateIndex: -1,
    activeQuestion: null,
    gateTimerInterval: null,
    gateTimerSecs: 60,
    gateTimerFrozen: false,
    powerups: { hint: 3, laser: 1, freeze: 1 },
    capsuleCountdownInterval: null,
    isPaused: false,
    usedQuestionIds: new Set(),
    lastTopic: null,
    pauseStartTime: 0,
    activePowers: {
      speedUntil: 0,
      magnetUntil: 0,
      shield: false,
      superUntil: 0
    },

    reset(levelNum = 1) {
      this.currentLevel = levelNum;
      const cfg = LEVEL_CONFIGS[levelNum] || LEVEL_CONFIGS[1];
      this.gatesTotal = cfg.questionGateCount || (cfg.gateLocations ? cfg.gateLocations.length : 7);
      this.totalBonesInLevel = cfg.totalBones;
      this.energy = 100;
      this.bones = 0;
      this.diamonds = 0;
      this.totalDiamondsInLevel = (cfg.diamondGateIndices ? cfg.diamondGateIndices.length : 3);
      this.score = 0;
      this.streak = 0; // Fresh streak progression for every new level
      this.checkpointX = 140;
      this.checkpointY = 420;
      this.gatesCleared = 0;
      this.activeGateIndex = -1;
      this.activeQuestion = null;
      this.gateTimerFrozen = false;
      this.powerups = { hint: 3, laser: 1, freeze: 1 };
      this.usedQuestionIds = new Set();
      this.lastTopic = null;
      this.pauseStartTime = 0;
      this.activePowers = {
        speedUntil: 0,
        magnetUntil: 0,
        shield: false,
        superUntil: 0
      };
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
      const gatesEl = document.getElementById('adv-gates-hud-text');

      const cfg = LEVEL_CONFIGS[this.currentLevel] || LEVEL_CONFIGS[1];
      if (levelTitleEl) {
        levelTitleEl.textContent = `🐕 Level ${this.currentLevel}: ${cfg.name}`;
      }
      const menuTitleEl = document.getElementById('adv-menu-level-title');
      const menuDiamondsEl = document.getElementById('adv-menu-diamonds-text');
      if (menuTitleEl) {
        menuTitleEl.textContent = `🐕 Level ${this.currentLevel}: ${cfg.name}`;
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
      if (menuDiamondsEl) menuDiamondsEl.textContent = `${this.diamonds} / ${this.totalDiamondsInLevel}`;
      if (scoreEl) scoreEl.textContent = `${this.score.toLocaleString()} PTS`;
      if (streakEl) streakEl.textContent = `${this.streak}`;
      if (gatesEl) gatesEl.textContent = `Gate ${this.gatesCleared} / ${this.gatesTotal}`;
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

      // Animated Environmental Spritesheets (from 2D Stylized Adventure Game Asset Pack)
      this.load.spritesheet('butterfly_anim', p + 'butterfly_anim.png', { frameWidth: 75, frameHeight: 45 });
      this.load.spritesheet('grass_anim', p + 'grass_anim.png', { frameWidth: 100, frameHeight: 73 });
      this.load.spritesheet('bubble_anim', p + 'bubble_anim.png', { frameWidth: 32, frameHeight: 113 });
      this.load.spritesheet('flies_anim', p + 'flies_anim.png', { frameWidth: 60, frameHeight: 60 });

      // Environment & Biomes
      this.load.image('ground_1', p + 'ground_1.png');
      this.load.image('ground_cavern', p + 'ground_cavern.png');
      this.load.image('platform', p + 'platform.png');
      this.load.image('cloud_platform', p + 'cloud_platform.png');
      this.load.image('platform_stone', p + 'platform_stone.png');
      this.load.image('tree_1', p + 'tree_1.png');
      this.load.image('tree_2', p + 'tree_2.png');
      this.load.image('tree_3', p + 'tree_3.png');
      this.load.image('tree_4', p + 'tree_4.png');
      this.load.image('rock_1', p + 'rock_1.png');
      this.load.image('collapsing_rock', p + 'collapsing_rock.png');
      this.load.image('stone_1', p + 'stone_1.png');
      this.load.image('stepping_stone', p + 'stepping_stone.png');
      this.load.image('cavern_rock', p + 'cavern_rock.png');
      this.load.image('mountains', p + 'mountains.png');
      this.load.image('mountains_summit', p + 'mountains_summit.png');
      this.load.image('mountains_3', p + 'mountains_3.png');
      this.load.image('cloud', p + 'cloud.png');
      this.load.image('fence_1', p + 'fence_1.png');
      this.load.image('fence_2', p + 'fence_2.png');
      this.load.image('gate_door', p + 'gate_door.png');
      this.load.image('gate_barrier', p + 'gate_barrier.png');
      this.load.image('bone', p + 'bone.png');
      this.load.image('crystal', p + 'crystal.png');
      this.load.image('crystal_cluster', p + 'crystal_cluster.png');
      this.load.image('special_diamond', p + 'special_diamond.png');
      this.load.image('rune_stone', p + 'rune_stone.png');
      this.load.image('rune_tablet', p + 'rune_tablet.png');
      this.load.image('rune_arch', p + 'rune_arch.png');
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

      // Register Environmental Life Animations
      this.anims.create({
        key: 'butterfly-flutter',
        frames: this.anims.generateFrameNumbers('butterfly_anim', { start: 0, end: 11 }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: 'grass-sway',
        frames: this.anims.generateFrameNumbers('grass_anim', { start: 0, end: 11 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: 'bubble-rise',
        frames: this.anims.generateFrameNumbers('bubble_anim', { start: 0, end: 11 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: 'flies-buzz',
        frames: this.anims.generateFrameNumbers('flies_anim', { start: 0, end: 11 }),
        frameRate: 12,
        repeat: -1
      });

      // Generate Procedural Enemy & Hazard Art
      this.generateEnemyTextures();
      this.generateProjectileTextures();
      this.generateHazardTextures();

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

      // 3. Armored Cosmic Beetle - State 1: Full Armor (54x40)
      if (!this.textures.exists('enemy_armored')) {
        const canvas = document.createElement('canvas');
        canvas.width = 54;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // Sturdy cyber legs (6 segmented armored legs)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(12, 30); ctx.lineTo(4, 38);
        ctx.moveTo(22, 32); ctx.lineTo(16, 39);
        ctx.moveTo(32, 32); ctx.lineTo(38, 39);
        ctx.moveTo(42, 30); ctx.lineTo(50, 38);
        ctx.stroke();

        // Main Heavy Armored Carapace Dome
        const grad = ctx.createLinearGradient(0, 8, 0, 34);
        grad.addColorStop(0, '#4338ca'); // Royal cosmic indigo
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(27, 24, 21, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f59e0b'; // Gold reinforced rim
        ctx.stroke();

        // Reinforced Armor Shield Plates on Carapace
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(27, 20, 13, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        // Armored Front Horns / Mandibles
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(16, 16); ctx.quadraticCurveTo(8, 4, 3, 8); ctx.quadraticCurveTo(11, 14, 18, 20); ctx.closePath();
        ctx.moveTo(38, 16); ctx.quadraticCurveTo(46, 4, 51, 8); ctx.quadraticCurveTo(43, 14, 36, 20); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cyan Glowing Cyber Visor Eyes
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(21, 23, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(33, 23, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        this.textures.addCanvas('enemy_armored', canvas);
      }

      // 4. Armored Cosmic Beetle - State 2: Damaged Armor / Cracked Shell (54x40)
      if (!this.textures.exists('enemy_armored_damaged')) {
        const canvas = document.createElement('canvas');
        canvas.width = 54;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // Legs
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(12, 30); ctx.lineTo(4, 38);
        ctx.moveTo(22, 32); ctx.lineTo(16, 39);
        ctx.moveTo(32, 32); ctx.lineTo(38, 39);
        ctx.moveTo(42, 30); ctx.lineTo(50, 38);
        ctx.stroke();

        // Dimmer, fractured shell
        const grad = ctx.createLinearGradient(0, 8, 0, 34);
        grad.addColorStop(0, '#2d2d3a'); // Dim damaged shell
        grad.addColorStop(0.5, '#1e1b24');
        grad.addColorStop(1, '#0f0c18');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(27, 24, 21, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#b45309'; // Chipped / oxidized rim
        ctx.stroke();

        // Chipped plate
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(27, 20, 13, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns (one partially chipped)
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(16, 16); ctx.quadraticCurveTo(10, 8, 7, 11); ctx.lineTo(18, 20); ctx.closePath();
        ctx.moveTo(38, 16); ctx.quadraticCurveTo(46, 4, 51, 8); ctx.quadraticCurveTo(43, 14, 36, 20); ctx.closePath();
        ctx.fill();

        // Visible glowing fracture crack lines
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(19, 14); ctx.lineTo(25, 23); ctx.lineTo(21, 30);
        ctx.moveTo(35, 15); ctx.lineTo(29, 22); ctx.lineTo(33, 29);
        ctx.stroke();

        // Exposed energy core spark
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(27, 22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Flickering Visor Eye
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.ellipse(21, 23, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(33, 23, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        this.textures.addCanvas('enemy_armored_damaged', canvas);
      }
    }

    generateProjectileTextures() {
      // 5. Cosmic Pulse Magical Energy Orb (28x28)
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

      // 6. Super Mode Enhanced Cosmic Pulse Orb (34x34)
      if (!this.textures.exists('cosmic_pulse_super')) {
        const canvas = document.createElement('canvas');
        canvas.width = 34;
        canvas.height = 34;
        const ctx = canvas.getContext('2d');

        // Radiant Golden-Rainbow Coronal Aura
        const auraGrad = ctx.createRadialGradient(17, 17, 3, 17, 17, 16);
        auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        auraGrad.addColorStop(0.45, 'rgba(250, 204, 21, 0.85)');
        auraGrad.addColorStop(0.75, 'rgba(245, 158, 11, 0.5)');
        auraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(17, 17, 16, 0, Math.PI * 2);
        ctx.fill();

        // Super Radiant Golden Core
        const coreGrad = ctx.createRadialGradient(17, 17, 1, 17, 17, 9);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#fde047');
        coreGrad.addColorStop(0.8, '#f59e0b');
        coreGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(17, 17, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Star cross sparkle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(17, 11); ctx.lineTo(17, 23);
        ctx.moveTo(11, 17); ctx.lineTo(23, 17);
        ctx.stroke();

        this.textures.addCanvas('cosmic_pulse_super', canvas);
      }
    }

    generateHazardTextures() {
      // 1. Cosmic Geyser Vent Base (52x18)
      if (!this.textures.exists('geyser_base')) {
        const canvas = document.createElement('canvas');
        canvas.width = 52;
        canvas.height = 18;
        const ctx = canvas.getContext('2d');

        // Chamfered Metallic Casing
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 18);
        ctx.lineTo(12, 4);
        ctx.lineTo(40, 4);
        ctx.lineTo(48, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Energy Vent Core
        const coreGrad = ctx.createRadialGradient(26, 8, 1, 26, 8, 12);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#38bdf8');
        coreGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.ellipse(26, 8, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hazard warning studs
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(8, 12, 2, 0, Math.PI * 2);
        ctx.arc(44, 12, 2, 0, Math.PI * 2);
        ctx.fill();

        this.textures.addCanvas('geyser_base', canvas);
      }

      // 2. Cosmic Geyser Erupting Plasma Plume (44x140)
      if (!this.textures.exists('geyser_plume')) {
        const canvas = document.createElement('canvas');
        canvas.width = 44;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');

        // Outer Radiant Corona
        const outerGrad = ctx.createLinearGradient(22, 140, 22, 0);
        outerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
        outerGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.8)');
        outerGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.65)');
        outerGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.moveTo(10, 140);
        ctx.quadraticCurveTo(2, 60, 14, 8);
        ctx.quadraticCurveTo(22, 0, 30, 8);
        ctx.quadraticCurveTo(42, 60, 34, 140);
        ctx.closePath();
        ctx.fill();

        // Bright Inner Energy Beam
        const coreGrad = ctx.createLinearGradient(22, 140, 22, 10);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, '#7dd3fc');
        coreGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.moveTo(17, 140);
        ctx.lineTo(19, 20);
        ctx.lineTo(25, 20);
        ctx.lineTo(27, 140);
        ctx.closePath();
        ctx.fill();

        // Upward Energy Waves / Rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(22, 45, 14, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(22, 85, 16, 6, 0, 0, Math.PI * 2);
        ctx.stroke();

        this.textures.addCanvas('geyser_plume', canvas);
      }

      // 3. Floating Cosmic Meteor / Asteroid Rock (38x38)
      if (!this.textures.exists('hazard_meteor')) {
        const canvas = document.createElement('canvas');
        canvas.width = 38;
        canvas.height = 38;
        const ctx = canvas.getContext('2d');

        // Irregular faceted asteroid body
        const grad = ctx.createLinearGradient(6, 6, 32, 32);
        grad.addColorStop(0, '#4338ca'); // Cosmic deep indigo
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(19, 3);
        ctx.lineTo(31, 8);
        ctx.lineTo(36, 20);
        ctx.lineTo(30, 32);
        ctx.lineTo(18, 36);
        ctx.lineTo(6, 30);
        ctx.lineTo(2, 18);
        ctx.lineTo(8, 7);
        ctx.closePath();
        ctx.fill();

        // Golden luminous edge highlight
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shaded Craters
        const drawCrater = (cx, cy, r) => {
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        drawCrater(14, 15, 3.5);
        drawCrater(26, 22, 3);
        drawCrater(20, 27, 2);

        // Glowing Star Sparkle
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(22, 12, 2, 0, Math.PI * 2);
        ctx.fill();

        this.textures.addCanvas('hazard_meteor', canvas);
      }

      // 4. Wind Gust Airflow Ribbon (44x10)
      if (!this.textures.exists('wind_streak')) {
        const canvas = document.createElement('canvas');
        canvas.width = 44;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 5, 44, 5);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.25, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(22, 5, 21, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        this.textures.addCanvas('wind_streak', canvas);
      }

      // 5. Stylized Alien Thorn Patch (72x28)
      if (!this.textures.exists('hazard_thorn')) {
        const canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 28;
        const ctx = canvas.getContext('2d');

        // Bramble root base
        ctx.fillStyle = '#4a044e';
        ctx.fillRect(4, 20, 64, 8);

        // Stylized glowing spines
        const spines = [
          { x: 10, h: 20, curve: -4 },
          { x: 22, h: 25, curve: -2 },
          { x: 36, h: 26, curve: 0 },
          { x: 50, h: 24, curve: 3 },
          { x: 62, h: 19, curve: 4 }
        ];

        spines.forEach(sp => {
          const grad = ctx.createLinearGradient(sp.x, 26, sp.x + sp.curve, 26 - sp.h);
          grad.addColorStop(0, '#701a75');
          grad.addColorStop(0.5, '#ec4899');
          grad.addColorStop(1, '#fde047');
          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.moveTo(sp.x - 5, 26);
          ctx.quadraticCurveTo(sp.x, 26 - sp.h * 0.6, sp.x + sp.curve, 26 - sp.h);
          ctx.quadraticCurveTo(sp.x + 2, 26 - sp.h * 0.6, sp.x + 5, 26);
          ctx.closePath();
          ctx.fill();

          // Sparkle tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sp.x + sp.curve, 26 - sp.h, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        this.textures.addCanvas('hazard_thorn', canvas);
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
      this.speed = config.speed || (this.enemyType === 'fly' ? ENEMY_CONFIG.flySpeed : (this.enemyType === 'armored' ? ARMORED_BEETLE_CONFIG.speed : ENEMY_CONFIG.groundSpeed));
      this.direction = config.initialDirection || 1;
      this.hp = config.hp || (this.enemyType === 'armored' ? ARMORED_BEETLE_CONFIG.hp : 1);
      this.initialHp = this.hp;
      this.isDefeated = false;
      this.hoverRadius = config.hoverRadius || ENEMY_CONFIG.flyHoverRadius;
      this.hoverPhase = Math.random() * Math.PI * 2;

      this.setDepth(4);
      if (this.enemyType === 'armored') {
        this.body.setCollideWorldBounds(true);
        this.body.setSize(44, 30);
        this.body.setOffset(5, 5);
        this.setVelocityX(this.speed * this.direction);
      } else if (this.enemyType === 'ground') {
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

    updateArmorVisualState() {
      if (this.enemyType !== 'armored' || this.isDefeated) return;
      if (this.hp === 1) {
        this.setTexture('enemy_armored_damaged');
      } else {
        this.setTexture('enemy_armored');
      }
    }

    update(time, delta) {
      if (this.isDefeated || !this.body) return;

      if (this.enemyType === 'ground' || this.enemyType === 'armored') {
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

      if (this.enemyType === 'armored') {
        if (this.hp > 0) {
          // Hit 1: Armor cracked, stays alive, flash and sound
          this.updateArmorVisualState();
          scene.tweens.add({
            targets: this,
            tint: 0x38bdf8,
            duration: 70,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              this.clearTint();
            }
          });
          if (window.Sound && window.Sound.playArmoredHit) {
            window.Sound.playArmoredHit();
          }
          scene.showFloatingText(this.x, this.y - 25, "ARMOR CRACKED! ⚡", "#38bdf8");
          return false;
        } else {
          // Hit 2 or Super Pulse: Defeated!
          if (window.Sound && window.Sound.playArmoredBreak) {
            window.Sound.playArmoredBreak();
          }
          this.defeat(scene, hitInfo.source || 'cosmic-pulse');
          return true;
        }
      }

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
      this.hp = this.initialHp || (this.enemyType === 'armored' ? ARMORED_BEETLE_CONFIG.hp : 1);
      this.setPosition(this.startX, this.startY);
      this.setScale(1.0, 1.0);
      this.setAlpha(1.0);
      this.clearTint();
      this.setVisible(true);
      this.direction = 1;
      this.setFlipX(false);
      this.updateArmorVisualState();
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
      this.isSuper = false;
      this.damage = 1;
    }

    fire(x, y, direction, isSuper = false) {
      this.isReturning = false;
      this.isSuper = isSuper;
      this.damage = isSuper ? ARMORED_BEETLE_CONFIG.superCosmicPulseDamage : ARMORED_BEETLE_CONFIG.normalCosmicPulseDamage;
      this.setTexture(isSuper ? 'cosmic_pulse_super' : 'cosmic_pulse');
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
      // If all active, recycle oldest so firing NEVER fails
      const oldest = children[0];
      if (oldest) {
        oldest.deactivate(false);
        return oldest;
      }
      return null;
    }

    clear() {
      const children = this.group.getChildren();
      children.forEach(p => p.deactivate(false));
    }
  }

  /* ========================================================
     5C. ENVIRONMENTAL HAZARD SYSTEM (GEYSERS, METEORS, WIND)
     ======================================================== */
  class CosmicGeyser {
    constructor(scene, x, groundY, config = {}) {
      this.scene = scene;
      this.x = x;
      this.groundY = groundY;
      this.launchVelocity = config.launchVelocity || HAZARD_CONFIG.geyserLaunchVelocity;
      this.timer = (x % 500); // Stagger initial phases
      this.state = 'idle'; // 'idle' -> 'warning' -> 'burst' -> 'cooldown'

      // Vent structure firmly grounded on terrain
      this.base = scene.add.image(x, groundY, 'geyser_base').setOrigin(0.5, 1.0).setDepth(3);

      // Plume sprite with arcade physics body
      this.plume = scene.physics.add.sprite(x, groundY - 4, 'geyser_plume');
      this.plume.setOrigin(0.5, 1.0);
      this.plume.setDepth(4);
      this.plume.body.setAllowGravity(false);
      this.plume.body.setImmovable(true);
      this.plume.body.setSize(36, 120);
      this.plume.body.setOffset(4, 8);
      this.plume.setVisible(false);
      this.plume.disableBody(true, true);
      this.plume.geyserParent = this;
    }

    update(time, delta) {
      this.timer += delta;

      if (this.state === 'idle') {
        if (this.timer >= HAZARD_CONFIG.geyserIdleTime) {
          this.state = 'warning';
          this.timer = 0;
          this.base.setTint(0x38bdf8);
          // Warning charge sound if player nearby
          if (this.scene.dog && Math.abs(this.scene.dog.x - this.x) < 450) {
            if (window.Sound && window.Sound.playGeyserCharge) {
              window.Sound.playGeyserCharge();
            }
          }
          this.scene.tweens.add({
            targets: this.base,
            scaleY: 1.25,
            duration: HAZARD_CONFIG.geyserWarningTime / 2,
            yoyo: true,
            repeat: 1
          });
        }
      } else if (this.state === 'warning') {
        if (this.timer >= HAZARD_CONFIG.geyserWarningTime) {
          this.state = 'burst';
          this.timer = 0;
          this.base.clearTint();
          this.plume.setVisible(true);
          this.plume.enableBody(true, this.x, this.groundY - 4, true, true);
          this.plume.setAlpha(0.95);
          this.plume.setScale(1.0, 0.2);

          this.scene.tweens.add({
            targets: this.plume,
            scaleY: 1.0,
            duration: 120,
            ease: 'Back.easeOut'
          });

          if (this.scene.dog && Math.abs(this.scene.dog.x - this.x) < 550) {
            if (window.Sound && window.Sound.playGeyserBurst) {
              window.Sound.playGeyserBurst();
            }
          }
        }
      } else if (this.state === 'burst') {
        this.plume.alpha = 0.85 + Math.sin(time * 0.02) * 0.15;
        if (this.timer >= HAZARD_CONFIG.geyserBurstTime) {
          this.state = 'cooldown';
          this.timer = 0;
          this.scene.tweens.add({
            targets: this.plume,
            scaleY: 0.1,
            alpha: 0,
            duration: HAZARD_CONFIG.geyserCooldownTime,
            ease: 'Sine.easeIn',
            onComplete: () => {
              this.plume.disableBody(true, true);
              this.plume.setVisible(false);
            }
          });
        }
      } else if (this.state === 'cooldown') {
        if (this.timer >= HAZARD_CONFIG.geyserCooldownTime) {
          this.state = 'idle';
          this.timer = 0;
        }
      }
    }

    reset() {
      this.state = 'idle';
      this.timer = (this.x % 400);
      this.base.clearTint();
      this.base.setScale(1.0, 1.0);
      this.plume.disableBody(true, true);
      this.plume.setVisible(false);
      this.plume.setScale(1.0, 1.0);
    }
  }

  class FloatingMeteor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config = {}) {
      super(scene, x, y, 'hazard_meteor');
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.startX = x;
      this.startY = y;
      this.minX = (config.minX !== undefined) ? config.minX : (x - 100);
      this.maxX = (config.maxX !== undefined) ? config.maxX : (x + 100);
      this.speed = config.speed || 60;
      this.direction = 1;
      this.damage = config.damage || HAZARD_CONFIG.meteorDamage;

      this.setDepth(4);
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.setCircle(15, 4, 4);
    }

    update(time, delta) {
      if (!this.body) return;
      this.x += this.speed * this.direction * (delta / 1000);
      if (this.x >= this.maxX && this.direction > 0) {
        this.direction = -1;
      } else if (this.x <= this.minX && this.direction < 0) {
        this.direction = 1;
      }
      this.rotation += 0.02 * this.direction;
    }

    reset() {
      this.setPosition(this.startX, this.startY);
      this.direction = 1;
      this.rotation = 0;
      this.enableBody(true, this.startX, this.startY, true, true);
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
    }
  }

  class WindZone {
    constructor(scene, minX, maxX, forceX = -80) {
      this.scene = scene;
      this.minX = minX;
      this.maxX = maxX;
      this.forceX = forceX;
      this.particles = [];

      // Create flowing airflow ribbon particles
      const count = 7;
      for (let i = 0; i < count; i++) {
        const px = Phaser.Math.Between(minX, maxX);
        const py = Phaser.Math.Between(150, 430);
        const p = scene.add.image(px, py, 'wind_streak')
          .setAlpha(0.45)
          .setScale(0.85)
          .setDepth(2);
        p.startX = minX;
        p.endX = maxX;
        p.speed = Math.abs(forceX) * 1.3 + Phaser.Math.Between(20, 50);
        this.particles.push(p);
      }
    }

    update(time, delta) {
      const dir = this.forceX < 0 ? -1 : 1;
      this.particles.forEach(p => {
        p.x += dir * p.speed * (delta / 1000);
        p.alpha = 0.25 + Math.sin(time * 0.005 + p.y) * 0.2;
        if (dir < 0 && p.x < this.minX) {
          p.x = this.maxX;
        } else if (dir > 0 && p.x > this.maxX) {
          p.x = this.minX;
        }
      });

      // Apply horizontal drift force to dog if within zone bounds
      const dog = this.scene.dog;
      if (dog && dog.body) {
        if (dog.x >= this.minX && dog.x <= this.maxX) {
          dog.body.velocity.x += this.forceX * (delta / 1000) * 2.2;
          if (Math.random() < 0.015 && window.Sound && window.Sound.playWindGust) {
            window.Sound.playWindGust();
          }
        }
      }
    }

    reset() {}
  }

  /* ========================================================
     5D. COLLAPSING ROCKS & THORN HAZARDS
     ======================================================== */
  class CollapsingRock extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config = {}) {
      const tex = config.tex || 'collapsing_rock';
      super(scene, x, y, tex);
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.startX = x;
      this.startY = y;
      this.warningMs = config.warningMs || 650;
      this.fallSpeed = config.fallSpeed || 340;
      this.resetMs = config.resetMs || 2800;
      this.state = 'idle'; // 'idle', 'shaking', 'falling', 'disabled'
      this.shakeTween = null;
      this.fallTween = null;
      this.resetTimer = null;

      this.setDepth(3);
      this.setScale(config.scale || 0.42);
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.moves = false;
      this.body.checkCollision.down = false;
      this.body.checkCollision.left = false;
      this.body.checkCollision.right = false;
    }

    onDogStep() {
      if (this.state !== 'idle') return;
      this.state = 'shaking';

      if (window.Sound && window.Sound.playRockShake) {
        window.Sound.playRockShake();
      }

      this.shakeTween = this.scene.tweens.add({
        targets: this,
        x: { from: this.startX - 3, to: this.startX + 3 },
        duration: 40,
        yoyo: true,
        repeat: Math.floor(this.warningMs / 80),
        onComplete: () => {
          this.triggerFall();
        }
      });
    }

    triggerFall() {
      if (this.state !== 'shaking') return;
      this.state = 'falling';
      this.x = this.startX;

      if (window.Sound && window.Sound.playRockDrop) {
        window.Sound.playRockDrop();
      }

      // Disable top collision once falling begins
      this.body.checkCollision.none = true;

      this.fallTween = this.scene.tweens.add({
        targets: this,
        y: this.startY + 240,
        alpha: 0,
        duration: 520,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.state = 'disabled';
          this.setVisible(false);
          this.resetTimer = this.scene.time.delayedCall(this.resetMs, () => {
            this.reset();
          });
        }
      });
    }

    reset() {
      if (this.shakeTween) this.shakeTween.stop();
      if (this.fallTween) this.fallTween.stop();
      if (this.resetTimer) this.resetTimer.remove();

      this.x = this.startX;
      this.y = this.startY;
      this.setAlpha(1);
      this.setVisible(true);
      this.body.checkCollision.none = false;
      this.body.checkCollision.up = true;
      this.state = 'idle';
    }
  }

  class ThornPatch extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config = {}) {
      super(scene, x, y, 'hazard_thorn');
      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.startX = x;
      this.startY = y;
      this.damage = config.damage || 8;
      this.setOrigin(0.5, 1.0);
      this.setDepth(3);
      this.setScale(config.scale || 1.0);
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.setSize(64, 22);
      this.body.setOffset(4, 6);
    }

    reset() {
      this.setPosition(this.startX, this.startY);
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
      this.groundY = groundY;
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

      // Physical Trenches & Segmented Solid Ground
      const trenches = cfg.trenches || [];
      let curX = -100;
      const solidSegments = [];
      trenches.forEach(t => {
        if (t.startX > curX) {
          solidSegments.push({ startX: curX, endX: t.startX });
        }
        curX = Math.max(curX, t.endX);
      });
      if (curX < levelWidth + 400) {
        solidSegments.push({ startX: curX, endX: levelWidth + 400 });
      }

      const bedrockColor = cfg.id === 2 ? 0x170b28 : (cfg.id === 3 ? 0x051b33 : 0x0c101d);

      solidSegments.forEach(seg => {
        for (let x = seg.startX; x < seg.endX; x += 420) {
          const span = Math.min(420, seg.endX - x);
          const floorTile = this.platforms.create(x + span / 2, groundY + 55, cfg.groundFloor || 'platform')
            .setScale(span / 800, 0.85).refreshBody();
          if (cfg.groundFloorTint) floorTile.setTint(cfg.groundFloorTint);
          floorTile.setDepth(3);
        }

        // Solid ground bedrock fill strictly within segment boundaries
        const segW = seg.endX - seg.startX;
        this.add.rectangle(seg.startX, groundY + 45, segW, 450, bedrockColor)
          .setOrigin(0, 0)
          .setDepth(2);
      });

      // 3. Scenic Trees, Rune Stones, Fences & Tablets
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
          const tex = p.tex || stepTex;
          const plat = this.platforms.create(p.x, groundY + p.y, tex).setScale(0.28, 0.28).refreshBody();
          plat.body.checkCollision.down = false; // Allows smooth passage underneath without head bumps
          if (cfg.groundFloorTint && tex === 'platform') plat.setTint(cfg.groundFloorTint);
          plat.setDepth(3);
        });
      }

      // Moving Platforms (Levels 1, 2 & 3)
      this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
      this.ridingPlatform = null;
      if (cfg.movingSpots && cfg.movingSpots.length > 0) {
        cfg.movingSpots.forEach(m => {
          const tex = m.tex || stepTex;
          const mp = this.movingPlatforms.create(m.x, groundY + m.y, tex);
          mp.setScale(0.28, 0.28);
          mp.body.moves = false;
          mp.body.setImmovable(true);
          mp.body.checkCollision.down = false; // Smooth jump through from underneath
          mp.setDepth(3);
          mp.prevX = mp.x;
          mp.prevY = mp.y;
          if (cfg.groundFloorTint && tex === 'platform') mp.setTint(cfg.groundFloorTint);
          
          const tweenCfg = {
            targets: mp,
            ease: 'Sine.easeInOut',
            duration: m.duration || 2400,
            yoyo: true,
            repeat: -1
          };
          if (m.distanceX) tweenCfg.x = m.x + m.distanceX;
          if (m.distanceY) tweenCfg.y = (groundY + m.y) + m.distanceY;
          this.tweens.add(tweenCfg);
        });
      }

      // Collapsing Rocks (Timed Platform Traversal)
      this.collapsingRocks = this.physics.add.group({ allowGravity: false, immovable: true });
      if (cfg.collapsingRocks && cfg.collapsingRocks.length > 0) {
        cfg.collapsingRocks.forEach(cr => {
          const rock = new CollapsingRock(this, cr.x, groundY + cr.y, cr);
          this.collapsingRocks.add(rock);
        });
      }

      // Thorns / Spikes Hazards
      this.thorns = this.physics.add.group({ allowGravity: false, immovable: true });
      if (cfg.thorns && cfg.thorns.length > 0) {
        cfg.thorns.forEach(th => {
          const thorn = new ThornPatch(this, th.x, groundY + th.y, th);
          this.thorns.add(thorn);
        });
      }

      // Ambient Animated Life: Butterflies (Level 1)
      if (cfg.ambientButterflies && cfg.ambientButterflies.length > 0) {
        cfg.ambientButterflies.forEach(b => {
          const bf = this.add.sprite(b.x, groundY + b.y, 'butterfly_anim').setDepth(4).setScale(0.85);
          bf.play('butterfly-flutter');
          this.tweens.add({
            targets: bf,
            x: b.x + (b.dx || 45),
            y: groundY + b.y + (b.dy || -20),
            duration: 2500 + (b.x % 600),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        });
      }

      // Ambient Animated Life: Swaying Grass (Levels 1 & 3)
      if (cfg.ambientGrass && cfg.ambientGrass.length > 0) {
        cfg.ambientGrass.forEach(gx => {
          const gr = this.add.sprite(gx, groundY, 'grass_anim').setOrigin(0.5, 1.0).setDepth(3).setScale(0.65);
          gr.play('grass-sway');
        });
      }

      // Ambient Animated Life: Rising Bubbles (Level 2)
      if (cfg.ambientBubbles && cfg.ambientBubbles.length > 0) {
        cfg.ambientBubbles.forEach(bb => {
          const bubble = this.add.sprite(bb.x, groundY + bb.y, 'bubble_anim').setOrigin(0.5, 1.0).setDepth(2).setScale(0.85);
          bubble.play('bubble-rise');
        });
      }

      // Ambient Animated Life: Cavern Flies (Level 2)
      if (cfg.ambientFlies && cfg.ambientFlies.length > 0) {
        cfg.ambientFlies.forEach(fl => {
          const fly = this.add.sprite(fl.x, groundY + fl.y, 'flies_anim').setDepth(3).setScale(0.7);
          fly.play('flies-buzz');
          this.tweens.add({
            targets: fly,
            x: fl.x + 35,
            y: groundY + fl.y - 18,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        });
      }

      // Animated Cave Entrance Landmark (Level 2)
      if (cfg.caveEntrance) {
        const caveIn = this.add.sprite(cfg.caveEntrance.x, groundY, 'cave_anim').setOrigin(0.5, 1.0).setDepth(2).setScale(0.72);
        caveIn.play('cave-glow');
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
        this.physics.add.collider(this.dog, this.movingPlatforms, (dog, mp) => {
          if (dog.body.touching.down && mp.body.touching.up) {
            this.ridingPlatform = mp;
          }
        });
      }
      if (this.collapsingRocks) {
        this.physics.add.collider(this.dog, this.collapsingRocks, (dog, rock) => {
          if (dog.body.touching.down && rock.body.touching.up) {
            rock.onDogStep();
          }
        });
      }
      if (this.thorns) {
        this.physics.add.overlap(this.dog, this.thorns, (dog, thorn) => {
          this.handleDogThornCollision(dog, thorn);
        });
      }

      // Coyote time, Jump buffer & Double Jump state
      this.canJumpUntil = 0;
      this.jumpBufferedUntil = 0;
      this.jumpsLeft = 2;
      this.isSniffing = false;
      this.isFallingInTrench = false;

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

      // 7. Knowledge Gates, Vaults & Special Diamonds
      this.gates = [];
      this.obstacles = [];
      this.vaultBarriers = [];
      this.specialDiamonds = [];
      this.specialDiamondsGroup = this.physics.add.group({ allowGravity: false });

      // Solid static group for all vault structures (gate, back obstacle, sky beams, roof)
      this.gateWallsGroup = this.physics.add.staticGroup();

      if (cfg.gateLocations && cfg.gateLocations.length > 0) {
        const diamondGateIndices = cfg.diamondGateIndices || [1, 3, 6];
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

          // Front vertical beam (gx, groundY - 260) - prevents jumping over front gate
          const frontSky = this.gateWallsGroup.create(gx, groundY - 260, 'platform');
          frontSky.setScale(0.12, 3.5);
          frontSky.setVisible(false);
          frontSky.refreshBody();
          frontSky.gateIndex = idx;
          this.vaultBarriers.push(frontSky);

          const hasDiamond = diamondGateIndices.includes(idx);
          if (hasDiamond) {
            // B. Special Diamond placed inside vault chamber (gx + 120)
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

            // D. Rear vertical sky beam (gx + 240, groundY - 260)
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
          } else {
            this.specialDiamonds[idx] = null;
          }
        });
      }

      // Auras for Cosmic Shield (Cyan) and Super Mode (Golden)
      this.shieldAura = this.add.circle(this.dog.x, this.dog.y, 42, 0x38bdf8, 0.25)
        .setStrokeStyle(3, 0x00ffff, 0.9)
        .setDepth(6)
        .setVisible(false);

      this.superAura = this.add.circle(this.dog.x, this.dog.y, 46, 0xfacc15, 0.35)
        .setStrokeStyle(4, 0xffd700, 0.95)
        .setDepth(6)
        .setVisible(false);

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
          const tex = (eCfg.type === 'fly') ? 'enemy_fly' : (eCfg.type === 'armored' ? 'enemy_armored' : 'enemy_ground');
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

      // 10C. Environmental Hazards (Cosmic Geysers, Meteors, Wind Zones)
      this.levelHazards = [];
      this.hazardMeteorsGroup = this.physics.add.group();
      this.hazardGeysersGroup = this.physics.add.group();

      if (cfg.hazards && cfg.hazards.length > 0) {
        cfg.hazards.forEach(hCfg => {
          if (hCfg.type === 'geyser') {
            const geyser = new CosmicGeyser(this, hCfg.x, groundY, hCfg);
            this.levelHazards.push(geyser);
            this.hazardGeysersGroup.add(geyser.plume);
          } else if (hCfg.type === 'meteor') {
            const spawnY = groundY + (hCfg.y || -90);
            const meteor = new FloatingMeteor(this, hCfg.x, spawnY, hCfg);
            this.levelHazards.push(meteor);
            this.hazardMeteorsGroup.add(meteor);
          } else if (hCfg.type === 'wind') {
            const wind = new WindZone(this, hCfg.minX, hCfg.maxX, hCfg.forceX);
            this.levelHazards.push(wind);
          }
        });
      }

      // Overlap dog with floating meteors (damage pipeline)
      this.physics.add.overlap(this.dog, this.hazardMeteorsGroup, (dog, meteor) => {
        this.handleDogHazardCollision(dog, meteor);
      });

      // Overlap dog with active geyser plumes (launch traversal)
      this.physics.add.overlap(this.dog, this.hazardGeysersGroup, (dog, plume) => {
        if (plume && plume.geyserParent && plume.geyserParent.state === 'burst') {
          this.launchDogFromGeyser(plume.geyserParent);
        }
      });

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
      this.touchJumpTriggered = false;
      this.setupTouchControls();

      // Global window key handler ensures Cosmic Pulse (F, J, X) and Jump (Space, W, Up) work reliably even if canvas focus drifts
      this.globalKeyHandler = (e) => {
        if (AdventureState.isPaused) return;
        if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        const k = e.key ? e.key.toLowerCase() : '';
        if (k === 'f' || k === 'j' || k === 'x') {
          e.preventDefault();
          this.tryFireCosmicPulse();
        } else if (k === ' ' || k === 'w' || e.key === 'ArrowUp') {
          const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
          this.jumpBufferedUntil = now + 150;
          this.touchJumpTriggered = true;
        }
      };
      window.addEventListener('keydown', this.globalKeyHandler);
    }

    setupTouchControls() {
      const activePointers = new Map();

      const bindTouch = (id, onDown, onUp) => {
        const el = document.getElementById(id);
        if (!el) return;

        const handleDown = (e) => {
          e.preventDefault();
          if (e.pointerId != null) {
            activePointers.set(e.pointerId, id);
            try { el.setPointerCapture(e.pointerId); } catch(err) {}
          }
          el.classList.add('touch-active');
          if (window.Sound && window.Sound.playTouchPress) {
            window.Sound.playTouchPress();
          }
          onDown();
        };

        const handleUp = (e) => {
          e.preventDefault();
          if (e.pointerId != null) {
            activePointers.delete(e.pointerId);
            try { el.releasePointerCapture(e.pointerId); } catch(err) {}
          }
          el.classList.remove('touch-active');
          if (onUp) onUp();
        };

        el.onpointerdown = handleDown;
        el.onpointerup = handleUp;
        el.onpointercancel = handleUp;
        el.onlostpointercapture = handleUp;
        el.oncontextmenu = (e) => e.preventDefault();
      };

      bindTouch('btn-touch-left', () => { this.touchLeft = true; this.touchRight = false; }, () => { this.touchLeft = false; });
      bindTouch('btn-touch-right', () => { this.touchRight = true; this.touchLeft = false; }, () => { this.touchRight = false; });
      bindTouch('btn-touch-jump', () => this.queueJump(), () => {});
      bindTouch('btn-touch-pulse', () => this.tryFireCosmicPulse(), () => {});
      bindTouch('btn-touch-sniff', () => this.triggerSniff(), () => {});

      // Setup landscape / portrait orientation prompt
      this.checkOrientation();
      this.orientationHandler = () => this.checkOrientation();
      window.addEventListener('resize', this.orientationHandler);
      window.addEventListener('orientationchange', this.orientationHandler);
    }

    checkOrientation() {
      const prompt = document.getElementById('adv-rotate-prompt');
      if (!prompt) return;
      const isMobileTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 850);
      const isPortrait = window.innerHeight > window.innerWidth;
      const advActive = (document.getElementById('screen-adventure')?.classList.contains('active'));
      if (advActive && isMobileTouch && isPortrait) {
        prompt.style.display = 'flex';
      } else {
        prompt.style.display = 'none';
      }
    }

    clearTouchInputs() {
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJumpTriggered = false;
      const btns = document.querySelectorAll('.adv-touch-btn');
      btns.forEach(b => b.classList.remove('touch-active'));
    }

    queueJump() {
      const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
      this.jumpBufferedUntil = now + 160;
      this.touchJumpTriggered = true;
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

      const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
      const hasSpeed = (now < AdventureState.activePowers.speedUntil) || (now < AdventureState.activePowers.superUntil);
      const hasMagnet = (now < AdventureState.activePowers.magnetUntil) || (now < AdventureState.activePowers.superUntil);
      const hasShield = AdventureState.activePowers.shield;
      const hasSuper = (now < AdventureState.activePowers.superUntil);

      // Auras tracking dog
      if (this.shieldAura) {
        this.shieldAura.setPosition(this.dog.x, this.dog.y);
        this.shieldAura.setVisible(hasShield && !hasSuper);
        if (hasShield) {
          this.shieldAura.alpha = 0.22 + Math.sin(time * 0.008) * 0.12;
        }
      }
      if (this.superAura) {
        this.superAura.setPosition(this.dog.x, this.dog.y);
        this.superAura.setVisible(hasSuper);
        if (hasSuper) {
          this.superAura.alpha = 0.32 + Math.sin(time * 0.012) * 0.15;
          if (Math.random() < 0.25) {
            this.createSpeedTrail(this.dog.x, this.dog.y, 0xfacc15);
          }
        }
      }

      // Bone Magnet Attraction (Streak 4 & Super Mode) - Attracts BONES ONLY per Requirement 11
      if (hasMagnet) {
        const magnetRadius = hasSuper ? 360 : 280;
        const pullSpeed = 260;
        this.bonesGroup.getChildren().forEach(b => {
          if (b.active) {
            const dist = Phaser.Math.Distance.Between(this.dog.x, this.dog.y, b.x, b.y);
            if (dist < magnetRadius) {
              const angle = Phaser.Math.Angle.Between(b.x, b.y, this.dog.x, this.dog.y);
              b.x += Math.cos(angle) * (pullSpeed * delta / 1000);
              b.y += Math.sin(angle) * (pullSpeed * delta / 1000);
              b.initialY = b.y;
            }
          }
        });
      }

      // First-time armored enemy instructional HUD hint (once per session/profile)
      if (!window.armoredTutorialShown && this.levelEnemies) {
        const nearArmored = this.levelEnemies.find(e => e && e.active && e.enemyType === 'armored' && !e.isDefeated && Math.abs(this.dog.x - e.x) < 320);
        if (nearArmored) {
          window.armoredTutorialShown = true;
          this.showFloatingText(this.dog.x, this.dog.y - 45, "ARMORED ENEMY! 🛡️ Stomps won't work — use Cosmic Pulse! ⚡", "#38bdf8");
          if (window.setSparkyMessage) {
            window.setSparkyMessage("⚠️ <strong>Armored Enemy Ahead!</strong> Stomps bounce off armored shells — use <strong>Cosmic Pulse [F, J, X]</strong> or touch button to crack it!");
          }
        }
      }

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

      // Update Environmental Hazards (Geysers, Meteors, Wind Zones)
      if (this.levelHazards && this.levelHazards.length > 0) {
        this.levelHazards.forEach(h => {
          if (h && typeof h.update === 'function') h.update(time, delta);
        });
      }

      // Delta tracking for moving platforms so dog rides smoothly without sliding off
      if ((this.dog.body.blocked.down || this.dog.body.touching.down) && this.ridingPlatform) {
        if (this.ridingPlatform.active && this.ridingPlatform.prevX !== undefined) {
          const dx = this.ridingPlatform.x - this.ridingPlatform.prevX;
          const dy = this.ridingPlatform.y - this.ridingPlatform.prevY;
          this.dog.x += dx;
          this.dog.y += dy;
        }
      } else {
        this.ridingPlatform = null;
      }

      if (this.movingPlatforms) {
        this.movingPlatforms.getChildren().forEach(mp => {
          mp.prevX = mp.x;
          mp.prevY = mp.y;
        });
      }

      // Real Trench / Pit Fall Detection (below ground level)
      if (this.groundY && this.dog.y > this.groundY + 110 && !this.isFallingInTrench) {
        this.handleTrenchFall();
        return;
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

      const onGround = this.dog.body.blocked.down || this.dog.body.touching.down;
      if (onGround) {
        this.canJumpUntil = time + 120; // Coyote time
        this.jumpsLeft = 2;             // Reset jumps on ground
      } else if (time >= this.canJumpUntil && this.jumpsLeft === 2) {
        // Stepped or fell off a ledge into the air without jumping; first jump consumed
        this.jumpsLeft = 1;
      }

      const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchLeft;
      const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.touchRight;
      const wantsJump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                        Phaser.Input.Keyboard.JustDown(this.keyW) || 
                        Phaser.Input.Keyboard.JustDown(this.keySpace) ||
                        this.touchJumpTriggered;
      this.touchJumpTriggered = false;

      if (wantsJump) {
        this.jumpBufferedUntil = time + 140;
      }

      // Lateral Movement with dynamic speed boost
      const currentSpeed = hasSpeed ? 360 : 250;
      if (moveLeft) {
        this.dog.setVelocityX(-currentSpeed);
        this.dog.setFlipX(true);
        if (onGround && this.dog.anims.currentAnim?.key !== 'dog-walk') {
          this.dog.play('dog-walk');
        }
        if (hasSpeed && Math.random() < 0.35) {
          this.createSpeedTrail(this.dog.x, this.dog.y, hasSuper ? 0xfacc15 : 0x38bdf8);
        }
      } else if (moveRight) {
        this.dog.setVelocityX(currentSpeed);
        this.dog.setFlipX(false);
        if (onGround && this.dog.anims.currentAnim?.key !== 'dog-walk') {
          this.dog.play('dog-walk');
        }
        if (hasSpeed && Math.random() < 0.35) {
          this.createSpeedTrail(this.dog.x, this.dog.y, hasSuper ? 0xfacc15 : 0x38bdf8);
        }
      } else {
        this.dog.setVelocityX(0);
        if (onGround && this.dog.anims.currentAnim?.key !== 'dog-idle') {
          this.dog.play('dog-idle');
        }
      }

      // Jump Execution (Single Jump & Air Double Jump)
      const canGroundJump = onGround || (time < this.canJumpUntil);
      const hasBufferedJump = time < this.jumpBufferedUntil;

      if (hasBufferedJump && canGroundJump && this.jumpsLeft >= 1) {
        // 1. Primary Ground / Coyote Jump
        this.dog.setVelocityY(-575);
        this.jumpsLeft = 1;
        this.canJumpUntil = 0;
        this.jumpBufferedUntil = 0;
        if (window.Sound && window.Sound.playJump) {
          window.Sound.playJump();
        }
      } else if (wantsJump && !canGroundJump && this.jumpsLeft === 1) {
        // 2. Air Double Jump
        this.dog.setVelocityY(-530);
        this.jumpsLeft = 0;
        this.jumpBufferedUntil = 0;
        this.createDoubleJumpPuff(this.dog.x, this.dog.y + 24);
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

      this.clearTouchInputs();
      const touchControls = document.getElementById('adv-touch-controls');
      if (touchControls) touchControls.style.display = 'none';

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
      AdventureState.updateHud();

      // Three.js portal burst effect
      if (window.AdventureBackground3D) {
        window.AdventureBackground3D.triggerGateBurst(gateIndex);
      }

      this.clearTouchInputs();
      const touchControls = document.getElementById('adv-touch-controls');
      if (touchControls) touchControls.style.display = '';

      this.physics.world.resume();
      AdventureState.isPaused = false;
    }

    createSpeedTrail(x, y, tint = 0x38bdf8) {
      if (!this.dog) return;
      const ghost = this.add.sprite(x, y, this.dog.texture.key, this.dog.frame.name)
        .setScale(this.dog.scaleX, this.dog.scaleY)
        .setFlipX(this.dog.flipX)
        .setTint(tint)
        .setAlpha(0.4)
        .setDepth(4);
      this.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 200,
        onComplete: () => ghost.destroy()
      });
    }

    applyStreakPower(streak) {
      const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
      switch(streak) {
        case 1:
          this.showFloatingText(this.dog.x, this.dog.y - 45, "STREAK 1! Keep Going! 🚀", "#38bdf8");
          break;
        case 2:
          this.showFloatingText(this.dog.x, this.dog.y - 45, "STREAK 2! Sharp Focus! ⚡", "#a78bfa");
          break;
        case 3:
          AdventureState.activePowers.speedUntil = Math.max(AdventureState.activePowers.speedUntil, now) + 25000;
          this.showFloatingText(this.dog.x, this.dog.y - 45, "⚡ SPEED BOOST UNLOCKED! (25s) 💨", "#38bdf8");
          if (window.setSparkyMessage) {
            window.setSparkyMessage("⚡ <strong>Streak Power: Speed Boost!</strong> Cosmo Dog now runs faster with a cyan trail!");
          }
          break;
        case 4:
          AdventureState.activePowers.magnetUntil = Math.max(AdventureState.activePowers.magnetUntil, now) + 25000;
          this.showFloatingText(this.dog.x, this.dog.y - 45, "🧲 BONE MAGNET ACTIVATED! (25s) 🦴", "#ec4899");
          if (window.setSparkyMessage) {
            window.setSparkyMessage("🧲 <strong>Streak Power: Bone Magnet!</strong> Nearby bones are drawn to you!");
          }
          break;
        case 5:
          AdventureState.activePowers.shield = true;
          this.showFloatingText(this.dog.x, this.dog.y - 45, "🛡️ COSMIC SHIELD ACTIVATED! 🛡️", "#06b6d4");
          if (window.setSparkyMessage) {
            window.setSparkyMessage("🛡️ <strong>Streak Power: Cosmic Shield!</strong> Absorbs 1 enemy collision without energy loss!");
          }
          break;
        case 6:
          AdventureState.addScore(500);
          AdventureState.modifyEnergy(25);
          this.showFloatingText(this.dog.x, this.dog.y - 45, "🌟 MEGA REWARD! +500 PTS & +25 ENERGY! 🌟", "#facc15");
          if (window.setSparkyMessage) {
            window.setSparkyMessage("🌟 <strong>Streak 6 Celebration!</strong> Brilliant streak, Cadet! Massive bonus score & energy awarded!");
          }
          break;
        case 7:
          AdventureState.activePowers.superUntil = Math.max(AdventureState.activePowers.superUntil, now) + 20000;
          this.showFloatingText(this.dog.x, this.dog.y - 45, "👑 SUPER MODE UNLOCKED! (20s) 👑", "#f59e0b");
          if (window.setSparkyMessage) {
            window.setSparkyMessage("👑 <strong>SUPER MODE UNLOCKED!</strong> Invincible, max speed, and mega magnet! Ultimate streak power!");
          }
          break;
        default:
          if (streak > 7) {
            AdventureState.addScore(300);
            this.showFloatingText(this.dog.x, this.dog.y - 45, `🔥 STREAK ${streak}! +300 PTS! 🔥`, "#facc15");
          }
          break;
      }
    }

    handleDogEnemyCollision(dog, enemy) {
      if (enemy.isDefeated || !enemy.body || !dog.body) return;

      const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
      const hasSuper = (now < AdventureState.activePowers.superUntil);

      // Super Mode: Instant enemy defeat without taking damage
      if (hasSuper) {
        enemy.defeat(this);
        dog.setVelocityY(-350);
        const isArmored = (enemy.enemyType === 'armored');
        const baseScore = isArmored ? ARMORED_BEETLE_CONFIG.scoreReward : 150;
        const earned = AdventureState.addScore(baseScore);
        this.showFloatingText(enemy.x, enemy.y - 20, `+${earned} SUPER ${isArmored ? 'CRUSH' : 'STOMP'}! 🌟`, '#facc15');
        if (isArmored && window.Sound && window.Sound.playArmoredBreak) {
          window.Sound.playArmoredBreak();
        }
        if (window.Sound && window.Sound.playStompPop) {
          window.Sound.playStompPop();
        }
        return;
      }

      // Mario-Style Stomp Detection:
      // 1. Dog is falling downward (velocity.y > 0)
      // 2. Dog's bottom is contacting near top of enemy
      const isFalling = (dog.body.velocity.y > 0);
      const isAbove = (dog.body.bottom <= enemy.body.top + 26) || (dog.y < enemy.y - 10);

      if (isFalling && isAbove) {
        // --- ARMORED ENEMY STOMP (DEFLECTED) ---
        if (enemy.enemyType === 'armored') {
          // Bounce dog upward safely
          dog.setVelocityY(ARMORED_BEETLE_CONFIG.bounceVelocity);

          // Flash armored shell
          this.tweens.add({
            targets: enemy,
            tint: 0xf59e0b,
            duration: 60,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              enemy.clearTint();
            }
          });

          // Deflection sound
          if (window.Sound && window.Sound.playArmoredStompBlocked) {
            window.Sound.playArmoredStompBlocked();
          }

          // Floating text feedback per requirement 7
          this.showFloatingText(enemy.x, enemy.y - 25, "ARMOR TOO STRONG! 🛡️ Use Cosmic Pulse! ⚡", "#f59e0b");

          if (window.setSparkyMessage) {
            window.setSparkyMessage("🛡️ <strong>Armor Too Strong!</strong> Stomps bounce off! Fire Cosmic Pulse [F / J / X] to crack the shell!");
          }
          return;
        }

        // --- NORMAL MARIO-STYLE STOMP SUCCESS ---
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
        // --- SIDE / BOTTOM COLLISION (DAMAGE OR SHIELD) ---
        if (this.isInvulnerable) return; // Prevent repeated damage loops!

        // Cosmic Shield Power (Streak 5)
        if (AdventureState.activePowers.shield) {
          AdventureState.activePowers.shield = false;
          this.showFloatingText(dog.x, dog.y - 30, "SHIELD ABSORBED HIT! 🛡️", "#38bdf8");
          if (window.Sound && window.Sound.playPowerup) {
            window.Sound.playPowerup();
          }
          this.isInvulnerable = true;
          this.tweens.add({
            targets: dog,
            alpha: 0.45,
            duration: 90,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              dog.setAlpha(1.0);
              this.isInvulnerable = false;
            }
          });
          return;
        }

        // Deduct 10 Energy (ARMORED_BEETLE_CONFIG.damage or ENEMY_CONFIG.damage)
        const dmgAmount = (enemy.enemyType === 'armored') ? ARMORED_BEETLE_CONFIG.damage : ENEMY_CONFIG.damage;
        AdventureState.modifyEnergy(-dmgAmount);

        // Knockback away from enemy with small hop
        const knockDir = (dog.x < enemy.x) ? -1 : 1;
        dog.setVelocityX(knockDir * ENEMY_CONFIG.knockbackSpeedX);
        dog.setVelocityY(ENEMY_CONFIG.knockbackSpeedY);

        // Hurt SFX
        if (window.Sound && window.Sound.playPlayerHurt) {
          window.Sound.playPlayerHurt();
        }

        // Floating damage alert
        this.showFloatingText(dog.x, dog.y - 30, `-${dmgAmount} ENERGY ⚠️`, '#f43f5e');

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

      const dmg = pulse.damage || 1;

      // 1. Immediately deactivate projectile
      pulse.deactivate(true);

      // 2. Play magical impact burst
      this.createPulseImpact(pulse.x, pulse.y);

      // 3. Take hit on enemy (reusable pipeline for current & future armored enemies)
      const defeated = enemy.takeHit(this, {
        damage: dmg,
        source: 'cosmic-pulse'
      });

      // 4. Reward score and play sound if defeated
      if (defeated) {
        const isArmored = (enemy.enemyType === 'armored');
        const scoreVal = isArmored ? ARMORED_BEETLE_CONFIG.scoreReward : PROJECTILE_CONFIG.defeatScore;
        const earned = AdventureState.addScore(scoreVal);
        const label = isArmored ? `+${earned} ARMORED DEFEAT! 💥` : `+${earned} COSMIC HIT! ⚡`;
        this.showFloatingText(enemy.x, enemy.y - 30, label, '#38bdf8');
        if (window.Sound && window.Sound.playCosmicPulseHit) {
          window.Sound.playCosmicPulseHit();
        }
      }
    }

    tryFireCosmicPulse() {
      if (AdventureState.isPaused || !this.dog || !this.dog.body) return false;
      const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
      if (now < this.nextFireTime) return false;

      const pulse = this.pulsePool ? this.pulsePool.getAvailable() : null;
      if (!pulse) return false;

      this.nextFireTime = now + PROJECTILE_CONFIG.cooldown;

      const hasSuper = (now < AdventureState.activePowers.superUntil);
      const direction = this.dog.flipX ? -1 : 1;
      const spawnX = this.dog.x + (PROJECTILE_CONFIG.offsetX * direction);
      const spawnY = this.dog.y - 12; // Snout / chest height, completely clear of ground colliders

      pulse.fire(spawnX, spawnY, direction, hasSuper);

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

    createDoubleJumpPuff(x, y) {
      // Cosmic Paw Thruster / Double Jump Ring Effect
      const ring = this.add.circle(x, y, 12, 0x38bdf8, 0.75);
      ring.setDepth(6);
      this.tweens.add({
        targets: ring,
        scaleX: 2.2,
        scaleY: 0.8,
        alpha: 0,
        duration: 220,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });

      for (let i = 0; i < 4; i++) {
        const p = this.add.circle(x + (Math.random() - 0.5) * 26, y + (Math.random() - 0.5) * 6, 2.5, 0xa855f7, 0.85);
        p.setDepth(6);
        this.tweens.add({
          targets: p,
          y: y + 16 + Math.random() * 14,
          alpha: 0,
          scale: 0.2,
          duration: 240,
          ease: 'Sine.easeOut',
          onComplete: () => p.destroy()
        });
      }
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

    handleDogHazardCollision(dog, hazard) {
      if (!dog.body || !hazard.body) return;

      const now = (this.time && this.time.now != null) ? this.time.now : performance.now();
      const hasSuper = (now < AdventureState.activePowers.superUntil);

      // Super Mode: Completely immune to hazard damage
      if (hasSuper) {
        dog.setVelocityY(-180);
        this.showFloatingText(dog.x, dog.y - 30, "SUPER RESISTANCE! 🌟", "#facc15");
        return;
      }

      // Cosmic Shield Power: Absorbs 1 hazard contact without energy loss
      if (AdventureState.activePowers.shield) {
        AdventureState.activePowers.shield = false;
        this.showFloatingText(dog.x, dog.y - 30, "SHIELD ABSORBED HAZARD! 🛡️", "#38bdf8");
        if (window.Sound && window.Sound.playPowerup) {
          window.Sound.playPowerup();
        }
        this.isInvulnerable = true;
        this.tweens.add({
          targets: dog,
          alpha: 0.45,
          duration: 90,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            dog.setAlpha(1.0);
            this.isInvulnerable = false;
          }
        });
        return;
      }

      if (this.isInvulnerable) return; // Prevent rapid repeated damage

      // Deduct energy
      const dmg = hazard.damage || HAZARD_CONFIG.meteorDamage;
      AdventureState.modifyEnergy(-dmg);

      // Mild knockback away from hazard
      const knockDir = (dog.x < hazard.x) ? -1 : 1;
      dog.setVelocityX(knockDir * HAZARD_CONFIG.meteorKnockbackX);
      dog.setVelocityY(HAZARD_CONFIG.meteorKnockbackY);

      // Meteor hit audio
      if (window.Sound && window.Sound.playMeteorHit) {
        window.Sound.playMeteorHit();
      }

      // Floating text
      this.showFloatingText(dog.x, dog.y - 30, `-${dmg} ENERGY ☄️`, '#f43f5e');

      // Temporary invulnerability blinking
      this.isInvulnerable = true;
      this.tweens.add({
        targets: dog,
        alpha: 0.35,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          dog.setAlpha(1.0);
          this.isInvulnerable = false;
        }
      });

      if (window.setSparkyMessage) {
        window.setSparkyMessage("⚠️ <strong>Cosmic Rock Impact!</strong> Lost 8 Energy! Watch out for floating hazards Cadet!");
      }
    }

    launchDogFromGeyser(geyser) {
      if (!this.dog || !this.dog.body) return;
      const vy = geyser.launchVelocity || HAZARD_CONFIG.geyserLaunchVelocity;
      this.dog.setVelocityY(vy);
      this.jumpsLeft = 1; // Allows a high air double-jump from the peak!
      this.canJumpUntil = 0;
      this.showFloatingText(this.dog.x, this.dog.y - 45, "COSMIC BOOST! 🚀", "#38bdf8");
      this.createDoubleJumpPuff(this.dog.x, this.dog.y + 20);
    }

    handleDogThornCollision(dog, thorn) {
      if (this.isInvulnerable || AdventureState.isPaused) return;

      const now = Date.now();
      const hasSuper = (now < AdventureState.activePowers.superUntil);
      const hasShield = (now < AdventureState.activePowers.shieldUntil);

      // Super Mode: Immune to hazard damage
      if (hasSuper) {
        return;
      }

      // Cosmic Shield: Absorbs hit, consumes shield, 0 energy loss
      if (hasShield) {
        AdventureState.activePowers.shieldUntil = 0;
        this.updateStreakUI();
        if (this.shieldAura) this.shieldAura.setVisible(false);
        this.showFloatingText(dog.x, dog.y - 30, "SHIELD ABSORBED THORNS! 🛡️", "#38bdf8");
        if (window.Sound && window.Sound.playPowerup) {
          window.Sound.playPowerup();
        }
        this.isInvulnerable = true;
        this.tweens.add({
          targets: dog,
          alpha: 0.45,
          duration: 90,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            dog.setAlpha(1.0);
            this.isInvulnerable = false;
          }
        });
        return;
      }

      // Take damage
      const dmg = thorn.damage || 8;
      AdventureState.modifyEnergy(-dmg);

      // Mild knockback away from thorn
      const knockDir = (dog.x < thorn.x) ? -1 : 1;
      dog.setVelocityX(knockDir * 160);
      dog.setVelocityY(-170);

      if (window.Sound && window.Sound.playThornHit) {
        window.Sound.playThornHit();
      }

      this.showFloatingText(dog.x, dog.y - 30, `-${dmg} ENERGY 🌵`, '#f43f5e');

      this.isInvulnerable = true;
      this.tweens.add({
        targets: dog,
        alpha: 0.35,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          dog.setAlpha(1.0);
          this.isInvulnerable = false;
        }
      });
    }

    handleTrenchFall() {
      if (this.isFallingInTrench || AdventureState.isPaused) return;
      this.isFallingInTrench = true;
      this.dog.setVelocity(0, 0);
      this.dog.body.setAllowGravity(false);

      if (window.Sound && window.Sound.playTrenchFall) {
        window.Sound.playTrenchFall();
      }

      // Fall penalty: -10 Energy
      AdventureState.modifyEnergy(-10);

      // Child-friendly feedback per Requirement 3
      this.showFloatingPrompt(this.dog.x, this.dog.y - 25, "Oops! Back to checkpoint! 🐾", "#fbbf24");

      // Brief screen fade out (~350ms)
      this.cameras.main.fade(350, 8, 11, 23);

      this.time.delayedCall(450, () => {
        this.respawnDog();
        this.dog.body.setAllowGravity(true);
        this.isFallingInTrench = false;
        this.cameras.main.fadeIn(350, 8, 11, 23);
      });
    }

    showFloatingPrompt(x, y, text, color = '#fbbf24') {
      const prompt = this.add.text(x, y, text, {
        fontSize: '20px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '900',
        fill: color,
        stroke: '#030712',
        strokeThickness: 5
      }).setOrigin(0.5, 0.5).setDepth(20);

      this.tweens.add({
        targets: prompt,
        y: y - 55,
        alpha: 0,
        scale: 1.15,
        duration: 1300,
        ease: 'Cubic.easeOut',
        onComplete: () => prompt.destroy()
      });
    }

    resetHazards() {
      if (this.levelHazards && this.levelHazards.length > 0) {
        this.levelHazards.forEach(h => {
          if (h && typeof h.reset === 'function') h.reset();
        });
      }
    }

    resetCollapsingRocks() {
      if (this.collapsingRocks) {
        this.collapsingRocks.getChildren().forEach(r => {
          if (r && typeof r.reset === 'function') r.reset();
        });
      }
    }

    respawnDog() {
      this.dog.setPosition(AdventureState.checkpointX, AdventureState.checkpointY);
      this.dog.setVelocity(0, 0);
      this.dog.body.setAllowGravity(true);
      this.isFallingInTrench = false;
      this.dog.play('dog-idle');
      this.resetEnemies();
      this.resetHazards();
      this.resetCollapsingRocks();
      this.clearTouchInputs();
      if (this.pulsePool) {
        this.pulsePool.clear();
      }
      this.nextFireTime = 0;
    }

    triggerVictory() {
      AdventureState.isPaused = true;
      this.physics.world.pause();

      this.clearTouchInputs();
      const touchControls = document.getElementById('adv-touch-controls');
      if (touchControls) touchControls.style.display = 'none';

      if (this.pulsePool) {
        this.pulsePool.clear();
      }

      if (window.Sound && window.Sound.playVictory) {
        window.Sound.playVictory();
      }

      showAdventureVictoryScreen();
    }

    shutdown() {
      if (this.globalKeyHandler) {
        window.removeEventListener('keydown', this.globalKeyHandler);
        this.globalKeyHandler = null;
      }
      if (this.orientationHandler) {
        window.removeEventListener('resize', this.orientationHandler);
        window.removeEventListener('orientationchange', this.orientationHandler);
        this.orientationHandler = null;
      }
      this.clearTouchInputs();
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

    // Hide gameplay touch controls while quiz modal is active
    const touchControls = document.getElementById('adv-touch-controls');
    if (touchControls) touchControls.style.display = 'none';

    // Reset scroll position of modal body to top
    const scrollBody = document.getElementById('adv-gate-body-scroll');
    if (scrollBody) scrollBody.scrollTop = 0;

    // Record pause start timestamp so active powers do not expire while in quiz modal
    AdventureState.pauseStartTime = performance.now();

    // Hide clue/hint banner when opening a new question
    const clueBox = document.getElementById('adv-gate-clue-box');
    if (clueBox) {
      clueBox.style.display = 'none';
      clueBox.classList.remove('frozen-mode');
    }

    // Reset timer freeze state for new question
    AdventureState.gateTimerFrozen = false;

    // Pick question from active questionsBank avoiding repetition within the level
    const bank = (window.gameState && window.gameState.questionsBank) || [];
    let available = bank.filter(q => {
      const qId = q.id || q.question;
      return !AdventureState.usedQuestionIds.has(qId);
    });
    // Try to avoid immediately repeating the same topic/concept when alternative topics exist
    if (available.length > 1 && AdventureState.lastTopic) {
      const diffTopic = available.filter(q => (q.topic || '') !== AdventureState.lastTopic);
      if (diffTopic.length > 0) available = diffTopic;
    }
    if (available.length === 0) {
      AdventureState.usedQuestionIds.clear();
      available = bank;
    }
    const qIndex = Math.floor(Math.random() * Math.max(1, available.length));
    const q = available[qIndex] || {
      question: "Which celestial body provides light and energy to our planetary system?",
      options: ["The Moon", "The Sun", "Mars", "Jupiter"],
      answerIndex: 1,
      explanation: "The Sun is the central star of our solar system, providing radiant light and energy."
    };
    const qKey = q.id || q.question;
    AdventureState.usedQuestionIds.add(qKey);
    AdventureState.lastTopic = q.topic || null;
    AdventureState.activeQuestion = q;

    // Header & Meta (Gate X / Total)
    document.getElementById('adv-gate-title').textContent = `Knowledge Gate #${gateIndex + 1} / ${AdventureState.gatesTotal}`;
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
      pill.style.background = 'rgba(244, 63, 94, 0.35)';
      pill.style.borderColor = '#f43f5e';
      pill.style.color = '#fecdd3';
      pill.classList.add('urgent-pulse');
    } else if (AdventureState.gateTimerSecs <= 25) {
      pill.style.background = 'rgba(245, 158, 11, 0.25)';
      pill.style.borderColor = '#f59e0b';
      pill.style.color = '#fde68a';
      pill.classList.remove('urgent-pulse');
    } else {
      pill.style.background = 'rgba(2, 132, 199, 0.2)';
      pill.style.borderColor = '#38bdf8';
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

    const cfg = LEVEL_CONFIGS[AdventureState.currentLevel] || LEVEL_CONFIGS[1];
    const diamondGateIndices = cfg.diamondGateIndices || [1, 3, 6];
    const hasDiamond = diamondGateIndices.includes(AdventureState.activeGateIndex);

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      AdventureState.streak++;
      AdventureState.modifyEnergy(15);
      AdventureState.addScore(200);

      if (window.Sound && window.Sound.playCorrect) window.Sound.playCorrect();

      // Trigger educational streak power milestone
      if (window.currentAdventureScene && window.currentAdventureScene.applyStreakPower) {
        window.currentAdventureScene.applyStreakPower(AdventureState.streak);
      }

      if (window.setSparkyMessage) {
        const streakText = `🔥 Streak: ${AdventureState.streak}!`;
        if (hasDiamond) {
          window.setSparkyMessage(`🌟 <strong>Brilliant Answer!</strong> Gate #${AdventureState.activeGateIndex + 1} unlocked! ${streakText} Special Diamond awaits inside vault! 💎`);
        } else {
          window.setSparkyMessage(`🌟 <strong>Brilliant Answer!</strong> Gate #${AdventureState.activeGateIndex + 1} unlocked! ${streakText} Advancing onward! 🚀`);
        }
      }
    } else {
      clickedBtn.classList.add('wrong');
      allBtns[q.answerIndex]?.classList.add('correct');
      AdventureState.streak = 0;
      AdventureState.modifyEnergy(-15);

      // Special Diamond vanishes only if this gate actually housed a diamond vault
      if (hasDiamond && window.currentAdventureScene && window.currentAdventureScene.vanishDiamond) {
        window.currentAdventureScene.vanishDiamond(AdventureState.activeGateIndex);
      }

      if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
      if (window.setSparkyMessage) {
        if (hasDiamond) {
          window.setSparkyMessage(`💪 <strong>Good Try!</strong> Correct: <strong>${q.options[q.answerIndex]}</strong>. Streak reset & Special Diamond vanished! 💨💎`);
        } else {
          window.setSparkyMessage(`💪 <strong>Good Try!</strong> Correct: <strong>${q.options[q.answerIndex]}</strong>. Streak reset! Keep pushing forward! 🐾`);
        }
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

    const cfg = LEVEL_CONFIGS[AdventureState.currentLevel] || LEVEL_CONFIGS[1];
    const diamondGateIndices = cfg.diamondGateIndices || [1, 3, 6];
    const hasDiamond = diamondGateIndices.includes(AdventureState.activeGateIndex);

    AdventureState.streak = 0;
    AdventureState.modifyEnergy(-20);

    // Special Diamond vanishes when time runs out on diamond gates
    if (hasDiamond && window.currentAdventureScene && window.currentAdventureScene.vanishDiamond) {
      window.currentAdventureScene.vanishDiamond(AdventureState.activeGateIndex);
    }

    if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
    if (window.setSparkyMessage) {
      window.setSparkyMessage(`⏰ <strong>Time's Up!</strong> Gate opened, but streak reset. Press onward! 🐾`);
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

    // Smoothly scroll the explanation into view within the modal body
    setTimeout(() => {
      capsule.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);

    const cfg = LEVEL_CONFIGS[AdventureState.currentLevel] || LEVEL_CONFIGS[1];
    const diamondGateIndices = cfg.diamondGateIndices || [1, 3, 6];
    const hasDiamond = diamondGateIndices.includes(AdventureState.activeGateIndex);

    let html = `<div>${(q && q.explanation) ? q.explanation : "Reviewing this concept strengthens your Olympiad knowledge!"}</div>`;
    if (hasDiamond) {
      if (isCorrect) {
        html += `<div style="margin-top: 10px; padding: 8px 12px; background: rgba(56, 189, 248, 0.15); border: 1.5px solid #38bdf8; border-radius: 12px; color: #38bdf8; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
          <span>💎</span>
          <span><strong>Special Diamond Vault Unlocked!</strong> Claim the rare diamond (+500 PTS & +25 Energy) ahead!</span>
        </div>`;
      } else {
        html += `<div style="margin-top: 10px; padding: 8px 12px; background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; border-radius: 12px; color: #f87171; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
          <span>💨</span>
          <span><strong>Special Diamond Vanished!</strong> Answer correctly next time to claim the rare diamond!</span>
        </div>`;
      }
    } else {
      if (isCorrect) {
        html += `<div style="margin-top: 10px; padding: 8px 12px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; border-radius: 12px; color: #34d399; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
          <span>🚪</span>
          <span><strong>Knowledge Gate Cleared!</strong> Pass through to continue your galactic mission!</span>
        </div>`;
      } else {
        html += `<div style="margin-top: 10px; padding: 8px 12px; background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; border-radius: 12px; color: #f87171; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
          <span>🚪</span>
          <span><strong>Knowledge Gate Opened!</strong> Review the concept and advance forward!</span>
        </div>`;
      }
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

      // Restore touch controls for gameplay exploration
      const touchControls = document.getElementById('adv-touch-controls');
      if (touchControls) touchControls.style.display = '';

      // Restore active power timers so reading questions does not tick down power durations
      const pauseDuration = performance.now() - (AdventureState.pauseStartTime || performance.now());
      if (pauseDuration > 0) {
        if (AdventureState.activePowers.speedUntil > 0) AdventureState.activePowers.speedUntil += pauseDuration;
        if (AdventureState.activePowers.magnetUntil > 0) AdventureState.activePowers.magnetUntil += pauseDuration;
        if (AdventureState.activePowers.superUntil > 0) AdventureState.activePowers.superUntil += pauseDuration;
      }

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

      // Initialize Guidance Toast: show briefly on start, auto-dismiss after 5 seconds
      const toast = document.getElementById('adv-toast');
      if (toast) {
        toast.classList.remove('toast-hidden');
        if (this._toastTimer) clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
          toast.classList.add('toast-hidden');
        }, 5000);
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
