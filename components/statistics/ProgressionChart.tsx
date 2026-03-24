import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { EmptyState } from '../ui/EmptyState';

interface DataPoint extends Record<string, unknown> {
  date: string;
  value: number;
}

interface ProgressionChartProps {
  data: DataPoint[];
  label: string;
}

export function ProgressionChart({ data, label }: ProgressionChartProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {data.length === 0 ? (
        <EmptyState iconName="chart.line.uptrend.xyaxis" title="Ingen data ennå" />
      ) : (
        <View style={styles.chartWrapper}>
          <CartesianChart
            data={data}
            xKey="date"
            yKeys={['value'] as const}
          >
            {({ points }) => (
              <Line
                points={points.value}
                color="#20D2AA"
                strokeWidth={2}
              />
            )}
          </CartesianChart>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { color: '#5DCAA5', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  chartWrapper: { height: 180, backgroundColor: '#0D1F1D', borderRadius: 12 },
});
