import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Resolve Supabase config from EXPO_PUBLIC_* envs first, then fall back to app.json > expo.extra
const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {}) as Record<string, string>;
const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) || extra.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
    (process.env.EXPO_PUBLIC_SUPABASE_KEY as string | undefined) ||
    (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
    extra.EXPO_PUBLIC_SUPABASE_KEY ||
    extra.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    // Fail fast with a clear error instead of silently using localhost which breaks on device
    console.error(
        '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or key (EXPO_PUBLIC_SUPABASE_KEY / EXPO_PUBLIC_SUPABASE_ANON_KEY). Add them to app.json > expo.extra or .env and rebuild.'
    );
}

export const supabase = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
