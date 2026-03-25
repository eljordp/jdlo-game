import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

/**
 * Cinematic scene between Wrong Crowd and Jail.
 * Sequence:
 * 1. Black screen — "KNOCK KNOCK KNOCK" — cops burst in
 * 2. Cop dialogue
 * 3. Fade to courtroom — "Facing 13 years"
 * 4. Judge speaks — sentenced to 1 year
 * 5. Fade to jail
 */
export class CourtScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'CourtScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];

    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Full black background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000);

    // Input
    this.input.keyboard!.on('keydown-SPACE', () => this.advance());
    this.input.keyboard!.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());

    // Start the raid sequence
    this.time.delayedCall(500, () => this.playStep());
  }

  private advance() {
    if (this.canAdvance) {
      this.canAdvance = false;
      this.currentStep++;
      this.clearText();
      this.playStep();
    }
  }

  private clearText() {
    for (const t of this.textObjects) t.destroy();
    this.textObjects = [];
  }

  private showText(
    text: string,
    y: number,
    options: { size?: string; color?: string; delay?: number } = {}
  ) {
    const { size = '14px', color = '#ffffff', delay = 0 } = options;
    const t = this.add.text(GAME_WIDTH / 2, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size,
      color,
      wordWrap: { width: GAME_WIDTH - 100 },
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: t,
      alpha: 1,
      duration: 400,
      delay,
    });

    this.textObjects.push(t);
    return t;
  }

  private showContinue(delay = 1500) {
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
      case 0: // BANG BANG BANG
        this.showText('BANG  BANG  BANG', GAME_HEIGHT / 2 - 40, { size: '28px', color: '#ff4444' });
        this.showText('POLICE! OPEN UP!', GAME_HEIGHT / 2 + 30, { size: '16px', color: '#ff6666', delay: 800 });
        this.cameras.main.shake(500, 0.01);
        this.showContinue(2000);
        break;

      case 1: // Cop dialogue
        this.showText('Officer', GAME_HEIGHT / 2 - 80, { size: '12px', color: '#f0c040' });
        this.showText('"Hands where I can see them.\nAll of you. Against the wall. Now."', GAME_HEIGHT / 2 - 30, { size: '13px' });
        this.showText('JP\'s Mind', GAME_HEIGHT / 2 + 60, { size: '12px', color: '#f0c040', delay: 600 });
        this.showText('"This isn\'t happening."', GAME_HEIGHT / 2 + 100, { size: '13px', color: '#aaaacc', delay: 800 });
        this.showContinue(2000);
        break;

      case 2: // Arrested
        this.showText('Everyone in the house got taken in.', GAME_HEIGHT / 2 - 40, { color: '#888899' });
        this.showText('JP was charged with possession\nwith intent to distribute.', GAME_HEIGHT / 2 + 20, { delay: 600 });
        this.showContinue(2000);
        break;

      case 3: // Fade to court — FACING 13 YEARS
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.clearText();
          this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a18);
          this.cameras.main.fadeIn(800, 0, 0, 0);

          this.showText('SUPERIOR COURT OF CALIFORNIA', GAME_HEIGHT / 2 - 120, { size: '11px', color: '#666688', delay: 400 });
          this.showText('FACING', GAME_HEIGHT / 2 - 40, { size: '14px', color: '#888899', delay: 800 });
          this.showText('13 YEARS', GAME_HEIGHT / 2 + 10, { size: '36px', color: '#ff4444', delay: 1200 });

          this.time.delayedCall(1200, () => {
            this.cameras.main.shake(300, 0.005);
          });

          this.showContinue(3000);
        });
        break;

      case 4: // Lawyer
        this.showText('Lawyer', GAME_HEIGHT / 2 - 80, { size: '12px', color: '#f0c040' });
        this.showText('"Take the plea deal. One year.\nYou fight this, you\'re looking at\nthe full thirteen."', GAME_HEIGHT / 2 - 20);
        this.showText('JP', GAME_HEIGHT / 2 + 80, { size: '12px', color: '#f0c040', delay: 600 });
        this.showText('"...one year?"', GAME_HEIGHT / 2 + 110, { color: '#aaaacc', delay: 800 });
        this.showContinue(2000);
        break;

      case 5: // Sentencing
        this.showText('SENTENCED', GAME_HEIGHT / 2 - 60, { size: '16px', color: '#888899' });
        this.showText('1 YEAR', GAME_HEIGHT / 2, { size: '32px', color: '#f0c040', delay: 600 });
        this.showText('California State', GAME_HEIGHT / 2 + 60, { size: '12px', color: '#666688', delay: 1000 });
        this.showContinue(2500);
        break;

      case 6: // JP's mind before jail
        this.showText('JP\'s Mind', GAME_HEIGHT / 2 - 60, { size: '12px', color: '#f0c040' });
        this.showText('"One year. I can do one year.\nBut I\'m not coming out the same\nperson who went in."', GAME_HEIGHT / 2, { delay: 400 });
        this.showContinue(2000);
        break;

      case 7: // Transition to jail
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('JailScene');
        });
        break;
    }
  }
}
