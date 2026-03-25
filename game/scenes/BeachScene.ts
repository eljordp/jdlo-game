import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';
import { SCALED_TILE, SCALE } from '../config';

export class BeachScene extends BaseChapterScene {
  constructor() {
    super({ key: 'BeachScene' });
    this.chapterTitle = 'Chapter 2: Santa Barbara';
    this.nextScene = 'WrongCrowdScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch1';
  }

  protected getMusicTrack(): string {
    return 'santa-barbara';
  }

  create() {
    super.create();
    // Exit triggers at y=18, x=12-15
    this.addNavArrow(13, 17, 'Next chapter');

    // Place the BMW 335i in the driveway (concrete strip near right side of house)
    const carX = 22 * SCALED_TILE + SCALED_TILE / 2;
    const carY = 10 * SCALED_TILE + SCALED_TILE / 2;
    const bmw = this.add.sprite(carX, carY, 'car-bmw335i');
    bmw.setScale(SCALE);
    bmw.setDepth(5);
    // BMW occupies 3 tiles of collision
    this.collisionTiles.add('21,10');
    this.collisionTiles.add('22,10');
    this.collisionTiles.add('23,10');
  }

  protected getObjectiveHint(): string {
    return 'Check out the townhouse. Head south to leave.';
  }

  getMapData(): MapData {
    return beachMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return beachDialogue;
  }
}
