import { BaseChapterScene } from './BaseChapterScene';
import { tractorMap, MapData } from '../data/maps';
import { tractorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { EvolutionAnimation } from '../systems/EvolutionAnimation';
import { SCALED_TILE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class TractorScene extends BaseChapterScene {
  constructor() {
    super({ key: 'TractorScene' });
    this.chapterTitle = 'Chapter 5: Caymus Vineyards';
    this.nextScene = 'ComeUpScene';
    this.requiredInteractionId = 'ch4_crash';
  }

  protected getPlayerTexture(): string {
    return 'player-ch4';
  }

  protected getMusicTrack(): string {
    return 'caymus';
  }

  create() {
    super.create();
    // Tractor at 13,5
    this.addNavArrow(13, 4, 'Tractor');
    // AI discovery / computer area at 5,4 (evolve) and dialogue trigger at 6,4
    this.addNavArrow(5, 3, 'Computer');
    // Exit at 8,21
    this.addNavArrow(8, 20, 'Exit');
  }

  protected getObjectiveHint(): string {
    return 'Work the field. Find the computer.';
  }

  getMapData(): MapData {
    return tractorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return tractorDialogue;
  }

  // Override to add tractor mini-game and post-evolution cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch4_tractor' || interactable.id === 'ch4_crash') {
      Analytics.trackInteraction(interactable.id);
      this.playTractorMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch4_ai_discovery') {
      Analytics.trackInteraction(interactable.id);
      // Let the base class handle it — it now uses the grounded discovery scene
      super.handleInteractable(interactable);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playTractorMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let active = true;
    let crashed = false;

    // --- OVERLAY & UI ---
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Ground fill — earthy brown behind everything
    const ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x5c4a2a, 1)
      .setScrollFactor(0).setDepth(300.5);
    objects.push(ground);

    const title = this.add.text(GAME_WIDTH / 2, 40, 'MOWING THE FIELD', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(title);

    const instructions = this.add.text(GAME_WIDTH / 2, 75, 'UP / DOWN to dodge obstacles!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(310);
    objects.push(instructions);

    // Fade instructions after 3 seconds
    this.time.delayedCall(3000, () => {
      if (instructions && instructions.active) {
        this.tweens.add({ targets: instructions, alpha: 0, duration: 800 });
      }
    });

    // Rows cleared counter (top right)
    let rowsCleared = 0;
    const scoreText = this.add.text(GAME_WIDTH - 30, 40, 'Rows: 0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(310);
    objects.push(scoreText);

    // --- VINEYARD ROWS (5 lanes) ---
    // Lanes are the gaps BETWEEN rows. Row lines are visual dividers.
    const rowYPositions = [200, 320, 440, 560, 680];
    // Lane centers sit between row lines (and above first / below last)
    const laneCenters = [140, 260, 380, 500, 620, 740];
    const vineElements: Phaser.GameObjects.Rectangle[] = [];

    for (const ry of rowYPositions) {
      const rowLine = this.add.rectangle(GAME_WIDTH / 2, ry, GAME_WIDTH, 12, 0x308030)
        .setScrollFactor(0).setDepth(301);
      objects.push(rowLine);

      // Vine posts along the row
      for (let vx = 0; vx < GAME_WIDTH + 160; vx += 70) {
        const vine = this.add.rectangle(vx, ry, 6, 22, 0x206020)
          .setScrollFactor(0).setDepth(301);
        objects.push(vine);
        vineElements.push(vine);
      }
    }

    // --- TRACTOR (bigger: 40x24) ---
    const startLane = 2; // middle lane
    const tractorX = 180;
    let tractorLaneY = laneCenters[startLane];
    const tractor = this.add.rectangle(tractorX, tractorLaneY, 40, 24, 0xd4a020)
      .setScrollFactor(0).setDepth(304);
    objects.push(tractor);

    // Cabin detail
    const cabin = this.add.rectangle(tractorX + 6, tractorLaneY - 4, 14, 14, 0xb8860b)
      .setScrollFactor(0).setDepth(304);
    objects.push(cabin);

    // Wheels (bigger)
    const wheel1 = this.add.circle(tractorX - 14, tractorLaneY + 14, 7, 0x303030)
      .setScrollFactor(0).setDepth(304);
    const wheel2 = this.add.circle(tractorX + 14, tractorLaneY + 14, 7, 0x303030)
      .setScrollFactor(0).setDepth(304);
    objects.push(wheel1, wheel2);

    const syncTractorParts = (y: number) => {
      tractor.y = y;
      cabin.y = y - 4;
      wheel1.y = y + 14;
      wheel2.y = y + 14;
    };

    // --- OBSTACLES ---
    interface Obstacle {
      body: Phaser.GameObjects.Rectangle;
      label?: Phaser.GameObjects.Text;
      type: 'rock' | 'puddle' | 'fence';
      hit: boolean;
    }
    const obstacles: Obstacle[] = [];

    const spawnObstacle = () => {
      if (!active) return;
      const laneIdx = Phaser.Math.Between(0, laneCenters.length - 1);
      const oy = laneCenters[laneIdx];
      const roll = Math.random();
      let type: 'rock' | 'puddle' | 'fence';
      let color: number;
      let w: number;
      let h: number;
      if (roll < 0.4) {
        type = 'rock'; color = 0x7a6552; w = 22; h = 18;
      } else if (roll < 0.75) {
        type = 'puddle'; color = 0x3a6fb5; w = 34; h = 12;
      } else {
        type = 'fence'; color = 0x8b6914; w = 10; h = 30;
      }
      const body = this.add.rectangle(GAME_WIDTH + 60, oy, w, h, color)
        .setScrollFactor(0).setDepth(303);
      objects.push(body);
      obstacles.push({ body, type, hit: false });
    };

    // Spawn obstacles on a timer — every 800-1400ms
    const obstacleTimer = this.time.addEvent({
      delay: 1100,
      callback: () => {
        if (active && !crashed) spawnObstacle();
      },
      loop: true,
    });

    // --- DUST PARTICLES ---
    const dustParticles: { obj: Phaser.GameObjects.Arc; life: number }[] = [];
    let dustTimer = 0;

    // --- GAME STATE ---
    let scrollSpeed = 2;
    let tractorVY = 0;
    let phoneShown = false;
    let bumping = false;
    const startTime = this.time.now;
    let lastScoreTime = 0;
    let lastSpeedTime = 0;

    // Engine vibration
    this.cameras.main.shake(25000, 0.001);

    // Input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // "WATCH IT!" flash text (reused)
    const watchItText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'WATCH IT!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(311).setAlpha(0);
    objects.push(watchItText);

    // --- UPDATE LOOP ---
    const updateHandler = () => {
      if (!active || crashed) return;

      const now = this.time.now;
      const elapsed = (now - startTime) / 1000;

      // --- Speed ramp: +0.3 every 5 seconds ---
      if (elapsed - lastSpeedTime >= 5) {
        scrollSpeed += 0.3;
        lastSpeedTime += 5;
      }

      // --- Rows cleared: +1 every 3 seconds ---
      if (elapsed - lastScoreTime >= 3) {
        rowsCleared++;
        lastScoreTime += 3;
        scoreText.setText(`Rows: ${rowsCleared}`);
        // Pulse the score
        this.tweens.add({
          targets: scoreText,
          scaleX: 1.3, scaleY: 1.3,
          duration: 150,
          yoyo: true,
        });
      }

      // --- Scroll vine elements left ---
      for (const vine of vineElements) {
        vine.x -= scrollSpeed;
        if (vine.x < -40) {
          vine.x += GAME_WIDTH + 200;
        }
      }

      // --- Steer tractor ---
      if (!bumping) {
        if (upKey.isDown) {
          tractorVY = -4;
        } else if (downKey.isDown) {
          tractorVY = 4;
        } else {
          tractorVY *= 0.85;
        }
      }

      tractorLaneY += tractorVY;
      tractorLaneY = Phaser.Math.Clamp(tractorLaneY, laneCenters[0], laneCenters[laneCenters.length - 1]);
      syncTractorParts(tractorLaneY);

      // --- Move obstacles & check collision ---
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.body.x -= scrollSpeed + 1.5;

        // Off screen — remove
        if (obs.body.x < -60) {
          obs.body.destroy();
          if (obs.label) obs.label.destroy();
          obstacles.splice(i, 1);
          continue;
        }

        // Collision check (AABB)
        if (!obs.hit) {
          const dx = Math.abs(obs.body.x - tractor.x);
          const dy = Math.abs(obs.body.y - tractor.y);
          const hw = (obs.body.width + tractor.width) / 2;
          const hh = (obs.body.height + tractor.height) / 2;
          if (dx < hw && dy < hh) {
            obs.hit = true;
            bumping = true;

            // Screen shake on bump
            this.cameras.main.shake(200, 0.008);

            // Flash "WATCH IT!"
            watchItText.setAlpha(1);
            this.tweens.add({
              targets: watchItText,
              alpha: 0,
              duration: 600,
              ease: 'Quad.easeOut',
            });

            // Bounce tractor back
            const bounceDir = tractor.y < obs.body.y ? -20 : 20;
            this.tweens.add({
              targets: { val: tractorLaneY },
              val: Phaser.Math.Clamp(tractorLaneY + bounceDir, laneCenters[0], laneCenters[laneCenters.length - 1]),
              duration: 200,
              ease: 'Quad.easeOut',
              onUpdate: (_tw: Phaser.Tweens.Tween, target: { val: number }) => {
                tractorLaneY = target.val;
                syncTractorParts(tractorLaneY);
              },
              onComplete: () => { bumping = false; },
            });
          }
        }
      }

      // --- Dust particles ---
      dustTimer += this.game.loop.delta;
      if (dustTimer >= 100) {
        dustTimer = 0;
        const dust = this.add.circle(
          tractorX - 24 + Phaser.Math.Between(-4, 4),
          tractorLaneY + Phaser.Math.Between(-6, 6),
          Phaser.Math.Between(2, 4),
          0x9e8b6e,
        ).setScrollFactor(0).setDepth(302).setAlpha(0.7);
        objects.push(dust);
        dustParticles.push({ obj: dust, life: 400 });
      }
      // Fade dust
      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const dp = dustParticles[i];
        dp.life -= this.game.loop.delta;
        dp.obj.x -= scrollSpeed * 0.5;
        dp.obj.setAlpha(Math.max(0, dp.life / 400) * 0.7);
        if (dp.life <= 0) {
          dp.obj.destroy();
          dustParticles.splice(i, 1);
        }
      }

      // --- PHONE DISTRACTION at 25 seconds ---
      if (elapsed >= 25 && !phoneShown) {
        phoneShown = true;

        // Phone notification box slides in from top
        const notifBg = this.add.rectangle(GAME_WIDTH / 2, -60, 500, 50, 0x1a1a2e, 0.95)
          .setScrollFactor(0).setDepth(312).setStrokeStyle(2, 0x4a4a6a);
        objects.push(notifBg);

        const notifText = this.add.text(GAME_WIDTH / 2, -60, "New notification: 'How to make money online'", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#e0e0ff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
        objects.push(notifText);

        // Slide notification down
        this.tweens.add({
          targets: [notifBg, notifText],
          y: 120,
          duration: 600,
          ease: 'Back.easeOut',
        });

        // After 2 seconds of notification being visible, JP looks at phone
        this.time.delayedCall(2000, () => {
          active = false; // player loses control

          // Phone emoji near tractor
          const phoneIcon = this.add.text(tractor.x + 50, tractor.y - 30, '📱', {
            fontSize: '28px',
          }).setScrollFactor(0).setDepth(313);
          objects.push(phoneIcon);

          // "JP looked at his phone..." text
          const lookText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'JP looked at his phone...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffcccc',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
          objects.push(lookText);

          // Tractor drifts into nearest row
          const nearestRowY = rowYPositions.reduce((a, b) =>
            Math.abs(b - tractorLaneY) < Math.abs(a - tractorLaneY) ? b : a
          );

          this.tweens.add({
            targets: { val: tractorLaneY },
            val: nearestRowY,
            duration: 1200,
            ease: 'Quad.easeIn',
            onUpdate: (_tw: Phaser.Tweens.Tween, target: { val: number }) => {
              tractorLaneY = target.val;
              syncTractorParts(tractorLaneY);
            },
            onComplete: () => {
              crashed = true;

              // Stop engine vibration
              this.cameras.main.resetFX();

              // RED FLASH
              const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0.6)
                .setScrollFactor(0).setDepth(315);
              objects.push(flash);

              // Big screen shake
              this.cameras.main.shake(600, 0.025);

              // CRUNCH text
              const crunch = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'CRUNCH!', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '36px',
                color: '#ff2222',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(316);
              objects.push(crunch);

              // Rows cleared summary
              const summary = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `${rowsCleared} rows cleared before the crash.`, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px',
                color: '#f0c040',
              }).setOrigin(0.5).setScrollFactor(0).setDepth(316);
              objects.push(summary);

              // Fade flash
              this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 1000,
              });

              // After 2.5 seconds, clean up and trigger crash dialogue
              this.time.delayedCall(2500, () => {
                // Remove update handler
                this.events.off('update', updateHandler);

                // Stop obstacle timer
                obstacleTimer.destroy();

                // Remove keyboard listeners
                this.input.keyboard!.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
                this.input.keyboard!.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

                // Clean up all mini-game objects
                for (const obj of objects) {
                  if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
                }

                this.frozen = false;

                // Mark as required done and trigger crash dialogue
                this.requiredDone = true;
                const chapterDialogue = this.getChapterDialogue();
                const crashLines = chapterDialogue.npcs['ch4_crash'];
                if (crashLines) {
                  this.dialogue.show(crashLines);
                }
              });
            },
          });
        });
      }
    };

    this.events.on('update', updateHandler);
  }

  private playAIDiscoveryCutscene() {
    // Computer tile is at 5,4 — walk player there
    const computerX = 5 * SCALED_TILE + SCALED_TILE / 2;
    const computerY = 4 * SCALED_TILE + SCALED_TILE / 2;

    this.tweens.add({
      targets: this.player,
      x: computerX,
      y: computerY,
      duration: 600,
      ease: 'Linear',
      onComplete: () => {
        // Player stops (sits down) — face up toward computer
        this.player.setFrame(2); // up-idle frame

        // Screen brightens slightly — white overlay
        const glow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
          .setScrollFactor(0).setDepth(50).setAlpha(0);

        this.tweens.add({
          targets: glow,
          alpha: 0.1,
          duration: 500,
          onComplete: () => {
            // Show the pivotal text
            this.dialogue.show([
              { speaker: 'Narrator', text: 'Everything changed in this moment.' },
            ], () => {
              // Hold for 2 seconds, then fade back
              this.time.delayedCall(2000, () => {
                this.tweens.add({
                  targets: glow,
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    glow.destroy();
                    this.frozen = false;
                  },
                });
              });
            });
          },
        });
      },
    });
  }
}
