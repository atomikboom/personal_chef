import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Improved validation: must be a non-empty string starting with http
const isValidUrl = supabaseUrl.startsWith('http');
export const isMockMode = !isValidUrl || !supabaseAnonKey;

if (isMockMode && supabaseUrl) {
    console.warn('SUPABASE URL INVALID OR KEYS MISSING: Running in MOCK MODE.');
} else if (isMockMode) {
    console.warn('SUPABASE KEYS MISSING: Running in MOCK MODE (local data).');
}

export const supabase = isMockMode ? (null as any) : createClient(supabaseUrl, supabaseAnonKey);
