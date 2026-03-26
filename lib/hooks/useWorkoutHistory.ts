import { useState, useCallback, useEffect } from 'react';
import { getWorkoutHistory, type WorkoutSummary } from '../db/workouts';

interface UseWorkoutHistoryReturn {
  sessions: WorkoutSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWorkoutHistory(): UseWorkoutHistoryReturn {
  const [sessions, setSessions] = useState<WorkoutSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkoutHistory();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feil ved lasting av historikk');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { sessions, isLoading, error, refresh: load };
}
