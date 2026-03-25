import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class HomeScene extends BaseChapterScene {
  constructor() {
    super({ key: 'HomeScene' });
    this.chapterTitle = 'Chapter 1: Home';
    this.nextScene = 'BeachScene';
    this.requiredInteractionId = 'ch0_nolan_call';
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

  // Override to add Frenchie fetch + goodbye cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch0_frenchie_ball') {
      Analytics.trackInteraction(interactable.id);
      this.playFetch();
      this.interactions.consume(interactable.id);
      return;
    }
    if (interactable.id === 'ch0_goodbye') {
      Analytics.trackInteraction(interactable.id);
      this.playGoodbyeCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playGoodbyeCutscene() {
    this.frozen = true;

    // Step 1: JP looks around
    this.dialogue.show([
      { speaker: 'Narrator', text: 'JP looks around his room one last time.' },
    ], () => {
      // Step 2: Walk automatically toward the door (south a couple tiles)
      const doorY = this.player.y + SCALED_TILE * 2;
      this.tweens.add({
        targets: this.player,
        y: doorY,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          // Step 3: Screen dims slightly
          const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
            .setScrollFactor(0).setDepth(50).setAlpha(0);
          this.tweens.add({
            targets: dim,
            alpha: 0.3,
            duration: 400,
            onComplete: () => {
              // Step 4: Emotional dialogue
              this.dialogue.show([
                { speaker: 'Narrator', text: 'He grabs his bag. Hugs his sister. Daps up Pops.' },
                { speaker: 'Narrator', text: 'Ivy whines at the door. She knows.' },
              ], () => {
                // Step 5: Walk south toward exit
                this.tweens.add({
                  targets: this.player,
                  y: this.player.y + SCALED_TILE * 2,
                  duration: 1000,
                  ease: 'Linear',
                  onComplete: () => {
                    // Fade dim back out, unfreeze, trigger transition
                    this.tweens.add({
                      targets: dim,
                      alpha: 0,
                      duration: 300,
                      onComplete: () => {
                        dim.destroy();
                        this.frozen = false;
                      },
                    });
                  },
                });
              });
            },
          });
        },
      });
    });
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
