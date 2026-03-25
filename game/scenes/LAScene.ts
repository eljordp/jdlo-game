import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

/**
 * Cinematic scene between Come Up and Operator Mode.
 * Corvette C8 cruising LA, steak dinners with friends,
 * laptops out doing AI work, LA highrise vibes.
 */
export class LAScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private bgObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'LAScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];
    this.bgObjects = [];

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.input.keyboard!.on('keydown-SPACE', () => this.advance());
    this.input.keyboard!.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());

    this.time.delayedCall(500, () => this.playStep());
  }

  private advance() {
    if (this.canAdvance) {
      this.canAdvance = false;
      this.currentStep++;
      this.clearAll();
      this.playStep();
    }
  }

  private clearAll() {
    for (const t of this.textObjects) t.destroy();
    for (const b of this.bgObjects) b.destroy();
    this.textObjects = [];
    this.bgObjects = [];
  }

  private showText(
    text: string,
    y: number,
    options: { size?: string; color?: string; delay?: number; align?: string } = {}
  ) {
    const { size = '14px', color = '#ffffff', delay = 0, align = 'center' } = options;
    const t = this.add.text(GAME_WIDTH / 2, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size,
      color,
      wordWrap: { width: GAME_WIDTH - 120 },
      align,
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: t,
      alpha: 1,
      duration: 600,
      delay,
    });

    this.textObjects.push(t);
    return t;
  }

  private showContinue(delay = 2000) {
    this.time.delayedCall(delay, () => {
      const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '▼', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#666688',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: hint,
        alpha: 0.3,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
      this.textObjects.push(hint);
      this.canAdvance = true;
    });
  }

  private playStep() {
    switch (this.currentStep) {
      case 0: {
        // Night sky gradient — dark blue to black
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0820);
        this.bgObjects.push(bg);

        // Stars
        for (let i = 0; i < 30; i++) {
          const star = this.add.rectangle(
            Math.random() * GAME_WIDTH,
            Math.random() * (GAME_HEIGHT / 2),
            2, 2, 0xffffff
          ).setAlpha(Math.random() * 0.5 + 0.2);
          this.bgObjects.push(star);
        }

        // City lights at bottom
        for (let i = 0; i < 20; i++) {
          const light = this.add.rectangle(
            Math.random() * GAME_WIDTH,
            GAME_HEIGHT - 80 + Math.random() * 60,
            3 + Math.random() * 4,
            2 + Math.random() * 8,
            [0xf0c040, 0x40a0f0, 0xf06040, 0xffffff][Math.floor(Math.random() * 4)]
          ).setAlpha(0.4 + Math.random() * 0.3);
          this.bgObjects.push(light);
        }

        this.showText('LOS ANGELES', GAME_HEIGHT / 2 - 80, { size: '24px', color: '#f0c040' });
        this.showText('Top down in a C8 Corvette.', GAME_HEIGHT / 2 - 10, { delay: 800 });
        this.showText('PCH at sunset. Wind in the hair.\nThis is what they don\'t show you\nabout making it out.', GAME_HEIGHT / 2 + 50, { size: '12px', color: '#aaaacc', delay: 1400 });
        this.showContinue(3000);
        break;
      }

      case 1: {
        // Warm restaurant interior vibe
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1008);
        this.bgObjects.push(bg);

        // Warm amber lights
        for (let i = 0; i < 8; i++) {
          const glow = this.add.circle(
            150 + i * 120,
            100 + Math.random() * 40,
            30 + Math.random() * 20,
            0xf0a040,
            0.08
          );
          this.bgObjects.push(glow);
        }

        this.showText('Steak dinner. Real restaurant.\nNot the drive-thru.', GAME_HEIGHT / 2 - 60, { color: '#f0d0a0' });
        this.showText('Four friends at the table.\nLaptops open between the plates.\nBuilding while we eat.', GAME_HEIGHT / 2 + 20, { size: '12px', delay: 800 });
        this.showText('"We\'re all doing AI work now.\nEvery single one of us left\nthe old life behind."', GAME_HEIGHT / 2 + 110, { size: '12px', color: '#aaaacc', delay: 1600 });
        this.showContinue(3000);
        break;
      }

      case 2: {
        // Highrise view
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x080818);
        this.bgObjects.push(bg);

        // Window frame
        const frame = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 200, GAME_HEIGHT - 200, 0x0a0a20);
        frame.setStrokeStyle(3, 0x303050);
        this.bgObjects.push(frame);

        // City below through window
        for (let i = 0; i < 40; i++) {
          const light = this.add.rectangle(
            200 + Math.random() * (GAME_WIDTH - 400),
            GAME_HEIGHT / 2 + 50 + Math.random() * 150,
            2 + Math.random() * 3,
            2 + Math.random() * 6,
            [0xf0c040, 0x40a0f0, 0xf06040, 0xf0f0f0][Math.floor(Math.random() * 4)]
          ).setAlpha(0.3 + Math.random() * 0.4);
          this.bgObjects.push(light);
        }

        this.showText('30th floor. Downtown LA.', GAME_HEIGHT / 2 - 120, { size: '16px', color: '#8888cc' });
        this.showText('Looking down at the city\nthat used to feel impossible\nto reach.', GAME_HEIGHT / 2 - 50, { delay: 800 });
        this.showContinue(2500);
        break;
      }

      case 3: {
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x060610);
        this.bgObjects.push(bg);

        this.showText('JP\'s Mind', GAME_HEIGHT / 2 - 80, { size: '12px', color: '#f0c040' });
        this.showText('"Six months ago I was\non a tractor in Napa.\nNow I\'m in a penthouse in LA\nbuilding AI systems."', GAME_HEIGHT / 2 - 10, { delay: 400 });
        this.showText('"This is just the beginning."', GAME_HEIGHT / 2 + 100, { size: '16px', color: '#f0c040', delay: 1500 });
        this.showContinue(3000);
        break;
      }

      case 4: {
        // Transition to Operator Mode
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('OperatorScene');
        });
        break;
      }
    }
  }
}
