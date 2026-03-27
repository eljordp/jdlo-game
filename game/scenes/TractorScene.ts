import { BaseChapterScene } from './BaseChapterScene';
import { tractorMap, MapData } from '../data/maps';
import { tractorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { EvolutionAnimation } from '../systems/EvolutionAnimation';
import { SCALED_TILE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class TractorScene extends BaseChapterScene {
  private phoneExaminedFirst = false;
  private tractorPlayed = false;

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

  // Juan shakes head if you looked at phone first
  protected handleNPCDialogue(npcId: string, dialogue: DialogueLine[]): void {
    if (npcId === 'ch4_coworker' && this.phoneExaminedFirst) {
      const chapterDialogue = this.getChapterDialogue();
      const lines = chapterDialogue.npcs['ch4_phone_first'];
      if (lines) {
        this.dialogue.show(lines, () => {
          // Then show normal dialogue
          this.dialogue.show(dialogue);
        });
        return;
      }
    }

    // After crash, Ernesto walks over
    if (npcId === 'ch4_boss' && this.tractorPlayed) {
      const ernesto = this.npcs.find(n => n.id === 'ch4_boss');
      if (ernesto) {
        // Ernesto walks toward player
        const targetX = this.player.x + SCALED_TILE;
        this.tweens.add({
          targets: ernesto.sprite,
          x: targetX,
          duration: 800,
          ease: 'Linear',
        });
      }
    }

    this.dialogue.show(dialogue);
  }

  // Override to add tractor mini-game and post-evolution cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Track if phone was examined before tractor
    if (interactable.id === 'ch4_phone' && !this.tractorPlayed) {
      this.phoneExaminedFirst = true;
    }

    if (interactable.id === 'ch4_tractor' || interactable.id === 'ch4_crash') {
      Analytics.trackInteraction(interactable.id);
      this.tractorPlayed = true;
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
    const rowLines: Phaser.GameObjects.Rectangle[] = [];

    for (const ry of rowYPositions) {
      const rowLine = this.add.rectangle(GAME_WIDTH / 2, ry, GAME_WIDTH, 12, 0x308030)
        .setScrollFactor(0).setDepth(301);
      objects.push(rowLine);
      rowLines.push(rowLine);

      // Vine posts along the row
      for (let vx = 0; vx < GAME_WIDTH + 160; vx += 70) {
        const vine = this.add.rectangle(vx, ry, 6, 22, 0x206020)
          .setScrollFactor(0).setDepth(301);
        objects.push(vine);
        vineElements.push(vine);
      }
    }

    // --- HEAT SHIMMER (upgrade #1) ---
    const shimmerLines: Phaser.GameObjects.Rectangle[] = [];
    const shimmerBaseY = [260, 400, 550, 700];
    for (let i = 0; i < shimmerBaseY.length; i++) {
      const shimmer = this.add.rectangle(GAME_WIDTH / 2, shimmerBaseY[i], GAME_WIDTH, 2, 0xf0d060)
        .setScrollFactor(0).setDepth(301.5).setAlpha(0.1);
      objects.push(shimmer);
      shimmerLines.push(shimmer);

      // Oscillate each shimmer line up/down with offset phase
      this.tweens.add({
        targets: shimmer,
        y: shimmerBaseY[i] + 5,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 500,
      });
    }

    // --- ERNESTO REACTIONS (upgrade #2) ---
    const ernestoYells = [
      '\u00a1CUIDADO!',
      '\u00a1NO MAMES!',
      '\u00a1A LA VERGA!',
    ];
    // Ernesto text object — reusable, positioned top-left like a boss watching
    const ernestoText = this.add.text(30, 110, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ff8844',
    }).setScrollFactor(0).setDepth(311).setAlpha(0);
    objects.push(ernestoText);
    let hitCount = 0;

    // --- SPEED WARNING (upgrade #3) ---
    const speedWarningText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'FASTER!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffaa00',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(311).setAlpha(0);
    objects.push(speedWarningText);
    let speedWarning35Shown = false;
    let speedWarning45Shown = false;
    let dangerZoneActive = false;

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

      // --- Speed warnings (upgrade #3) ---
      if (scrollSpeed >= 3.5 && !speedWarning35Shown) {
        speedWarning35Shown = true;
        speedWarningText.setAlpha(1);
        this.tweens.add({
          targets: speedWarningText,
          alpha: 0,
          duration: 1200,
          ease: 'Quad.easeIn',
        });
      }
      if (scrollSpeed >= 4.5 && !speedWarning45Shown) {
        speedWarning45Shown = true;
        speedWarningText.setAlpha(1);
        speedWarningText.setColor('#ff6600');
        this.tweens.add({
          targets: speedWarningText,
          alpha: 0,
          duration: 1200,
          ease: 'Quad.easeIn',
        });
      }
      // Danger zone: red tint on vineyard rows at speed 5+
      if (scrollSpeed >= 5 && !dangerZoneActive) {
        dangerZoneActive = true;
        for (const rl of rowLines) {
          this.tweens.add({
            targets: rl,
            fillColor: 0x803030,
            duration: 1000,
          });
        }
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
            hitCount++;

            // Screen shake on bump
            this.cameras.main.shake(200, 0.008);

            // Ernesto reaction (upgrade #2) — pick yell based on severity
            const yellIndex = hitCount >= 4 ? 2 : (hitCount >= 2 ? Phaser.Math.Between(0, 1) : 0);
            ernestoText.setText(ernestoYells[yellIndex]);
            ernestoText.setAlpha(1);
            this.tweens.add({
              targets: ernestoText,
              alpha: 0,
              duration: 1200,
              ease: 'Quad.easeOut',
            });

            // Also flash "WATCH IT!" but less prominent now
            watchItText.setAlpha(0.6);
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

      // --- PHONE DISTRACTION at 25 seconds (upgrade #4) ---
      if (elapsed >= 25 && !phoneShown) {
        phoneShown = true;

        // First notification — the tempting one
        const notifBg1 = this.add.rectangle(GAME_WIDTH / 2, -60, 560, 50, 0x1a1a2e, 0.95)
          .setScrollFactor(0).setDepth(312).setStrokeStyle(2, 0x4a4a6a);
        objects.push(notifBg1);

        const notifText1 = this.add.text(GAME_WIDTH / 2, -60, "YouTube: 'How I Made $10K in One Month with AI'", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#e0e0ff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
        objects.push(notifText1);

        // Slide first notification down
        this.tweens.add({
          targets: [notifBg1, notifText1],
          y: 120,
          duration: 600,
          ease: 'Back.easeOut',
        });

        // Second notification 1 second later
        this.time.delayedCall(1000, () => {
          const notifBg2 = this.add.rectangle(GAME_WIDTH / 2, -60, 480, 50, 0x1a1a2e, 0.95)
            .setScrollFactor(0).setDepth(312).setStrokeStyle(2, 0x4a4a6a);
          objects.push(notifBg2);

          const notifText2 = this.add.text(GAME_WIDTH / 2, -60, 'Instagram: @techbro liked your post', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#e0e0ff',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(313);
          objects.push(notifText2);

          this.tweens.add({
            targets: [notifBg2, notifText2],
            y: 178,
            duration: 600,
            ease: 'Back.easeOut',
          });
        });

        // After 2 seconds — internal conflict then phone look
        this.time.delayedCall(2500, () => {
          // Brief internal conflict: "Ignore it..." text
          const ignoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Ignore it...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#aabbaa',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(313).setAlpha(0);
          objects.push(ignoreText);

          this.tweens.add({
            targets: ignoreText,
            alpha: 1,
            duration: 400,
            yoyo: true,
            hold: 800,
            onComplete: () => {
              // NOW JP gives in
              active = false; // player loses control

              // Phone emoji near tractor
              const phoneIcon = this.add.text(tractor.x + 50, tractor.y - 30, '\ud83d\udcf1', {
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
            },
          });
        });
      }
    };

    this.events.on('update', updateHandler);
  }

  private playAIDiscoveryCutscene() {
    this.frozen = true;

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

        const cutsceneObjects: Phaser.GameObjects.GameObject[] = [];

        // --- SLOW BUILD: white glow gradually builds (alpha 0 -> 0.15 over 3 seconds) ---
        const glow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
          .setScrollFactor(0).setDepth(50).setAlpha(0);
        cutsceneObjects.push(glow);

        this.tweens.add({
          targets: glow,
          alpha: 0.15,
          duration: 3000,
          ease: 'Sine.easeIn',
        });

        // --- TERMINAL RECTANGLE fades in after 1.5s ---
        const termW = 360;
        const termH = 200;
        const termX = GAME_WIDTH / 2;
        const termY = GAME_HEIGHT / 2 - 40;

        this.time.delayedCall(1500, () => {
          // Terminal background (dark screen)
          const termBg = this.add.rectangle(termX, termY, termW, termH, 0x0a0a0a, 0.95)
            .setScrollFactor(0).setDepth(51).setAlpha(0).setStrokeStyle(2, 0x333333);
          cutsceneObjects.push(termBg);

          // Terminal bezel/frame
          const termFrame = this.add.rectangle(termX, termY, termW + 16, termH + 16, 0x222222, 0.9)
            .setScrollFactor(0).setDepth(50.5).setAlpha(0);
          cutsceneObjects.push(termFrame);

          // Fade in terminal
          this.tweens.add({
            targets: [termFrame, termBg],
            alpha: { value: 1, duration: 1000, ease: 'Sine.easeIn' },
          });

          // --- TYPE OUT "ChatGPT" letter by letter after terminal fades in ---
          this.time.delayedCall(1200, () => {
            const searchPrefix = '> ';
            const searchWord = 'ChatGPT';
            const typedText = this.add.text(termX - termW / 2 + 30, termY - 20, searchPrefix, {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '16px',
              color: '#33ff33',
            }).setScrollFactor(0).setDepth(52).setAlpha(1);
            cutsceneObjects.push(typedText);

            // Blinking cursor
            const cursor = this.add.text(
              typedText.x + typedText.width + 4, termY - 20, '_', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '16px',
                color: '#33ff33',
              }).setScrollFactor(0).setDepth(52);
            cutsceneObjects.push(cursor);

            // Blink cursor
            this.tweens.add({
              targets: cursor,
              alpha: 0,
              duration: 400,
              yoyo: true,
              repeat: -1,
            });

            let charIndex = 0;
            const typeTimer = this.time.addEvent({
              delay: 200,
              callback: () => {
                if (charIndex < searchWord.length) {
                  typedText.setText(searchPrefix + searchWord.substring(0, charIndex + 1));
                  cursor.x = typedText.x + typedText.width + 4;
                  charIndex++;
                }

                // After typing is done, move to revelation
                if (charIndex >= searchWord.length) {
                  typeTimer.destroy();

                  // Brief pause, then revelation text
                  this.time.delayedCall(1000, () => {
                    // Hide cursor
                    cursor.setAlpha(0);

                    // --- REVELATION TEXT: "Everything changed in this moment." ---
                    const revelationText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'Everything changed in this moment.', {
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '18px',
                      color: '#ffffff',
                    }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setAlpha(0);
                    cutsceneObjects.push(revelationText);

                    this.tweens.add({
                      targets: revelationText,
                      alpha: 1,
                      duration: 800,
                      ease: 'Sine.easeIn',
                    });

                    // Hold for 3 seconds, then show the progression
                    this.time.delayedCall(3000, () => {
                      // Fade out revelation text
                      this.tweens.add({
                        targets: revelationText,
                        alpha: 0,
                        duration: 600,
                      });

                      // --- "Wix. Webflow. Then Claude." — each word with a pause ---
                      const progressionWords = ['Wix.', 'Webflow.', 'Then Claude.'];
                      const wordY = GAME_HEIGHT / 2 + 80;

                      let totalDelay = 800; // start after revelation fades
                      const wordTexts: Phaser.GameObjects.Text[] = [];

                      for (let wi = 0; wi < progressionWords.length; wi++) {
                        const wordDelay = totalDelay;
                        this.time.delayedCall(wordDelay, () => {
                          // Fade out previous word
                          if (wordTexts.length > 0) {
                            const prev = wordTexts[wordTexts.length - 1];
                            this.tweens.add({ targets: prev, alpha: 0, duration: 400 });
                          }

                          const wordText = this.add.text(GAME_WIDTH / 2, wordY, progressionWords[wi], {
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: wi === 2 ? '20px' : '16px',
                            color: wi === 2 ? '#66ffcc' : '#cccccc',
                          }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setAlpha(0);
                          cutsceneObjects.push(wordText);
                          wordTexts.push(wordText);

                          this.tweens.add({
                            targets: wordText,
                            alpha: 1,
                            duration: 500,
                            ease: 'Sine.easeIn',
                          });
                        });

                        totalDelay += 1800; // 1.8s between each word
                      }

                      // After all words shown, fade everything and end (~12s total)
                      this.time.delayedCall(totalDelay + 1500, () => {
                        // Fade out everything
                        this.tweens.add({
                          targets: glow,
                          alpha: 0,
                          duration: 1500,
                          ease: 'Sine.easeOut',
                        });

                        for (const obj of cutsceneObjects) {
                          if (obj && obj.active && obj !== glow) {
                            this.tweens.add({
                              targets: obj,
                              alpha: 0,
                              duration: 1000,
                            });
                          }
                        }

                        this.time.delayedCall(1600, () => {
                          // Destroy all cutscene objects
                          for (const obj of cutsceneObjects) {
                            if (obj && obj.active) obj.destroy();
                          }
                          this.frozen = false;
                        });
                      });
                    });
                  });
                }
              },
              loop: true,
            });
          });
        });
      },
    });
  }
}
