import { supabase } from '../supabase';
import type { Routine, Exercise } from '../../supabase/types';

export interface RoutineWithExercises extends Routine {
  exercises: Array<{ exercise: Exercise; order_index: number }>;
}

type RoutineRow = Routine & {
  routine_exercises: Array<{ order_index: number; exercises: Exercise }>;
};

export async function getRoutines(): Promise<RoutineWithExercises[]> {
  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        order_index,
        exercises (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as RoutineRow[]).map((r) => {
    const re = r.routine_exercises ?? [];
    const sorted = [...re].sort((a, b) => a.order_index - b.order_index);
    return {
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      created_at: r.created_at,
      exercises: sorted.map((entry) => ({ exercise: entry.exercises, order_index: entry.order_index })),
    };
  });
}

export async function createRoutine(data: { name: string; exerciseIds: string[] }): Promise<Routine> {
  const { data: user } = await supabase.auth.getUser();
  const { data: routine, error } = await supabase
    .from('routines')
    .insert({ user_id: user.user!.id, name: data.name })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  const r = routine as unknown as Routine;

  if (data.exerciseIds.length > 0) {
    const inserts = data.exerciseIds.map((exerciseId, idx) => ({
      routine_id: r.id,
      exercise_id: exerciseId,
      order_index: idx,
    }));
    const { error: reError } = await supabase.from('routine_exercises').insert(inserts);
    if (reError) throw new Error(reError.message);
  }

  return r;
}

export async function updateRoutine(
  id: string,
  data: { name?: string; exerciseIds?: string[] }
): Promise<Routine> {
  const updates: { name?: string } = {};
  if (data.name !== undefined) updates.name = data.name;

  const { data: routine, error } = await supabase
    .from('routines')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  const r = routine as unknown as Routine;

  if (data.exerciseIds !== undefined) {
    await supabase.from('routine_exercises').delete().eq('routine_id', id);
    if (data.exerciseIds.length > 0) {
      const inserts = data.exerciseIds.map((exerciseId, idx) => ({
        routine_id: id,
        exercise_id: exerciseId,
        order_index: idx,
      }));
      const { error: reError } = await supabase.from('routine_exercises').insert(inserts);
      if (reError) throw new Error(reError.message);
    }
  }

  return r;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.from('routines').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
