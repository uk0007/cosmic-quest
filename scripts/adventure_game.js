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
        opacity: 0.18
      });
      this.planet = new THREE.Mesh(geo, mat);
      this.planet.position.set(380, 180, -350);
      this.scene.add(this.planet);

      // Planet Ring
      const ringGeo = new THREE.RingGeometry(85, 110, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
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
        this.planet.position.x = 380 - this.scrollOffset * 0.05;
        this.planet.rotation.y += 0.003;
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
     2. ADVENTURE GAME STATE & BRIDGES
     ======================================================== */
  const AdventureState = {
    energy: 100,
    maxEnergy: 100,
    bones: 0,
    totalBonesInLevel: 10,
    score: 0,
    streak: 0,
    checkpointX: 120,
    checkpointY: 340,
    gatesTotal: 3,
    gatesCleared: 0,
    activeGateIndex: -1,
    activeQuestion: null,
    gateTimerInterval: null,
    gateTimerSecs: 60,
    capsuleCountdownInterval: null,
    isPaused: false,

    reset() {
      this.energy = 100;
      this.bones = 0;
      this.score = 0;
      this.streak = 0;
      this.checkpointX = 120;
      this.checkpointY = 340;
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
      const scoreEl = document.getElementById('adv-score-text');
      const streakEl = document.getElementById('adv-streak-text');

      if (fillEl) {
        const pct = (this.energy / this.maxEnergy) * 100;
        fillEl.style.width = `${pct}%`;
        fillEl.style.background = pct > 50 
          ? 'linear-gradient(90deg, #10b981, #34d399)' 
          : (pct > 25 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #f43f5e, #fb7185)');
      }
      if (textEl) textEl.textContent = `${this.energy}/${this.maxEnergy}`;
      if (bonesEl) bonesEl.textContent = `${this.bones}`;
      if (scoreEl) scoreEl.textContent = `${this.score.toLocaleString()} PTS`;
      if (streakEl) streakEl.textContent = `${this.streak} Streak`;
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
     3. PHASER 3 ADVENTURE SCENES
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

      // Environment
      this.load.image('ground_1', p + 'ground_1.png');
      this.load.image('platform', p + 'platform.png');
      this.load.image('tree_1', p + 'tree_1.png');
      this.load.image('tree_2', p + 'tree_2.png');
      this.load.image('rock_1', p + 'rock_1.png');
      this.load.image('stone_1', p + 'stone_1.png');
      this.load.image('mountains', p + 'mountains.png');
      this.load.image('cloud', p + 'cloud.png');
      this.load.image('gate_door', p + 'gate_door.png');
      this.load.image('bone', p + 'bone.png');
      this.load.image('crystal', p + 'crystal.png');
      this.load.image('rune_stone', p + 'rune_stone.png');
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

      this.scene.start('AdventureLevelScene');
    }
  }

  class AdventureLevelScene extends Phaser.Scene {
    constructor() {
      super({ key: 'AdventureLevelScene' });
    }

    create() {
      window.currentAdventureScene = this;
      AdventureState.reset();

      const levelWidth = 2800;
      const levelHeight = 600;

      this.physics.world.setBounds(0, 0, levelWidth, levelHeight);

      // 1. Background Parallax Decor
      this.mountains = this.add.tileSprite(0, 320, levelWidth, 380, 'mountains').setOrigin(0, 0).setScrollFactor(0.25).setAlpha(0.65);
      this.add.image(400, 120, 'cloud').setScrollFactor(0.35).setScale(0.7).setAlpha(0.6);
      this.add.image(1100, 90, 'cloud').setScrollFactor(0.35).setScale(0.85).setAlpha(0.55);
      this.add.image(1900, 140, 'cloud').setScrollFactor(0.35).setScale(0.75).setAlpha(0.6);

      // Scenic Trees & Rune Stones
      this.add.image(280, 340, 'tree_1').setScale(0.65).setScrollFactor(0.8);
      this.add.image(950, 340, 'tree_2').setScale(0.6).setScrollFactor(0.8);
      this.add.image(1750, 340, 'tree_1').setScale(0.7).setScrollFactor(0.8);
      this.add.image(580, 430, 'rock_1').setScale(0.6).setScrollFactor(1.0);
      this.add.image(1380, 430, 'stone_1').setScale(0.7).setScrollFactor(1.0);
      this.add.image(2100, 410, 'rune_stone').setScale(0.75).setScrollFactor(1.0);

      // 2. Platforms & Terrain (Arcade Static Group)
      this.platforms = this.physics.add.staticGroup();

      // Main Floor (segmented ground)
      for (let x = 0; x < levelWidth; x += 600) {
        const g = this.platforms.create(x + 300, 560, 'ground_1').setScale(0.8, 0.6).refreshBody();
        // Adjust ground body
        g.body.setSize(g.displayWidth, 80);
        g.body.setOffset(0, 40);
      }

      // Stepping Platforms
      const platformSpots = [
        { x: 420, y: 400 },
        { x: 920, y: 380 },
        { x: 1180, y: 310 },
        { x: 1680, y: 390 },
        { x: 1960, y: 320 }
      ];
      platformSpots.forEach(p => {
        const plat = this.platforms.create(p.x, p.y, 'platform').setScale(0.4, 0.35).refreshBody();
        plat.body.setSize(plat.displayWidth * 0.9, 30);
      });

      // 3. Dog Player
      this.dog = this.physics.add.sprite(AdventureState.checkpointX, AdventureState.checkpointY, 'dog_idle');
      this.dog.setScale(0.85);
      this.dog.body.setSize(95, 80);
      this.dog.body.setOffset(38, 48);
      this.dog.setCollideWorldBounds(true);
      this.dog.setBounce(0.04);
      this.dog.play('dog-idle');

      this.physics.add.collider(this.dog, this.platforms);

      // Coyote time & Jump buffer state
      this.canJumpUntil = 0;
      this.jumpBufferedUntil = 0;
      this.isSniffing = false;

      // 4. Collectibles (Bones & Crystals)
      this.bonesGroup = this.physics.add.group({ allowGravity: false });
      const bonePositions = [
        { x: 260, y: 460 },
        { x: 420, y: 340 },
        { x: 620, y: 460 },
        { x: 920, y: 320 },
        { x: 1180, y: 250 },
        { x: 1350, y: 460 },
        { x: 1680, y: 330 },
        { x: 1960, y: 260 },
        { x: 2150, y: 460 },
        { x: 2500, y: 460 }
      ];
      bonePositions.forEach(bp => {
        const b = this.bonesGroup.create(bp.x, bp.y, 'bone').setScale(1.1);
        b.initialY = bp.y;
      });

      this.crystalsGroup = this.physics.add.group({ allowGravity: false });
      const crystalPositions = [
        { x: 480, y: 340 },
        { x: 1240, y: 250 },
        { x: 2020, y: 260 }
      ];
      crystalPositions.forEach(cp => {
        const c = this.crystalsGroup.create(cp.x, cp.y, 'crystal').setScale(0.7);
        c.initialY = cp.y;
      });

      this.physics.add.overlap(this.dog, this.bonesGroup, (dog, bone) => this.collectBone(bone));
      this.physics.add.overlap(this.dog, this.crystalsGroup, (dog, crystal) => this.collectCrystal(crystal));

      // 5. Knowledge Gates (3 physical gates)
      this.gates = [];
      const gateLocations = [780, 1540, 2340];
      gateLocations.forEach((gx, idx) => {
        const gate = this.physics.add.staticSprite(gx, 430, 'gate_door').setScale(0.45).refreshBody();
        gate.body.setSize(60, 140);
        gate.gateIndex = idx;
        gate.isLocked = true;
        this.gates.push(gate);
      });

      this.physics.add.overlap(this.dog, this.gates, (dog, gate) => {
        if (gate.isLocked && !AdventureState.isPaused) {
          this.triggerGateArrival(gate);
        }
      });

      // 6. Level Finish Portal (at x = 2700)
      this.finishPortal = this.physics.add.staticSprite(2700, 420, 'rune_stone').setScale(1.1).refreshBody();
      this.finishPortal.setTint(0x38bdf8);
      this.physics.add.overlap(this.dog, this.finishPortal, () => this.triggerVictory());

      // 7. Camera follow
      this.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
      this.cameras.main.startFollow(this.dog, true, 0.08, 0.08, -80, 40);

      // 8. Input Keys
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
        window.setSparkyMessage(`🌟 <strong>Brilliant Answer!</strong> Gate #${AdventureState.activeGateIndex + 1} unlocked! Keep rocking! 🚀`);
      }
    } else {
      clickedBtn.classList.add('wrong');
      allBtns[q.answerIndex]?.classList.add('correct');
      AdventureState.streak = 0;
      AdventureState.modifyEnergy(-15);

      if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
      if (window.setSparkyMessage) {
        window.setSparkyMessage(`💪 <strong>Good Try!</strong> The correct answer was <strong>${q.options[q.answerIndex]}</strong>.`);
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

    if (window.Sound && window.Sound.playWrong) window.Sound.playWrong();
    if (window.setSparkyMessage) {
      window.setSparkyMessage(`⏰ <strong>Time's Up!</strong> Gate unlocked, let's keep adventuring!`);
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
    textEl.textContent = q.explanation || "Reviewing this concept strengthens your Olympiad knowledge!";

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

    document.getElementById('adv-stat-bones').textContent = `${AdventureState.bones}/${AdventureState.totalBonesInLevel}`;
    document.getElementById('adv-stat-gates').textContent = `${AdventureState.gatesCleared}/${AdventureState.gatesTotal}`;
    document.getElementById('adv-stat-energy').textContent = `${AdventureState.energy}%`;
    document.getElementById('adv-stat-score').textContent = `${AdventureState.score.toLocaleString()} PTS`;

    // Calculate stars
    const starsEl = document.getElementById('adv-victory-stars');
    let starCount = 1;
    if (AdventureState.energy >= 60 && AdventureState.bones >= 6) starCount = 3;
    else if (AdventureState.energy >= 30) starCount = 2;

    starsEl.innerHTML = '';
    for (let s = 1; s <= 3; s++) {
      starsEl.innerHTML += `<span class="star-icon ${s <= starCount ? 'filled' : ''}">⭐</span>`;
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

    startAdventure() {
      if (window.showScreen) {
        window.showScreen('screen-adventure');
      }

      // Initialize Three.js celestial background
      if (!window.AdventureBackground3D) {
        window.AdventureBackground3D = new Background3D('adventure-three-canvas');
      }

      // Initialize Phaser 3 game if not yet created
      if (!this.game) {
        const config = {
          type: Phaser.AUTO,
          parent: 'phaser-game-container',
          transparent: true,
          width: 960,
          height: 560,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
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
        // Restart scene cleanly
        this.game.scene.start('AdventureLevelScene');
      }
    }
  };

})(window);
