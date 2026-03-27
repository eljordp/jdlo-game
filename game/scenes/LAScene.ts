import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
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
          this.add.sprite(cx - 140, tableY - 70, 'player-ch5', 0).setScale(CHAR_SCALE)
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
      // STEP 2 — Highrise (3rd person exterior — glass tower at night)
      // ═══════════════════════════════════════════════════════════════
      case 2: {
        // 3rd person exterior — glass tower at night, JP silhouette in window

        // Night sky
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x06060e)
        );

        // Stars
        for (let i = 0; i < 40; i++) {
          const star = this.addObj(
            this.add.rectangle(
              Math.random() * GAME_WIDTH,
              Math.random() * (GAME_HEIGHT * 0.35),
              1, 1, 0xffffff
            ).setAlpha(0.2 + Math.random() * 0.4)
          );
          this.addTween({
            targets: star,
            alpha: 0.1,
            duration: 1000 + Math.random() * 3000,
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 2000,
          });
        }

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
        const jpSilhouette = this.addObj(
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

        // Ground level — street with car headlights
        this.addObj(this.add.rectangle(cx, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x101018));
        // Car lights on street
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

        // Text
        this.showText('30th floor. Downtown LA.', 40, { size: '20px', color: '#8888cc', delay: 500 });
        this.showText(
          'One window lit brighter than the rest.\nThat\'s where Jordi is.',
          GAME_HEIGHT - 140,
          { delay: 1500, color: '#aaaacc' }
        );
        this.showText(
          'Looking down at the city\nthat used to feel impossible to reach.',
          GAME_HEIGHT - 70,
          { size: '12px', delay: 2500 }
        );

        this.showContinue(4000);
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
