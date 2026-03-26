/**
 * Utility calculations for workout metrics.
 * All functions are pure and synchronous — no Supabase calls.
 */

/**
 * Estimated 1-rep max using the Epley formula.
 * Returns `weightKg` directly when reps is 0.
 */
export function estimatedOneRM(weightKg: number, reps: number): number {
  if (reps === 0) return weightKg;
  return weightKg * (1 + reps / 30);
}

/**
 * Total session volume = Σ (weight_kg × reps) across all sets.
 */
export function sessionVolume(sets: readonly { weightKg: number; reps: number }[]): number {
  return sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

/**
 * Session duration in minutes from ISO timestamp strings.
 */
export function sessionDurationMinutes(startedAt: string, endedAt: string): number {
  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  return diffMs / 60000;
}
