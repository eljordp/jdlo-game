import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';

/**
 * Cinematic Vegas scene — JP flies out with Malachi for business.
 * He realizes people closing million-dollar deals are asking HIM for advice.
 * Step-based cutscene, same pattern as CourtScene / ReleaseScene.
 */
export class VegasScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super({ key: 'VegasScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];

    MusicSystem.stop();
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Cinema letterbox bars
    this.add.rectangle(GAME_WIDTH / 2, 35, GAME_WIDTH, 70, 0x000000).setScrollFactor(0).setDepth(200);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 35, GAME_WIDTH, 70, 0x000000).setScrollFactor(0).setDepth(200);

    this.input.keyboard!.on('keydown-SPACE', () => this.advance());
    this.input.keyboard!.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());

    this.time.delayedCall(500, () => this.playStep());
  }

  private advance() {
    if (this.canAdvance) {
      this.canAdvance = false;
      this.currentStep++;
      this.clearAll();
      this.playStep();
    }
  }

  private clearAll() {
    for (const t of this.textObjects) t.destroy();
    for (const o of this.sceneObjects) o.destroy();
    for (const tw of this.activeTweens) tw.remove();
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];
  }

  private addObj<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.sceneObjects.push(obj);
    return obj;
  }

  private addTween(config: Phaser.Types.Tweens.TweenBuilderConfig): Phaser.Tweens.Tween {
    const tw = this.tweens.add(config);
    this.activeTweens.push(tw);
    return tw;
  }

  private showText(
    text: string,
    y: number,
    options: { size?: string; color?: string; delay?: number; x?: number } = {}
  ) {
    const { size = '14px', color = '#ffffff', delay = 0, x = GAME_WIDTH / 2 } = options;
    const t = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size,
      color,
      wordWrap: { width: GAME_WIDTH - 100 },
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.addTween({ targets: t, alpha: 1, duration: 400, delay });
    this.textObjects.push(t);
    return t;
  }

  private showContinue(delay = 1500) {
    this.time.delayedCall(delay, () => {
      if (this.scene.isActive()) {
        const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '▼', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '12px',
          color: '#666688',
        }).setOrigin(0.5).setDepth(100);
        this.addTween({
          targets: hint,
          alpha: 0.3,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });
        this.textObjects.push(hint);
        this.canAdvance = true;
      }
    });
  }

  // ---------------------------------------------------------------
  // Environment builders
  // ---------------------------------------------------------------

  /** Night sky with neon strip lights */
  private makeStrip() {
    // Dark night sky
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a14)
    );

    // Road at bottom
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, GAME_WIDTH, 120, 0x222228)
    );
    // Road lane markings
    for (let x = 40; x < GAME_WIDTH; x += 140) {
      this.addObj(
        this.add.rectangle(x, GAME_HEIGHT - 80, 60, 4, 0x444450).setAlpha(0.6)
      );
    }

    // Neon lights scattered across upper half — buildings silhouettes
    const neonColors = [0xff0066, 0x00ffcc, 0xffcc00, 0xff4400, 0x9900ff, 0x00aaff];
    const buildings = [
      { x: 80, w: 100, h: 280 },
      { x: 220, w: 80, h: 340 },
      { x: 360, w: 120, h: 260 },
      { x: 520, w: 90, h: 380 },
      { x: 660, w: 110, h: 300 },
      { x: 800, w: 70, h: 350 },
      { x: 920, w: 130, h: 270 },
      { x: 1080, w: 80, h: 320 },
      { x: 1200, w: 100, h: 290 },
    ];

    for (const b of buildings) {
      const baseY = GAME_HEIGHT - 140 - b.h / 2;
      // Building silhouette
      this.addObj(
        this.add.rectangle(b.x, baseY, b.w, b.h, 0x12121e)
      );

      // Neon sign on each building
      const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
      const signW = b.w * 0.6;
      const signH = 10 + Math.random() * 14;
      const signY = baseY - b.h / 2 + 30 + Math.random() * 60;
      const sign = this.addObj(
        this.add.rectangle(b.x, signY, signW, signH, neonColor).setAlpha(0.8)
      );
      // Pulsing neon
      this.addTween({
        targets: sign,
        alpha: { from: 0.5, to: 1 },
        duration: 400 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 500,
      });

      // Window dots on buildings
      for (let wy = baseY - b.h / 2 + 20; wy < baseY + b.h / 2 - 20; wy += 28) {
        for (let wx = b.x - b.w / 2 + 12; wx < b.x + b.w / 2 - 12; wx += 18) {
          if (Math.random() > 0.4) {
            const windowDot = this.addObj(
              this.add.rectangle(wx, wy, 6, 8, 0xffeeaa).setAlpha(Math.random() * 0.3 + 0.1)
            );
            // Some windows blink
            if (Math.random() > 0.8) {
              this.addTween({
                targets: windowDot,
                alpha: { from: 0.1, to: 0.4 },
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 1000,
              });
            }
          }
        }
      }
    }

    // === NEON STRIP RECTANGLES — 5 colored bars pulsing independently ===
    const stripNeons = [
      { x: 150, w: 70, h: 16, color: 0xff2244 },   // red
      { x: 380, w: 60, h: 12, color: 0x3388ff },   // blue
      { x: 560, w: 80, h: 14, color: 0xf0c040 },   // gold
      { x: 780, w: 55, h: 12, color: 0x33dd66 },   // green
      { x: 1000, w: 65, h: 14, color: 0xff44aa },  // pink
    ];
    for (const sn of stripNeons) {
      const neonY = GAME_HEIGHT - 150;
      // Main neon bar
      const bar = this.addObj(
        this.add.rectangle(sn.x, neonY, sn.w, sn.h, sn.color).setAlpha(0.5)
      );
      this.addTween({
        targets: bar,
        alpha: { from: 0.3, to: 0.7 },
        duration: 800 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 600,
      });
      // Reflection below (lower alpha duplicate)
      const reflection = this.addObj(
        this.add.rectangle(sn.x, neonY + 30, sn.w, sn.h * 0.6, sn.color).setAlpha(0.1)
      );
      this.addTween({
        targets: reflection,
        alpha: { from: 0.05, to: 0.15 },
        duration: 800 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 600,
      });
    }

    // === PASSING CARS — small white circles drifting across ===
    for (let c = 0; c < 3; c++) {
      const carY = GAME_HEIGHT - 75 + Math.random() * 20;
      const car = this.addObj(
        this.add.circle(-20 - c * 200, carY, 4, 0xffffff, 0.5)
      );
      this.addTween({
        targets: car,
        x: GAME_WIDTH + 40,
        duration: 6000 + Math.random() * 4000,
        delay: c * 2000,
        ease: 'Linear',
        repeat: -1,
      });
    }
  }

  /** Casino floor with slot machines and card tables */
  private makeCasinoFloor() {
    // Dark ornate floor — gold/burgundy scheme
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0e14)
    );
    // Carpet pattern lines — burgundy tint
    for (let x = 0; x < GAME_WIDTH; x += 80) {
      this.addObj(this.add.rectangle(x, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0x2e1420).setAlpha(0.4));
    }
    for (let y = 0; y < GAME_HEIGHT; y += 80) {
      this.addObj(this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 1, 0x2e1420).setAlpha(0.4));
    }

    // Ceiling lights — warm gold spots
    for (let lx = 160; lx < GAME_WIDTH; lx += 280) {
      const glow = this.addObj(
        this.add.circle(lx, 40, 80, 0xf0c040, 0.08)
      );
      this.addTween({
        targets: glow,
        alpha: { from: 0.05, to: 0.12 },
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // === SLOT MACHINE LIGHT ROWS — tiny colored dots flickering ===
    const slotDotColors = [0xff3366, 0xf0c040, 0x33ccff, 0x66ff66, 0xff6600];
    for (const side of [-1, 1]) {
      const baseX = GAME_WIDTH / 2 + side * 380;
      for (let row = 0; row < 4; row++) {
        const sx = baseX + (row % 2) * side * 40;
        const sy = 200 + row * 100;
        // Machine body — burgundy tint
        this.addObj(this.add.rectangle(sx, sy, 36, 50, 0x3a2030));
        // Screen — gold accent
        const screenColor = slotDotColors[Math.floor(Math.random() * slotDotColors.length)];
        const screen = this.addObj(
          this.add.rectangle(sx, sy - 8, 24, 20, screenColor).setAlpha(0.7)
        );
        // Blinking light on top
        const light = this.addObj(
          this.add.circle(sx, sy - 30, 4, 0xff0000, 0.6)
        );
        this.addTween({
          targets: light,
          alpha: { from: 0.3, to: 0.9 },
          duration: 300 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 500,
        });
        // Screen flicker
        this.addTween({
          targets: screen,
          alpha: { from: 0.4, to: 0.9 },
          duration: 500 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
        });

        // Tiny dot rows beneath each machine (slot lights)
        for (let d = 0; d < 5; d++) {
          const dotX = sx - 12 + d * 6;
          const dotY = sy + 20;
          const dotColor = slotDotColors[Math.floor(Math.random() * slotDotColors.length)];
          const dot = this.addObj(
            this.add.circle(dotX, dotY, 2, dotColor, 0.6)
          );
          this.addTween({
            targets: dot,
            alpha: { from: 0, to: 0.8 },
            duration: 200 + Math.random() * 600,
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 1000,
          });
        }
      }
    }

    // Card table — center, gold/burgundy theme
    const tableX = GAME_WIDTH / 2;
    const tableY = GAME_HEIGHT / 2 + 20;
    // Table base (burgundy edge)
    this.addObj(this.add.rectangle(tableX, tableY, 240, 140, 0x5c2030));
    // Green felt
    this.addObj(this.add.rectangle(tableX, tableY, 220, 120, 0x1a6030));
    // Dealer position indicator — gold
    this.addObj(this.add.rectangle(tableX, tableY - 50, 30, 6, 0xf0c040));

    // === CASINO AMBIANCE TEXT — *ding* and *cheer* appearing randomly ===
    const ambTexts = ['*ding*', '*cheer*', '*ding*', '*ding*', '*cheer*'];
    for (let i = 0; i < ambTexts.length; i++) {
      const ax = Math.random() > 0.5 ? 30 + Math.random() * 80 : GAME_WIDTH - 30 - Math.random() * 80;
      const ay = 150 + Math.random() * 300;
      const ambText = this.add.text(ax, ay, ambTexts[i], {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#888888',
      }).setOrigin(0.5).setAlpha(0).setDepth(90);
      this.textObjects.push(ambText);
      // Fade in then out at staggered times
      this.addTween({
        targets: ambText,
        alpha: { from: 0, to: 0.5 },
        y: ay - 15,
        duration: 1200,
        delay: 1000 + i * 1800,
        yoyo: true,
        hold: 600,
        ease: 'Sine.easeInOut',
      });
    }

    return { tableX, tableY };
  }

  /** Conference room — dark wood, chairs, overhead light */
  private makeConferenceRoom() {
    // Dark walls
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x181822)
    );

    // Back wall slightly lighter
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, 200, GAME_WIDTH, 300, 0x1e1e2c)
    );

    // Floor — dark wood tone
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 180, GAME_WIDTH, 360, 0x22201a)
    );

    // Long conference table — pushed down to clear dialogue text
    const tableY = GAME_HEIGHT / 2 + 140;
    // Table shadow
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, tableY + 8, 520, 60, 0x0a0a12).setAlpha(0.5));
    // Table surface (dark wood)
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, tableY, 500, 50, 0x4a3020));
    // Table top highlight
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, tableY - 12, 480, 4, 0x5c3c28).setAlpha(0.6));

    // Chairs around table — small dark rectangles
    const chairPositions = [
      { x: -180, y: -30 }, { x: -80, y: -30 }, { x: 80, y: -30 }, { x: 180, y: -30 }, // far side
      { x: -120, y: 40 }, { x: 0, y: 40 }, { x: 120, y: 40 }, // near side
    ];
    for (const cp of chairPositions) {
      this.addObj(
        this.add.rectangle(GAME_WIDTH / 2 + cp.x, tableY + cp.y, 18, 18, 0x2a2018).setAlpha(0.7)
      );
    }

    // Overhead light (strip)
    const strip = this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, 120, 300, 8, 0xffeedd).setAlpha(0.3)
    );
    this.addTween({
      targets: strip,
      alpha: { from: 0.2, to: 0.4 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Light cone down from fixture
    this.addObj(
      this.add.triangle(
        GAME_WIDTH / 2, 300,
        -120, 200,
        120, 200,
        0, 0,
        0xffeedd, 0.04
      )
    );

    return tableY;
  }

  // ---------------------------------------------------------------
  // Steps
  // ---------------------------------------------------------------

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.currentStep) {
      // ================================================================
      // STEP 0 — The Strip at Night
      // ================================================================
      case 0: {
        this.makeStrip();

        // JP and Malachi walking right along the road, small scale
        const jpY = GAME_HEIGHT - 140;
        const jp = this.addObj(
          this.add.sprite(200, jpY, 'player-ch6', 6).setScale(CHAR_SCALE * 1.3)
        );
        const malachi = this.addObj(
          this.add.sprite(120, jpY, 'npc_malachi', 0).setScale(SCALE * 1.3)
        );

        // Walking animation — move them right slowly
        this.addTween({
          targets: jp,
          x: 340,
          duration: 4000,
          ease: 'Linear',
        });
        this.addTween({
          targets: malachi,
          x: 260,
          duration: 4000,
          ease: 'Linear',
        });

        // Slight bob to simulate walking
        for (const char of [jp, malachi]) {
          this.addTween({
            targets: char,
            y: jpY - 3,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }

        this.showText('Las Vegas. 270 miles from LA.', 120, { size: '16px', delay: 300 });
        this.showText('A whole different world.', 180, { size: '13px', color: '#888899', delay: 1200 });

        this.showContinue(2500);
        break;
      }

      // ================================================================
      // STEP 1 — Casino Floor
      // ================================================================
      case 1: {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.clearAll();

          const { tableX, tableY } = this.makeCasinoFloor();

          // NPCs around the table
          this.addObj(
            this.add.sprite(tableX - 80, tableY - 80, 'npc_suit', 0).setScale(SCALE * 1.3)
          );
          this.addObj(
            this.add.sprite(tableX + 80, tableY - 80, 'npc-business', 0).setScale(SCALE * 1.3)
          );
          this.addObj(
            this.add.sprite(tableX + 120, tableY + 80, 'npc_suit', 4).setScale(SCALE * 1.3)
          );

          // JP and Malachi watching from nearby
          this.addObj(
            this.add.sprite(tableX - 180, tableY + 100, 'player-ch6', 6).setScale(CHAR_SCALE * 1.3)
          );
          this.addObj(
            this.add.sprite(tableX - 240, tableY + 100, 'npc_malachi', 0).setScale(SCALE * 1.3)
          );

          this.cameras.main.fadeIn(600, 0, 0, 0);

          this.showText('Malachi', 100, { size: '12px', color: '#f0c040', delay: 400 });
          this.showText('"This is where the real money moves."', 140, { delay: 600 });

          this.time.delayedCall(1800, () => {
            this.showText('JP', 200, { size: '12px', color: '#f0c040' });
            this.showText('"And they invited us."', 240, { delay: 200 });
          });

          this.showContinue(3000);
        });
        break;
      }

      // ================================================================
      // STEP 2 — The Meeting
      // ================================================================
      case 2: {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.clearAll();

          const tableY = this.makeConferenceRoom();

          // Suited NPCs on far side of table (in chairs)
          this.addObj(
            this.add.sprite(cx - 100, tableY - 60, 'npc_suit', 0).setScale(SCALE * 1.3)
          );
          this.addObj(
            this.add.sprite(cx + 100, tableY - 60, 'npc-business', 0).setScale(SCALE * 1.3)
          );
          this.addObj(
            this.add.sprite(cx, tableY - 60, 'npc_suit', 0).setScale(SCALE * 1.3)
          );

          // JP and Malachi on near side
          this.addObj(
            this.add.sprite(cx - 60, tableY + 80, 'player-ch6', 2).setScale(CHAR_SCALE * 1.3)
          );
          this.addObj(
            this.add.sprite(cx + 60, tableY + 80, 'npc_malachi', 0).setScale(SCALE * 1.3)
          );

          this.cameras.main.fadeIn(600, 0, 0, 0);

          this.showText('Big Player', 80, { size: '12px', color: '#f0c040', delay: 400 });
          this.showText('"That system you built saved us\ntwenty hours a week."', 120, { delay: 600 });

          this.time.delayedCall(2200, () => {
            this.showText('Big Player', 200, { size: '12px', color: '#f0c040' });
            this.showText('"What else can you do?"', 240, { delay: 200 });
          });

          this.time.delayedCall(3800, () => {
            this.showText('JP', 310, { size: '12px', color: '#f0c040' });
            this.showText('"What do you need?"', 350, { delay: 200 });
          });

          this.time.delayedCall(5200, () => {
            this.showText('Big Player', 420, { size: '12px', color: '#f0c040' });
            this.showText('"Someone who sees the whole system.\nNot just pieces."', 460, { delay: 200 });
          });

          this.showContinue(6500);
        });
        break;
      }

      // ================================================================
      // STEP 3 — The Handshake / "Six months ago I was on a tractor"
      // ================================================================
      case 3: {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.clearAll();

          // Same conference room — tighter framing
          this.addObj(
            this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x141420)
          );

          // Subtle overhead light
          this.addObj(
            this.add.circle(cx, 100, 120, 0xffeedd, 0.06)
          );

          // Table closer — wider, fills more of the screen
          const tableRect = this.addObj(this.add.rectangle(cx, cy + 20, 600, 60, 0x4a3020));
          this.addObj(this.add.rectangle(cx, cy + 8, 580, 4, 0x5c3c28).setAlpha(0.5));

          this.cameras.main.fadeIn(400, 0, 0, 0);

          this.showText('They sign.', cy - 140, { size: '16px', delay: 400 });

          // === DEAL MOMENT: Table golden glow pulse + brief white flash ===
          this.time.delayedCall(1200, () => {
            // Golden glow pulse on table
            const tableGlow = this.addObj(
              this.add.rectangle(cx, cy + 20, 620, 70, 0xf0c040).setAlpha(0)
            );
            this.addTween({
              targets: tableGlow,
              alpha: { from: 0, to: 0.25 },
              duration: 600,
              yoyo: true,
              ease: 'Sine.easeInOut',
            });

            // Brief white flash across whole screen
            const flash = this.addObj(
              this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xffffff).setAlpha(0).setDepth(150)
            );
            this.addTween({
              targets: flash,
              alpha: { from: 0, to: 0.15 },
              duration: 200,
              yoyo: true,
              ease: 'Quad.easeOut',
            });
          });

          // === THE CALLBACK — "Six months ago I was on a tractor." ===
          // Earth/vineyard color, shown alone, centered. THE moment.
          this.time.delayedCall(2000, () => {
            const tractorLine = this.add.text(cx, cy - 40, 'Six months ago I was\non a tractor.', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '18px',
              color: '#8b6914',
              align: 'center',
              lineSpacing: 14,
            }).setOrigin(0.5).setAlpha(0).setDepth(100);
            this.textObjects.push(tractorLine);

            this.addTween({
              targets: tractorLine,
              alpha: 1,
              duration: 1500,
              ease: 'Sine.easeIn',
            });
          });

          // 2s pause, then the follow-up in gold
          this.time.delayedCall(5500, () => {
            const nowLine = this.add.text(cx, cy + 50, "Now he's in a conference room\non the strip.", {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '14px',
              color: '#f0c040',
              align: 'center',
              lineSpacing: 10,
            }).setOrigin(0.5).setAlpha(0).setDepth(100);
            this.textObjects.push(nowLine);

            this.addTween({
              targets: nowLine,
              alpha: 1,
              duration: 1000,
              ease: 'Sine.easeIn',
            });
          });

          // Another pause, then final line
          this.time.delayedCall(8000, () => {
            const closingLine = this.add.text(cx, cy + 120, 'Closing deals with people\nwho do this every day.', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '13px',
              color: '#f0c040',
              align: 'center',
              lineSpacing: 10,
            }).setOrigin(0.5).setAlpha(0).setDepth(100);
            this.textObjects.push(closingLine);

            this.addTween({
              targets: closingLine,
              alpha: 1,
              duration: 1000,
              ease: 'Sine.easeIn',
            });
          });

          // Slow subtle zoom for weight
          this.addTween({
            targets: this.cameras.main,
            zoom: 1.02,
            duration: 12000,
            ease: 'Sine.easeInOut',
          });

          // Hold 3 seconds after last line before allowing advance
          this.showContinue(12000);
        });
        break;
      }

      // ================================================================
      // STEP 4 — Walking Out
      // ================================================================
      case 4: {
        // Reset camera zoom before fade
        this.cameras.main.zoom = 1;
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.clearAll();

          // Dark exterior
          this.addObj(
            this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0c0c18)
          );

          // Neon glow from buildings — colored rectangles along the top (neon returns)
          const glowColors = [0xff2244, 0x3388ff, 0xf0c040, 0x33dd66, 0xff44aa];
          for (let i = 0; i < 8; i++) {
            const gx = 100 + i * 160;
            const color = glowColors[i % glowColors.length];
            // Building shape
            const bh = 200 + Math.random() * 150;
            this.addObj(
              this.add.rectangle(gx, GAME_HEIGHT / 2 - bh / 2 + 100, 80, bh, 0x10101c)
            );
            // Neon edge glow
            const glow = this.addObj(
              this.add.rectangle(gx, GAME_HEIGHT / 2 - bh / 2 + 130, 4, bh * 0.6, color).setAlpha(0.5)
            );
            this.addTween({
              targets: glow,
              alpha: { from: 0.3, to: 0.7 },
              duration: 1500 + Math.random() * 1000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
            // Neon reflection on ground
            const ref = this.addObj(
              this.add.rectangle(gx, GAME_HEIGHT - 40, 30, 6, color).setAlpha(0.08)
            );
            this.addTween({
              targets: ref,
              alpha: { from: 0.04, to: 0.12 },
              duration: 1500 + Math.random() * 1000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          }

          // Ground
          this.addObj(
            this.add.rectangle(cx, GAME_HEIGHT - 60, GAME_WIDTH, 120, 0x1a1a24)
          );

          // JP and Malachi walking — start left, move right
          const walkY = GAME_HEIGHT - 120;
          const jp = this.addObj(
            this.add.sprite(300, walkY, 'player-ch6', 6).setScale(CHAR_SCALE * 1.3)
          ) as Phaser.GameObjects.Sprite;
          const malachi = this.addObj(
            this.add.sprite(220, walkY, 'npc_malachi', 0).setScale(SCALE * 1.3)
          );

          // Walk slowly — then JP pauses and looks back
          this.addTween({
            targets: jp,
            x: 480,
            duration: 5000,
            ease: 'Linear',
            onComplete: () => {
              // JP pauses — Malachi keeps walking
              // Turn JP to face left (look back)
              if (jp && jp.active) {
                (jp as Phaser.GameObjects.Sprite).setFrame(4);
                // Hold the look-back for 1.5s, then turn and keep walking
                this.time.delayedCall(1500, () => {
                  if (jp && jp.active) {
                    (jp as Phaser.GameObjects.Sprite).setFrame(6);
                    this.addTween({
                      targets: jp,
                      x: 600,
                      duration: 3000,
                      ease: 'Linear',
                    });
                  }
                });
              }
            },
          });
          this.addTween({
            targets: malachi,
            x: 520,
            duration: 8000,
            ease: 'Linear',
          });
          // Walking bob
          for (const char of [jp, malachi]) {
            this.addTween({
              targets: char,
              y: walkY - 3,
              duration: 300,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          }

          this.cameras.main.fadeIn(800, 0, 0, 0);

          this.showText('Malachi', 100, { size: '12px', color: '#f0c040', delay: 600 });
          this.showText('"You know what\'s crazy?\nA year ago you were in a cell."', 140, { delay: 800 });

          this.time.delayedCall(2800, () => {
            this.showText('JP', 240, { size: '12px', color: '#f0c040' });
            this.showText('"I know."', 280, { delay: 200 });
          });

          this.time.delayedCall(4200, () => {
            this.showText('Malachi', 350, { size: '12px', color: '#f0c040' });
            this.showText('"Now look at us."', 390, { delay: 200 });
          });

          this.time.delayedCall(6000, () => {
            this.showText("JP's Mind", 470, { size: '12px', color: '#f0c040' });
            this.showText('"He\'s right. But I\'m not done yet."', 510, {
              color: '#aaaacc',
              delay: 300,
            });
          });

          // === TRANSITION: Neon fades, stars appear, fade to warm golden ===
          this.time.delayedCall(8500, () => {
            if (this.scene.isActive()) {
              // Fade neon elements down
              for (const obj of this.sceneObjects) {
                if (obj && obj.active) {
                  this.tweens.add({
                    targets: obj,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Sine.easeOut',
                  });
                }
              }

              // Stars appearing
              for (let s = 0; s < 20; s++) {
                const star = this.add.circle(
                  Math.random() * GAME_WIDTH,
                  Math.random() * (GAME_HEIGHT * 0.5),
                  1 + Math.random(),
                  0xffffff,
                  0
                ).setDepth(90);
                this.tweens.add({
                  targets: star,
                  alpha: { from: 0, to: 0.4 + Math.random() * 0.4 },
                  duration: 1500,
                  delay: Math.random() * 1000,
                  ease: 'Sine.easeIn',
                });
              }

              // Warm golden overlay fading in
              const goldenOverlay = this.add.rectangle(
                cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xc89830
              ).setAlpha(0).setDepth(180);
              this.tweens.add({
                targets: goldenOverlay,
                alpha: 0.6,
                duration: 2500,
                delay: 1500,
                ease: 'Sine.easeIn',
                onComplete: () => {
                  this.scene.start('HomeReturnScene');
                },
              });
            }
          });

          this.showContinue(7500);
        });
        break;
      }
    }
  }
}
