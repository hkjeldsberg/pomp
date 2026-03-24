import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface SetRowProps {
  setId: string;
  weightKg: number;
  reps: number;
  completed: boolean;
  note?: string | null;
  onToggleComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
  onDelete: (setId: string) => void;
}

export function SetRow(props: SetRowProps): React.JSX.Element {
  const { setId, weightKg, reps, completed, note, onToggleComplete, onEdit, onDelete } = props;

  return (
    <Pressable
      testID="set-row"
      onPress={() => onEdit(setId)}
      onLongPress={() => onDelete(setId)}
      style={[styles.row, completed && styles.rowCompleted]}
    >
      <Pressable
        testID="complete-toggle"
        onPress={() => onToggleComplete(setId)}
        style={[styles.toggle, completed && styles.toggleCompleted]}
      >
        {completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>
      <View style={styles.info}>
        <Text style={[styles.text, completed && styles.textCompleted]}>{weightKg} kg</Text>
        <Text style={[styles.text, completed && styles.textCompleted]}>{reps} reps</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  rowCompleted: {
    opacity: 0.7,
  },
  toggle: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20D2AA',
    marginRight: 12,
  },
  toggleCompleted: {
    backgroundColor: '#20D2AA',
  },
  checkmark: {
    color: '#0A1F1C',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  text: {
    color: '#E0F5F0',
    fontSize: 16,
  },
  textCompleted: {
    color: '#5DCAA5',
  },
  note: {
    color: '#5DCAA5',
    fontSize: 13,
  },
});
