import { BaseChapterScene } from './BaseChapterScene';
import { wrongCrowdMap, MapData } from '../data/maps';
import { wrongCrowdDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE, SCALE } from '../config';
import { Analytics } from '../systems/Analytics';

export class WrongCrowdScene extends BaseChapterScene {
  private raidTriggered = false;
  private interactionCount = 0;
  private tensionOverlays: Phaser.GameObjects.Rectangle[] = [];
  private heartbeatTimer?: Phaser.Time.TimerEvent;
  private heartbeatOverlay?: Phaser.GameObjects.Rectangle;
  private windowLights: Phaser.GameObjects.Rectangle[] = [];
  private dogBarkShown = false;

  constructor() {
    super({ key: 'WrongCrowdScene' });
    this.chapterTitle = 'Chapter 3: Wrong Crowd';
    this.nextScene = 'CourtScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch3-tired';
  }

  protected getMusicTrack(): string {
    return 'wrong-crowd';
  }

  create() {
    super.create();
    this.raidTriggered = false;
    this.interactionCount = 0;
    this.dogBarkShown = false;

    // Nighttime tint — dark blue overlay
    this.cameras.main.setBackgroundColor(0x080810);
    const nightOverlay = this.add.rectangle(
      this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 480,
      2000, 2000, 0x101030
    ).setAlpha(0.35).setScrollFactor(0).setDepth(100);

    // Place the BMW 335i sprite
    const carX = 11 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 11 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    this.collisionTiles.add('10,11');
    this.collisionTiles.add('11,11');
    this.collisionTiles.add('12,11');

    // Navigation hints
    this.addHint(11, 8, 'Exit house');
    this.addHint(11, 11, 'Your 335i');
    this.addHint(18, 18, 'Buyer\'s block');

    // --- Night atmosphere: flickering window lights ---
    this.createWindowLights();

    // --- Tension building: edge darkening overlays ---
    this.createTensionOverlays();

    // 3:33 AM wake up cutscene at start
    this.play333Cutscene();
  }

  /**
   * Flickering yellow window lights in nearby buildings to sell the night atmosphere.
   */
  private createWindowLights() {
    const windowPositions = [
      { x: 8 * SCALED_TILE + 20, y: 0 * SCALED_TILE + 30 },   // house top-left window
      { x: 26 * SCALED_TILE + 10, y: 1 * SCALED_TILE + 20 },   // kitchen area window
      { x: 7 * SCALED_TILE + 40, y: 18 * SCALED_TILE + 10 },   // convenience store window
    ];

    for (const pos of windowPositions) {
      const light = this.add.rectangle(pos.x, pos.y, 12, 10, 0xf0c040)
        .setAlpha(0.5).setDepth(99);
      this.windowLights.push(light);

      // Each window flickers independently with random timing
      this.time.addEvent({
        delay: 600 + Math.random() * 1200,
        loop: true,
        callback: () => {
          const targetAlpha = 0.3 + Math.random() * 0.4;
          this.tweens.add({
            targets: light,
            alpha: targetAlpha,
            duration: 200 + Math.random() * 400,
          });
        },
      });
    }
  }

  /**
   * Four edge overlays that gradually darken as the player interacts with more things.
   * Starts at 0 alpha, reaches 0.2 by the time the deal happens.
   */
  private createTensionOverlays() {
    const thickness = 120;
    const overlayConfigs = [
      // top
      { x: GAME_WIDTH / 2, y: thickness / 2, w: GAME_WIDTH, h: thickness },
      // bottom
      { x: GAME_WIDTH / 2, y: GAME_HEIGHT - thickness / 2, w: GAME_WIDTH, h: thickness },
      // left
      { x: thickness / 2, y: GAME_HEIGHT / 2, w: thickness, h: GAME_HEIGHT },
      // right
      { x: GAME_WIDTH - thickness / 2, y: GAME_HEIGHT / 2, w: thickness, h: GAME_HEIGHT },
    ];

    this.tensionOverlays = [];
    for (const cfg of overlayConfigs) {
      const overlay = this.add.rectangle(cfg.x, cfg.y, cfg.w, cfg.h, 0x000000)
        .setAlpha(0).setScrollFactor(0).setDepth(150);
      this.tensionOverlays.push(overlay);
    }
  }

  /**
   * Called after each interaction to gradually increase edge darkness.
   */
  private increaseTension() {
    this.interactionCount++;
    // ~10 interactions to reach max tension of 0.2
    const targetAlpha = Math.min(0.2, this.interactionCount * 0.025);
    for (const overlay of this.tensionOverlays) {
      this.tweens.add({
        targets: overlay,
        alpha: targetAlpha,
        duration: 800,
      });
    }
  }

  private play333Cutscene() {
    this.frozen = true;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // --- Heartbeat pulse: dark red vignette ---
    this.heartbeatOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x880000
    ).setScrollFactor(0).setDepth(599).setAlpha(0);
    objects.push(this.heartbeatOverlay);

    this.heartbeatTimer = this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        if (this.heartbeatOverlay && this.heartbeatOverlay.active) {
          this.tweens.add({
            targets: this.heartbeatOverlay,
            alpha: 0.15,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut',
          });
        }
      },
    });

    // --- Slow camera zoom for creep effect ---
    this.cameras.main.zoomTo(1.05, 3000);

    // Black screen
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setScrollFactor(0).setDepth(600).setAlpha(1);
    objects.push(bg);

    // Clock: 3:33 AM
    const clock = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, '3:33 AM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff2020',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);
    objects.push(clock);

    // Fade in clock
    this.tweens.add({
      targets: clock,
      alpha: 1,
      duration: 1000,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        // Bad thoughts sequence
        const thoughts = [
          { text: 'JP wakes up. Can\'t sleep again.', delay: 0 },
          { text: 'Something feels off tonight.', delay: 1500 },
          { text: 'Like something bad is about to happen.', delay: 3000 },
          { text: 'Phone buzzes. It\'s the buyer.\n"You coming or not?"', delay: 4800 },
          { text: '...fuck it.', delay: 6500 },
        ];

        for (const thought of thoughts) {
          const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, thought.text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '13px',
            color: '#888899',
            wordWrap: { width: GAME_WIDTH - 200 },
            align: 'center',
            lineSpacing: 8,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);
          objects.push(t);

          this.tweens.add({
            targets: t,
            alpha: 1,
            duration: 600,
            delay: thought.delay,
            hold: 1200,
            yoyo: true,
          });
        }

        // After all thoughts, stop heartbeat, reset zoom, fade out and start gameplay
        this.time.delayedCall(8500, () => {
          // Stop heartbeat
          if (this.heartbeatTimer) {
            this.heartbeatTimer.remove();
            this.heartbeatTimer = undefined;
          }
          if (this.heartbeatOverlay && this.heartbeatOverlay.active) {
            this.tweens.killTweensOf(this.heartbeatOverlay);
            this.heartbeatOverlay.setAlpha(0);
          }

          // Reset camera zoom
          this.cameras.main.zoomTo(1.0, 800);

          this.tweens.add({
            targets: bg,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              for (const obj of objects) {
                if (obj && obj.active) obj.destroy();
              }
              this.frozen = false;
            },
          });
        });
      },
    });
  }

  private addHint(x: number, y: number, _label: string) {
    const hintX = x * SCALED_TILE + SCALED_TILE / 2;
    const hintY = y * SCALED_TILE + SCALED_TILE / 2 - 20;
    const arrow = this.add.text(hintX, hintY, '\u25bc', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f0c040',
    }).setOrigin(0.5).setDepth(50).setAlpha(0.6);
    this.tweens.add({
      targets: arrow,
      y: hintY + 8,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  protected getObjectiveHint(): string {
    return 'Grab the weed. Get in the 335i. Make the drop.';
  }

  getMapData(): MapData {
    return wrongCrowdMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    const dialogue = wrongCrowdDialogue;
    dialogue.npcs['ch2_sale'] = [
      { speaker: 'Buyer', text: 'You got that zip?' },
      { speaker: 'JP', text: 'Right here.' },
      { speaker: 'Buyer', text: 'Cool cool. Lemme get a\u2014' },
    ];
    return dialogue;
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
    // Increase tension on every interaction
    this.increaseTension();

    // Car interaction — driving cutscene
    if (interactable.id === 'ch2_car') {
      Analytics.trackInteraction(interactable.id);
      this.frozen = true;
      this.interactions.consume(interactable.id);
      this.playDrivingCutscene();
      return;
    }

    if (interactable.id === 'ch2_sale' && !this.raidTriggered) {
      Analytics.trackInteraction(interactable.id);
      this.raidTriggered = true;
      const lines = this.getChapterDialogue().npcs['ch2_sale'];
      this.dialogue.show(lines, () => {
        this.triggerRaid();
      });
      this.interactions.consume(interactable.id);
      return;
    }
    super.handleInteractable(interactable);
  }

  private playDrivingCutscene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Track ALL objects for cleanup
      const cutsceneObjects: Phaser.GameObjects.GameObject[] = [];
      const cutsceneTimers: Phaser.Time.TimerEvent[] = [];

      const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x101018)
        .setScrollFactor(0).setDepth(500);
      cutsceneObjects.push(overlay);

      // Road surface
      const road = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, GAME_WIDTH, 80, 0x303038)
        .setScrollFactor(0).setDepth(500);
      cutsceneObjects.push(road);

      // Road lines
      for (let i = 0; i < 8; i++) {
        const line = this.add.rectangle(
          200 + i * 160, GAME_HEIGHT / 2 + 40, 40, 6, 0xf0c040
        ).setScrollFactor(0).setDepth(501);
        cutsceneObjects.push(line);
        this.tweens.add({ targets: line, x: line.x - 160, duration: 400, repeat: -1 });
      }

      // BMW
      const bmwSprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'car-bmw335i')
        .setScale(SCALE).setScrollFactor(0).setDepth(502);
      cutsceneObjects.push(bmwSprite);
      this.tweens.add({ targets: bmwSprite, y: GAME_HEIGHT / 2 + 34, duration: 300, yoyo: true, repeat: -1 });

      // City lights
      for (let i = 0; i < 15; i++) {
        const light = this.add.rectangle(
          Math.random() * GAME_WIDTH,
          GAME_HEIGHT / 2 - 60 - Math.random() * 120,
          3, 4 + Math.random() * 8,
          [0xf0c040, 0x40a0f0, 0xf06040][Math.floor(Math.random() * 3)]
        ).setScrollFactor(0).setDepth(501).setAlpha(0.4);
        cutsceneObjects.push(light);
        this.tweens.add({ targets: light, x: light.x - 300, duration: 800 + Math.random() * 400, repeat: -1 });
      }

      // --- Streetlight pass effect: yellow circles sliding right to left ---
      const streetlightTimer = this.time.addEvent({
        delay: 400,
        repeat: 7, // ~3.2 seconds of lights
        callback: () => {
          const streetlight = this.add.circle(
            GAME_WIDTH + 30,
            40 + Math.random() * 60,
            18, 0xf0c040
          ).setScrollFactor(0).setDepth(504).setAlpha(0.35);
          cutsceneObjects.push(streetlight);
          this.tweens.add({
            targets: streetlight,
            x: -30,
            alpha: 0,
            duration: 1200,
            ease: 'Sine.easeIn',
            onComplete: () => {
              if (streetlight.active) streetlight.destroy();
            },
          });
        },
      });
      cutsceneTimers.push(streetlightTimer);

      // Driving text with tension beats
      const driveLines = [
        { text: 'Driving down the block...', delay: 500 },
        { text: 'Two zips in the jacket. Same routine.', delay: 1800 },
      ];

      for (let i = 0; i < driveLines.length; i++) {
        const line = driveLines[i];
        const lineText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160 + i * 40, line.text, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: i === 0 ? '14px' : '11px',
          color: i === 0 ? '#ffffff' : '#aaaacc',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503).setAlpha(0);
        cutsceneObjects.push(lineText);

        // Tension beat: brief screen darken before each line after the first
        if (i > 0) {
          const darken = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000
          ).setScrollFactor(0).setDepth(505).setAlpha(0);
          cutsceneObjects.push(darken);

          this.tweens.add({
            targets: darken,
            alpha: 0.3,
            duration: 150,
            delay: line.delay - 500,
            yoyo: true,
            hold: 200,
          });
        }

        this.tweens.add({ targets: lineText, alpha: 1, duration: 600, delay: line.delay });
      }

      // After 3.5 seconds, clean up EVERYTHING and teleport
      this.time.delayedCall(3500, () => {
        // Kill timers
        for (const timer of cutsceneTimers) {
          timer.remove();
        }
        // Kill all tweens on cutscene objects first
        for (const obj of cutsceneObjects) {
          this.tweens.killTweensOf(obj);
          if (obj.active) obj.destroy();
        }

        // Move player to the buyer's neighborhood
        this.player.setPosition(
          18 * SCALED_TILE + SCALED_TILE / 2,
          19 * SCALED_TILE + SCALED_TILE / 2
        );
        this.cameras.main.fadeIn(800, 0, 0, 0);
        this.frozen = false;
      });
    });
  }

  // Also trigger raid if player walks into the sale area
  update(time: number, delta: number) {
    super.update(time, delta);

    if (this.raidTriggered) return;

    // --- Dog bark: appears once when player is near the map edge ---
    if (!this.dogBarkShown && this.player) {
      const px = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
      const py = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

      // Trigger when player is outside the house, near the street
      if (py >= 10 && py <= 14 && !this.dogBarkShown) {
        this.dogBarkShown = true;
        const barkX = 2 * SCALED_TILE;
        const barkY = 14 * SCALED_TILE;
        const bark = this.add.text(barkX, barkY, '*bark*', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#665544',
        }).setOrigin(0.5).setDepth(90).setAlpha(0);

        this.tweens.add({
          targets: bark,
          alpha: 0.6,
          duration: 400,
          hold: 1200,
          yoyo: true,
          onComplete: () => {
            if (bark.active) bark.destroy();
          },
        });
      }
    }

    // Check if player is inside the buyer's house (row 23-25, col 21-25)
    const px2 = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const py2 = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    if (py2 >= 23 && py2 <= 25 && px2 >= 21 && px2 <= 25) {
      this.raidTriggered = true;
      const lines = this.getChapterDialogue().npcs['ch2_sale'];
      this.dialogue.show(lines, () => {
        this.triggerRaid();
      });
    }
  }

  private triggerRaid() {
    this.frozen = true;

    // --- Red/blue alternating police flashes on screen edges ---
    const redFlash = this.add.rectangle(
      60, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0xff0000
    ).setScrollFactor(0).setDepth(200).setAlpha(0);
    const blueFlash = this.add.rectangle(
      GAME_WIDTH - 60, GAME_HEIGHT / 2, 120, GAME_HEIGHT, 0x0000ff
    ).setScrollFactor(0).setDepth(200).setAlpha(0);

    // Alternate red/blue every 300ms
    let flashState = false;
    const flashTimer = this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        flashState = !flashState;
        if (redFlash.active) redFlash.setAlpha(flashState ? 0.4 : 0);
        if (blueFlash.active) blueFlash.setAlpha(flashState ? 0 : 0.4);
      },
    });

    // --- Camera shake that builds from 0.005 to 0.02 over 2 seconds ---
    this.cameras.main.shake(800, 0.005);
    this.time.delayedCall(800, () => {
      this.cameras.main.shake(600, 0.01);
    });
    this.time.delayedCall(1400, () => {
      this.cameras.main.shake(600, 0.02);
    });

    // --- "FREEZE!" text that slams onto screen (scale 3 -> 1) ---
    this.time.delayedCall(600, () => {
      // Brief black flash behind the text
      const slamBg = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000
      ).setScrollFactor(0).setDepth(201).setAlpha(0);

      this.tweens.add({
        targets: slamBg,
        alpha: 0.6,
        duration: 100,
        yoyo: true,
        hold: 400,
      });

      const freezeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'FREEZE!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '36px',
        color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setScale(3).setAlpha(0);

      this.tweens.add({
        targets: freezeText,
        scale: 1,
        alpha: 1,
        duration: 250,
        ease: 'Back.easeOut',
        hold: 800,
        onComplete: () => {
          // Now show POLICE! and transition out
          const policeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'POLICE!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: '#ff4444',
          }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

          this.tweens.add({
            targets: policeText,
            alpha: 1,
            duration: 300,
            hold: 800,
            onComplete: () => {
              // Stop flashing
              flashTimer.remove();
              if (redFlash.active) redFlash.destroy();
              if (blueFlash.active) blueFlash.destroy();

              this.cameras.main.fadeOut(1500, 0, 0, 0);
              this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CourtScene');
              });
            },
          });
        },
      });
    });
  }
}
