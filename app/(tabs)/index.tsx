import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutHistory } from '../../lib/hooks/useWorkoutHistory';
import { getRoutines, type RoutineWithExercises } from '../../lib/db/routines';
import { createWorkout } from '../../lib/db/workouts';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function LoggScreen(): React.JSX.Element {
  const router = useRouter();
  const { sessions, isLoading, error, refresh } = useWorkoutHistory();
  const [routinePickerVisible, setRoutinePickerVisible] = useState(false);
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);

  const openRoutinePicker = useCallback(async (): Promise<void> => {
    const r = await getRoutines();
    setRoutines(r);
    setRoutinePickerVisible(true);
  }, []);

  async function handleStartRoutine(routine: RoutineWithExercises): Promise<void> {
    if (routine.exercises.length === 0) {
      Alert.alert('No exercises', 'Add exercises to the routine before starting');
      return;
    }
    try {
      const workout = await createWorkout({ routineId: routine.id });
      setRoutinePickerVisible(false);
      router.push(`/workout/${workout.id}` as Parameters<typeof router.push>[0]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not start session');
    }
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log</Text>
        <Button label="Start session" onPress={openRoutinePicker} />
      </View>

      {!isLoading && sessions.length === 0 ? (
        <EmptyState
          iconName="list.bullet"
          title="No sessions yet"
          subtitle="Start your first session via a routine"
          action={{ label: '+ Start first session', onPress: openRoutinePicker }}
        />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.sessionRow}
              onPress={() => router.push(`/workout/history/${item.id}` as Parameters<typeof router.push>[0])}
            >
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>{formatDate(item.started_at)}</Text>
                <Text style={styles.sessionRoutine}>{item.routine_name ?? 'Custom'}</Text>
              </View>
              <View style={styles.sessionMeta}>
                <Text style={styles.metaText}>{Math.round(item.duration_minutes)} min</Text>
                <Text style={styles.metaText}>{item.set_count} sets</Text>
              </View>
            </Pressable>
          )}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={isLoading}
        />
      )}

      {/* Routine picker */}
      <Modal visible={routinePickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select routine</Text>
            {routines.length === 0 ? (
              <Pressable onPress={() => { setRoutinePickerVisible(false); router.push('/(tabs)/routines' as Parameters<typeof router.push>[0]); }} style={styles.noRoutinesRow}>
                <Text style={styles.noRoutines}>No routines — create one now →</Text>
              </Pressable>
            ) : (
              <ScrollView style={styles.routineList} bounces={false}>
                {routines.map((r) => (
                  <Pressable key={r.id} style={styles.routineRow} onPress={() => handleStartRoutine(r)}>
                    <Text style={styles.routineName}>{r.name}</Text>
                    <Text style={styles.routineCount}>{r.exercises.length} exercises</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <View style={styles.cancelWrapper}>
              <Button label="Cancel" onPress={() => setRoutinePickerVisible(false)} variant="secondary" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412' },
  header: { padding: 16, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#E0F5F0', fontSize: 24, fontWeight: '700' },
  error: { color: '#ff6b6b', padding: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(32,210,170,0.1)' },
  sessionInfo: { flex: 1 },
  sessionDate: { color: '#E0F5F0', fontSize: 15, fontWeight: '600' },
  sessionRoutine: { color: '#5DCAA5', fontSize: 13, marginTop: 2 },
  sessionMeta: { alignItems: 'flex-end' },
  metaText: { color: '#5DCAA5', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { color: '#E0F5F0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  noRoutinesRow: { paddingVertical: 12, marginBottom: 16 },
  noRoutines: { color: '#20D2AA', fontSize: 15 },
  routineList: { maxHeight: 300 },
  routineRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(32,210,170,0.1)' },
  routineName: { color: '#E0F5F0', fontSize: 16, fontWeight: '500' },
  routineCount: { color: '#5DCAA5', fontSize: 13 },
  cancelWrapper: { marginTop: 16 },
});
