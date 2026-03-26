import { filterOutliersByIQR } from '../statistics';

interface Point { value: number; label: string }

function makePoints(values: number[]): Point[] {
  return values.map((v, i) => ({ value: v, label: `p${i}` }));
}

describe('filterOutliersByIQR', () => {
  it('returns original array when count < minCount (5)', () => {
    const data = makePoints([1, 100, 200, 300, 1000]);
    // 5 items = minCount, so filtering applies; try with 4
    const small = makePoints([1, 100, 1000, 50000]);
    expect(filterOutliersByIQR(small, 'value')).toEqual(small);
  });

  it('returns original array when empty', () => {
    expect(filterOutliersByIQR([], 'value')).toEqual([]);
  });

  it('filters extreme outlier above the upper fence', () => {
    const data = makePoints([40, 45, 50, 55, 60, 1000]);
    const result = filterOutliersByIQR(data, 'value');
    expect(result.map((p) => p.value)).not.toContain(1000);
  });

  it('filters extreme outlier below the lower fence', () => {
    const data = makePoints([0, 50, 55, 60, 65, 70]);
    const result = filterOutliersByIQR(data, 'value');
    expect(result.map((p) => p.value)).not.toContain(0);
  });

  it('returns all data when no outliers exist', () => {
    const data = makePoints([40, 45, 50, 55, 60, 65]);
    const result = filterOutliersByIQR(data, 'value');
    expect(result).toHaveLength(data.length);
  });

  it('works with different value keys', () => {
    const data = [
      { durationMinutes: 45 }, { durationMinutes: 50 }, { durationMinutes: 55 },
      { durationMinutes: 60 }, { durationMinutes: 65 }, { durationMinutes: 500 },
    ];
    const result = filterOutliersByIQR(data, 'durationMinutes');
    expect(result.map((d) => d.durationMinutes)).not.toContain(500);
  });
});
