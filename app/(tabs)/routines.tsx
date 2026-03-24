import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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

  const load = useCallback(async (): Promise<void> => {
    const [r, e] = await Promise.all([getRoutines(), getExercises()]);
    setRoutines(r);
    setExercises(e);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreateForm(): void {
    setEditRoutine(null);
    setNameInput('');
    setSelectedIds([]);
    setFormVisible(true);
  }

  function openEditForm(routine: RoutineWithExercises): void {
    setEditRoutine(routine);
    setNameInput(routine.name);
    setSelectedIds(routine.exercises.map((e) => e.exercise.id));
    setFormVisible(true);
  }

  async function handleStart(routine: RoutineWithExercises): Promise<void> {
    try {
      const workout = await createWorkout({ routineId: routine.id });
      router.push(`/workout/${workout.id}` as Parameters<typeof router.push>[0]);
    } catch (err) {
      Alert.alert('Feil', err instanceof Error ? err.message : 'Kunne ikke starte økt');
    }
  }

  async function handleSave(): Promise<void> {
    if (!nameInput.trim()) return;
    try {
      if (editRoutine) {
        await updateRoutine(editRoutine.id, { name: nameInput.trim(), exerciseIds: selectedIds });
      } else {
        await createRoutine({ name: nameInput.trim(), exerciseIds: selectedIds });
      }
      setFormVisible(false);
      await load();
    } catch (err) {
      Alert.alert('Feil', err instanceof Error ? err.message : 'Feil ved lagring');
    }
  }

  function handleDelete(routineId: string): void {
    Alert.alert('Slett rutine', 'Er du sikker?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett', style: 'destructive', onPress: async () => {
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
          title="Ingen rutiner"
          subtitle="Opprett din første treningsrutine"
          action={{ label: 'Ny rutine', onPress: openCreateForm }}
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
        <Button label="Ny rutine" onPress={openCreateForm} />
      </View>

      {/* Create/Edit form modal */}
      <Modal visible={formVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editRoutine ? 'Rediger rutine' : 'Ny rutine'}</Text>
            <View style={styles.inputWrapper}>
              <Input value={nameInput} onChangeText={setNameInput} placeholder="Navn på rutine" />
            </View>
            <Text style={styles.label}>{selectedIds.length} øvelse(r) valgt</Text>
            <View style={styles.pickerButtonWrapper}>
              <Button label="Velg øvelser" onPress={() => setPickerVisible(true)} variant="secondary" />
            </View>
            <View style={styles.modalButtons}>
              <Button label="Lagre" onPress={handleSave} />
              <View style={styles.cancelWrapper}>
                <Button label="Avbryt" onPress={() => setFormVisible(false)} variant="secondary" />
              </View>
              {editRoutine && (
                <View style={styles.deleteWrapper}>
                  <Button label="Slett rutine" onPress={() => { setFormVisible(false); handleDelete(editRoutine.id); }} variant="secondary" />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise picker modal */}
      <Modal visible={pickerVisible} animationType="slide">
        <ExercisePicker
          exercises={exercises}
          selectedIds={selectedIds}
          onToggle={toggleExercise}
          onConfirm={(ids) => { setSelectedIds(ids); setPickerVisible(false); }}
          onClose={() => setPickerVisible(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412', paddingTop: 56 },
  list: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { color: '#E0F5F0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  inputWrapper: { marginBottom: 16 },
  label: { color: '#5DCAA5', fontSize: 13, marginBottom: 8 },
  pickerButtonWrapper: { marginBottom: 16 },
  modalButtons: { marginTop: 8 },
  cancelWrapper: { marginTop: 8 },
  deleteWrapper: { marginTop: 8 },
});
