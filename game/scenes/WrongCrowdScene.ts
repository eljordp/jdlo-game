import { BaseChapterScene } from './BaseChapterScene';
import { wrongCrowdMap, MapData } from '../data/maps';
import { wrongCrowdDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class WrongCrowdScene extends BaseChapterScene {
  constructor() {
    super({ key: 'WrongCrowdScene' });
    this.chapterTitle = 'Chapter 3: Wrong Crowd';
    this.nextScene = 'CourtScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch2';
  }

  getMapData(): MapData {
    return wrongCrowdMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    const dialogue = wrongCrowdDialogue;
    // Add the weed sale dialogue that triggers the raid
    dialogue.npcs['ch2_sale'] = [
      { speaker: 'Buyer', text: 'You got that?' },
      { speaker: 'JP', text: 'Yeah. Same as last time.' },
      { speaker: 'Buyer', text: 'Cool cool. Lemme get a—' },
    ];
    return dialogue;
  }

  // Override to handle the raid trigger
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch2_sale') {
      // Show the sale dialogue, then trigger the raid
      const lines = this.getChapterDialogue().npcs['ch2_sale'];
      this.dialogue.show(lines, () => {
        this.triggerRaid();
      });
      this.interactions.consume(interactable.id);
      return;
    }
    // Default behavior for other interactables
    super.handleInteractable(interactable);
  }

  private triggerRaid() {
    this.frozen = true;

    // Screen shake
    this.cameras.main.shake(600, 0.015);

    // Flash red
    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000
    ).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: 0.4,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // "POLICE!" text
        const policeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'POLICE!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

        this.tweens.add({
          targets: policeText,
          alpha: 1,
          duration: 300,
          hold: 1000,
          onComplete: () => {
            // Fade to black then court scene
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('CourtScene');
            });
          },
        });
      },
    });
  }
}
