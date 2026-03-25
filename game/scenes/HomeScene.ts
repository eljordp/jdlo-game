import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class HomeScene extends BaseChapterScene {
  constructor() {
    super({ key: 'HomeScene' });
    this.chapterTitle = 'Chapter 1: Home';
    this.nextScene = 'BeachScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch0';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeDialogue;
  }
}
