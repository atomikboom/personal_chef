import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
    console.warn('SUPABASE KEYS MISSING: Running in MOCK MODE (local data).');
}

export const supabase = isMockMode ? (null as any) : createClient(supabaseUrl, supabaseAnonKey);
