import { supabase } from '../supabase';

export interface AggregateStats {
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
}

export interface DurationPoint {
  date: string;
  durationMinutes: number;
}

export interface VolumePoint {
  date: string;
  volumeKg: number;
}

export interface ProgressionPoint {
  date: string;
  maxWeightKg: number;
  estimated1rm: number;
}

export async function getAggregateStats(): Promise<AggregateStats> {
  const { data, error } = await supabase
    
    .from('workouts')
    .select(`
      id,
      workout_sets ( id, reps, weight_kg )
    `)
    .not('ended_at', 'is', null);

  if (error) throw new Error(error.message);

  let totalSessions = 0;
  let totalSets = 0;
  let totalReps = 0;
  let totalVolumeKg = 0;

  for (const w of data ?? []) {
    totalSessions++;
    const sets = Array.isArray((w as { workout_sets?: Array<{ id: string; reps: number; weight_kg: number }> }).workout_sets)
      ? (w as { workout_sets: Array<{ id: string; reps: number; weight_kg: number }> }).workout_sets
      : [];
    for (const s of sets) {
      totalSets++;
      totalReps += s.reps;
      totalVolumeKg += s.weight_kg * s.reps;
    }
  }

  return { totalSessions, totalSets, totalReps, totalVolumeKg: Math.round(totalVolumeKg) };
}

export async function getSessionDurations(): Promise<DurationPoint[]> {
  const { data, error } = await supabase
    
    .from('workouts')
    .select('started_at, ended_at')
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((w) => ({
    date: w.started_at.split('T')[0],
    durationMinutes: (new Date(w.ended_at!).getTime() - new Date(w.started_at).getTime()) / 60000,
  }));
}

export async function getSessionVolumes(): Promise<VolumePoint[]> {
  const { data, error } = await supabase
    
    .from('workouts')
    .select(`started_at, workout_sets ( weight_kg, reps )`)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((w) => {
    const sets = Array.isArray((w as { workout_sets?: Array<{ weight_kg: number; reps: number }> }).workout_sets)
      ? (w as { workout_sets: Array<{ weight_kg: number; reps: number }> }).workout_sets
      : [];
    const volume = sets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);
    return { date: w.started_at.split('T')[0], volumeKg: Math.round(volume) };
  });
}

export async function getExerciseProgression(exerciseId: string): Promise<ProgressionPoint[]> {
  const { data, error } = await supabase
    
    .from('workouts')
    .select(`started_at, workout_sets ( weight_kg, reps, exercise_id )`)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: true });

  if (error) throw new Error(error.message);

  const points: ProgressionPoint[] = [];

  for (const w of data ?? []) {
    const sets = ((w as { workout_sets?: Array<{ weight_kg: number; reps: number; exercise_id: string }> }).workout_sets ?? [])
      .filter((s) => s.exercise_id === exerciseId);
    if (sets.length === 0) continue;

    let maxWeight = 0;
    let max1rm = 0;
    for (const s of sets) {
      if (s.weight_kg > maxWeight) maxWeight = s.weight_kg;
      const orm = s.weight_kg * (1 + s.reps / 30);
      if (orm > max1rm) max1rm = orm;
    }
    points.push({ date: w.started_at.split('T')[0], maxWeightKg: maxWeight, estimated1rm: Math.round(max1rm * 10) / 10 });
  }

  return points;
}

export async function getLatestExerciseSets(exerciseId: string): Promise<Array<{ weight_kg: number; reps: number; set_number: number }>> {
  const { data: lastWorkout } = await supabase
    
    .from('workouts')
    .select('id')
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastWorkout) return [];

  const { data, error } = await supabase
    
    .from('workout_sets')
    .select('weight_kg, reps, set_number')
    .eq('workout_id', lastWorkout.id)
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
