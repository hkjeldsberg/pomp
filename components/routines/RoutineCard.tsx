import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface RoutineCardProps {
  routineId: string;
  name: string;
  exerciseCount: number;
  onStart: () => void;
  onEdit: () => void;
}

export function RoutineCard({ name, exerciseCount, onStart, onEdit }: RoutineCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Pressable style={({ pressed }) => [styles.info, pressed && styles.infoPressed]} onLongPress={onEdit}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>{exerciseCount} exercises</Text>
      </Pressable>
      <Pressable
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          // Inline backgroundColor so NativeWind preflight cannot override it
          { backgroundColor: '#20D2AA' },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text style={styles.startText}>Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#112826',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(32, 210, 170, 0.15)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  infoPressed: {
    opacity: 0.6,
  },
  name: {
    color: '#E0F5F0',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    color: '#5DCAA5',
    fontSize: 13,
  },
  startButton: {
    minHeight: 44,
    minWidth: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  startText: {
    color: '#0A1F1C',
    fontWeight: '700',
    fontSize: 15,
  },
});
