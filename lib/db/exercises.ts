import { supabase } from '../supabase';
import type { Exercise } from '../../supabase/types';

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
