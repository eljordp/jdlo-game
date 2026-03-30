'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pwsxoifwoskykotlddtv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hvaWZ3b3NreWtvdGxkZHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDM3MDYsImV4cCI6MjA5MDM3OTcwNn0.5Vvr-D6e5-dNlrWAWw7Nq2GQbzvh8nyuPks_ED-z2qw'
);

interface Signal {
  signal: string;
  key: string;
  value: number;
  created_at: string;
}

interface Aggregate {
  key: string;
  total: number;
  count: number;
}

function aggregate(signals: Signal[], signalType: string): Aggregate[] {
  const map: Record<string, { total: number; count: number }> = {};
  for (const s of signals) {
    if (s.signal !== signalType) continue;
    if (!map[s.key]) map[s.key] = { total: 0, count: 0 };
    map[s.key].total += s.value;
    map[s.key].count += 1;
  }
  return Object.entries(map)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.total - a.total);
}

function missRate(signals: Signal[]): { key: string; misses: number; hits: number; rate: number }[] {
  const misses: Record<string, number> = {};
  const hits: Record<string, number> = {};
  for (const s of signals) {
    if (s.signal === 'item_missed') misses[s.key] = (misses[s.key] ?? 0) + s.value;
    if (s.signal === 'npc_talked' || s.signal === 'item_used') hits[s.key] = (hits[s.key] ?? 0) + s.value;
  }
  const allKeys = new Set([...Object.keys(misses), ...Object.keys(hits)]);
  return [...allKeys]
    .map(key => {
      const m = misses[key] ?? 0;
      const h = hits[key] ?? 0;
      return { key, misses: m, hits: h, rate: m / Math.max(1, m + h) };
    })
    .filter(x => x.misses > 0)
    .sort((a, b) => b.rate - a.rate);
}

export default function IntelPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('game_signals')
      .select('signal, key, value, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);
    setSignals(data ?? []);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const npcData = aggregate(signals, 'npc_talked');
  const itemData = aggregate(signals, 'item_used');
  const moodData = aggregate(signals, 'mood_duration');
  const missData = missRate(signals);
  const totalSessions = new Set(signals.map(s => s.created_at.slice(0, 13))).size; // rough session count by hour

  return (
    <div style={{
      background: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh',
      fontFamily: '"Press Start 2P", monospace', padding: 24,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 16, color: '#f0c040', marginBottom: 8 }}>
          JDLO GAME INTELLIGENCE
        </h1>
        <p style={{ fontSize: 9, color: '#666', marginBottom: 24 }}>
          {loading ? 'Loading...' : `${signals.length} signals | ~${totalSessions} sessions | last refresh: ${lastRefresh?.toLocaleTimeString()}`}
          {' '}
          <button
            onClick={load}
            style={{
              background: '#222', color: '#f0c040', border: '1px solid #333',
              fontFamily: 'inherit', fontSize: 8, padding: '4px 8px', cursor: 'pointer',
            }}
          >
            REFRESH
          </button>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* NPC Popularity */}
          <Card title="NPC POPULARITY" color="#88ffaa" subtitle="Who players actually talk to">
            {npcData.length === 0 && <Empty />}
            {npcData.slice(0, 10).map(d => (
              <Row key={d.key} label={d.key} value={`${d.total}x`} sub={`${d.count} sessions`} />
            ))}
            <Insight data={npcData} type="npc" />
          </Card>

          {/* Item Usage */}
          <Card title="ITEM USAGE" color="#88aaff" subtitle="What gets picked up and used">
            {itemData.length === 0 && <Empty />}
            {itemData.slice(0, 10).map(d => (
              <Row key={d.key} label={d.key} value={`${d.total}x`} sub={`${d.count} sessions`} />
            ))}
            <Insight data={itemData} type="item" />
          </Card>

          {/* Mood Duration */}
          <Card title="MOOD DURATION" color="#ffcc44" subtitle="Avg seconds in each mood">
            {moodData.length === 0 && <Empty />}
            {moodData.map(d => (
              <Row
                key={d.key}
                label={d.key}
                value={`${Math.round(d.total / Math.max(1, d.count))}s avg`}
                sub={`${d.total}s total across ${d.count} triggers`}
              />
            ))}
            <MoodInsight data={moodData} />
          </Card>

          {/* Miss Rate */}
          <Card title="MISSED INTERACTIONS" color="#ff8888" subtitle="Players walked near but never clicked">
            {missData.length === 0 && <Empty />}
            {missData.slice(0, 10).map(d => (
              <Row
                key={d.key}
                label={d.key}
                value={`${Math.round(d.rate * 100)}% miss`}
                sub={`${d.misses} missed / ${d.hits} hit`}
                alert={d.rate > 0.5}
              />
            ))}
            <MissInsight data={missData} />
          </Card>
        </div>

        {/* Auto-Adjustments — what the AI is doing */}
        <div style={{
          marginTop: 32, background: '#111', border: '1px solid #22cc88',
          padding: 16,
        }}>
          <h2 style={{ fontSize: 11, color: '#22cc88', marginBottom: 12 }}>
            AI AUTO-ADJUSTMENTS (live)
          </h2>
          <p style={{ fontSize: 7, color: '#555', marginBottom: 12 }}>
            Based on current data, the game is making these changes automatically for the next player:
          </p>
          <AutoAdjustments npc={npcData} items={itemData} moods={moodData} misses={missData} />
        </div>

        {/* Action Items */}
        <div style={{
          marginTop: 20, background: '#111', border: '1px solid #f0c040',
          padding: 16,
        }}>
          <h2 style={{ fontSize: 11, color: '#f0c040', marginBottom: 12 }}>
            WHAT YOU CAN DO MANUALLY
          </h2>
          <ActionItems npc={npcData} items={itemData} moods={moodData} misses={missData} />
        </div>

        {/* Raw signals */}
        <details style={{ marginTop: 24 }}>
          <summary style={{ fontSize: 9, color: '#666', cursor: 'pointer' }}>
            RAW SIGNALS (last 50)
          </summary>
          <div style={{ marginTop: 8 }}>
            {signals.slice(0, 50).map((s, i) => (
              <div key={i} style={{ fontSize: 7, color: '#555', marginBottom: 2 }}>
                {s.created_at.slice(0, 19)} | {s.signal} | {s.key} | {s.value}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

// ── Components ──────────────────────────────────────────────────

function Card({ title, color, subtitle, children }: {
  title: string; color: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#111', border: `1px solid ${color}22`, padding: 16 }}>
      <h2 style={{ fontSize: 10, color, marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 7, color: '#555', marginBottom: 12 }}>{subtitle}</p>
      {children}
    </div>
  );
}

function Row({ label, value, sub, alert }: {
  label: string; value: string; sub: string; alert?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      marginBottom: 6, padding: '4px 0',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <span style={{ fontSize: 8, color: alert ? '#ff6666' : '#ccc' }}>{label}</span>
      <span style={{ fontSize: 8, color: alert ? '#ff6666' : '#f0c040', textAlign: 'right' }}>
        {value}
        <br />
        <span style={{ fontSize: 6, color: '#555' }}>{sub}</span>
      </span>
    </div>
  );
}

function Empty() {
  return <p style={{ fontSize: 8, color: '#444' }}>No data yet. Play the game first.</p>;
}

// ── Auto-Adjustment display ──────────────────────────────────────

function AutoAdjustments({ npc, items, moods, misses }: {
  npc: Aggregate[]; items: Aggregate[];
  moods: Aggregate[]; misses: { key: string; rate: number; misses: number }[];
}) {
  const adjustments: { icon: string; system: string; what: string; why: string }[] = [];

  // PartyAI: popular NPCs get boosted talkBias
  if (npc.length >= 3) {
    const top3 = npc.slice(0, 3);
    for (const n of top3) {
      adjustments.push({
        icon: '🗣',
        system: 'PartyAI',
        what: `${n.key} talkBias +0.2`,
        why: `Popular NPC (${n.total} talks). Will speak more at parties.`,
      });
    }
    const bottom = npc.filter(n => n.total <= 1);
    for (const n of bottom) {
      adjustments.push({
        icon: '🚶',
        system: 'PartyAI',
        what: `${n.key} walks toward player`,
        why: `Unpopular NPC (${n.total} talks). Will seek the player out.`,
      });
    }
  }

  // Glow boost for missed items
  const highMiss = misses.filter(m => m.rate > 0.4);
  for (const m of highMiss) {
    const boost = m.rate > 0.6 ? '2x glow + bounce' : '1.5x glow';
    adjustments.push({
      icon: '✨',
      system: 'Glow',
      what: `${m.key} → ${boost}`,
      why: `${Math.round(m.rate * 100)}% of players miss this. Glow is auto-boosted.`,
    });
  }

  // Mood duration auto-tuning
  const soberEntry = moods.find(d => d.key === 'sober');
  const nonSober = moods.filter(d => d.key !== 'sober');
  if (soberEntry && nonSober.length > 0) {
    const soberAvg = soberEntry.total / Math.max(1, soberEntry.count);
    for (const m of nonSober) {
      const avg = m.total / Math.max(1, m.count);
      if (avg < 8) {
        adjustments.push({
          icon: '⏱',
          system: 'MoodSystem',
          what: `${m.key} duration 2x boost`,
          why: `Avg only ${Math.round(avg)}s — too short. Auto-extended.`,
        });
      } else if (avg < 15) {
        adjustments.push({
          icon: '⏱',
          system: 'MoodSystem',
          what: `${m.key} duration 1.5x boost`,
          why: `Avg ${Math.round(avg)}s — still short. Auto-extended.`,
        });
      }
    }
    if (soberAvg > 4 * Math.max(...nonSober.map(m => m.total / Math.max(1, m.count)), 1)) {
      adjustments.push({
        icon: '🌿',
        system: 'MoodSystem',
        what: 'All non-sober moods 1.3x boost',
        why: `Players sober ${Math.round(soberAvg)}s avg — way too much. All moods extended.`,
      });
    }
  }

  if (adjustments.length === 0) {
    return <p style={{ fontSize: 8, color: '#444' }}>Not enough data yet. The AI needs a few play sessions to start adjusting.</p>;
  }

  return (
    <div>
      {adjustments.map((a, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, marginBottom: 8, padding: '6px 8px',
          background: '#0a0a0a', borderLeft: '2px solid #22cc88',
        }}>
          <span style={{ fontSize: 12, width: 20 }}>{a.icon}</span>
          <div>
            <div style={{ fontSize: 8, color: '#22cc88' }}>
              [{a.system}] {a.what}
            </div>
            <div style={{ fontSize: 7, color: '#888', marginTop: 2 }}>{a.why}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Insight generators ─────────────────────────────────────────

function Insight({ data, type }: { data: Aggregate[]; type: 'npc' | 'item' }) {
  if (data.length < 2) return null;
  const top = data[0];
  const bottom = data[data.length - 1];
  const label = type === 'npc' ? 'NPC' : 'Item';
  return (
    <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', fontSize: 7, color: '#888' }}>
      <span style={{ color: '#88ffaa' }}>{top.key}</span> is the most popular {label.toLowerCase()} ({top.total}x).
      {bottom.total < top.total * 0.3 && (
        <> <span style={{ color: '#ff8888' }}>{bottom.key}</span> barely gets touched — consider making it more visible or moving it.</>
      )}
    </div>
  );
}

function MoodInsight({ data }: { data: Aggregate[] }) {
  if (data.length === 0) return null;
  const soberEntry = data.find(d => d.key === 'sober');
  const fadedEntry = data.find(d => d.key === 'faded');
  return (
    <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', fontSize: 7, color: '#888' }}>
      {soberEntry && fadedEntry && soberEntry.total > fadedEntry.total * 3 && (
        <>Players spend way more time sober than faded. Substance system might not be landing — make weed/drinks more accessible or increase mood durations.</>
      )}
      {fadedEntry && !soberEntry && (
        <>Players are staying faded most of the time. Mood balance is working.</>
      )}
    </div>
  );
}

function MissInsight({ data }: { data: { key: string; rate: number }[] }) {
  const bad = data.filter(d => d.rate > 0.5);
  if (bad.length === 0) return null;
  return (
    <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', fontSize: 7, color: '#ff8888' }}>
      {bad.length} interaction{bad.length > 1 ? 's' : ''} getting missed by over half of players.
      Consider: stronger glow, NPC hint dialogue, or repositioning.
    </div>
  );
}

function ActionItems({ npc, items, moods, misses }: {
  npc: Aggregate[]; items: Aggregate[];
  moods: Aggregate[]; misses: { key: string; rate: number; misses: number }[];
}) {
  const actions: string[] = [];

  // NPC actions
  if (npc.length >= 2) {
    const dead = npc.filter(n => n.total <= 1);
    if (dead.length > 0) actions.push(`${dead.map(d => d.key).join(', ')} — nobody talks to these NPCs. Give them better lines or move them into the player's path.`);
  }

  // Item actions
  if (items.length >= 2) {
    const top = items[0];
    actions.push(`${top.key} is the most used item (${top.total}x). Add more of it or make it renewable.`);
  }

  // Mood actions
  const soberEntry = moods.find(d => d.key === 'sober');
  const fadedEntry = moods.find(d => d.key === 'faded');
  if (soberEntry && fadedEntry) {
    const soberAvg = soberEntry.total / Math.max(1, soberEntry.count);
    const fadedAvg = fadedEntry.total / Math.max(1, fadedEntry.count);
    if (soberAvg > fadedAvg * 4) {
      actions.push(`Players spend ${Math.round(soberAvg)}s sober vs ${Math.round(fadedAvg)}s faded. Weed should be easier to find or last longer.`);
    }
  }

  // Miss actions
  const criticalMisses = misses.filter(m => m.rate > 0.5 && m.misses >= 3);
  for (const m of criticalMisses) {
    actions.push(`${m.key} has a ${Math.round(m.rate * 100)}% miss rate. Needs stronger hint — bigger glow, NPC nudge, or move it closer to player's path.`);
  }

  if (actions.length === 0) {
    actions.push('Not enough data yet. Play through a few sessions and check back.');
  }

  return (
    <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
      {actions.map((a, i) => (
        <li key={i} style={{ fontSize: 8, color: '#ccc', marginBottom: 8, lineHeight: 1.6 }}>{a}</li>
      ))}
    </ul>
  );
}
