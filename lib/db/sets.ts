import { supabase } from '../supabase';
import type { WorkoutSet } from '../../supabase/types';

export interface LogSetInput {
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  note?: string | null;
}

export interface UpdateSetInput {
  weight_kg?: number;
  reps?: number;
  note?: string | null;
  completed?: boolean;
}

export async function logSet(data: LogSetInput): Promise<WorkoutSet> {
  const { data: result, error } = await supabase
    .from('workout_sets')
    .insert({
      workout_id: data.workout_id,
      exercise_id: data.exercise_id,
      set_number: data.set_number,
      weight_kg: data.weight_kg,
      reps: data.reps,
      note: data.note ?? null,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return result as unknown as WorkoutSet;
}

export async function updateSet(id: string, data: Partial<UpdateSetInput>): Promise<WorkoutSet> {
  const update: Record<string, unknown> = {};
  if (data.weight_kg !== undefined) update['weight_kg'] = data.weight_kg;
  if (data.reps !== undefined) update['reps'] = data.reps;
  if (data.note !== undefined) update['note'] = data.note;
  if (data.completed !== undefined) update['completed'] = data.completed;

  const { data: result, error } = await supabase
    .from('workout_sets')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return result as unknown as WorkoutSet;
}

export async function deleteSet(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
