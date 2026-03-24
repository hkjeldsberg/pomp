import { supabase } from '../supabase';
import type { Workout } from '../../supabase/types';

export interface WorkoutSummary {
  id: string;
  started_at: string;
  ended_at: string | null;
  routine_name: string | null;
  set_count: number;
  duration_minutes: number;
}

export interface WorkoutDetail {
  id: string;
  started_at: string;
  ended_at: string | null;
  note: string | null;
  exercises: Array<{
    exercise: { id: string; name: string; category: string };
    sets: Array<{
      id: string;
      set_number: number;
      weight_kg: number;
      reps: number;
      note: string | null;
      completed: boolean;
    }>;
  }>;
}

export interface SetSummary {
  weight_kg: number;
  reps: number;
  set_count: number;
}

export async function getOpenWorkout(): Promise<Workout | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .is('ended_at', null)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Workout | null;
}

export async function createWorkout(data: { routineId?: string }): Promise<Workout> {
  const open = await getOpenWorkout();
  if (open) throw new Error('An active workout session already exists');

  const { data: workout, error } = await supabase
    .from('workouts')
    .insert({ routine_id: data.routineId ?? null, user_id: (await supabase.auth.getUser()).data.user!.id })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return workout as unknown as Workout;
}

export async function endWorkout(id: string): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as Workout;
}

export async function cancelWorkout(id: string): Promise<void> {
  const { error: setsError } = await supabase
    .from('workout_sets')
    .delete()
    .eq('workout_id', id);
  if (setsError) throw new Error(setsError.message);

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

interface WorkoutHistoryRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  routines: { name: string } | null;
  workout_sets: Array<{ id: string }>;
}

export async function getWorkoutHistory(): Promise<WorkoutSummary[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      id,
      started_at,
      ended_at,
      routines ( name ),
      workout_sets ( id )
    `)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as WorkoutHistoryRow[]).map((w) => {
    const endedAt = w.ended_at as string;
    const durationMs = new Date(endedAt).getTime() - new Date(w.started_at).getTime();
    return {
      id: w.id,
      started_at: w.started_at,
      ended_at: endedAt,
      routine_name: w.routines?.name ?? null,
      set_count: w.workout_sets.length,
      duration_minutes: durationMs / 60000,
    };
  });
}

interface WorkoutSetDetailRow {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  note: string | null;
  completed: boolean;
  exercises: { id: string; name: string; category: string } | null;
}

interface WorkoutDetailRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  note: string | null;
  workout_sets: WorkoutSetDetailRow[];
}

export async function getWorkoutDetail(id: string): Promise<WorkoutDetail> {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      id,
      started_at,
      ended_at,
      note,
      workout_sets (
        id,
        exercise_id,
        set_number,
        weight_kg,
        reps,
        note,
        completed,
        exercises ( id, name, category )
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const row = data as unknown as WorkoutDetailRow;
  const exerciseMap = new Map<string, WorkoutDetail['exercises'][0]>();

  for (const s of row.workout_sets ?? []) {
    const ex = s.exercises;
    if (!ex) continue;
    if (!exerciseMap.has(ex.id)) {
      exerciseMap.set(ex.id, { exercise: ex, sets: [] });
    }
    exerciseMap.get(ex.id)!.sets.push({
      id: s.id,
      set_number: s.set_number,
      weight_kg: s.weight_kg,
      reps: s.reps,
      note: s.note,
      completed: s.completed,
    });
  }

  return {
    id: row.id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    note: row.note,
    exercises: [...exerciseMap.values()],
  };
}

export async function getPreviousSessionSets(
  routineId: string,
  exerciseId: string
): Promise<SetSummary | null> {
  const { data: lastWorkout, error: wError } = await supabase
    .from('workouts')
    .select('id')
    .eq('routine_id', routineId)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (wError) throw new Error(wError.message);
  if (!lastWorkout) return null;

  const { data: sets, error: sError } = await supabase
    .from('workout_sets')
    .select('weight_kg, reps')
    .eq('workout_id', (lastWorkout as unknown as { id: string }).id)
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: true });

  if (sError) throw new Error(sError.message);
  if (!sets || sets.length === 0) return null;

  const lastSet = sets[sets.length - 1] as unknown as { weight_kg: number; reps: number };
  return {
    weight_kg: lastSet.weight_kg,
    reps: lastSet.reps,
    set_count: sets.length,
  };
}
