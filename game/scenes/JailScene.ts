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
