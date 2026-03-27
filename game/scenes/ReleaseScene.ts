import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';

/**
 * Cinematic release scene — walking out of jail.
 * Mirrors CourtScene structure but reversed: dark → light.
 * Sequence: cell door → hallway → doors open → sunlight → freedom
 */
export class ReleaseScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super({ key: 'ReleaseScene' });
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

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.currentStep) {
      // ═══════════════════════════════════════════════════════════════
      // STEP 0 — Cell Door Opens
      // ═══════════════════════════════════════════════════════════════
      case 0: {
        // Dark cell
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a12)
        );

        // Cell walls — concrete grey
        this.addObj(this.add.rectangle(cx, 0, GAME_WIDTH, 200, 0x1a1a22).setOrigin(0.5, 0));
        this.addObj(this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 200, 0x1a1a22).setOrigin(0.5, 1));

        // Cell bars — vertical lines across the front
        const barStartX = cx - 200;
        const bars: Phaser.GameObjects.Rectangle[] = [];
        for (let i = 0; i < 11; i++) {
          const bar = this.addObj(
            this.add.rectangle(barStartX + i * 40, cy, 6, GAME_HEIGHT, 0x3a3a4a).setDepth(5)
          );
          bars.push(bar);
        }

        // JP sitting on bed, facing down
        const jp = this.addObj(
          this.add.sprite(cx, cy + 40, 'player-ch3', 0).setScale(CHAR_SCALE * 1.3)
        );

        // Bed
        this.addObj(this.add.rectangle(cx + 60, cy + 60, 80, 40, 0x2a2a3a));

        this.showText('Guard', cy - 160, { size: '12px', color: '#f0c040', delay: 800 });
        this.showText('"Lopez. You\'re out. Get your things."', cy - 110, { delay: 1000 });

        // JP stands up — shift frame to facing up
        this.time.delayedCall(2000, () => {
          jp.setFrame(2);
          this.addTween({
            targets: jp,
            y: cy + 20,
            duration: 600,
            ease: 'Power2',
          });
        });

        // Bars slide open to the left
        this.time.delayedCall(2800, () => {
          for (const bar of bars) {
            this.addTween({
              targets: bar,
              x: bar.x - 300,
              duration: 800,
              ease: 'Power2',
            });
          }
          // Metal sliding sound via camera shake
          this.cameras.main.shake(200, 0.005);
        });

        this.showContinue(4000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 1 — The Hallway
      // ═══════════════════════════════════════════════════════════════
      case 1: {
        // Dim hallway — slightly lighter than cell
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x12121e)
        );

        // Hallway walls
        this.addObj(this.add.rectangle(0, cy, 80, GAME_HEIGHT, 0x1e1e2a).setOrigin(0, 0.5));
        this.addObj(this.add.rectangle(GAME_WIDTH, cy, 80, GAME_HEIGHT, 0x1e1e2a).setOrigin(1, 0.5));

        // Floor line
        this.addObj(this.add.rectangle(cx, cy + 100, GAME_WIDTH - 160, 2, 0x2a2a3a));

        // Fluorescent lights — dim flickering rectangles on ceiling
        for (let i = 0; i < 4; i++) {
          const light = this.addObj(
            this.add.rectangle(200 + i * 250, 80, 60, 8, 0x444466).setAlpha(0.4)
          );
          this.addTween({
            targets: light,
            alpha: { from: 0.3, to: 0.6 },
            duration: 200 + Math.random() * 400,
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 500,
          });
        }

        // JP walking forward (up the screen = toward the exit)
        const jp = this.addObj(
          this.add.sprite(cx, GAME_HEIGHT + 40, 'player-ch3', 2).setScale(CHAR_SCALE * 1.3)
        );

        // Walk animation
        this.addTween({
          targets: jp,
          y: cy + 20,
          duration: 2000,
          ease: 'Power1',
        });

        // Light at the end — warm glow at the top of screen
        const exitGlow = this.addObj(
          this.add.rectangle(cx, -20, GAME_WIDTH, 120, 0xf0d080).setAlpha(0).setDepth(2)
        );
        this.addTween({
          targets: exitGlow,
          alpha: 0.15,
          duration: 2000,
          delay: 500,
        });

        this.showText("JP's Mind", cy - 140, { size: '12px', color: '#f0c040', delay: 1200 });
        this.showText('"Last time I walk this hallway."', cy - 90, { delay: 1400, color: '#aaaacc' });

        this.showContinue(3000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2 — The Doors
      // ═══════════════════════════════════════════════════════════════
      case 2: {
        // Dark interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0e0e18)
        );

        // Two massive doors in center
        const doorLeft = this.addObj(
          this.add.rectangle(cx - 2, cy, GAME_WIDTH / 2, GAME_HEIGHT, 0x2a2a3a).setOrigin(1, 0.5)
        );
        const doorRight = this.addObj(
          this.add.rectangle(cx + 2, cy, GAME_WIDTH / 2, GAME_HEIGHT, 0x2a2a3a).setOrigin(0, 0.5)
        );

        // Door details — horizontal bars
        for (let y = 100; y < GAME_HEIGHT; y += 120) {
          this.addObj(this.add.rectangle(cx - 160, y, 280, 4, 0x3a3a4a).setDepth(1));
          this.addObj(this.add.rectangle(cx + 160, y, 280, 4, 0x3a3a4a).setDepth(1));
        }

        // Door handles
        this.addObj(this.add.rectangle(cx - 20, cy, 8, 30, 0x4a4a5a).setDepth(2));
        this.addObj(this.add.rectangle(cx + 20, cy, 8, 30, 0x4a4a5a).setDepth(2));

        // JP facing the doors
        const jp = this.addObj(
          this.add.sprite(cx, cy + 200, 'player-ch3', 2).setScale(CHAR_SCALE * 1.3).setDepth(3)
        );

        // Pause... then doors swing open
        this.time.delayedCall(1500, () => {
          // Light floods in from behind the doors
          const sunlight = this.addObj(
            this.add.rectangle(cx, cy, 4, GAME_HEIGHT, 0xfff8e0).setAlpha(0).setDepth(0)
          );

          // Doors open
          this.addTween({
            targets: doorLeft,
            x: -GAME_WIDTH / 2,
            duration: 1800,
            ease: 'Power2',
          });
          this.addTween({
            targets: doorRight,
            x: GAME_WIDTH + GAME_WIDTH / 2,
            duration: 1800,
            ease: 'Power2',
          });

          // Sunlight expands as doors open
          this.addTween({
            targets: sunlight,
            displayWidth: GAME_WIDTH,
            alpha: 0.5,
            duration: 1800,
            ease: 'Power2',
          });

          // Camera slowly brightens
          this.addTween({
            targets: this.cameras.main,
            zoom: 1.02,
            duration: 2000,
            ease: 'Sine.easeOut',
          });
        });

        this.showContinue(4000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3 — Sunlight
      // ═══════════════════════════════════════════════════════════════
      case 3: {
        // Warm white/gold background — the outside
        const bg = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf8f0e0).setAlpha(0)
        );

        // Fade from white flash to warm background
        const flash = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xffffff).setDepth(10)
        );
        this.addTween({
          targets: flash,
          alpha: 0,
          duration: 2000,
          ease: 'Power2',
        });
        this.addTween({
          targets: bg,
          alpha: 1,
          duration: 1500,
        });

        // Sky gradient — light blue at top
        this.addObj(
          this.add.rectangle(cx, 0, GAME_WIDTH, GAME_HEIGHT / 2, 0xb0d8f0).setOrigin(0.5, 0).setAlpha(0.6)
        );

        // Ground — simple warm earth
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 200, 0xc0a880).setOrigin(0.5, 1)
        );

        // Sun — top right, warm glow
        const sunGlow = this.addObj(
          this.add.circle(GAME_WIDTH - 200, 120, 80, 0xfff0c0, 0.3)
        );
        const sun = this.addObj(
          this.add.circle(GAME_WIDTH - 200, 120, 30, 0xfff8e0, 0.9)
        );
        this.addTween({
          targets: sunGlow,
          scaleX: 1.1,
          scaleY: 1.1,
          alpha: 0.4,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // JP walks out from bottom center — small at first, growing
        const jp = this.addObj(
          this.add.sprite(cx, GAME_HEIGHT + 40, 'player-ch3', 2).setScale(CHAR_SCALE * 1.3).setDepth(5)
        );

        this.addTween({
          targets: jp,
          y: cy + 80,
          duration: 2500,
          ease: 'Power1',
        });

        // JP stops, turns to face the player (frame 0 = down)
        this.time.delayedCall(3000, () => {
          jp.setFrame(0);
        });

        this.showText('I knew it.', cy - 120, { size: '16px', color: '#4a4a5a', delay: 1500 });
        this.showText('God showed.', cy - 70, { size: '16px', color: '#4a4a5a', delay: 2500 });
        this.showText('The truth always prevails.', cy - 20, { size: '16px', color: '#4a4a5a', delay: 3500 });

        this.showContinue(5000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 4 — Walking Away
      // ═══════════════════════════════════════════════════════════════
      case 4: {
        // Warm outdoor scene
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e8d8)
        );

        // Sky
        this.addObj(
          this.add.rectangle(cx, 0, GAME_WIDTH, GAME_HEIGHT / 2, 0xb0d8f0).setOrigin(0.5, 0).setAlpha(0.5)
        );

        // Road stretching ahead — perspective lines
        this.addObj(this.add.rectangle(cx, cy + 100, 400, 300, 0x888880).setAlpha(0.3));
        this.addObj(this.add.rectangle(cx, cy + 100, 4, 300, 0xf0d040).setAlpha(0.4)); // center line

        // JP walking up and away — shrinking into the distance
        const jp = this.addObj(
          this.add.sprite(cx, cy + 120, 'player-ch3', 2).setScale(CHAR_SCALE * 1.3).setDepth(5)
        );

        this.addTween({
          targets: jp,
          y: cy - 160,
          scaleX: SCALE * 0.4,
          scaleY: SCALE * 0.4,
          duration: 5000,
          ease: 'Power1',
        });

        this.showText('The doors opened.', 60, { size: '14px', color: '#4a4a5a', delay: 500 });
        this.showText('Jordi walked out a different person.', 110, { size: '14px', color: '#4a4a5a', delay: 1500 });
        this.showText('Not because jail changed him.', cy + 250, { size: '12px', color: '#666688', delay: 3000 });
        this.showText('Because he changed himself.', cy + 290, { size: '12px', color: '#666688', delay: 4000 });

        // Slow fade to white
        this.time.delayedCall(5500, () => {
          this.cameras.main.fadeOut(2000, 255, 255, 255);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TractorScene');
          });
        });
        break;
      }
    }
  }
}
