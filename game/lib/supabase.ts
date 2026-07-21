import { createClient } from '@supabase/supabase-js';

// JP-owned analytics project (game_signals). Anon key only — public by design.
const URL  = 'https://bbluobewiwpyhuiifrku.supabase.co';
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHVvYmV3aXdweWh1aWlmcmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MDk4MjcsImV4cCI6MjEwMDA4NTgyN30.Cp27U48Jhnbd2HIC_k9uCCVgRAum5Zgldtz5cM9-nLI';

export const supabase = createClient(URL, KEY);
