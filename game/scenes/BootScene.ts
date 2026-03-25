import Phaser from 'phaser';
import { generateAllSprites } from '../systems/SpriteGenerator';

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
    generateAllSprites(this);

    // Check font immediately, then retry fast
    const checkFont = () => {
      if (document.fonts.check('12px "Press Start 2P"')) {
        this.scene.start('MenuScene');
      } else {
        this.time.delayedCall(50, checkFont);
      }
    };

    checkFont();

    // Fallback — don't wait more than 1 second
    this.time.delayedCall(1000, () => {
      if (this.scene.isActive('BootScene')) {
        this.scene.start('MenuScene');
      }
    });
  }
}
