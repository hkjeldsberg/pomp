import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SetRow } from './SetRow';
import { PreviousSetReference } from './PreviousSetReference';
import { Button } from '../ui/Button';
import type { SetSummary } from '../../lib/db/workouts';

interface SetItem {
  setId: string;
  weightKg: number;
  reps: number;
  completed: boolean;
  note?: string | null;
}

interface ExerciseCardProps {
  exerciseId: string;
  exerciseName: string;
  sets: SetItem[];
  previousData?: SetSummary | null;
  onAddSet: (exerciseId: string) => void;
  onToggleComplete: (setId: string) => void;
  onEditSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
}

export function ExerciseCard(props: ExerciseCardProps): React.JSX.Element {
  const { exerciseId, exerciseName, sets, previousData, onAddSet, onToggleComplete, onEditSet, onDeleteSet } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{exerciseName}</Text>
      {previousData ? <PreviousSetReference data={previousData} /> : null}
      {sets.map((s) => (
        <SetRow
          key={s.setId}
          setId={s.setId}
          weightKg={s.weightKg}
          reps={s.reps}
          completed={s.completed}
          note={s.note}
          onToggleComplete={onToggleComplete}
          onEdit={onEditSet}
          onDelete={onDeleteSet}
        />
      ))}
      <View style={styles.addButton}>
        <Button label="Legg til sett" onPress={() => onAddSet(exerciseId)} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#112826',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 210, 170, 0.15)',
  },
  name: {
    color: '#E0F5F0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
});
