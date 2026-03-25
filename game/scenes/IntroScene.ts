import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { introDialogue } from '../data/story';

export class IntroScene extends Phaser.Scene {
  private currentLine = 0;
  private displayedText = '';
  private fullText = '';
  private charIndex = 0;
  private isTyping = false;
  private textObject!: Phaser.GameObjects.Text;
  private narratorSprite!: Phaser.GameObjects.Sprite;
  private canAdvance = false;
  private arrowIndicator!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Rectangle;
  private phase: 'black' | 'narrator-in' | 'dialogue' | 'character-reveal' | 'shrink' | 'done' = 'black';

  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    this.currentLine = 0;
    this.phase = 'black';

    // Full black screen
    this.overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000
    ).setDepth(0);

    // Narrator text (centered)
    this.textObject = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 600 },
      lineSpacing: 10,
      align: 'center',
    }).setOrigin(0.5).setDepth(2).setAlpha(0);

    // Arrow indicator
    this.arrowIndicator = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '▼', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(2).setAlpha(0);

    // Bounce the arrow
    this.tweens.add({
      targets: this.arrowIndicator,
      y: GAME_HEIGHT - 50,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Narrator sprite — appears from fade
    this.narratorSprite = this.add.sprite(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'npc-narrator'
    ).setScale(6).setDepth(1).setAlpha(0);

    // Input handling
    this.input.keyboard!.on('keydown-SPACE', () => this.handleAdvance());
    this.input.keyboard!.on('keydown-ENTER', () => this.handleAdvance());
    this.input.on('pointerdown', () => this.handleAdvance());

    // Start the sequence
    this.time.delayedCall(1000, () => this.startNarrator());
  }

  private startNarrator() {
    this.phase = 'narrator-in';

    // Fade in narrator sprite
    this.tweens.add({
      targets: this.narratorSprite,
      alpha: 1,
      duration: 1500,
      onComplete: () => {
        this.phase = 'dialogue';
        this.textObject.setAlpha(1);
        this.showLine();
      },
    });
  }

  private showLine() {
    if (this.currentLine >= introDialogue.length) {
      this.startCharacterReveal();
      return;
    }

    const line = introDialogue[this.currentLine];
    this.fullText = line.text;
    this.displayedText = '';
    this.charIndex = 0;
    this.isTyping = true;
    this.canAdvance = false;
    this.arrowIndicator.setAlpha(0);
    this.textObject.setText('');
  }

  private startCharacterReveal() {
    this.phase = 'character-reveal';
    this.textObject.setText('');
    this.arrowIndicator.setAlpha(0);

    // Fade out narrator
    this.tweens.add({
      targets: this.narratorSprite,
      alpha: 0,
      duration: 800,
    });

    // Show player character large in center
    const playerSprite = this.add.sprite(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      'player', 0
    ).setScale(8).setDepth(3).setAlpha(0);

    this.tweens.add({
      targets: playerSprite,
      alpha: 1,
      duration: 1000,
      delay: 500,
      onComplete: () => {
        // Show "This is JP" text
        const nameText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'JDLO', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '24px',
          color: '#ffffff',
        }).setOrigin(0.5).setDepth(3).setAlpha(0);

        this.tweens.add({
          targets: nameText,
          alpha: 1,
          duration: 800,
          onComplete: () => {
            this.time.delayedCall(1500, () => {
              // Shrink character to game size
              this.phase = 'shrink';
              this.tweens.add({
                targets: playerSprite,
                scale: 3,
                duration: 1000,
                ease: 'Power2',
              });
              this.tweens.add({
                targets: [nameText, this.textObject],
                alpha: 0,
                duration: 800,
              });
              this.time.delayedCall(2000, () => {
                this.fadeToChapter1();
              });
            });
          },
        });
      },
    });
  }

  private fadeToChapter1() {
    this.phase = 'done';
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BeachScene');
    });
  }

  private handleAdvance() {
    if (this.phase === 'dialogue') {
      if (this.isTyping) {
        // Speed up — show full text
        this.displayedText = this.fullText;
        this.textObject.setText(this.displayedText);
        this.isTyping = false;
        this.canAdvance = true;
        this.arrowIndicator.setAlpha(1);
      } else if (this.canAdvance) {
        this.currentLine++;
        this.showLine();
      }
    }
  }

  update() {
    if (this.isTyping && this.phase === 'dialogue') {
      this.charIndex++;
      if (this.charIndex <= this.fullText.length) {
        this.displayedText = this.fullText.substring(0, this.charIndex);
        this.textObject.setText(this.displayedText);
      } else {
        this.isTyping = false;
        this.canAdvance = true;
        this.arrowIndicator.setAlpha(1);
      }
    }
  }
}
