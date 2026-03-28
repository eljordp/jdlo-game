import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const LETTERBOX_H = 60;

export class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  create(data: { text: string; subtext?: string; nextScene: string }) {
    const { text, subtext, nextScene } = data;

    // Black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    // Cinematic letterbox bars (persistent top/bottom)
    this.add.rectangle(GAME_WIDTH / 2, LETTERBOX_H / 2, GAME_WIDTH, LETTERBOX_H, 0x000000)
      .setDepth(100);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - LETTERBOX_H / 2, GAME_WIDTH, LETTERBOX_H, 0x000000)
      .setDepth(100);

    // Decorative line accents on the letterbox edges
    const topLine = this.add.rectangle(GAME_WIDTH / 2, LETTERBOX_H, GAME_WIDTH, 1, 0x4060c0)
      .setDepth(101).setAlpha(0);
    const bottomLine = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - LETTERBOX_H, GAME_WIDTH, 1, 0x4060c0)
      .setDepth(101).setAlpha(0);
    this.tweens.add({ targets: [topLine, bottomLine], alpha: 0.3, duration: 600 });

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

    // Decorative center line under text
    const centerLine = this.add.rectangle(
      GAME_WIDTH / 2,
      subtext ? GAME_HEIGHT / 2 + 55 : GAME_HEIGHT / 2 + 30,
      160, 2, 0x4060c0
    ).setDepth(1).setAlpha(0);

    // Fade in after brief black
    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: mainText,
        alpha: 1,
        duration: 800,
      });

      this.tweens.add({
        targets: centerLine,
        alpha: 0.5,
        duration: 600,
        delay: 400,
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
        const fadeTargets: Phaser.GameObjects.GameObject[] = subLine ? [mainText, subLine, centerLine] : [mainText, centerLine];
        this.tweens.add({
          targets: fadeTargets,
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
