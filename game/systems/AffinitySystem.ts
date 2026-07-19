// Friend levels. Every NPC tracks how the player treats them; thresholds swap
// dialogue pools and can trigger events (in jail, low affinity means somebody
// wants to press you). Deterministic on purpose — no live AI, fully testable.
//
// Usage:
//   AffinitySystem.adjust('ch3_mikey', +1);            // talked, chose kind
//   AffinitySystem.level('ch3_mikey')                  // -2..+2
//   AffinitySystem.tier('ch3_mikey')                   // 'cold' | 'neutral' | 'close'
//   AffinitySystem.pick('ch3_mikey', { cold: [...], neutral: [...], close: [...] })

export type AffinityTier = 'cold' | 'neutral' | 'close';

const STORAGE_KEY = 'jdlo_affinity';
const MIN = -2;
const MAX = 2;

export class AffinitySystem {
  private static levels: Record<string, number> | null = null;

  private static load(): Record<string, number> {
    if (this.levels) return this.levels;
    try {
      this.levels = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      this.levels = {};
    }
    return this.levels!;
  }

  private static save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.load()));
    } catch { /* storage unavailable — run still plays */ }
  }

  static adjust(npcId: string, delta: number): number {
    const levels = this.load();
    const next = Math.max(MIN, Math.min(MAX, (levels[npcId] ?? 0) + delta));
    levels[npcId] = next;
    this.save();
    return next;
  }

  static level(npcId: string): number {
    return this.load()[npcId] ?? 0;
  }

  static tier(npcId: string): AffinityTier {
    const l = this.level(npcId);
    if (l <= -1) return 'cold';
    if (l >= 1) return 'close';
    return 'neutral';
  }

  // Pick a dialogue pool by tier; falls back to neutral so scenes never break
  // when a pool is missing.
  static pick<T>(npcId: string, pools: { cold?: T; neutral: T; close?: T }): T {
    const t = this.tier(npcId);
    if (t === 'cold' && pools.cold !== undefined) return pools.cold;
    if (t === 'close' && pools.close !== undefined) return pools.close;
    return pools.neutral;
  }

  // Event hook: should this NPC press the player? (jail yard, party, etc.)
  // Cold relationship + enough hostility events = confrontation.
  static wantsConfrontation(npcId: string): boolean {
    return this.level(npcId) <= -2;
  }

  static reset(): void {
    this.levels = {};
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  // For the Director panel: dump all tracked relationships.
  static snapshot(): Record<string, number> {
    return { ...this.load() };
  }
}
