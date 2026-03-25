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

  protected getMusicTrack(): string {
    return 'home';
  }

  create() {
    super.create();
    // Exit triggers at y=24, x=9-12
    this.addNavArrow(10, 23, 'Leave home');
  }

  protected getObjectiveHint(): string {
    return 'Explore your house. Talk to family. Leave when ready.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeDialogue;
  }
}
