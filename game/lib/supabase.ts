import { createClient } from '@supabase/supabase-js';

const URL  = 'https://pwsxoifwoskykotlddtv.supabase.co';
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hvaWZ3b3NreWtvdGxkZHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDM3MDYsImV4cCI6MjA5MDM3OTcwNn0.5Vvr-D6e5-dNlrWAWw7Nq2GQbzvh8nyuPks_ED-z2qw';

export const supabase = createClient(URL, KEY);
