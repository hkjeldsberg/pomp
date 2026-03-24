import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { logSet as dbLogSet, updateSet as dbUpdateSet, deleteSet as dbDeleteSet } from '../db/sets';
import { endWorkout, cancelWorkout } from '../db/workouts';
import type { WorkoutSet } from '../../supabase/types';

export interface ActiveSet extends Omit<WorkoutSet, 'weight_kg' | 'reps'> {
  weight_kg: number;
  reps: number;
  isOptimistic?: boolean;
  tempId?: string;
}

interface UseActiveWorkoutReturn {
  sets: ActiveSet[];
  setSets: React.Dispatch<React.SetStateAction<ActiveSet[]>>;
  logSet: (data: { exerciseId: string; setNumber: number; weightKg: number; reps: number; note?: string | null }) => Promise<void>;
  editSet: (id: string, data: { weightKg: number; reps: number; note?: string | null }) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteSets: (id: string) => Promise<void>;
  endSession: (workoutId: string) => Promise<void>;
  cancelSession: (workoutId: string) => Promise<void>;
  onError: string | null;
}

export function useActiveWorkout(workoutId: string): UseActiveWorkoutReturn {
  const router = useRouter();
  const [sets, setSets] = useState<ActiveSet[]>([]);
  const [onError, setOnError] = useState<string | null>(null);

  const logSet = useCallback(async (data: {
    exerciseId: string;
    setNumber: number;
    weightKg: number;
    reps: number;
    note?: string | null;
  }): Promise<void> => {
    const tempId = `temp-${Date.now()}`;
    const optimisticSet: ActiveSet = {
      id: tempId,
      workout_id: workoutId,
      exercise_id: data.exerciseId,
      set_number: data.setNumber,
      weight_kg: data.weightKg,
      reps: data.reps,
      note: data.note ?? null,
      completed: false,
      logged_at: new Date().toISOString(),
      isOptimistic: true,
      tempId,
    };

    // Optimistic: add immediately
    setSets((prev) => [...prev, optimisticSet]);

    try {
      const serverSet = await dbLogSet({
        workout_id: workoutId,
        exercise_id: data.exerciseId,
        set_number: data.setNumber,
        weight_kg: data.weightKg,
        reps: data.reps,
        note: data.note,
      });
      // Replace temp row with server row
      setSets((prev) => prev.map((s) => (s.tempId === tempId ? { ...serverSet } : s)));
    } catch (err) {
      // Rollback on error
      setSets((prev) => prev.filter((s) => s.tempId !== tempId));
      setOnError(err instanceof Error ? err.message : 'Feil ved lagring av sett');
    }
  }, [workoutId]);

  const editSet = useCallback(async (id: string, data: { weightKg: number; reps: number; note?: string | null }): Promise<void> => {
    setSets((prev) => prev.map((s) => s.id === id ? { ...s, weight_kg: data.weightKg, reps: data.reps, note: data.note ?? s.note } : s));
    try {
      await dbUpdateSet(id, { weight_kg: data.weightKg, reps: data.reps, note: data.note });
    } catch (err) {
      setOnError(err instanceof Error ? err.message : 'Feil ved oppdatering av sett');
    }
  }, []);

  const toggleComplete = useCallback(async (id: string): Promise<void> => {
    const set = sets.find((s) => s.id === id);
    if (!set) return;
    const newCompleted = !set.completed;
    setSets((prev) => prev.map((s) => s.id === id ? { ...s, completed: newCompleted } : s));
    try {
      await dbUpdateSet(id, { completed: newCompleted });
    } catch (err) {
      setSets((prev) => prev.map((s) => s.id === id ? { ...s, completed: set.completed } : s));
      setOnError(err instanceof Error ? err.message : 'Feil ved oppdatering');
    }
  }, [sets]);

  const deleteSets = useCallback(async (id: string): Promise<void> => {
    setSets((prev) => prev.filter((s) => s.id !== id));
    try {
      await dbDeleteSet(id);
    } catch (err) {
      setOnError(err instanceof Error ? err.message : 'Feil ved sletting');
    }
  }, []);

  const endSession = useCallback(async (id: string): Promise<void> => {
    await endWorkout(id);
    router.back();
  }, [router]);

  const cancelSession = useCallback(async (id: string): Promise<void> => {
    await cancelWorkout(id);
    router.back();
  }, [router]);

  return { sets, setSets, logSet, editSet, toggleComplete, deleteSets, endSession, cancelSession, onError };
}
