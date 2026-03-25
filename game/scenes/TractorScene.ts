import { BaseChapterScene } from './BaseChapterScene';
import { tractorMap, MapData } from '../data/maps';
import { tractorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class TractorScene extends BaseChapterScene {
  constructor() {
    super({ key: 'TractorScene' });
    this.chapterTitle = 'Chapter 5: Caymus Vineyards';
    this.nextScene = 'ComeUpScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch4';
  }

  create() {
    super.create();
    // Tractor at 13,5
    this.addNavArrow(13, 4, 'Tractor');
    // AI discovery / computer area at 5,4 (evolve) and dialogue trigger at 6,4
    this.addNavArrow(5, 3, 'Computer');
    // Exit at 8,21
    this.addNavArrow(8, 20, 'Exit');
  }

  protected getObjectiveHint(): string {
    return 'Work the field. Find the computer.';
  }

  getMapData(): MapData {
    return tractorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return tractorDialogue;
  }
}
