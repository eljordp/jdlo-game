import { BaseChapterScene } from './BaseChapterScene';
import { beachMap, MapData } from '../data/maps';
import { beachDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class BeachScene extends BaseChapterScene {
  constructor() {
    super({ key: 'BeachScene' });
    this.chapterTitle = 'Chapter 1: Santa Barbara';
    this.nextScene = 'WrongCrowdScene';
  }

  getMapData(): MapData {
    return beachMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return beachDialogue;
  }
}
