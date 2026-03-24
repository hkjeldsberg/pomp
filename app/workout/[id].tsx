import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useActiveWorkout } from '../../lib/hooks/useActiveWorkout';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import type { Exercise } from '../../supabase/types';

interface ExerciseGroup {
  exercise: Exercise;
  sets: Array<{ setId: string; weightKg: number; reps: number; completed: boolean; note: string | null }>;
}

export default function ActiveWorkoutScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sets, setSets, logSet, editSet, toggleComplete, deleteSets, endSession, cancelSession, onError } =
    useActiveWorkout(id);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editSetId, setEditSetId] = useState<string | null>(null);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    // Load exercises for this workout via routine_exercises or existing sets
    async function loadExercises(): Promise<void> {
      const { data: workout } = await supabase
        .schema('pomp')
        .from('workouts')
        .select('routine_id')
        .eq('id', id)
        .single();

      if (workout?.routine_id) {
        const { data: re } = await supabase
          .schema('pomp')
          .from('routine_exercises')
          .select('exercise_id, order_index, exercises(*)')
          .eq('routine_id', workout.routine_id)
          .order('order_index');
        if (re) {
          setExercises(re.map((r) => r.exercises as Exercise).filter(Boolean));
        }
      }
    }
    loadExercises();
  }, [id]);

  // Group sets by exercise
  const exerciseGroups: ExerciseGroup[] = exercises.map((ex) => ({
    exercise: ex,
    sets: sets
      .filter((s) => s.exercise_id === ex.id)
      .map((s) => ({
        setId: s.id,
        weightKg: s.weight_kg,
        reps: s.reps,
        completed: s.completed,
        note: s.note,
      })),
  }));

  function openAddModal(exerciseId: string): void {
    setCurrentExerciseId(exerciseId);
    setEditSetId(null);
    // Pre-fill from last set for this exercise
    const lastSet = [...sets].reverse().find((s) => s.exercise_id === exerciseId);
    setWeightInput(lastSet ? String(lastSet.weight_kg) : '');
    setRepsInput(lastSet ? String(lastSet.reps) : '');
    setNoteInput('');
    setAddModalVisible(true);
  }

  function openEditModal(setId: string): void {
    const s = sets.find((s) => s.id === setId);
    if (!s) return;
    setCurrentExerciseId(s.exercise_id);
    setEditSetId(setId);
    setWeightInput(String(s.weight_kg));
    setRepsInput(String(s.reps));
    setNoteInput(s.note ?? '');
    setAddModalVisible(true);
  }

  async function handleConfirmSet(): Promise<void> {
    if (!currentExerciseId) return;
    const weightKg = parseFloat(weightInput);
    const reps = parseInt(repsInput, 10);
    if (isNaN(weightKg) || isNaN(reps)) return;

    if (editSetId) {
      await editSet(editSetId, { weightKg, reps, note: noteInput || null });
    } else {
      const setNumber = sets.filter((s) => s.exercise_id === currentExerciseId).length + 1;
      await logSet({ exerciseId: currentExerciseId, setNumber, weightKg, reps, note: noteInput || null });
    }
    setAddModalVisible(false);
  }

  function handleDeleteSet(setId: string): void {
    Alert.alert('Slett sett', 'Er du sikker på at du vil slette dette settet?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => deleteSets(setId) },
    ]);
  }

  function handleEndSession(): void {
    Alert.alert('Avslutt økt', 'Er du sikker på at du vil avslutte?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Avslutt', onPress: () => endSession(id) },
    ]);
  }

  function handleCancelSession(): void {
    Alert.alert('Avbryt økt', 'Dette sletter alle settene og fjerner økten.', [
      { text: 'Tilbake', style: 'cancel' },
      { text: 'Avbryt økt', style: 'destructive', onPress: () => cancelSession(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aktiv økt</Text>
        <Pressable onPress={handleCancelSession}>
          <Text style={styles.cancelLink}>Avbryt</Text>
        </Pressable>
      </View>

      {onError ? <Text style={styles.errorText}>{onError}</Text> : null}

      <FlatList
        data={exerciseGroups}
        keyExtractor={(item) => item.exercise.id}
        renderItem={({ item }) => (
          <ExerciseCard
            exerciseId={item.exercise.id}
            exerciseName={item.exercise.name}
            sets={item.sets}
            onAddSet={openAddModal}
            onToggleComplete={toggleComplete}
            onEditSet={openEditModal}
            onDeleteSet={handleDeleteSet}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <Button label="Avslutt økt" onPress={handleEndSession} />
      </View>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editSetId ? 'Rediger sett' : 'Nytt sett'}</Text>
            <View style={styles.inputRow}>
              <Input
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="Vekt (kg)"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Input
                value={repsInput}
                onChangeText={setRepsInput}
                placeholder="Reps"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Input value={noteInput} onChangeText={setNoteInput} placeholder="Notat (valgfritt)" />
            </View>
            <View style={styles.modalButtons}>
              <Button label="Bekreft" onPress={handleConfirmSet} />
              <View style={styles.cancelButtonWrapper}>
                <Button label="Avbryt" onPress={() => setAddModalVisible(false)} variant="secondary" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56 },
  title: { color: '#E0F5F0', fontSize: 22, fontWeight: '700' },
  cancelLink: { color: '#5DCAA5', fontSize: 15 },
  errorText: { color: '#ff6b6b', paddingHorizontal: 16, marginBottom: 8 },
  list: { padding: 16 },
  footer: { padding: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { color: '#E0F5F0', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputRow: { marginBottom: 12 },
  modalButtons: { marginTop: 8 },
  cancelButtonWrapper: { marginTop: 8 },
});
