import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

export interface RestTimerConfig {
  defaultSeconds: number;
  enabled: boolean;
  overrideByExerciseId?: Record<string, number>;
}

export interface UseRestTimerReturn {
  secondsRemaining: number | null;
  isRunning: boolean;
  startTimer: (exerciseId?: string) => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export function useRestTimer(config: RestTimerConfig): UseRestTimerReturn {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback((): void => {
    clearTick();
    setSecondsRemaining(null);
    endTimeRef.current = null;
  }, [clearTick]);

  const resetTimer = useCallback((): void => {
    stopTimer();
  }, [stopTimer]);

  const startTimer = useCallback((exerciseId?: string): void => {
    if (!config.enabled) return;

    clearTick();

    const duration =
      (exerciseId && config.overrideByExerciseId?.[exerciseId]) ||
      config.defaultSeconds;

    endTimeRef.current = Date.now() + duration * 1000;
    setSecondsRemaining(duration);

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil(((endTimeRef.current ?? 0) - Date.now()) / 1000);
      if (remaining <= 0) {
        clearTick();
        setSecondsRemaining(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        setSecondsRemaining(remaining);
      }
    }, 500);
  }, [config, clearTick]);

  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  return {
    secondsRemaining,
    isRunning: secondsRemaining !== null && secondsRemaining > 0,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
