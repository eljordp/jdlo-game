import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';
import { ChoiceLedger } from '../systems/ChoiceLedger';
import { SoundEffects } from '../systems/SoundEffects';

/**
 * Cinematic LA scene with pixel art animations.
 * Corvette cruising, steak dinner, highrise, reflection.
 */
export class LAScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];
  private deliveryOrder: 'delivery-first' | 'dinner-first' | null = null;

  constructor() {
    super({ key: 'LAScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];
    this.deliveryOrder = null;

    MusicSystem.play('la');
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

  // Vegas invite on rent week — the player owns this one. JP went.
  private showVegasChoice() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT - 150;

    const yesBg = this.addObj(this.add.rectangle(cx - 110, cy, 190, 42, 0x30a040)
      .setInteractive({ useHandCursor: true }));
    const yesText = this.addObj(this.add.text(cx - 110, cy, 'Book it  [SPACE]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5));
    const noBg = this.addObj(this.add.rectangle(cx + 110, cy, 190, 42, 0xa03030)
      .setInteractive({ useHandCursor: true }));
    const noText = this.addObj(this.add.text(cx + 110, cy, 'Stay home  [N]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5));

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    const cleanup = () => {
      yesBg.destroy(); yesText.destroy(); noBg.destroy(); noText.destroy();
      spaceKey.off('down', onYes); nKey.off('down', onNo);
    };
    const onYes = () => {
      cleanup();
      ChoiceLedger.record('vegas_invite', 'Booked the flight');
      SoundEffects.playConfirm();
      this.showText('Booked. Rent is still due Friday.', GAME_HEIGHT - 190, { size: '10px', color: '#f0c040' });
      this.showContinue(1400);
    };
    const onNo = () => {
      cleanup();
      ChoiceLedger.record('vegas_invite', 'Stayed and stacked');
      this.showText('The phone goes face-down. The group chat goes crazy without him.', GAME_HEIGHT - 190, { size: '10px', color: '#aaaacc' });
      this.showContinue(1400);
    };
    yesBg.on('pointerdown', onYes);
    noBg.on('pointerdown', onNo);
    spaceKey.on('down', onYes);
    nKey.on('down', onNo);
  }

  // A gameplay-only pressure choice inside the LA night. The documentary
  // spine stays fixed, but the next scenes remember what the player sacrificed.
  private showDeliveryOrderChoice() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT - 155;

    this.showText('Dinner reservation in 20 minutes. Client delivery still open.', cy - 72, {
      size: '10px', color: '#e8d8b0',
    });

    const deliveryBg = this.addObj(this.add.rectangle(cx - 170, cy, 280, 48, 0x305f8e)
      .setInteractive({ useHandCursor: true }).setDepth(110));
    const deliveryText = this.addObj(this.add.text(cx - 170, cy, 'DELIVER FIRST  [D]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(111));
    const dinnerBg = this.addObj(this.add.rectangle(cx + 170, cy, 280, 48, 0x8a5a30)
      .setInteractive({ useHandCursor: true }).setDepth(110));
    const dinnerText = this.addObj(this.add.text(cx + 170, cy, 'MAKE DINNER  [F]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(111));

    const dKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    let resolved = false;
    const cleanup = () => {
      deliveryBg.destroy(); deliveryText.destroy(); dinnerBg.destroy(); dinnerText.destroy();
      dKey.off('down', deliverFirst); fKey.off('down', dinnerFirst);
    };
    const deliverFirst = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      this.deliveryOrder = 'delivery-first';
      ChoiceLedger.record('la_delivery_order', 'Delivered first');
      SoundEffects.playConfirm();
      this.showText('Sent. JP arrives after everybody ordered.', cy, { size: '10px', color: '#8fc8ff' });
      this.showContinue(1200);
    };
    const dinnerFirst = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      this.deliveryOrder = 'dinner-first';
      ChoiceLedger.record('la_delivery_order', 'Made dinner first');
      SoundEffects.playVibrate();
      this.showText('Phone goes face-down. The deadline follows him inside.', cy, { size: '10px', color: '#f0c080' });
      this.showContinue(1200);
    };

    deliveryBg.on('pointerdown', deliverFirst);
    dinnerBg.on('pointerdown', dinnerFirst);
    dKey.on('down', deliverFirst);
    fKey.on('down', dinnerFirst);
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
      wordWrap: { width: GAME_WIDTH - 120 },
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.addTween({ targets: t, alpha: 1, duration: 600, delay });
    this.textObjects.push(t);
    return t;
  }

  /** Show text with slow line-by-line fade in for reflective moments */
  private showTextSlow(
    lines: string[],
    startY: number,
    options: { size?: string; color?: string; baseDelay?: number; lineGap?: number; lineSpacing?: number } = {}
  ) {
    const { size = '14px', color = '#ffffff', baseDelay = 0, lineGap = 1500, lineSpacing = 40 } = options;
    const texts: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < lines.length; i++) {
      const t = this.add.text(GAME_WIDTH / 2, startY + i * lineSpacing, lines[i], {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: size,
        color,
        wordWrap: { width: GAME_WIDTH - 120 },
        align: 'center',
        lineSpacing: 10,
      }).setOrigin(0.5).setAlpha(0).setDepth(100);

      this.addTween({ targets: t, alpha: 1, duration: 800, delay: baseDelay + i * lineGap });
      this.textObjects.push(t);
      texts.push(t);
    }
    return texts;
  }

  private showContinue(delay = 2000) {
    this.time.delayedCall(delay, () => {
      if (this.scene.isActive()) {
        const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '\u25bc', {
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

  /** Create twinkling night sky stars with one special gold star */
  private createNightStars(count: number, maxY: number) {
    // Regular stars
    for (let i = 0; i < count; i++) {
      const star = this.addObj(
        this.add.rectangle(
          Math.random() * GAME_WIDTH,
          Math.random() * maxY,
          2, 2, 0xffffff
        ).setAlpha(0.2 + Math.random() * 0.3)
      );
      this.addTween({
        targets: star,
        alpha: 0.2 + Math.random() * 0.6,
        duration: 1200 + Math.random() * 2500,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }

    // One special gold star — slightly bigger, stands out
    const goldStar = this.addObj(
      this.add.rectangle(
        GAME_WIDTH * 0.72,
        maxY * 0.25,
        4, 4, 0xf0c040
      ).setAlpha(0.5)
    );
    this.addTween({
      targets: goldStar,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.currentStep) {
      // ═══════════════════════════════════════════════════════════════
      // STEP 0 — Cruising LA at Night
      // ═══════════════════════════════════════════════════════════════
      case 0: {
        // Night sky
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x06061a)
        );

        // Horizon gradient band (dark purple)
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT - 140, GAME_WIDTH, 120, 0x120c24).setAlpha(0.7)
        );

        // Twinkling stars with gold star
        this.createNightStars(10, GAME_HEIGHT * 0.4);

        // City silhouette — dark building shapes against the dark blue sky
        const silhouetteBuildings = [
          { x: 60, w: 80, h: 160 },
          { x: 160, w: 50, h: 220 },
          { x: 230, w: 70, h: 140 },
          { x: 320, w: 90, h: 260 },
          { x: 430, w: 60, h: 180 },
          { x: 510, w: 100, h: 300 },
          { x: 630, w: 55, h: 200 },
          { x: 720, w: 85, h: 250 },
          { x: 830, w: 70, h: 170 },
          { x: 920, w: 95, h: 280 },
          { x: 1030, w: 60, h: 210 },
          { x: 1110, w: 80, h: 240 },
          { x: 1200, w: 65, h: 160 },
        ];
        for (const b of silhouetteBuildings) {
          const by = GAME_HEIGHT - 110 - b.h / 2;
          this.addObj(
            this.add.rectangle(b.x, by, b.w, b.h, 0x08081a).setAlpha(0.9)
          );
          // A few dim windows on silhouette buildings
          for (let wy = by - b.h / 2 + 15; wy < by + b.h / 2 - 10; wy += 20) {
            for (let wx = b.x - b.w / 2 + 10; wx < b.x + b.w / 2 - 10; wx += 16) {
              if (Math.random() > 0.65) {
                this.addObj(
                  this.add.rectangle(wx, wy, 4, 5, 0xf0c860).setAlpha(0.04 + Math.random() * 0.08)
                );
              }
            }
          }
        }

        // Palm tree silhouettes (tall dark shapes)
        const palmPositions = [120, 380, 700, 1050, 1200];
        for (const px of palmPositions) {
          // Trunk
          this.addObj(this.add.rectangle(px, GAME_HEIGHT - 240, 8, 180, 0x0a0a16));
          // Fronds — angled rectangles approximated with overlapping rects
          this.addObj(this.add.rectangle(px - 20, GAME_HEIGHT - 330, 50, 6, 0x0a0a16).setAngle(-15));
          this.addObj(this.add.rectangle(px + 20, GAME_HEIGHT - 330, 50, 6, 0x0a0a16).setAngle(15));
          this.addObj(this.add.rectangle(px - 10, GAME_HEIGHT - 340, 40, 6, 0x0a0a16).setAngle(-30));
          this.addObj(this.add.rectangle(px + 10, GAME_HEIGHT - 340, 40, 6, 0x0a0a16).setAngle(30));
          this.addObj(this.add.rectangle(px, GAME_HEIGHT - 345, 30, 6, 0x0a0a16));
        }

        // Road — deep foreground band. The old 100px strip made the C8 read
        // like a toy on the bottom edge instead of the subject of the shot.
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT - 72, GAME_WIDTH, 145, 0x181820)
        );
        this.addObj(this.add.rectangle(cx, GAME_HEIGHT - 138, GAME_WIDTH, 4, 0x31313c));
        this.addObj(this.add.rectangle(cx, GAME_HEIGHT - 10, GAME_WIDTH, 18, 0x0c0c12).setDepth(4));
        for (let x = 20; x < GAME_WIDTH; x += 70) {
          this.addObj(this.add.rectangle(x, GAME_HEIGHT - 14, 36, 4, 0x50505a).setDepth(5));
        }

        // Road line dashes scrolling underneath the car
        for (let x = 0; x < GAME_WIDTH + 80; x += 80) {
          const dash = this.addObj(
            this.add.rectangle(x, GAME_HEIGHT - 60, 30, 3, 0x404050)
          );
          this.addTween({
            targets: dash,
            x: x - GAME_WIDTH - 80,
            duration: 4000,
            repeat: -1,
            ease: 'Linear',
          });
        }

        // Freeway sign establishes place at a glance and moves with the road.
        const signPost = this.addObj(this.add.rectangle(180, GAME_HEIGHT - 210, 7, 130, 0x424750).setDepth(1));
        const freewaySign = this.addObj(this.add.rectangle(230, GAME_HEIGHT - 260, 170, 72, 0x174b35)
          .setStrokeStyle(4, 0xe9eee8).setDepth(2));
        const freewayText = this.addObj(this.add.text(230, GAME_HEIGHT - 260, 'DTLA  2 MI\n110 NORTH', {
          fontFamily: 'monospace', fontSize: '13px', color: '#ffffff', align: 'center',
        }).setOrigin(0.5).setDepth(3));
        this.addTween({
          targets: [signPost, freewaySign, freewayText],
          x: -240,
          duration: 7200,
          repeat: -1,
          repeatDelay: 3600,
          ease: 'Linear',
          onRepeat: () => {
            signPost.x = GAME_WIDTH + 80;
            freewaySign.x = GAME_WIDTH + 130;
            freewayText.x = GAME_WIDTH + 130;
          },
        });

        // Opposing traffic supplies scale and parallax without stealing focus.
        const trafficColors = [0x495d73, 0x8a3942, 0xd5d7dc, 0x2f343b];
        for (let i = 0; i < 5; i++) {
          const traffic = this.addObj(this.add.rectangle(-120 - i * 260, GAME_HEIGHT - 118, 78, 24, trafficColors[i % trafficColors.length])
            .setDepth(1).setStrokeStyle(2, 0x11141a));
          const tailA = this.addObj(this.add.circle(traffic.x - 27, traffic.y, 3, 0xff342a).setDepth(2));
          const tailB = this.addObj(this.add.circle(traffic.x + 27, traffic.y, 3, 0xff342a).setDepth(2));
          this.addTween({
            targets: [traffic, tailA, tailB],
            x: GAME_WIDTH + 180,
            duration: 4200 + i * 550,
            delay: i * 780,
            repeat: -1,
            repeatDelay: 1200,
            ease: 'Linear',
          });
        }

        // Passing streetlights — yellow circles sliding right to left across the top portion
        for (let i = 0; i < 20; i++) {
          const slX = GAME_WIDTH + 60 + i * 200;
          const slY = GAME_HEIGHT - 180;
          // Pole
          const pole = this.addObj(
            this.add.rectangle(slX, GAME_HEIGHT - 140, 3, 80, 0x303040).setAlpha(0.5)
          );
          // Light globe
          const globe = this.addObj(
            this.add.circle(slX, slY, 8, 0xf0d060, 0.6)
          );
          // Light glow
          const glowSl = this.addObj(
            this.add.circle(slX, slY, 24, 0xf0d060, 0.08)
          );

          const scrollDuration = 6000;
          const startDelay = i * 300;

          this.addTween({
            targets: [pole, globe, glowSl],
            x: '-=' + (GAME_WIDTH + 400),
            duration: scrollDuration,
            delay: startDelay,
            repeat: -1,
            ease: 'Linear',
          });
        }

        // Scrolling city lights in background
        const lightColors = [0xf0c040, 0x40a0f0, 0xf06040, 0xffffff, 0xff60a0, 0x60f0a0];
        for (let i = 0; i < 40; i++) {
          const startX = Math.random() * GAME_WIDTH * 2;
          const light = this.addObj(
            this.add.rectangle(
              startX,
              GAME_HEIGHT - 130 + Math.random() * 50,
              3 + Math.random() * 5,
              3 + Math.random() * 12,
              lightColors[Math.floor(Math.random() * lightColors.length)]
            ).setAlpha(0.3 + Math.random() * 0.4)
          );
          const speed = 3000 + Math.random() * 5000;
          this.addTween({
            targets: light,
            x: -100,
            duration: speed,
            repeat: -1,
            onRepeat: () => {
              (light as Phaser.GameObjects.Rectangle).x = GAME_WIDTH + 100;
            },
          });
        }

        // C8 Corvette cruising on the road
        const car = this.addObj(
          this.add.sprite(cx + 130, GAME_HEIGHT - 62, 'car-corvette-c8').setScale(SCALE * 1.62).setFlipX(true).setDepth(6)
        );
        // JP in driver seat (head visible through window)
        const jpHead = this.addObj(
          this.add.sprite(cx + 148, GAME_HEIGHT - 76, 'player-ch7', 0).setScale(1.35).setDepth(7).setCrop(0, 0, 32, 14)
        );
        // Higo in passenger seat
        const higoHead = this.addObj(
          this.add.sprite(cx + 108, GAME_HEIGHT - 76, 'npc_higo', 0).setScale(1.35).setDepth(7).setCrop(0, 0, 32, 14)
        );
        // Subtle bounce — car and passengers together
        this.addTween({
          targets: [car, jpHead, higoHead],
          y: '-=2',
          duration: 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Engine hum — subtle continuous camera vibration
        this.addTween({
          targets: this.cameras.main,
          scrollX: 0.8,
          scrollY: 0.5,
          duration: 150,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Headlight glow in front of car
        const headlight = this.addObj(
          this.add.ellipse(cx - 65, GAME_HEIGHT - 58, 150, 42, 0xf0e8c0, 0.07).setDepth(5)
        );
        this.addTween({
          targets: headlight,
          alpha: 0.12,
          duration: 500,
          yoyo: true,
          repeat: -1,
        });

        this.showText('LOS ANGELES', cy - 140, { size: '28px', color: '#f0c040' });
        this.showText('Top down in a C8 Corvette.', cy - 70, { size: '14px', delay: 800 });
        this.showText(
          'PCH at sunset. Wind in the hair.\nThe car is paid for.\nNext month isn\'t.',
          cy,
          { size: '12px', color: '#aaaacc', delay: 1600 }
        );

        this.time.delayedCall(3500, () => {
          if (this.scene.isActive()) this.showDeliveryOrderChoice();
        });
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 1 — Steak Dinner
      // ═══════════════════════════════════════════════════════════════
      case 1: {
        // Warm restaurant interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x1a1008)
        );

        // Warm golden tint overlay — restaurant warmth
        const warmOverlay = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xfff0d0).setAlpha(0.08).setDepth(50)
        );

        // Window wall with real city movement outside; the original room was
        // a brown void around one table.
        this.addObj(this.add.rectangle(cx, 170, 820, 190, 0x080b14).setStrokeStyle(8, 0x3d2b20));
        for (let mullion = -3; mullion <= 3; mullion++) {
          this.addObj(this.add.rectangle(cx + mullion * 115, 170, 5, 186, 0x3d2b20));
        }
        for (let i = 0; i < 26; i++) {
          const cityLight = this.addObj(this.add.rectangle(250 + Math.random() * 780, 100 + Math.random() * 130, 4, 7, 0xf0c060)
            .setAlpha(0.15 + Math.random() * 0.35));
          this.addTween({ targets: cityLight, alpha: 0.08, duration: 900 + Math.random() * 1500, yoyo: true, repeat: -1 });
        }

        // Side booths and their own conversations make the restaurant feel
        // open for business rather than staged exclusively for JP.
        for (const side of [-1, 1]) {
          const boothX = cx + side * 480;
          this.addObj(this.add.rectangle(boothX, 365, 250, 82, 0x47271f).setStrokeStyle(3, 0x6b4030));
          this.addObj(this.add.rectangle(boothX, 405, 235, 52, 0x312018));
          const dinerA = this.addObj(this.add.sprite(boothX - 48, 330, side < 0 ? 'npc-business' : 'npc-friend', 0)
            .setScale(SCALE * 0.95).setAlpha(0.82));
          const dinerB = this.addObj(this.add.sprite(boothX + 48, 330, side < 0 ? 'npc-narrator' : 'npc-tech', 0)
            .setScale(SCALE * 0.95).setAlpha(0.82));
          this.addTween({ targets: [dinerA, dinerB], y: '-=2', duration: 900 + (side + 1) * 170, yoyo: true, repeat: -1 });
        }

        // A server continually crosses the floor with plates.
        const server = this.addObj(this.add.sprite(70, 485, 'npc_generic', 6).setScale(SCALE).setDepth(3));
        const servicePlate = this.addObj(this.add.ellipse(70, 462, 34, 10, 0xe8e0d0).setDepth(4));
        this.addTween({
          targets: [server, servicePlate],
          x: GAME_WIDTH - 70,
          duration: 6200,
          yoyo: true,
          repeat: -1,
          hold: 800,
          repeatDelay: 700,
          ease: 'Sine.easeInOut',
          onYoyo: () => server.setFrame(4),
          onRepeat: () => server.setFrame(6),
        });

        // Warm ambient light glows from ceiling
        const glowPositions = [200, 440, 640, 840, 1080];
        for (const gx of glowPositions) {
          const glow = this.addObj(
            this.add.circle(gx, 60, 120, 0xf0a040, 0.06)
          );
          this.addTween({
            targets: glow,
            alpha: 0.03,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
          });
          // Downward light cone
          this.addObj(
            this.add.triangle(gx, 120, 0, 0, -60, -80, 60, -80, 0xf0a040, 0.03)
          );
        }

        // Table — large dark wood rectangle
        const tableY = cy + 60;
        this.addObj(this.add.rectangle(cx, tableY, 400, 80, 0x3e2c1c));
        // Table edge highlight
        this.addObj(this.add.rectangle(cx, tableY - 40, 400, 3, 0x5a4030));

        // Candle on table center — tiny red dot, flickering
        const candle = this.addObj(
          this.add.circle(cx, tableY - 10, 3, 0xff4422, 0.5)
        );
        this.addTween({
          targets: candle,
          alpha: { from: 0.3, to: 0.7 },
          duration: 400 + Math.random() * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        // Candle glow
        const candleGlow = this.addObj(
          this.add.circle(cx, tableY - 10, 16, 0xff6633, 0.04)
        );
        this.addTween({
          targets: candleGlow,
          alpha: 0.08,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });

        // Plates (small light circles)
        const platePositions = [cx - 140, cx - 50, cx + 50, cx + 140];
        for (const px of platePositions) {
          this.addObj(this.add.circle(px, tableY, 16, 0xe8e0d0, 0.6));
          // Food on plate (small colored rectangle)
          this.addObj(this.add.rectangle(px, tableY - 2, 10, 6, 0x8b4513, 0.7));
        }

        // Laptops on table — blue/white rectangles with pulsing alpha glow
        const laptopPositions = [cx - 90, cx + 90, cx + 30];
        for (let li = 0; li < laptopPositions.length; li++) {
          const lx = laptopPositions[li];
          // Screen
          const screen = this.addObj(this.add.rectangle(lx, tableY - 14, 20, 14, 0x304060));
          // Pulsing screen glow
          const screenGlow = this.addObj(this.add.circle(lx, tableY - 14, 18, 0x4080c0, 0.06));
          this.addTween({
            targets: [screen, screenGlow],
            alpha: '+=' + (0.03 + li * 0.01),
            duration: 1500 + li * 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          // Base
          this.addObj(this.add.rectangle(lx, tableY - 4, 22, 4, 0x404040));
        }

        // 4 characters sitting around the table
        // JP at left (ch5 = come-up outfit)
        this.addObj(
          this.add.sprite(cx - 140, tableY - 70, 'player-ch5', 0).setScale(CHAR_SCALE * 1.3)
        );
        // Friends
        this.addObj(
          this.add.sprite(cx - 50, tableY - 70, 'npc-tech', 0).setScale(SCALE * 1.3)
        );
        this.addObj(
          this.add.sprite(cx + 50, tableY - 70, 'npc-friend', 0).setScale(SCALE * 1.3)
        );
        this.addObj(
          this.add.sprite(cx + 140, tableY - 70, 'npc-narrator', 0).setScale(SCALE * 1.3)
        );

        // Steam/warmth particles rising from plates
        for (let i = 0; i < 12; i++) {
          const steamX = platePositions[Math.floor(Math.random() * 4)] + (Math.random() - 0.5) * 10;
          const steam = this.addObj(
            this.add.rectangle(steamX, tableY - 8, 2, 4, 0xf0e0d0).setAlpha(0)
          );
          this.addTween({
            targets: steam,
            y: tableY - 60 - Math.random() * 40,
            alpha: { from: 0.4, to: 0 },
            duration: 2000 + Math.random() * 1500,
            delay: Math.random() * 3000,
            repeat: -1,
          });
        }

        this.showText('Steak dinner. Real restaurant.\nNot the drive-thru.', cy - 180, { color: '#f0d0a0' });
        const dinnerPressure = this.deliveryOrder === 'delivery-first'
          ? 'JP slides in late. Everybody already ordered.\nThe client got the build; the steak got cold.'
          : 'JP makes the table on time.\nThe unfinished delivery vibrates beside his plate.';
        this.showText(
          `Four friends at the table.\n${dinnerPressure}`,
          cy + 180,
          { size: '12px', delay: 800 }
        );
        this.showText(
          '"We\'re all doing AI work now.\nEvery single one of us left\nthe old life behind."\nNobody mentions how little we slept.',
          cy + 280,
          { size: '12px', color: '#aaaacc', delay: 1600 }
        );

        this.showContinue(3500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2 — Highrise (3rd person exterior — glass tower at night)
      // ═══════════════════════════════════════════════════════════════
      case 2: {
        // Start camera higher up — we'll pan upward to reveal the tower
        this.cameras.main.scrollY = 200;

        // Night sky
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT + 400, 0x06060e)
        );

        // Twinkling night stars with gold star
        this.createNightStars(10, GAME_HEIGHT * 0.35);

        // Background buildings (shorter, darker, flanking the main tower)
        const bgBuildings = [
          { x: 120, w: 100, h: 350, color: 0x0a0a16 },
          { x: 260, w: 70, h: 280, color: 0x0c0c1a },
          { x: 380, w: 90, h: 420, color: 0x08080f },
          { x: 900, w: 110, h: 380, color: 0x0a0a16 },
          { x: 1050, w: 80, h: 300, color: 0x0c0c1a },
          { x: 1160, w: 95, h: 340, color: 0x08080f },
        ];
        for (const b of bgBuildings) {
          const by = GAME_HEIGHT - b.h / 2;
          this.addObj(this.add.rectangle(b.x, by, b.w, b.h, b.color).setAlpha(0.7));
          // Dim windows on background buildings
          for (let wy = by - b.h / 2 + 20; wy < by + b.h / 2 - 10; wy += 18) {
            for (let wx = b.x - b.w / 2 + 8; wx < b.x + b.w / 2 - 8; wx += 14) {
              if (Math.random() > 0.4) {
                const bw = this.addObj(
                  this.add.rectangle(wx, wy, 4, 5, 0xf0c860).setAlpha(0.06 + Math.random() * 0.12)
                );
                if (Math.random() > 0.5) {
                  this.addTween({
                    targets: bw,
                    alpha: 0.02,
                    duration: 2000 + Math.random() * 4000,
                    yoyo: true,
                    repeat: -1,
                  });
                }
              }
            }
          }
        }

        // THE MAIN TOWER — tall glass building, center of screen
        const towerX = cx;
        const towerW = 180;
        const towerH = 700;
        const towerY = GAME_HEIGHT - towerH / 2 + 40;

        // Tower body
        this.addObj(this.add.rectangle(towerX, towerY, towerW, towerH, 0x10101e).setAlpha(0.95));

        // Glass panels — subtle blue tint strips
        for (let py = towerY - towerH / 2; py < towerY + towerH / 2; py += 24) {
          this.addObj(this.add.rectangle(towerX, py, towerW - 4, 1, 0x1a1a30).setAlpha(0.5));
        }
        // Vertical mullions
        for (let px = towerX - towerW / 2 + 20; px < towerX + towerW / 2; px += 20) {
          this.addObj(this.add.rectangle(px, towerY, 1, towerH, 0x1a1a30).setAlpha(0.3));
        }

        // Tower windows — grid of lit windows
        const jpFloorY = towerY - towerH / 2 + 80; // JP is near the top
        for (let wy = towerY - towerH / 2 + 20; wy < towerY + towerH / 2 - 20; wy += 24) {
          for (let wx = towerX - towerW / 2 + 12; wx < towerX + towerW / 2 - 10; wx += 20) {
            const isJPWindow = Math.abs(wy - jpFloorY) < 12 && Math.abs(wx - towerX) < 10;
            if (isJPWindow) continue; // leave JP's window for the special treatment

            if (Math.random() > 0.35) {
              const winColor = Math.random() > 0.8 ? 0xc0e0ff : 0xf0c860;
              const tw = this.addObj(
                this.add.rectangle(wx, wy, 8, 10, winColor).setAlpha(0.08 + Math.random() * 0.15)
              );
              if (Math.random() > 0.6) {
                this.addTween({
                  targets: tw,
                  alpha: 0.03,
                  duration: 1500 + Math.random() * 4000,
                  yoyo: true,
                  repeat: -1,
                  delay: Math.random() * 3000,
                });
              }
            }
          }
        }

        // JP'S WINDOW — brighter than the rest, warm light
        const jpWinX = towerX;
        const jpWinY = jpFloorY;
        // Warm glow spilling out
        this.addObj(this.add.rectangle(jpWinX, jpWinY, 30, 18, 0xf0d080).setAlpha(0.35));
        this.addObj(this.add.rectangle(jpWinX, jpWinY, 22, 14, 0xf8e0a0).setAlpha(0.5));

        // JP silhouette in the window — tiny dark figure against the warm light
        this.addObj(
          this.add.rectangle(jpWinX, jpWinY + 2, 6, 10, 0x0a0a14).setAlpha(0.8)
        );
        // Head
        this.addObj(this.add.rectangle(jpWinX, jpWinY - 4, 4, 4, 0x0a0a14).setAlpha(0.8));

        // Subtle glow ring around JP's window
        const glow = this.addObj(
          this.add.circle(jpWinX, jpWinY, 30, 0xf0d080, 0.08)
        );
        this.addTween({
          targets: glow,
          alpha: 0.04,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Ground level — street with car headlights, scattered tiny lights
        this.addObj(this.add.rectangle(cx, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x101018));
        // Scattered city lights at the base
        for (let i = 0; i < 30; i++) {
          const lx = Math.random() * GAME_WIDTH;
          const ly = GAME_HEIGHT - 10 - Math.random() * 30;
          const lColor = Math.random() > 0.7 ? 0xf0c040 : (Math.random() > 0.5 ? 0x40a0f0 : 0xf06040);
          this.addObj(
            this.add.rectangle(lx, ly, 2 + Math.random() * 3, 2, lColor).setAlpha(0.15 + Math.random() * 0.25)
          );
        }
        // Moving car lights on street
        for (let i = 0; i < 8; i++) {
          const carX = Math.random() * GAME_WIDTH;
          const carLight = this.addObj(
            this.add.rectangle(carX, GAME_HEIGHT - 15, 3, 2, 0xf0e0c0).setAlpha(0.3 + Math.random() * 0.3)
          );
          this.addTween({
            targets: carLight,
            x: carX + (Math.random() > 0.5 ? 200 : -200),
            duration: 4000 + Math.random() * 4000,
            repeat: -1,
          });
        }

        // Slow camera pan upward to reveal the full height of the tower
        this.addTween({
          targets: this.cameras.main,
          scrollY: 0,
          duration: 4000,
          delay: 500,
          ease: 'Sine.easeInOut',
        });

        // Text
        this.showText('30th floor. Downtown LA.', 40, { size: '20px', color: '#8888cc', delay: 500 });
        const lateNightPressure = this.deliveryOrder === 'delivery-first'
          ? 'One window still lit at 2 AM.\nThat\'s JP. Another client needs an answer by nine.'
          : 'One window still lit at 2 AM.\nThat\'s JP. Dinner ended; the delivery did not.';
        this.showText(
          lateNightPressure,
          GAME_HEIGHT - 200,
          { delay: 1500, color: '#aaaacc' }
        );
        this.showText(
          'Looking down at the city\nthat used to feel impossible to reach.',
          GAME_HEIGHT - 120,
          { size: '12px', delay: 2500 }
        );

        this.showContinue(4500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3 — JP's Reflection
      // ═══════════════════════════════════════════════════════════════
      case 3: {
        // Dim dark background
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x040408)
        );

        // Breathing city lights below — slowly pulsing dots across the bottom
        for (let i = 0; i < 40; i++) {
          const cityX = Math.random() * GAME_WIDTH;
          const cityY = GAME_HEIGHT - 30 - Math.random() * 80;
          const cityColor = Math.random() > 0.5 ? 0xf0c040 : (Math.random() > 0.5 ? 0x40a0f0 : 0xff6040);
          const cityLight = this.addObj(
            this.add.rectangle(cityX, cityY, 2 + Math.random() * 3, 2, cityColor).setAlpha(0.08 + Math.random() * 0.12)
          );
          // Breathing pulse — the city breathes
          this.addTween({
            targets: cityLight,
            alpha: 0.02 + Math.random() * 0.05,
            duration: 2000 + Math.random() * 3000,
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 2000,
            ease: 'Sine.easeInOut',
          });
        }

        // JP's window — small warm rectangle, the focal point
        const winX = cx;
        const winY = cy - 80;
        this.addObj(this.add.rectangle(winX, winY, 24, 16, 0xf0d080).setAlpha(0.4));
        this.addObj(this.add.rectangle(winX, winY, 18, 12, 0xf8e0a0).setAlpha(0.6));
        // JP silhouette in window
        this.addObj(this.add.rectangle(winX, winY + 2, 5, 8, 0x0a0a14).setAlpha(0.8));
        this.addObj(this.add.rectangle(winX, winY - 3, 3, 3, 0x0a0a14).setAlpha(0.8));

        // Warm glow around window
        const reflGlow = this.addObj(
          this.add.circle(winX, winY, 50, 0xf0d080, 0.06)
        );
        this.addTween({
          targets: reflGlow,
          alpha: 0.03,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Vignette — dark edges to focus on the window
        const vigEdges = [
          { x: 0, y: cy, w: 300, h: GAME_HEIGHT },
          { x: GAME_WIDTH, y: cy, w: 300, h: GAME_HEIGHT },
          { x: cx, y: 0, w: GAME_WIDTH, h: 200 },
          { x: cx, y: GAME_HEIGHT, w: GAME_WIDTH, h: 150 },
        ];
        for (const v of vigEdges) {
          this.addObj(
            this.add.rectangle(v.x, v.y, v.w, v.h, 0x000000).setAlpha(0.7).setOrigin(0.5)
          );
        }

        // Slow line-by-line text fade — 1.5s between lines
        this.showText("JP's Mind", cy - 220, { size: '12px', color: '#f0c040' });

        this.showTextSlow(
          [
            '"I used to stare at the same',
            'ceiling every morning.',
            '',
            'Now the view is thirty floors up.',
            'The rent on it is due on the first."',
          ],
          cy + 120,
          { size: '14px', color: '#ffffff', baseDelay: 600, lineGap: 1500, lineSpacing: 32 }
        );

        this.showTextSlow(
          ['"This is just the beginning."'],
          cy + 340,
          { size: '18px', color: '#f0c040', baseDelay: 600 + 5 * 1500 + 500, lineGap: 0 }
        );

        // The pressure decision LA actually ends with: Dan calls about Vegas.
        // Rent week. The account says no. The ceiling says go.
        this.time.delayedCall(600 + 5 * 1500 + 3200, () => {
          if (!this.scene.isActive()) return;

          // Turn the reflection into a clean decision beat instead of stacking
          // the call and buttons over the closing quote.
          for (const text of this.textObjects) text.destroy();
          this.textObjects = [];
          this.addObj(this.add.rectangle(cx, cy + 80, 700, 160, 0x080812, 0.92));
          this.showText('Phone buzz. Dan: "Vegas this weekend. Tony and Patrick are in."', cy + 45, { size: '10px', color: '#e8d8b0' });
          this.showText('Rent is due Friday.', cy + 85, { size: '9px', color: '#aa8899', delay: 700 });
          this.time.delayedCall(1600, () => this.showVegasChoice());
        });
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 4 — Layered Transition Out
      // ═══════════════════════════════════════════════════════════════
      case 4: {
        // Reconstruct a minimal version of the scene for the layered fade

        // Night sky
        const skyBg = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x06060e)
        );

        // Stars
        const stars: Phaser.GameObjects.Rectangle[] = [];
        for (let i = 0; i < 10; i++) {
          const s = this.addObj(
            this.add.rectangle(
              Math.random() * GAME_WIDTH,
              Math.random() * (GAME_HEIGHT * 0.35),
              2, 2, 0xffffff
            ).setAlpha(0.3 + Math.random() * 0.3)
          ) as Phaser.GameObjects.Rectangle;
          stars.push(s);
        }

        // City lights at base
        const cityLights: Phaser.GameObjects.Rectangle[] = [];
        for (let i = 0; i < 25; i++) {
          const cl = this.addObj(
            this.add.rectangle(
              Math.random() * GAME_WIDTH,
              GAME_HEIGHT - 20 - Math.random() * 60,
              2 + Math.random() * 4, 2,
              Math.random() > 0.5 ? 0xf0c040 : 0x40a0f0
            ).setAlpha(0.15 + Math.random() * 0.2)
          ) as Phaser.GameObjects.Rectangle;
          cityLights.push(cl);
        }

        // JP's window — the last light
        const jpWinFinal = this.addObj(
          this.add.rectangle(cx, cy - 40, 20, 14, 0xf8e0a0).setAlpha(0.5)
        );
        const jpGlowFinal = this.addObj(
          this.add.circle(cx, cy - 40, 30, 0xf0d080, 0.06)
        );

        // Layered fade: city lights first (1s), then sky/stars (1s), then JP's window (1s), then black
        // Phase 1: City lights fade out
        this.addTween({
          targets: cityLights,
          alpha: 0,
          duration: 1000,
          delay: 300,
        });

        // Phase 2: Stars and sky dim
        this.addTween({
          targets: stars,
          alpha: 0,
          duration: 1000,
          delay: 1300,
        });
        this.addTween({
          targets: skyBg,
          alpha: 0,
          duration: 1000,
          delay: 1300,
        });

        // Phase 3: JP's window — the last light goes dark
        this.addTween({
          targets: [jpWinFinal, jpGlowFinal],
          alpha: 0,
          duration: 1200,
          delay: 2300,
        });

        // Final camera fade to black after everything is dark
        this.time.delayedCall(3600, () => {
          this.cameras.main.fadeOut(800, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('OperatorScene');
          });
        });
        break;
      }
    }
  }
}
