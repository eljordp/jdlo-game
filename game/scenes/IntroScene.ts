import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    // "Based on a true story." text — starts invisible
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Based on a true story.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    // Second line — plants the stakes
    const text2 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Most people who start here...\ndon\'t make it out.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    // 1 second black, then fade in first text
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 800,
        hold: 2000,
        yoyo: true,
        onComplete: () => {
          // Pause, then fade in second line
          this.time.delayedCall(600, () => {
            this.tweens.add({
              targets: text2,
              alpha: 1,
              duration: 800,
              hold: 2000,
              yoyo: true,
              onComplete: () => {
                // Fade to HomeScene
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                  this.scene.start('HomeScene');
                });
              },
            });
          });
        },
      });
    });
  }
}
