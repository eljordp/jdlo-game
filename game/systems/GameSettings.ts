// Global game settings — persisted to localStorage

export class GameSettings {
  private static KEY = 'jdlo-game-settings';

  private static defaults = {
    kidsMode: false,    // Censors adult content with funny replacements
    hardMode: false,    // Minigames are harder, timers shorter
    bigHead: false,     // Big head mode — NPC heads 2x size
    speedRun: false,    // Timer on screen, skip dialogue faster
    commentary: true,   // JP's inner monologue / narrator enabled
  };

  private static cache: Record<string, boolean> | null = null;

  private static load(): Record<string, boolean> {
    if (this.cache) return this.cache;
    try {
      const stored = JSON.parse(localStorage.getItem(this.KEY) || '{}');
      this.cache = { ...this.defaults, ...stored };
    } catch {
      this.cache = { ...this.defaults };
    }
    return this.cache!;
  }

  private static save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.cache));
    } catch { /* silent */ }
  }

  static get(key: string): boolean {
    return this.load()[key] ?? false;
  }

  static set(key: string, value: boolean) {
    this.load()[key] = value;
    this.save();
  }

  static toggle(key: string): boolean {
    const newVal = !this.get(key);
    this.set(key, newVal);
    return newVal;
  }

  // Convenience
  static get kidsMode(): boolean { return this.get('kidsMode'); }
  static get hardMode(): boolean { return this.get('hardMode'); }
  static get bigHead(): boolean { return this.get('bigHead'); }
  static get speedRun(): boolean { return this.get('speedRun'); }

  /** Censor text for kids mode — replaces drug/adult references with funny alternatives */
  static censor(text: string): string {
    if (!this.kidsMode) return text;
    return text
      .replace(/\bweed\b/gi, 'candy')
      .replace(/\bbong\b/gi, 'juice box')
      .replace(/\bblunt\b/gi, 'lollipop')
      .replace(/\bjoint\b/gi, 'lollipop')
      .replace(/\bsmoke\b/gi, 'eat candy')
      .replace(/\bsmoking\b/gi, 'eating candy')
      .replace(/\bsmoked\b/gi, 'ate candy')
      .replace(/\bfaded\b/gi, 'sugar-rushed')
      .replace(/\bhigh\b/gi, 'hyper')
      .replace(/\bstoned\b/gi, 'sugar-rushed')
      .replace(/\bdrunk\b/gi, 'silly')
      .replace(/\bdrink\b/gi, 'juice')
      .replace(/\bdrinks\b/gi, 'juices')
      .replace(/\bbeer\b/gi, 'soda')
      .replace(/\bbeers\b/gi, 'sodas')
      .replace(/\bcocaine\b/gi, 'Pixy Stix')
      .replace(/\bbump\b/gi, 'Pixy Stix')
      .replace(/\bline\b/gi, 'Fun Dip')
      .replace(/\bkill\b/gi, 'bonk')
      .replace(/\bfight\b/gi, 'pillow fight')
      .replace(/\bpunch\b/gi, 'boop')
      .replace(/\bhit\b/gi, 'tap')
      .replace(/\bblood\b/gi, 'ketchup')
      .replace(/\bgun\b/gi, 'water gun')
      .replace(/\bshit\b/gi, 'stuff')
      .replace(/\bfuck\b/gi, 'fudge')
      .replace(/\bfuckin\b/gi, 'fudgin')
      .replace(/\bass\b/gi, 'butt')
      .replace(/\bbitch\b/gi, 'meanie')
      .replace(/\bdamn\b/gi, 'dang')
      .replace(/\bhell\b/gi, 'heck');
  }
}
