import { BaseChapterScene } from './BaseChapterScene';
import { jailMap, MapData } from '../data/maps';
import { jailDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class JailScene extends BaseChapterScene {
  constructor() {
    super({ key: 'JailScene' });
    this.chapterTitle = 'Chapter 4: Locked Up';
    this.nextScene = 'TractorScene';
    this.requiredInteractionId = 'ch3_pushups';
  }

  protected getPlayerTexture(): string {
    return 'player-ch3';
  }

  protected getMusicTrack(): string {
    return 'jail';
  }

  create() {
    super.create();
    // Exit triggers at y=25, x=17-18
    this.addNavArrow(17, 24, 'Freedom');
  }

  protected getObjectiveHint(): string {
    return 'Survive. Study. Find the exit.';
  }

  getMapData(): MapData {
    return jailMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return jailDialogue;
  }
}
