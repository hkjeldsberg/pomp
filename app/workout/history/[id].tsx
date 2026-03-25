import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, Pressable, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getWorkoutDetail, type WorkoutDetail } from '../../../lib/db/workouts';
import { updateSet, deleteSet } from '../../../lib/db/sets';
import { SetRow } from '../../../components/workout/SetRow';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { sessionDurationMinutes } from '../../../lib/calculations';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('no-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

interface EditState {
  setId: string;
  weightInput: string;
  repsInput: string;
  noteInput: string;
}

export default function WorkoutHistoryDetail(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  function loadDetail(): void {
    getWorkoutDetail(id).then(setDetail).catch(() => {
      Alert.alert('Feil', 'Kunne ikke laste økt');
    });
  }

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function openEditModal(setId: string): void {
    if (!detail) return;
    for (const ex of detail.exercises) {
      const s = ex.sets.find((s) => s.id === setId);
      if (s) {
        setEditState({
          setId,
          weightInput: String(s.weight_kg),
          repsInput: String(s.reps),
          noteInput: s.note ?? '',
        });
        return;
      }
    }
  }

  async function handleSaveEdit(): Promise<void> {
    if (!editState) return;
    const weightKg = parseFloat(editState.weightInput);
    const reps = parseInt(editState.repsInput, 10);
    if (isNaN(weightKg) || isNaN(reps)) return;
    try {
      await updateSet(editState.setId, { weight_kg: weightKg, reps, note: editState.noteInput || null });
      setEditState(null);
      loadDetail();
    } catch {
      Alert.alert('Feil', 'Kunne ikke oppdatere sett');
    }
  }

  function handleDeleteSet(setId: string): void {
    Alert.alert('Slett sett', 'Er du sikker?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSet(setId);
            loadDetail();
          } catch {
            Alert.alert('Feil', 'Kunne ikke slette sett');
          }
        },
      },
    ]);
  }

  if (!detail) {
    return <View style={styles.container} />;
  }

  const sections = detail.exercises
    .filter((ex) => ex.sets.length > 0)
    .map((ex) => ({
      title: ex.exercise.name,
      data: ex.sets,
    }));

  const durationMin = detail.ended_at
    ? Math.round(sessionDurationMinutes(detail.started_at, detail.ended_at))
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Tilbake</Text>
        </Pressable>
        <Text style={styles.date}>{formatDate(detail.started_at)}</Text>
        {durationMin !== null ? <Text style={styles.meta}>{durationMin} min</Text> : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.exerciseName}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <SetRow
            setId={item.id}
            weightKg={item.weight_kg}
            reps={item.reps}
            completed={item.completed}
            note={item.note}
            onToggleComplete={() => {}}
            onEdit={openEditModal}
            onDelete={handleDeleteSet}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <Modal visible={editState !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rediger sett</Text>
            <View style={styles.inputRow}>
              <Input
                value={editState?.weightInput ?? ''}
                onChangeText={(v) => setEditState((s) => s ? { ...s, weightInput: v } : s)}
                placeholder="Vekt (kg)"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Input
                value={editState?.repsInput ?? ''}
                onChangeText={(v) => setEditState((s) => s ? { ...s, repsInput: v } : s)}
                placeholder="Reps"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Input
                value={editState?.noteInput ?? ''}
                onChangeText={(v) => setEditState((s) => s ? { ...s, noteInput: v } : s)}
                placeholder="Notat (valgfritt)"
              />
            </View>
            <View style={styles.modalButtons}>
              <Button label="Lagre" onPress={handleSaveEdit} />
              <View style={styles.cancelWrapper}>
                <Button label="Avbryt" onPress={() => setEditState(null)} variant="secondary" />
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
  header: { padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: 'rgba(32,210,170,0.15)' },
  back: { marginBottom: 12 },
  backText: { color: '#20D2AA', fontSize: 15 },
  date: { color: '#E0F5F0', fontSize: 20, fontWeight: '700' },
  meta: { color: '#5DCAA5', fontSize: 14, marginTop: 4 },
  list: { padding: 16 },
  exerciseName: { color: '#E0F5F0', fontSize: 17, fontWeight: '700', paddingTop: 16, paddingBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { color: '#E0F5F0', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputRow: { marginBottom: 12 },
  modalButtons: { marginTop: 8 },
  cancelWrapper: { marginTop: 8 },
});
