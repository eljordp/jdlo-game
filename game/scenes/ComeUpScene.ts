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
    let active = true;

    const lines = [
      'npx create-next-app',
      'export default function',
      'className="flex gap-4"',
      'npm run build',
      'vercel --prod',
    ];
    let lineIndex = 0;
    let charIndex = 0;
    let totalCharsTyped = 0;
    const startTime = Date.now();

    const monoStyle = {
      fontFamily: '"Press Start 2P", monospace',
    };

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Terminal background
    const termW = GAME_WIDTH - 160;
    const termH = GAME_HEIGHT - 140;
    const terminal = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0x0a0a1a)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x30c060);
    objects.push(terminal);

    // Title bar
    const titleBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 14, termW, 28, 0x1a1a2e)
      .setScrollFactor(0).setDepth(301);
    objects.push(titleBar);
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - termH / 2 + 14, 'BUILD THE SITE', {
      ...monoStyle, fontSize: '10px', color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(titleText);

    // Progress bar background
    const barY = GAME_HEIGHT / 2 - termH / 2 + 44;
    const barW = termW - 60;
    const barBg = this.add.rectangle(GAME_WIDTH / 2, barY, barW, 12, 0x1a1a2e)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(1, 0x333355);
    objects.push(barBg);
    // Progress bar fill
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2, barY, 0, 12, 0x30c060)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(barFill);
    // Progress label
    const progressLabel = this.add.text(GAME_WIDTH / 2 + barW / 2 + 10, barY, '0%', {
      ...monoStyle, fontSize: '8px', color: '#30c060',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(progressLabel);

    // WPM display
    const wpmText = this.add.text(GAME_WIDTH / 2 + termW / 2 - 30, GAME_HEIGHT / 2 - termH / 2 + 14, '0 WPM', {
      ...monoStyle, fontSize: '8px', color: '#aaaacc',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(wpmText);

    // Line number + prompt
    const lineY = GAME_HEIGHT / 2 - 20;
    const promptX = GAME_WIDTH / 2 - termW / 2 + 40;

    const lineNumText = this.add.text(promptX - 20, lineY - 30, '1/5', {
      ...monoStyle, fontSize: '8px', color: '#555577',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    objects.push(lineNumText);

    // Target line (untyped chars in grey)
    const targetText = this.add.text(promptX, lineY, '', {
      ...monoStyle, fontSize: '14px', color: '#555577',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);
    objects.push(targetText);

    // Typed text (green, overlaid on top)
    const typedText = this.add.text(promptX, lineY, '', {
      ...monoStyle, fontSize: '14px', color: '#30c060',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302);
    objects.push(typedText);

    // Blinking cursor
    const cursor = this.add.text(promptX, lineY, '_', {
      ...monoStyle, fontSize: '14px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(303);
    objects.push(cursor);

    // Cursor blink
    const cursorBlink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        cursor.setAlpha(cursor.alpha === 1 ? 0 : 1);
      },
    });

    // Red flash overlay (for wrong keypress)
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, termW, termH, 0xff4444, 0)
      .setScrollFactor(0).setDepth(303);
    objects.push(flash);

    // Instruction text
    const instrText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + termH / 2 - 30, 'Type each line to build the site', {
      ...monoStyle, fontSize: '8px', color: '#555577',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instrText);

    // "Line shipped!" text (hidden initially)
    const shippedText = this.add.text(GAME_WIDTH / 2, lineY + 40, '', {
      ...monoStyle, fontSize: '10px', color: '#30c060',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setAlpha(0);
    objects.push(shippedText);

    // Completed lines display area
    const completedTexts: Phaser.GameObjects.Text[] = [];
    const completedStartY = lineY - 80;

    const totalChars = lines.reduce((sum, l) => sum + l.length, 0);

    const updateProgress = () => {
      let charsCompleted = 0;
      for (let i = 0; i < lineIndex; i++) charsCompleted += lines[i].length;
      charsCompleted += charIndex;
      const pct = Math.round((charsCompleted / totalChars) * 100);
      barFill.setDisplaySize(barW * (pct / 100), 12);
      progressLabel.setText(`${pct}%`);
    };

    const updateWPM = () => {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      if (elapsed <= 0) return;
      const words = totalCharsTyped / 5; // standard: 5 chars = 1 word
      const wpm = Math.round(words / elapsed);
      wpmText.setText(`${wpm} WPM`);
      return wpm;
    };

    const loadLine = () => {
      if (lineIndex >= lines.length) {
        finishGame();
        return;
      }
      charIndex = 0;
      const line = lines[lineIndex];
      targetText.setText(line);
      typedText.setText('');
      cursor.setX(promptX);
      cursor.setAlpha(1);
      lineNumText.setText(`${lineIndex + 1}/5`);
      updateProgress();
    };

    const advanceLine = () => {
      // Show completed line in the history area
      const completedY = completedStartY + completedTexts.length * 18;
      const done = this.add.text(promptX, completedY, `> ${lines[lineIndex]}`, {
        ...monoStyle, fontSize: '8px', color: '#30c060',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(301).setAlpha(0.5);
      objects.push(done);
      completedTexts.push(done);

      // Flash "Line shipped!"
      shippedText.setText('Line shipped!');
      shippedText.setAlpha(1);
      this.tweens.add({
        targets: shippedText,
        alpha: 0,
        duration: 800,
        delay: 400,
      });

      // Flash terminal border green
      terminal.setStrokeStyle(3, 0x30c060);
      this.time.delayedCall(300, () => {
        terminal.setStrokeStyle(2, 0x30c060);
      });

      lineIndex++;
      this.time.delayedCall(600, () => {
        loadLine();
      });
    };

    const finishGame = () => {
      active = false;
      cursorBlink.destroy();
      this.input.keyboard!.off('keydown', keyHandler);
      this.input.off('pointerdown', pointerListener);

      const elapsed = (Date.now() - startTime) / 1000;
      const minutes = elapsed / 60;
      const words = totalCharsTyped / 5;
      const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

      // Clear typing area
      targetText.setText('');
      typedText.setText('');
      cursor.setAlpha(0);
      lineNumText.setText('');
      instrText.setText('');

      // Show results
      titleText.setText('SITE DEPLOYED!');
      titleText.setColor('#30c060');

      const timeStr = elapsed < 60
        ? `${elapsed.toFixed(1)}s`
        : `${Math.floor(elapsed / 60)}m ${Math.round(elapsed % 60)}s`;

      const resultText = this.add.text(GAME_WIDTH / 2, lineY - 10, `${wpm} WPM  //  ${timeStr}`, {
        ...monoStyle, fontSize: '16px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      objects.push(resultText);

      const flavor = wpm >= 60
        ? 'Senior dev energy.'
        : wpm >= 40
        ? 'JP ships fast.'
        : wpm >= 20
        ? "Still learning. But it's live."
        : 'Slow and steady. The site works.';

      const flavorText = this.add.text(GAME_WIDTH / 2, lineY + 30, flavor, {
        ...monoStyle, fontSize: '10px', color: '#aaaacc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(flavorText);

      // Fill progress to 100%
      barFill.setDisplaySize(barW, 12);
      progressLabel.setText('100%');
      wpmText.setText(`${wpm} WPM`);

      this.time.delayedCall(3000, () => {
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    };

    const handleCorrectChar = () => {
      const line = lines[lineIndex];
      typedText.setText(line.substring(0, charIndex + 1));
      charIndex++;
      totalCharsTyped++;

      // Move cursor
      // Approximate character width for "Press Start 2P" at 14px
      cursor.setX(promptX + charIndex * 12.5);
      cursor.setAlpha(1);

      updateProgress();
      updateWPM();

      // Check if line complete
      if (charIndex >= line.length) {
        advanceLine();
      }
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (!active || lineIndex >= lines.length) return;

      const line = lines[lineIndex];
      const expected = line[charIndex];

      // Only handle single printable characters and space
      if (event.key.length !== 1) return;

      if (event.key === expected) {
        handleCorrectChar();

        // Green pulse on cursor
        this.tweens.add({
          targets: cursor,
          scaleY: 1.3,
          duration: 60,
          yoyo: true,
        });
      } else {
        // Wrong key — red flash, don't advance
        flash.setFillStyle(0xff4444, 0.2);
        flash.setAlpha(1);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
        });

        // Shake the target text
        const origX = targetText.x;
        this.tweens.add({
          targets: [targetText, typedText],
          x: origX + 4,
          duration: 40,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            targetText.setX(origX);
            typedText.setX(origX);
          },
        });
      }
    };

    // Touch support — auto-complete current character
    const pointerListener = () => {
      if (!active || lineIndex >= lines.length) return;
      handleCorrectChar();
    };

    this.input.keyboard!.on('keydown', keyHandler);
    this.input.on('pointerdown', pointerListener);

    // Start first line
    loadLine();
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
