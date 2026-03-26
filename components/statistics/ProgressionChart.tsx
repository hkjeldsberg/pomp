import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Line, useChartTransformState } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
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
  const font = useFont(require('../../assets/fonts/SpaceMono-Regular.ttf'), 10);
  const { state: transformState } = useChartTransformState();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {data.length === 0 ? (
        <EmptyState iconName="chart.line.uptrend.xyaxis" title="No data yet" />
      ) : (
        <View style={styles.chartWrapper}>
          <CartesianChart
            data={data}
            xKey="date"
            yKeys={['value'] as const}
            domainPadding={{ top: 16, bottom: 8 }}
            transformState={transformState}
            axisOptions={{
              font,
              labelColor: '#5DCAA5',
              tickCount: 5,
              lineColor: 'rgba(32,210,170,0.15)',
              formatXLabel: (val) => {
                const d = new Date(String(val));
                if (isNaN(d.getTime())) return '';
                const month = d.toLocaleDateString('en-US', { month: 'short' });
                const year = String(d.getFullYear()).slice(2);
                return `${month}-${year}`;
              },
              formatYLabel: (val) => String(Math.round(Number(val))),
            }}
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
  chartWrapper: { height: 220, backgroundColor: '#0D1F1D', borderRadius: 12 },
});
