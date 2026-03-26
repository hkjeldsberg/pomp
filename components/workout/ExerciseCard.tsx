import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SetRow } from './SetRow';
import { PendingSetRow } from './PendingSetRow';

interface SetItem {
  setId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  note?: string | null;
}

interface PreviousSetItem {
  setNumber: number;
  weightKg: number;
  reps: number;
}

interface ExerciseCardProps {
  exerciseId: string;
  exerciseName: string;
  sets: SetItem[];
  plannedSetCount: number;
  previousSets?: PreviousSetItem[];
  onToggleComplete: (setId: string) => void;
  onEditSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
  onConfirmSet: (exerciseId: string, setNumber: number, weightKg: number, reps: number) => void;
  onRestTimerStop?: () => void;
}

export function ExerciseCard(props: ExerciseCardProps): React.JSX.Element {
  const { exerciseId, exerciseName, sets, plannedSetCount, previousSets,
          onToggleComplete, onEditSet, onDeleteSet, onConfirmSet, onRestTimerStop } = props;

  const totalRows = Math.max(plannedSetCount, sets.length);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{exerciseName}</Text>
      {Array.from({ length: totalRows }, (_, i) => {
        const setNumber = i + 1;
        const loggedSet = sets.find((s) => s.setNumber === setNumber);
        const prevSet = previousSets?.find((p) => p.setNumber === setNumber);

        if (loggedSet) {
          return (
            <SetRow
              key={`logged-${setNumber}`}
              setId={loggedSet.setId}
              weightKg={loggedSet.weightKg}
              reps={loggedSet.reps}
              completed={loggedSet.completed}
              note={loggedSet.note}
              onToggleComplete={onToggleComplete}
              onEdit={onEditSet}
              onDelete={onDeleteSet}
            />
          );
        }

        return (
          <PendingSetRow
            key={`pending-${setNumber}`}
            setNumber={setNumber}
            previousValue={prevSet ? { weightKg: prevSet.weightKg, reps: prevSet.reps } : undefined}
            onConfirm={(weightKg, reps) => {
              if (onRestTimerStop) onRestTimerStop();
              onConfirmSet(exerciseId, setNumber, weightKg, reps);
            }}
          />
        );
      })}
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
});
