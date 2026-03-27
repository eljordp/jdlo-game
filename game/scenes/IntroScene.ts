import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    // "Based on a true story." — only intro text needed
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Based on a true story.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    // 1 second black, then fade in text, then go to HomeScene
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 800,
        hold: 2500,
        yoyo: true,
        onComplete: () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('HomeScene');
          });
        },
      });
    });
  }
}
