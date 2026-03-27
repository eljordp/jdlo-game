// ─── BALANCE SYSTEM ──────────────────────────────────────────────────
// Tracks JP's money across chapters. Earn from clients, spend on stuff.
// Static singleton, same pattern as SoundEffects/Analytics.
// ─────────────────────────────────────────────────────────────────────

const SAVE_KEY = 'jdlo-balance';

export class BalanceSystem {
  private static balance = 0;
  private static initialized = false;

  static init() {
    if (this.initialized) return;
    this.initialized = true;
    this.load();
  }

  /** Get current balance */
  static getBalance(): number {
    this.init();
    return this.balance;
  }

  /** Earn money (from clients, deals, etc.) */
  static earn(amount: number, _reason?: string): number {
    this.init();
    this.balance += amount;
    this.save();
    return this.balance;
  }

  /** Spend money. Returns true if successful, false if insufficient funds. */
  static spend(amount: number, _reason?: string): boolean {
    this.init();
    if (this.balance < amount) return false;
    this.balance -= amount;
    this.save();
    return true;
  }

  /** Check if player can afford something */
  static canAfford(amount: number): boolean {
    this.init();
    return this.balance >= amount;
  }

  /** Format balance for display */
  static formatted(): string {
    this.init();
    return '$' + this.balance.toLocaleString();
  }

  /** Reset (new game) */
  static reset() {
    this.balance = 0;
    this.save();
  }

  private static save() {
    try { localStorage.setItem(SAVE_KEY, String(this.balance)); } catch {}
  }

  private static load() {
    try {
      const val = localStorage.getItem(SAVE_KEY);
      if (val) this.balance = parseInt(val, 10) || 0;
    } catch {}
  }
}
