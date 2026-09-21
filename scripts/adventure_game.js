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

      this.canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.warn('Three.js WebGL context lost.');
      }, false);
      this.canvas.addEventListener('webglcontextrestored', () => {
        console.log('Three.js WebGL context restored.');
      }, false);

      this.scene = new THREE.Scene();
      const w = Math.max(10, window.innerWidth);
      const h = Math.max(10, window.innerHeight);
      this.camera = new THREE.PerspectiveCamera(60, w / h, 1, 2000);
      this.camera.position.z = 600;

      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'default'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 850 ? 1.25 : 1.5));
      } catch (err) {
        console.warn('Could not initialize 3D WebGL background renderer:', err);
      }

      const dot = document.createElement('canvas');
      dot.width = dot.height = 32;
      const context = dot.getContext('2d');
      const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.2, '#ffffff');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = glow; context.fillRect(0, 0, 32, 32);
      this.particleMap = new THREE.CanvasTexture(dot);
      this.gatePortals = [];
      this.initAtmosphere();
      this.initStarfield();
      this.initNebulaParticles();
      this.initCosmicPlanet();
      this.initShootingStars();
      this.initGatePortals();

      this.scrollOffset = 0;
      this.animFrameId = null;

      window.addEventListener('resize', () => this.onResize());
      this.animate();
    }

    initAtmosphere() {
      // Precompute seamless haze once; animation only scrolls a texture, not per-pixel noise.
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
      const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,256);
      for(let y=0;y<256;y++)for(let x=0;x<512;x++){
        const u=x/512*Math.PI*2,v=y/255;
        const drift=0.5+0.5*Math.sin(u+Math.sin(v*3));
        const ribbon=Math.exp(-Math.pow((v-0.55-0.15*Math.sin(u))*5,2));
        const value=Math.round(255*(0.18+0.60*ribbon*drift+0.12*(0.5+0.5*Math.sin(u+v*5))));
        const i=(y*512+x)*4;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;
      }
      ctx.putImageData(pixels,0,0);
      const texture=new THREE.CanvasTexture(canvas);texture.wrapS=THREE.RepeatWrapping;
      this.atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms:{sky:{value:texture},uTime:{value:0},uNight:{value:new THREE.Vector3(0.027,0.047,0.105)},uHaze:{value:new THREE.Vector3(0.19,0.11,0.32)}},
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.0,1.0);}',
        fragmentShader:'varying vec2 vUv;uniform sampler2D sky;uniform float uTime;uniform vec3 uNight;uniform vec3 uHaze;void main(){float haze=texture2D(sky,vec2(vUv.x+uTime*0.018,vUv.y)).r;gl_FragColor=vec4(mix(uNight,uHaze,haze),1.0);}',
        depthTest:false,depthWrite:false
      });
      this.atmosphere = new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.atmosphereMaterial);
      this.atmosphere.frustumCulled=false;this.atmosphere.renderOrder=-100;
      this.scene.add(this.atmosphere);
    }

    initStarfield() {
      const isMobile = (window.innerWidth <= 768) || ('ontouchstart' in window);
      const starCount = isMobile ? 450 : 1100;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      const colorChoices = [
        new THREE.Color('#38bdf8'), // cyan
        new THREE.Color('#a78bfa'), // violet
        new THREE.Color('#facc15'), // gold
        new THREE.Color('#ffffff'), // pure white
        new THREE.Color('#818cf8')  // indigo
      ];

      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 3200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

        const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 4.8,
        map: this.particleMap,
        depthWrite: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.92
      });

      this.starPoints = new THREE.Points(geometry, material);
      this.scene.add(this.starPoints);
    }

    initNebulaParticles() {
      // Soft ambient nebula dust particles drifting in deep space
      const isMobile = (window.innerWidth <= 768) || ('ontouchstart' in window);
      const dustCount = isMobile ? 80 : 180;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(dustCount * 3);
      const cols = new Float32Array(dustCount * 3);

      for (let i = 0; i < dustCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2800;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 1200 + 100;
        pos[i * 3 + 2] = -200 + (Math.random() - 0.5) * 400;

        cols[i * 3] = 0.55 + Math.random() * 0.3;     // R
        cols[i * 3 + 1] = 0.35 + Math.random() * 0.3; // G
        cols[i * 3 + 2] = 0.85 + Math.random() * 0.15; // B
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

      const mat = new THREE.PointsMaterial({
        size: 24.0,
        map: this.particleMap,
        depthWrite: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      });
      this.nebulaPoints = new THREE.Points(geo, mat);
      this.scene.add(this.nebulaPoints);
    }

    initCosmicPlanet() {
      const geo = new THREE.SphereGeometry(72, 32, 32);
      const mat = new THREE.MeshPhongMaterial({
        shininess: 8,
        color: 0x7c3aed,
        wireframe: false,
        transparent: true,
        opacity: 0.65
      });
      this.scene.add(new THREE.AmbientLight(0x7888c9, 0.6));
      const sunlight = new THREE.DirectionalLight(0xc2deff, 1.5);
      sunlight.position.set(-300, 500, 400); this.scene.add(sunlight);
      this.planet = new THREE.Mesh(geo, mat);
      // Position high in the cosmic sky to act as a distant celestial moon
      this.planet.position.set(480, 320, -420);
      this.scene.add(this.planet);

      // Planet Ring
      const ringGeo = new THREE.RingGeometry(92, 125, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.38
      });
      this.planetRing = new THREE.Mesh(ringGeo, ringMat);
      this.planetRing.rotation.x = Math.PI / 2.4;
      this.planet.add(this.planetRing);
    }

    initShootingStars() {
      // Lightweight periodic shooting star trail
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array([0, 0, 0, -120, 60, 0]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0,
        linewidth: 2
      });
      this.shootingStar = new THREE.Line(geo, mat);
      this.shootingStar.visible = false;
      this.scene.add(this.shootingStar);

      this.shootingStarActive = false;
      this.shootingStarTimer = 720; // Initial delay
    }

    triggerShootingStar() {
      if (this.shootingStarActive || !this.shootingStar) return;
      this.shootingStarActive = true;
      this.shootingStar.visible = true;
      this.shootingStar.material.opacity = 0.95;

      const startX = (Math.random() - 0.5) * 1200 + 200;
      const startY = 250 + Math.random() * 250;
      const startZ = -100 + Math.random() * 150;
      this.shootingStar.position.set(startX, startY, startZ);

      this.shootingStarSpeedX = -(22 + Math.random() * 12);
      this.shootingStarSpeedY = -(12 + Math.random() * 8);
    }

    initGatePortals() {
      // 3 Portal rings corresponding to gates
      this.portalRings = [];
      for (let i = 0; i < 3; i++) {
        const torusGeo = new THREE.TorusGeometry(48, 4.0, 16, 48);
        const torusMat = new THREE.MeshBasicMaterial({
          color: 0x8b5cf6,
          transparent: true,
          opacity: 0.45
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
        this.starPoints.position.x = -this.scrollOffset * 0.05;
      }
      if (this.nebulaPoints) {
        this.nebulaPoints.position.x = -this.scrollOffset * 0.03;
      }
      if (this.planet) {
        this.planet.position.x = 480 - this.scrollOffset * 0.025;
        this.planet.rotation.y += 0.003;
      }
    }

    setLevelTheme(levelNum) {
      const viewport = document.getElementById('adventure-viewport');
      if (viewport) viewport.dataset.biome = String(levelNum);
      const art=window.CosmicIllustratedScenes[levelNum];
      this.atmosphereMaterial.uniforms.uNight.value.set(...(art?art.palette.night:[0.018,0.060,0.078]));
      this.atmosphereMaterial.uniforms.uHaze.value.set(...(art?art.palette.haze:[0.08,0.30,0.26]));
      this.starPoints.material.opacity=levelNum===1?0.22:levelNum===2?0.35:0.75;
      this.nebulaPoints.material.opacity=levelNum===1?0.025:0.07;
      this.planet.visible=levelNum!==1&&levelNum!==2;this.planetRing.visible=this.planet.visible;
      if (!this.planet || !this.planetRing) return;
      if (levelNum === 4) {
        this.planet.material.color.setHex(0x55c8a0);
        this.planetRing.material.color.setHex(0xe2c582);
        if (this.shootingStar) this.shootingStar.material.color.setHex(0x99f6c6);
      } else if (levelNum === 2) {
        this.planet.material.color.setHex(0xa855f7); // Amethyst Purple
        this.planetRing.material.color.setHex(0x38bdf8); // Cyan Crystal Ring
        if (this.shootingStar) this.shootingStar.material.color.setHex(0xc084fc);
      } else if (levelNum === 3) {
        this.planet.material.color.setHex(0x38bdf8); // Celestial Cyan
        this.planetRing.material.color.setHex(0xfacc15); // Golden Star Ring
        if (this.shootingStar) this.shootingStar.material.color.setHex(0xfde047);
      } else {
        this.planet.material.color.setHex(0x7c3aed); // Cosmic Violet
        this.planetRing.material.color.setHex(0x38bdf8); // Cyan Ring
        if (this.shootingStar) this.shootingStar.material.color.setHex(0x38bdf8);
      }
    }

    triggerGateBurst(gateIndex) {
      if (!this.portalRings[gateIndex]) return;
      const portal = this.portalRings[gateIndex];
      portal.visible = true;
      portal.material.color.setHex(0x10b981); // emerald green
      portal.material.opacity = 0.95;
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
          portal.material.opacity = 0.45;
        }
      };
      expand();
    }

    onResize() {
      if (!this.renderer || !this.camera) return;
      const w = Math.max(10, window.innerWidth);
      const h = Math.max(10, window.innerHeight);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    animate() {
      const now = performance.now();
      this.animFrameId = requestAnimationFrame(() => this.animate());
      // Slow ambient motion needs fewer GPU submissions than gameplay. Phaser retains its own cadence.
      if (document.hidden || !this.canvas.closest('.screen')?.classList.contains('active')) {
        this.lastFrameTime = now;
        return;
      }
      const frameInterval = 1000 / (this.maxFPS || 30);
      if (this.lastFrameTime && now - this.lastFrameTime < frameInterval - 1) return;
      const step = Math.min(3, (now - (this.lastFrameTime || now - 16.67)) / 16.67);
      this.lastFrameTime = now;
      if (this.atmosphereMaterial) this.atmosphereMaterial.uniforms.uTime.value += step / 60;
      if (this.starPoints) {
        this.starPoints.rotation.y += 0.00025 * step;
      }
      if (this.nebulaPoints) {
        this.nebulaPoints.rotation.y -= 0.00015 * step;
      }

      // Shooting star trigger timer & movement
      if (this.shootingStarActive && this.shootingStar) {
        this.shootingStar.position.x += this.shootingStarSpeedX * step;
        this.shootingStar.position.y += this.shootingStarSpeedY * step;
        this.shootingStar.material.opacity -= 0.022 * step;
        if (this.shootingStar.material.opacity <= 0) {
          this.shootingStar.visible = false;
          this.shootingStarActive = false;
          this.shootingStarTimer = 720 + Math.floor(Math.random() * 840); // 12–26 seconds; quiet background accents
        }
      } else if (this.shootingStarTimer !== undefined) {
        this.shootingStarTimer -= step;
        if (this.shootingStarTimer <= 0) {
          this.triggerShootingStar();
        }
      }

      if (this.renderer && this.scene && this.camera) {
        try {
          this.renderer.render(this.scene, this.camera);
        } catch (e) {
          // Handle/ignore WebGL context loss safely without unhandled error
        }
      }
    }

    destroy() {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }

  window.Background3D = Background3D;
  let titleBackgroundInstance = null;
  window.initTitleBackground = function() {
    if (titleBackgroundInstance) return;
    const canvas = document.getElementById('title-three-canvas');
    if (canvas && typeof THREE !== 'undefined') {
      titleBackgroundInstance = new Background3D('title-three-canvas');
    }
  };

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
    arcAcceleration: 360,  // px/s²: energy follows a gentle ballistic arc
    aimRange: 560,
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
      subtitle: "Ancient Steppes & Runic Monoliths",
      levelWidth: 5900,
      questionGateCount: 7,
      diamondGateIndices: [1, 3, 6], // Gates 2, 4, 7 hold the 3 Special Diamonds
      totalBones: 12,
      totalCrystals: 4,
      skyBackdrop: null, // Transparent to allow Three.js cosmic stars & nebula
      skyTint: null,
      distantBackdrop: 'mountains_4',
      distantBackdropTint: 0x6ee7b7, // Soft misty emerald distant peaks
      backdrop: 'mountains',
      backdropTint: null, // Natural lush green mossy crags
      groundBackdrop: 'ground_1',
      groundFloor: 'platform',
      groundFloorTint: null,
      steppingTexture: 'platform',
      themeColor: '#818cf8',
      exitType: 'animated_cave',
      // Pack doorway opens on the right; mirror for approach from the left.
      cave: { flipX: true, scale: 0.70 },
      caveTint: 0x38bdf8,
      exitX: 5700,

      // Handcrafted 7-Section Progression
      // RULE: Trenches must NOT overlap gate locations. Gates sit on solid ground.
      trenches: [
        // The opening grove is a continuous forest clearing. First gap begins in section 2.
        { startX: 1260, endX: 1520 },  // Sec 2→3: Floating stones crossing (230px)
        { startX: 2600, endX: 2880 },  // Sec 4: Broken bridge ravine (280px)
        { startX: 3500, endX: 3780 }   // Sec 5: Falling stone chasm (280px)
      ],

      // Standardized Platforms (Small: 0.22, Medium: 0.40, Large: 0.65)
      platformSpots: [
        // Section 2→3 trench: Floating Stones Crossing (Diamond #1)
        { x: 1340, y: -80, scale: 0.35, tex: 'platform' },
        { x: 1450, y: -100, scale: 0.35, tex: 'platform' },
        // Section 3: Geyser Garden High Path
        { x: 2640, y: -65, scale: 0.22, tex: 'platform' },
        { x: 2840, y: -65, scale: 0.22, tex: 'platform' },
        { x: 1980, y: -230, scale: 0.45, tex: 'platform' },
        { x: 2140, y: -250, scale: 0.40, tex: 'platform' },
        // Section 6: Twilight Grove Upper Branch Route
        { x: 4220, y: -115, scale: 0.35, tex: 'platform' },
        { x: 4380, y: -125, scale: 0.35, tex: 'platform' },
        // Section 7: Celestial Approach Floating Ascents (Diamond #3)
        { x: 4960, y: -110, scale: 0.30, tex: 'platform' },
        { x: 5080, y: -130, scale: 0.35, tex: 'platform' }
      ],

      movingSpots: [
        // Section 4: Broken Bridge Traversal (Diamond #2)
        { x: 2740, y: -80, distanceX: 60, distanceY: 0, duration: 2300, scale: 0.40, tex: 'platform' }
      ],

      collapsingRocks: [
        // Section 5: Falling Stone Run (3 rocks)
        { x: 3580, y: -80, warningMs: 700, fallSpeed: 340, resetMs: 2800 },
        { x: 3660, y: -80, warningMs: 700, fallSpeed: 340, resetMs: 2800 },
        { x: 3730, y: -80, warningMs: 700, fallSpeed: 340, resetMs: 2800 }
      ],

      thorns: [
        // Section 6: Twilight Grove Thicket
        { x: 4300, y: 0, scale: 0.9, damage: 8 }
      ],

      // Handcrafted Scenic Landmarks (1 landmark per section)
      scenery: [
        // Section 1: Grassland Plains Intro
        { type: 'rune_spiral', x: 160, scale: 0.75, depth: 20 },
        { type: 'tree_1', x: 280, scale: 0.58, depth: 20 },
        { type: 'mossy_rock', x: 420, scale: 0.65, depth: 20 },
        { type: 'fence_1', x: 600, scale: 0.45, depth: 20 },
        // Section 2: Floating Stones (Landmark: Spiral Rune Monolith)
        { type: 'rune_spiral', x: 1050, scale: 0.85, depth: 20 },
        { type: 'tree_2', x: 1400, scale: 0.55, depth: 20 },
        { type: 'fence_2', x: 1500, scale: 0.45, depth: 20 },
        // Section 3: Geyser Garden (Landmark: Ancient Rune Pillar)
        { type: 'rune_pillar', x: 1900, scale: 0.85, depth: 20 },
        { type: 'rock_boulder', x: 2050, scale: 0.65, depth: 20 },
        { type: 'rune_arch', x: 2200, scale: 0.85, depth: 15 },
        { type: 'tree_4', x: 2400, scale: 0.55, depth: 20 },
        // Section 4: Broken Bridge (Landmark: Stone Crag Arch)
        { type: 'stone_crag', x: 2520, scale: 0.75, depth: 20 },
        { type: 'trees_cluster', x: 3060, scale: 0.55, depth: 15 },
        // Section 5: Falling Stone Run (Landmark: Mossy Boulder)
        { type: 'mossy_rock', x: 3380, scale: 0.75, depth: 20 },
        { type: 'rune_pillar', x: 3900, scale: 0.8, depth: 20 },
        // Section 6: Twilight Grove (Landmark: Giant Ancient Tree)
        { type: 'tree_1', x: 4060, scale: 0.8, depth: 20 },
        { type: 'trees_cluster', x: 4480, scale: 0.6, depth: 15 },
        { type: 'stone_crag', x: 4580, scale: 0.65, depth: 20 },
        // Section 7: Celestial Approach (Landmark: Grand Monolith & Cave)
        { type: 'rune_spiral', x: 4820, scale: 0.85, depth: 20 },
        { type: 'rune_stone', x: 5560, scale: 0.85, depth: 20 }
      ],

      ambientButterflies: [
        { x: 340, y: -75, dx: 45, dy: -25 },
        { x: 1880, y: -85, dx: 40, dy: -20 },
        { x: 4100, y: -80, dx: 50, dy: -25 }
      ],
      ambientGrass: [180, 320, 520, 1050, 1500, 2400, 3060, 3900, 4580, 5100, 5260],

      boneOffsets: [
        { x: 220, y: -45 },
        { x: 360, y: -45 },
        { x: 540, y: -45 },
        { x: 1340, y: -135 }, // Section 2→3 floating bone
        { x: 1450, y: -155 }, // Section 2→3 upper bone
        { x: 1980, y: -285 }, // Section 3 geyser high route
        { x: 2140, y: -305 }, // Section 3 secret bone
        { x: 2740, y: -140 }, // Section 4 moving platform bone
        { x: 3580, y: -135 }, // Section 5 collapsing stone guide
        { x: 3660, y: -135 },
        { x: 4220, y: -175 }, // Section 6 grove upper route
        { x: 4960, y: -170 }  // Section 7 celestial bone
      ],

      crystalOffsets: [
        { x: 2140, y: -305 }, // Secret vista crystal reward
        { x: 1450, y: -110 },
        { x: 2820, y: -110 },
        { x: 5080, y: -185 }
      ],

      // Gates on SOLID ground, well away from trench edges (≥80px clearance)
      gateLocations: [800, 1660, 2400, 3040, 4000, 4700, 5260],

      enemies: [
        { type: 'ground', x: 430, y: -45, minX: 340, maxX: 490, speed: 70 },
        { type: 'fly', x: 1100, y: -130, minX: 1000, maxX: 1200, speed: 60 },
        { type: 'ground', x: 2100, y: -45, minX: 1950, maxX: 2250, speed: 75 },
        { type: 'fly', x: 2480, y: -140, minX: 2380, maxX: 2560, speed: 65 },
        { type: 'ground', x: 3300, y: -45, minX: 3150, maxX: 3450, speed: 75 },
        { type: 'armored', x: 3850, y: -45, minX: 3820, maxX: 3870, speed: 58 },
        { type: 'fly', x: 4820, y: -140, minX: 4700, maxX: 4940, speed: 70 }
      ],

      hazards: [
        { type: 'geyser', x: 2050, launchVelocity: -640 },
        { type: 'geyser', x: 4080, launchVelocity: -640 }
      ]
    },

    2: {
      id: 2,
      name: "Crystal Caverns",
      subtitle: "Subterranean Amethyst Grotto",
      levelWidth: 6100,
      questionGateCount: 7,
      diamondGateIndices: [1, 3, 6],
      totalBones: 14,
      totalCrystals: 5,
      skyBackdrop: null, // Transparent so deep space stars & nebula show through cavern ceiling
      skyTint: null,
      distantBackdrop: 'mountains_3',
      distantBackdropTint: 0x4c1d95, // Indigo cavern peaks
      backdrop: 'mountains_4',
      backdropTint: 0x6b21a8, // Amethyst purple rock
      groundBackdrop: 'ground_cavern',
      groundFloor: 'platform',
      groundFloorTint: 0x9ba6cb, // Crystal vein floor
      steppingTexture: 'platform',
      themeColor: '#a855f7',
      exitType: 'animated_cave',
      // Pack doorway opens on the right; mirror for approach from the left.
      cave: { flipX: true, scale: 0.70 },
      caveTint: 0xa855f7,
      exitX: 5850,

      // Handcrafted 7-Section Progression
      // RULE: Trenches must NOT overlap gate locations. Gates sit on solid ground.
      trenches: [
        { startX: 550, endX: 660 },    // Sec 1→2: Gentle cavern chasm (110px)
        { startX: 1230, endX: 1520 },  // Sec 2→3: Bubble chamber crossing (240px)
        { startX: 2600, endX: 2860 },  // Sec 4: Collapsing stalactites chasm (260px)
        { startX: 3520, endX: 3800 }   // Sec 5: Deep moving platform trench (280px)
      ],

      platformSpots: [
        // Section 2→3 trench: Bubble Chamber Crystal Slabs (Diamond #1)
        { x: 1320, y: -85, scale: 0.35, tex: 'platform' },
        { x: 1440, y: -105, scale: 0.35, tex: 'platform' },
        // Section 3: Crystal Shaft Secret Ledge
        { x: 2080, y: -240, scale: 0.45, tex: 'platform_stone' },
        // Section 6: Rune Chamber High Shelf
        { x: 4460, y: -150, scale: 0.40, tex: 'platform' },
        // Section 7: Starlight Ascent Slabs (Diamond #3)
        { x: 5020, y: -105, scale: 0.30, tex: 'platform' },
        { x: 5160, y: -130, scale: 0.35, tex: 'platform' }
      ],

      movingSpots: [
        // Section 3: Crystal Shaft Vertical Ascent
        { x: 2020, y: -80, distanceX: 0, distanceY: -145, duration: 2400, scale: 0.38, tex: 'platform' },
        // Section 5: Deep Chasm Horizontal Traverse (Diamond #2)
        { x: 3660, y: -80, distanceX: 60, distanceY: 0, duration: 2400, scale: 0.40, tex: 'platform' }
      ],

      collapsingRocks: [
        // Section 4: Collapsing Stalactite Bridge (3 rocks)
        { x: 2660, y: -80, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 2750, y: -80, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 2830, y: -80, warningMs: 650, fallSpeed: 340, resetMs: 2800 }
      ],

      thorns: [
        // Section 5: Crystal Spike Hazard
        { x: 3880, y: 0, scale: 0.95, damage: 8 }
      ],

      scenery: [
        // Section 1: Cavern Grotto Intro
        { type: 'crystal_cluster', x: 240, scale: 0.9, depth: 20 },
        { type: 'cavern_rock', x: 420, scale: 0.65, depth: 20 },
        { type: 'rune_tablet', x: 620, scale: 0.8, depth: 20 },
        // Section 2: Bubble Chamber (Landmark: Giant Crystal Geode)
        { type: 'crystal_cluster', x: 1050, scale: 1.1, depth: 20 },
        { type: 'stone_crag', x: 1300, scale: 0.65, depth: 20 },
        { type: 'cavern_rock', x: 1480, scale: 0.7, depth: 20 },
        // Section 3: Crystal Shaft (Landmark: Glowing Spire)
        { type: 'stone_crag', x: 1880, scale: 0.8, depth: 20 },
        { type: 'crystal_cluster', x: 2080, scale: 0.95, depth: 15 },
        { type: 'rune_pillar', x: 2300, scale: 0.75, depth: 20 },
        // Section 4: Collapsing Cavern Bridge (Landmark: Crystal Tablet)
        { type: 'rune_tablet', x: 2520, scale: 0.85, depth: 20 },
        { type: 'rock_boulder', x: 2960, scale: 0.65, depth: 20 },
        // Section 5: Deep Chasm (Landmark: Ancient Cavern Pillar)
        { type: 'rune_pillar', x: 3380, scale: 0.85, depth: 20 },
        { type: 'crystal_cluster', x: 3920, scale: 0.95, depth: 20 },
        // Section 6: Rune Chamber (Landmark: Dual Monoliths)
        { type: 'rune_spiral', x: 4150, scale: 0.8, depth: 20 },
        { type: 'rune_tablet', x: 4300, scale: 0.85, depth: 20 },
        { type: 'cavern_rock', x: 4720, scale: 0.8, depth: 20 },
        // Section 7: Starlight Ascent Portal (Landmark: Crystal Obelisk & Cave)
        { type: 'rune_pillar', x: 4900, scale: 0.9, depth: 20 },
        { type: 'crystal_cluster', x: 5700, scale: 1.05, depth: 20 }
      ],

      ambientBubbles: [
        { x: 960, y: -30 },
        { x: 2460, y: -30 },
        { x: 3980, y: -30 }
      ],
      ambientFlies: [
        { x: 1460, y: -110 },
        { x: 3180, y: -100 },
        { x: 4720, y: -110 }
      ],

      boneOffsets: [
        { x: 240, y: -45 },
        { x: 380, y: -45 },
        { x: 510, y: -45 },
        { x: 1320, y: -140 },
        { x: 1440, y: -160 },
        { x: 2020, y: -160 },
        { x: 2080, y: -290 }, // Secret grotto bone
        { x: 2660, y: -135 },
        { x: 2750, y: -135 },
        { x: 3660, y: -140 },
        { x: 4460, y: -210 },
        { x: 5020, y: -160 },
        { x: 5160, y: -185 },
        { x: 5420, y: -45 }
      ],

      crystalOffsets: [
        { x: 2080, y: -290 }, // Secret grotto crystal reward
        { x: 1440, y: -110 },
        { x: 2750, y: -110 },
        { x: 3660, y: -110 },
        { x: 5160, y: -185 }
      ],

      // Gates on SOLID ground, well away from trench edges (≥80px clearance)
      gateLocations: [800, 1660, 2400, 3040, 4080, 4800, 5400],

      enemies: [
        { type: 'ground', x: 380, y: -45, minX: 300, maxX: 440, speed: 75 },
        { type: 'fly', x: 1100, y: -130, minX: 1000, maxX: 1200, speed: 65 },
        { type: 'ground', x: 2180, y: -45, minX: 2100, maxX: 2240, speed: 75 },
        { type: 'armored', x: 2510, y: -45, minX: 2490, maxX: 2550, speed: 58 },
        { type: 'ground', x: 3280, y: -45, minX: 3150, maxX: 3400, speed: 80 },
        { type: 'armored', x: 4600, y: -45, minX: 4520, maxX: 4660, speed: 58 },
        { type: 'fly', x: 4950, y: -140, minX: 4850, maxX: 5100, speed: 75 }
      ],

      hazards: [
        { type: 'geyser', x: 4350, launchVelocity: -650 }
      ]
    },

    3: {
      id: 3,
      name: "Starlight Summit",
      subtitle: "High Celestial Citadel",
      levelWidth: 6200,
      questionGateCount: 7,
      diamondGateIndices: [1, 3, 6],
      totalBones: 15,
      totalCrystals: 5,
      skyBackdrop: null, // Transparent to highlight Three.js starfield, nebulae & shooting stars
      skyTint: null,
      distantBackdrop: 'mountains_4',
      distantBackdropTint: 0x1e1b4b, // Deep space indigo peaks
      backdrop: 'mountains_summit',
      backdropTint: 0x38bdf8, // Luminous sapphire star peaks
      groundBackdrop: 'ground_5',
      groundFloor: 'platform_stone',
      groundFloorTint: 0xb7c2df,
      steppingTexture: 'cloud_platform',
      themeColor: '#38bdf8',
      exitType: 'animated_cave',
      // Pack doorway opens on the right; mirror for approach from the left.
      cave: { flipX: true, scale: 0.70 },
      caveTint: 0xfacc15,
      exitX: 5930,

      // Handcrafted 7-Section Progression
      // RULE: Trenches must NOT overlap gate locations. Gates sit on solid ground.
      trenches: [
        { startX: 530, endX: 680 },    // Sec 1→2: Summit intro gap (110px)
        { startX: 1200, endX: 1540 },  // Sec 2→3: Celestial wind leap (240px)
        { startX: 2600, endX: 2980 },  // Sec 4: Skybridge void (280px)
        { startX: 3550, endX: 3830 }   // Sec 5: Crumbling summit abyss (280px)
      ],

      platformSpots: [
        // Section 2→3 trench: Celestial Wind Leap (Diamond #1)
        { x: 1310, y: -85, scale: 0.35, tex: 'cloud_platform' },
        { x: 1440, y: -100, scale: 0.35, tex: 'cloud_platform' },
        // Section 6: Obelisk Sanctuary High Clouds
        { x: 4520, y: -160, scale: 0.40, tex: 'cloud_platform' },
        { x: 4660, y: -160, scale: 0.40, tex: 'cloud_platform' },
        // Section 7: Gateway to the Cosmos (Diamond #3)
        { x: 5180, y: -110, scale: 0.32, tex: 'cloud_platform' },
        { x: 5320, y: -130, scale: 0.35, tex: 'cloud_platform' }
      ],

      movingSpots: [
        // Section 4: Skybridge Traverse (Diamond #2)
        { x: 2740, y: -80, distanceX: 145, distanceY: 0, duration: 2400, scale: 0.40, tex: 'cloud_platform' }
      ],

      collapsingRocks: [
        // Section 5: Crumbling Summit Ledge (3 rocks)
        { x: 3620, y: -80, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 3710, y: -80, warningMs: 650, fallSpeed: 340, resetMs: 2800 },
        { x: 3790, y: -80, warningMs: 650, fallSpeed: 340, resetMs: 2800 }
      ],

      thorns: [
        // Section 6: Celestial Spikes
        { x: 4420, y: 0, scale: 0.95, damage: 8 }
      ],

      scenery: [
        // Section 1: Summit Base Intro
        { type: 'rune_spiral', x: 180, scale: 0.75, depth: 20 },
        { type: 'rune_pillar', x: 280, scale: 0.6, depth: 20 },
        { type: 'fence_1', x: 600, scale: 0.45, depth: 20 },
        // Section 2: Celestial Wind Leap (Landmark: Celestial Obelisk)
        { type: 'rune_pillar', x: 1050, scale: 0.85, depth: 20 },
        { type: 'rune_tablet', x: 1500, scale: 0.55, depth: 20 },
        // Section 3: Floating Ruins (Landmark: Ancient Summit Arch)
        { type: 'stone_crag', x: 1920, scale: 0.8, depth: 20 },
        { type: 'mountains_summit', x: 2400, scale: 0.55, depth: 15 },
        // Section 4: Skybridge Traverse (Landmark: Celestial Spiral Monolith)
        { type: 'rune_spiral', x: 2520, scale: 0.85, depth: 20 },
        { type: 'fence_2', x: 3100, scale: 0.45, depth: 20 },
        // Section 5: Crumbling Summit Ledge (Landmark: Summit Peak Boulder)
        { type: 'rock_boulder', x: 3420, scale: 0.75, depth: 20 },
        { type: 'rune_arch', x: 3940, scale: 0.6, depth: 20 },
        // Section 6: Obelisk Sanctuary (Landmark: Twin Monoliths)
        { type: 'rune_tablet', x: 4200, scale: 0.85, depth: 20 },
        { type: 'rune_pillar', x: 4350, scale: 0.85, depth: 20 },
        { type: 'mountains_summit', x: 4820, scale: 0.55, depth: 15 },
        // Section 7: Gateway to the Cosmos (Landmark: Grand Celestial Gateway)
        { type: 'rune_spiral', x: 5050, scale: 0.9, depth: 20 },
        { type: 'rune_stone', x: 5780, scale: 0.85, depth: 20 }
      ],

      ambientGrass: [200, 1050, 2400, 3960, 4800, 5860],

      boneOffsets: [
        { x: 240, y: -45 },
        { x: 380, y: -45 },
        { x: 470, y: -45 },
        { x: 1310, y: -140 },
        { x: 1440, y: -160 },
        { x: 2740, y: -145 },
        { x: 3620, y: -135 },
        { x: 3710, y: -135 },
        { x: 3790, y: -135 },
        { x: 4520, y: -220 },
        { x: 4660, y: -220 },
        { x: 5180, y: -170 },
        { x: 5320, y: -190 },
        { x: 5780, y: -45 },
        { x: 2300, y: -130 }
      ],

      crystalOffsets: [
        { x: 1310, y: -140 },
        { x: 2740, y: -145 },
        { x: 4660, y: -220 },
        { x: 5320, y: -190 },
        { x: 5780, y: -45 }
      ],

      // Gates on SOLID ground, well away from trench edges (≥80px clearance)
      gateLocations: [800, 1740, 2470, 3150, 4080, 4860, 5490],

      enemies: [
        { type: 'ground', x: 380, y: -45, minX: 300, maxX: 440, speed: 75 },
        { type: 'fly', x: 1100, y: -130, minX: 1000, maxX: 1200, speed: 65 },
        { type: 'ground', x: 2180, y: -45, minX: 2100, maxX: 2240, speed: 75 },
        { type: 'fly', x: 2480, y: -140, minX: 2380, maxX: 2560, speed: 70 },
        { type: 'ground', x: 3300, y: -45, minX: 3160, maxX: 3400, speed: 80 },
        { type: 'armored', x: 4320, y: -45, minX: 4240, maxX: 4390, speed: 60 },
        { type: 'fly', x: 4950, y: -140, minX: 4850, maxX: 5100, speed: 75 }
      ],

      hazards: [
        { type: 'geyser', x: 2100, launchVelocity: -650 },
        { type: 'geyser', x: 4380, launchVelocity: -660 },
        { type: 'wind', minX: 1150, maxX: 1570, forceX: 80 },
        { type: 'meteor', x: 2300, y: -90, minX: 2150, maxX: 2420, speed: 55 }
      ]
    },
    4: {
      id: 4, name: 'Moonmoss Sanctuary', subtitle: 'The Living Celestial Grove',
      levelWidth: 6500, questionGateCount: 7, diamondGateIndices: [1, 3, 6],
      totalBones: 15, totalCrystals: 5, skyBackdrop: null,
      distantBackdrop: 'moss_ridge', backdrop: 'moss_hill', groundFloor: 'platform',
      groundBackdrop: 'ground_1', steppingTexture: 'moss_platform',
      themeColor: '#8de5b2', caveTint: 0x75edbf, exitType: 'animated_cave',
      cave: {flipX: true, scale: 0.70}, exitX: 6180,
      trenches: [{startX: 560, endX: 690}, {startX: 1270, endX: 1550},
        {startX: 2680, endX: 3020}, {startX: 3580, endX: 3890}],
      gateLocations: [830, 1750, 2450, 3210, 4150, 4910, 5640],
      platformSpots: [
        {x: 1350, y: -80, scale: 0.35}, {x: 1480, y: -115, scale: 0.35},
        {x: 2080, y: -205, scale: 0.35}, {x: 2250, y: -250, scale: 0.35},
        {x: 2710, y: -60, scale: 0.22}, {x: 2990, y: -60, scale: 0.22},
        {x: 4500, y: -150, scale: 0.35}, {x: 4650, y: -185, scale: 0.35},
        {x: 5260, y: -105, scale: 0.35}, {x: 5430, y: -140, scale: 0.35}],
      movingSpots: [{x: 1960, y: -85, distanceY: -115, duration: 2500, scale: 0.35},
        {x: 2820, y: -85, distanceX: 100, duration: 2500, scale: 0.35}],
      collapsingRocks: [{x: 3650, y: -75, warningMs: 750, tex: 'moss_platform', scale: 0.25},
        {x: 3750, y: -90, warningMs: 750, tex: 'moss_platform', scale: 0.25},
        {x: 3840, y: -75, warningMs: 750, tex: 'moss_platform', scale: 0.25}],
      thorns: [{x: 4430, y: 0, scale: 0.8, damage: 8}],
      scenery: [{type: 'moss_rock', x: 420, scale: 0.8}, {type: 'moss_monolith', x: 1100, scale: 0.9},
        {type: 'moss_rock', x: 2380, scale: 0.8}, {type: 'moss_monolith', x: 3400, scale: 0.9},
        {type: 'moss_rock', x: 4070, scale: 0.7}, {type: 'moss_monolith', x: 5060, scale: 0.85},
        {type: 'moss_rock', x: 5920, scale: 0.8}],
      plants: [{x: 240, type: 'moss_flower'}, {x: 460, type: 'moss_grass'},
        {x: 1070, type: 'moss_fern'}, {x: 1920, type: 'moss_flower'},
        {x: 2320, type: 'moss_grass'}, {x: 2540, type: 'moss_fern'},
        {x: 3410, type: 'moss_flower'}, {x: 4050, type: 'moss_fern'},
        {x: 4720, type: 'moss_grass'}, {x: 5170, type: 'moss_flower'},
        {x: 5990, type: 'moss_fern'}],
      ambientGrass: [],
      boneOffsets: [{x: 220,y:-45},{x:420,y:-45},{x:750,y:-45},
        {x:1350,y:-140},{x:1480,y:-175},{x:2080,y:-235},{x:2250,y:-305},
        {x:2710,y:-120},{x:3650,y:-135},{x:3750,y:-145},
        {x:4500,y:-210},{x:4650,y:-245},{x:5260,y:-165},{x:5430,y:-200},{x:6050,y:-45}],
      crystalOffsets: [{x:1480,y:-175},{x:2250,y:-305},{x:2850,y:-145},{x:4650,y:-245},{x:5430,y:-200}],
      enemies: [
        {type:'ground',sprite:'moss_slime_green',x:370,y:-45,minX:300,maxX:450,speed:65},
        {type:'ground',sprite:'moss_slime_green',x:1110,y:-45,minX:1010,maxX:1170,speed:60},
        {type:'ground',sprite:'moss_slime_green',x:2280,y:-45,minX:2200,maxX:2330,speed:65},
        {type:'armored',sprite:'moss_slime_orange',x:2540,y:-45,minX:2520,maxX:2580,speed:50},
        {type:'ground',sprite:'moss_slime_green',x:3440,y:-45,minX:3380,maxX:3490,speed:65},
        {type:'armored',sprite:'moss_slime_orange',x:4360,y:-45,minX:4270,maxX:4400,speed:50},
        {type:'ground',sprite:'moss_slime_green',x:5190,y:-45,minX:5100,maxX:5290,speed:65}],
      hazards: [{type:'geyser',x:2150,launchVelocity:-650},{type:'wind',minX:4460,maxX:4690,forceX:65}]
    }
  };

  const LEVEL_SECTIONS = {
    1: [
      ['Grassland Intro', 'tree_1', 280, 'Short first trench', 'Low bone trail'],
      ['Floating Stones', 'rune_spiral', 1120, 'Two stepping stones', 'Crossing bones / diamond 1'],
      ['Geyser Garden', 'rune_pillar', 2190, 'Geyser upper route', 'Two upper bones'],
      ['Broken Bridge', 'stone_crag', 2550, 'Moving bridge and two rests', 'Bridge bone / diamond 2'],
      ['Falling Stone Run', 'mossy_rock', 3430, 'Three generous collapsing rests', 'Stone bone trail'],
      ['Twilight Grove', 'tree_1', 4150, 'Thorn bypass and upper branches', 'Optional high bones'],
      ['Celestial Approach', 'rune_spiral', 5050, 'Floating ascent', 'Upper bones / diamond 3']
    ],
    2: [
      ['Cave Entrance', 'cavern_rock', 340, 'Short entrance fissure', 'Entrance bone trail'],
      ['Bubble Chamber', 'crystal_cluster', 1120, 'Crystal stepping slabs', 'Slab bones / diamond 1'],
      ['Crystal Shaft', 'rune_pillar', 2240, 'Vertical elevator to high shelf', 'Shaft bone and crystal'],
      ['Collapsing Cavern Bridge', 'rune_tablet', 2520, 'Three collapsing stones', 'Bridge bones / diamond 2'],
      ['Deep Moving-platform Trench', 'crystal_cluster', 3880, 'Moving slab and safe landing', 'Floating trench bone'],
      ['Rune Chamber', 'rune_spiral', 4300, 'Geyser and high ledge', 'Upper chamber bone'],
      ['Crystal Exit Portal', 'crystal_cluster', 5740, 'Final ledges and portal', 'Ledge bones / diamond 3']
    ],
    3: [
      ['Summit Intro', 'rune_pillar', 300, 'First sky fissure', 'Low bone trail'],
      ['Celestial Wind Leap', 'rune_pillar', 1060, 'Wind-assisted stones', 'Sky bones / diamond 1'],
      ['Floating Ruins', 'rune_arch', 2320, 'Geyser and meteor passage', 'Optional ruins bone'],
      ['Skybridge Traverse', 'rune_spiral', 2530, 'Long moving rock bridge', 'Bridge bone / diamond 2'],
      ['Crumbling Summit', 'rock_boulder', 3430, 'Three collapsing rocks', 'Optional abyss bones'],
      ['Obelisk Sanctuary', 'rune_tablet', 4470, 'High double-jump route', 'Two high cloud bones'],
      ['Gateway to the Cosmos', 'rune_spiral', 5730, 'Final floating approach', 'Ascent bones / diamond 3']
    ],
    4: [
      ['Wizard Clearing', 'moss_monolith', 310, 'First moss fissure', 'Low flower trail'],
      ['Hanging Canopy', 'moss_column', 1120, 'Leaf stepping platforms', 'Canopy bones / diamond 1'],
      ['Springflower Rise', 'moss_flower', 2170, 'Flower geyser and vertical lift', 'Two high bones'],
      ['Living Moss Bridge', 'moss_monolith', 2570, 'Moving leaf bridge with static rests', 'Bridge bone / diamond 2'],
      ['Slime Garden', 'moss_rock', 3410, 'Three collapsing moss stones', 'Stone bone trail'],
      ['Windfern Grove', 'moss_column', 4600, 'Wind-assisted upper route', 'High fern bones'],
      ['Sanctuary Heart', 'moss_monolith', 6000, 'Final canopy ascent', 'Upper bones / diamond 3']
    ]
  };
  LEVEL_CONFIGS[1].platformSpots = [
    {x:1340,y:-80,scale:0.22},{x:1450,y:-100,scale:0.22},
    {x:2060,y:-230,scale:0.65},{x:2640,y:-65,scale:0.22},{x:2840,y:-65,scale:0.22},
    {x:4300,y:-125,scale:0.65},{x:5020,y:-115,scale:0.35}
  ];
  LEVEL_CONFIGS[2].platformSpots = [
    {x:1320,y:-85,scale:0.22},{x:1440,y:-105,scale:0.22},
    {x:1900,y:-115,scale:0.22},{x:2080,y:-240,scale:0.35},
    {x:4460,y:-150,scale:0.35},{x:5100,y:-130,scale:0.65}
  ];
  LEVEL_CONFIGS[3].platformSpots = [
    {x:1310,y:-85,scale:0.22},{x:1440,y:-100,scale:0.22},
    {x:4590,y:-160,scale:0.65},{x:5250,y:-125,scale:0.65}
  ];
  LEVEL_CONFIGS[3].movingSpots.push({x:4350,y:-85,distanceY:-80,duration:2700,scale:0.35});
  LEVEL_CONFIGS[3].hazards.find(h=>h.type==='wind').minX=1850;
  LEVEL_CONFIGS[3].hazards.find(h=>h.type==='wind').maxX=2230;
  LEVEL_CONFIGS[3].hazards.push({type:'wind',minX:4300,maxX:4700,forceX:55});
  LEVEL_CONFIGS[1].enemies[1] = {...LEVEL_CONFIGS[1].enemies[1],x:1990,minX:1840,maxX:2160};
  [1,2,3].forEach(id=>{
    const cfg=LEVEL_CONFIGS[id],art=window.CosmicIllustratedScenes[id];
    cfg.scenery=[];cfg.cave.scale=0.85;
    LEVEL_SECTIONS[id].forEach((section,i)=>{
      section[0]=art.sections[i].name;section[1]=art.sections[i].landmark[0];section[2]=art.sections[i].landmark[1];
    });
  });
  Object.values(LEVEL_CONFIGS).forEach(cfg => {
    cfg.sections = LEVEL_SECTIONS[cfg.id].map((section, index) => ({
      name: section[0], landmark: section[1], landmarkX: section[2],
      traversal: section[3], collectibleRoute: section[4],
      startX: index ? cfg.gateLocations[index - 1] : 0,
      gateX: cfg.gateLocations[index], recoveryX: cfg.gateLocations[index] - 90
    }));
  });

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
    bestStreak: 0,
    correctQuestions: 0,
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
      clearInterval(this.gateTimerInterval);
      clearInterval(this.capsuleCountdownInterval);
      clearTimeout(this.autoAdvanceTimeout);
      const gateModal = document.getElementById('adv-gate-modal');
      if (gateModal) gateModal.style.display = 'none';
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
      this.bestStreak = 0;
      this.correctQuestions = 0;
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
      const streakBadge = document.getElementById('adv-streak-badge');

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

      // Minimal Corner HUD streak badge
      if (streakBadge) {
        if (this.streak >= 2) {
          streakBadge.style.display = 'inline-flex';
          streakBadge.textContent = `🔥 Streak x${this.streak}`;
        } else {
          streakBadge.style.display = 'none';
        }
      }
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
      const v = '?v=3';
      const p = 'assets/adventure/';
      ['ancient_tree','fork_tree','root_tree','arch_tree','distant_grove','rock_stack','rock_shelf','rock_spire','rock_peak','rock_low','rock_cairn','rock_upright','earth_a','earth_b'].forEach(key=>this.load.image(key,p+'illustrated/'+key+'.png'+v));
      this.load.image('moss_platform', p + 'mossy/moss_platform.png' + v);
      this.load.image('moss_hill', p + 'mossy/moss_hill.png' + v);
      this.load.image('moss_ridge', p + 'mossy/moss_ridge.png' + v);
      this.load.image('moss_column', p + 'mossy/moss_column.png' + v);
      this.load.image('moss_hanging', p + 'mossy/moss_hanging.png' + v);
      this.load.image('moss_rock', p + 'mossy/moss_rock.png' + v);
      this.load.image('moss_monolith', p + 'mossy/moss_monolith.png' + v);
      this.load.image('moss_surface', p + 'mossy/moss_surface.png' + v);
      this.load.spritesheet('moss_flower', p + 'mossy/moss_flower.png' + v, {frameWidth:128,frameHeight:160});
      this.load.spritesheet('moss_grass', p + 'mossy/moss_grass.png' + v, {frameWidth:128,frameHeight:128});
      this.load.spritesheet('moss_fern', p + 'mossy/moss_fern.png' + v, {frameWidth:128,frameHeight:128});
      this.load.spritesheet('moss_spring', p + 'mossy/moss_spring.png' + v, {frameWidth:96,frameHeight:80});
      this.load.spritesheet('moss_slime_green', p + 'mossy/moss_slime_green.png' + v, {frameWidth:96,frameHeight:72});
      this.load.spritesheet('moss_slime_orange', p + 'mossy/moss_slime_orange.png' + v, {frameWidth:96,frameHeight:72});
      this.load.spritesheet('moss_wizard_idle', p + 'mossy/moss_wizard_idle.png' + v, {frameWidth:96,frameHeight:128});
      this.load.spritesheet('moss_wizard_walk', p + 'mossy/moss_wizard_walk.png' + v, {frameWidth:96,frameHeight:128});
      // Dog Animation Spritesheets (171x128 per frame)
      this.load.spritesheet('dog_idle', p + 'dog_idle.png' + v, { frameWidth: 171, frameHeight: 128 });
      this.load.spritesheet('dog_walk', p + 'dog_walk.png' + v, { frameWidth: 171, frameHeight: 128 });
      this.load.spritesheet('dog_sniff', p + 'dog_sniff.png' + v, { frameWidth: 171, frameHeight: 128 });
      this.load.spritesheet('dog_bone', p + 'dog_bone.png' + v, { frameWidth: 171, frameHeight: 128 });

      // Animated Cave Portal (360x470 per frame for large grand entrance)
      this.load.spritesheet('cave_anim', p + 'cave_anim.png' + v, { frameWidth: 360, frameHeight: 470 });

      // Animated Environmental Spritesheets (from 2D Stylized Adventure Game Asset Pack)
      this.load.spritesheet('butterfly_anim', p + 'butterfly_anim.png' + v, { frameWidth: 75, frameHeight: 45 });
      this.load.spritesheet('grass_anim', p + 'grass_anim.png' + v, { frameWidth: 100, frameHeight: 73 });
      this.load.spritesheet('bubble_anim', p + 'bubble_anim.png' + v, { frameWidth: 32, frameHeight: 113 });
      this.load.spritesheet('flies_anim', p + 'flies_anim.png' + v, { frameWidth: 60, frameHeight: 60 });

      // Environment Atmosphere & Biomes
      this.load.image('sky_backdrop', p + 'sky_backdrop.jpg' + v);
      this.load.image('ground_1', p + 'ground_1.png' + v);
      this.load.image('ground_cavern', p + 'ground_cavern.png' + v);
      this.load.image('ground_3', p + 'ground_3.png' + v);
      this.load.image('ground_4', p + 'ground_4.png' + v);
      this.load.image('ground_5', p + 'ground_5.png' + v);
      this.load.image('platform', p + 'platform.png' + v);
      this.load.image('cloud_platform', p + 'cloud_platform.png' + v);
      this.load.image('platform_stone', p + 'platform_stone.png' + v);
      this.load.image('tree_1', p + 'tree_1.png' + v);
      this.load.image('tree_2', p + 'tree_2.png' + v);
      this.load.image('tree_3', p + 'tree_3.png' + v);
      this.load.image('tree_4', p + 'tree_4.png' + v);
      this.load.image('trees_cluster', p + 'trees_cluster.png' + v);
      this.load.image('rock_1', p + 'rock_1.png' + v);
      this.load.image('collapsing_rock', p + 'collapsing_rock.png' + v);
      this.load.image('rock_boulder', p + 'rock_boulder.png' + v);
      this.load.image('stone_1', p + 'stone_1.png' + v);
      this.load.image('stepping_stone', p + 'stepping_stone.png' + v);
      this.load.image('stone_crag', p + 'stone_crag.png' + v);
      this.load.image('mossy_rock', p + 'mossy_rock.png' + v);
      this.load.image('cavern_rock', p + 'cavern_rock.png' + v);
      this.load.image('mountains', p + 'mountains.png' + v);
      this.load.image('mountains_summit', p + 'mountains_summit.png' + v);
      this.load.image('mountains_3', p + 'mountains_3.png' + v);
      this.load.image('mountains_4', p + 'mountains_4.png' + v);
      this.load.image('cloud', p + 'cloud.png' + v);
      this.load.image('fence_1', p + 'fence_1.png' + v);
      this.load.image('fence_2', p + 'fence_2.png' + v);
      this.load.image('gate_door', p + 'gate_door.png' + v);
      this.load.image('gate_barrier', p + 'gate_barrier.png' + v);
      this.load.image('bone', p + 'bone.png' + v);
      this.load.image('crystal', p + 'crystal.png' + v);
      this.load.image('crystal_cluster', p + 'crystal_cluster.png' + v);
      this.load.image('special_diamond', p + 'special_diamond.png' + v);
      this.load.image('rune_stone', p + 'rune_stone.png' + v);
      this.load.image('rune_tablet', p + 'rune_tablet.png' + v);
      this.load.image('rune_pillar', p + 'rune_pillar.png' + v);
      this.load.image('rune_arch', p + 'rune_arch.png' + v);
      this.load.image('rune_spiral', p + 'rune_spiral.png' + v);
    }

    create() {
      ['moss_flower','moss_grass','moss_fern','moss_spring','moss_slime_green','moss_slime_orange','moss_wizard_idle','moss_wizard_walk'].forEach(key => {
        this.anims.create({key: key + '-loop', frames: this.anims.generateFrameNumbers(key,{start:0,end:15}), frameRate:12, repeat:-1});
      });
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

      // Register Cave Portal Glow Animation (with safety check)
      if (this.textures.exists('cave_anim')) {
        const caveTex = this.textures.get('cave_anim');
        const total = (caveTex && caveTex.frameTotal) ? caveTex.frameTotal : 0;
        if (total > 1) {
          this.anims.create({
            key: 'cave-glow',
            frames: this.anims.generateFrameNumbers('cave_anim', { start: 0, end: Math.min(15, total - 1) }),
            frameRate: 8,
            repeat: -1
          });
        }
      }

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

      // 2. Cute Cosmo Drone / Astro-Orb (66x60 - LARGE and bright for visibility)
      if (!this.textures.exists('enemy_fly')) {
        const canvas = document.createElement('canvas');
        canvas.width = 66;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');

        // Outer glow aura ring for visibility
        ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
        ctx.beginPath();
        ctx.arc(33, 27, 26, 0, Math.PI * 2);
        ctx.fill();

        // Spherical Saucer Hull (larger)
        const grad = ctx.createRadialGradient(33, 27, 4, 33, 27, 22);
        grad.addColorStop(0, '#e9d5ff');
        grad.addColorStop(0.4, '#c084fc');
        grad.addColorStop(0.8, '#7e22ce');
        grad.addColorStop(1, '#3b0764');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(33, 27, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f3e8ff';
        ctx.stroke();

        // Stabilizer Fins (larger)
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(13, 27); ctx.lineTo(2, 20); ctx.lineTo(10, 34); ctx.closePath();
        ctx.moveTo(53, 27); ctx.lineTo(64, 20); ctx.lineTo(56, 34); ctx.closePath();
        ctx.fill();

        // Scanning Visor Eye (larger, brighter)
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(33, 27, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(30, 25, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Plasma Thruster Flame (larger)
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(25, 46);
        ctx.lineTo(33, 58);
        ctx.lineTo(41, 46);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

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

      this.visualTexture = config.sprite || null;
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

      this.setDepth(60);
      if (this.enemyType === 'armored') {
        this.body.setCollideWorldBounds(true);
        this.body.setSize(44, 30);
        this.body.setOffset(5, 5);
        this.setVelocityX(this.speed * this.direction);
      } else if (this.enemyType === 'ground') {
        this.body.setCollideWorldBounds(true);
        this.body.setSize(38, 28);
        this.body.setOffset(5, 6);
        this.setScale(1.3);
        this.setVelocityX(this.speed * this.direction);
      } else {
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(50, 44);
        this.body.setOffset(8, 8);
        this.setScale(1.8); // Large and visible against dark sky
        this.setVelocityX(this.speed * this.direction);
      }
      this.baseScale = this.visualTexture ? 1.35 : this.enemyType === 'fly' ? 2.2 : this.enemyType === 'armored' ? 1.65 : 1.8;
      this.setScale(this.baseScale);
      if (this.visualTexture) {
        this.setScale(this.baseScale); this.body.setSize(68, 40).setOffset(14, 26);
        this.play(this.visualTexture + '-loop');
      }
    }

    updateArmorVisualState() {
      if (this.enemyType !== 'armored' || this.isDefeated) return;
      if (this.visualTexture) { this.setAlpha(this.hp === 1 ? 0.8 : 1); return; }
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
        if (!this.visualTexture) this.setScale(this.baseScale * (1 + Math.sin(time * 0.01) * 0.04), this.baseScale * (1 - Math.sin(time * 0.01) * 0.04));
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

      this.setDepth(80);
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

    fire(x, y, direction, isSuper = false, target = null) {
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
      this.body.setAllowGravity(false);
      this.setAcceleration(0, PROJECTILE_CONFIG.arcAcceleration);
      let verticalSpeed = -95;
      if (target) {
        // Lead the target, then solve the launch velocity for its body centre.
        const relativeSpeed = PROJECTILE_CONFIG.speed - direction * target.body.velocity.x;
        const flightTime = Math.max(0.06, Math.abs(target.body.center.x-x)/Math.max(100,relativeSpeed));
        verticalSpeed = (target.body.center.y-y)/flightTime - 0.5*PROJECTILE_CONFIG.arcAcceleration*flightTime;
      }
      this.setVelocityY(Phaser.Math.Clamp(verticalSpeed,-420,420));
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
        allowGravity: false,
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
      const children = this.group?.children ? this.group.getChildren() : [];
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
      this.base = scene.levelConfig?.id === 4 ? scene.add.sprite(x,groundY,'moss_spring').play('moss_spring-loop') : scene.add.image(x,groundY,'geyser_base');
      this.base.setOrigin(0.5,1).setDepth(35);

      // Plume sprite with arcade physics body
      this.plume = scene.physics.add.sprite(x, groundY - 4, 'geyser_plume');
      this.plume.setOrigin(0.5, 1.0);
      this.plume.setDepth(80);
      this.plume.body.setAllowGravity(false);
      this.plume.body.setImmovable(true);
      this.plume.body.moves = false;
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

      this.setDepth(80);
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
          .setDepth(20);
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

      this.setDepth(30);
      this.setScale(config.scale || 0.48);
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
      this.setDepth(35);
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
      this.events.once('shutdown', this.shutdown, this);
      AdventureState.reset(AdventureState.currentLevel);

      const cfg = LEVEL_CONFIGS[AdventureState.currentLevel] || LEVEL_CONFIGS[1];
      const screenWidth = this.scale.width || window.innerWidth;
      const screenHeight = this.scale.height || window.innerHeight;

      const levelWidth = cfg.levelWidth || 3200;
      const levelHeight = 760;

      // World bounds: open bottom so falling into pits/trenches triggers death, not world bounce
      this.physics.world.setBounds(0, -200, levelWidth, levelHeight + 600);
      this.physics.world.checkCollision.down = false; // pits fall freely

      const groundY = levelHeight - 85;
      this.groundY = groundY;
      AdventureState.checkpointX = 140;
      AdventureState.checkpointY = groundY - 80; // spawn well above ground to prevent overlap

      // Transparent pack silhouettes above the full-viewport CSS / Three.js atmosphere.
      this.createLandscape(cfg, groundY);

      // 2. Continuous Terrain & Believable Cliff Edges (Depth 28-32)
      this.platforms = this.physics.add.staticGroup();

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

      const terrain = cfg.id === 4 ? this.terrainTextures(cfg.id) : null;
      solidSegments.forEach(seg => {
        const width=seg.endX-seg.startX;
        const floor=this.platforms.create(seg.startX+width/2,groundY+30,'platform');
        floor.setDisplaySize(width,60).setVisible(false).refreshBody();
        if(cfg.id<=3){
          this.createPaintedGround(cfg,seg,groundY);
        }else{
        // A continuous material face meets the collision line exactly; no floating caps.
        this.add.tileSprite(seg.startX,groundY,width,650,terrain.face).setOrigin(0,0).setDepth(28);
        this.add.tileSprite(seg.startX,groundY,width,40,terrain.surface).setOrigin(0,0).setDepth(30);
        const edge=this.add.graphics().setDepth(29);
        edge.fillStyle(0x080f1a,0.30);
        edge.fillRect(seg.startX,groundY+24,8,626);edge.fillRect(seg.endX-8,groundY+24,8,626);
        }
      });

      // 3. Handcrafted Scenic Landmarks (Depth 20)
      if (cfg.scenery && cfg.scenery.length > 0) {
        cfg.scenery.forEach(s => {
          if (cfg.trenches.some(t => s.x > t.startX - 30 && s.x < t.endX + 30)) return;
          if (cfg.sections.some(section => section.landmark === s.type && Math.abs(section.landmarkX - s.x) < 180)) return;
          this.add.image(s.x, groundY, s.type)
            .setOrigin(0.5, 1.0)
            .setScale(s.scale || 0.65)
            .setScrollFactor(1.0)
            .setDepth(s.depth || 20);
        });
      }

      // 4. Standardized Stepping Platforms (Depth 30)
      const stepTex = cfg.steppingTexture || 'platform';
      if (cfg.platformSpots && cfg.platformSpots.length > 0) {
        cfg.platformSpots.forEach(p => {
          const tex = this.platformTexture(cfg.id, p.scale);
          const pScale = 1;
          const plat = this.platforms.create(p.x, groundY + p.y, tex)
            .setScale(pScale)
            .setDepth(30)
            .refreshBody();
          plat.body.setSize(plat.width, 18).setOffset(0, 0);
          plat.body.checkCollision.left = plat.body.checkCollision.right = false;
          plat.body.checkCollision.down = false; // Smooth jump through without head bumps
          if (cfg.groundFloorTint && tex === 'platform') plat.setTint(cfg.groundFloorTint);
        });
      }

      // Moving Platforms (Depth 30)
      this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
      this.ridingPlatform = null;
      if (cfg.movingSpots && cfg.movingSpots.length > 0) {
        cfg.movingSpots.forEach(m => {
          const tex = this.platformTexture(cfg.id, m.scale);
          const mScale = 1;
          const mp = this.movingPlatforms.create(m.x, groundY + m.y, tex);
          mp.setScale(mScale);
          mp.setDepth(30);
          mp.body.setSize(mp.width, 18).setOffset(0, 0);
          mp.body.checkCollision.left = mp.body.checkCollision.right = false;
          mp.body.setImmovable(true);
          mp.body.checkCollision.down = false;
          if (cfg.groundFloorTint && tex === 'platform') mp.setTint(cfg.groundFloorTint);

          const tweenCfg = {
            targets: mp,
            duration: m.duration || 2600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          };
          if (m.distanceX) tweenCfg.x = m.x + m.distanceX;
          if (m.distanceY) tweenCfg.y = (groundY + m.y) + m.distanceY;
          this.tweens.add(tweenCfg);
        });
      }

      // Collapsing Rocks (Depth 30)
      if (cfg.collapsingRocks && cfg.collapsingRocks.length > 0) {
        this.collapsingRocks = this.physics.add.group({ allowGravity: false, immovable: true });
        cfg.collapsingRocks.forEach(cr => {
          const rock = new CollapsingRock(this, cr.x, groundY + cr.y, {...cr, tex:this.platformTexture(cfg.id,0.22), scale:1});
          this.collapsingRocks.add(rock);
        });
      }

      // Thorns & Hazards (Depth 35)
      if (cfg.thorns && cfg.thorns.length > 0) {
        this.thorns = this.physics.add.staticGroup();
        cfg.thorns.forEach(th => {
          const thorn = new ThornPatch(this, th.x, groundY + th.y, th);
          this.thorns.add(thorn);
        });
      }

      // Ambient Animated Pack Sprites (Butterflies, Grass, Bubbles, Flies)
      if (cfg.ambientButterflies && cfg.ambientButterflies.length > 0) {
        cfg.ambientButterflies.forEach(b => {
          const bf = this.add.sprite(b.x, groundY + b.y, 'butterfly_anim').setDepth(35).setScale(0.85);
          bf.play('butterfly-flutter');
          this.tweens.add({
            targets: bf,
            x: b.x + (b.dx || 50),
            y: groundY + b.y + (b.dy || -20),
            duration: b.duration || 2200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        });
      }

      if (cfg.id === 4 && cfg.ambientGrass && cfg.ambientGrass.length > 0) {
        cfg.ambientGrass.forEach(gx => {
          const gr = this.add.sprite(gx, groundY, 'grass_anim').setOrigin(0.5, 1.0).setDepth(35).setScale(0.65);
          gr.play('grass-sway');
        });
      }

      if (cfg.ambientBubbles && cfg.ambientBubbles.length > 0) {
        cfg.ambientBubbles.forEach(bb => {
          const bubble = this.add.sprite(bb.x, groundY + bb.y, 'bubble_anim').setOrigin(0.5, 1.0).setDepth(35).setScale(0.85);
          bubble.play('bubble-rise');
        });
      }

      if (cfg.ambientFlies && cfg.ambientFlies.length > 0) {
        cfg.ambientFlies.forEach(fl => {
          const fly = this.add.sprite(fl.x, groundY + fl.y, 'flies_anim').setDepth(35).setScale(0.7);
          fly.play('fly-buzz');
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

      // 5. Dog Player (Depth 70)
      this.dog = this.physics.add.sprite(AdventureState.checkpointX, AdventureState.checkpointY, 'dog_idle');
      this.dog.setScale(0.85);
      this.dog.setDepth(70);
      this.dog.body.setSize(72, 64);
      this.dog.body.setOffset(50, 57); // Paw baseline is frame row 121.
      this.dog.setCollideWorldBounds(false); // world bottom is open for pit falls
      this.dog.body.setMaxVelocityY(900);
      this.dog.setBounce(0.0);
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
      this.lastGroundedTime = 0;
      this.isWallSliding = false;
      this.isBarkShockwaveActive = false;

      // 6. Collectibles (Depth 50)
      this.bonesGroup = this.physics.add.group({ allowGravity: false });
      if (cfg.boneOffsets && cfg.boneOffsets.length > 0) {
        cfg.boneOffsets.forEach(bp => {
          const b = this.bonesGroup.create(bp.x, groundY + bp.y, 'bone').setScale(1.1);
          b.setDepth(50);
          b.initialY = groundY + bp.y;
        });
      }

      this.crystalsGroup = this.physics.add.group({ allowGravity: false });
      const crystalTex = cfg.id === 2 ? 'crystal_cluster' : 'crystal';
      if (cfg.crystalOffsets && cfg.crystalOffsets.length > 0) {
        cfg.crystalOffsets.forEach(cp => {
          const c = this.crystalsGroup.create(cp.x, groundY + cp.y, crystalTex).setScale(cfg.id === 2 ? 0.75 : 0.7);
          c.setDepth(50);
          c.initialY = groundY + cp.y;
        });
      }

      this.physics.add.overlap(this.dog, this.bonesGroup, (dog, bone) => this.collectBone(bone));
      this.physics.add.overlap(this.dog, this.crystalsGroup, (dog, crystal) => this.collectCrystal(crystal));

      // 7. Knowledge Gates, Vaults & Special Diamonds (Depth 45-50)
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
          const gate = this.gateWallsGroup.create(gx, groundY, cfg.id === 4 ? 'moss_monolith' : 'gate_door');
          gate.setOrigin(0.5, 1.0);
          gate.setScale(cfg.id === 4 ? 0.75 : 0.42);
          gate.setDepth(45);
          gate.refreshBody();
          gate.gateIndex = idx;
          gate.isQuestionDoor = true;
          gate.isLocked = true;
          this.gates.push(gate);

          // Front vertical beam (gx, groundY - 260) - prevents jumping over front gate
          const frontSky = this.gateWallsGroup.create(gx, groundY - 260, 'platform');
          frontSky.setScale(0.12, 3.5);
          frontSky.setVisible(false);
          frontSky.refreshBody();
          frontSky.gateIndex = idx;
          frontSky.isGateApproach = true;
          this.vaultBarriers.push(frontSky);

          const hasDiamond = diamondGateIndices.includes(idx);
          if (hasDiamond) {
            // B. Special Diamond placed inside vault chamber (gx + 120)
            const diamond = this.specialDiamondsGroup.create(gx + 120, groundY - 55, 'special_diamond');
            diamond.setScale(0.65);
            diamond.setDepth(50);
            diamond.gateIndex = idx;
            diamond.initialY = groundY - 55;
            diamond.isVanished = false;
            diamond.isCollected = false;
            this.specialDiamonds[idx] = diamond;

            // C. Back Obstacle Barrier (gx + 240): strictly blocks dog approaching diamond from behind
            const obstacle = this.gateWallsGroup.create(gx + 240, groundY, cfg.id === 4 ? 'moss_monolith' : 'gate_barrier');
            obstacle.setOrigin(0.5, 1.0);
            obstacle.setScale(cfg.id === 4 ? 0.65 : 0.35, cfg.id === 4 ? 0.75 : 0.42);
            obstacle.setDepth(45);
            obstacle.refreshBody();
            obstacle.gateIndex = idx;
            obstacle.isLocked = true;
            this.obstacles[idx] = obstacle;

            // D. Rear vertical sky beam (gx + 240, groundY - 260)
            const rearSky = this.gateWallsGroup.create(gx + 240, groundY - 260, 'platform');
            rearSky.setScale(0.12, 3.5);
            rearSky.setVisible(false);
            rearSky.refreshBody();
            rearSky.gateIndex = idx;
            this.vaultBarriers.push(rearSky);

            // E. Overhead Vault Roof Beam (gx + 120, groundY - 185)
            const roof = this.gateWallsGroup.create(gx + 120, groundY - 185, this.platformTexture(cfg.id, 0.55));
            roof.setScale(0.75);
            roof.setDepth(45);
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
        .setDepth(72)
        .setVisible(false);

      this.superAura = this.add.circle(this.dog.x, this.dog.y, 46, 0xfacc15, 0.35)
        .setStrokeStyle(4, 0xffd700, 0.95)
        .setDepth(72)
        .setVisible(false);

      // 100% Solid Arcade Physics Collider between Dog and Gate Walls Group
      this.physics.add.collider(this.dog, this.gateWallsGroup, (dog, wall) => {
        if (wall.isGateApproach && !AdventureState.isPaused && this.gates[wall.gateIndex]?.isLocked) {
          this.triggerGateArrival(this.gates[wall.gateIndex]);
          return;
        }
        if (wall.isLocked && !AdventureState.isPaused) {
          if (wall.isQuestionDoor) {
            this.triggerGateArrival(wall);
          } else if (this.obstacles[wall.gateIndex] === wall) {
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

      // 8. Level Finish Grand Cave Portal (Enlarged & Majestic for Dog Entrance)
      this.finishPortal = this.physics.add.sprite(cfg.exitX, groundY + 8 * cfg.cave.scale, 'cave_anim');
      this.finishPortal.setOrigin(0.5, 1.0);
      this.finishPortal.setFlipX(cfg.cave.flipX);
      this.finishPortal.setScale(cfg.cave.scale); // High-res 360x470 frames -> ~342px x 446px majestic mountain cave
      this.finishPortal.play('cave-glow');
      this.finishPortal.setDepth(30);
      this.finishPortal.body.setImmovable(true);
      this.finishPortal.body.allowGravity = false;
      this.finishPortal.body.setSize(110, 165);
      this.finishPortal.body.setOffset(cfg.cave.flipX ? 95 : 155, 285);

      this.isEnteringCave = false;
      this.physics.add.overlap(this.dog, this.finishPortal, () => this.handleDogEnterCave());

      // 9. Camera follow - edge to edge across screen with responsive zoom & look-ahead
      this.cameras.main.setBounds(0, -700, levelWidth, levelHeight + 1300);
      const responsiveZoom = Math.min(0.92, Math.max(0.68, screenHeight / 540));
      this.cameras.main.setZoom(responsiveZoom);
      this.fitViewportBackdrop(screenWidth,screenHeight);
      this.cameras.main.startFollow(this.dog, true, 0.08, 0.05, -120, screenHeight * 0.12 / responsiveZoom);

      // Trigger cinematic level title banner
      if (window.showCinematicLevelTitle) {
        window.showCinematicLevelTitle(AdventureState.currentLevel, cfg.name);
      }

      // Handle window resize dynamically
      this.resizeHandler = (gameSize) => this.handleResize(gameSize.width, gameSize.height);
      this.scale.on('resize', this.resizeHandler);

      // 10. Enemies (Ground Patrols & Flying Drones)
      this.isInvulnerable = false;
      this.enemiesGroup = this.physics.add.group();
      this.levelEnemies = [];

      if (cfg.enemies && cfg.enemies.length > 0) {
        cfg.enemies.forEach(eCfg => {
          const tex = eCfg.sprite || ((eCfg.type === 'fly') ? 'enemy_fly' : (eCfg.type === 'armored' ? 'enemy_armored' : 'enemy_ground'));
          const spawnY = groundY + (eCfg.y || -45);
          const enemy = new Enemy(this, eCfg.x, spawnY, tex, eCfg);
          this.enemiesGroup.add(enemy);
          enemy.body.setAllowGravity(eCfg.type !== 'fly');
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
      this.hazardMeteorsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
      this.hazardGeysersGroup = this.physics.add.group({ allowGravity: false, immovable: true });

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

    createPaintedGround(cfg,seg,groundY) {
      const width=seg.endX-seg.startX;
      // The dog walks within a broad painted earth plane, as in the reference.
      // The plane's perspective skirt is decorative; the collision line stays at groundY.
      const earthKey='painted-earth-'+cfg.id;
      if(!this.textures.exists(earthKey)){
        const earth=this.textures.get(cfg.id===2?'earth_b':'earth_a').getSourceImage(),tile=this.textures.createCanvas(earthKey,earth.width*2,earth.height),t=tile.context;
        t.drawImage(earth,0,0);t.save();t.translate(earth.width*2,0);t.scale(-1,1);t.drawImage(earth,0,0);t.restore();tile.refresh();
      }
      if(cfg.id===1){
        // A deep forest floor, not a platform strip: roots sit ON this plane.
        const floor=this.add.tileSprite(seg.startX,groundY-160,width,850,earthKey)
          .setOrigin(0,0).setDepth(21).setTileScale(1.15).setMask(this.paintedBankMask);
        floor.tilePositionX=seg.startX;
        if(!this.textures.exists('forest-soil-transition')){
          const src=this.textures.get(earthKey).getSourceImage();
          const tex=this.textures.createCanvas('forest-soil-transition',src.width,100),c=tex.context;
          c.drawImage(src,0,0,src.width,100,0,0,src.width,100);
          c.globalCompositeOperation='destination-in';
          const fade=c.createLinearGradient(0,0,0,100);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(1,'white');
          c.fillStyle=fade;c.fillRect(0,0,src.width,100);tex.refresh();
        }
        this.add.tileSprite(seg.startX,groundY-195,width,46,'forest-soil-transition')
          .setOrigin(0,0).setTileScale(1.15,0.46).setDepth(21).setMask(this.paintedBankMask);
        // Expose cliff rock only at actual trench banks, never across the walking surface.
        [[seg.startX,true],[seg.endX,false]].forEach(([x,flip])=>{
          if(x<=0||x>=cfg.levelWidth)return;
          this.add.image(x+(flip?35:-35),groundY+340,'rock_shelf').setOrigin(0.5,1)
            .setScale(0.7).setFlipX(flip).setDepth(23).setMask(this.paintedBankMask);
        });
        return;
      }
      const floor=this.add.tileSprite(seg.startX,groundY-38,width,190,earthKey).setOrigin(0,0).setDepth(27);
      floor.setTileScale(1.15);floor.tilePositionX=seg.startX;floor.setMask(this.paintedBankMask);
      if(cfg.id===2)floor.setTint(0x8b879b);else if(cfg.id===3)floor.setTint(0xb9c3c6);
      this.add.tileSprite(seg.startX,groundY+140,width,620,'rock_stack').setOrigin(0,0).setTileScale(1.35)
        .setTint(cfg.id===2?0x55536c:cfg.id===3?0x7b8c9e:0x777867).setDepth(25).setMask(this.paintedBankMask);
      const rim=this.add.tileSprite(seg.startX,groundY+132,width,48,'platform').setOrigin(0,0).setTileScale(0.5).setDepth(28);
      rim.setMask(this.paintedBankMask);
      if(cfg.id!==1)rim.setTint(cfg.id===2?0x8b879b:0xb9c3c6);
      // Real pack rock silhouettes make the broken banks readable, including the depth of the gap.
      [[seg.startX+30,true],[seg.endX-30,false]].forEach(([x,flip])=>{
        if(x<0||x>cfg.levelWidth)return;
        this.add.image(x,groundY+20,'rock_shelf').setOrigin(0.5,1).setScale(0.32).setFlipX(flip).setDepth(29);
        this.add.image(x,groundY+168,'rock_shelf').setOrigin(0.5,1).setScale(0.68).setFlipX(flip).setDepth(29)
          .setTint(cfg.id===2?0x9893aa:0xffffff);
        this.add.image(x,groundY+550,'rock_peak').setOrigin(0.5,1).setScale(0.36).setFlipX(flip)
          .setTint(cfg.id===2?0x656177:0x777e7f).setDepth(24);
      });
    }

    createIllustratedLandscape(cfg,groundY) {
      const art=window.CosmicIllustratedScenes[cfg.id];
      this.sectionLandmarks=[];
      // Keep all painted bases out of the actual gaps; branches above the path may frame them.
      const groundMaskArt=this.make.graphics({x:0,y:0,add:false});groundMaskArt.fillStyle(0xffffff);
      groundMaskArt.fillRect(-2000,-3000,cfg.levelWidth+4000,groundY-38+3000);
      let bank=-2000;
      const bankShape=(left,right)=>groundMaskArt.fillPoints([
        {x:left+4,y:groundY-38},{x:right-5,y:groundY-38},
        {x:right+3,y:groundY-22},{x:right-9,y:groundY+2},{x:right+2,y:groundY+32},
        {x:right-12,y:groundY+82},{x:right-5,y:groundY+130},{x:right-24,y:groundY+240},
        {x:right-35,y:groundY+700},{x:left+25,y:groundY+700},{x:left+14,y:groundY+240},
        {x:left+4,y:groundY+130},{x:left+11,y:groundY+70},{x:left-2,y:groundY+30},
        {x:left+8,y:groundY+2},{x:left-3,y:groundY-20}
      ],true);
      cfg.trenches.forEach(t=>{bankShape(bank,t.startX);bank=t.endX;});
      bankShape(bank,cfg.levelWidth+2000);
      const groundMask=groundMaskArt.createGeometryMask();this.paintedBankMask=groundMask;
      if(!this.textures.exists('painted-chasm')){
        const tex=this.textures.createCanvas('painted-chasm',8,512),c=tex.context,g=c.createLinearGradient(0,0,0,512);
        g.addColorStop(0,'rgba(16,20,28,0.08)');g.addColorStop(0.5,'rgba(16,20,28,0.65)');g.addColorStop(1,'rgba(9,13,22,0.95)');
        c.fillStyle=g;c.fillRect(0,0,8,512);tex.refresh();
      }
      cfg.trenches.forEach(t=>this.add.image(t.startX,groundY-38,'painted-chasm').setOrigin(0,0).setDisplaySize(t.endX-t.startX,650).setDepth(15));
      this.events.once('shutdown',()=>{groundMask.destroy();groundMaskArt.destroy();});
      const place=(item,depth=24)=>{
        const [key,x,scale,dy=18,flip=false]=item;
        const obj=this.add.image(x,groundY+dy-(cfg.id===1&&key.includes('tree')?55:0),key).setOrigin(0.5,1).setScale(scale).setFlipX(flip).setDepth(depth).setMask(groundMask);
        if(key==='cave_anim')obj.setFlipX(true);
        if(cfg.id===2&&key!=='crystal_cluster')obj.setTint(0x9994a6);
        if(key==='crystal_cluster'){
          const glow=this.add.ellipse(x,groundY-65*scale,145*scale,190*scale,0x9987e8,0.07).setDepth(depth-1);
          this.tweens.add({targets:glow,alpha:0.13,duration:2600,yoyo:true,repeat:-1});
        }
        return obj;
      };
      // Sparse far silhouettes: a grove, cavern masses, or peaks below an open summit sky.
      art.distant.forEach(item=>{
        const [key,x,scale]=item;
        this.add.image(x*0.43,groundY-(cfg.id===3?-190:35),key).setOrigin(0.5,1)
          .setScale(scale).setScrollFactor(0.24,1).setAlpha(cfg.id===2?0.38:0.22)
          .setTint(cfg.id===1?0x7e8977:cfg.id===2?0x46445c:0x9faabd).setDepth(10);
      });
      if(cfg.id===3){
        [[180,60,1.6],[1540,160,2],[2890,100,1.7],[4250,160,2.2],[5700,90,1.8]].forEach(([x,dy,scale])=>{
          const cloud=this.add.image(x,groundY+dy,'cloud').setScale(scale).setAlpha(0.42).setDepth(12).setScrollFactor(0.5,1);
          this.tweens.add({targets:cloud,x:x+90,duration:22000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        });
      }
      (art.ceiling||[]).forEach(([key,x,scale,dy])=>{
        this.add.image(x,groundY+dy-(cfg.id===1&&key.includes('tree')?55:0),key).setOrigin(0.5,1).setScale(scale).setFlipY(true).setTint(0x686476).setDepth(19);
      });
      art.sections.forEach(section=>{
        const landmark=place(section.landmark);landmark.setData('sectionLandmark',section.name);
        this.sectionLandmarks.push(landmark);
        section.decor.filter(item=>!item[0].startsWith('ground_')).forEach(item=>place(item));
      });
      art.groundPatches.forEach(([key,x,scale])=>place([key,x,scale*(cfg.id===1?1.05:0.72),cfg.id===1?230:132],cfg.id===1?22:29));
      // A small amount of near-bank vegetation frames the ground without masking enemies.
      const plants=cfg.id===1?[[260,0.55],[1010,0.35],[2330,0.5],[3250,0.4],[4670,0.45],[5510,0.5]]:
        cfg.id===3?[[310,0.28],[2280,0.27],[3950,0.30],[5650,0.28]]:[];
      plants.forEach(([x,scale])=>this.add.sprite(x,groundY+95,'grass_anim').setOrigin(0.5,1).setScale(scale).setDepth(74).play('grass-sway'));
      // Root and rock supports give optional shelves a reason to be here.
      cfg.platformSpots.filter(p=>!cfg.trenches.some(t=>p.x>t.startX-60&&p.x<t.endX+60)).forEach((p,i)=>{
        const key=cfg.id===1?(i%2?'root_tree':'arch_tree'):'rock_spire';
        const source=this.textures.get(key).getSourceImage();
        const height=Math.abs(p.y)+45;
        this.add.image(p.x,groundY+22,key).setOrigin(0.5,1).setScale(height/source.height)
          .setTint(cfg.id===2?0x87819b:0xc1c2b6).setDepth(23);
      });
      // Arrival court: painted clearing and paired pack stones around the mirrored cave.
      place(['ground_5',cfg.exitX,0.82,132],cfg.id===1?22:29);
      place(['rock_low',cfg.exitX-205,0.9,22]);
      place([cfg.id===1?'root_tree':'rock_spire',cfg.exitX+210,cfg.id===1?0.82:0.56,20,true]);
      this.add.ellipse(cfg.exitX-25,groundY-85,180,205,cfg.caveTint,0.07).setDepth(26);
    }

    terrainTextures(biome) {
      const face='terrain-face-'+biome,surface='terrain-surface-'+biome;
      if(this.textures.exists(face)) return {face,surface};
      const palettes={1:['#3a4645','#596359','#293735','#9baf77'],
        2:['#303047','#51516b','#222738','#98a1c8'],
        3:['#465567','#75818c','#303e53','#c2cfdd'],
        4:['#283d36','#44564a','#1c302c','#8ba96d']};
      const [base,light,dark,rim]=palettes[biome];
      const texture=this.textures.createCanvas(face,256,256),c=texture.context;
      c.fillStyle=base;c.fillRect(0,0,256,256);
      // Hand-shaped rock courses, with offset joints and quiet mineral highlights.
      for(let row=-1;row<6;row++)for(let col=-1;col<5;col++){
        const x=col*78+(row%2)*39,y=row*52;
        const inset=5+((row+col+12)%3)*2;
        c.beginPath();c.moveTo(x+inset,y+4);c.lineTo(x+70,y+2);
        c.lineTo(x+77,y+19);c.lineTo(x+68,y+47);c.lineTo(x+8,y+50);c.lineTo(x+1,y+28);c.closePath();
        const g=c.createLinearGradient(x,y,x+35,y+52);g.addColorStop(0,light);g.addColorStop(1,base);
        c.fillStyle=g;c.fill();c.strokeStyle=dark;c.lineWidth=3;c.stroke();
        c.strokeStyle=light;c.lineWidth=1;c.beginPath();c.moveTo(x+14,y+9);c.lineTo(x+60,y+7);c.stroke();
      }
      texture.refresh();
      const top=this.textures.createCanvas(surface,256,40),t=top.context;
      t.drawImage(texture.getSourceImage(),0,0,256,40,0,0,256,40);
      t.fillStyle=rim;t.fillRect(0,0,256,7);t.fillStyle=light;t.fillRect(0,7,256,7);
      if(biome===1||biome===4){
        const moss=this.textures.get('moss_surface').getSourceImage();
        // Leaves fringe the stone lip below the footing line, rather than floating above it.
        t.drawImage(moss,0,0,moss.width,moss.height,0,3,256,37);
        t.fillStyle=rim;t.fillRect(0,0,256,4);
      }else{
        t.strokeStyle=rim;t.lineWidth=2;
        for(let x=10;x<256;x+=39){t.beginPath();t.moveTo(x,12);t.lineTo(x+15,20);t.lineTo(x+25,17);t.stroke();}
      }
      top.refresh();return {face,surface};
    }

    platformTexture(biome, scale = 0.35) {
      const width=scale<=0.25?120:scale>=0.55?420:240;
      const key=`island-${biome}-${width}`;
      if(this.textures.exists(key))return key;
      if(biome<=3){
        const texture=this.textures.createCanvas(key,width,86),c=texture.context;
        const rock=this.textures.get(biome===2?'rock_shelf':biome===3?'rock_low':'mossy_rock').getSourceImage();
        const count=width<=120?1:width<=240?2:3,overlap=35;
        const w=(width+(count-1)*overlap)/count,h=Math.min(70,w*rock.height/rock.width);
        for(let i=0;i<count;i++)c.drawImage(rock,i*(w-overlap),12,w,h);
        // Use the painted soil strip for the landing surface, not a generated polygon.
        const soil=this.textures.get('platform').getSourceImage();
        c.drawImage(soil,0,12,soil.width,38,3,0,width-6,16);
        if(biome===2){c.globalCompositeOperation='source-atop';c.fillStyle='rgba(67,51,98,0.27)';c.fillRect(0,0,width,86);}
        texture.refresh();return key;
      }
      const terrain=this.terrainTextures(biome),texture=this.textures.createCanvas(key,width,86),c=texture.context;
      c.beginPath();c.moveTo(0,0);c.lineTo(width,0);c.lineTo(width-4,53);
      c.lineTo(width-20,72);c.lineTo(width*0.7,79);c.lineTo(width*0.4,72);
      c.lineTo(17,82);c.lineTo(3,58);c.closePath();c.clip();
      c.fillStyle=c.createPattern(this.textures.get(terrain.face).getSourceImage(),'repeat');c.fillRect(0,0,width,86);
      c.fillStyle=c.createPattern(this.textures.get(terrain.surface).getSourceImage(),'repeat-x');c.fillRect(0,0,width,40);
      texture.refresh();return key;
    }

    createViewportBackdrop(cfg) {
      const key='panorama-'+cfg.id;
      if (!this.textures.exists(key)) {
        const texture=this.textures.createCanvas(key,2048,1024),c=texture.context;
        const mist=c.createLinearGradient(0,260,0,1024);
        mist.addColorStop(0,'rgba(18,30,54,0)');
        mist.addColorStop(0.62,cfg.id===4?'rgba(18,58,49,0.48)':'rgba(36,45,76,0.40)');
        mist.addColorStop(1,cfg.id===4?'#102c2b':'#162238');
        c.fillStyle=mist;c.fillRect(0,0,2048,1024);
        const source=this.textures.get(cfg.distantBackdrop).getSourceImage();
        [[0,610,700],[512,675,620],[1024,580,740],[1536,660,660]].forEach(([x,bottom,width])=>{
          const height=width*source.height/source.width;
          for(const wrap of [-2048,0,2048]){
            c.globalAlpha=0.55;c.drawImage(source,x+wrap-100,bottom-height,width,height);
          }
        });
        c.globalCompositeOperation='source-atop';c.globalAlpha=0.30;
        c.fillStyle=cfg.id===4?'#2c7160':'#455985';c.fillRect(0,0,2048,1024);
        texture.refresh();
      }
      this.viewportBackdrop=this.add.tileSprite(0,0,1,1,key).setScrollFactor(0).setDepth(8);
      this.fitViewportBackdrop(this.scale.width,this.scale.height);
    }

    fitViewportBackdrop(width,height) {
      if (!this.viewportBackdrop) return;
      const zoom=this.cameras.main.zoom || 1;
      const worldWidth=width/zoom+4,worldHeight=height/zoom+4;
      const cover=Math.max(worldWidth/2048,worldHeight/1024);
      this.viewportBackdrop.setPosition(width/2,height/2).setSize(worldWidth,worldHeight).setTileScale(cover);
    }

    createLandscape(cfg, groundY) {
      this.levelConfig = cfg;
      if(cfg.id<=3){this.createIllustratedLandscape(cfg,groundY);return;}
      this.sectionLandmarks = [];
      this.createViewportBackdrop(cfg);
      // Compose broad silhouettes at different distances; leave open sky between peaks.
      [220, 900, 1450, 2090, 2820, 3490, 4140].forEach((x, i) => {
        this.add.image(x, groundY + 50 + (i % 3) * 30, cfg.backdrop)
          .setOrigin(0.5, 1).setScale(cfg.id === 4 ? 0.85 : 0.55 + (i % 2) * 0.10)
          .setTint(cfg.id === 2 ? 0x555b85 : cfg.id === 3 ? 0x8898bf : 0x869ba4)
          .setAlpha(0.64).setScrollFactor(0.32, 0.38).setDepth(20);
      });
      [200, 760, 1480, 2220, 2940, 3700].forEach((x, i) => {
        const cloud = this.add.image(x, groundY - 370 - (i % 2) * 80, 'cloud')
          .setScale(0.65).setTint(0x7f91c4).setAlpha(cfg.id === 2 ? 0.12 : 0.28)
          .setScrollFactor(0.16, 0.12).setDepth(12);
        this.tweens.add({targets: cloud, x: x + 55, duration: 23000 + i * 1500,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut'});
      });
      if (cfg.id === 3) {
        [400, 1220, 1990, 2810, 3640, 4510, 5350].forEach((x, i) => {
          const cloud = this.add.image(x, groundY + 145 + (i % 2) * 45, 'cloud')
            .setScale(1.1).setTint(0xa1b5dd).setAlpha(0.32).setDepth(26).setScrollFactor(0.55, 0.65);
          this.tweens.add({targets: cloud, x: x + 40, duration: 18000, yoyo: true, repeat: -1});
        });
      }
      if (cfg.id === 2) {
        // Rock vaults broken by skylights: deep indigo, never a cyan screen overlay.
        const ceiling = this.add.graphics().setScrollFactor(0.32, 0.35).setDepth(22);
        [0, 810, 1640, 2500, 3400].forEach((x, i) => {
          ceiling.fillStyle(0x151c37, 0.95);
          ceiling.fillPoints([
            {x: x - 160, y: -1000}, {x: x + 620, y: -1000},
            {x: x + 590, y: 130}, {x: x + 480, y: 170},
            {x: x + 450, y: 285 + i % 2 * 40}, {x: x + 410, y: 184},
            {x: x + 260, y: 160}, {x: x + 130, y: 230}, {x: x - 110, y: 155}
          ], true);
          this.add.image(x + 90, -80, 'mountains_3').setOrigin(0.5, 0).setFlipY(true)
            .setScale(0.70).setTint(0x51577e).setAlpha(0.6).setDepth(23).setScrollFactor(0.32, 0.35);
          this.add.image(x + 320, 185, 'crystal_cluster').setScale(0.48)
            .setFlipY(true).setTint(0xa9baff).setAlpha(0.65).setDepth(23).setScrollFactor(0.32, 0.35);
        });
      }
      cfg.sections.forEach((section, i) => {
        const landmark = this.add.image(section.landmarkX, groundY, section.landmark)
          .setOrigin(0.5, 1).setScale(section.landmark === 'moss_column' ? 0.50 : section.landmark.startsWith('tree') ? 0.75 : 1)
          .setDepth(24);
        if (section.landmark === 'moss_flower') { landmark.destroy(); this.add.sprite(section.landmarkX,groundY,'moss_flower').setOrigin(0.5,1).setDepth(24).play('moss_flower-loop'); }
        else this.sectionLandmarks.push(landmark);
        // Near silhouettes ground the vista without covering interactive objects.
        this.add.image(220 + i * 650, groundY + 75, cfg.id === 4 ? 'moss_rock' : cfg.id === 2 ? 'crystal_cluster' : 'stone_crag')
          .setScale(0.5).setTint(0x63748c).setAlpha(0.6).setDepth(25).setScrollFactor(0.62, 0.7);
      });
      if (cfg.id === 4) {
        cfg.plants.forEach(p => this.add.sprite(p.x,groundY,p.type).setOrigin(0.5,1).setDepth(35).play(p.type+'-loop'));
        [80,750,1590,2420,3330,4190,5060,5970].forEach((x,i) => {
          const vine=this.add.image(x,groundY-430-(i%2)*45,'moss_hanging').setOrigin(0.5,0)
            .setScale(0.6).setAlpha(0.7).setDepth(21);
          this.tweens.add({targets:vine,angle:3,duration:3200+i*150,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        });
        this.add.sprite(330,groundY,'moss_wizard_idle').setOrigin(0.5,1).setDepth(24).play('moss_wizard_idle-loop');
        const wizard=this.add.sprite(cfg.exitX-220,groundY,'moss_wizard_walk').setOrigin(0.5,1).setDepth(24).play('moss_wizard_walk-loop');
        this.tweens.add({targets:wizard,x:cfg.exitX-145,duration:3500,yoyo:true,repeat:-1,ease:'Sine.easeInOut',onYoyo:()=>wizard.setFlipX(true),onRepeat:()=>wizard.setFlipX(false)});
      }
      // A destination has a plinth, twin waystones and ambient light, not a debug label.
      this.add.ellipse(cfg.exitX - 20, groundY - 60, 200, 170, cfg.caveTint, 0.09).setDepth(26);
      [cfg.exitX - 180, cfg.exitX + 145].forEach(x => {
        this.add.image(x, groundY, cfg.id === 4 ? 'moss_rock' : cfg.id === 2 ? 'crystal_cluster' : 'rune_stone')
          .setOrigin(0.5, 1).setScale(0.65).setDepth(26);
      });
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

    handleResize(w, h) {
      if (this.cameras && this.cameras.main) {
        this.cameras.main.setViewport(0, 0, w, h);
        const responsiveZoom = Math.min(0.92, Math.max(0.68, h / 540));
        this.cameras.main.setZoom(responsiveZoom);
        this.cameras.main.followOffset.y = h * 0.12 / responsiveZoom;
        this.fitViewportBackdrop(w,h);
      }
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
      if (this.viewportBackdrop) this.viewportBackdrop.tilePositionX = this.cameras.main.scrollX * 0.10 + time * 0.005;
      if (AdventureState.isPaused || this.isEnteringCave) return;

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

      // Smooth Directional Camera Look-Ahead (Req 16)
      if (this.cameras && this.cameras.main && this.dog && this.cameras.main.followOffset) {
        const targetOffsetX = this.dog.flipX ? 120 : -120;
        const curOffsetX = this.cameras.main.followOffset.x || 0;
        this.cameras.main.followOffset.x = Phaser.Math.Linear(curOffsetX, targetOffsetX, 0.04);
      }

      // Contextual Knowledge Gate Approach Announcement (Req 13)
      if (this.gates && this.gates.length > 0 && this.dog) {
        this.gates.forEach(g => {
          if (g && g.isLocked && !g.announced && Math.abs(this.dog.x - g.x) < 320) {
            g.announced = true;
            if (window.showGateAnnouncement) {
              window.showGateAnnouncement(g.gateIndex + 1, AdventureState.gatesTotal || 7);
            }
          }
        });
      }

      // Update Enemies Patrol & Movement
      if (this.levelEnemies && this.levelEnemies.length > 0) {
        this.levelEnemies.forEach(e => {
          if (e && e.active) e.update(time, delta);
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
      if (this.groundY && this.dog.y > this.groundY + 120 && !this.isFallingInTrench) {
        this.handleTrenchFall();
        return;
      }

      // Safety: prevent dog from clipping below ground on solid segments
      if (this.dog.body.blocked.down && this.dog.body.velocity.y > 0) {
        this.dog.body.velocity.y = 0;
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

      // Update Environmental Hazards (Geysers, Meteors, Wind Zones)
      if (this.levelHazards && this.levelHazards.length > 0) {
        this.levelHazards.forEach(h => {
          if (h && typeof h.update === 'function') h.update(time, delta);
        });
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
        .setDepth(80);
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

      const target = this.enemiesGroup.getChildren()
        .filter(enemy => enemy.active && !enemy.isDefeated && enemy.body &&
          (enemy.body.center.x-spawnX)*direction > 0 &&
          (enemy.body.center.x-spawnX)*direction <= PROJECTILE_CONFIG.aimRange &&
          Math.abs(enemy.body.center.y-spawnY) < 190)
        .sort((a,b)=>Math.abs(a.body.center.x-spawnX)-Math.abs(b.body.center.x-spawnX))[0];
      pulse.fire(spawnX, spawnY, direction, hasSuper, target);

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
      spark.setDepth(80);
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
      ring.setDepth(80);
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
        p.setDepth(80);
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
      p.setDepth(80);
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
      ring.setDepth(80);
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
        star.setDepth(80);
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
        p.setDepth(80);
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
      this.showFloatingPrompt(this.dog.x, this.groundY - 30, "Oops! Back to checkpoint! 🐾", "#fbbf24");

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
      // Place dog well above ground to prevent any spawn overlap
      const safeY = Math.min(AdventureState.checkpointY, this.groundY - 80);
      this.dog.setPosition(AdventureState.checkpointX, safeY);
      this.dog.setVelocity(0, 0);
      this.dog.body.reset(AdventureState.checkpointX, safeY);
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

    handleDogEnterCave() {
      if (this.isEnteringCave || AdventureState.isPaused || AdventureState.gatesCleared < AdventureState.gatesTotal) return;
      this.isEnteringCave = true;

      // Lock controls & stop dog physics
      if (this.dog && this.dog.body) {
        this.dog.body.setVelocity(0, 0);
        this.dog.body.allowGravity = false;
        this.dog.play('dog-walk');
        this.dog.setFlipX(false);
        this.dog.setDepth(29); // Steps into the dark mouth of the cave behind the foreground rock face
      }
      this.clearTouchInputs();

      if (window.Sound && window.Sound.playClick) {
        window.Sound.playClick();
      }

      // Magical celebration energy burst around the entrance
      const portalX = (this.finishPortal && this.finishPortal.x) ? (this.finishPortal.x + (this.finishPortal.flipX ? -25 : 25)) : this.dog.x;
      const curLvl = AdventureState.currentLevel || 1;
      const pColor = (curLvl === 2) ? 0xa855f7 : ((curLvl === 3) ? 0xfacc15 : 0x38bdf8);

      for (let i = 0; i < 28; i++) {
        const pX = portalX + (Math.random() - 0.5) * 80;
        const pY = this.groundY - 45 + (Math.random() - 0.5) * 60;
        const sparkle = this.add.circle(pX, pY, 3.5, pColor).setDepth(80);
        this.tweens.add({
          targets: sparkle,
          x: pX + (Math.random() - 0.5) * 110,
          y: pY - 70 - Math.random() * 60,
          alpha: 0,
          scale: 0.1,
          duration: 750 + Math.random() * 350,
          ease: 'Power2',
          onComplete: () => sparkle.destroy()
        });
      }

      // Tween dog stepping into the cave doorway with perspective fade
      this.tweens.add({
        targets: this.dog,
        x: portalX + 15,
        y: this.groundY - 16,
        scaleX: 0.32,
        scaleY: 0.32,
        alpha: 0.0,
        duration: 920,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (this.dog) this.dog.setVisible(false);
          this.triggerVictory();
        }
      });
    }

    triggerVictory() {
      AdventureState.isPaused = true;
      this.physics.world.pause();

      this.clearTouchInputs();
      const touchControls = document.getElementById('adv-touch-controls');
      if (touchControls) touchControls.style.display = 'none';

      const hudTL = document.getElementById('adv-hud-top-left');
      const hudTR = document.getElementById('adv-hud-top-right');
      if (hudTL) hudTL.style.opacity = '0';
      if (hudTR) hudTR.style.opacity = '0';

      if (this.pulsePool) {
        this.pulsePool.clear();
      }

      if (window.Sound && window.Sound.playVictory) {
        window.Sound.playVictory();
      }

      showAdventureVictoryScreen();
    }

    shutdown() {
      this.scale.off('resize', this.resizeHandler);
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

    // Show Stage 1 (Question & Options), hide Stage 2 (Explanation)
    const stageQuestion = document.getElementById('adv-gate-stage-question');
    const stageExplanation = document.getElementById('adv-gate-stage-explanation');
    if (stageQuestion) stageQuestion.style.display = 'flex';
    if (stageExplanation) stageExplanation.style.display = 'none';

    // Clear any previous capsule intervals/timeouts
    clearInterval(AdventureState.capsuleCountdownInterval);
    if (AdventureState.autoAdvanceTimeout) {
      clearTimeout(AdventureState.autoAdvanceTimeout);
    }

    // Hide gameplay touch controls & dim corner HUD while quiz modal is active
    const touchControls = document.getElementById('adv-touch-controls');
    if (touchControls) touchControls.style.display = 'none';

    const hudTL = document.getElementById('adv-hud-top-left');
    const hudTR = document.getElementById('adv-hud-top-right');
    if (hudTL) hudTL.style.opacity = '0';
    if (hudTR) hudTR.style.opacity = '0';

    // Reset scroll position of modal bodies to top
    const scrollBody = document.getElementById('adv-gate-body-scroll');
    if (scrollBody) scrollBody.scrollTop = 0;
    const expBody = document.querySelector('.adv-explanation-body');
    if (expBody) expBody.scrollTop = 0;

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
    let bank = (window.gameState && window.gameState.questionsBank) || [];
    if (!bank || bank.length === 0) {
      const curSub = (window.gameState && window.gameState.currentSubject) || 'igko';
      if (window.OLYMPIAD_SUBJECTS && window.OLYMPIAD_SUBJECTS[curSub] && window.OLYMPIAD_SUBJECTS[curSub].defaultQuestions) {
        bank = window.OLYMPIAD_SUBJECTS[curSub].defaultQuestions;
      }
    }
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

    // Header & Meta (Gate X / Total) with Topic Badge
    const curSub = (window.gameState && window.gameState.currentSubject) || 'igko';
    const subInfo = (window.OLYMPIAD_SUBJECTS && window.OLYMPIAD_SUBJECTS[curSub]);
    const gateSubjectIcon = subInfo ? subInfo.icon : '⛩️';
    const gateSubjectName = subInfo ? subInfo.shortName : 'Knowledge';
    document.getElementById('adv-gate-title').textContent = `${gateSubjectIcon} ${gateSubjectName} Gate #${gateIndex + 1} / ${AdventureState.gatesTotal}`;
    document.getElementById('adv-gate-topic').textContent = q.topic || (subInfo ? subInfo.name : "Olympiad Knowledge");
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
      AdventureState.bestStreak = Math.max(AdventureState.bestStreak || 0, AdventureState.streak);
      AdventureState.correctQuestions = (AdventureState.correctQuestions || 0) + 1;
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

    // Transition smoothly to dedicated Explanation Stage after brief answer feedback
    setTimeout(() => {
      showGateExplanation(isCorrect, q);
    }, 450);
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

    setTimeout(() => {
      showGateExplanation(false, q);
    }, 550);
  }

  function showGateExplanation(isCorrect, q) {
    const stageQuestion = document.getElementById('adv-gate-stage-question');
    const stageExplanation = document.getElementById('adv-gate-stage-explanation');
    if (stageQuestion) stageQuestion.style.display = 'none';
    if (stageExplanation) stageExplanation.style.display = 'flex';

    // Reset scroll of explanation body
    const expBody = document.querySelector('.adv-explanation-body');
    if (expBody) expBody.scrollTop = 0;

    const verdictBanner = document.getElementById('adv-verdict-banner');
    const verdictPill = document.getElementById('adv-verdict-pill');
    const textEl = document.getElementById('adv-capsule-text');
    const nextBtn = document.getElementById('btn-adv-capsule-next');

    const cfg = LEVEL_CONFIGS[AdventureState.currentLevel] || LEVEL_CONFIGS[1];
    const diamondGateIndices = cfg.diamondGateIndices || [1, 3, 6];
    const hasDiamond = diamondGateIndices.includes(AdventureState.activeGateIndex);

    // Update Verdict Pill in Header
    if (verdictPill) {
      if (isCorrect) {
        verdictPill.className = 'adv-verdict-pill verdict-pill-correct';
        verdictPill.innerHTML = `<span>✨ CLEARED</span>`;
      } else {
        verdictPill.className = 'adv-verdict-pill verdict-pill-wrong';
        verdictPill.innerHTML = `<span>🐾 PASSED</span>`;
      }
    }

    // Update Verdict Banner
    if (verdictBanner) {
      if (isCorrect) {
        verdictBanner.className = 'adv-verdict-banner banner-correct';
        verdictBanner.innerHTML = `
          <div class="adv-verdict-title">🎉 BRILLIANT ANSWER!</div>
          <div class="adv-verdict-badges">
            <span class="adv-vbadge">+200 PTS</span>
            <span class="adv-vbadge">+15⚡ ENERGY</span>
            <span class="adv-vbadge">🔥 STREAK ${AdventureState.streak}</span>
          </div>
        `;
      } else {
        const correctLetter = chrLetter(q.answerIndex);
        const correctText = q.options[q.answerIndex];
        verdictBanner.className = 'adv-verdict-banner banner-wrong';
        verdictBanner.innerHTML = `
          <div class="adv-verdict-title">💪 GOOD TRY!</div>
          <div class="adv-verdict-sub">
            Correct Answer: <strong>${correctLetter}) ${correctText}</strong>
          </div>
        `;
      }
    }

    // Update Concept & Explanation Text
    if (textEl) {
      let html = `<div class="adv-exp-content">${(q && q.explanation) ? q.explanation : "Reviewing this concept strengthens your Olympiad knowledge!"}</div>`;
      if (hasDiamond) {
        if (isCorrect) {
          html += `<div class="adv-diamond-notice notice-unlocked">
            <span class="adv-notice-icon">💎</span>
            <span><strong>Special Diamond Vault Unlocked!</strong> Claim the rare diamond (+500 PTS & +25⚡) ahead!</span>
          </div>`;
        } else {
          html += `<div class="adv-diamond-notice notice-lost">
            <span class="adv-notice-icon">💨</span>
            <span><strong>Special Diamond Vanished!</strong> Answer correctly next time to claim the rare diamond!</span>
          </div>`;
        }
      } else {
        if (isCorrect) {
          html += `<div class="adv-diamond-notice notice-gate-cleared">
            <span class="adv-notice-icon">🚪</span>
            <span><strong>Knowledge Gate Cleared!</strong> Pass through to continue your galactic mission!</span>
          </div>`;
        } else {
          html += `<div class="adv-diamond-notice notice-gate-opened">
            <span class="adv-notice-icon">🚪</span>
            <span><strong>Knowledge Gate Opened!</strong> Review the concept and advance forward!</span>
          </div>`;
        }
      }
      textEl.innerHTML = html;
    }

    let countdownSecs = 15;
    if (nextBtn) {
      nextBtn.innerHTML = `<span>Skip to Game (${countdownSecs}s)</span><span class="adv-skip-icon">🚀</span>`;
    }

    clearInterval(AdventureState.capsuleCountdownInterval);
    if (AdventureState.autoAdvanceTimeout) {
      clearTimeout(AdventureState.autoAdvanceTimeout);
    }

    AdventureState.capsuleCountdownInterval = setInterval(() => {
      countdownSecs--;
      if (nextBtn && countdownSecs > 0) {
        nextBtn.innerHTML = `<span>Skip to Game (${countdownSecs}s)</span><span class="adv-skip-icon">🚀</span>`;
      }
    }, 1000);

    const proceed = () => {
      clearInterval(AdventureState.capsuleCountdownInterval);
      if (AdventureState.autoAdvanceTimeout) {
        clearTimeout(AdventureState.autoAdvanceTimeout);
      }
      document.getElementById('adv-gate-modal').style.display = 'none';

      // Restore touch controls and corner HUD for gameplay exploration
      const touchControls = document.getElementById('adv-touch-controls');
      if (touchControls) touchControls.style.display = '';

      const hudTL = document.getElementById('adv-hud-top-left');
      const hudTR = document.getElementById('adv-hud-top-right');
      if (hudTL) hudTL.style.opacity = '1';
      if (hudTR) hudTR.style.opacity = '1';

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

    if (nextBtn) nextBtn.onclick = proceed;
    AdventureState.autoAdvanceTimeout = setTimeout(proceed, 15000);
  }

  function showAdventureVictoryScreen() {
    const screen = document.getElementById('screen-adventure-victory');
    if (!screen) return;

    const curLvl = AdventureState.currentLevel || 1;
    const cfg = LEVEL_CONFIGS[curLvl] || LEVEL_CONFIGS[1];

    if (window.showScreen) {
      window.showScreen('screen-adventure-victory');
    }

    if (window.Sound && window.Sound.playLevelComplete) {
      window.Sound.playLevelComplete();
    } else if (window.Sound && window.Sound.playVictory) {
      window.Sound.playVictory();
    }

    // Set subtitle
    const subTitleEl = document.getElementById('adv-results-subtitle');
    if (subTitleEl) {
      subTitleEl.textContent = `Level ${curLvl}: ${cfg.name} Conquered!`;
    }

    // Dog victory animation
    const dogEl = document.getElementById('adv-results-dog');
    if (dogEl) {
      dogEl.innerHTML = `
        <div class="dog-bone-feast-badge">
          <div class="dog-bone-sprite-box"></div>
          <span class="feast-label">🦴 Victory Feast! +${AdventureState.bones} Bones | +${AdventureState.diamonds} Diamonds 💎</span>
        </div>
      `;
    }

    // Reset star slots
    for (let s = 1; s <= 3; s++) {
      const starSlot = document.getElementById(`adv-star-${s}`);
      if (starSlot) starSlot.classList.remove('revealed');
    }

    // Hide action buttons during animation
    const actionsEl = document.getElementById('adv-results-actions');
    if (actionsEl) {
      actionsEl.style.opacity = '0';
      actionsEl.style.pointerEvents = 'none';
    }

    // Target values
    const targetScore = AdventureState.score || 0;
    const targetBones = AdventureState.bones || 0;
    const totalBones = AdventureState.totalBonesInLevel || 10;
    const targetDiamonds = AdventureState.diamonds || 0;
    const totalDiamonds = AdventureState.totalDiamondsInLevel || 3;
    const targetGates = AdventureState.gatesCleared || 0;
    const totalGates = AdventureState.gatesTotal || 7;
    const targetCorrect = AdventureState.correctQuestions != null ? AdventureState.correctQuestions : targetGates;
    const targetStreak = AdventureState.bestStreak != null ? AdventureState.bestStreak : (AdventureState.streak || 0);
    const targetEnergy = AdventureState.energy || 0;

    // Calculate stars (1 - 3)
    let starCount = 1;
    const bonePct = targetBones / Math.max(1, totalBones);
    if (targetEnergy >= 50 && (targetDiamonds >= 2 || bonePct >= 0.7)) starCount = 3;
    else if (targetEnergy >= 25 || targetDiamonds >= 1 || bonePct >= 0.35) starCount = 2;

    // Elements
    const scoreValEl = document.getElementById('adv-results-score');
    const statBonesEl = document.getElementById('adv-stat-bones');
    const statDiamondsEl = document.getElementById('adv-stat-diamonds');
    const statGatesEl = document.getElementById('adv-stat-gates');
    const statCorrectEl = document.getElementById('adv-stat-correct');
    const statStreakEl = document.getElementById('adv-stat-streak');
    const statEnergyEl = document.getElementById('adv-stat-energy');

    // Counters animation (lasts ~1.2s)
    const animDuration = 1200;
    const startTime = performance.now();
    let lastTickTime = 0;

    function stepCounters(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / animDuration);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out

      const curScore = Math.round(targetScore * easeProgress);
      const curBones = Math.round(targetBones * easeProgress);
      const curDiamonds = Math.round(targetDiamonds * easeProgress);
      const curGates = Math.round(targetGates * easeProgress);
      const curCorrect = Math.round(targetCorrect * easeProgress);
      const curStreak = Math.round(targetStreak * easeProgress);
      const curEnergy = Math.round(targetEnergy * easeProgress);

      if (scoreValEl) scoreValEl.textContent = `${curScore.toLocaleString()} PTS`;
      if (statBonesEl) statBonesEl.textContent = `${curBones} / ${totalBones}`;
      if (statDiamondsEl) statDiamondsEl.textContent = `${curDiamonds} / ${totalDiamonds}`;
      if (statGatesEl) statGatesEl.textContent = `${curGates} / ${totalGates}`;
      if (statCorrectEl) statCorrectEl.textContent = `${curCorrect} / ${totalGates}`;
      if (statStreakEl) statStreakEl.textContent = `x${curStreak}`;
      if (statEnergyEl) statEnergyEl.textContent = `${curEnergy}%`;

      if (now - lastTickTime > 120 && window.Sound && window.Sound.playStatTick && progress < 1) {
        lastTickTime = now;
        window.Sound.playStatTick();
      }

      if (progress < 1) {
        requestAnimationFrame(stepCounters);
      } else {
        // Counters finished -> Reveal stars 1 by 1
        revealStarsSequence();
      }
    }

    requestAnimationFrame(stepCounters);

    function revealStarsSequence() {
      let delay = 280;
      for (let s = 1; s <= starCount; s++) {
        setTimeout(() => {
          const starSlot = document.getElementById(`adv-star-${s}`);
          if (starSlot) {
            starSlot.classList.add('revealed');
          }
          if (window.Sound && window.Sound.playStarReveal) {
            window.Sound.playStarReveal(s);
          }
        }, delay);
        delay += 350;
      }

      setTimeout(() => {
        if (starCount === 3 && window.Sound && window.Sound.playPerfectResult) {
          window.Sound.playPerfectResult();
        }
        // Fade in action buttons
        if (actionsEl) {
          actionsEl.style.transition = 'opacity 0.4s ease';
          actionsEl.style.opacity = '1';
          actionsEl.style.pointerEvents = 'auto';
        }
      }, delay + 250);
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
      lvlData.unlocked = true;
      lvlData.stars = Math.max(lvlData.stars || 0, starCount);
      lvlData.highScore = Math.max(lvlData.highScore || 0, targetScore);
      lvlData.bones = Math.max(lvlData.bones || 0, targetBones);
      lvlData.diamonds = Math.max(lvlData.diamonds || 0, targetDiamonds);
      window.gameState.adventureLevels[curLvl] = lvlData;

      // Unlock next level if available
      if (LEVEL_CONFIGS[curLvl + 1]) {
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
      if (LEVEL_CONFIGS[curLvl + 1]) {
        nextBtn.style.display = 'inline-flex';
        const nextCfg = LEVEL_CONFIGS[curLvl + 1] || { name: `Level ${curLvl + 1}` };
        nextBtn.innerHTML = `<span>Next Level: ${nextCfg.name}</span> <span>⏩</span>`;
        nextBtn.onclick = () => {
          window.CosmicAdventureEngine.startAdventure(curLvl + 1);
        };
      } else {
        // Final available level: Requirement 24: replace NEXT LEVEL with Level Map
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
  }

  /* ========================================================
     5. GLOBAL ENGINE CONTROLLER
     ======================================================== */
  window.AdventureCampaign = Object.values(LEVEL_CONFIGS).map(cfg => ({
    id: cfg.id, name: cfg.name, biome: cfg.subtitle, totalBones: cfg.totalBones,
    accentColor: cfg.themeColor, icon: ['🌌', '🔮', '☁️', '🌿'][cfg.id - 1],
    desc: ['Explore the starry plains and ancient rune paths.', 'Ride crystal lifts through the indigo caverns.',
      'Cross the floating ruins beneath the cosmic sky.', 'Follow the blue wizard through a living grove of moss, flowers and slimes.'][cfg.id - 1],
    bgGrad: ['linear-gradient(135deg,#1e3a8a,#0f172a)', 'linear-gradient(135deg,#581c87,#0f172a)',
      'linear-gradient(135deg,#0369a1,#0f172a)', 'linear-gradient(135deg,#145c49,#111d32)'][cfg.id - 1]
  }));
  window.CosmicAdventureEngine = {
    game: null,
    _resizeAttached: false,

    startAdventure(levelNum = 1) {
      AdventureState.currentLevel = levelNum;

      if (window.showScreen) {
        window.showScreen('screen-adventure');
      }

      // Ensure corner HUD overlays are visible and reset
      const hudTL = document.getElementById('adv-hud-top-left');
      const hudTR = document.getElementById('adv-hud-top-right');
      if (hudTL) { hudTL.style.opacity = '1'; hudTL.style.display = 'flex'; }
      if (hudTR) { hudTR.style.opacity = '1'; hudTR.style.display = 'flex'; }

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

      // Initialize Phaser 3 game with transparent background over Three.js canvas
      if (!this.game) {
        const config = {
          type: Phaser.AUTO,
          parent: 'phaser-game-container',
          transparent: true,
          backgroundColor: 'rgba(0,0,0,0)',
          render: {
            antialias: true,
            pixelArt: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          },
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
        const onResize = () => {
          this.resizeGame();
          setTimeout(() => this.resizeGame(), 80);
          setTimeout(() => this.resizeGame(), 250);
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);
        this._resizeAttached = true;
      }

      // Ensure full screen dimensions apply smoothly and precisely
      this.resizeGame();
      setTimeout(() => this.resizeGame(), 80);
      setTimeout(() => this.resizeGame(), 250);
      setTimeout(() => this.resizeGame(), 500);
    },

    resizeGame() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (this.game && this.game.scale) {
        this.game.scale.resize(w, h);
      }
      if (window.AdventureBackground3D && window.AdventureBackground3D.onResize) {
        window.AdventureBackground3D.onResize();
      }
      if (window.currentAdventureScene && window.currentAdventureScene.handleResize) {
        window.currentAdventureScene.handleResize(w, h);
      }
    }
  };

  /* ========================================================
     6. CINEMATIC LEVEL & GATE ANNOUNCEMENT CONTROLLERS
     ======================================================== */
  window.showCinematicLevelTitle = function(levelNum, levelName) {
    const el = document.getElementById('adv-cinematic-title');
    if (!el) return;
    const sub = el.querySelector('.adv-cine-sub');
    const main = el.querySelector('.adv-cine-main');
    if (sub) sub.textContent = `LEVEL ${levelNum}`;
    if (main) main.textContent = (levelName || '').toUpperCase();
    el.style.display = 'block';
    el.style.animation = 'none';
    void el.offsetWidth; // trigger reflow
    el.style.animation = 'cinematicTitleIn 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      el.style.display = 'none';
    }, 2450);
  };

  window.showGateAnnouncement = function(currentGate, totalGates) {
    const el = document.getElementById('adv-gate-announce');
    if (!el) return;
    const textEl = document.getElementById('adv-gate-announce-text');
    if (textEl) textEl.textContent = `KNOWLEDGE GATE ${currentGate} / ${totalGates}`;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth; // trigger reflow
    el.style.animation = 'gateAnnounceIn 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      el.style.display = 'none';
    }, 2250);
  };

  // Initialize Title Screen Background & State on load
  if (typeof window.initTitleBackground === 'function') {
    window.initTitleBackground();
  }
  if (typeof window.updateTitleScreenState === 'function') {
    window.updateTitleScreenState();
  }

})(window);
