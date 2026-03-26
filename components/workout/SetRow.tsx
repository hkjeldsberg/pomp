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
  // Optional: previous session value shown when set is not completed
  previousValue?: { weightKg: number; reps: number };
  // Optional: confirm same as previous session (fires when ✓ icon tapped)
  onConfirmSame?: () => void;
  // Optional: inline validation error
  validationError?: string | null;
}

export function SetRow(props: SetRowProps): React.JSX.Element {
  const { setId, weightKg, reps, completed, note, onToggleComplete, onEdit, onDelete,
          previousValue, onConfirmSame, validationError } = props;

  return (
    <View>
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
        {!completed && previousValue && onConfirmSame ? (
          <Pressable
            testID="confirm-same"
            onPress={onConfirmSame}
            style={styles.confirmSame}
          >
            <Text style={styles.confirmSameText}>≡✓</Text>
          </Pressable>
        ) : null}
      </Pressable>
      {validationError ? (
        <Text style={styles.validationError}>{validationError}</Text>
      ) : null}
    </View>
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
  confirmSame: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  confirmSameText: {
    color: '#20D2AA',
    fontSize: 18,
    fontWeight: '700',
  },
  validationError: {
    color: '#ff6b6b',
    fontSize: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
});
