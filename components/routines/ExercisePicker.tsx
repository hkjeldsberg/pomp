import React from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import type { Exercise } from '../../supabase/types';

type Category = 'Back' | 'Chest' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core';
const CATEGORIES: Category[] = ['Back', 'Chest', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core'];

interface ExercisePickerProps {
  exercises: Exercise[];
  selectedIds: string[];
  onToggle: (exercise: Exercise) => void;
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}

export function ExercisePicker({ exercises, selectedIds, onToggle, onConfirm, onClose }: ExercisePickerProps): React.JSX.Element {
  const sections = CATEGORIES
    .map((cat) => ({
      title: cat,
      data: exercises.filter((e) => e.category === cat),
    }))
    .filter((s) => s.data.length > 0);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select exercises</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrapper}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <Pressable
              testID={isSelected ? `selected-${item.id}` : `exercise-${item.id}`}
              onPress={() => onToggle(item)}
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
        <Button label="Confirm" onPress={() => onConfirm(selectedIds)} />
        <View style={styles.cancelWrapper}>
          <Button label="Cancel" onPress={onClose} variant="secondary" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F1D', padding: 16 },
  title: { color: '#E0F5F0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  list: { flex: 1 },
  sectionHeaderWrapper: { backgroundColor: '#0D1F1D', paddingTop: 4 },
  sectionHeader: { color: '#5DCAA5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(32,210,170,0.1)' },
  rowSelected: { backgroundColor: 'rgba(32,210,170,0.08)' },
  exerciseName: { color: '#E0F5F0', fontSize: 16 },
  checkmark: { color: '#20D2AA', fontSize: 16, fontWeight: '700' },
  actions: { paddingTop: 16 },
  cancelWrapper: { marginTop: 8 },
});
