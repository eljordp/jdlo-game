import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';

export class JailScene extends BaseChapterScene {
  constructor() {
    super({ key: 'JailScene' });
    this.chapterTitle = 'Chapter 4: Locked Up';
    this.nextScene = 'TractorScene';
    this.requiredInteractionId = 'ch3_bed';
  }

  protected getPlayerTexture(): string {
    return 'player-ch3';
  }

  protected getMusicTrack(): string {
    return 'jail';
  }

  create() {
    super.create();
    // Exit triggers at y=25, x=17-18
    this.addNavArrow(17, 24, 'Freedom');
  }

  protected getObjectiveHint(): string {
    return 'Survive. Study. Find the exit.';
  }

  getMapData(): MapData {
    return jailMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return jailDialogue;
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch3_bed') {
      this.playTimeSkip();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch3_pushups') {
      this.playPushupMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    if (interactable.id === 'ch3_dice_watch') {
      this.playDiceMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    super.handleInteractable(interactable);
  }

  private playPushupMinigame() {
    this.frozen = true;
    let count = 0;
    let timeLeft = 10;
    let active = true;

    // Darken background
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'PUSHUPS!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, 140, 'MASH SPACE!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Counter
    const counter = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Timer
    const timer = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, '10s', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Player sprite for pushup animation
    const pushupSprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, this.getPlayerTexture(), 0)
      .setScale(6).setScrollFactor(0).setDepth(301);

    // Pushup handler
    const doPushup = () => {
      if (!active) return;
      count++;
      counter.setText(String(count));

      // Pushup animation — squish down then up
      this.tweens.add({
        targets: pushupSprite,
        scaleY: 3,
        scaleX: 7,
        duration: 80,
        yoyo: true,
        ease: 'Power1',
      });

      // Counter pulse
      this.tweens.add({
        targets: counter,
        scale: 1.2,
        duration: 60,
        yoyo: true,
      });
    };

    // Listen for space mashing
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const pushupListener = () => doPushup();
    spaceKey.on('down', pushupListener);

    // Also support touch/click mashing
    const pointerListener = () => doPushup();
    this.input.on('pointerdown', pointerListener);

    // Countdown timer
    const timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        timeLeft--;
        timer.setText(`${timeLeft}s`);

        if (timeLeft <= 3) {
          timer.setColor('#ff4444');
        }

        if (timeLeft <= 0) {
          active = false;
          spaceKey.off('down', pushupListener);
          this.input.off('pointerdown', pointerListener);

          // Show result
          instructions.setText('TIME!');
          timer.setVisible(false);

          // Result message
          let message = '';
          if (count >= 50) {
            message = '50+ pushups. Beast mode. Clear mind. Strong body.';
            counter.setColor('#f0c040');
          } else if (count >= 30) {
            message = `${count} pushups. Not bad. Keep grinding.`;
            counter.setColor('#40c040');
          } else if (count >= 15) {
            message = `${count} pushups. It's a start.`;
          } else {
            message = `${count} pushups. JP's still building strength.`;
          }

          const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, message, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#aaaacc',
            wordWrap: { width: 600 },
            align: 'center',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

          // Clean up after 3 seconds
          this.time.delayedCall(3000, () => {
            overlay.destroy();
            title.destroy();
            instructions.destroy();
            counter.destroy();
            timer.destroy();
            pushupSprite.destroy();
            result.destroy();
            this.frozen = false;
          });
        }
      },
    });
  }

  private playDiceMinigame() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    let roundNum = 0;
    let wins = 0;
    const maxRounds = 3;

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'YARD DICE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Round info
    const roundText = this.add.text(GAME_WIDTH / 2, 130, 'Round 1/3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(roundText);

    // Two dice (white squares)
    const diceSize = 60;
    const die1Bg = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2, diceSize, diceSize, 0xffffff)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(3, 0x333333);
    const die2Bg = this.add.rectangle(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2, diceSize, diceSize, 0xffffff)
      .setScrollFactor(0).setDepth(301).setStrokeStyle(3, 0x333333);
    objects.push(die1Bg, die2Bg);

    // Dice value text (shown as number for simplicity, with dot patterns)
    const die1Text = this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#111111',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    const die2Text = this.add.text(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#111111',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(die1Text, die2Text);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'Press SPACE to roll', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Result text
    const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(resultText);

    // Win counter
    const winText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 210, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(winText);

    let rolling = false;
    let canRoll = true;

    const rollDice = () => {
      if (!canRoll || rolling) return;
      rolling = true;
      canRoll = false;
      resultText.setText('');
      instr.setText('Rolling...');

      // Rapid random cycling for 1 second
      let rollCount = 0;
      const rollEvent = this.time.addEvent({
        delay: 60,
        repeat: 15,
        callback: () => {
          rollCount++;
          die1Text.setText(String(Phaser.Math.Between(1, 6)));
          die2Text.setText(String(Phaser.Math.Between(1, 6)));

          // Shake dice
          die1Bg.setAngle(Phaser.Math.Between(-10, 10));
          die2Bg.setAngle(Phaser.Math.Between(-10, 10));
        },
      });

      // Land on final values after rolling
      this.time.delayedCall(1100, () => {
        rolling = false;
        const val1 = Phaser.Math.Between(1, 6);
        const val2 = Phaser.Math.Between(1, 6);
        const total = val1 + val2;

        die1Text.setText(String(val1));
        die2Text.setText(String(val2));
        die1Bg.setAngle(0);
        die2Bg.setAngle(0);

        // Bounce tween on dice
        this.tweens.add({
          targets: [die1Bg, die1Text],
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
        this.tweens.add({
          targets: [die2Bg, die2Text],
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          delay: 50,
        });

        roundNum++;

        if (total >= 7) {
          wins++;
          resultText.setText(`${total}! You win! +1 soup from commissary`);
          resultText.setColor('#40c040');
        } else {
          resultText.setText(`${total}. You lose. Better luck next time.`);
          resultText.setColor('#ff4444');
        }

        winText.setText(`Wins: ${wins} / ${roundNum}`);

        if (roundNum < maxRounds) {
          roundText.setText(`Round ${roundNum + 1}/${maxRounds}`);
          instr.setText('Press SPACE to roll');
          this.time.delayedCall(1200, () => {
            canRoll = true;
          });
        } else {
          // Game over
          instr.setText('');
          roundText.setText('');

          const finalMsg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 260,
            "JP walks away. This isn't his game anymore.", {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#aaaacc',
            align: 'center',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
          objects.push(finalMsg);

          // Clean up after 3 seconds
          this.time.delayedCall(3000, () => {
            spaceKey.off('down', rollListener);
            this.input.off('pointerdown', rollListener);
            for (const obj of objects) {
              if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
            }
            this.frozen = false;
          });
        }
      });
    };

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const rollListener = () => rollDice();
    spaceKey.on('down', rollListener);
    this.input.on('pointerdown', rollListener);
  }

  private playTimeSkip() {
    this.frozen = true;

    const steps = [
      { day: 'Day 1', desc: "First night. Can't sleep.", hold: 1000 },
      { day: 'Day 30', desc: 'Started reading. First book in years.', hold: 1000 },
      { day: 'Day 90', desc: 'Enrolled in a psychology course.\nCollege credit from behind bars.', hold: 1000 },
      { day: 'Day 180', desc: "Happy 21st birthday.\nNo cake. No candles.\nJust concrete walls.", hold: 2000, shake: true },
      { day: 'Day 270', desc: '50 pushups every morning.\nReading two books a week.\nDifferent person.', hold: 1000 },
      { day: 'Day 365', desc: "The doors open.\nJP walks out.\nNot the same kid who walked in.", hold: 2000 },
    ];

    // Full-screen black overlay
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

    // Fade to black first
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.playTimeSkipStep(steps, 0, bg);
      },
    });
  }

  private playTimeSkipStep(
    steps: { day: string; desc: string; hold: number; shake?: boolean }[],
    index: number,
    bg: Phaser.GameObjects.Rectangle
  ) {
    if (index >= steps.length) {
      // All steps done — fade back to gameplay then transition
      this.tweens.add({
        targets: bg,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.easeOut',
        onComplete: () => {
          bg.destroy();
          this.frozen = false;
          this.requiredDone = true;
          // Transition to TractorScene
          this.transitionToScene('TractorScene');
        },
      });
      return;
    }

    const step = steps[index];

    // Day number — big, white, centered
    const dayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, step.day, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Description — smaller, muted color, below
    const descText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, step.desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#aaaacc',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(201).setAlpha(0);

    // Fade in the day number
    this.tweens.add({
      targets: dayText,
      alpha: 1,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Camera shake on birthday
        if (step.shake) {
          this.cameras.main.shake(400, 0.01);
        }

        // Fade in description after a beat
        this.tweens.add({
          targets: descText,
          alpha: 1,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Hold for the specified duration, then fade both out
            this.time.delayedCall(step.hold, () => {
              this.tweens.add({
                targets: [dayText, descText],
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  dayText.destroy();
                  descText.destroy();
                  // Brief pause between steps
                  this.time.delayedCall(300, () => {
                    this.playTimeSkipStep(steps, index + 1, bg);
                  });
                },
              });
            });
          },
        });
      },
    });
  }
}
