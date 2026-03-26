import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Modal, Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getRoutines, createRoutine, updateRoutine, deleteRoutine, type RoutineWithExercises } from '../../lib/db/routines';
import { createWorkout } from '../../lib/db/workouts';
import { getExercises } from '../../lib/db/exercises';
import { RoutineCard } from '../../components/routines/RoutineCard';
import { ExercisePicker } from '../../components/routines/ExercisePicker';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Exercise } from '../../supabase/types';

export default function RutinerScreen(): React.JSX.Element {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editRoutine, setEditRoutine] = useState<RoutineWithExercises | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    const [r, e] = await Promise.all([getRoutines(), getExercises()]);
    setRoutines(r);
    setExercises(e);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function openCreateForm(): void {
    setEditRoutine(null);
    setNameInput('');
    setSelectedIds([]);
    setSaveError(null);
    setFormVisible(true);
  }

  function openEditForm(routine: RoutineWithExercises): void {
    setEditRoutine(routine);
    setNameInput(routine.name);
    setSelectedIds(routine.exercises.map((e) => e.exercise.id));
    setSaveError(null);
    setFormVisible(true);
  }

  async function handleStart(routine: RoutineWithExercises): Promise<void> {
    if (routine.exercises.length === 0) {
      Alert.alert('No exercises', 'Add exercises to the routine before starting');
      return;
    }
    try {
      const workout = await createWorkout({ routineId: routine.id });
      router.push(`/workout/${workout.id}` as Parameters<typeof router.push>[0]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not start session');
    }
  }

  async function handleSave(): Promise<void> {
    if (!nameInput.trim()) return;
    if (selectedIds.length === 0) {
      setSaveError('Add at least one exercise to the routine');
      return;
    }
    setSaveError(null);
    try {
      if (editRoutine) {
        await updateRoutine(editRoutine.id, { name: nameInput.trim(), exerciseIds: selectedIds });
      } else {
        await createRoutine({ name: nameInput.trim(), exerciseIds: selectedIds });
      }
      setFormVisible(false);
      await load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error saving');
    }
  }

  function handleDelete(routineId: string): void {
    Alert.alert('Delete routine', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteRoutine(routineId);
          await load();
        }
      },
    ]);
  }

  function toggleExercise(exercise: Exercise): void {
    setSelectedIds((prev) =>
      prev.includes(exercise.id) ? prev.filter((id) => id !== exercise.id) : [...prev, exercise.id]
    );
  }

  return (
    <View style={styles.container}>
      {routines.length === 0 ? (
        <EmptyState
          iconName="rectangle.stack"
          title="No routines"
          subtitle="Create your first training routine"
          action={{ label: 'New routine', onPress: openCreateForm }}
        />
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <RoutineCard
              routineId={item.id}
              name={item.name}
              exerciseCount={item.exercises.length}
              onStart={() => handleStart(item)}
              onEdit={() => openEditForm(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.fab}>
        <Button label="New routine" onPress={openCreateForm} />
      </View>

      {/* Single modal: form view or exercise picker view */}
      <Modal visible={formVisible} animationType="slide" onRequestClose={() => {
        if (pickerVisible) { setPickerVisible(false); } else { setFormVisible(false); }
      }}>
        {pickerVisible ? (
          <ExercisePicker
            exercises={exercises}
            selectedIds={selectedIds}
            onToggle={toggleExercise}
            onConfirm={(ids) => { setSelectedIds(ids); setPickerVisible(false); }}
            onClose={() => setPickerVisible(false)}
          />
        ) : (
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentInner}>
              <Text style={styles.modalTitle}>{editRoutine ? 'Edit routine' : 'New routine'}</Text>
              <View style={styles.inputWrapper}>
                <Input value={nameInput} onChangeText={setNameInput} placeholder="Routine name" />
              </View>
              {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
              <View style={styles.pickerButtonWrapper}>
                <Button label="Select exercises" onPress={() => setPickerVisible(true)} variant="secondary" />
              </View>
              {selectedIds.length > 0 && (
                <View style={styles.selectedList}>
                  {selectedIds.map((id, index) => {
                    const ex = exercises.find((e) => e.id === id);
                    if (!ex) return null;
                    return (
                      <View key={id} style={styles.selectedRow}>
                        <Text style={styles.selectedName}>{index + 1}. {ex.name}</Text>
                        <View style={styles.orderButtons}>
                          {index > 0 && (
                            <Pressable
                              onPress={() => setSelectedIds((prev) => {
                                const next = [...prev];
                                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                return next;
                              })}
                              hitSlop={8}
                              style={styles.orderBtn}
                            >
                              <Text style={styles.orderBtnText}>↑</Text>
                            </Pressable>
                          )}
                          {index < selectedIds.length - 1 && (
                            <Pressable
                              onPress={() => setSelectedIds((prev) => {
                                const next = [...prev];
                                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                return next;
                              })}
                              hitSlop={8}
                              style={styles.orderBtn}
                            >
                              <Text style={styles.orderBtnText}>↓</Text>
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => setSelectedIds((prev) => prev.filter((i) => i !== id))}
                            hitSlop={8}
                            style={styles.orderBtn}
                          >
                            <Text style={[styles.orderBtnText, styles.removeBtn]}>✕</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              <View style={styles.modalButtons}>
                <Button label="Save" onPress={handleSave} />
                <View style={styles.cancelWrapper}>
                  <Button label="Cancel" onPress={() => setFormVisible(false)} variant="secondary" />
                </View>
                {editRoutine && (
                  <View style={styles.deleteWrapper}>
                    <Button label="Delete routine" onPress={() => { setFormVisible(false); handleDelete(editRoutine.id); }} variant="secondary" />
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412', paddingTop: 56 },
  list: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  modalOverlay: { flex: 1, backgroundColor: '#071412', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalContentInner: { padding: 24, paddingBottom: 48 },
  modalTitle: { color: '#E0F5F0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  inputWrapper: { marginBottom: 16 },
  pickerButtonWrapper: { marginBottom: 12 },
  modalButtons: { marginTop: 8 },
  cancelWrapper: { marginTop: 8 },
  deleteWrapper: { marginTop: 8 },
  saveError: { color: '#ff6b6b', fontSize: 13, marginBottom: 8 },
  selectedList: { marginBottom: 16 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(32,210,170,0.15)' },
  selectedName: { flex: 1, color: '#E0F5F0', fontSize: 14 },
  orderButtons: { flexDirection: 'row', gap: 4 },
  orderBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  orderBtnText: { color: '#20D2AA', fontSize: 16, fontWeight: '600' },
  removeBtn: { color: '#ff6b6b' },
});
