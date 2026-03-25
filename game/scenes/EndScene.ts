import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { endScreenData } from '../data/story';

export class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  create() {
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // Player sprite large
    const player = this.add.sprite(GAME_WIDTH / 2, 120, 'player', 0)
      .setScale(6).setAlpha(0);

    this.tweens.add({
      targets: player,
      alpha: 1,
      duration: 1000,
    });

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 210, 'JDLO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      delay: 500,
    });

    // Stats
    const stats = endScreenData.stats;
    let yPos = 280;
    stats.forEach((stat, i) => {
      const statText = this.add.text(GAME_WIDTH / 2, yPos, stat, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaacc',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: statText,
        alpha: 1,
        duration: 800,
        delay: 1000 + (i * 400),
      });

      yPos += 30;
    });

    // CTA
    const cta = this.add.text(GAME_WIDTH / 2, 480, endScreenData.cta, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
      wordWrap: { width: 600 },
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: cta,
      alpha: 1,
      duration: 1000,
      delay: 3000,
    });

    // Contact links
    const contact = this.add.text(GAME_WIDTH / 2, 540, '[ @jdlo  |  jdlo.site  |  Let\'s build ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    contact.on('pointerdown', () => {
      window.open('https://jdlo.site', '_blank');
    });

    contact.on('pointerover', () => contact.setColor('#88aaee'));
    contact.on('pointerout', () => contact.setColor('#6688cc'));

    this.tweens.add({
      targets: contact,
      alpha: 1,
      duration: 1000,
      delay: 3500,
    });

    // Restart option
    const restart = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'Press SPACE to play again', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#444466',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: restart,
      alpha: 1,
      duration: 1000,
      delay: 4000,
    });

    this.tweens.add({
      targets: restart,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      delay: 5000,
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene');
      });
    });
  }
}
