import Phaser from 'phaser';
import { generateAllSprites } from '../systems/SpriteGenerator';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Font is preloaded via layout.tsx <link>, just ensure it's injected
    if (!document.querySelector('link[href*="Press+Start+2P"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  create() {
    // Sprite generation is intentionally procedural and can take several
    // seconds on phones. Paint a real loading frame before doing that
    // synchronous work so a slower device never looks frozen or broken.
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'LOADING THE STORY...', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f0c040',
      letterSpacing: 2,
    }).setOrigin(0.5);
    const detail = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, 'BUILDING THE WORLD', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#777788',
      letterSpacing: 1,
    }).setOrigin(0.5);

    this.time.delayedCall(50, () => {
      generateAllSprites(this);
      title.setText('READY');
      detail.setText('BASED ON A TRUE STORY');

      // Check font immediately, then retry fast.
      const checkFont = () => {
        if (document.fonts.check('12px "Press Start 2P"')) {
          this.scene.start('MenuScene');
        } else {
          this.time.delayedCall(50, checkFont);
        }
      };

      checkFont();

      // Fallback — don't wait more than 1 second for the web font.
      this.time.delayedCall(1000, () => {
        if (this.scene.isActive('BootScene')) {
          this.scene.start('MenuScene');
        }
      });
    });
  }
}
