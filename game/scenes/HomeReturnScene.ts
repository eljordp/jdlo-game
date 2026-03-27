import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE, CHAR_SCALE } from '../config';
import { MusicSystem } from '../systems/MusicSystem';

/**
 * Cinematic home return scene — the emotional peak.
 * JP comes home after everything. Pops, sister, Ivy the dog.
 * Warm golden tones throughout — this is the payoff.
 */
export class HomeReturnScene extends Phaser.Scene {
  private currentStep = 0;
  private canAdvance = false;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super({ key: 'HomeReturnScene' });
  }

  create() {
    this.currentStep = 0;
    this.canAdvance = false;
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];

    MusicSystem.stop();
    this.cameras.main.fadeIn(500, 0, 0, 0);

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
    for (const o of this.sceneObjects) o.destroy();
    for (const tw of this.activeTweens) tw.remove();
    this.textObjects = [];
    this.sceneObjects = [];
    this.activeTweens = [];
  }

  private addObj<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.sceneObjects.push(obj);
    return obj;
  }

  private addTween(config: Phaser.Types.Tweens.TweenBuilderConfig): Phaser.Tweens.Tween {
    const tw = this.tweens.add(config);
    this.activeTweens.push(tw);
    return tw;
  }

  private showText(
    text: string,
    y: number,
    options: { size?: string; color?: string; delay?: number; x?: number } = {}
  ) {
    const { size = '14px', color = '#ffffff', delay = 0, x = GAME_WIDTH / 2 } = options;
    const t = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size,
      color,
      wordWrap: { width: GAME_WIDTH - 100 },
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);

    this.addTween({ targets: t, alpha: 1, duration: 400, delay });
    this.textObjects.push(t);
    return t;
  }

  private showContinue(delay = 1500) {
    this.time.delayedCall(delay, () => {
      if (this.scene.isActive()) {
        const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '▼', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '12px',
          color: '#887744',
        }).setOrigin(0.5);
        this.addTween({
          targets: hint,
          alpha: 0.3,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });
        this.textObjects.push(hint);
        this.canAdvance = true;
      }
    });
  }

  private playStep() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    switch (this.currentStep) {
      // ═══════════════════════════════════════════════════════════════
      // STEP 0 — The Drive Home
      // ═══════════════════════════════════════════════════════════════
      case 0: {
        // Dark blue-grey sky — early evening drive
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x2a3040)
        );

        // Sky gradient — warm horizon
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT * 0.35, GAME_WIDTH, GAME_HEIGHT * 0.3, 0x504838).setAlpha(0.5)
        );

        // Green sides — grass alongside the road
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT * 0.75, GAME_WIDTH, GAME_HEIGHT * 0.5, 0x2a5020)
        );

        // Road — dark grey asphalt
        const road = this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT * 0.75, 500, GAME_HEIGHT * 0.5, 0x3a3a3a)
        );

        // Road center line — dashed yellow
        for (let i = 0; i < 8; i++) {
          const dash = this.addObj(
            this.add.rectangle(cx, GAME_HEIGHT * 0.55 + i * 60, 4, 30, 0xf0d040).setAlpha(0.6)
          );
          // Scroll dashes downward to simulate driving
          this.addTween({
            targets: dash,
            y: dash.y + 60,
            duration: 800,
            repeat: -1,
            ease: 'Linear',
          });
        }

        // Trees passing on sides
        for (let i = 0; i < 5; i++) {
          const side = i % 2 === 0 ? cx - 320 : cx + 320;
          const treeY = 300 + i * 140;
          // Trunk
          const trunk = this.addObj(
            this.add.rectangle(side, treeY + 20, 12, 40, 0x4a3020)
          );
          // Canopy
          const canopy = this.addObj(
            this.add.circle(side, treeY - 10, 24, 0x1a5018, 0.8)
          );
          // Trees scroll down to simulate motion
          this.addTween({
            targets: [trunk, canopy],
            y: '+=200',
            duration: 3000,
            repeat: -1,
            ease: 'Linear',
          });
        }

        // JP in a car — simple rectangle car shape
        const carBody = this.addObj(
          this.add.rectangle(cx + 60, cy + 120, 70, 40, 0x505060).setDepth(5)
        );
        const carTop = this.addObj(
          this.add.rectangle(cx + 60, cy + 105, 45, 25, 0x404850).setDepth(5)
        );
        // JP inside the car
        const jp = this.addObj(
          this.add.sprite(cx + 60, cy + 105, 'player-ch6', 6).setScale(CHAR_SCALE * 0.6).setDepth(6)
        );

        // Subtle car bounce
        this.addTween({
          targets: [carBody, carTop, jp],
          y: '-=2',
          duration: 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        this.showText('Napa Valley. The exit JP used', cy - 180, {
          size: '14px', color: '#d0c8b0', delay: 800,
        });
        this.showText('to take to get to Caymus.', cy - 140, {
          size: '14px', color: '#d0c8b0', delay: 1200,
        });
        this.showText('He drives past it now.', cy - 80, {
          size: '14px', color: '#f0d860', delay: 2500,
        });

        this.showContinue(4000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 1 — The House
      // ═══════════════════════════════════════════════════════════════
      case 1: {
        // Warm daytime sky — light cream/beige
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e8d8)
        );

        // Light blue sky at top
        this.addObj(
          this.add.rectangle(cx, 0, GAME_WIDTH, GAME_HEIGHT * 0.4, 0xb8d8f0).setOrigin(0.5, 0).setAlpha(0.7)
        );

        // Green grass at bottom
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 280, 0x5ca04e).setOrigin(0.5, 1)
        );

        // Fence posts
        for (let i = 0; i < 16; i++) {
          this.addObj(
            this.add.rectangle(100 + i * 80, GAME_HEIGHT - 280, 6, 50, 0x8a7050).setAlpha(0.7)
          );
          // Horizontal rail
          if (i < 15) {
            this.addObj(
              this.add.rectangle(140 + i * 80, GAME_HEIGHT - 270, 80, 4, 0x8a7050).setAlpha(0.6)
            );
          }
        }

        // Tree on the left
        this.addObj(this.add.rectangle(200, GAME_HEIGHT - 340, 20, 80, 0x6a5030));
        this.addObj(this.add.circle(200, GAME_HEIGHT - 400, 50, 0x308030, 0.8));
        this.addObj(this.add.circle(180, GAME_HEIGHT - 380, 35, 0x3a9038, 0.6));

        // House — main body
        const houseX = cx;
        const houseY = GAME_HEIGHT * 0.38;

        // House walls — warm brown/tan
        this.addObj(
          this.add.rectangle(houseX, houseY + 40, 340, 200, 0xc8b898)
        );

        // Roof — dark brown triangle (made with polygon-like rectangles)
        // Peak
        this.addObj(
          this.add.triangle(houseX, houseY - 80, 0, 100, 200, 0, 400, 100, 0x6a4a2a).setDepth(1)
        );

        // Door — center
        this.addObj(
          this.add.rectangle(houseX, houseY + 80, 50, 90, 0x5a3a1a).setDepth(1)
        );
        // Doorknob
        this.addObj(
          this.add.circle(houseX + 16, houseY + 80, 4, 0xd0a040).setDepth(2)
        );

        // Windows
        this.addObj(
          this.add.rectangle(houseX - 100, houseY + 20, 60, 50, 0x80b8d8).setDepth(1)
        );
        this.addObj(
          this.add.rectangle(houseX + 100, houseY + 20, 60, 50, 0x80b8d8).setDepth(1)
        );
        // Window frames
        this.addObj(
          this.add.rectangle(houseX - 100, houseY + 20, 62, 2, 0x6a4a2a).setDepth(2)
        );
        this.addObj(
          this.add.rectangle(houseX - 100, houseY + 20, 2, 52, 0x6a4a2a).setDepth(2)
        );
        this.addObj(
          this.add.rectangle(houseX + 100, houseY + 20, 62, 2, 0x6a4a2a).setDepth(2)
        );
        this.addObj(
          this.add.rectangle(houseX + 100, houseY + 20, 2, 52, 0x6a4a2a).setDepth(2)
        );

        // JP walking toward the house from the bottom
        const jp = this.addObj(
          this.add.sprite(cx, GAME_HEIGHT + 40, 'player-ch6', 2).setScale(CHAR_SCALE).setDepth(5)
        );

        this.addTween({
          targets: jp,
          y: GAME_HEIGHT - 200,
          duration: 3000,
          ease: 'Power1',
        });

        this.showText('Same house. Same street. Same door.', cy - 200, {
          size: '14px', color: '#5a4a3a', delay: 800,
        });
        this.showText('But everything behind it is different now.', cy - 150, {
          size: '14px', color: '#8a6a40', delay: 2500,
        });

        this.showContinue(4500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2 — Pops
      // ═══════════════════════════════════════════════════════════════
      case 2: {
        // Warm interior — beige walls, warm wood floor
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e4d0)
        );

        // Floor — warm hardwood
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 350, 0xb08850).setOrigin(0.5, 1)
        );

        // Floor grain lines
        for (let i = 0; i < 8; i++) {
          this.addObj(
            this.add.rectangle(cx, GAME_HEIGHT - 40 - i * 45, GAME_WIDTH - 100, 2, 0xa07840).setAlpha(0.3)
          );
        }

        // Warm light from above — golden glow
        const glow = this.addObj(
          this.add.circle(cx, 80, 200, 0xf8e8b0, 0.15)
        );
        this.addTween({
          targets: glow,
          scaleX: 1.05,
          scaleY: 1.05,
          alpha: 0.2,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Wall details — a picture frame
        this.addObj(this.add.rectangle(cx - 250, 200, 60, 50, 0xd0c0a0));
        this.addObj(this.add.rectangle(cx - 250, 200, 64, 54, 0x6a5030).setAlpha(0.5)); // frame

        // Pops standing center, facing down (toward player)
        const pops = this.addObj(
          this.add.sprite(cx, cy - 20, 'npc_pops', 0).setScale(CHAR_SCALE).setDepth(3)
        );

        // JP enters from bottom
        const jp = this.addObj(
          this.add.sprite(cx, GAME_HEIGHT + 40, 'player-ch6', 2).setScale(CHAR_SCALE).setDepth(3)
        );

        // JP walks toward Pops
        this.addTween({
          targets: jp,
          y: cy + 120,
          duration: 2000,
          ease: 'Power1',
        });

        // Pops walks toward JP
        this.time.delayedCall(1200, () => {
          this.addTween({
            targets: pops,
            y: cy + 30,
            duration: 1200,
            ease: 'Power1',
          });
        });

        // Dialogue sequence
        this.showText('Pops', cy - 180, { size: '12px', color: '#d0a040', delay: 2800 });
        this.showText('"Son."', cy - 140, { size: '14px', color: '#e8d8c0', delay: 3200 });

        // They meet — Pops stops, JP stops
        this.time.delayedCall(3500, () => {
          // Both face each other
          jp.setFrame(2); // facing up
          pops.setFrame(0); // facing down
        });

        this.showText('Narrator', cy - 180, { size: '10px', color: '#888870', delay: 4500 });
        this.showText('Pops hugs him. Doesn\'t let go for a while.', cy - 140, {
          size: '12px', color: '#a09880', delay: 4800,
        });

        this.showContinue(6000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3 — Pops' Words
      // ═══════════════════════════════════════════════════════════════
      case 3: {
        // Same warm interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e4d0)
        );

        // Floor
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 350, 0xb08850).setOrigin(0.5, 1)
        );
        for (let i = 0; i < 8; i++) {
          this.addObj(
            this.add.rectangle(cx, GAME_HEIGHT - 40 - i * 45, GAME_WIDTH - 100, 2, 0xa07840).setAlpha(0.3)
          );
        }

        // Warm glow
        this.addObj(
          this.add.circle(cx, 80, 200, 0xf8e8b0, 0.15)
        );

        // Pops and JP standing together, close
        const pops = this.addObj(
          this.add.sprite(cx, cy + 10, 'npc_pops', 0).setScale(CHAR_SCALE).setDepth(3)
        );
        const jp = this.addObj(
          this.add.sprite(cx, cy + 100, 'player-ch6', 2).setScale(CHAR_SCALE).setDepth(3)
        );

        // Pops' dialogue — delivered slowly, each line fading in
        this.showText('Pops', 60, { size: '12px', color: '#d0a040', delay: 400 });
        this.showText('"I saw the websites. The businesses."', 100, {
          size: '13px', color: '#e8d8c0', delay: 800,
        });
        this.showText('"Your mom showed me."', 140, {
          size: '13px', color: '#e8d8c0', delay: 1800,
        });
        this.showText('"I don\'t understand half of it."', 200, {
          size: '13px', color: '#e8d8c0', delay: 3000,
        });
        this.showText('"But I know you built it yourself."', 240, {
          size: '13px', color: '#f0e0c0', delay: 4200,
        });

        this.showContinue(5500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 4 — Pops' Advice
      // ═══════════════════════════════════════════════════════════════
      case 4: {
        // Same warm interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e4d0)
        );
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 350, 0xb08850).setOrigin(0.5, 1)
        );
        this.addObj(
          this.add.circle(cx, 80, 200, 0xf8e8b0, 0.15)
        );

        // Pops and JP
        this.addObj(
          this.add.sprite(cx, cy + 10, 'npc_pops', 0).setScale(CHAR_SCALE).setDepth(3)
        );
        this.addObj(
          this.add.sprite(cx, cy + 100, 'player-ch6', 2).setScale(CHAR_SCALE).setDepth(3)
        );

        this.showText('Pops', 80, { size: '12px', color: '#d0a040', delay: 400 });
        this.showText('"Most people don\'t come back from', 120, {
          size: '13px', color: '#e8d8c0', delay: 800,
        });
        this.showText('what you went through, Jordan."', 155, {
          size: '13px', color: '#e8d8c0', delay: 1400,
        });
        this.showText('"But you did. And you came back better."', 215, {
          size: '14px', color: '#f0e0c0', delay: 2800,
        });
        this.showText('"Whatever you do, just do it all the way."', 275, {
          size: '13px', color: '#e8d8c0', delay: 4200,
        });
        this.showText('"Don\'t half-ass it."', 315, {
          size: '14px', color: '#f0d860', delay: 5200,
        });

        this.showContinue(6500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 5 — JP's Response
      // ═══════════════════════════════════════════════════════════════
      case 5: {
        // Same warm interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e4d0)
        );
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 350, 0xb08850).setOrigin(0.5, 1)
        );
        this.addObj(
          this.add.circle(cx, 80, 200, 0xf8e8b0, 0.15)
        );

        // Pops and JP
        this.addObj(
          this.add.sprite(cx, cy + 10, 'npc_pops', 0).setScale(CHAR_SCALE).setDepth(3)
        );
        this.addObj(
          this.add.sprite(cx, cy + 100, 'player-ch6', 2).setScale(CHAR_SCALE).setDepth(3)
        );

        this.showText('JP', 100, { size: '12px', color: '#60a0d0', delay: 400 });
        this.showText('"You told me that before I left for SB."', 140, {
          size: '13px', color: '#e0e0e0', delay: 800,
        });

        this.showText('Pops', 230, { size: '12px', color: '#d0a040', delay: 2500 });
        this.showText('"And now you\'re finally listening."', 270, {
          size: '14px', color: '#f0e0c0', delay: 3000,
        });

        this.showContinue(4500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 6 — Sister + Ivy
      // ═══════════════════════════════════════════════════════════════
      case 6: {
        // Same warm interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e4d0)
        );
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 350, 0xb08850).setOrigin(0.5, 1)
        );
        this.addObj(
          this.add.circle(cx, 80, 200, 0xf8e8b0, 0.15)
        );

        // JP standing center
        const jp = this.addObj(
          this.add.sprite(cx, cy + 60, 'player-ch6', 6).setScale(CHAR_SCALE).setDepth(3)
        );

        // Sister runs in from the right
        const sister = this.addObj(
          this.add.sprite(GAME_WIDTH + 40, cy + 40, 'npc_sister', 4).setScale(CHAR_SCALE).setDepth(3)
        );

        this.addTween({
          targets: sister,
          x: cx + 100,
          duration: 1200,
          ease: 'Power2',
          delay: 600,
        });

        // JP turns to face her
        this.time.delayedCall(1000, () => {
          jp.setFrame(6); // facing right
        });

        this.showText('Sister', 80, { size: '12px', color: '#d080a0', delay: 1200 });
        this.showText('"JP! You\'re home!"', 120, {
          size: '14px', color: '#f0d0e0', delay: 1600,
        });

        this.showText('JP', 200, { size: '12px', color: '#60a0d0', delay: 3000 });
        this.showText('"Hey kid. Miss me?"', 240, {
          size: '13px', color: '#e0e0e0', delay: 3400,
        });

        this.showText('Sister', 320, { size: '12px', color: '#d080a0', delay: 5000 });
        this.showText('"Mom says you\'re like a CEO now."', 360, {
          size: '13px', color: '#f0d0e0', delay: 5400,
        });

        this.showText('JP', 420, { size: '12px', color: '#60a0d0', delay: 7000 });
        this.showText('"COO. Close enough."', 460, {
          size: '13px', color: '#e0e0e0', delay: 7400,
        });

        this.showText('Sister', 530, { size: '12px', color: '#d080a0', delay: 8500 });
        this.showText('"Can you build me a website?"', 570, {
          size: '13px', color: '#f0d0e0', delay: 8900,
        });

        this.showContinue(10000);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 7 — Ivy
      // ═══════════════════════════════════════════════════════════════
      case 7: {
        // Same warm interior
        this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xf0e4d0)
        );
        this.addObj(
          this.add.rectangle(cx, GAME_HEIGHT, GAME_WIDTH, 350, 0xb08850).setOrigin(0.5, 1)
        );
        this.addObj(
          this.add.circle(cx, 80, 200, 0xf8e8b0, 0.15)
        );

        // JP standing, facing left (toward where Ivy runs from)
        const jp = this.addObj(
          this.add.sprite(cx, cy + 60, 'player-ch6', 4).setScale(CHAR_SCALE).setDepth(3)
        );

        // Sister standing nearby
        this.addObj(
          this.add.sprite(cx + 100, cy + 40, 'npc_sister', 4).setScale(CHAR_SCALE).setDepth(3)
        );

        // Ivy sprints in from the left
        const ivy = this.addObj(
          this.add.sprite(-40, cy + 100, 'npc_frenchie', 6).setScale(CHAR_SCALE * 0.8).setDepth(4)
        );

        // Ivy runs fast — bouncy motion
        this.addTween({
          targets: ivy,
          x: cx - 30,
          duration: 1000,
          ease: 'Power2',
          delay: 500,
        });

        // Ivy bouncing as she runs
        this.addTween({
          targets: ivy,
          y: cy + 90,
          duration: 150,
          yoyo: true,
          repeat: 6,
          delay: 500,
          ease: 'Sine.easeInOut',
        });

        // JP crouches down (scale shift to suggest kneeling)
        this.time.delayedCall(1500, () => {
          jp.setFrame(0); // facing down toward Ivy
          this.addTween({
            targets: jp,
            y: cy + 80,
            duration: 500,
            ease: 'Power1',
          });
        });

        // Ivy wiggles next to JP — excited
        this.time.delayedCall(2000, () => {
          this.addTween({
            targets: ivy,
            x: cx - 20,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        });

        this.showText('Narrator', 60, { size: '10px', color: '#888870', delay: 1800 });
        this.showText('Ivy sprints across the room.', 100, {
          size: '13px', color: '#a09880', delay: 2200,
        });
        this.showText('She doesn\'t care about the clients.', 155, {
          size: '13px', color: '#a09880', delay: 3400,
        });
        this.showText('The revenue. The title.', 195, {
          size: '13px', color: '#a09880', delay: 4400,
        });
        this.showText('She just knows her person is home.', 260, {
          size: '14px', color: '#d0b880', delay: 6000,
        });

        this.showContinue(7500);
        break;
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 8 — The Moment
      // ═══════════════════════════════════════════════════════════════
      case 8: {
        // Warm golden/amber background — emotional peak
        const bg = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xd8a848).setAlpha(0)
        );

        // Fade from previous scene to golden
        const flash = this.addObj(
          this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xffffff).setDepth(10)
        );
        this.addTween({
          targets: flash,
          alpha: 0,
          duration: 1500,
          ease: 'Power2',
        });
        this.addTween({
          targets: bg,
          alpha: 1,
          duration: 2000,
        });

        // Warm light overlay — soft radial glow
        const warmGlow = this.addObj(
          this.add.circle(cx, cy - 100, 300, 0xf8e090, 0.2).setDepth(1)
        );
        this.addTween({
          targets: warmGlow,
          scaleX: 1.1,
          scaleY: 1.1,
          alpha: 0.3,
          duration: 4000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // JP sprite alone, centered, facing the player
        const jp = this.addObj(
          this.add.sprite(cx, cy + 40, 'player-ch6', 0).setScale(CHAR_SCALE).setDepth(5)
        );

        // Slow breathing animation — subtle scale pulse
        this.addTween({
          targets: jp,
          scaleX: CHAR_SCALE * 1.02,
          scaleY: CHAR_SCALE * 1.02,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Text — larger, golden, slow reveal
        this.showText('Everything I built.', cy - 200, {
          size: '18px', color: '#f0d040', delay: 1500,
        });
        this.showText('Every 3 AM session.', cy - 140, {
          size: '14px', color: '#e8c840', delay: 3000,
        });
        this.showText('Every rejection. Every client.', cy - 95, {
          size: '14px', color: '#e8c840', delay: 4500,
        });
        this.showText('It was all for this.', cy - 30, {
          size: '16px', color: '#f0d860', delay: 6500,
        });
        this.showText('To come home and make Pops proud.', cy + 20, {
          size: '16px', color: '#fff0a0', delay: 8500,
        });

        // Hold for 2 seconds after last text, then fade to white → EndScene
        this.time.delayedCall(12000, () => {
          this.cameras.main.fadeOut(2500, 255, 255, 255);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('EndScene');
          });
        });
        break;
      }
    }
  }
}
