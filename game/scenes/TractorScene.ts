import { BaseChapterScene } from './BaseChapterScene';
import { tractorMap, MapData } from '../data/maps';
import { tractorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class TractorScene extends BaseChapterScene {
  constructor() {
    super({ key: 'TractorScene' });
    this.chapterTitle = 'Chapter 4: Caymus Vineyards';
    this.nextScene = 'ComeUpScene';
  }

  getMapData(): MapData {
    return tractorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return tractorDialogue;
  }
}
