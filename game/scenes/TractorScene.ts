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

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 60, 'MOWING THE FIELD', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    const instructions = this.add.text(GAME_WIDTH / 2, 100, 'UP/DOWN to steer between rows!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instructions);

    // Vineyard rows — 5 green rows at fixed Y positions
    const rowYPositions = [250, 370, 490, 610, 730];
    const rows: Phaser.GameObjects.Rectangle[] = [];
    for (const ry of rowYPositions) {
      const row = this.add.rectangle(GAME_WIDTH / 2, ry, GAME_WIDTH, 14, 0x308030)
        .setScrollFactor(0).setDepth(301);
      objects.push(row);
      rows.push(row);

      // Vine details on each row
      for (let vx = 0; vx < GAME_WIDTH; vx += 80) {
        const vine = this.add.rectangle(vx, ry, 6, 20, 0x206020)
          .setScrollFactor(0).setDepth(301);
        objects.push(vine);
        rows.push(vine); // include in scroll group
      }
    }

    // Tractor — yellow rectangle at left side, between rows
    const tractorY = 310; // between row 0 and row 1
    const tractor = this.add.rectangle(200, tractorY, 30, 20, 0xd4a020)
      .setScrollFactor(0).setDepth(302);
    objects.push(tractor);

    // Tractor detail — wheels
    const wheel1 = this.add.circle(190, tractorY + 12, 5, 0x303030)
      .setScrollFactor(0).setDepth(302);
    const wheel2 = this.add.circle(210, tractorY + 12, 5, 0x303030)
      .setScrollFactor(0).setDepth(302);
    objects.push(wheel1, wheel2);

    // Scroll speed for rows (simulating forward movement)
    const scrollSpeed = 3;
    let tractorVY = 0;
    let phoneShown = false;
    let crashed = false;
    const startTime = this.time.now;

    // Input handlers
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Game loop via update event
    const updateHandler = () => {
      if (!active || crashed) return;

      const elapsed = (this.time.now - startTime) / 1000;

      // Scroll rows left to simulate movement
      for (const row of rows) {
        row.x -= scrollSpeed;
        if (row.x < -GAME_WIDTH / 2) {
          row.x += GAME_WIDTH * 2;
        }
      }

      // Steer tractor
      if (upKey.isDown) {
        tractorVY = -3;
      } else if (downKey.isDown) {
        tractorVY = 3;
      } else {
        tractorVY *= 0.9;
      }

      // After 8 seconds — phone appears and tractor drifts
      if (elapsed >= 8 && !phoneShown) {
        phoneShown = true;
        active = false; // stop player control

        // Phone icon drifts in
        const phone = this.add.text(GAME_WIDTH + 50, tractor.y - 40, '📱', {
          fontSize: '28px',
        }).setScrollFactor(0).setDepth(303);
        objects.push(phone);

        this.tweens.add({
          targets: phone,
          x: tractor.x + 60,
          duration: 1200,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Tractor starts drifting toward nearest row
            const nearestRowY = rowYPositions.reduce((a, b) =>
              Math.abs(b - tractor.y) < Math.abs(a - tractor.y) ? b : a
            );

            this.tweens.add({
              targets: [tractor, wheel1, wheel2],
              y: nearestRowY,
              duration: 800,
              ease: 'Quad.easeIn',
              onComplete: () => {
                crashed = true;
                // RED FLASH
                const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0.6)
                  .setScrollFactor(0).setDepth(305);
                objects.push(flash);

                // Screen shake
                this.cameras.main.shake(500, 0.02);

                // CRUNCH text
                const crunch = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CRUNCH!', {
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '36px',
                  color: '#ff2222',
                }).setOrigin(0.5).setScrollFactor(0).setDepth(306);
                objects.push(crunch);

                // Fade flash
                this.tweens.add({
                  targets: flash,
                  alpha: 0,
                  duration: 800,
                });

                // After 2 seconds, clean up and trigger crash dialogue
                this.time.delayedCall(2000, () => {
                  // Remove update handler
                  this.events.off('update', updateHandler);

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
        return;
      }

      // Apply tractor movement
      tractor.y += tractorVY;
      wheel1.y = tractor.y + 12;
      wheel2.y = tractor.y + 12;

      // Clamp tractor to play area
      tractor.y = Phaser.Math.Clamp(tractor.y, 180, 800);
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
