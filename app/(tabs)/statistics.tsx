import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useStatistics } from '../../lib/hooks/useStatistics';
import { getExercises } from '../../lib/db/exercises';
import { getLatestExerciseSets } from '../../lib/db/statistics';
import { estimatedOneRM } from '../../lib/calculations';
import { AggregateStats } from '../../components/statistics/AggregateStats';
import { ProgressionChart } from '../../components/statistics/ProgressionChart';
import { DateRangeFilter } from '../../components/statistics/DateRangeFilter';
import { ExercisePickerModal } from '../../components/statistics/ExercisePickerModal';
import type { Exercise } from '../../supabase/types';
import type { DateRange, ProgressionPoint } from '../../lib/db/statistics';

export default function StatistikkScreen(): React.JSX.Element {
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const { aggregates, durationPoints, volumePoints, getExerciseData, isLoading, load } = useStatistics(fetchEnabled, dateRange);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
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
      <Text style={styles.title}>Statistics</Text>

      <DateRangeFilter selected={dateRange} onChange={handleDateRangeChange} />

      {isLoading && <Text style={styles.loading}>Loading...</Text>}

      {aggregates && aggregates.totalSessions === 0 && (
        <Text style={styles.emptyRange}>No sessions in selected period</Text>
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
          label="Duration per session (min)"
        />
      </View>}

      {aggregates && aggregates.totalSessions > 0 && <View style={styles.section}>
        <ProgressionChart
          data={volumePoints.map((v) => ({ date: v.date, value: v.volumeKg }))}
          label="Volume per session (kg)"
        />
      </View>}

      <Text style={styles.sectionTitle}>Per exercise</Text>
      <Pressable onPress={() => setPickerVisible(true)} style={styles.exercisePickerBtn}>
        <Text style={styles.exercisePickerBtnText}>
          {selectedExercise ? selectedExercise.name : 'Select exercise →'}
        </Text>
      </Pressable>
      <ExercisePickerModal
        visible={pickerVisible}
        exercises={exercises}
        selectedId={selectedExercise?.id ?? null}
        onSelect={(ex) => { void handleSelectExercise(ex); }}
        onClose={() => setPickerVisible(false)}
      />

      {selectedExercise && (
        <View style={styles.section}>
          <ProgressionChart
            data={exercisePoints.map((p) => ({ date: p.date, value: p.maxWeightKg }))}
            label={`${selectedExercise.name} — Max weight (kg)`}
          />
          <ProgressionChart
            data={exercisePoints.map((p) => ({ date: p.date, value: p.estimated1rm }))}
            label={`${selectedExercise.name} — Estimated 1RM (kg)`}
          />
          {latestSets.length > 0 && (
            <View style={styles.latestSets}>
              <Text style={styles.latestTitle}>Last session</Text>
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
  exercisePickerBtn: {
    borderWidth: 1,
    borderColor: 'rgba(32,210,170,0.3)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  exercisePickerBtnText: { color: '#5DCAA5', fontSize: 14 },
  latestSets: { marginTop: 12 },
  latestTitle: { color: '#5DCAA5', fontSize: 13, marginBottom: 8 },
  latestSet: { color: '#E0F5F0', fontSize: 14, marginBottom: 4 },
  emptyRange: { color: '#5DCAA5', fontSize: 15, textAlign: 'center', marginTop: 24 },
});
