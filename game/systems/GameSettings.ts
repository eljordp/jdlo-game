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
}
