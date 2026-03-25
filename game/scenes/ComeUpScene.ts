import { BaseChapterScene } from './BaseChapterScene';
import { comeUpMap, MapData } from '../data/maps';
import { comeUpDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class ComeUpScene extends BaseChapterScene {
  constructor() {
    super({ key: 'ComeUpScene' });
    this.chapterTitle = 'Chapter 6: The Come Up';
    this.nextScene = 'LAScene';
  }

  protected getPlayerTexture(): string {
    return 'player-ch5';
  }

  create() {
    super.create();
    // Client showcases
    this.addNavArrow(3, 13, 'WCT');
    this.addNavArrow(19, 13, 'Sticker Smith');
    this.addNavArrow(13, 16, 'DHL');
    // Exit at 27,23
    this.addNavArrow(27, 22, 'Exit');
  }

  protected getObjectiveHint(): string {
    return 'Visit clients. Build your portfolio.';
  }

  getMapData(): MapData {
    return comeUpMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return comeUpDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch5_wct_showcase: {
        title: 'WCT E-Commerce',
        description: 'Full online store. Product pages, cart, checkout. Built in one week.',
        revenue: '$900',
      },
      ch5_sticker_showcase: {
        title: 'The Sticker Smith',
        description: 'Complete brand overhaul. Website, Google Business, marketing system.',
        revenue: '$1,000',
      },
      ch5_dhl_showcase: {
        title: 'DHL Translator App',
        description: 'Translation tool for warehouse workers. Enterprise deployment.',
        revenue: 'Enterprise',
      },
    };
  }
}
