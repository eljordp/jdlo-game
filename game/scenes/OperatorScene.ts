import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class OperatorScene extends BaseChapterScene {
  constructor() {
    super({ key: 'OperatorScene' });
    this.chapterTitle = 'Chapter 7: Operator Mode';
    this.nextScene = 'EndScene';
    this.requiredInteractionId = 'ch6_equal_moment';
  }

  protected getPlayerTexture(): string {
    return 'player-ch6';
  }

  protected getMusicTrack(): string {
    return 'operator';
  }

  create() {
    super.create();
    // Exit at home zone — bottom of the map
    this.addNavArrow(34, 33, 'The End');
  }

  protected getObjectiveHint(): string {
    return 'LA. Vegas. Home. Explore it all. Head south to the end.';
  }

  getMapData(): MapData {
    return operatorMap;
  }

  getChapterDialogue(): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
    return operatorDialogue;
  }

  getShowcaseData(): Record<string, { title: string; description: string; revenue: string }> {
    return {
      ch6_dashboard: {
        title: "Pomaika'i Team Dashboard",
        description: 'Full ops dashboard. Built in one session. Whole team uses it daily.',
        revenue: 'COO',
      },
      ch6_portfolio: {
        title: 'The Portfolio',
        description: '6+ clients. Websites, AI systems, sales ops. All self-taught in 5 months.',
        revenue: '$10K+/mo',
      },
    };
  }
}
