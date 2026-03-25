import { BaseChapterScene } from './BaseChapterScene';
import { comeUpMap, MapData } from '../data/maps';
import { comeUpDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class ComeUpScene extends BaseChapterScene {
  constructor() {
    super({ key: 'ComeUpScene' });
    this.chapterTitle = 'Chapter 5: The Come Up';
    this.nextScene = 'OperatorScene';
  }

  getMapData(): MapData {
    return comeUpMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return comeUpDialogue;
  }
}
