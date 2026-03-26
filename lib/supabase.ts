import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database, 'pomp'>(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'pomp' },
});
