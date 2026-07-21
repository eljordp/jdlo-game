import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';
import { SoundEffects } from '../systems/SoundEffects';
import { gamepadInput, virtualInput } from '../../components/GameCanvas';

/**
 * The Spiral. Between the money and the arrest.
 *
 * JP's real arc: all wins, no planning, spent it all. Then he got lost in it —
 * faded every day, shrooms, drinking — until he crashed the car. The crash is
 * not scripted flavor; it's the consequence of a faded meter the player watches
 * climb and cannot fully hold. History is fixed (he crashed), but the losing of
 * control is played, not narrated.
 *
 * Codex owns route integration: slot between WeedRiseScene → WrongCrowdScene.
 */
export class SpiralScene extends Phaser.Scene {
  private step = 0;
  private canAdvance = false;
  private faded = 30;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private tweensList: Phaser.Tweens.Tween[] = [];

  constructor() {
    super({ key: 'SpiralScene' });
  }

  create() {
    this.step = 0;
    this.canAdvance = false;
    this.faded = 30;
    this.textObjects = [];
    this.sceneObjects = [];
    this.tweensList = [];

    MusicSystem.play('weed-rise');
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.add.rectangle(GAME_WIDTH / 2, 35, GAME_WIDTH, 70, 0x000000).setScrollFactor(0).setDepth(200);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 35, GAME_WIDTH, 70, 0x000000).setScrollFactor(0).setDepth(200);

    this.input.keyboard!.on('keydown-SPACE', () => this.advance());
    this.input.keyboard!.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());

    this.time.delayedCall(600, () => this.playStep());
  }

  private advance() {
    if (!this.canAdvance) return;
    this.canAdvance = false;
    this.step++;
    this.clear();
    this.playStep();
  }

  update() {
    if (virtualInput.actionJustPressed || gamepadInput.actionJustPressed) {
      virtualInput.actionJustPressed = false;
      gamepadInput.actionJustPressed = false;
      this.advance();
    }
  }

  private clear() {
    this.textObjects.forEach(t => t.destroy());
    this.sceneObjects.forEach(o => o.destroy());
    this.tweensList.forEach(t => t.remove());
    this.textObjects = [];
    this.sceneObjects = [];
    this.tweensList = [];
  }

  private obj<T extends Phaser.GameObjects.GameObject>(o: T): T { this.sceneObjects.push(o); return o; }
  private tween(c: Phaser.Types.Tweens.TweenBuilderConfig) { const t = this.tweens.add(c); this.tweensList.push(t); return t; }

  private text(str: string, y: number, opt: { size?: string; color?: string; delay?: number } = {}) {
    const { size = '13px', color = '#ffffff', delay = 0 } = opt;
    const t = this.add.text(GAME_WIDTH / 2, y, str, {
      fontFamily: '"Press Start 2P", monospace', fontSize: size, color, align: 'center',
      wordWrap: { width: GAME_WIDTH - 120 }, lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.tween({ targets: t, alpha: 1, duration: 500, delay });
    this.textObjects.push(t);
    return t;
  }

  private cont(delay = 1800) {
    this.time.delayedCall(delay, () => {
      if (!this.scene.isActive()) return;
      const h = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '▼', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#666688',
      }).setOrigin(0.5).setDepth(100);
      this.tween({ targets: h, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
      this.textObjects.push(h);
      this.canAdvance = true;
    });
  }

  private fadedBar(y: number) {
    const filled = Math.round(this.faded / 10);
    const color = this.faded >= 80 ? '#c04040' : this.faded >= 55 ? '#c0a040' : '#60a060';
    this.text('FADED  ' + '█'.repeat(filled) + '·'.repeat(10 - filled), y, { size: '8px', color });
  }

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.step) {
      // 0 — the plateau: wins stopped meaning anything
      case 0: {
        this.obj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0c0a12));
        this.text('THE COME DOWN', 120, { size: '18px', color: '#c8a0c0', delay: 200 });
        this.text('The money peaked. Then it just kept being the same night.', 200, { size: '11px', color: '#aaaacc', delay: 900 });
        this.text('All wins, no plan. Spent it as fast as it came.', 250, { size: '10px', color: '#9a9aba', delay: 1700 });
        this.text('When every night is the best night, none of them are.', 305, { size: '10px', color: '#8a8aaa', delay: 2500 });
        this.cont(3600);
        break;
      }

      // 1 — shrooms, the good dose: warm, euphoric, empathetic
      case 1: {
        this.faded = 45;
        this.obj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x141026));
        // soft breathing color fields
        for (let i = 0; i < 5; i++) {
          const blob = this.obj(this.add.circle(200 + i * 180, 250 + (i % 2) * 200, 90, [0xe08ab0, 0x8ab0e0, 0xe0c88a, 0x9ae0b0, 0xc89ae0][i], 0.12));
          this.tween({ targets: blob, scale: 1.4, alpha: 0.06, duration: 3000 + i * 400, yoyo: true, repeat: -1 });
        }
        this.text('A LITTLE', 110, { size: '16px', color: '#e0b0d0', delay: 200 });
        this.text('Some mushrooms. Just enough to feel warm.', 185, { size: '11px', color: '#d0b0d0', delay: 900 });
        this.text('The whole room goes warm. Everybody\'s beautiful. He loves his friends so much it aches.', 245, { size: '10px', color: '#c0a8c8', delay: 1700 });
        this.text('For a few hours nothing hurts and everything makes sense.', 315, { size: '10px', color: '#b0a0c0', delay: 2600 });
        this.fadedBar(380);
        this.cont(3800);
        break;
      }

      // 2 — every day: the daily fade, roommate's channel, losing time
      case 2: {
        this.faded = 62;
        MusicSystem.transitionTo('weed-paranoia', 1000);
        this.obj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0e1410));
        // drifting smoke
        for (let i = 0; i < 6; i++) {
          const s = this.obj(this.add.circle(150 + i * 160, GAME_HEIGHT - 140, 30, 0x90b090, 0.14));
          this.tween({ targets: s, y: s.y - 200, alpha: 0, scale: 2.5, duration: 4000, delay: i * 500, repeat: -1 });
        }
        this.text('EVERY DAY', 110, { size: '16px', color: '#90c090', delay: 200 });
        this.text('Smoke to wake up. Smoke to sleep. Smoke to think, smoke to stop thinking.', 185, { size: '10px', color: '#a0c0a0', delay: 900 });
        this.text('The roommate films challenges for his channel. JP\'s always down, always faded, always on camera.', 250, { size: '9px', color: '#90b090', delay: 1700 });
        this.text('Days start blurring into one long one. He stops counting them.', 320, { size: '10px', color: '#88a888', delay: 2600 });
        this.fadedBar(380);
        this.cont(3800);
        break;
      }

      // 3 — too much: ego death, the scary one
      case 3: {
        this.faded = 88;
        this.obj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x05050a));
        const spiral = this.obj(this.add.circle(cx, cy, 8, 0xffffff, 0));
        spiral.setStrokeStyle(2, 0x8a6ac0, 0.5);
        this.tween({ targets: spiral, scale: 40, alpha: 0, duration: 4000, repeat: -1 });
        const spiral2 = this.obj(this.add.circle(cx, cy, 8, 0xffffff, 0));
        spiral2.setStrokeStyle(2, 0x6a8ac0, 0.5);
        this.tween({ targets: spiral2, scale: 40, alpha: 0, duration: 4000, delay: 2000, repeat: -1 });
        this.cameras.main.shake(400, 0.002);
        this.text('TOO MUCH', 110, { size: '16px', color: '#a080d0', delay: 200 });
        this.text('One night he takes way too much.', 180, { size: '11px', color: '#b0a0d0', delay: 900 });
        this.text('The self just... goes. Ego death. He\'s awake, aware, but there\'s no JP left to be aware.', 240, { size: '10px', color: '#a898c8', delay: 1800 });
        this.text('No name. No story. Just consciousness with nobody home.', 305, { size: '10px', color: '#9888b8', delay: 2800 });
        this.text('It should have scared him straight. It didn\'t. Nothing did yet.', 360, { size: '9px', color: '#88789a', delay: 3800 });
        this.cont(5000);
        break;
      }

      // 4 — the drive: interactive. hold the lane while faded. it ends one way.
      case 4: {
        this.playDrive();
        break;
      }

      // 5 — the crash + aftermath
      case 5: {
        MusicSystem.stop();
        this.obj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0808));
        this.cameras.main.shake(600, 0.02);
        SoundEffects.playImpact();
        const flash = this.obj(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0));
        this.tween({ targets: flash, alpha: 0.7, duration: 120, yoyo: true });
        this.text('CRUNCH.', 130, { size: '24px', color: '#c04040', delay: 400 });
        this.text('The all-black 335i folds around a pole that was not moving.', 210, { size: '11px', color: '#aaaaaa', delay: 1400 });
        this.text('He walks away. The car does not.', 270, { size: '10px', color: '#9a9a9a', delay: 2400 });
        this.text('That was the night it started to unravel.', 325, { size: '10px', color: '#c0a0a0', delay: 3300 });
        this.cont(4500);
        break;
      }

      default: {
        this.cameras.main.fadeOut(900, 0, 0, 0);
        // Codex: set the true next scene in route integration. Falls through to
        // the arrest arc — WrongCrowd owns the raid, Court owns the plea.
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('WrongCrowdScene'));
        break;
      }
    }
  }

  // Hold the lane. Faded is high — the car drifts and the correction lags.
  // No matter how well you hold it, the night ends the way it really ended.
  private playDrive() {
    const cx = GAME_WIDTH / 2;
    this.obj(this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x060608));
    // road
    this.obj(this.add.rectangle(cx, GAME_HEIGHT - 120, 420, 260, 0x1a1a1f));
    for (let y = GAME_HEIGHT - 220; y < GAME_HEIGHT; y += 60) {
      this.obj(this.add.rectangle(cx, y, 8, 30, 0x5a5a3a, 0.6));
    }
    this.text('NIGHT DRIVE — keep it straight', 110, { size: '11px', color: '#c0c0c0', delay: 200 });
    this.text('← → hold the lane', 150, { size: '8px', color: '#8a8a8a', delay: 400 });
    this.fadedBar(GAME_HEIGHT - 40);

    const car = this.obj(this.add.rectangle(cx, GAME_HEIGHT - 140, 34, 60, 0x111111).setStrokeStyle(2, 0x333333));
    const left = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const right = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    let drift = 0;
    let elapsed = 0;
    let ended = false;
    // faded drives the drift: higher faded = stronger pull, laggier steering
    const driftForce = 0.5 + this.faded / 90;

    const ticker = this.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        if (ended) return;
        elapsed += 16;
        // wandering drift, worse the more faded
        drift += (Math.sin(elapsed / 500) * 0.4 + (Math.random() - 0.5) * 0.3) * driftForce;
        // steering — but laggy/weaker under faded
        const steer = 1.3 - this.faded / 140;
        if (left.isDown || virtualInput.left || gamepadInput.left) drift -= steer;
        if (right.isDown || virtualInput.right || gamepadInput.right) drift += steer;
        car.x = cx + drift * 12;
        // edge of road
        if (Math.abs(drift) > 14 || elapsed > 6000) {
          ended = true;
          ticker.remove();
          left.destroy(); right.destroy();
          this.step = 5;
          this.clear();
          this.playStep();
        }
      },
    });
    this.sceneObjects.push(ticker as unknown as Phaser.GameObjects.GameObject);
  }
}
