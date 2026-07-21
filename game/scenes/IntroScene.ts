import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // Black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    // Cold open — sets the from-nothing tone, deadpan and real, no cheese.
    const lines = [
      'Everybody loves a comeback.',
      'Nobody remembers the kid before it.\nThe one who thought he already had it figured out.',
      'Santa Barbara. 2021. That kid was me.',
    ];

    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '15px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: GAME_WIDTH - 160 },
    }).setOrigin(0.5).setDepth(1).setAlpha(0);

    let started = false;
    const goHome = () => {
      if (started) return;
      started = true;
      this.scene.start('HomeScene');
    };

    let i = 0;
    const showNext = () => {
      if (i >= lines.length) {
        // Mobile-safe transition: event + timed fallback
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', goHome);
        this.time.delayedCall(650, goHome);
        return;
      }
      text.setText(lines[i]);
      i++;
      // Last line lingers a beat longer — it's the gut-punch.
      const hold = i === lines.length ? 1100 : 750;
      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 380,
        hold,
        yoyo: true,
        onComplete: showNext,
      });
    };

    this.time.delayedCall(300, showNext);
  }
}
