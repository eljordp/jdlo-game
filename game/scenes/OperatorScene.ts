import { BaseChapterScene } from './BaseChapterScene';
import { operatorMap, MapData } from '../data/maps';
import { operatorDialogue } from '../data/story';
import type { DialogueLine } from '../systems/DialogueSystem';

export class OperatorScene extends BaseChapterScene {
  constructor() {
    super({ key: 'OperatorScene' });
    this.chapterTitle = 'Chapter 7: Operator Mode';
    this.nextScene = 'VegasScene';
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
    // Exit south — head to Vegas
    this.addNavArrow(19, 18, 'Vegas');
  }

  protected getObjectiveHint(): string {
    return 'Run the LA operation. Talk to everyone, then head south to Vegas.';
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
