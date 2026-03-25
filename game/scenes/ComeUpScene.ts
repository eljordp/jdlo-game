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

  // Override to add typing mini-game and payment cutscene
  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch5_stack' || interactable.id === 'ch5_github') {
      Analytics.trackInteraction(interactable.id);
      this.playTypingMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch5_first_dollar') {
      Analytics.trackInteraction(interactable.id);
      this.requiredDone = true;
      this.playPaymentCutscene();
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playTypingMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let correct = 0;
    let total = 0;
    const maxChars = 15;
    let active = true;

    // Code-like characters to type
    const codeChars = 'abcdefghijklmnopqrstuvwxyz0123456789=(){}[];:.'.split('');
    // Code line displayed at top
    const codeLine = 'const site = new Website()';

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Terminal-style background
    const terminal = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 200, GAME_HEIGHT - 200, 0x0a0a1a)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x30c060);
    objects.push(terminal);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 130, 'SHIP IT!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Code context line (scrolling effect)
    const contextLine = this.add.text(GAME_WIDTH / 2, 190, `> ${codeLine}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#4080c0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(contextLine);

    // Progress
    const progressText = this.add.text(GAME_WIDTH / 2, 230, `0/${maxChars}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(progressText);

    // Target character — BIG in center
    const targetChar = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '64px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(targetChar);

    // Instruction
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'Type the character!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Flash indicator (green/red)
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 120, 100, 0x000000, 0)
      .setScrollFactor(0).setDepth(301);
    objects.push(flash);

    // Typed so far line
    const typedLine = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(typedLine);

    let currentTarget = '';
    let typedSoFar = '';

    const nextChar = () => {
      if (total >= maxChars) {
        finishGame();
        return;
      }
      currentTarget = codeChars[Phaser.Math.Between(0, codeChars.length - 1)];
      targetChar.setText(currentTarget);
      targetChar.setColor('#ffffff');
      progressText.setText(`${total}/${maxChars}`);
    };

    const finishGame = () => {
      active = false;
      // Remove keyboard listener
      this.input.keyboard!.off('keydown', keyHandler);

      const accuracy = Math.round((correct / maxChars) * 100);
      title.setText('DEPLOYED!');
      targetChar.setText('');
      instr.setText(`Site deployed! Client happy.`);

      const resultMsg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `${correct}/${maxChars} correct (${accuracy}%)`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '16px',
        color: accuracy >= 80 ? '#30c060' : accuracy >= 50 ? '#f0c040' : '#ff4444',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      objects.push(resultMsg);

      const flavor = accuracy >= 80
        ? 'Clean code. Ship it.'
        : accuracy >= 50
        ? 'Some bugs, but it works. Ship it anyway.'
        : 'Rough draft. But JP ships it and iterates.';

      const flavorText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, flavor, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaacc',
        align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(flavorText);

      this.time.delayedCall(3000, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (!active) return;

      const pressed = event.key.toLowerCase();
      // Only handle single printable characters
      if (pressed.length !== 1) return;

      total++;

      if (pressed === currentTarget) {
        correct++;
        typedSoFar += currentTarget;
        typedLine.setText(typedSoFar);

        // Green flash
        flash.setFillStyle(0x30c060, 0.3);
        targetChar.setColor('#30c060');
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
        });

        // Scale pop
        this.tweens.add({
          targets: targetChar,
          scale: 1.3,
          duration: 80,
          yoyo: true,
        });
      } else {
        typedSoFar += '?';
        typedLine.setText(typedSoFar);

        // Red flash
        flash.setFillStyle(0xff4444, 0.3);
        targetChar.setColor('#ff4444');
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
        });

        // Shake
        this.tweens.add({
          targets: targetChar,
          x: targetChar.x + 6,
          duration: 40,
          yoyo: true,
          repeat: 2,
        });
      }

      // Next character after brief delay
      this.time.delayedCall(300, () => {
        nextChar();
      });
    };

    this.input.keyboard!.on('keydown', keyHandler);

    // Also support touch — show the current char and auto-succeed on tap
    const pointerListener = () => {
      if (!active) return;
      // Touch counts as correct
      total++;
      correct++;
      typedSoFar += currentTarget;
      typedLine.setText(typedSoFar);
      flash.setFillStyle(0x30c060, 0.3);
      this.tweens.add({ targets: flash, alpha: 0, duration: 200 });
      this.time.delayedCall(300, () => nextChar());
    };
    this.input.on('pointerdown', pointerListener);

    // Start
    nextChar();
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
