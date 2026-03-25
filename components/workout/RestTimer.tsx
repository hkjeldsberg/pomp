import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface RestTimerProps {
  secondsRemaining: number | null;
  isRunning: boolean;
  onStop: () => void;
  testID?: string;
}

export function RestTimer({ secondsRemaining, isRunning, onStop, testID }: RestTimerProps): React.JSX.Element | null {
  if (secondsRemaining === null && !isRunning) return null;

  const isDone = secondsRemaining === 0;

  return (
    <Pressable
      testID={testID ?? 'rest-timer'}
      onPress={onStop}
      style={[styles.container, isDone && styles.containerDone]}
    >
      <Text style={styles.label}>Hvile</Text>
      {isDone ? (
        <Text style={styles.doneText}>Klar! 🔔</Text>
      ) : (
        <Text style={styles.countdown}>{secondsRemaining}s</Text>
      )}
      <Text style={styles.hint}>Trykk for å stoppe</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#112826',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#20D2AA',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    minHeight: 44,
    flexDirection: 'row',
    gap: 12,
  },
  containerDone: {
    borderColor: '#5DCAA5',
    backgroundColor: 'rgba(32, 210, 170, 0.12)',
  },
  label: {
    color: '#5DCAA5',
    fontSize: 13,
  },
  countdown: {
    color: '#20D2AA',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  doneText: {
    color: '#E0F5F0',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  hint: {
    color: '#5DCAA5',
    fontSize: 11,
  },
});
