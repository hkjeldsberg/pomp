import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useActiveWorkout } from '../../lib/hooks/useActiveWorkout';
import { useRestTimer } from '../../lib/hooks/useRestTimer';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { RestTimer } from '../../components/workout/RestTimer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { getPreviousSessionSetDetails, type PreviousSetDetail } from '../../lib/db/workouts';
import { getUserPreferences } from '../../lib/db/userPreferences';
import type { Exercise } from '../../supabase/types';

const DEFAULT_PLANNED_SETS = 3;

interface ExerciseGroup {
  exercise: Exercise;
  setNumber: number; // planned set count for this exercise
  previousSets: PreviousSetDetail[];
}

export default function ActiveWorkoutScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sets, setSets, logSet, editSet, toggleComplete, deleteSets, endSession, cancelSession, onError } =
    useActiveWorkout(id);

  const [exercises, setExercises] = useState<ExerciseGroup[]>([]);
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [timerConfig, setTimerConfig] = useState({ defaultSeconds: 90, enabled: true });
  const { secondsRemaining, isRunning, startTimer, stopTimer } = useRestTimer(timerConfig);

  // Edit modal state (for editing an already-logged set)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSetId, setEditSetId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  // Elapsed timer
  const startedAtRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  useEffect(() => {
    async function loadExercisesAndPrevSets(): Promise<void> {
      const { data: workout } = await supabase
        .schema('pomp')
        .from('workouts')
        .select('routine_id, started_at')
        .eq('id', id)
        .single();

      if (!workout?.routine_id) return;
      setRoutineId(workout.routine_id);
      if (workout.started_at) {
        startedAtRef.current = new Date(workout.started_at).getTime();
      }

      const { data: re } = await supabase
        .schema('pomp')
        .from('routine_exercises')
        .select('exercise_id, order_index, exercises(*)')
        .eq('routine_id', workout.routine_id)
        .order('order_index');

      if (!re) return;

      const groups: ExerciseGroup[] = await Promise.all(
        re.map(async (r) => {
          const ex = r.exercises as Exercise;
          const prevSets = await getPreviousSessionSetDetails(workout.routine_id!, ex.id);
          return {
            exercise: ex,
            setNumber: prevSets.length > 0 ? prevSets.length : DEFAULT_PLANNED_SETS,
            previousSets: prevSets,
          };
        })
      );
      setExercises(groups.filter((g) => g.exercise));
    }
    loadExercisesAndPrevSets();
  }, [id]);

  // Check if all planned sets are logged and completed
  const allComplete = exercises.length > 0 && exercises.every((group) => {
    const logged = sets.filter((s) => s.exercise_id === group.exercise.id);
    return logged.length >= group.setNumber && logged.every((s) => s.completed);
  });

  useEffect(() => {
    if (allComplete) {
      Alert.alert(
        'Økt fullført!',
        'Alle sett er fullført. Vil du avslutte?',
        [
          { text: 'Fortsett', style: 'cancel' },
          { text: 'Avslutt', onPress: () => endSession(id) },
        ]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allComplete]);

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setTimerConfig({ defaultSeconds: prefs.restTimerSeconds, enabled: prefs.restTimerEnabled });
    }).catch(() => {});
  }, []);

  async function handleConfirmSet(exerciseId: string, setNumber: number, weightKg: number, reps: number): Promise<void> {
    await logSet({ exerciseId, setNumber, weightKg, reps, note: null });
    startTimer(exerciseId);
  }

  function openEditModal(setId: string): void {
    const s = sets.find((s) => s.id === setId);
    if (!s) return;
    setEditSetId(setId);
    setWeightInput(String(s.weight_kg));
    setRepsInput(String(s.reps));
    setNoteInput(s.note ?? '');
    setEditModalVisible(true);
  }

  async function handleSaveEdit(): Promise<void> {
    if (!editSetId) return;
    const weightKg = parseFloat(weightInput);
    const reps = parseInt(repsInput, 10);
    if (isNaN(weightKg) || isNaN(reps)) return;
    await editSet(editSetId, { weightKg, reps, note: noteInput || null });
    setEditModalVisible(false);
  }

  function handleDeleteSet(setId: string): void {
    Alert.alert('Slett sett', 'Er du sikker?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => deleteSets(setId) },
    ]);
  }

  function handleAbort(): void {
    Alert.alert(
      'Avbryt økt',
      'Hva vil du gjøre med gjenværende sett?',
      [
        { text: 'Fortsett', style: 'cancel' },
        {
          text: 'Lagre som det er',
          onPress: () => endSession(id),
        },
        {
          text: 'Fullfør gjenværende sett',
          onPress: async () => {
            // Mark all incomplete logged sets as complete
            const incompleteSets = sets.filter((s) => !s.completed);
            await Promise.all(incompleteSets.map((s) => toggleComplete(s.id)));

            // Log any completely unlogged planned sets using previous values
            for (const group of exercises) {
              const loggedNumbers = sets
                .filter((s) => s.exercise_id === group.exercise.id)
                .map((s) => s.set_number);

              for (let sn = 1; sn <= group.setNumber; sn++) {
                if (!loggedNumbers.includes(sn)) {
                  const prev = group.previousSets.find((p) => p.set_number === sn);
                  if (prev) {
                    await logSet({
                      exerciseId: group.exercise.id,
                      setNumber: sn,
                      weightKg: prev.weight_kg,
                      reps: prev.reps,
                      note: null,
                    });
                  }
                }
              }
            }

            await endSession(id);
          },
        },
      ]
    );
  }

  function handleCancelSession(): void {
    Alert.alert('Slett økt', 'Dette sletter alle settene og fjerner økten.', [
      { text: 'Tilbake', style: 'cancel' },
      { text: 'Slett økt', style: 'destructive', onPress: () => cancelSession(id) },
    ]);
  }

  const exerciseGroupsForList = exercises.map((group) => ({
    exercise: group.exercise,
    plannedSetCount: group.setNumber,
    previousSets: group.previousSets,
    sets: sets
      .filter((s) => s.exercise_id === group.exercise.id)
      .map((s) => ({
        setId: s.id,
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        reps: s.reps,
        completed: s.completed,
        note: s.note,
      })),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aktiv økt</Text>
        <Text style={styles.timer}>{formatElapsed(elapsedSeconds)}</Text>
        <Pressable onPress={handleAbort}>
          <Text style={styles.abortLink}>Avbryt</Text>
        </Pressable>
      </View>

      {onError ? <Text style={styles.errorText}>{onError}</Text> : null}

      <RestTimer
        secondsRemaining={secondsRemaining}
        isRunning={isRunning}
        onStop={stopTimer}
      />

      <FlatList
        data={exerciseGroupsForList}
        keyExtractor={(item) => item.exercise.id}
        renderItem={({ item }) => (
          <ExerciseCard
            exerciseId={item.exercise.id}
            exerciseName={item.exercise.name}
            sets={item.sets}
            plannedSetCount={item.plannedSetCount}
            previousSets={item.previousSets.map((p) => ({
              setNumber: p.set_number,
              weightKg: p.weight_kg,
              reps: p.reps,
            }))}
            onToggleComplete={toggleComplete}
            onEditSet={openEditModal}
            onDeleteSet={handleDeleteSet}
            onConfirmSet={handleConfirmSet}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <Button label="Avslutt økt" onPress={() => endSession(id)} />
        <View style={styles.cancelButtonWrapper}>
          <Button label="Slett økt" onPress={handleCancelSession} variant="secondary" />
        </View>
      </View>

      {/* Edit modal for already-logged sets */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rediger sett</Text>
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
              <Button label="Lagre" onPress={handleSaveEdit} />
              <View style={styles.cancelButtonWrapper}>
                <Button label="Avbryt" onPress={() => setEditModalVisible(false)} variant="secondary" />
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
  title: { color: '#E0F5F0', fontSize: 20, fontWeight: '700' },
  timer: { color: '#20D2AA', fontSize: 16, fontWeight: '600' },
  abortLink: { color: '#5DCAA5', fontSize: 15 },
  errorText: { color: '#ff6b6b', paddingHorizontal: 16, marginBottom: 8 },
  list: { padding: 16 },
  footer: { padding: 16 },
  cancelButtonWrapper: { marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { color: '#E0F5F0', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputRow: { marginBottom: 12 },
  modalButtons: { marginTop: 8 },
});
