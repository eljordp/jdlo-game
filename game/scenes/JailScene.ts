import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDay1Dialogue, jailDay2Dialogue, jailDay3Dialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';

export class JailScene extends BaseChapterScene {
  private currentDay = 1;

  constructor() {
    super({ key: 'JailScene' });
    this.chapterTitle = 'Chapter 4: Locked Up';
    this.nextScene = 'ReleaseScene';
    this.requiredInteractionId = 'ch3_bed';
  }

  protected getPlayerTexture(): string {
    return 'player-ch3';
  }

  protected getMusicTrack(): string {
    return 'jail';
  }

  create() {
    this.currentDay = 1;
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
    if (this.currentDay === 3) return jailDay3Dialogue;
    if (this.currentDay === 2) return jailDay2Dialogue;
    return jailDay1Dialogue;
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    if (interactable.id === 'ch3_bed') {
      this.handleBedInteraction();
      return;
    }

    // Pushup minigame — available Day 2+
    if (interactable.id === 'ch3_pushups' && this.currentDay >= 2) {
      this.playPushupMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Dice minigame — available Day 2
    if (interactable.id === 'ch3_dice_watch' && this.currentDay >= 2) {
      this.playDiceMinigame();
      this.interactions.consume(interactable.id);
      return;
    }

    // Battle — available Day 1
    if (interactable.id === 'ch3_fight_watch' && this.currentDay === 1) {
      this.playBattleScene();
      this.interactions.consume(interactable.id);
      return;
    }

    super.handleInteractable(interactable);
  }

  private handleBedInteraction() {
    // Get bed dialogue for current day
    const chapterDialogue = this.getChapterDialogue();
    const bedLines = chapterDialogue.npcs['ch3_bed'];

    if (this.currentDay === 1) {
      // Show Day 1 bed dialogue, then transition to Day 2
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playDayTransition('3 months later...', () => {
            this.currentDay = 2;
            this.refreshDayDialogue();
            this.interactions.resetAll();
          });
        });
      }
    } else if (this.currentDay === 2) {
      // Show Day 2 bed dialogue, then transition to Day 3
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playDayTransition('6 months later...', () => {
            this.currentDay = 3;
            this.refreshDayDialogue();
            this.interactions.resetAll();
          });
        });
      }
    } else {
      // Day 3 — show final bed dialogue, then play montage and release
      if (bedLines) {
        this.dialogue.show(bedLines, () => {
          this.playFinalMontage();
        });
      }
    }
  }

  /**
   * After changing day, update all NPC dialogue references to match the new day.
   */
  private refreshDayDialogue() {
    const chapterDialogue = this.getChapterDialogue();
    for (const npc of this.npcs) {
      npc.dialogue = chapterDialogue.npcs[npc.id] || [{ text: '...' }];
    }
  }

  /**
   * Show a black screen with white text (e.g., "3 months later...")
   * then fade back to gameplay and call the callback.
   */
  private playDayTransition(text: string, callback: () => void) {
    this.frozen = true;

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

    // Fade to black
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 800,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Show transition text
        const transText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '20px',
          color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

        // Fade in text
        this.tweens.add({
          targets: transText,
          alpha: 1,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // Hold for 2 seconds
            this.time.delayedCall(2000, () => {
              // Fade out text
              this.tweens.add({
                targets: transText,
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  transText.destroy();

                  // Run callback (changes day, resets interactions)
                  callback();

                  // Fade back to gameplay
                  this.tweens.add({
                    targets: bg,
                    alpha: 0,
                    duration: 800,
                    ease: 'Quad.easeOut',
                    onComplete: () => {
                      bg.destroy();
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
  }

  /**
   * Day 3 final montage: time skip beats then transition to ReleaseScene.
   */
  private playFinalMontage() {
    this.frozen = true;

    const steps = [
      { day: 'Day 270', desc: '50 pushups every morning.\nReading two books a week.\nDifferent person.', hold: 1500 },
      { day: 'Day 365', desc: "The doors open.\nJP walks out.\nNot the same kid who walked in.", hold: 2500 },
    ];

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(200).setAlpha(0);

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

  private playPushupMinigame() {
    this.frozen = true;
    let jpCount = 0;
    let rivalCount = 0;
    let timeLeft = 15;
    let active = true;
    const rivalInterval = 0.6; // seconds per pushup
    let rivalTimer = 0;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Darken background
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(300);
    objects.push(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'PUSHUP CONTEST', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(title);

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, 110, 'MASH SPACE!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instructions);

    // Timer (centered)
    const timer = this.add.text(GAME_WIDTH / 2, 145, '15s', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(timer);

    // --- LEFT SIDE: JP ---
    const jpLabel = this.add.text(GAME_WIDTH / 2 - 200, 190, 'JP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(jpLabel);

    const jpCounter = this.add.text(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 40, '0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(jpCounter);

    const jpSprite = this.add.sprite(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + 80, this.getPlayerTexture(), 0)
      .setScale(6).setScrollFactor(0).setDepth(301);
    objects.push(jpSprite);

    // --- RIGHT SIDE: INMATE ---
    const rivalLabel = this.add.text(GAME_WIDTH / 2 + 200, 190, 'INMATE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(rivalLabel);

    const rivalCounter = this.add.text(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 - 40, '0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(rivalCounter);

    const rivalSprite = this.add.sprite(GAME_WIDTH / 2 + 200, GAME_HEIGHT / 2 + 80, 'npc_inmate3', 0)
      .setScale(6).setScrollFactor(0).setDepth(301);
    objects.push(rivalSprite);

    // VS divider
    const vsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'VS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(vsText);

    // Catching up warning text (hidden by default)
    const warningText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(warningText);

    // JP pushup handler
    const doPushup = () => {
      if (!active) return;
      jpCount++;
      jpCounter.setText(String(jpCount));

      // Squish animation
      this.tweens.add({
        targets: jpSprite,
        scaleY: 3,
        scaleX: 7,
        duration: 80,
        yoyo: true,
        ease: 'Power1',
      });

      // Counter pulse
      this.tweens.add({
        targets: jpCounter,
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

    // Rival pushup timer (every 600ms)
    const rivalEvent = this.time.addEvent({
      delay: rivalInterval * 1000,
      loop: true,
      callback: () => {
        if (!active) return;
        rivalCount++;
        rivalCounter.setText(String(rivalCount));

        // Rival squish animation
        this.tweens.add({
          targets: rivalSprite,
          scaleY: 3,
          scaleX: 7,
          duration: 80,
          yoyo: true,
          ease: 'Power1',
        });

        // Check if rival is catching up
        if (rivalCount > jpCount && active) {
          warningText.setText("HE'S CATCHING UP!");
          warningText.setAlpha(1);
          this.tweens.add({
            targets: warningText,
            alpha: 0,
            duration: 500,
            delay: 300,
          });
        }
      },
    });

    // Countdown timer
    const timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 14,
      callback: () => {
        timeLeft--;
        timer.setText(`${timeLeft}s`);

        if (timeLeft <= 3) {
          timer.setColor('#ff4444');
        }

        if (timeLeft <= 0) {
          active = false;
          rivalEvent.remove();
          spaceKey.off('down', pushupListener);
          this.input.off('pointerdown', pointerListener);

          // Show result
          instructions.setText('TIME!');
          timer.setVisible(false);
          warningText.setText('');

          // Result message based on comparison
          let message = '';
          const diff = jpCount - rivalCount;
          if (diff > 10) {
            message = 'Destroyed. The yard is watching.';
            jpCounter.setColor('#f0c040');
          } else if (diff > 0) {
            message = 'JP wins. Respect earned.';
            jpCounter.setColor('#40c040');
          } else if (diff === 0) {
            message = 'Dead even. Mutual respect.';
            jpCounter.setColor('#aaaacc');
            rivalCounter.setColor('#aaaacc');
          } else {
            message = 'Inmate wins. JP nods. Next time.';
            rivalCounter.setColor('#ff6666');
          }

          const result = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 220, message, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#aaaacc',
            wordWrap: { width: 600 },
            align: 'center',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
          objects.push(result);

          const scoreResult = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250, `JP: ${jpCount}  |  INMATE: ${rivalCount}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#666666',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
          objects.push(scoreResult);

          // Clean up after 3 seconds
          this.time.delayedCall(3000, () => {
            for (const obj of objects) {
              if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
            }
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
    let points = 10;
    const maxRounds = 5;
    let currentBet = 1;
    const betOptions = [1, 3, 5];
    let betIndex = 0;

    const winComments = ['Lucky.', 'JP collects.', 'The yard nods.'];
    const loseComments = ['Cold dice.', 'The yard laughs.', 'JP pays up.'];

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

    // Round + points info
    const roundText = this.add.text(GAME_WIDTH / 2, 130, 'Round 1/5  |  Commissary: 10', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
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

    // Dice value text
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

    // Bet selection display
    const betLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'BET:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(betLabel);

    const betButtons: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 3; i++) {
      const bx = GAME_WIDTH / 2 + (i - 1) * 100;
      const btn = this.add.text(bx, GAME_HEIGHT / 2 + 115, String(betOptions[i]), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: i === 0 ? '#f0c040' : '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
      objects.push(btn);
      betButtons.push(btn);
    }

    // Arrows around selected bet
    const leftArrow = this.add.text(GAME_WIDTH / 2 - 100 - 30, GAME_HEIGHT / 2 + 115, '<', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    const rightArrow = this.add.text(GAME_WIDTH / 2 - 100 + 30, GAME_HEIGHT / 2 + 115, '>', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    objects.push(leftArrow, rightArrow);

    // Instructions
    const instr = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, 'LEFT/RIGHT to bet, SPACE to roll', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(instr);

    // Result / flavor text
    const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(resultText);

    // Side commentary
    const commentText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 235, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    objects.push(commentText);

    let rolling = false;
    let phase: 'betting' | 'rolling' | 'done' = 'betting';

    const updateBetDisplay = () => {
      currentBet = betOptions[betIndex];
      for (let i = 0; i < 3; i++) {
        const isSelected = i === betIndex;
        betButtons[i].setColor(isSelected ? '#f0c040' : '#666666');
        betButtons[i].setScale(isSelected ? 1.2 : 1);
        // Grey out bets player can't afford
        if (betOptions[i] > points) {
          betButtons[i].setColor('#333333');
        }
      }
      // Position arrows around selected bet
      const selectedX = GAME_WIDTH / 2 + (betIndex - 1) * 100;
      leftArrow.setPosition(selectedX - 30, GAME_HEIGHT / 2 + 115);
      rightArrow.setPosition(selectedX + 30, GAME_HEIGHT / 2 + 115);
    };

    const endGame = (reason?: string) => {
      phase = 'done';
      betLabel.setVisible(false);
      for (const b of betButtons) b.setVisible(false);
      leftArrow.setVisible(false);
      rightArrow.setVisible(false);
      instr.setText('');

      let finalMsg: string;
      if (points >= 20) {
        finalMsg = 'JP walks away up. Smart player.';
      } else if (points >= 10) {
        finalMsg = 'Broke even. Could be worse.';
      } else if (points >= 1) {
        finalMsg = "Down bad. But it's just soup.";
      } else {
        finalMsg = 'JP walks away empty.';
      }

      if (reason) {
        resultText.setText(reason);
        resultText.setColor('#ff4444');
      }

      const finalMsgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 270,
        `Final: ${points} pts  |  ${finalMsg}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaacc',
        align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      objects.push(finalMsgText);

      // Clean up after 3 seconds
      this.time.delayedCall(3000, () => {
        spaceKey.off('down', inputListener);
        leftKey.off('down', inputListener);
        rightKey.off('down', inputListener);
        this.input.off('pointerdown', inputListener);
        for (const obj of objects) {
          if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
        }
        this.frozen = false;
      });
    };

    const rollDice = () => {
      if (phase !== 'betting' || rolling) return;
      // Can't bet more than you have
      if (currentBet > points) return;

      rolling = true;
      phase = 'rolling';
      resultText.setText('');
      commentText.setText('');
      instr.setText('Rolling...');
      betLabel.setVisible(false);
      for (const b of betButtons) b.setVisible(false);
      leftArrow.setVisible(false);
      rightArrow.setVisible(false);

      // Rapid random cycling for 1 second
      this.time.addEvent({
        delay: 60,
        repeat: 15,
        callback: () => {
          die1Text.setText(String(Phaser.Math.Between(1, 6)));
          die2Text.setText(String(Phaser.Math.Between(1, 6)));
          die1Bg.setAngle(Phaser.Math.Between(-10, 10));
          die2Bg.setAngle(Phaser.Math.Between(-10, 10));
        },
      });

      // Land on final values
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
          points += currentBet;
          resultText.setText(`${total}! Win +${currentBet} pts`);
          resultText.setColor('#40c040');
          commentText.setText(winComments[Phaser.Math.Between(0, winComments.length - 1)]);
        } else {
          points -= currentBet;
          resultText.setText(`${total}. Lose -${currentBet} pts`);
          resultText.setColor('#ff4444');
          commentText.setText(loseComments[Phaser.Math.Between(0, loseComments.length - 1)]);
        }

        roundText.setText(`Round ${roundNum}/${maxRounds}  |  Commissary: ${points}`);

        // Check for going broke
        if (points <= 0) {
          points = 0;
          endGame("JP's out. Nothing left to bet.");
          return;
        }

        if (roundNum < maxRounds) {
          // Next round — show bet selection again
          this.time.delayedCall(1500, () => {
            phase = 'betting';
            roundText.setText(`Round ${roundNum + 1}/${maxRounds}  |  Commissary: ${points}`);
            instr.setText('LEFT/RIGHT to bet, SPACE to roll');
            betLabel.setVisible(true);
            for (const b of betButtons) b.setVisible(true);
            leftArrow.setVisible(true);
            rightArrow.setVisible(true);
            // Reset bet index if current bet is unaffordable
            if (betOptions[betIndex] > points) {
              betIndex = 0;
            }
            updateBetDisplay();
          });
        } else {
          endGame();
        }
      });
    };

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    const inputListener = (event?: { keyCode?: number }) => {
      if (phase === 'done') return;

      if (phase === 'betting' && !rolling) {
        const keyCode = event?.keyCode;
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
          betIndex = Math.max(0, betIndex - 1);
          // Skip unaffordable bets
          while (betIndex > 0 && betOptions[betIndex] > points) betIndex--;
          updateBetDisplay();
          return;
        }
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
          betIndex = Math.min(2, betIndex + 1);
          // Skip unaffordable bets
          while (betIndex < 2 && betOptions[betIndex] > points) {
            if (betOptions[betIndex] <= points) break;
            betIndex--;
            break;
          }
          updateBetDisplay();
          return;
        }
        if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE || !keyCode) {
          rollDice();
        }
      }
    };

    spaceKey.on('down', (e: { keyCode: number }) => inputListener(e));
    leftKey.on('down', (e: { keyCode: number }) => inputListener(e));
    rightKey.on('down', (e: { keyCode: number }) => inputListener(e));
    this.input.on('pointerdown', () => inputListener());
  }

  private playBattleScene() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const DEPTH = 400;
    const FONT = '"Press Start 2P", monospace';

    // === STATE ===
    type BattleState = 'intro' | 'menu' | 'player-action' | 'enemy-action' | 'text' | 'end';
    let state: BattleState = 'intro';
    let jpHP = 100;
    let enemyHP = 80;
    const jpMaxHP = 100;
    const enemyMaxHP = 80;
    let menuIndex = 0; // 0=SWING, 1=DODGE, 2=TALK, 3=WALK AWAY
    let dodgeActive = false;
    let talkDebuff = false; // reduces enemy attack by 5
    let inputEnabled = false;

    // === INTRO: Pokemon swipe transition ===
    const introTop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH + 50);
    const introBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
      .setScrollFactor(0).setDepth(DEPTH + 50);

    // Bars close in
    this.tweens.add({ targets: introTop, y: GAME_HEIGHT / 4, duration: 1 }); // already in place
    this.tweens.add({ targets: introBottom, y: GAME_HEIGHT * 3 / 4, duration: 1 });

    // Flash text "FIGHT!"
    const fightText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'FIGHT!', {
      fontFamily: FONT, fontSize: '36px', color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 51).setAlpha(0);
    objects.push(fightText);

    this.tweens.add({
      targets: fightText,
      alpha: 1,
      duration: 300,
      delay: 300,
      hold: 600,
      yoyo: true,
      onComplete: () => {
        fightText.destroy();
        // Open the bars to reveal the battle
        this.tweens.add({
          targets: introTop,
          y: -GAME_HEIGHT / 4,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => introTop.destroy(),
        });
        this.tweens.add({
          targets: introBottom,
          y: GAME_HEIGHT + GAME_HEIGHT / 4,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            introBottom.destroy();
            state = 'menu';
            inputEnabled = true;
          },
        });
      },
    });

    // === BACKGROUND ===
    // Dark concrete background
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x252530)
      .setScrollFactor(0).setDepth(DEPTH);
    objects.push(bg);

    // Concrete wall texture lines (horizontal)
    for (let i = 0; i < 8; i++) {
      const y = 60 + i * 70;
      const line = this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 2, 0x1a1a22)
        .setScrollFactor(0).setDepth(DEPTH + 1);
      objects.push(line);
    }
    // Vertical cracks
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 280;
      const crack = this.add.rectangle(x, GAME_HEIGHT / 3, 1, 120 + Math.random() * 80, 0x1a1a22)
        .setScrollFactor(0).setDepth(DEPTH + 1).setAlpha(0.5);
      objects.push(crack);
    }

    // === ENEMY PLATFORM (top-left) ===
    const enemyPlatX = 340;
    const enemyPlatY = 250;
    const enemyPlatform = this.add.ellipse(enemyPlatX, enemyPlatY + 60, 260, 40, 0x3a3a48)
      .setScrollFactor(0).setDepth(DEPTH + 2);
    objects.push(enemyPlatform);

    // Enemy sprite
    const enemySprite = this.add.sprite(enemyPlatX, enemyPlatY, 'npc_inmate3', 0)
      .setScale(6).setScrollFactor(0).setDepth(DEPTH + 3);
    objects.push(enemySprite);
    const enemySpriteBaseX = enemyPlatX;
    const enemySpriteBaseY = enemyPlatY;

    // Enemy name + HP
    const enemyNameBg = this.add.rectangle(280, 80, 340, 70, 0x1a1a24, 0.85)
      .setScrollFactor(0).setDepth(DEPTH + 4).setStrokeStyle(3, 0x505068);
    objects.push(enemyNameBg);

    const enemyName = this.add.text(130, 58, 'INMATE', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(enemyName);

    const enemyHPLabel = this.add.text(130, 82, 'HP', {
      fontFamily: FONT, fontSize: '10px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(enemyHPLabel);

    // HP bar background
    const enemyHPBgBar = this.add.rectangle(310, 87, 200, 12, 0x303040)
      .setScrollFactor(0).setDepth(DEPTH + 5).setOrigin(0, 0.5);
    objects.push(enemyHPBgBar);

    // HP bar fill
    const enemyHPBar = this.add.rectangle(310, 87, 200, 12, 0x40c040)
      .setScrollFactor(0).setDepth(DEPTH + 6).setOrigin(0, 0.5);
    objects.push(enemyHPBar);

    // === JP PLATFORM (bottom-right) ===
    const jpPlatX = 940;
    const jpPlatY = 560;
    const jpPlatform = this.add.ellipse(jpPlatX, jpPlatY + 60, 260, 40, 0x3a3a48)
      .setScrollFactor(0).setDepth(DEPTH + 2);
    objects.push(jpPlatform);

    // JP sprite (facing up — frame 2)
    const jpSprite = this.add.sprite(jpPlatX, jpPlatY, this.getPlayerTexture(), 2)
      .setScale(6).setScrollFactor(0).setDepth(DEPTH + 3);
    objects.push(jpSprite);
    const jpSpriteBaseX = jpPlatX;
    const jpSpriteBaseY = jpPlatY;

    // JP name + HP
    const jpNameBg = this.add.rectangle(1000, 470, 340, 70, 0x1a1a24, 0.85)
      .setScrollFactor(0).setDepth(DEPTH + 4).setStrokeStyle(3, 0x505068);
    objects.push(jpNameBg);

    const jpName = this.add.text(850, 448, 'JP', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpName);

    const jpHPLabel = this.add.text(850, 472, 'HP', {
      fontFamily: FONT, fontSize: '10px', color: '#f0c040',
    }).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpHPLabel);

    const jpHPText = this.add.text(1120, 472, `${jpHP}/${jpMaxHP}`, {
      fontFamily: FONT, fontSize: '10px', color: '#aaaacc',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 5);
    objects.push(jpHPText);

    const jpHPBgBar = this.add.rectangle(900, 477, 200, 12, 0x303040)
      .setScrollFactor(0).setDepth(DEPTH + 5).setOrigin(0, 0.5);
    objects.push(jpHPBgBar);

    const jpHPBar = this.add.rectangle(900, 477, 200, 12, 0x40c040)
      .setScrollFactor(0).setDepth(DEPTH + 6).setOrigin(0, 0.5);
    objects.push(jpHPBar);

    // === BATTLE MENU BOX (bottom, Pokemon-style) ===
    const menuY = 720;
    const menuBoxHeight = 240;

    // Text area (left side)
    const textBoxBg = this.add.rectangle(GAME_WIDTH / 4, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 10, menuBoxHeight, 0x1a1a28)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(4, 0x606080);
    objects.push(textBoxBg);

    // Inner white border for Pokemon look
    const textBoxInner = this.add.rectangle(GAME_WIDTH / 4, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 30, menuBoxHeight - 20, 0x101018)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(2, 0x404058);
    objects.push(textBoxInner);

    const battleText = this.add.text(40, menuY + 30, 'An inmate steps to JP.\n"You think you\'re tough?"', {
      fontFamily: FONT, fontSize: '13px', color: '#ffffff',
      wordWrap: { width: GAME_WIDTH / 2 - 80 }, lineSpacing: 8,
    }).setScrollFactor(0).setDepth(DEPTH + 11);
    objects.push(battleText);

    // Menu area (right side)
    const menuBoxBg = this.add.rectangle(GAME_WIDTH * 3 / 4 + 5, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 10, menuBoxHeight, 0x1a1a28)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(4, 0x606080);
    objects.push(menuBoxBg);

    const menuBoxInner = this.add.rectangle(GAME_WIDTH * 3 / 4 + 5, menuY + menuBoxHeight / 2, GAME_WIDTH / 2 - 30, menuBoxHeight - 20, 0x101018)
      .setScrollFactor(0).setDepth(DEPTH + 10).setStrokeStyle(2, 0x404058);
    objects.push(menuBoxInner);

    // Menu options in 2x2 grid
    const menuOptions = ['SWING', 'DODGE', 'TALK', 'WALK AWAY'];
    const menuBaseX = GAME_WIDTH / 2 + 60;
    const menuBaseY = menuY + 50;
    const menuColGap = 260;
    const menuRowGap = 70;

    const menuTexts: Phaser.GameObjects.Text[] = [];
    const menuCursors: Phaser.GameObjects.Text[] = [];

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = menuBaseX + col * menuColGap;
      const y = menuBaseY + row * menuRowGap;

      // Selection arrow
      const cursor = this.add.text(x - 5, y, '\u25b6', {
        fontFamily: FONT, fontSize: '14px', color: '#f0c040',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 12).setAlpha(i === 0 ? 1 : 0);
      objects.push(cursor);
      menuCursors.push(cursor);

      const text = this.add.text(x, y, menuOptions[i], {
        fontFamily: FONT, fontSize: '14px', color: i === 0 ? '#f0c040' : '#aaaacc',
      }).setScrollFactor(0).setDepth(DEPTH + 12);
      objects.push(text);
      menuTexts.push(text);
    }

    // === HP BAR HELPERS ===
    const getHPColor = (ratio: number): number => {
      if (ratio > 0.5) return 0x40c040; // green
      if (ratio > 0.25) return 0xc0c040; // yellow
      return 0xc04040; // red
    };

    const updateEnemyHP = () => {
      const ratio = Math.max(0, enemyHP / enemyMaxHP);
      const targetWidth = 200 * ratio;
      const color = getHPColor(ratio);
      this.tweens.add({
        targets: enemyHPBar,
        displayWidth: targetWidth,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          enemyHPBar.setFillStyle(color);
        },
      });
    };

    const updateJPHP = () => {
      const ratio = Math.max(0, jpHP / jpMaxHP);
      const targetWidth = 200 * ratio;
      const color = getHPColor(ratio);
      this.tweens.add({
        targets: jpHPBar,
        displayWidth: targetWidth,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          jpHPBar.setFillStyle(color);
        },
      });
      jpHPText.setText(`${Math.max(0, jpHP)}/${jpMaxHP}`);
    };

    // === MENU UPDATE ===
    const updateMenu = () => {
      for (let i = 0; i < 4; i++) {
        menuTexts[i].setColor(i === menuIndex ? '#f0c040' : '#aaaacc');
        menuCursors[i].setAlpha(i === menuIndex ? 1 : 0);
      }
    };

    // === WHITE FLASH ON HIT ===
    const flashSprite = (target: Phaser.GameObjects.Sprite) => {
      target.setTint(0xffffff);
      this.time.delayedCall(60, () => target.setTint(0xff4444));
      this.time.delayedCall(120, () => target.setTint(0xffffff));
      this.time.delayedCall(180, () => target.clearTint());
    };

    // === SCREEN SHAKE ===
    const screenShake = () => {
      this.cameras.main.shake(200, 0.015);
    };

    // === SHOW BATTLE TEXT ===
    const showText = (text: string, callback?: () => void) => {
      state = 'text';
      inputEnabled = false;
      battleText.setText(text);
      this.time.delayedCall(1400, () => {
        if (callback) callback();
      });
    };

    // === SHOW MULTI-LINE TEXT SEQUENCE ===
    const showTextSequence = (lines: string[], callback?: () => void) => {
      let idx = 0;
      const showNext = () => {
        if (idx >= lines.length) {
          if (callback) callback();
          return;
        }
        battleText.setText(lines[idx]);
        idx++;
        this.time.delayedCall(1800, showNext);
      };
      showNext();
    };

    // === ENEMY TURN ===
    const enemyTurn = () => {
      state = 'enemy-action';
      inputEnabled = false;

      if (dodgeActive) {
        // Inmate swings and misses
        this.tweens.add({
          targets: enemySprite,
          x: enemySpriteBaseX + 120,
          duration: 200,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        dodgeActive = false;
        showText('Inmate swings... and misses!', () => {
          if (enemyHP <= 0) { endBattle(true); return; }
          state = 'menu';
          inputEnabled = true;
          battleText.setText('What will JP do?');
        });
        return;
      }

      // Inmate attacks
      let damage = Phaser.Math.Between(10, 20);
      if (talkDebuff) {
        damage = Math.max(5, damage - 5);
      }

      // Enemy lunge animation
      this.tweens.add({
        targets: enemySprite,
        x: enemySpriteBaseX + 180,
        y: enemySpriteBaseY + 80,
        duration: 250,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Hit JP
          flashSprite(jpSprite);
          screenShake();
          jpHP -= damage;
          updateJPHP();

          // Enemy returns
          this.tweens.add({
            targets: enemySprite,
            x: enemySpriteBaseX,
            y: enemySpriteBaseY,
            duration: 300,
            ease: 'Quad.easeOut',
          });

          showText(`Inmate swings! JP takes ${damage} damage!`, () => {
            if (jpHP <= 0) { endBattle(false); return; }
            state = 'menu';
            inputEnabled = true;
            battleText.setText('What will JP do?');
          });
        },
      });
    };

    // === PLAYER ACTIONS ===
    const doSwing = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      const damage = Phaser.Math.Between(15, 25);

      // JP lunge animation
      this.tweens.add({
        targets: jpSprite,
        x: jpSpriteBaseX - 180,
        y: jpSpriteBaseY - 80,
        duration: 250,
        ease: 'Quad.easeIn',
        onComplete: () => {
          flashSprite(enemySprite);
          screenShake();
          enemyHP -= damage;
          updateEnemyHP();

          // JP returns
          this.tweens.add({
            targets: jpSprite,
            x: jpSpriteBaseX,
            y: jpSpriteBaseY,
            duration: 300,
            ease: 'Quad.easeOut',
          });

          showText(`JP swings! Hit for ${damage} damage!`, () => {
            if (enemyHP <= 0) { endBattle(true); return; }
            enemyTurn();
          });
        },
      });
    };

    const doDodge = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = true;

      // JP shifts sideways
      this.tweens.add({
        targets: jpSprite,
        x: jpSpriteBaseX + 50,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });

      showText('JP braces and dodges!', () => {
        enemyTurn();
      });
    };

    const doTalk = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      // Talk NEVER works in jail — you get slapped for trying
      showText('JP: "Bro we don\'t gotta do this—"', () => {
        showText('That gay ass shit don\'t work in here.', () => {
          // Enemy gets a FREE hit — bitch slap
          const slapDmg = 20;
          jpHP = Math.max(0, jpHP - slapDmg);
          updateJPHP();

          // Slap animation
          this.cameras.main.shake(300, 0.015);
          const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff)
            .setScrollFactor(0).setDepth(710).setAlpha(0.4);
          this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy(),
          });

          showText(`Inmate slaps JP! ${slapDmg} damage!\n"I SAID DON'T TALK TO ME."`, () => {
            if (jpHP <= 0) {
              endBattle(false);
            } else {
              enemyTurn();
            }
          });
        });
      });
    };

    const doWalkAway = () => {
      state = 'player-action';
      inputEnabled = false;
      dodgeActive = false;

      if (enemyHP > 50) {
        showText("The inmate blocks the way.\nYou can't leave yet.", () => {
          state = 'menu';
          inputEnabled = true;
          battleText.setText('What will JP do?');
        });
      } else {
        showText('JP walks away. Not worth it.', () => {
          endBattle(true);
        });
      }
    };

    // === END BATTLE ===
    const endBattle = (jpWon: boolean) => {
      state = 'end';
      inputEnabled = false;

      // Hide menu
      for (const t of menuTexts) t.setAlpha(0);
      for (const c of menuCursors) c.setAlpha(0);

      if (jpWon && enemyHP <= 0) {
        // Enemy falls
        this.tweens.add({
          targets: enemySprite,
          y: enemySpriteBaseY + 80,
          alpha: 0.3,
          angle: 90,
          duration: 600,
          ease: 'Quad.easeIn',
        });

        showTextSequence([
          'The inmate hits the ground.',
          'Guard: "BREAK IT UP! Both of you, against the wall!"',
          'JP: "He started it."',
          'Guard: "I don\'t care who started it. You want more time?"',
          "JP's Mind: Not worth it. Never again.",
          'The yard goes quiet. Everyone saw that.',
        ], () => {
          cleanupBattle();
        });
      } else if (jpWon) {
        // Walked away
        showTextSequence([
          'JP turns his back and walks.',
          "JP's Mind: That's the smart play.",
          'The yard goes quiet. Everyone saw that.',
        ], () => {
          cleanupBattle();
        });
      } else {
        // JP lost
        this.tweens.add({
          targets: jpSprite,
          y: jpSpriteBaseY + 80,
          alpha: 0.3,
          angle: -90,
          duration: 600,
          ease: 'Quad.easeIn',
        });

        showTextSequence([
          'JP hits the ground.',
          'Guard: "BREAK IT UP!"',
          'Guard: "Both of you. Against the wall. Now."',
          "JP's Mind: That's the last time I fight in here.",
        ], () => {
          cleanupBattle();
        });
      }
    };

    // === CLEANUP ===
    const cleanupBattle = () => {
      // Pokemon bars closing transition
      const closeTop = this.add.rectangle(GAME_WIDTH / 2, -GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 50);
      const closeBottom = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
        .setScrollFactor(0).setDepth(DEPTH + 50);

      this.tweens.add({
        targets: closeTop,
        y: GAME_HEIGHT / 4,
        duration: 500,
        ease: 'Quad.easeIn',
      });
      this.tweens.add({
        targets: closeBottom,
        y: GAME_HEIGHT * 3 / 4,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Destroy all battle objects
          upKey.off('down', onKeyDown);
          downKey.off('down', onKeyDown);
          leftKey.off('down', onKeyDown);
          rightKey.off('down', onKeyDown);
          spaceKey.off('down', onConfirm);

          for (const obj of objects) {
            if (obj && obj.active) (obj as Phaser.GameObjects.GameObject).destroy();
          }

          // Open bars back to gameplay
          const openTop2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
            .setScrollFactor(0).setDepth(DEPTH + 50);
          const openBottom2 = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 3 / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0x000000)
            .setScrollFactor(0).setDepth(DEPTH + 50);
          this.tweens.add({
            targets: openTop2,
            y: -GAME_HEIGHT / 4,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => { openTop2.destroy(); closeTop.destroy(); },
          });
          this.tweens.add({
            targets: openBottom2,
            y: GAME_HEIGHT + GAME_HEIGHT / 4,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => {
              openBottom2.destroy();
              closeBottom.destroy();
              this.frozen = false;
            },
          });
        },
      });
    };

    // === INPUT ===
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const onKeyDown = (event: { keyCode: number }) => {
      if (!inputEnabled || state !== 'menu') return;

      const col = menuIndex % 2;
      const row = Math.floor(menuIndex / 2);

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP && row > 0) {
        menuIndex -= 2;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN && row < 1) {
        menuIndex += 2;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT && col > 0) {
        menuIndex -= 1;
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT && col < 1) {
        menuIndex += 1;
      }
      updateMenu();
    };

    const onConfirm = () => {
      if (!inputEnabled || state !== 'menu') return;

      switch (menuIndex) {
        case 0: doSwing(); break;
        case 1: doDodge(); break;
        case 2: doTalk(); break;
        case 3: doWalkAway(); break;
      }
    };

    upKey.on('down', onKeyDown);
    downKey.on('down', onKeyDown);
    leftKey.on('down', onKeyDown);
    rightKey.on('down', onKeyDown);
    spaceKey.on('down', onConfirm);
  }

  // playTimeSkip removed — replaced by day system + playFinalMontage

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
          this.transitionToScene('ReleaseScene');
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
