import { supabase } from '../supabase';

export interface UserPreferences {
  userId: string;
  restTimerSeconds: number;
  restTimerEnabled: boolean;
}

const DEFAULTS: Omit<UserPreferences, 'userId'> = {
  restTimerSeconds: 90,
  restTimerEnabled: true,
};

export async function getUserPreferences(): Promise<UserPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: '', ...DEFAULTS };

  const { data, error } = await supabase
    .from('user_preferences')
    .select('rest_timer_seconds, rest_timer_enabled')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { userId: user.id, ...DEFAULTS };

  const row = data as unknown as { rest_timer_seconds: number; rest_timer_enabled: boolean };
  return {
    userId: user.id,
    restTimerSeconds: row.rest_timer_seconds,
    restTimerEnabled: row.rest_timer_enabled,
  };
}

export async function upsertUserPreferences(
  prefs: Partial<Omit<UserPreferences, 'userId'>>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const update: {
    user_id: string;
    updated_at: string;
    rest_timer_seconds?: number;
    rest_timer_enabled?: boolean;
  } = { user_id: user.id, updated_at: new Date().toISOString() };
  if (prefs.restTimerSeconds !== undefined) update.rest_timer_seconds = prefs.restTimerSeconds;
  if (prefs.restTimerEnabled !== undefined) update.rest_timer_enabled = prefs.restTimerEnabled;

  const { error } = await supabase
    .from('user_preferences')
    .upsert(update, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
}
