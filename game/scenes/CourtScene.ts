import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from '../config';

/**
 * Cinematic court scene with pixel art animations.
 * Sequence: raid -> arrest -> courtroom -> sentencing -> transition to jail
 */
export class CourtScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super({ key: 'CourtScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];

    this.cameras.main.fadeIn(500, 0, 0, 0);

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
    }).setOrigin(0.5).setAlpha(0);

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

  /** Create a tiled dark floor background */
  private makeDarkRoom() {
    const bg = this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x18141e)
    );
    // Tile grid lines for texture
    for (let x = 0; x < GAME_WIDTH; x += 64) {
      this.addObj(this.add.rectangle(x, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0x100c16).setAlpha(0.5));
    }
    for (let y = 0; y < GAME_HEIGHT; y += 64) {
      this.addObj(this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 1, 0x100c16).setAlpha(0.5));
    }
    return bg;
  }

  /** Flashing red/blue police lights at screen edges */
  private makePoliceFlash(): void {
    const redLeft = this.addObj(
      this.add.rectangle(0, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0xff0000).setOrigin(0, 0.5).setAlpha(0)
    );
    const blueRight = this.addObj(
      this.add.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0x0044ff).setOrigin(1, 0.5).setAlpha(0)
    );
    const redRight = this.addObj(
      this.add.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0xff0000).setOrigin(1, 0.5).setAlpha(0)
    );
    const blueLeft = this.addObj(
      this.add.rectangle(0, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0x0044ff).setOrigin(0, 0.5).setAlpha(0)
    );

    // Alternate: red-left + blue-right, then blue-left + red-right
    this.addTween({
      targets: [redLeft, blueRight],
      alpha: { from: 0, to: 0.25 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      delay: 0,
    });
    this.addTween({
      targets: [blueLeft, redRight],
      alpha: { from: 0, to: 0.25 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      delay: 300,
    });
  }

  /** Create courtroom background with bench */
  private makeCourtroom() {
    // Light floor
    this.addObj(
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2a2430)
    );
    // Floor tile lines
    for (let x = 0; x < GAME_WIDTH; x += 64) {
      this.addObj(this.add.rectangle(x, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0x221e28).setAlpha(0.4));
    }
    for (let y = 0; y < GAME_HEIGHT; y += 64) {
      this.addObj(this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 1, 0x221e28).setAlpha(0.4));
    }

    // Judge's bench — elevated platform at top
    const benchY = 180;
    // Back wall
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, benchY - 60, 600, 80, 0x4a3828));
    // Bench surface
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, benchY, 500, 30, 0x5c4430));
    // Bench front panel
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, benchY + 20, 500, 16, 0x3e2c1c));
    // Gavel area — small rectangle
    this.addObj(this.add.rectangle(GAME_WIDTH / 2 + 160, benchY - 8, 12, 6, 0x2a1c10));

    // Railing
    const railY = GAME_HEIGHT / 2 + 40;
    this.addObj(this.add.rectangle(GAME_WIDTH / 2, railY, 800, 6, 0x4a3828));
    // Railing posts
    for (let x = GAME_WIDTH / 2 - 400; x <= GAME_WIDTH / 2 + 400; x += 80) {
      this.addObj(this.add.rectangle(x, railY - 16, 6, 36, 0x4a3828));
    }

    return benchY;
  }

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.currentStep) {
      // ═══════════════════════════════════════════════════════════════
      // STEP 0 — The Raid
      // ═══════════════════════════════════════════════════════════════
      case 0: {
        this.makeDarkRoom();

        // JP in center (black hoodie = ch2)
        const jp = this.addObj(
          this.add.sprite(cx - 60, cy + 40, 'player-ch2', 0).setScale(SCALE)
        );

        // Buyer nearby
        this.addObj(
          this.add.sprite(cx + 80, cy + 20, 'npc-shady', 0).setScale(SCALE)
        );

        // Table between them (rectangle)
        this.addObj(
          this.add.rectangle(cx + 10, cy + 50, 80, 40, 0x3a2820)
        );

        // Police flash
        this.makePoliceFlash();

        // Screen shake
        this.cameras.main.shake(800, 0.015);

        // BANG text
        this.showText('BANG  BANG  BANG', cy - 120, { size: '32px', color: '#ff3333' });
        this.showText('POLICE! OPEN UP!', cy - 60, { size: '16px', color: '#ff6666', delay: 800 });

        // Door break flash — white bar from left side
        this.time.delayedCall(600, () => {
          const flash = this.addObj(
            this.add.rectangle(0, cy, 200, GAME_HEIGHT, 0xffffff).setOrigin(0, 0.5).setAlpha(0.8)
          );
          this.addTween({
            targets: flash,
            alpha: 0,
            duration: 400,
          });
        });

        this.showContinue(2500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 1 — Hands Up
      // ═══════════════════════════════════════════════════════════════
      case 1: {
        this.makeDarkRoom();
        this.makePoliceFlash();

        // JP facing up (hands up simulation) — frame 2 = up-idle
        const jp = this.addObj(
          this.add.sprite(cx, cy + 40, 'player-ch2', 2).setScale(SCALE)
        );

        // Two cops entering from sides
        const cop1 = this.addObj(
          this.add.sprite(-60, cy + 20, 'npc-guard', 6).setScale(SCALE) // right-idle, walking right
        );
        const cop2 = this.addObj(
          this.add.sprite(GAME_WIDTH + 60, cy + 20, 'npc-guard', 4).setScale(SCALE) // left-idle, walking left
        );

        // Tween cops walking in
        this.addTween({
          targets: cop1,
          x: cx - 200,
          duration: 1200,
          ease: 'Power2',
        });
        this.addTween({
          targets: cop2,
          x: cx + 200,
          duration: 1200,
          ease: 'Power2',
        });

        this.showText('Officer', cy - 140, { size: '12px', color: '#f0c040', delay: 600 });
        this.showText('"Hands where I can see them.\nAll of you. Against the wall. Now."', cy - 90, { size: '13px', delay: 800 });

        this.time.delayedCall(1800, () => {
          this.showText("JP's Mind", cy + 140, { size: '12px', color: '#f0c040' });
          this.showText('"This isn\'t happening."', cy + 180, { size: '13px', color: '#aaaacc', delay: 200 });
        });

        this.showContinue(3000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2 — In the Car
      // ═══════════════════════════════════════════════════════════════
      case 2: {
        // Dark background
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a14)
        );

        // Cop car lights at top
        this.makePoliceFlash();

        // JP sprite center, facing down (head down)
        const jp = this.addObj(
          this.add.sprite(cx, cy + 20, 'player-ch2', 0).setScale(SCALE)
        );
        // Slight slow bob to simulate riding in car
        this.addTween({
          targets: jp,
          y: cy + 26,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Car interior suggestion — dark rectangles for seats
        this.addObj(this.add.rectangle(cx - 160, cy - 20, 8, 200, 0x1a1a2e)); // left bar (divider)
        this.addObj(this.add.rectangle(cx + 160, cy - 20, 8, 200, 0x1a1a2e)); // right bar
        // Window mesh
        this.addObj(this.add.rectangle(cx, cy - 110, 300, 4, 0x2a2a3e));

        this.showText('Everyone in the house got taken in.', cy - 200, { color: '#888899' });
        this.showText('JP was charged with possession\nwith intent to distribute.', cy + 160, { delay: 800 });

        this.showContinue(2500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3 — Courtroom: FACING 13 YEARS
      // ═══════════════════════════════════════════════════════════════
      case 3: {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.clearAll();

          const benchY = this.makeCourtroom();

          // Judge behind bench
          this.addObj(
            this.add.sprite(cx, benchY - 30, 'npc-business', 0).setScale(SCALE)
          );

          // JP in center-bottom area, small and alone
          this.addObj(
            this.add.sprite(cx - 40, cy + 120, 'player-ch2', 2).setScale(SCALE) // facing up toward judge
          );

          // Lawyer next to JP
          this.addObj(
            this.add.sprite(cx + 60, cy + 120, 'npc-narrator', 0).setScale(SCALE)
          );

          this.cameras.main.fadeIn(800, 0, 0, 0);

          this.showText('SUPERIOR COURT OF CALIFORNIA', 60, { size: '11px', color: '#666688', delay: 400 });
          this.showText('FACING', cy + 220, { size: '14px', color: '#888899', delay: 1000 });

          // "13 YEARS" scales up with impact
          this.time.delayedCall(1400, () => {
            const bigText = this.add.text(cx, cy + 270, '13 YEARS', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '40px',
              color: '#ff3333',
              align: 'center',
            }).setOrigin(0.5).setScale(2.5).setAlpha(0);
            this.textObjects.push(bigText);

            this.addTween({
              targets: bigText,
              scaleX: 1,
              scaleY: 1,
              alpha: 1,
              duration: 600,
              ease: 'Back.easeOut',
              onComplete: () => {
                this.cameras.main.shake(400, 0.008);
              },
            });
          });

          this.showContinue(3500);
        });
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 4 — Lawyer Talks
      // ═══════════════════════════════════════════════════════════════
      case 4: {
        const benchY = this.makeCourtroom();

        // Judge still there
        this.addObj(
          this.add.sprite(cx, benchY - 30, 'npc-business', 0).setScale(SCALE)
        );

        // JP facing down (looking at floor)
        const jp = this.addObj(
          this.add.sprite(cx - 40, cy + 120, 'player-ch2', 0).setScale(SCALE)
        );

        // Lawyer — starts further away, moves toward JP
        const lawyer = this.addObj(
          this.add.sprite(cx + 140, cy + 120, 'npc-narrator', 4).setScale(SCALE) // facing left toward JP
        );

        this.addTween({
          targets: lawyer,
          x: cx + 70,
          duration: 1000,
          ease: 'Power2',
          delay: 400,
        });

        this.showText('Lawyer', cy - 60, { size: '12px', color: '#f0c040' });
        this.showText('"Take the plea deal. One year.\nYou fight this, you\'re looking at\nthe full thirteen."', cy, { delay: 400 });

        this.time.delayedCall(1800, () => {
          // JP looks away (change to left-idle)
          jp.setFrame(4);
          this.showText('JP', cy + 220, { size: '12px', color: '#f0c040' });
          this.showText('"...one year?"', cy + 260, { color: '#aaaacc', delay: 200 });
        });

        this.showContinue(3000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 5 — Sentencing
      // ═══════════════════════════════════════════════════════════════
      case 5: {
        const benchY = this.makeCourtroom();

        // Judge — starts seated, stands slightly
        const judge = this.addObj(
          this.add.sprite(cx, benchY - 30, 'npc-business', 0).setScale(SCALE)
        );
        this.addTween({
          targets: judge,
          y: benchY - 50,
          duration: 800,
          ease: 'Power2',
          delay: 200,
        });

        // JP and lawyer
        this.addObj(
          this.add.sprite(cx - 40, cy + 120, 'player-ch2', 2).setScale(SCALE)
        );
        this.addObj(
          this.add.sprite(cx + 70, cy + 120, 'npc-narrator', 0).setScale(SCALE)
        );

        this.showText('SENTENCED', cy + 200, { size: '16px', color: '#888899' });

        // Gavel flash — full screen white flash
        this.time.delayedCall(800, () => {
          const flash = this.addObj(
            this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xffffff).setAlpha(0.6).setDepth(10)
          );
          this.addTween({ targets: flash, alpha: 0, duration: 300 });
          this.cameras.main.shake(200, 0.006);
        });

        // "1 YEAR" impact text
        this.time.delayedCall(1000, () => {
          const yearText = this.add.text(cx, cy + 250, '1 YEAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '36px',
            color: '#f0c040',
            align: 'center',
          }).setOrigin(0.5).setScale(2).setAlpha(0);
          this.textObjects.push(yearText);

          this.addTween({
            targets: yearText,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut',
          });

          this.showText('California State', cy + 310, { size: '12px', color: '#666688', delay: 400 });
        });

        this.showContinue(3000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 6 — JP's Mind
      // ═══════════════════════════════════════════════════════════════
      case 6: {
        // Fade to black
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x060610)
        );

        // Spotlight — layered circles getting brighter toward center
        this.addObj(this.add.circle(cx, cy + 20, 160, 0x101020, 0.3));
        this.addObj(this.add.circle(cx, cy + 20, 100, 0x181830, 0.3));
        this.addObj(this.add.circle(cx, cy + 20, 50, 0x202040, 0.3));

        // JP sprite centered, alone
        const jp = this.addObj(
          this.add.sprite(cx, cy + 20, 'player-ch2', 0).setScale(SCALE)
        );
        // Slow breathing pulse
        this.addTween({
          targets: jp,
          scaleX: SCALE * 1.02,
          scaleY: SCALE * 1.02,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        this.showText("JP's Mind", cy - 160, { size: '12px', color: '#f0c040' });
        this.showText(
          '"One year. I can do one year.\nBut I\'m not coming out the same\nperson who went in."',
          cy - 100,
          { delay: 600 }
        );

        this.showContinue(2500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 7 — Transition to Jail
      // ═══════════════════════════════════════════════════════════════
      case 7: {
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('JailScene');
        });
        break;
      }
    }
  }
}
