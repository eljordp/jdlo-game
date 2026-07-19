// Route-not-destination choice tracking. Records the player's mindset choices
// at fixed historical beats, then the end screen compares them to what JP
// really did. History never forks — only the texture of the run.
//
// Usage in a scene:
//   ChoiceLedger.record('pops_call', 'answered');
// Choices with jpReal: null are still awaiting JP's confirmed real answer and
// are skipped by the end-screen comparison until filled in.

export interface ChoiceDef {
  id: string;
  chapter: string;
  prompt: string;            // short label for the end screen
  options: [string, string]; // the two poles, display text
  jpReal: string | null;     // which option JP actually lived (null = unconfirmed)
  jpLine: string;            // end-screen line about JP's real choice
}

const STORAGE_KEY = 'jdlo_choice_ledger';

export const CHOICE_DEFS: ChoiceDef[] = [
  {
    id: 'farm_call',
    chapter: 'Santa Barbara',
    prompt: 'The call to the farm',
    options: ['Took the BMW', 'Hesitated first'],
    jpReal: 'Took the BMW',
    jpLine: 'JP drove up the same night.',
  },
  // jpReal sources: STORY_TRUTH_LEDGER + JP's canon answers in
  // docs/CHAPTER_WALKTHROUGH_AUDIT.md ("JP'S ANSWERS — CANON").
  {
    id: 'party_blow',
    chapter: 'Santa Barbara',
    prompt: 'The offer at the party',
    options: ['Turned it down', 'Took it'],
    jpReal: 'Took it', // JP-approved SB arc: drinks -> smoke -> blow -> blackout
    jpLine: "JP didn't turn it down. That night ended in a blackout.",
  },
  {
    id: 'pops_call',
    chapter: 'Wrong Crowd',
    prompt: "Pops calling at 1 AM",
    options: ['Answered', 'Let it ring'],
    jpReal: 'Let it ring', // canon: 3 missed calls, one voicemail, no callback
    jpLine: 'JP let it ring. All three times.',
  },
  {
    id: 'jose_text',
    chapter: 'Weed Rise',
    prompt: "Jose checking in",
    options: ['Texted back', 'Left it on read'],
    jpReal: null,
    jpLine: '',
  },
  {
    id: 'tractor_phone',
    chapter: 'Caymus',
    prompt: 'The phone on the tractor',
    options: ['Ignored it', 'Looked'],
    jpReal: 'Looked', // ledger-locked: the phone distraction crash IS the Caymus beat
    jpLine: 'JP looked. The crash was real.',
  },
  {
    id: 'rise_orders',
    chapter: 'Weed Rise',
    prompt: 'The orders kept coming',
    options: ['Took every order', 'Set a limit'],
    jpReal: 'Took every order', // canon: "I stopped keeping track of when that happened"
    jpLine: 'JP took every order. Limits came later, the hard way.',
  },
  {
    id: 'rise_route',
    chapter: 'Weed Rise',
    prompt: 'Planning the route',
    options: ['Urgent stop first', 'Closest stop first'],
    jpReal: null,
    jpLine: '',
  },
  {
    id: 'rise_extra_stop',
    chapter: 'Weed Rise',
    prompt: 'The late text: one more stop',
    options: ['Added the stop', 'Ignored it'],
    jpReal: 'Added the stop', // canon: 3:33 AM — "you coming or not?" He went.
    jpLine: 'JP added the stop. One of those nights, the door got kicked in.',
  },
  {
    id: 'jail_fight',
    chapter: 'Locked Up',
    prompt: 'Getting tested inside',
    options: ['Walked away', 'Fought'],
    jpReal: 'Fought',
    jpLine: 'Early on, JP fought. That was the old habit.',
  },
  {
    id: 'ghost_chase',
    chapter: 'Come Up',
    prompt: 'The prospect who ghosted',
    options: ['Kept sending', 'Moved on'],
    jpReal: 'Kept sending', // ledger tone-control: "he keeps sending after being ghosted"
    jpLine: 'JP kept sending. He still does.',
  },
  {
    id: 'price_hold',
    chapter: 'Come Up',
    prompt: 'Naming the price',
    options: ['Held the price', 'Cut it to close'],
    jpReal: 'Cut it to close',
    jpLine: 'JP dropped it every time back then. Desperate. These days he holds.',
  },
  // Awaiting JP's real answer — hidden from the comparison until confirmed:
  {
    id: 'commissary_share',
    chapter: 'Locked Up',
    prompt: 'The commissary run',
    options: ['Shared it', 'Kept it'],
    jpReal: 'Shared it',
    jpLine: 'JP shared. The homies kept him loaded — he ran the ramen economy.',
  },
  {
    id: 'post_the_win',
    chapter: 'Operator Mode',
    prompt: 'The launch nobody saw',
    options: ['Posted it', 'Kept it quiet'],
    jpReal: 'Kept it quiet',
    jpLine: 'JP kept most wins quiet. He\'s still learning to let them be seen.',
  },
];

export class ChoiceLedger {
  private static picks: Record<string, string> | null = null;

  private static load(): Record<string, string> {
    if (this.picks) return this.picks;
    try {
      this.picks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      this.picks = {};
    }
    return this.picks!;
  }

  static record(choiceId: string, option: string): void {
    const picks = this.load();
    picks[choiceId] = option;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch { /* storage unavailable — run still plays */ }
  }

  static get(choiceId: string): string | null {
    return this.load()[choiceId] ?? null;
  }

  static reset(): void {
    this.picks = {};
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  // Rows for the end-screen comparison: only choices the player actually hit
  // AND whose real answer is confirmed.
  static comparison(): Array<{ def: ChoiceDef; playerPick: string; matched: boolean }> {
    const picks = this.load();
    const rows: Array<{ def: ChoiceDef; playerPick: string; matched: boolean }> = [];
    for (const def of CHOICE_DEFS) {
      const pick = picks[def.id];
      if (!pick || def.jpReal === null) continue;
      rows.push({ def, playerPick: pick, matched: pick === def.jpReal });
    }
    return rows;
  }
}
