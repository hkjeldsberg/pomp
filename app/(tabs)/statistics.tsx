import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useStatistics } from '../../lib/hooks/useStatistics';
import { getExercises } from '../../lib/db/exercises';
import { getLatestExerciseSets } from '../../lib/db/statistics';
import { estimatedOneRM } from '../../lib/calculations';
import { AggregateStats } from '../../components/statistics/AggregateStats';
import { ProgressionChart } from '../../components/statistics/ProgressionChart';
import { DateRangeFilter } from '../../components/statistics/DateRangeFilter';
import type { Exercise } from '../../supabase/types';
import type { DateRange, ProgressionPoint } from '../../lib/db/statistics';

export default function StatistikkScreen(): React.JSX.Element {
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const { aggregates, durationPoints, volumePoints, getExerciseData, isLoading, load } = useStatistics(fetchEnabled, dateRange);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercisePoints, setExercisePoints] = useState<ProgressionPoint[]>([]);
  const [latestSets, setLatestSets] = useState<Array<{ weight_kg: number; reps: number; set_number: number }>>([]);

  // Lazy load on first mount
  useEffect(() => {
    setFetchEnabled(true);
  }, []);

  useEffect(() => {
    if (fetchEnabled) {
      load();
      getExercises().then(setExercises);
    }
  }, [fetchEnabled, load]);

  function handleDateRangeChange(range: DateRange): void {
    setDateRange(range);
    setSelectedExercise(null);
    setExercisePoints([]);
    setLatestSets([]);
  }

  async function handleSelectExercise(exercise: Exercise): Promise<void> {
    setSelectedExercise(exercise);
    const [points, sets] = await Promise.all([
      getExerciseData(exercise.id),
      getLatestExerciseSets(exercise.id),
    ]);
    setExercisePoints(points);
    setLatestSets(sets);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Statistikk</Text>

      <DateRangeFilter selected={dateRange} onChange={handleDateRangeChange} />

      {isLoading && <Text style={styles.loading}>Laster...</Text>}

      {aggregates && aggregates.totalSessions === 0 && (
        <Text style={styles.emptyRange}>Ingen økter i valgt periode</Text>
      )}

      {aggregates && aggregates.totalSessions > 0 && (
        <View style={styles.section}>
          <AggregateStats
            totalSessions={aggregates.totalSessions}
            totalSets={aggregates.totalSets}
            totalReps={aggregates.totalReps}
            totalVolumeKg={aggregates.totalVolumeKg}
          />
        </View>
      )}

      {aggregates && aggregates.totalSessions > 0 && <View style={styles.section}>
        <ProgressionChart
          data={durationPoints.map((d) => ({ date: d.date, value: d.durationMinutes }))}
          label="Varighet per økt (min)"
        />
      </View>}

      {aggregates && aggregates.totalSessions > 0 && <View style={styles.section}>
        <ProgressionChart
          data={volumePoints.map((v) => ({ date: v.date, value: v.volumeKg }))}
          label="Volum per økt (kg)"
        />
      </View>}

      <Text style={styles.sectionTitle}>Per øvelse</Text>
      <FlatList
        data={exercises}
        keyExtractor={(e) => e.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelectExercise(item)}
            style={[styles.exerciseChip, selectedExercise?.id === item.id && styles.exerciseChipActive]}
          >
            <Text style={[styles.chipText, selectedExercise?.id === item.id && styles.chipTextActive]}>
              {item.name}
            </Text>
          </Pressable>
        )}
        style={styles.exercisePicker}
      />

      {selectedExercise && (
        <View style={styles.section}>
          <ProgressionChart
            data={exercisePoints.map((p) => ({ date: p.date, value: p.maxWeightKg }))}
            label={`${selectedExercise.name} — Max vekt (kg)`}
          />
          <ProgressionChart
            data={exercisePoints.map((p) => ({ date: p.date, value: p.estimated1rm }))}
            label={`${selectedExercise.name} — Estimert 1RM (kg)`}
          />
          {latestSets.length > 0 && (
            <View style={styles.latestSets}>
              <Text style={styles.latestTitle}>Sist</Text>
              {latestSets.map((s) => (
                <Text key={s.set_number} style={styles.latestSet}>
                  {s.set_number}. {s.weight_kg}kg × {s.reps} — 1RM: {Math.round(estimatedOneRM(s.weight_kg, s.reps))}kg
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 48 },
  title: { color: '#E0F5F0', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  loading: { color: '#5DCAA5', marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#E0F5F0', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  exercisePicker: { flexGrow: 0, marginBottom: 16 },
  exerciseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(32,210,170,0.3)', marginRight: 8 },
  exerciseChipActive: { backgroundColor: '#20D2AA', borderColor: '#20D2AA' },
  chipText: { color: '#5DCAA5', fontSize: 14 },
  chipTextActive: { color: '#0A1F1C', fontWeight: '600' },
  latestSets: { marginTop: 12 },
  latestTitle: { color: '#5DCAA5', fontSize: 13, marginBottom: 8 },
  latestSet: { color: '#E0F5F0', fontSize: 14, marginBottom: 4 },
  emptyRange: { color: '#5DCAA5', fontSize: 15, textAlign: 'center', marginTop: 24 },
});
