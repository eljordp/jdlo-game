import { BaseChapterScene } from './BaseChapterScene';
import { tractorMap, MapData } from '../data/maps';
import { tractorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { EvolutionAnimation } from '../systems/EvolutionAnimation';
import { SCALED_TILE, GAME_WIDTH, GAME_HEIGHT } from '../config';

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

  // Override to add post-evolution cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch4_ai_discovery' && interactable.type === 'evolve') {
      this.frozen = true;
      const chapterDialogue = this.getChapterDialogue();
      const discoveryLines = chapterDialogue.npcs[interactable.id];
      if (discoveryLines) {
        this.dialogue.show(discoveryLines, () => {
          EvolutionAnimation.play(
            this,
            ['ChatGPT', 'Wix', 'Webflow', 'Lovable', 'Claude Code'],
            () => {
              // Post-evolution mini-cutscene
              this.playAIDiscoveryCutscene();
              this.interactions.consume(interactable.id);
            }
          );
        });
      }
      return;
    }
    super.handleInteractable(interactable);
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
