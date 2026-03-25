import { BaseChapterScene } from './BaseChapterScene';
import { wrongCrowdMap, MapData } from '../data/maps';
import { wrongCrowdDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class WrongCrowdScene extends BaseChapterScene {
  constructor() {
    super({ key: 'WrongCrowdScene' });
    this.chapterTitle = 'Chapter 2: Wrong Crowd';
    this.nextScene = 'JailScene';
  }

  getMapData(): MapData {
    return wrongCrowdMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return wrongCrowdDialogue;
  }
}
