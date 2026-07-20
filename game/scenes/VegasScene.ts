import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { CasinoSystem } from '../systems/CasinoSystem';
import { BalanceSystem } from '../systems/BalanceSystem';

/**
 * Cinematic Vegas scene — a real trip where party access, owners, women,
 * introductions and business conversations keep colliding until sunrise.
 */
export class VegasScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private penthousePick: 'company' | 'floor' | 'supercar' | null = null;
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

    MusicSystem.play('vegas');
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

  private hasTextureFrame(textureKey: string, frame: number): boolean {
    const texture = this.textures.get(textureKey);
    const frames = (texture as unknown as { frames?: Record<string, unknown> } | undefined)?.frames;
    return Boolean(frames?.[String(frame)]);
  }

  private addVegasSprite(
    x: number,
    y: number,
    textureKey: string,
    preferredFrame = 0,
  ): Phaser.GameObjects.Sprite {
    const frame = this.hasTextureFrame(textureKey, preferredFrame) ? preferredFrame : 0;
    return this.add.sprite(x, y, textureKey, frame);
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

  private addMovingCrowd(y: number, count: number, scale = 1): void {
    const textures = ['npc_generic', 'npc_female', 'npc_suit', 'npc-business', 'npc_bikini1', 'npc_bikini2'];
    for (let i = 0; i < count; i++) {
      const x = 70 + (i * (GAME_WIDTH - 140)) / Math.max(1, count - 1);
      const texture = textures[i % textures.length];
      const frame = i % 2 ? 4 : 0;
      const sprite = this.addObj(
        this.addVegasSprite(x, y + (i % 3) * 26, texture, frame)
          .setScale(SCALE * scale).setDepth(35 + (i % 3))
      );
      this.addTween({
        targets: sprite,
        y: sprite.y - (5 + (i % 4) * 2),
        x: sprite.x + ((i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 5)),
        angle: i % 2 === 0 ? 2 : -2,
        duration: 500 + (i % 5) * 130,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private addDealExchange(x: number, y: number, label: string, rightTexture = 'npc_female'): void {
    const left = this.addObj(this.addVegasSprite(x - 38, y, 'npc_suit', 6).setScale(SCALE * 1.02).setDepth(72));
    const right = this.addObj(this.addVegasSprite(x + 38, y, rightTexture, 4).setScale(SCALE * 1.02).setDepth(72));
    const phone = this.addObj(this.add.rectangle(x, y - 5, 13, 21, 0x9ed8ff).setStrokeStyle(3, 0x1c3040).setDepth(74));
    const tag = this.addObj(this.add.text(x, y - 48, label, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#f0c040',
      backgroundColor: '#101018', padding: { x: 5, y: 3 },
    }).setOrigin(0.5).setDepth(75));
    this.addTween({ targets: phone, x: x + 18, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.addTween({ targets: [left, right, tag], y: '-=3', duration: 800, yoyo: true, repeat: -1 });
  }

  private makeDayclub(): void {
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x58b9e8));
    this.addObj(this.add.circle(GAME_WIDTH - 120, 105, 58, 0xffe06a, 0.95));
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 115, GAME_WIDTH, 260, 0xf1dfc2));
    const pool = this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 120, 760, 210, 0x159bd1));
    pool.setStrokeStyle(10, 0xf5f1e8, 1);
    for (let y = GAME_HEIGHT - 195; y <= GAME_HEIGHT - 55; y += 34) {
      const ripple = this.addObj(this.add.rectangle(GAME_WIDTH / 2, y, 650, 4, 0x8ee8ff, 0.32));
      this.addTween({ targets: ripple, scaleX: 0.88, alpha: 0.12, duration: 1300, yoyo: true, repeat: -1 });
    }
    // Cabanas and bottle-service tables.
    for (const x of [130, 310, GAME_WIDTH - 310, GAME_WIDTH - 130]) {
      this.addObj(this.add.rectangle(x, 165, 150, 90, 0xffffff, 0.88));
      this.addObj(this.add.rectangle(x, 118, 170, 12, 0xf0c040));
      this.addObj(this.add.rectangle(x, 205, 90, 18, 0x6c8f9d));
    }
    // Swimmers and the crowd never stand still.
    for (let i = 0; i < 6; i++) {
      const swimmer = this.addObj(this.add.circle(360 + i * 110, GAME_HEIGHT - 125 + (i % 2) * 55, 11, i % 2 ? 0xe5ad7b : 0x9f6f50));
      this.addTween({ targets: swimmer, x: swimmer.x + 55, duration: 1800 + i * 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    // Crowd on the pool deck, below the text zone
    this.addMovingCrowd(330, 12, 1.05);

    // ── The money layer: this is a Vegas dayclub, not a community pool ──
    // DJ stage at the head of the pool with a daylight LED wall
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, 258, 300, 60, 0x1a1e28).setDepth(30));
    for (let p = 0; p < 6; p++) {
      const panel = this.addObj(this.add.rectangle(GAME_WIDTH / 2 - 125 + p * 50, 246, 44, 26,
        [0xff44aa, 0x22ccee, 0xf0c040][p % 3], 0.7).setDepth(31));
      this.addTween({ targets: panel, alpha: 0.25, duration: 400 + (p % 3) * 180, yoyo: true, repeat: -1, delay: p * 90 });
    }
    this.addObj(this.add.sprite(GAME_WIDTH / 2, 236, 'npc_generic', 0).setScale(SCALE).setTint(0x14181f).setDepth(32));

    // Bottle-service procession: staff crossing the deck with sparklers
    const bottleGirl = this.addObj(this.add.sprite(-30, 322, 'npc_bikini2', 0).setScale(SCALE * 1.05).setDepth(36));
    const bottle = this.addObj(this.add.rectangle(-30, 300, 8, 18, 0x2a4a2a).setDepth(37));
    const sparkler = this.addObj(this.add.circle(-30, 288, 5, 0xfff0a0, 0.95).setDepth(38));
    this.addTween({ targets: [bottleGirl, bottle, sparkler], x: `+=${GAME_WIDTH + 60}`, duration: 9000, repeat: -1, repeatDelay: 2500 });
    this.addTween({ targets: sparkler, alpha: 0.3, scaleX: 1.6, scaleY: 1.6, duration: 120, yoyo: true, repeat: -1 });

    // Floating daybeds in the pool — nobody swims laps at Marquee
    for (const fx of [GAME_WIDTH / 2 - 200, GAME_WIDTH / 2 + 170]) {
      const bed = this.addObj(this.add.rectangle(fx, GAME_HEIGHT - 130, 90, 44, 0xf5f1e8, 0.95).setDepth(34));
      const bedTowel = this.addObj(this.add.rectangle(fx, GAME_HEIGHT - 130, 70, 26, 0xf0c040, 0.9).setDepth(35));
      this.addTween({ targets: [bed, bedTowel], y: '+=6', angle: 2, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Gold umbrellas over the cabana row
    for (const x of [130, 310, GAME_WIDTH - 310, GAME_WIDTH - 130]) {
      this.addObj(this.add.triangle(x, 96, 0, 26, 42, 0, 84, 26, 0xd8a832).setOrigin(0.5, 0.5).setDepth(33));
    }
  }

  private makeNightclub(name: string, color: number, chandelier = false): void {
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070711));
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 130, GAME_WIDTH, 300, 0x16101f));
    this.addObj(this.add.text(GAME_WIDTH / 2, 100, name, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: Phaser.Display.Color.IntegerToColor(color).rgba,
    }).setOrigin(0.5).setDepth(40));

    if (chandelier) {
      // Ring sits below the title so OMNIA stays readable
      const ring = this.addObj(this.add.circle(GAME_WIDTH / 2, 245, 110, 0x000000, 0).setStrokeStyle(12, 0xf0c040, 0.8));
      this.addTween({ targets: ring, angle: 360, duration: 7000, repeat: -1, ease: 'Linear' });
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18;
        const light = this.addObj(this.add.circle(GAME_WIDTH / 2 + Math.cos(angle) * 110, 245 + Math.sin(angle) * 45, 5, 0xffe18a, 0.8));
        this.addTween({ targets: light, alpha: 0.2, duration: 250 + (i % 5) * 90, yoyo: true, repeat: -1 });
      }
    } else {
      // Marquee's signature: the giant LED wall behind the booth, whole panels
      // strobing patterns while lasers cut over the crowd.
      const panelColors = [color, 0xffffff, 0x8844ff, 0x22ccee];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
          const px = GAME_WIDTH / 2 - 315 + col * 70;
          const py = 140 + row * 48;
          const panel = this.addObj(this.add.rectangle(px, py, 62, 40,
            panelColors[(row + col) % panelColors.length], 0.5));
          this.addTween({
            targets: panel,
            alpha: { from: 0.15, to: 0.85 },
            duration: 350 + ((row * 10 + col) % 7) * 120,
            yoyo: true,
            repeat: -1,
            delay: ((col + row) % 5) * 140,
          });
        }
      }
      // DJ booth silhouette in front of the wall
      this.addObj(this.add.rectangle(GAME_WIDTH / 2, 330, 190, 55, 0x0a0a12));
      this.addObj(this.add.sprite(GAME_WIDTH / 2, 305, 'npc_generic', 0).setScale(SCALE * 1.1).setTint(0x111122));
      for (let i = 0; i < 4; i++) {
        const laser = this.addObj(this.add.rectangle(GAME_WIDTH / 2, 185, GAME_WIDTH * 0.92, 3, i % 2 ? color : 0x33bbee, 0.3).setAngle(-24 + i * 16));
        this.addTween({ targets: laser, angle: laser.angle + 14, alpha: 0.08, duration: 900 + i * 70, yoyo: true, repeat: -1 });
      }
    }
    this.addMovingCrowd(GAME_HEIGHT - 230, 19, 1.08);
    for (let i = 0; i < 32; i++) {
      const confetti = this.addObj(this.add.rectangle(30 + Math.random() * (GAME_WIDTH - 60), 110 + Math.random() * 260, 5, 10, i % 2 ? color : 0xffffff, 0.75));
      this.addTween({ targets: confetti, y: GAME_HEIGHT - 100, angle: 240, duration: 2200 + Math.random() * 2100, repeat: -1, delay: Math.random() * 1800 });
    }
  }

  private makeStripClub(): void {
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x12050b));
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 125, GAME_WIDTH, 260, 0x2b0c18));
    for (const x of [260, GAME_WIDTH / 2, GAME_WIDTH - 260]) {
      this.addObj(this.add.circle(x, 235, 130, 0xd81b58, 0.08));
      this.addObj(this.add.rectangle(x, 300, 8, 330, 0xb7a28a, 0.85));
      const silhouette = this.addObj(this.add.sprite(x + 25, 275, 'npc_bikini1', 0).setScale(SCALE * 1.35).setTint(0x4a172b));
      this.addTween({ targets: silhouette, x: x - 25, angle: 4, duration: 1050, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.addMovingCrowd(GAME_HEIGHT - 190, 12, 1.02);
  }

  private makePenthouse(): void {
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0b1020));
    // Floor-to-ceiling glass and Strip lights far below.
    for (let x = 80; x < GAME_WIDTH; x += 120) {
      this.addObj(this.add.rectangle(x, 250, 100, 340, 0x162946, 0.85).setStrokeStyle(3, 0x56677d, 0.5));
      for (let y = 155; y < 390; y += 45) {
        this.addObj(this.add.rectangle(x - 30 + Math.random() * 60, y, 16, 5, [0xff2266, 0x36cfff, 0xf0c040][Math.floor(Math.random() * 3)], 0.42));
      }
    }
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 110, GAME_WIDTH, 220, 0x29242a));
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 170, 410, 90, 0x4c3840));
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 185, 370, 55, 0x73535e));
    this.addMovingCrowd(GAME_HEIGHT - 205, 9, 1.12);

    // Supercars visible at the private entrance below.
    const c8 = this.addObj(this.add.sprite(230, GAME_HEIGHT - 65, 'car-corvette-c8').setScale(SCALE * 1.08));
    const svj = this.addObj(this.add.sprite(GAME_WIDTH - 230, GAME_HEIGHT - 65, 'car-lambo-svj').setScale(SCALE * 1.08).setFlipX(true));
    this.addTween({ targets: [c8, svj], alpha: { from: 0.78, to: 1 }, duration: 1200, yoyo: true, repeat: -1 });
  }

  // 4:18 AM: one conversation left in the tank. Read the room, spend it right.
  private showPenthouseChoice() {
    const cy = GAME_HEIGHT - 150;
    const defs: Array<{ label: string; pick: 'company' | 'floor' | 'supercar'; color: number; result: string; tag: string }> = [
      { label: 'THE COMPANY GUY', pick: 'company', color: 0x4a5568,
        result: 'Twenty polished minutes. He loves everything. Commits to nothing.', tag: 'VEGAS TALK' },
      { label: 'THE FLOOR OWNER', pick: 'floor', color: 0x30a040,
        result: 'Four unpolished minutes. She asks two hard questions and books Tuesday.', tag: 'FOLLOW-UP SET' },
      { label: 'THE SUPERCAR GUY', pick: 'supercar', color: 0xa03030,
        result: 'The best hour of the night. Photos, toasts, plans. No numbers exchanged.', tag: 'VEGAS TALK' },
    ];

    const buttons: Phaser.GameObjects.GameObject[] = [];
    const choose = (def: typeof defs[number]) => {
      for (const b of buttons) b.destroy();
      this.penthousePick = def.pick;
      this.showText(def.result, cy - 55, { size: '9px', color: def.pick === 'floor' ? '#c8b890' : '#9aa0b0' });
      this.showText(def.tag, cy - 20, { size: '10px', color: def.pick === 'floor' ? '#40c060' : '#8a94a8', delay: 600 });
      this.time.delayedCall(1400, () => {
        this.showText("JP's Mind", 385, { size: '10px', color: '#f0c040' });
        this.showText('"There are rooms you do not know exist until somebody opens the door."', 425, { size: '10px', color: '#d8d8e8', delay: 200 });
      });
      this.showContinue(2600);
    };

    defs.forEach((def, i) => {
      const bx = GAME_WIDTH / 2 + (i - 1) * 265;
      const bg = this.addObj(this.add.rectangle(bx, cy, 245, 46, def.color).setDepth(120)
        .setInteractive({ useHandCursor: true }));
      const label = this.addObj(this.add.text(bx, cy, def.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(121));
      bg.on('pointerover', () => bg.setAlpha(0.85));
      bg.on('pointerout', () => bg.setAlpha(1));
      bg.on('pointerdown', () => choose(def));
      buttons.push(bg, label);
    });
    // Keyboard/gamepad fallback: 1/2/3 pick the three owners.
    const kb = this.input.keyboard!;
    const keys = [
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];
    keys.forEach((k, i) => k.once('down', () => { keys.forEach(x => x.removeAllListeners()); choose(defs[i]); }));
  }

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.currentStep) {
      case 0: {
        this.makeStrip();
        const c8 = this.addObj(this.add.sprite(-120, GAME_HEIGHT - 92, 'car-corvette-c8').setScale(SCALE * 1.05).setFlipX(true));
        const svj = this.addObj(this.add.sprite(-280, GAME_HEIGHT - 65, 'car-lambo-svj').setScale(SCALE * 1.05).setFlipX(true));
        this.addTween({ targets: c8, x: GAME_WIDTH + 150, duration: 5200, repeat: -1, ease: 'Linear' });
        this.addTween({ targets: svj, x: GAME_WIDTH + 150, duration: 4300, delay: 900, repeat: -1, ease: 'Linear' });
        this.showText('LAS VEGAS', 115, { size: '20px', color: '#f0c040', delay: 250 });
        this.showText('Not a future vision. This trip happened.', 165, { size: '12px', color: '#c4c4d4', delay: 900 });
        this.showText('Tony. Patrick. Dan. Same crew every time — and it\'s always lit.', 220, { size: '11px', color: '#e8d8b0', delay: 1500 });
        this.showText('Every stop was party, women, owners—and somebody talking business.', 270, { size: '10px', color: '#aaaacc', delay: 2200 });
        this.showText('Text from Nolan: "you\'re in MY city and didn\'t tell me?? pull up to the new house tomorrow."', 320, { size: '9px', color: '#88aacc', delay: 2900 });
        this.showText('The frat house kid bought a house out here. The shirt store JP built him did that.', 365, { size: '9px', color: '#7788aa', delay: 3600 });
        if (ChoiceLedger.get('vegas_invite') === 'Stayed and stacked') {
          this.showText('You would\'ve stayed home. He booked it anyway.', 410, { size: '9px', color: '#8888aa', delay: 4200 });
        }
        this.showContinue(5000);
        break;
      }
      case 1: {
        this.makeDayclub();
        this.addDealExchange(225, 425, 'INTRO MADE', 'npc_bikini2');
        this.addDealExchange(GAME_WIDTH - 225, 425, 'NUMBER SAVED', 'npc-business');
        this.showText('DAYCLUB', 92, { size: '20px', color: '#ffffff', delay: 200 });
        this.showText('Pool. Cabanas. Bottles. Music in full daylight.', 135, { size: '11px', color: '#17445c', delay: 700 });
        this.showText('"We are NOT sleeping this weekend." — Tony, correct as always.', 185, { size: '10px', color: '#0e3346', delay: 1300 });
        this.showText('A bottle-service introduction turned into a business conversation before sunset.', 235, { size: '10px', color: '#17445c', delay: 2000 });
        this.showText('Cabana three isn\'t dancing — she\'s studying the bottle-service margins. Her own pool deck by 30.', 278, { size: '8px', color: '#1d5570', delay: 2800 });
        this.showContinue(4100);
        break;
      }
      case 2: {
        this.makeNightclub('MARQUEE', 0x22ccee);
        this.addDealExchange(GAME_WIDTH - 190, 255, 'TERMS TALKED', 'npc_female');
        this.showText('The LED wall swallowed the whole room.', 410, { size: '12px', delay: 650 });
        this.showText('Patrick\'s wraparound is upstairs — espresso martinis before the club even opened.', 458, { size: '8px', color: '#88bbcc', delay: 1300 });
        this.showText('Women dancing. Owners talking numbers. Contacts changing hands between songs.', 508, { size: '9px', color: '#aaaacc', delay: 2050 });
        this.showText('A guy films crowd reactions for a club owner in Phoenix. Everybody\'s working.', 555, { size: '8px', color: '#7a95a8', delay: 2800 });
        this.showText('JP keeps doing the math: that bottle is a month of Caymus pay. He probably always will.', 607, { size: '8px', color: '#88a0b8', delay: 3500 });
        this.showContinue(4500);
        break;
      }
      case 3: {
        this.makeNightclub('OMNIA', 0xf0c040, true);
        this.addDealExchange(180, 310, 'OFFER MADE', 'npc-business');
        this.addDealExchange(GAME_WIDTH - 180, 310, 'PARTNER INTRO', 'npc_female');
        this.showText('Another line. Another room. Another level.', 345, { size: '12px', delay: 700 });
        this.showText('One introduction became three. Deals kept moving while the chandelier moved.', 400, { size: '10px', color: '#d2c49e', delay: 1400 });
        this.showContinue(3900);
        break;
      }
      case 4: {
        this.makeStripClub();
        this.addDealExchange(GAME_WIDTH - 205, 420, 'DEAL MOVING', 'npc-business');

        // The private room — JP's actual night. Two dancers, a velvet curtain,
        // and the game's rule for moments like this: you don't narrate them.
        const curtainX = GAME_WIDTH - 120;
        this.addObj(this.add.rectangle(curtainX, 300, 90, 200, 0x6b1030).setDepth(30));
        this.addObj(this.add.rectangle(curtainX, 195, 110, 14, 0xc9a44a).setDepth(31));
        this.addObj(this.add.text(curtainX, 218, 'PRIVATE', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#e8b6c8',
        }).setOrigin(0.5).setDepth(31));

        const jpClub = this.addObj(this.add.sprite(GAME_WIDTH / 2 - 60, 430, 'player-ch6', 0).setScale(CHAR_SCALE * 1.1).setDepth(40));
        const dancer1 = this.addObj(this.add.sprite(GAME_WIDTH / 2 - 100, 425, 'npc_bikini1', 0).setScale(SCALE * 1.1).setDepth(40));
        const dancer2 = this.addObj(this.add.sprite(GAME_WIDTH / 2 - 20, 425, 'npc_bikini2', 0).setScale(SCALE * 1.1).setDepth(40));
        // The three of them drift toward the curtain, then it swallows them.
        this.addTween({
          targets: [jpClub, dancer1, dancer2],
          x: `+=${curtainX - (GAME_WIDTH / 2 - 60)}`,
          duration: 3400,
          delay: 2600,
          ease: 'Sine.easeIn',
          onComplete: () => {
            [jpClub, dancer1, dancer2].forEach(s => s.setAlpha(0));
          },
        });

        this.showText('SPEARMINT RHINO', 100, { size: '18px', color: '#ff4d86', delay: 250 });
        this.showText('AFTER HOURS', 128, { size: '8px', color: '#a06478', delay: 500 });
        this.showText('"One more stop." — Dan. It was never one more stop.', 160, { size: '11px', color: '#e0a8bc', delay: 850 });
        this.showText('Two of them picked JP before he sat down. They were not asking.', 200, { size: '10px', color: '#e0a8bc', delay: 1600 });
        this.showText('Dancers working. Owners talking. Cash, smoke, drinks—and business still moving at the table.', 255, { size: '10px', color: '#d8a6b7', delay: 2400 });
        this.showText('One dancer counts between sets, not after. Four more months pays off the nursing degree. She tips the DJ first.', 290, { size: '8px', color: '#b08494', delay: 3200 });
        this.time.delayedCall(6200, () => {
          this.showText('Some parts of the night stay in the room.', 320, { size: '11px', color: '#f0c040' });
        });
        // Dan's law: there is always one more hand. Real cards, real math, real money.
        this.time.delayedCall(6600, () => {
          if (!this.scene.isActive()) return;
          const tbl = this.addObj(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 130, 300, 44, 0x1f6b3a)
            .setDepth(130).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xd4a017));
          const tblText = this.addObj(this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 130, 'HIT THE TABLES WITH DAN', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffffff',
          }).setOrigin(0.5).setDepth(131));
          tbl.on('pointerdown', () => {
            tbl.destroy(); tblText.destroy();
            this.canAdvance = false;
            const before = BalanceSystem.getBalance();
            this.showText('Dan: "One hand. Maybe six. Definitely six."', GAME_HEIGHT - 170, { size: '9px', color: '#e0c890' });
            CasinoSystem.openCasino(this, () => {
              const net = BalanceSystem.getBalance() - before;
              this.showText(
                net > 0
                  ? `Dan: "SEE?! Up $${net}. Walk away RIGHT NOW." They did not walk away right now.`
                  : net < 0
                    ? `Down $${Math.abs(net)}. Dan: "We don't talk about this part of the story."`
                    : 'Broke exactly even. Dan called it "a moral victory." Nobody agreed.',
                GAME_HEIGHT - 170, { size: '9px', color: net > 0 ? '#40c060' : '#c89090' },
              );
              this.showContinue(1800);
            });
          });
        });
        this.showContinue(7000);
        break;
      }
      case 5: {
        this.makePenthouse();
        this.showText('PENTHOUSE — 4:18 AM', 85, { size: '16px', color: '#f0c040', delay: 250 });
        this.showText('One owned companies. One owned the floor. One collected supercars.', 140, { size: '11px', delay: 850 });
        this.showText('JP has juice left for exactly one real conversation before sunrise.', 190, { size: '10px', color: '#aaaacc', delay: 1500 });
        // The three tells. One is real. The loud one isn't.
        this.showText('"Send me a deck sometime." — the company guy, already looking past you', 245, { size: '8px', color: '#8a94a8', delay: 2300 });
        this.showText('"I don\'t do decks. I do Tuesday, 10 AM." — the one who owns the floor', 280, { size: '8px', color: '#c8b890', delay: 2900 });
        this.showText('"You\'re my GUY! We\'re building an APP!" — the supercar collector, hugging you', 315, { size: '8px', color: '#d090a0', delay: 3500 });
        this.time.delayedCall(4300, () => this.showPenthouseChoice());
        break;
      }
      case 6: {
        MusicSystem.transitionTo('vegas-sunrise', 1100);
        this.addObj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x171124));
        this.addObj(this.add.rectangle(cx, GAME_HEIGHT - 120, GAME_WIDTH, 240, 0xd06f48));
        this.addObj(this.add.circle(GAME_WIDTH - 190, GAME_HEIGHT - 160, 78, 0xffd469, 0.9));
        for (let x = 40; x < GAME_WIDTH; x += 90) {
          this.addObj(this.add.rectangle(x, GAME_HEIGHT - 105, 60, 45 + Math.random() * 80, 0x2b2432));
        }
        // The whole crew watches it come up. Nobody says much.
        const jp = this.addObj(this.add.sprite(cx - 96, GAME_HEIGHT - 145, 'player-ch6', 0).setScale(CHAR_SCALE * 1.3));
        const tony = this.addObj(this.add.sprite(cx - 32, GAME_HEIGHT - 145, 'npc-friend', 0).setScale(SCALE * 1.3));
        const patrick = this.addObj(this.add.sprite(cx + 32, GAME_HEIGHT - 145, 'npc-business', 0).setScale(SCALE * 1.3).setTint(0xd8c8b8));
        const dan = this.addObj(this.add.sprite(cx + 96, GAME_HEIGHT - 145, 'npc-tech', 0).setScale(SCALE * 1.3));
        this.addTween({ targets: [jp, tony, patrick, dan], y: GAME_HEIGHT - 149, duration: 1100, yoyo: true, repeat: -1 });
        this.showText('SUNRISE', 105, { size: '18px', color: '#ffd469', delay: 250 });
        this.showText('Tony, Patrick, Dan — quiet for the first time all weekend.', 160, { size: '10px', color: '#d4c4d6', delay: 900 });
        // The night's one real conversation gets its receipt
        this.showText(
          this.penthousePick === 'floor'
            ? '"Tuesday, 10 AM." It held. The rest stayed Vegas talk.'
            : this.penthousePick === 'company'
              ? 'The deck email bounced Monday. Vegas talk.'
              : this.penthousePick === 'supercar'
                ? 'The app never got a name. Great story though.'
                : 'Some became work. Others stayed Vegas talk.',
          215, { size: '9px', color: '#c8b890', delay: 1650 },
        );
        this.showText('The point was not that JP had become one of them overnight.', 262, { size: '11px', delay: 2400 });
        this.showText('The point was that the ceiling moved again.', 315, { size: '12px', color: '#f0c040', delay: 3100 });
        this.showText('Now he knew those rooms were real.', 365, { size: '11px', color: '#d4c4d6', delay: 3800 });
        this.showText('The old JP would have posted every second of this weekend. The phone stayed in his pocket.', 420, { size: '9px', color: '#b8a888', delay: 4700 });
        this.showContinue(6400);
        break;
      }
      default: {
        this.cameras.main.fadeOut(900, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('HomeReturnScene'));
        break;
      }
    }
  }

}
