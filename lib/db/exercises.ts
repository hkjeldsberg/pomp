import { supabase } from '../supabase';
import type { Exercise } from '../../supabase/types';
import { EXERCISE_SEED_DATA } from '../data/exerciseSeedData';

type Category = Exercise['category'];

export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('category')
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []) as Exercise[];
}

export async function createExercise(data: { name: string; category: string }): Promise<Exercise> {
  const { data: user } = await supabase.auth.getUser();
  const { data: result, error } = await supabase
    .from('exercises')
    .insert({
      user_id: user.user!.id,
      name: data.name,
      category: data.category as Category,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return result as Exercise;
}

export async function updateExercise(
  id: string,
  data: { name: string; category: string }
): Promise<Exercise> {
  const { data: result, error } = await supabase
    .from('exercises')
    .update({ name: data.name, category: data.category as Category })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return result as Exercise;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function seedExercises(): Promise<{ inserted: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { inserted: 0 };

  const rows = EXERCISE_SEED_DATA.map((e) => ({
    user_id: user.id,
    name: e.name,
    category: e.category as Category,
  }));

  const { data, error } = await supabase
    .from('exercises')
    .upsert(rows, { onConflict: 'user_id,name', ignoreDuplicates: true })
    .select('id');

  if (error) throw new Error(error.message);
  return { inserted: (data ?? []).length };
}
