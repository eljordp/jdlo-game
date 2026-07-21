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

    // Short black, quick fade in, brief hold, out — no lingering. ~2.3s total.
    this.time.delayedCall(350, () => {
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 450,
        hold: 1100,
        yoyo: true,
        onComplete: () => {
          let started = false;
          const goHome = () => {
            if (started) return;
            started = true;
            this.scene.start('HomeScene');
          };

          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', goHome);
          this.time.delayedCall(650, goHome);
        },
      });
    });
  }
}
