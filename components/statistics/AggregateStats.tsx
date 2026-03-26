import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { formatStatNumber } from '../../lib/utils/format';

interface AggregateStatsProps {
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
}

interface StatCellProps {
  value: number;
  label: string;
}

function StatCell({ value, label }: StatCellProps): React.JSX.Element {
  return (
    <Card style={styles.cell}>
      <Text style={styles.value}>{formatStatNumber(value)}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

export function AggregateStats({ totalSessions, totalSets, totalReps, totalVolumeKg }: AggregateStatsProps): React.JSX.Element {
  return (
    <View style={styles.grid}>
      <StatCell value={totalSessions} label="Sessions" />
      <StatCell value={totalSets} label="Sets" />
      <StatCell value={totalReps} label="Reps" />
      <StatCell value={totalVolumeKg} label="Volume kg" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flex: 1, minWidth: '45%', alignItems: 'center' },
  value: { color: '#20D2AA', fontSize: 28, fontWeight: '800' },
  label: { color: '#5DCAA5', fontSize: 13, marginTop: 4 },
});
