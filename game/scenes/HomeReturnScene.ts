import { BaseChapterScene } from './BaseChapterScene';
import { homeMap, MapData } from '../data/maps';
import { homeReturnDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

/**
 * Home Return — playable chapter. Same house from Ch1, but JP is different now.
 * Walk around, talk to Pops, Mom, Sister, Ivy. Everyone's positive.
 * After talking to Pops (required), exit triggers EndScene.
 */
export class HomeReturnScene extends BaseChapterScene {
  constructor() {
    super({ key: 'HomeReturnScene' });
    this.chapterTitle = 'Home';
    this.nextScene = 'EndScene';
    this.requiredInteractionId = 'hr_goodbye';
  }

  protected getPlayerTexture(): string {
    return 'player-ch7';
  }

  protected getMusicTrack(): string {
    return '';
  }

  create() {
    super.create();

    // Override homeMap triggers — point to EndScene instead of BeachScene
    this.triggers = [];
    for (let x = 11; x <= 18; x++) {
      this.triggers.push({ x, y: 29, action: 'scene', target: 'EndScene' });
    }

    this.addNavArrow(13, 28, 'The End');
  }

  protected getObjectiveHint(): string {
    return 'You\'re home. Talk to your family.';
  }

  getMapData(): MapData {
    return homeMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return homeReturnDialogue;
  }
}
