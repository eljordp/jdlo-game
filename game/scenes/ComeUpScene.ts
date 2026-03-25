import { BaseChapterScene } from './BaseChapterScene';
import { comeUpMap, MapData } from '../data/maps';
import { comeUpDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { Analytics } from '../systems/Analytics';

export class ComeUpScene extends BaseChapterScene {
  constructor() {
    super({ key: 'ComeUpScene' });
    this.chapterTitle = 'Chapter 6: The Come Up';
    this.nextScene = 'LAScene';
    this.requiredInteractionId = 'ch5_first_dollar';
  }

  protected getPlayerTexture(): string {
    return 'player-ch5';
  }

  protected getMusicTrack(): string {
    return 'come-up';
  }

  create() {
    super.create();
    // Client showcases
    this.addNavArrow(3, 13, 'WCT');
    this.addNavArrow(19, 13, 'Sticker Smith');
    this.addNavArrow(13, 16, 'DHL');
    // Exit at 27,23
    this.addNavArrow(27, 22, 'Exit');
  }

  protected getObjectiveHint(): string {
    return 'Visit clients. Build your portfolio.';
  }

  getMapData(): MapData {
    return comeUpMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return comeUpDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch5_wct_showcase: {
        title: 'WCT E-Commerce',
        description: 'Full online store. Product pages, cart, checkout. Built in one week.',
        revenue: '$900',
      },
      ch5_sticker_showcase: {
        title: 'The Sticker Smith',
        description: 'Complete brand overhaul. Website, Google Business, marketing system.',
        revenue: '$1,000',
      },
      ch5_dhl_showcase: {
        title: 'DHL Translator App',
        description: 'Translation tool for warehouse workers. Enterprise deployment.',
        revenue: 'Enterprise',
      },
    };
  }

  // Override to add payment cutscene for first dollar
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch5_first_dollar') {
      Analytics.trackInteraction(interactable.id);
      this.requiredDone = true;
      this.playPaymentCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playPaymentCutscene() {
    this.frozen = true;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(100).setAlpha(0);

    // Payment notification box
    const boxW = 280;
    const boxH = 140;
    const boxX = GAME_WIDTH / 2;
    const boxY = GAME_HEIGHT / 2;

    const box = this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e)
      .setScrollFactor(0).setDepth(101).setAlpha(0).setStrokeStyle(2, 0x30c060);

    // "Payment Received" label
    const label = this.add.text(boxX, boxY - 35, 'Payment Received', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

    // Amount text (will count up)
    const amountText = this.add.text(boxX, boxY + 10, '$0.00', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

    // Fade in overlay and box
    this.tweens.add({
      targets: overlay,
      alpha: 0.6,
      duration: 300,
    });
    this.tweens.add({
      targets: [box, label, amountText],
      alpha: 1,
      duration: 400,
      delay: 200,
      onComplete: () => {
        // Count up from $0 to $300
        let currentAmount = 0;
        const targetAmount = 300;
        const countDuration = 1200; // ms
        const steps = 30;
        const stepDelay = countDuration / steps;
        const increment = targetAmount / steps;

        const counter = this.time.addEvent({
          delay: stepDelay,
          repeat: steps - 1,
          callback: () => {
            currentAmount += increment;
            if (currentAmount > targetAmount) currentAmount = targetAmount;
            amountText.setText('$' + currentAmount.toFixed(2));
          },
        });

        // After counting finishes, show the thought
        this.time.delayedCall(countDuration + 200, () => {
          const thought = this.add.text(boxX, boxY + 45, 'First real dollar from\nsomething I BUILT.', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#f0c040',
            align: 'center',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

          this.tweens.add({
            targets: thought,
            alpha: 1,
            duration: 400,
          });

          // Hold for 2 seconds, then dismiss
          this.time.delayedCall(2000, () => {
            this.tweens.add({
              targets: [overlay, box, label, amountText, thought],
              alpha: 0,
              duration: 400,
              onComplete: () => {
                overlay.destroy();
                box.destroy();
                label.destroy();
                amountText.destroy();
                thought.destroy();
                this.frozen = false;
              },
            });
          });
        });
      },
    });
  }
}
