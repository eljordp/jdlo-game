import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class BeachScene extends BaseChapterScene {
  constructor() {
    super({ key: 'BeachScene' });
    this.chapterTitle = 'Chapter 2: Santa Barbara';
    this.nextScene = 'WrongCrowdScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch1';
  }

  create() {
    super.create();
    // Exit triggers at y=18, x=12-15
    this.addNavArrow(13, 17, 'Next chapter');
  }

  protected getObjectiveHint(): string {
    return 'Check out the frat house. Head south to leave.';
  }

  getMapData(): MapData {
    return beachMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return beachDialogue;
  }
}
