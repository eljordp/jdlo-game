import Phaser from 'phaser';
import { generateAllSprites } from '../systems/SpriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load the pixel font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  create() {
    // Generate all pixel art sprites programmatically
    generateAllSprites(this);

    // Wait for font to load then start intro
    const checkFont = () => {
      if (document.fonts.check('12px "Press Start 2P"')) {
        this.scene.start('IntroScene');
      } else {
        this.time.delayedCall(100, checkFont);
      }
    };

    // Give font a moment to load, then check
    this.time.delayedCall(500, checkFont);

    // Fallback — start after 3 seconds regardless
    this.time.delayedCall(3000, () => {
      if (this.scene.isActive('BootScene')) {
        this.scene.start('IntroScene');
      }
    });
  }
}
