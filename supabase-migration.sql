-- JDLO Game Signals — one table, feeds PartyAI + MoodSystem + Inventory
-- Paste in Supabase SQL Editor → Run

create table if not exists game_signals (
  id         bigserial primary key,
  signal     text not null,
  -- 'npc_talked'     → key = npc id,   value = 1
  -- 'item_used'      → key = item id,  value = 1
  -- 'item_missed'    → key = item id,  value = 1  (near but never clicked)
  -- 'item_revisit'   → key = item id,  value = times revisited
  -- 'mood_duration'  → key = mood name, value = seconds spent in that mood
  key        text not null,
  value      int  not null default 1,
  created_at timestamptz default now()
);

-- Index for fast aggregate queries
create index if not exists game_signals_signal_key on game_signals (signal, key);

-- Allow anon read + insert
alter table game_signals enable row level security;
create policy "anon insert" on game_signals for insert with check (true);
create policy "anon read"   on game_signals for select using (true);
