import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  create(data: { text: string; subtext?: string; nextScene: string }) {
    const { text, subtext, nextScene } = data;

    // Black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    // Main text — starts invisible
    const mainText = this.add.text(GAME_WIDTH / 2, subtext ? GAME_HEIGHT / 2 - 20 : GAME_HEIGHT / 2, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    // Optional subtext
    let subLine: Phaser.GameObjects.Text | null = null;
    if (subtext) {
      subLine = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25, subtext, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#8888aa',
      }).setOrigin(0.5).setDepth(1).setAlpha(0);
    }

    // Fade in after brief black
    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: mainText,
        alpha: 1,
        duration: 800,
      });

      if (subLine) {
        this.tweens.add({
          targets: subLine,
          alpha: 1,
          duration: 800,
          delay: 300,
        });
      }

      // Hold for 2 seconds, then fade everything out
      this.time.delayedCall(2800, () => {
        const targets = subLine ? [mainText, subLine] : [mainText];
        this.tweens.add({
          targets,
          alpha: 0,
          duration: 600,
          onComplete: () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start(nextScene);
            });
          },
        });
      });
    });
  }
}
