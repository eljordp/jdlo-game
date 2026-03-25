import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class OperatorScene extends BaseChapterScene {
  constructor() {
    super({ key: 'OperatorScene' });
    this.chapterTitle = 'Chapter 6: Operator Mode';
    this.nextScene = 'EndScene';
  }

  getMapData(): MapData {
    return operatorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return operatorDialogue;
  }
}
