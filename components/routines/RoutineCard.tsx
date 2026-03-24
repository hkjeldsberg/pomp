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
      <Pressable style={styles.info} onLongPress={onEdit}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>{exerciseCount} øvelser</Text>
      </Pressable>
      <Pressable onPress={onStart} style={styles.startButton}>
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
    marginBottom: 12,
  },
  info: {
    flex: 1,
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
    backgroundColor: '#20D2AA',
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
