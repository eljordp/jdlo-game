import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class JailScene extends BaseChapterScene {
  constructor() {
    super({ key: 'JailScene' });
    this.chapterTitle = 'Chapter 4: Locked Up';
    this.nextScene = 'TractorScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch3';
  }

  getMapData(): MapData {
    return jailMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return jailDialogue;
  }
}
