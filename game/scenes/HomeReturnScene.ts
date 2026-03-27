import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeReturnDialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';

/**
 * Home Return — playable chapter. Same house from Ch1, but JP is different now.
 * Walk around, talk to Pops, Mom, Sister, Ivy. Everyone's positive.
 * After talking to Pops (required), exit triggers EndScene.
 */
export class HomeReturnScene extends BaseChapterScene {
  private goldenOverlay!: Phaser.GameObjects.Rectangle;
  private ivyTriggered = false;
  private popsTalked = false;
  private arrivalDone = false;
  private exitDialogueShown = false;
  private momOverride = false;

  constructor() {
    super({ key: 'HomeReturnScene' });
    this.chapterTitle = 'Home';
    this.nextScene = 'EndScene';
    // ch0_goodbye is the interactable near exit — but we make Pops the real gate
    this.requiredInteractionId = '';
  }

  protected getPlayerTexture(): string {
    return 'player-ch7';
  }

  protected getMusicTrack(): string {
    return '';
  }

  create() {
    super.create();

    // Reset state
    this.ivyTriggered = false;
    this.popsTalked = false;
    this.arrivalDone = false;
    this.exitDialogueShown = false;
    this.momOverride = false;

    // Override homeMap triggers — point to EndScene at CORRECT y: 35 (expanded map)
    this.triggers = [];
    for (let x = 11; x <= 18; x++) {
      this.triggers.push({ x, y: 35, action: 'scene', target: 'EndScene' });
    }

    this.addNavArrow(13, 34, 'The End');

    // ── Golden hour tint — warm overlay that makes everything feel different ──
    this.goldenOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH * 3, GAME_HEIGHT * 3,
      0xfff8e0
    ).setAlpha(0.06).setDepth(300).setScrollFactor(0);

    // ── Arrival cutscene ──
    this.playArrivalSequence();
  }

  private playArrivalSequence() {
    this.frozen = true;

    // Small delay after chapter title fades, then arrival narration
    this.time.delayedCall(3800, () => {
      this.dialogue.show(
        [{ speaker: 'Narrator', text: 'The drive felt longer than he remembered.' }],
        () => {
          this.time.delayedCall(800, () => {
            this.dialogue.show(
              [{ speaker: 'Narrator', text: 'Everything looks the same. But nothing feels the same.' }],
              () => {
                this.frozen = false;
                this.arrivalDone = true;
              }
            );
          });
        }
      );
    });
  }

  // ── Override handleInteract to intercept Pops and Mom NPC conversations ──
  protected handleInteract() {
    // If dialogue is active, advance it (must check before anything else)
    if (this.dialogue.isActive()) {
      this.dialogue.advance();
      return;
    }

    if (this.frozen) return;

    // Get player tile position and facing tile
    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    let facingX = playerTileX;
    let facingY = playerTileY;
    if (this.facing === 'up') facingY--;
    if (this.facing === 'down') facingY++;
    if (this.facing === 'left') facingX--;
    if (this.facing === 'right') facingX++;

    // Check if facing Pops NPC
    for (const npc of this.npcs) {
      const npcTileX = Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
      const npcTileY = Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

      if (npcTileX === facingX && npcTileY === facingY) {
        if (npc.id === 'ch0_pops' && !this.popsTalked) {
          this.playPopsReunion(npc.dialogue);
          return;
        }
        if (npc.id === 'ch0_mom' && !this.momOverride) {
          this.playMomMoment();
          return;
        }
      }
    }

    // Fall through to base for everything else
    super.handleInteract();
  }

  // ── Pops reunion — emotional peak of the game ──
  private playPopsReunion(baseDialogue: DialogueLine[]) {
    this.frozen = true;

    // Dim screen — intimate moment
    const dimOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH * 3, GAME_HEIGHT * 3,
      0x000000
    ).setAlpha(0).setDepth(301).setScrollFactor(0);

    this.tweens.add({
      targets: dimOverlay,
      alpha: 0.15,
      duration: 600,
      ease: 'Sine.easeIn',
    });

    // Play the full Pops dialogue from story.ts
    this.dialogue.show(baseDialogue, () => {
      // Emotional peak — extra lines after the story dialogue
      this.time.delayedCall(400, () => {
        this.dialogue.show(
          [{ speaker: 'Pops', text: 'Most people don\'t come back from that, Jordan.' }],
          () => {
            // Long pause — let it sit
            this.time.delayedCall(2000, () => {
              this.dialogue.show(
                [{ speaker: 'Pops', text: 'Now you\'re finally listening.' }],
                () => {
                  // Camera flash white — like a memory being sealed
                  const flash = this.add.rectangle(
                    GAME_WIDTH / 2, GAME_HEIGHT / 2,
                    GAME_WIDTH * 3, GAME_HEIGHT * 3,
                    0xffffff
                  ).setAlpha(0).setDepth(302).setScrollFactor(0);

                  this.tweens.add({
                    targets: flash,
                    alpha: 0.2,
                    duration: 150,
                    yoyo: true,
                    hold: 150,
                    onComplete: () => {
                      flash.destroy();

                      // Fade dim overlay back out
                      this.tweens.add({
                        targets: dimOverlay,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => {
                          dimOverlay.destroy();
                          this.popsTalked = true;
                          this.requiredDone = true;
                          this.frozen = false;
                        },
                      });
                    },
                  });
                }
              );
            });
          }
        );
      });
    });
  }

  // ── Mom moment — quiet, understated, hits different ──
  private playMomMoment() {
    this.frozen = true;
    this.momOverride = true;

    this.dialogue.show(
      [
        { speaker: 'Mom', text: '...' },
        { speaker: 'Narrator', text: 'She doesn\'t say much. But she holds him a little longer.' },
      ],
      () => {
        // Now show the real Mom dialogue from story data
        const chapterDialogue = this.getChapterDialogue();
        const momLines = chapterDialogue.npcs['ch0_mom'];
        if (momLines) {
          this.dialogue.show(momLines, () => {
            this.frozen = false;
          });
        } else {
          this.frozen = false;
        }
      }
    );
  }

  // ── Override transitionToScene to show final walk dialogue ──
  protected transitionToScene(sceneKey: string, sceneData?: Record<string, string>) {
    if (!this.exitDialogueShown) {
      this.exitDialogueShown = true;
      this.frozen = true;

      this.dialogue.show(
        [{ speaker: 'Narrator', text: 'To come home and make Pops proud.' }],
        () => {
          this.time.delayedCall(600, () => {
            this.dialogue.show(
              [{ speaker: 'Narrator', text: 'That was always the point.' }],
              () => {
                // Now do the real transition
                super.transitionToScene(sceneKey, sceneData);
              }
            );
          });
        }
      );
      return;
    }

    super.transitionToScene(sceneKey, sceneData);
  }

  // ── Ivy proximity check — she goes crazy when JP is near ──
  update(time: number, delta: number) {
    super.update(time, delta);

    if (!this.arrivalDone || this.ivyTriggered) return;

    // Find Ivy (the frenchie)
    const ivy = this.npcs.find(n => n.id === 'ch0_frenchie');
    if (!ivy) return;

    const playerTileX = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const playerTileY = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);
    const ivyTileX = Math.round((ivy.sprite.x - SCALED_TILE / 2) / SCALED_TILE);
    const ivyTileY = Math.round((ivy.sprite.y - SCALED_TILE / 2) / SCALED_TILE);

    const dist = Math.abs(playerTileX - ivyTileX) + Math.abs(playerTileY - ivyTileY);

    if (dist <= 3) {
      this.ivyTriggered = true;
      this.playIvyFreakout(ivy.sprite);
    }
  }

  private playIvyFreakout(ivySprite: Phaser.GameObjects.Sprite) {
    // Rapid wiggle — Ivy is LOSING it
    this.tweens.add({
      targets: ivySprite,
      angle: 15,
      duration: 100,
      yoyo: true,
      repeat: 8,
      ease: 'Sine.easeInOut',
      onStart: () => {
        ivySprite.angle = -15;
      },
      onUpdate: (_tween: Phaser.Tweens.Tween, target: Phaser.GameObjects.Sprite) => {
        // Alternate between -15 and 15
        if (target.angle >= 14) target.angle = -15;
      },
      onComplete: () => {
        ivySprite.angle = 0;
      },
    });

    // Floating text: "Ivy remembers."
    const floatText = this.add.text(
      ivySprite.x,
      ivySprite.y - 40,
      'Ivy remembers.',
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(305).setAlpha(0);

    // Fade up and float higher, then fade out
    this.tweens.add({
      targets: floatText,
      alpha: 1,
      y: ivySprite.y - 70,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: floatText,
          alpha: 0,
          y: ivySprite.y - 100,
          duration: 800,
          ease: 'Sine.easeIn',
          onComplete: () => floatText.destroy(),
        });
      },
    });
  }

  protected getObjectiveHint(): string {
    return 'You\'re home. Talk to your family.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeReturnDialogue;
  }
}
