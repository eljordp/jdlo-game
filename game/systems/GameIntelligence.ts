/**
 * GameIntelligence — learns from real play sessions to improve:
 *   1. PartyAI   — which NPCs players actually talk to → boost their talkBias
 *   2. MoodSystem — how long players spend in each mood → tune transitions
 *   3. Inventory  — which items get used most → surface more of those
 *   4. Items      — which interactables get missed → stronger hint glow
 *
 * One Supabase table: game_signals { signal, key, value }
 * Aggregates load at scene start, signals flush at scene end.
 * Never throws. Never blocks gameplay.
 */

import Phaser from 'phaser';
import { SCALED_TILE } from '../config';
import { supabase } from '../lib/supabase';

// ── Signal types ─────────────────────────────────────────────────
type Signal = 'npc_talked' | 'item_used' | 'item_missed' | 'item_revisit' | 'mood_duration';

// ── Aggregate pulled from Supabase ───────────────────────────────
export interface GameAggregate {
  // npc_id → total talk count across all sessions
  npcPopularity: Record<string, number>;
  // item_id → total uses across all sessions
  itemUsage: Record<string, number>;
  // item_id → miss rate (0-1, higher = players keep missing it)
  itemMissRate: Record<string, number>;
  // mood → avg seconds spent in that mood
  moodDuration: Record<string, number>;
}

// ── Per-session tracking ─────────────────────────────────────────
interface SessionBuffer {
  signals: { signal: Signal; key: string; value: number }[];
  npcTalked: Record<string, number>;
  itemUsed: Record<string, number>;
  itemNear: Record<string, number>;       // times player was within range
  itemHit: Set<string>;                   // items actually interacted
  moodStart: { mood: string; time: number } | null;
  moodSeconds: Record<string, number>;
}

// ── Watched interactable ─────────────────────────────────────────
interface Watched {
  id: string;
  tileX: number;
  tileY: number;
  hitCount: number;
  required: boolean; // gates progression — glow boost + nudges only apply to these
}

const NEAR_RADIUS = 3; // tiles
const FLUSH_BATCH = 50; // max signals per flush

export interface AdaptationLog {
  type: string;
  detail: string;
  timestamp: number;
}

export class GameIntelligence {
  private static scene: Phaser.Scene | null = null;
  private static player: Phaser.GameObjects.Sprite | null = null;
  private static watched: Watched[] = [];
  private static session: SessionBuffer | null = null;
  private static aggregate: GameAggregate = {
    npcPopularity: {}, itemUsage: {}, itemMissRate: {}, moodDuration: {},
  };
  private static tickTimer: Phaser.Time.TimerEvent | null = null;
  private static adaptations: AdaptationLog[] = [];

  // ── Init ─────────────────────────────────────────────────────

  static init(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): void {
    GameIntelligence.scene = scene;
    GameIntelligence.player = player;
    GameIntelligence.watched = [];
    GameIntelligence.session = {
      signals: [], npcTalked: {}, itemUsed: {},
      itemNear: {}, itemHit: new Set(),
      moodStart: null, moodSeconds: {},
    };

    // Pull aggregate in background — doesn't block
    GameIntelligence.pullAggregate();

    // Tick every 3s — proximity checks + mood timing
    GameIntelligence.tickTimer = scene.time.addEvent({
      delay: 3000, loop: true, callback: GameIntelligence.tick,
    });

    scene.events.on('shutdown', GameIntelligence.flush);
  }

  // ── Register interactables to watch for misses ────────────────

  static watch(id: string, tileX: number, tileY: number, required = false): void {
    GameIntelligence.watched.push({ id, tileX, tileY, hitCount: 0, required });
  }

  // ── Record NPC interaction ────────────────────────────────────

  static onNPCTalked(npcId: string): void {
    const s = GameIntelligence.session;
    if (!s) return;
    s.npcTalked[npcId] = (s.npcTalked[npcId] ?? 0) + 1;
  }

  // ── Record item used from inventory ──────────────────────────

  static onItemUsed(itemId: string): void {
    const s = GameIntelligence.session;
    if (!s) return;
    s.itemUsed[itemId] = (s.itemUsed[itemId] ?? 0) + 1;
  }

  // ── Record interactable hit ───────────────────────────────────

  static onInteracted(id: string): void {
    const s = GameIntelligence.session;
    if (!s) return;

    const item = GameIntelligence.watched.find(w => w.id === id);
    if (item) {
      if (item.hitCount > 0) {
        // Revisit — player came back to this
        s.signals.push({ signal: 'item_revisit', key: id, value: 1 });
      }
      item.hitCount++;
      s.itemHit.add(id);
    }
  }

  // ── Record mood change ────────────────────────────────────────

  static onMoodChanged(newMood: string): void {
    const s = GameIntelligence.session;
    if (!s) return;

    if (s.moodStart) {
      const seconds = Math.round((Date.now() - s.moodStart.time) / 1000);
      if (seconds > 0) {
        s.moodSeconds[s.moodStart.mood] = (s.moodSeconds[s.moodStart.mood] ?? 0) + seconds;
      }
    }
    s.moodStart = { mood: newMood, time: Date.now() };
  }

  // ── Per-tick proximity check ──────────────────────────────────

  private static tick(): void {
    const p = GameIntelligence.player;
    const s = GameIntelligence.session;
    if (!p || !s) return;

    const tileX = Math.round((p.x - SCALED_TILE / 2) / SCALED_TILE);
    const tileY = Math.round((p.y - SCALED_TILE / 2) / SCALED_TILE);

    for (const item of GameIntelligence.watched) {
      const dist = Math.abs(item.tileX - tileX) + Math.abs(item.tileY - tileY);
      if (dist <= NEAR_RADIUS) {
        s.itemNear[item.id] = (s.itemNear[item.id] ?? 0) + 1;
      }
    }
  }

  // ── Flush session to Supabase ─────────────────────────────────

  static flush(): void {
    const s = GameIntelligence.session;
    if (!s) return;

    // Close current mood timer
    if (s.moodStart) {
      const seconds = Math.round((Date.now() - s.moodStart.time) / 1000);
      if (seconds > 0) {
        s.moodSeconds[s.moodStart.mood] = (s.moodSeconds[s.moodStart.mood] ?? 0) + seconds;
      }
    }

    // Build signal batch
    const batch: { signal: Signal; key: string; value: number }[] = [...s.signals];

    for (const [npcId, count] of Object.entries(s.npcTalked)) {
      batch.push({ signal: 'npc_talked', key: npcId, value: count });
    }
    for (const [itemId, count] of Object.entries(s.itemUsed)) {
      batch.push({ signal: 'item_used', key: itemId, value: count });
    }
    for (const [mood, seconds] of Object.entries(s.moodSeconds)) {
      batch.push({ signal: 'mood_duration', key: mood, value: seconds });
    }

    // Items near but never hit = missed
    for (const item of GameIntelligence.watched) {
      const nearCount = s.itemNear[item.id] ?? 0;
      if (nearCount > 0 && !s.itemHit.has(item.id)) {
        batch.push({ signal: 'item_missed', key: item.id, value: nearCount });
      }
    }

    if (batch.length === 0) return;

    // Fire-and-forget — silent fail if offline
    const rows = batch.slice(0, FLUSH_BATCH).map(b => ({
      signal: b.signal, key: b.key, value: b.value,
    }));

    void supabase.from('game_signals').insert(rows);

    // Stop tick timer
    if (GameIntelligence.tickTimer) {
      GameIntelligence.tickTimer.remove();
      GameIntelligence.tickTimer = null;
    }
    GameIntelligence.session = null;
  }

  // ── Pull aggregate from Supabase ──────────────────────────────

  private static async pullAggregate(): Promise<void> {
    try {
      const { data } = await supabase
        .from('game_signals')
        .select('signal, key, value');

      if (!data) return;

      const agg: GameAggregate = {
        npcPopularity: {}, itemUsage: {},
        itemMissRate: {}, moodDuration: {},
      };

      const itemHits: Record<string, number> = {};
      const itemMisses: Record<string, number> = {};
      const moodTotal: Record<string, number> = {};
      const moodCount: Record<string, number> = {};

      for (const row of data) {
        switch (row.signal) {
          case 'npc_talked':
            agg.npcPopularity[row.key] = (agg.npcPopularity[row.key] ?? 0) + row.value;
            break;
          case 'item_used':
            agg.itemUsage[row.key] = (agg.itemUsage[row.key] ?? 0) + row.value;
            break;
          case 'item_missed':
            itemMisses[row.key] = (itemMisses[row.key] ?? 0) + row.value;
            break;
          case 'item_revisit':
            itemHits[row.key] = (itemHits[row.key] ?? 0) + row.value;
            break;
          case 'mood_duration':
            moodTotal[row.key] = (moodTotal[row.key] ?? 0) + row.value;
            moodCount[row.key] = (moodCount[row.key] ?? 0) + 1;
            break;
        }
      }

      // Miss rate = misses / (misses + revisits), floored at 3 data points
      for (const key of new Set([...Object.keys(itemMisses), ...Object.keys(itemHits)])) {
        const misses = itemMisses[key] ?? 0;
        const hits = itemHits[key] ?? 0;
        const total = misses + hits;
        if (total >= 3) agg.itemMissRate[key] = misses / total;
      }

      // Avg mood duration in seconds
      for (const mood of Object.keys(moodTotal)) {
        if (moodCount[mood] >= 2) {
          agg.moodDuration[mood] = moodTotal[mood] / moodCount[mood];
        }
      }

      GameIntelligence.aggregate = agg;
    } catch { /* silent */ }
  }

  // ── Read aggregate (used by PartyAI, MoodSystem, etc.) ───────

  static getAggregate(): GameAggregate {
    return GameIntelligence.aggregate;
  }

  /** Returns REQUIRED interactable ids where miss rate > 40% — glow boost + nudges only */
  static getMissedItems(): string[] {
    const requiredIds = new Set(
      GameIntelligence.watched.filter(w => w.required).map(w => w.id)
    );
    return Object.entries(GameIntelligence.aggregate.itemMissRate)
      .filter(([id, rate]) => rate > 0.4 && requiredIds.has(id))
      .map(([id]) => id);
  }

  /** Returns ALL missed items regardless of required flag — for dashboard only */
  static getAllMissedItems(): string[] {
    return Object.entries(GameIntelligence.aggregate.itemMissRate)
      .filter(([, rate]) => rate > 0.4)
      .map(([id]) => id);
  }

  /** Returns top N most popular NPCs by talk count */
  static getTopNPCs(n = 3): string[] {
    return Object.entries(GameIntelligence.aggregate.npcPopularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([id]) => id);
  }

  /** Returns most used inventory items */
  static getTopItems(n = 3): string[] {
    return Object.entries(GameIntelligence.aggregate.itemUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([id]) => id);
  }

  /** Log an adaptation decision so it can be inspected later */
  static logAdaptation(type: string, detail: string): void {
    GameIntelligence.adaptations.push({ type, detail, timestamp: Date.now() });
  }

  /** Read all logged adaptations */
  static getAdaptations(): AdaptationLog[] {
    return GameIntelligence.adaptations;
  }

  // ── Dev panel (hold D 2s) ─────────────────────────────────────

  static attachDebugPanel(scene: Phaser.Scene): void {
    let holdMs = 0;
    let panel: Phaser.GameObjects.Container | null = null;

    scene.input.keyboard?.on('keydown-D', () => {
      holdMs += 16;
      if (holdMs > 2000 && !panel) panel = GameIntelligence.renderPanel(scene);
    });
    scene.input.keyboard?.on('keyup-D', () => {
      holdMs = 0;
      if (panel) { panel.destroy(); panel = null; }
    });
  }

  private static renderPanel(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const agg = GameIntelligence.aggregate;
    const c = scene.add.container(16, 16).setScrollFactor(0).setDepth(999);
    c.add(scene.add.rectangle(0, 0, 400, 220, 0x000000, 0.88).setOrigin(0));

    const h = { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#f0c040' };
    const b = { fontFamily: '"Press Start 2P", monospace', fontSize: '6px', color: '#ffffff' };

    c.add(scene.add.text(10, 10, 'GAME INTELLIGENCE', h));

    c.add(scene.add.text(10, 30, 'TOP NPCs:', { ...b, color: '#88ffaa' }));
    GameIntelligence.getTopNPCs(4).forEach((id, i) =>
      c.add(scene.add.text(10, 44 + i * 12, `${id}  ×${agg.npcPopularity[id]}`, b))
    );

    c.add(scene.add.text(200, 30, 'TOP ITEMS:', { ...b, color: '#88aaff' }));
    GameIntelligence.getTopItems(4).forEach((id, i) =>
      c.add(scene.add.text(200, 44 + i * 12, `${id}  ×${agg.itemUsage[id]}`, b))
    );

    c.add(scene.add.text(10, 100, 'MISSED:', { ...b, color: '#ff8888' }));
    GameIntelligence.getMissedItems().slice(0, 4).forEach((id, i) => {
      const rate = Math.round(agg.itemMissRate[id] * 100);
      c.add(scene.add.text(10, 114 + i * 12, `${id}  ${rate}% miss`, b));
    });

    c.add(scene.add.text(200, 100, 'MOOD AVG (s):', { ...b, color: '#ffcc44' }));
    Object.entries(agg.moodDuration).slice(0, 4).forEach(([mood, secs], i) =>
      c.add(scene.add.text(200, 114 + i * 12, `${mood}  ${Math.round(secs)}s`, b))
    );

    c.add(scene.add.text(10, 205, 'hold D — release to close', { ...b, color: '#444444' }));
    return c;
  }
}
