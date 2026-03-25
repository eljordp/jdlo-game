import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';

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

  constructor() {
    super({ key: 'LAScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];

    MusicSystem.stop();
    this.cameras.main.fadeIn(1000, 0, 0, 0);

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
      wordWrap: { width: GAME_WIDTH - 120 },
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);

    this.addTween({ targets: t, alpha: 1, duration: 600, delay });
    this.textObjects.push(t);
    return t;
  }

  private showContinue(delay = 2000) {
    this.time.delayedCall(delay, () => {
      if (this.scene.isActive()) {
        const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '▼', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '12px',
          color: '#666688',
        }).setOrigin(0.5);
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

        // Stars — twinkling
        for (let i = 0; i < 50; i++) {
          const star = this.addObj(
            this.add.rectangle(
              Math.random() * GAME_WIDTH,
              Math.random() * (GAME_HEIGHT * 0.5),
              2, 2, 0xffffff
            ).setAlpha(Math.random() * 0.3 + 0.1)
          );
          this.addTween({
            targets: star,
            alpha: Math.random() * 0.6 + 0.1,
            duration: 1000 + Math.random() * 2000,
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 2000,
          });
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

        // Road — dark band at bottom
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT - 60, GAME_WIDTH, 100, 0x181820)
        );
        // Road lines (dashed center line)
        for (let x = 0; x < GAME_WIDTH; x += 80) {
          const dash = this.addObj(
            this.add.rectangle(x, GAME_HEIGHT - 60, 30, 3, 0x404050)
          );
          // Scroll left to simulate driving
          this.addTween({
            targets: dash,
            x: x - GAME_WIDTH,
            duration: 4000,
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
          // Scroll left — parallax speed varies by "depth"
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
          this.add.sprite(cx + 100, GAME_HEIGHT - 60, 'car-corvette-c8').setScale(SCALE).setFlipX(true)
        );
        // Subtle bounce
        this.addTween({
          targets: car,
          y: GAME_HEIGHT - 62,
          duration: 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Headlight glow in front of car
        const headlight = this.addObj(
          this.add.circle(cx - 90, GAME_HEIGHT - 58, 40, 0xf0e8c0, 0.08)
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
          'PCH at sunset. Wind in the hair.\nThis is what they don\'t show you\nabout making it out.',
          cy,
          { size: '12px', color: '#aaaacc', delay: 1600 }
        );

        this.showContinue(3500);
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

        // Plates (small light circles)
        const platePositions = [cx - 140, cx - 50, cx + 50, cx + 140];
        for (const px of platePositions) {
          this.addObj(this.add.circle(px, tableY, 16, 0xe8e0d0, 0.6));
          // Food on plate (small colored rectangle)
          this.addObj(this.add.rectangle(px, tableY - 2, 10, 6, 0x8b4513, 0.7));
        }

        // Laptops on table (small rectangles between plates)
        const laptopPositions = [cx - 90, cx + 90];
        for (const lx of laptopPositions) {
          // Screen
          this.addObj(this.add.rectangle(lx, tableY - 14, 20, 14, 0x304060));
          // Glow from screen
          this.addObj(this.add.circle(lx, tableY - 14, 16, 0x4080c0, 0.05));
          // Base
          this.addObj(this.add.rectangle(lx, tableY - 4, 22, 4, 0x404040));
        }

        // 4 characters sitting around the table
        // JP at left (ch5 = come-up outfit)
        this.addObj(
          this.add.sprite(cx - 140, tableY - 70, 'player-ch5', 0).setScale(SCALE)
        );
        // Friends
        this.addObj(
          this.add.sprite(cx - 50, tableY - 70, 'npc-tech', 0).setScale(SCALE)
        );
        this.addObj(
          this.add.sprite(cx + 50, tableY - 70, 'npc-friend', 0).setScale(SCALE)
        );
        this.addObj(
          this.add.sprite(cx + 140, tableY - 70, 'npc-narrator', 0).setScale(SCALE)
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
        this.showText(
          'Four friends at the table.\nLaptops open between the plates.\nBuilding while we eat.',
          cy + 180,
          { size: '12px', delay: 800 }
        );
        this.showText(
          '"We\'re all doing AI work now.\nEvery single one of us left\nthe old life behind."',
          cy + 280,
          { size: '12px', color: '#aaaacc', delay: 1600 }
        );

        this.showContinue(3500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2 — Highrise View
      // ═══════════════════════════════════════════════════════════════
      case 2: {
        // Dark room background
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x080812)
        );

        // Large window — the main visual element
        const winX = cx;
        const winY = cy - 20;
        const winW = GAME_WIDTH - 160;
        const winH = GAME_HEIGHT - 180;

        // Window glass (very dark blue, slightly lighter than walls)
        this.addObj(this.add.rectangle(winX, winY, winW, winH, 0x0c0c22));
        // Window frame
        const frame = this.addObj(this.add.rectangle(winX, winY, winW, winH, 0x000000, 0));
        (frame as Phaser.GameObjects.Rectangle).setStrokeStyle(4, 0x303050);
        // Window cross-bars (4 panes)
        this.addObj(this.add.rectangle(winX, winY, 2, winH, 0x303050));
        this.addObj(this.add.rectangle(winX, winY, winW, 2, 0x303050));

        // Building silhouettes — varied heights, layered depth
        const buildings = [
          // Far background layer (darker, taller)
          { x: winX - 380, w: 45, h: 320, color: 0x08081a, alpha: 0.5 },
          { x: winX - 300, w: 60, h: 200, color: 0x0a0a1e, alpha: 0.6 },
          { x: winX - 220, w: 40, h: 260, color: 0x08081a, alpha: 0.5 },
          { x: winX - 200, w: 80, h: 280, color: 0x0c0c20, alpha: 0.6 },
          { x: winX - 130, w: 35, h: 180, color: 0x0a0a1c, alpha: 0.55 },
          { x: winX - 80, w: 50, h: 160, color: 0x0e0e1c, alpha: 0.6 },
          { x: winX - 20, w: 30, h: 340, color: 0x08081a, alpha: 0.45 },
          { x: winX + 40, w: 70, h: 240, color: 0x0c0c20, alpha: 0.6 },
          { x: winX + 100, w: 38, h: 190, color: 0x0a0a1c, alpha: 0.55 },
          { x: winX + 150, w: 90, h: 300, color: 0x0e0e1c, alpha: 0.6 },
          { x: winX + 230, w: 42, h: 220, color: 0x08081a, alpha: 0.5 },
          { x: winX + 280, w: 55, h: 180, color: 0x0c0c20, alpha: 0.6 },
          { x: winX + 340, w: 32, h: 270, color: 0x0a0a1c, alpha: 0.5 },
          { x: winX + 370, w: 75, h: 220, color: 0x0e0e1c, alpha: 0.6 },
          { x: winX + 430, w: 50, h: 150, color: 0x08081a, alpha: 0.5 },
        ];
        for (const b of buildings) {
          const by = winY + winH / 2 - b.h / 2 + 40;
          this.addObj(this.add.rectangle(b.x, by, b.w, b.h, b.color).setAlpha(b.alpha));
          // Lit windows on buildings
          for (let wy = by - b.h / 2 + 15; wy < by + b.h / 2 - 5; wy += 16) {
            for (let wx = b.x - b.w / 2 + 6; wx < b.x + b.w / 2 - 5; wx += 12) {
              if (Math.random() > 0.35) {
                const bldgLight = this.addObj(
                  this.add.rectangle(wx, wy, 4, 5, 0xf0c860).setAlpha(0.12 + Math.random() * 0.25)
                );
                // Most building windows twinkle
                if (Math.random() > 0.4) {
                  this.addTween({
                    targets: bldgLight,
                    alpha: Math.random() * 0.08,
                    duration: 800 + Math.random() * 3000,
                    yoyo: true,
                    repeat: -1,
                    delay: Math.random() * 4000,
                  });
                }
              }
            }
          }
        }

        // City lights far below through window — dense scattered lights
        const lightColors2 = [0xf0c040, 0x40a0f0, 0xf06040, 0xf0f0f0, 0xff8040, 0x40f0c0, 0xff4060, 0xf0a0f0];
        for (let i = 0; i < 120; i++) {
          const lx = (winX - winW / 2 + 30) + Math.random() * (winW - 60);
          const ly = winY + 30 + Math.random() * (winH / 2);
          const light = this.addObj(
            this.add.rectangle(
              lx, ly,
              1 + Math.random() * 3,
              1 + Math.random() * 6,
              lightColors2[Math.floor(Math.random() * lightColors2.length)]
            ).setAlpha(0.15 + Math.random() * 0.5)
          );
          // All lights twinkle at different rates
          this.addTween({
            targets: light,
            alpha: Math.random() * 0.15,
            duration: 600 + Math.random() * 3000,
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 3000,
          });
        }

        // JP standing at window, facing up (looking out, back to camera)
        this.addObj(
          this.add.sprite(cx, winY + 100, 'player-ch5', 2).setScale(SCALE)
        );

        // Reflection in window glass — semi-transparent, flipped, with wave distortion
        const reflection = this.addObj(
          this.add.sprite(cx, winY + 180, 'player-ch5', 0).setScale(SCALE).setAlpha(0.15).setFlipY(true)
        );
        // Slow alpha breathing (glass shimmer)
        this.addTween({
          targets: reflection,
          alpha: 0.06,
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        // Wave distortion — subtle horizontal sway
        this.addTween({
          targets: reflection,
          x: cx - 2,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        // Vertical drift (glass warping effect)
        this.addTween({
          targets: reflection,
          y: winY + 183,
          duration: 2200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Floor ambient light (reflection from window)
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT - 50, GAME_WIDTH, 80, 0x101830).setAlpha(0.3)
        );

        // "30th floor" — large text that shrinks to final size for impact
        const floorText = this.add.text(cx, 40, '30th floor.', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: '#8888cc',
          align: 'center',
        }).setOrigin(0.5).setAlpha(0).setScale(1.8);
        this.textObjects.push(floorText);

        this.addTween({
          targets: floorText,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 1200,
          ease: 'Back.easeOut',
        });

        // "Downtown LA" fades in after floor text settles
        const cityText = this.add.text(cx, 72, 'Downtown LA.', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#6666aa',
          align: 'center',
        }).setOrigin(0.5).setAlpha(0);
        this.textObjects.push(cityText);
        this.addTween({
          targets: cityText,
          alpha: 1,
          duration: 600,
          delay: 1000,
        });

        this.showText(
          'Looking down at the city\nthat used to feel impossible\nto reach.',
          GAME_HEIGHT - 120,
          { delay: 1400 }
        );

        this.showContinue(3000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3 — JP's Reflection
      // ═══════════════════════════════════════════════════════════════
      case 3: {
        // Black with subtle vignette
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x040408)
        );

        // Vignette — dark edges
        const vigEdges = [
          { x: 0, y: cy, w: 200, h: GAME_HEIGHT }, // left
          { x: GAME_WIDTH, y: cy, w: 200, h: GAME_HEIGHT }, // right
          { x: cx, y: 0, w: GAME_WIDTH, h: 180 }, // top
          { x: cx, y: GAME_HEIGHT, w: GAME_WIDTH, h: 180 }, // bottom
        ];
        for (const v of vigEdges) {
          this.addObj(
            this.add.rectangle(v.x, v.y, v.w, v.h, 0x000000).setAlpha(0.6).setOrigin(0.5)
          );
        }

        // Glow behind JP — concentric circles
        this.addObj(this.add.circle(cx, cy - 20, 180, 0x101030, 0.3));
        this.addObj(this.add.circle(cx, cy - 20, 120, 0x181848, 0.3));
        this.addObj(this.add.circle(cx, cy - 20, 70, 0x202060, 0.3));

        // JP sprite — bigger scale for close-up
        const jp = this.addObj(
          this.add.sprite(cx, cy - 20, 'player-ch5', 0).setScale(7)
        );

        // Slow pulse glow
        const glowRing = this.addObj(
          this.add.circle(cx, cy - 20, 90, 0x3040a0, 0.08)
        );
        this.addTween({
          targets: glowRing,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0,
          duration: 3000,
          repeat: -1,
          ease: 'Sine.easeOut',
        });
        // Second pulse offset
        const glowRing2 = this.addObj(
          this.add.circle(cx, cy - 20, 90, 0x3040a0, 0.06)
        );
        this.addTween({
          targets: glowRing2,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0,
          duration: 3000,
          delay: 1500,
          repeat: -1,
          ease: 'Sine.easeOut',
        });

        // Slow breathing on JP
        this.addTween({
          targets: jp,
          scaleX: 7.15,
          scaleY: 7.15,
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        this.showText("JP's Mind", cy - 220, { size: '12px', color: '#f0c040' });
        this.showText(
          '"Six months ago I was\non a tractor in Napa.\nNow I\'m in a penthouse in LA\nbuilding AI systems."',
          cy + 140,
          { delay: 600 }
        );
        this.showText(
          '"This is just the beginning."',
          cy + 260,
          { size: '18px', color: '#f0c040', delay: 2000 }
        );

        this.showContinue(4000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 4 — Transition to Operator Mode
      // ═══════════════════════════════════════════════════════════════
      case 4: {
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('OperatorScene');
        });
        break;
      }
    }
  }
}
