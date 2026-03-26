import React from 'react';
import { render } from '@testing-library/react-native';
import { AggregateStats } from '../AggregateStats';

describe('AggregateStats', () => {
  it('renders all 4 totals', () => {
    const { getByText } = render(
      <AggregateStats
        totalSessions={12}
        totalSets={240}
        totalReps={960}
        totalVolumeKg={48000}
      />
    );
    expect(getByText('12')).toBeTruthy();
    expect(getByText('240')).toBeTruthy();
    expect(getByText('960')).toBeTruthy();
    expect(getByText('48 000')).toBeTruthy();
  });

  it('handles all-zero values without crash', () => {
    const { getByText } = render(
      <AggregateStats totalSessions={0} totalSets={0} totalReps={0} totalVolumeKg={0} />
    );
    expect(getByText('Sessions')).toBeTruthy();
    expect(getByText('Sets')).toBeTruthy();
  });
});
