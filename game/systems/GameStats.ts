// ─── GAME STATS ─────────────────────────────────────────────────────
// Tracks lifetime stats across ALL chapters. Persisted to localStorage.
// Used by EndScene for the GTA-style stats screen.
// ────────────────────────────────────────────────────────────────────

const SAVE_KEY = 'jdlo-game-stats';

export interface GameStatsData {
  totalMoney: number;
  casinoWins: number;
  casinoLosses: number;
  casinoProfit: number;
  cryptoPeakPortfolio: number;
  girlsFumbled: number;
  girlsSucceeded: number;
  drinksHad: number;
  timesSmoked: number;
  diceWins: number;
  diceLosses: number;
  npcsTalkedTo: number;
  itemsCollected: number;
  chaptersCompleted: number;
  totalPlayTimeMs: number;
  minigamesPlayed: number;
  minigamesWon: number;
}

const DEFAULT_STATS: GameStatsData = {
  totalMoney: 0,
  casinoWins: 0,
  casinoLosses: 0,
  casinoProfit: 0,
  cryptoPeakPortfolio: 0,
  girlsFumbled: 0,
  girlsSucceeded: 0,
  drinksHad: 0,
  timesSmoked: 0,
  diceWins: 0,
  diceLosses: 0,
  npcsTalkedTo: 0,
  itemsCollected: 0,
  chaptersCompleted: 0,
  totalPlayTimeMs: 0,
  minigamesPlayed: 0,
  minigamesWon: 0,
};

export class GameStats {
  private static data: GameStatsData = { ...DEFAULT_STATS };
  private static initialized = false;
  private static sessionStart = 0;

  // ─── Init / Load ────────────────────────────────────────────────

  private static ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    this.load();
    if (this.sessionStart === 0) {
      this.sessionStart = Date.now();
    }
  }

  // ─── Public API ─────────────────────────────────────────────────

  /** Increment a numeric stat by amount (default 1) */
  static increment(stat: keyof GameStatsData, amount = 1): void {
    this.ensureInit();
    this.data[stat] += amount;
    this.save();
  }

  /** Set a stat to a specific value */
  static set(stat: keyof GameStatsData, value: number): void {
    this.ensureInit();
    this.data[stat] = value;
    this.save();
  }

  /** Set a stat only if the new value is higher (for peak tracking) */
  static setMax(stat: keyof GameStatsData, value: number): void {
    this.ensureInit();
    if (value > this.data[stat]) {
      this.data[stat] = value;
      this.save();
    }
  }

  /** Get a single stat */
  static get(stat: keyof GameStatsData): number {
    this.ensureInit();
    return this.data[stat];
  }

  /** Get all stats (snapshot) */
  static getAll(): GameStatsData {
    this.ensureInit();
    // Update playtime before returning
    this.data.totalPlayTimeMs += Date.now() - this.sessionStart;
    this.sessionStart = Date.now();
    this.save();
    return { ...this.data };
  }

  /** Reset all stats for a new game */
  static reset(): void {
    this.data = { ...DEFAULT_STATS };
    this.sessionStart = Date.now();
    this.save();
  }

  // ─── Persistence ────────────────────────────────────────────────

  private static save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch { /* noop */ }
  }

  private static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with defaults to handle new fields gracefully
        this.data = { ...DEFAULT_STATS, ...parsed };
      }
    } catch { /* noop */ }
  }
}
