import { BaseChapterScene } from './BaseChapterScene';
import { wrongCrowdMap, MapData } from '../data/maps';
import { wrongCrowdDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { GAME_WIDTH, GAME_HEIGHT, SCALED_TILE, SCALE } from '../config';
import { Analytics } from '../systems/Analytics';

export class WrongCrowdScene extends BaseChapterScene {
  private raidTriggered = false;

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

    // Place the BMW 335i sprite
    const carX = 9 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 11 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    this.collisionTiles.add('8,11');
    this.collisionTiles.add('9,11');
    this.collisionTiles.add('10,11');

    // Add navigation hints — glowing arrows showing the path
    this.addHint(14, 8, 'Exit house');
    this.addHint(9, 11, 'Your 335i');
    this.addHint(18, 18, 'Buyer\'s block');
  }

  private addHint(x: number, y: number, _label: string) {
    const hintX = x * SCALED_TILE + SCALED_TILE / 2;
    const hintY = y * SCALED_TILE + SCALED_TILE / 2 - 20;
    const arrow = this.add.text(hintX, hintY, '▼', {
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
      { speaker: 'Buyer', text: 'Cool cool. Lemme get a—' },
    ];
    return dialogue;
  }

  protected handleInteractable(interactable: { id: string; type: string; consumed?: boolean }) {
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
      const bmw = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'car-bmw335i')
        .setScale(SCALE).setScrollFactor(0).setDepth(502);
      cutsceneObjects.push(bmw);
      this.tweens.add({ targets: bmw, y: GAME_HEIGHT / 2 + 34, duration: 300, yoyo: true, repeat: -1 });

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

      // Text
      const text1 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, 'Driving down the block...', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503).setAlpha(0);
      cutsceneObjects.push(text1);
      this.tweens.add({ targets: text1, alpha: 1, duration: 600, delay: 500 });

      const text2 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'Two zips in the jacket. Same routine.', {
        fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#aaaacc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(503).setAlpha(0);
      cutsceneObjects.push(text2);
      this.tweens.add({ targets: text2, alpha: 1, duration: 600, delay: 1200 });

      // After 3.5 seconds, clean up EVERYTHING and teleport
      this.time.delayedCall(3500, () => {
        // Kill all tweens on cutscene objects first
        for (const obj of cutsceneObjects) {
          this.tweens.killTweensOf(obj);
          obj.destroy();
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

    // Check if player is inside the buyer's house (row 23-25, col 21-25)
    const px = Math.round((this.player.x - SCALED_TILE / 2) / SCALED_TILE);
    const py = Math.round((this.player.y - SCALED_TILE / 2) / SCALED_TILE);

    if (py >= 23 && py <= 25 && px >= 21 && px <= 25) {
      this.raidTriggered = true;
      const lines = this.getChapterDialogue().npcs['ch2_sale'];
      this.dialogue.show(lines, () => {
        this.triggerRaid();
      });
    }
  }

  private triggerRaid() {
    this.frozen = true;
    this.cameras.main.shake(600, 0.015);

    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000
    ).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: 0.4,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        const policeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'POLICE!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: '#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

        this.tweens.add({
          targets: policeText,
          alpha: 1,
          duration: 300,
          hold: 1000,
          onComplete: () => {
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('CourtScene');
            });
          },
        });
      },
    });
  }
}
