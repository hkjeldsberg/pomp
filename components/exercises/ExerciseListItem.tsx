import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Exercise } from '../../supabase/types';

interface ExerciseListItemProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  testID?: string;
}

export function ExerciseListItem({ exercise, onEdit, onDelete, testID }: ExerciseListItemProps): React.JSX.Element {
  return (
    <View testID={testID ?? 'exercise-list-item'} style={styles.row}>
      <Text style={styles.name}>{exercise.name}</Text>
      <View style={styles.actions}>
        <Pressable
          testID="edit-button"
          onPress={() => onEdit(exercise)}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Text style={styles.actionText}>✎</Text>
        </Pressable>
        <Pressable
          testID="delete-button"
          onPress={() => onDelete(exercise)}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Text style={[styles.actionText, styles.deleteText]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(32,210,170,0.12)',
  },
  name: {
    flex: 1,
    color: '#E0F5F0',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#5DCAA5',
    fontSize: 18,
  },
  deleteText: {
    color: '#ff6b6b',
  },
});
