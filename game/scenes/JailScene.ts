import Phaser from 'phaser';
import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDialogue } from '../data/story';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { DialogueLine } from '../systems/DialogueSystem';

export class JailScene extends BaseChapterScene {
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

    if (interactable.id === 'ch3_fight_watch') {
      this.playBattleScene();
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
