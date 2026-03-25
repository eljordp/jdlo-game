import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { MusicSystem } from '../systems/MusicSystem';
import { Analytics } from '../systems/Analytics';

export class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  create() {
    MusicSystem.stop();
    Analytics.trackGameComplete();
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // Player sprite — operator outfit
    const player = this.add.sprite(GAME_WIDTH / 2, 100, 'player-ch6', 0)
      .setScale(8).setAlpha(0);

    this.tweens.add({
      targets: player,
      alpha: 1,
      duration: 1000,
    });

    // Name
    const title = this.add.text(GAME_WIDTH / 2, 200, 'JDLO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      delay: 500,
    });

    // The message — this isn't the end
    const mainMessage = this.add.text(GAME_WIDTH / 2, 270, 'The story isn\'t over.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: mainMessage,
      alpha: 1,
      duration: 1000,
      delay: 1200,
    });

    const sub = this.add.text(GAME_WIDTH / 2, 305, 'It\'s still being written. Every single day.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#8888aa',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: sub,
      alpha: 1,
      duration: 800,
      delay: 1800,
    });

    // Stats — compounding
    const stats = [
      'Self-taught in 5 months',
      '6+ clients and counting',
      'COO at 22',
      'Nothing stops. Always compounding.',
    ];

    let yPos = 370;
    stats.forEach((stat, i) => {
      const t = this.add.text(GAME_WIDTH / 2, yPos, stat, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: i === stats.length - 1 ? '#f0c040' : '#7777aa',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: t,
        alpha: 1,
        duration: 800,
        delay: 2400 + (i * 500),
      });

      yPos += 35;
    });

    // Callback to the beginning — reflective moment
    const callbackDelay = 2400 + stats.length * 500 + 600;

    const callbackLine1 = this.add.text(GAME_WIDTH / 2, 510, 'The kid who stared at the ceiling in his bedroom...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#aaaacc',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: callbackLine1,
      alpha: 1,
      duration: 1200,
      delay: callbackDelay,
    });

    const callbackLine2 = this.add.text(GAME_WIDTH / 2, 540, '...now runs operations from an LA highrise.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#aaaacc',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: callbackLine2,
      alpha: 1,
      duration: 1200,
      delay: callbackDelay + 1500,
    });

    // Three clear CTAs
    const ctaY = 590;
    const ctaDelay = callbackDelay + 3000;

    const keepUp = this.add.text(GAME_WIDTH / 2, ctaY, 'Keep up with the story', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    keepUp.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    keepUp.on('pointerover', () => keepUp.setColor('#ffdd66'));
    keepUp.on('pointerout', () => keepUp.setColor('#f0c040'));

    this.tweens.add({ targets: keepUp, alpha: 1, duration: 800, delay: ctaDelay });

    const igHandle = this.add.text(GAME_WIDTH / 2, ctaY + 28, '@jdlo', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    igHandle.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    igHandle.on('pointerover', () => igHandle.setColor('#88aaee'));
    igHandle.on('pointerout', () => igHandle.setColor('#6688cc'));

    this.tweens.add({ targets: igHandle, alpha: 1, duration: 800, delay: ctaDelay + 200 });

    // Divider
    const divider = this.add.text(GAME_WIDTH / 2, ctaY + 65, '—————', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#333355',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: divider, alpha: 1, duration: 800, delay: ctaDelay + 400 });

    // Learn from me
    const learn = this.add.text(GAME_WIDTH / 2, ctaY + 100, 'Learn what I know', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    learn.on('pointerdown', () => window.open('https://jdlo.site', '_blank'));
    learn.on('pointerover', () => learn.setColor('#ffdd66'));
    learn.on('pointerout', () => learn.setColor('#f0c040'));

    this.tweens.add({ targets: learn, alpha: 1, duration: 800, delay: ctaDelay + 600 });

    const site = this.add.text(GAME_WIDTH / 2, ctaY + 128, 'jdlo.site', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    site.on('pointerdown', () => window.open('https://jdlo.site', '_blank'));
    site.on('pointerover', () => site.setColor('#88aaee'));
    site.on('pointerout', () => site.setColor('#6688cc'));

    this.tweens.add({ targets: site, alpha: 1, duration: 800, delay: ctaDelay + 800 });

    // Work with me
    const work = this.add.text(GAME_WIDTH / 2, ctaY + 175, 'Work with me', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    work.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    work.on('pointerover', () => work.setColor('#ffdd66'));
    work.on('pointerout', () => work.setColor('#f0c040'));

    this.tweens.add({ targets: work, alpha: 1, duration: 800, delay: ctaDelay + 1000 });

    const dm = this.add.text(GAME_WIDTH / 2, ctaY + 203, 'DM me. Let\'s build.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#6688cc',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    dm.on('pointerdown', () => window.open('https://instagram.com/jdlo', '_blank'));
    dm.on('pointerover', () => dm.setColor('#88aaee'));
    dm.on('pointerout', () => dm.setColor('#6688cc'));

    this.tweens.add({ targets: dm, alpha: 1, duration: 800, delay: ctaDelay + 1200 });

    // Share button
    const shareBtn = this.add.text(GAME_WIDTH / 2, ctaY + 250, '[ SHARE YOUR JOURNEY ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f0c040',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    shareBtn.on('pointerdown', () => {
      this.shareGame();
    });
    shareBtn.on('pointerover', () => shareBtn.setColor('#ffdd66'));
    shareBtn.on('pointerout', () => shareBtn.setColor('#f0c040'));

    this.tweens.add({ targets: shareBtn, alpha: 1, duration: 800, delay: ctaDelay + 1500 });

    // Play again
    const restart = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'SPACE to play again', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#333355',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: restart,
      alpha: 1,
      duration: 1000,
      delay: 6000,
    });

    this.tweens.add({
      targets: restart,
      alpha: 0.2,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      delay: 7000,
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene');
      });
    });

    this.input.on('pointerdown', () => {
      // Mobile tap to replay (only if tapping empty area, not a link)
    });
  }

  private shareGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // Dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 1080, 1080);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JDLO', 540, 200);

    // Subtitle
    ctx.fillStyle = '#f0c040';
    ctx.font = '28px monospace';
    ctx.fillText('A True Story', 540, 260);

    // Stats
    ctx.fillStyle = '#aaaacc';
    ctx.font = '22px monospace';
    ctx.fillText("I played through JP's story", 540, 400);
    ctx.fillText('From Santa Barbara to the boardroom', 540, 440);

    // CTA
    ctx.fillStyle = '#f0c040';
    ctx.font = '26px monospace';
    ctx.fillText('Play it yourself:', 540, 600);
    ctx.fillStyle = '#6688cc';
    ctx.font = '24px monospace';
    ctx.fillText('jdlo-game.vercel.app', 540, 650);

    // @jdlo
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText('@jdlo', 540, 750);

    // Try to share or download
    canvas.toBlob((blob) => {
      if (blob && navigator.share) {
        const file = new File([blob], 'jdlo-game.png', { type: 'image/png' });
        navigator.share({
          title: 'JDLO | The Game',
          text: "I just played through JP's story. From Santa Barbara to the boardroom.",
          files: [file],
        }).catch(() => {
          this.downloadShare(blob);
        });
      } else if (blob) {
        this.downloadShare(blob);
      }
    }, 'image/png');
  }

  private downloadShare(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jdlo-game.png';
    a.click();
    URL.revokeObjectURL(url);
  }
}
