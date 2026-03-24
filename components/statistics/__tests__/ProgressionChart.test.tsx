/**
 * Component tests for ProgressionChart.
 * victory-native requires Skia — mock it for unit testing.
 */

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {},
  Canvas: ({ children }: { children: React.ReactNode }) => children,
  Path: () => null,
  Group: ({ children }: { children: React.ReactNode }) => children,
  Text: () => null,
  useFont: () => null,
  matchFont: () => null,
  vec: () => ({ x: 0, y: 0 }),
}));

jest.mock('victory-native', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    CartesianChart: ({ children, ...props }: { children: (args: unknown) => React.ReactNode; data: unknown[]; xKey: string; yKeys: string[] }) => (
      <View testID="cartesian-chart">
        {props.data.length > 0 ? <Text>{`chart-data-${props.data.length}`}</Text> : null}
      </View>
    ),
    Line: () => null,
    useChartPressState: () => ({ state: {}, isActive: false }),
  };
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressionChart } from '../ProgressionChart';

describe('ProgressionChart', () => {
  it('renders without crash with empty data', () => {
    const { getByText } = render(
      <ProgressionChart data={[]} label="Max vekt (kg)" />
    );
    expect(getByText('Max vekt (kg)')).toBeTruthy();
  });

  it('renders with one data point', () => {
    const { getByText } = render(
      <ProgressionChart data={[{ date: '2026-01-01', value: 80 }]} label="1RM (kg)" />
    );
    expect(getByText('1RM (kg)')).toBeTruthy();
    expect(getByText('chart-data-1')).toBeTruthy();
  });

  it('label prop text appears in rendered output', () => {
    const { getByText } = render(
      <ProgressionChart data={[{ date: '2026-01-01', value: 100 }]} label="Volum (kg)" />
    );
    expect(getByText('Volum (kg)')).toBeTruthy();
  });
});
