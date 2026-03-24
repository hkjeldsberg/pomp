import { useState, useCallback } from 'react';
import {
  getAggregateStats,
  getSessionDurations,
  getSessionVolumes,
  getExerciseProgression,
  type AggregateStats,
  type DurationPoint,
  type VolumePoint,
  type ProgressionPoint,
} from '../db/statistics';

interface UseStatisticsReturn {
  aggregates: AggregateStats | null;
  durationPoints: DurationPoint[];
  volumePoints: VolumePoint[];
  getExerciseData: (exerciseId: string) => Promise<ProgressionPoint[]>;
  isLoading: boolean;
  load: () => void;
}

export function useStatistics(fetchEnabled: boolean): UseStatisticsReturn {
  const [aggregates, setAggregates] = useState<AggregateStats | null>(null);
  const [durationPoints, setDurationPoints] = useState<DurationPoint[]>([]);
  const [volumePoints, setVolumePoints] = useState<VolumePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (!fetchEnabled) return;
    setIsLoading(true);
    try {
      const [agg, dur, vol] = await Promise.all([
        getAggregateStats(),
        getSessionDurations(),
        getSessionVolumes(),
      ]);
      setAggregates(agg);
      setDurationPoints(dur);
      setVolumePoints(vol);
    } finally {
      setIsLoading(false);
    }
  }, [fetchEnabled]);

  const getExerciseData = useCallback(async (exerciseId: string): Promise<ProgressionPoint[]> => {
    return getExerciseProgression(exerciseId);
  }, []);

  return { aggregates, durationPoints, volumePoints, getExerciseData, isLoading, load };
}
