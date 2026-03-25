import React, { useState } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import type { Exercise } from '../../supabase/types';

type Category = 'Rygg' | 'Bryst' | 'Ben' | 'Skuldre' | 'Biceps' | 'Triceps' | 'Magemuskler';
const CATEGORIES: Category[] = ['Rygg', 'Bryst', 'Ben', 'Skuldre', 'Biceps', 'Triceps', 'Magemuskler'];

interface ExercisePickerProps {
  exercises: Exercise[];
  selectedIds: string[];
  onToggle: (exercise: Exercise) => void;
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}

export function ExercisePicker({ exercises, selectedIds, onToggle, onConfirm, onClose }: ExercisePickerProps): React.JSX.Element {
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(null);

  const sections = CATEGORIES
    .map((cat) => ({
      title: cat,
      data: exercises.filter((e) => e.category === cat),
    }))
    .filter((s) => s.data.length > 0);

  function handleToggle(exercise: Exercise): void {
    if (selectedIds.includes(exercise.id)) {
      // Allow de-selection without showing duplicate message
      onToggle(exercise);
      setDuplicateMsg(null);
      return;
    }
    // Check if already selected (shouldn't reach here due to above, but guard for direct adds)
    setDuplicateMsg(null);
    onToggle(exercise);
  }

  // Intercept re-selection attempts: the parent passes selectedIds; if an already-selected
  // exercise is pressed again, show a message instead of calling onToggle (which would de-select).
  // We override onPress to detect this case.
  function handlePress(exercise: Exercise): void {
    if (selectedIds.includes(exercise.id)) {
      setDuplicateMsg(`${exercise.name} er allerede i rutinen`);
      return;
    }
    setDuplicateMsg(null);
    handleToggle(exercise);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Velg øvelser</Text>
      {duplicateMsg ? <Text testID="duplicate-msg" style={styles.duplicateMsg}>{duplicateMsg}</Text> : null}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <Pressable
              testID={isSelected ? `selected-${item.id}` : `exercise-${item.id}`}
              onPress={() => handlePress(item)}
              style={[styles.row, isSelected && styles.rowSelected]}
            >
              <Text style={styles.exerciseName}>{item.name}</Text>
              {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
            </Pressable>
          );
        }}
        style={styles.list}
      />
      <View style={styles.actions}>
        <Button label="Velg" onPress={() => onConfirm(selectedIds)} />
        <View style={styles.cancelWrapper}>
          <Button label="Avbryt" onPress={onClose} variant="secondary" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F1D', padding: 16 },
  title: { color: '#E0F5F0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  list: { flex: 1 },
  sectionHeader: { color: '#5DCAA5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(32,210,170,0.1)' },
  rowSelected: { backgroundColor: 'rgba(32,210,170,0.08)' },
  exerciseName: { color: '#E0F5F0', fontSize: 16 },
  checkmark: { color: '#20D2AA', fontSize: 16, fontWeight: '700' },
  actions: { paddingTop: 16 },
  cancelWrapper: { marginTop: 8 },
  duplicateMsg: { color: '#ff6b6b', fontSize: 13, marginBottom: 8 },
});
