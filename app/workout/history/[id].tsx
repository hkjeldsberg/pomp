import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getWorkoutDetail, type WorkoutDetail } from '../../../lib/db/workouts';
import { SetRow } from '../../../components/workout/SetRow';
import { sessionDurationMinutes } from '../../../lib/calculations';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('no-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function WorkoutHistoryDetail(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);

  useEffect(() => {
    getWorkoutDetail(id).then(setDetail).catch(() => {
      Alert.alert('Feil', 'Kunne ikke laste økt');
    });
  }, [id]);

  if (!detail) {
    return <View style={styles.container} />;
  }

  const sections = detail.exercises.map((ex) => ({
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
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
        contentContainerStyle={styles.list}
      />
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
});
