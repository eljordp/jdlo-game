import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE } from '../config';

export class HomeScene extends BaseChapterScene {
  constructor() {
    super({ key: 'HomeScene' });
    this.chapterTitle = 'Chapter 1: Home';
    this.nextScene = 'BeachScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch0';
  }

  protected getMusicTrack(): string {
    return 'home';
  }

  create() {
    super.create();
    this.addNavArrow(10, 23, 'Leave home');
  }

  protected getObjectiveHint(): string {
    return 'Explore your house. Talk to family. Leave when ready.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeDialogue;
  }

  // Override to add Frenchie fetch interaction
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch0_frenchie_ball') {
      this.playFetch();
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playFetch() {
    // Find the Frenchie NPC sprite
    const frenchie = this.npcs.find(n => n.id === 'ch0_frenchie');
    if (!frenchie) return;

    this.frozen = true;
    const frenchieSprite = frenchie.sprite;
    const startX = frenchieSprite.x;
    const startY = frenchieSprite.y;

    // Show "JP throws the ball!" text
    this.dialogue.show([
      { speaker: 'Narrator', text: 'JP picks up a tennis ball and throws it across the yard.' },
    ], () => {
      // Create a ball
      const ball = this.add.circle(
        this.player.x, this.player.y - 20,
        6, 0xc0d030
      ).setDepth(15);

      // Ball flies across yard
      const targetX = startX + 200;
      const targetY = startY - 40;

      this.tweens.add({
        targets: ball,
        x: targetX,
        y: targetY,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Ball bounces
          this.tweens.add({
            targets: ball,
            y: targetY + 20,
            duration: 200,
            yoyo: true,
          });

          // Frenchie chases the ball
          this.tweens.add({
            targets: frenchieSprite,
            x: targetX,
            y: targetY + 20,
            duration: 800,
            ease: 'Quad.easeInOut',
            onComplete: () => {
              // Frenchie got the ball!
              ball.destroy();

              // Frenchie runs back with a happy wobble
              this.tweens.add({
                targets: frenchieSprite,
                x: startX,
                y: startY,
                duration: 1000,
                ease: 'Quad.easeInOut',
                onComplete: () => {
                  // Frenchie wiggles
                  this.tweens.add({
                    targets: frenchieSprite,
                    angle: 8,
                    duration: 150,
                    yoyo: true,
                    repeat: 4,
                    onComplete: () => {
                      frenchieSprite.setAngle(0);
                      this.dialogue.show([
                        { speaker: 'Narrator', text: 'The Frenchie drops the ball at JP\'s feet and wags his whole body. Again. Again. Again.' },
                        { speaker: 'JP\'s Mind', text: 'This dog is the only one who never asks me what I\'m doing with my life.' },
                      ], () => {
                        this.frozen = false;
                      });
                    },
                  });
                },
              });
            },
          });
        },
      });
    });
  }
}
