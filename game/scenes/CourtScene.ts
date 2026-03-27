import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';

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
  private letterboxTop!: Phaser.GameObjects.Rectangle;
  private letterboxBottom!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'CourtScene' });
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
    this.letterboxTop = this.add.rectangle(GAME_WIDTH / 2, 35, GAME_WIDTH, 70, 0x000000).setScrollFactor(0).setDepth(200);
    this.letterboxBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 35, GAME_WIDTH, 70, 0x000000).setScrollFactor(0).setDepth(200);

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

  /** Spawn courtroom murmur text snippets that appear and fade at random edge positions */
  private spawnCourtMurmurs() {
    const murmurs = [
      'guilty...', 'no way...', '13 years...', 'oh my god...',
      'so young...', 'attempted...', 'did you hear...', 'his life...',
    ];
    const spawnOne = () => {
      if (!this.scene.isActive()) return;
      const phrase = murmurs[Math.floor(Math.random() * murmurs.length)];
      // Position along edges — left, right, or bottom area
      const side = Math.floor(Math.random() * 3);
      let mx: number;
      let my: number;
      if (side === 0) { // left edge
        mx = 40 + Math.random() * 80;
        my = 120 + Math.random() * (GAME_HEIGHT - 240);
      } else if (side === 1) { // right edge
        mx = GAME_WIDTH - 40 - Math.random() * 80;
        my = 120 + Math.random() * (GAME_HEIGHT - 240);
      } else { // bottom area
        mx = 100 + Math.random() * (GAME_WIDTH - 200);
        my = GAME_HEIGHT - 100 - Math.random() * 60;
      }
      const murmur = this.add.text(mx, my, phrase, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#555566',
      }).setOrigin(0.5).setAlpha(0).setDepth(50);
      this.sceneObjects.push(murmur);
      this.addTween({
        targets: murmur,
        alpha: { from: 0, to: 0.6 },
        y: my - 10,
        duration: 600,
        yoyo: true,
        hold: 300,
        onComplete: () => murmur.destroy(),
      });
    };

    // Spawn 2-3 murmurs staggered
    this.time.delayedCall(800, spawnOne);
    this.time.delayedCall(1400, spawnOne);
    this.time.delayedCall(2200, spawnOne);
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
          this.add.sprite(cx - 60, cy + 40, 'player-ch2', 0).setScale(CHAR_SCALE * 1.3)
        );

        // Buyer nearby
        this.addObj(
          this.add.sprite(cx + 80, cy + 20, 'npc-shady', 0).setScale(SCALE * 1.3)
        );

        // Table between them (rectangle)
        this.addObj(
          this.add.rectangle(cx + 10, cy + 50, 80, 40, 0x3a2820)
        );

        // Door-breaking animation — white rectangle slides in rapidly from left
        const door = this.addObj(
          this.add.rectangle(-100, cy, 200, GAME_HEIGHT, 0xffffff).setOrigin(0, 0.5).setAlpha(0).setDepth(5)
        );
        this.time.delayedCall(400, () => {
          this.addTween({
            targets: door,
            x: 0,
            alpha: 0.9,
            duration: 150,
            ease: 'Power4',
            onComplete: () => {
              // Screen shake on impact — starts mild
              this.cameras.main.shake(400, 0.014);
              // Flash fades out
              this.addTween({
                targets: door,
                alpha: 0,
                duration: 500,
              });

              // Escalate shake after a beat — more intense as cops flood in
              this.time.delayedCall(600, () => {
                if (this.scene.isActive() && this.currentStep === 0) {
                  this.cameras.main.shake(600, 0.022);
                }
              });
            },
          });
        });

        // Intense fast-alternating police lights
        const redLeft = this.addObj(
          this.add.rectangle(0, cy, 160, GAME_HEIGHT, 0xff0000).setOrigin(0, 0.5).setAlpha(0).setDepth(4)
        );
        const blueRight = this.addObj(
          this.add.rectangle(GAME_WIDTH, cy, 160, GAME_HEIGHT, 0x0044ff).setOrigin(1, 0.5).setAlpha(0).setDepth(4)
        );
        const redRight = this.addObj(
          this.add.rectangle(GAME_WIDTH, cy, 160, GAME_HEIGHT, 0xff0000).setOrigin(1, 0.5).setAlpha(0).setDepth(4)
        );
        const blueLeft = this.addObj(
          this.add.rectangle(0, cy, 160, GAME_HEIGHT, 0x0044ff).setOrigin(0, 0.5).setAlpha(0).setDepth(4)
        );
        // Fast alternation (150ms instead of 300ms), higher intensity
        this.addTween({
          targets: [redLeft, blueRight],
          alpha: { from: 0, to: 0.4 },
          duration: 150,
          yoyo: true,
          repeat: -1,
          delay: 0,
        });
        this.addTween({
          targets: [blueLeft, redRight],
          alpha: { from: 0, to: 0.4 },
          duration: 150,
          yoyo: true,
          repeat: -1,
          delay: 150,
        });

        // BANG text
        this.showText('BANG  BANG  BANG', cy - 120, { size: '32px', color: '#ff3333' });
        this.showText('POLICE! OPEN UP!', cy - 60, { size: '16px', color: '#ff6666', delay: 800 });

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
          this.add.sprite(cx, cy + 40, 'player-ch2', 2).setScale(CHAR_SCALE * 1.3)
        );

        // Two cops entering from sides
        const cop1 = this.addObj(
          this.add.sprite(-60, cy + 20, 'npc-guard', 6).setScale(SCALE * 1.3) // right-idle, walking right
        );
        const cop2 = this.addObj(
          this.add.sprite(GAME_WIDTH + 60, cy + 20, 'npc-guard', 4).setScale(SCALE * 1.3) // left-idle, walking left
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
          this.add.sprite(cx, cy + 20, 'player-ch2', 0).setScale(CHAR_SCALE * 1.3)
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
        this.showText('Charged with attempted murder.', cy + 160, { delay: 800 });

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
            this.add.sprite(cx, benchY - 30, 'npc-business', 0).setScale(SCALE * 1.3)
          );

          // JP in center-bottom area, small and alone
          this.addObj(
            this.add.sprite(cx - 40, cy + 120, 'player-ch2', 2).setScale(CHAR_SCALE * 1.3) // facing up toward judge
          );

          // Lawyer next to JP
          this.addObj(
            this.add.sprite(cx + 60, cy + 120, 'npc-narrator', 0).setScale(SCALE * 1.3)
          );

          this.cameras.main.fadeIn(800, 0, 0, 0);

          // Courtroom murmurs — whisper snippets around the edges
          this.spawnCourtMurmurs();

          this.showText('SUPERIOR COURT OF CALIFORNIA', 60, { size: '11px', color: '#666688', delay: 400 });

          // Gavel slam when judge "speaks" — brief intense shake + dark flash
          this.time.delayedCall(800, () => {
            if (!this.scene.isActive()) return;
            this.cameras.main.shake(80, 0.015);
            const darkFlash = this.addObj(
              this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000).setAlpha(0.5).setDepth(90)
            );
            this.addTween({ targets: darkFlash, alpha: 0, duration: 300 });
          });

          this.showText('FACING', cy + 200, { size: '14px', color: '#888899', delay: 1000 });

          // "13 YEARS" — THE GUT PUNCH
          this.time.delayedCall(1400, () => {
            if (!this.scene.isActive()) return;

            // Full-screen red flash
            const redFlash = this.addObj(
              this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xcc2222).setAlpha(0).setDepth(95)
            );
            this.addTween({
              targets: redFlash,
              alpha: { from: 0.3, to: 0 },
              duration: 300,
            });

            // Main text — SLAMS in from 3x scale to 1x in 200ms
            const bigText = this.add.text(cx, cy + 260, '13 YEARS', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '40px',
              color: '#cc2222',
              align: 'center',
            }).setOrigin(0.5).setScale(3).setAlpha(0).setDepth(100);
            this.textObjects.push(bigText);

            // Overlapping darker red text for pulse effect
            const pulseText = this.add.text(cx, cy + 260, '13 YEARS', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '40px',
              color: '#880000',
              align: 'center',
            }).setOrigin(0.5).setScale(3).setAlpha(0).setDepth(101);
            this.textObjects.push(pulseText);

            // SLAM animation — 200ms with Back.easeOut
            this.addTween({
              targets: bigText,
              scaleX: 1,
              scaleY: 1,
              alpha: 1,
              duration: 200,
              ease: 'Back.easeOut',
              onComplete: () => {
                // Intense camera shake on impact
                this.cameras.main.shake(400, 0.025);

                // Slight pulsing on the text
                this.addTween({
                  targets: bigText,
                  scaleX: 1.05,
                  scaleY: 1.05,
                  duration: 800,
                  yoyo: true,
                  repeat: -1,
                  ease: 'Sine.easeInOut',
                });

                // Pulse between red and dark red via overlapping text alpha
                this.addTween({
                  targets: pulseText,
                  alpha: { from: 0, to: 0.7 },
                  duration: 500,
                  yoyo: true,
                  repeat: -1,
                  ease: 'Sine.easeInOut',
                });

                // Heartbeat camera zoom — subtle pulse in/out
                this.addTween({
                  targets: this.cameras.main,
                  zoom: 1.015,
                  duration: 400,
                  yoyo: true,
                  repeat: -1,
                  ease: 'Sine.easeInOut',
                });
              },
            });

            // Scale in the pulse text in sync
            this.addTween({
              targets: pulseText,
              scaleX: 1,
              scaleY: 1,
              duration: 200,
              ease: 'Back.easeOut',
            });
          });

          this.showContinue(4000);
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
          this.add.sprite(cx, benchY - 30, 'npc-business', 0).setScale(SCALE * 1.3)
        );

        // JP facing down (looking at floor)
        const jp = this.addObj(
          this.add.sprite(cx - 40, cy + 120, 'player-ch2', 0).setScale(CHAR_SCALE * 1.3)
        );

        // Lawyer — starts further away, moves toward JP
        const lawyer = this.addObj(
          this.add.sprite(cx + 140, cy + 120, 'npc-narrator', 4).setScale(SCALE * 1.3) // facing left toward JP
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
      // STEP 5 — Sentencing: 13 YEARS -> 1 YEAR
      // ═══════════════════════════════════════════════════════════════
      case 5: {
        const benchY = this.makeCourtroom();

        // Judge — starts seated, stands slightly
        const judge = this.addObj(
          this.add.sprite(cx, benchY - 30, 'npc-business', 0).setScale(SCALE * 1.3)
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
          this.add.sprite(cx - 40, cy + 120, 'player-ch2', 2).setScale(CHAR_SCALE * 1.3)
        );
        this.addObj(
          this.add.sprite(cx + 70, cy + 120, 'npc-narrator', 0).setScale(SCALE * 1.3)
        );

        this.showText('SENTENCED', cy + 180, { size: '16px', color: '#888899' });

        // "13 YEARS" text — starts visible, will get struck through
        const thirteenText = this.add.text(cx, cy + 230, '13 YEARS', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: '#cc2222',
          align: 'center',
        }).setOrigin(0.5).setAlpha(0).setDepth(14);
        this.textObjects.push(thirteenText);

        this.addTween({
          targets: thirteenText,
          alpha: 1,
          duration: 400,
          delay: 200,
        });

        // Gavel strike animation
        this.time.delayedCall(600, () => {
          if (!this.scene.isActive()) return;
          // Gavel head
          const gavelHead = this.addObj(
            this.add.rectangle(cx + 160, benchY - 100, 24, 12, 0x5c3a1a).setDepth(12)
          );
          // Gavel handle
          const gavelHandle = this.addObj(
            this.add.rectangle(cx + 160, benchY - 112, 4, 20, 0x3e2810).setDepth(11)
          );

          // Swing down
          this.addTween({
            targets: [gavelHead, gavelHandle],
            y: '+=80',
            duration: 200,
            ease: 'Quad.easeIn',
            onComplete: () => {
              // Dark flash on impact (not white — heavier feel)
              const flash = this.addObj(
                this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000).setAlpha(0.6).setDepth(15)
              );
              this.addTween({ targets: flash, alpha: 0, duration: 300 });
              this.cameras.main.shake(100, 0.015);

              // Fade out gavel
              this.addTween({
                targets: [gavelHead, gavelHandle],
                alpha: 0,
                duration: 400,
                delay: 200,
              });
            },
          });
        });

        // Strikethrough animation on "13 YEARS" — red line animates across
        this.time.delayedCall(1200, () => {
          if (!this.scene.isActive()) return;
          const textBounds = thirteenText.getBounds();
          const strikeY = textBounds.centerY;
          const strikeStartX = textBounds.left - 10;
          const strikeEndX = textBounds.right + 10;

          const strikeLine = this.addObj(
            this.add.rectangle(strikeStartX, strikeY, 0, 4, 0xff3333).setOrigin(0, 0.5).setDepth(15)
          );

          this.addTween({
            targets: strikeLine,
            width: strikeEndX - strikeStartX,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              // Dim the 13 YEARS text
              this.addTween({
                targets: thirteenText,
                alpha: 0.3,
                duration: 400,
              });
            },
          });
        });

        // "1 YEAR" appears below — the relief
        this.time.delayedCall(2000, () => {
          if (!this.scene.isActive()) return;

          // Camera shake stops — reset zoom to 1 for sudden stillness
          this.cameras.main.shake(0, 0);
          this.tweens.killTweensOf(this.cameras.main);
          this.cameras.main.zoom = 1;

          // White flash — brief relief
          const whiteFlash = this.addObj(
            this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xffffff).setAlpha(0).setDepth(16)
          );
          this.addTween({
            targets: whiteFlash,
            alpha: { from: 0.4, to: 0 },
            duration: 400,
          });

          // "1 YEAR" scales up gently from 0.5x
          const yearText = this.add.text(cx, cy + 290, '1 YEAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '36px',
            color: '#ffffff',
            align: 'center',
          }).setOrigin(0.5).setScale(0.5).setAlpha(0).setDepth(17);
          this.textObjects.push(yearText);

          this.addTween({
            targets: yearText,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 600,
            ease: 'Cubic.easeOut',
          });

          this.showText('California State', cy + 340, { size: '12px', color: '#666688', delay: 600 });
        });

        this.showContinue(4000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 6 — JP's Mind (Spotlight)
      // ═══════════════════════════════════════════════════════════════
      case 6: {
        // Full black background
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000)
        );

        // Dim overlay covering everything — the darkness
        const dimOverlay = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x060610).setDepth(1)
        );

        // Spotlight — layered circles getting brighter toward center, breathing
        const spotOuter = this.addObj(this.add.circle(cx, cy + 20, 160, 0x101020, 0.3).setDepth(2));
        const spotMid = this.addObj(this.add.circle(cx, cy + 20, 100, 0x181830, 0.3).setDepth(3));
        const spotInner = this.addObj(this.add.circle(cx, cy + 20, 50, 0x202040, 0.3).setDepth(4));

        // Breathing spotlight — expand and contract slowly
        const spotlights = [spotOuter, spotMid, spotInner];
        for (const spot of spotlights) {
          this.addTween({
            targets: spot,
            scaleX: 1.08,
            scaleY: 1.08,
            alpha: (spot as Phaser.GameObjects.Arc).alpha * 1.2,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }

        // Subtle dust particles floating in the light
        this.time.addEvent({
          delay: 600,
          loop: true,
          callback: () => {
            if (!this.scene.isActive()) return;
            const px = cx + (Math.random() * 120 - 60);
            const py = cy + 20 + (Math.random() * 80 - 40);
            const dust = this.add.circle(px, py, 1, 0x888899, 0.3).setDepth(8);
            this.sceneObjects.push(dust);
            this.addTween({
              targets: dust,
              y: py - 20 - Math.random() * 20,
              x: px + (Math.random() * 30 - 15),
              alpha: 0,
              duration: 2500 + Math.random() * 1500,
              onComplete: () => dust.destroy(),
            });
          },
        });

        // JP sprite centered, alone — at higher depth so he's above the dim
        const jp = this.addObj(
          this.add.sprite(cx, cy + 20, 'player-ch2', 0).setScale(CHAR_SCALE * 1.3).setDepth(10)
        );
        // Breathing pulse — subtle scale
        this.addTween({
          targets: jp,
          scaleX: CHAR_SCALE * 1.3 * 1.02,
          scaleY: CHAR_SCALE * 1.3 * 1.02,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // 3 seconds of silence, then text appears
        this.time.delayedCall(3000, () => {
          if (!this.scene.isActive()) return;
          this.showText("JP's Mind", cy - 160, { size: '12px', color: '#f0c040' });
          this.showText(
            '"One year. I can do one year.\nBut I\'m not coming out the same\nperson who went in."',
            cy - 100,
            { delay: 600 }
          );
        });

        this.showContinue(5000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 7 — Transition to Jail
      // ═══════════════════════════════════════════════════════════════
      case 7: {
        // Letterbox bars close in slightly before fade (grow taller by 20px)
        this.tweens.add({
          targets: this.letterboxTop,
          scaleY: 1.57, // 70 * 1.57 ≈ 110 — grows by ~40px total, 20px visible
          y: 35 + 10, // shift down slightly to close in from top
          duration: 1000,
          ease: 'Sine.easeInOut',
        });
        this.tweens.add({
          targets: this.letterboxBottom,
          scaleY: 1.57,
          y: GAME_HEIGHT - 35 - 10, // shift up slightly to close in from bottom
          duration: 1000,
          ease: 'Sine.easeInOut',
        });

        // Fade out after letterbox starts closing
        this.time.delayedCall(400, () => {
          this.cameras.main.fadeOut(1500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('JailScene');
          });
        });
        break;
      }
    }
  }
}
