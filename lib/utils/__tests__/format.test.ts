import { formatStatNumber } from '../format';

describe('formatStatNumber', () => {
  it('returns plain string for values below 1000', () => {
    expect(formatStatNumber(0)).toBe('0');
    expect(formatStatNumber(1)).toBe('1');
    expect(formatStatNumber(999)).toBe('999');
  });

  it('formats 1000 with thousands separator', () => {
    expect(formatStatNumber(1000)).toBe('1 000');
  });

  it('formats mid-range thousands correctly', () => {
    expect(formatStatNumber(12450)).toBe('12 450');
    expect(formatStatNumber(100000)).toBe('100 000');
  });

  it('formats values at the million boundary', () => {
    const result = formatStatNumber(1_000_000);
    expect(result).toBe('1.0 M');
  });

  it('formats large values with abbreviated units', () => {
    expect(formatStatNumber(1_234_567)).toBe('1.2 M');
    expect(formatStatNumber(2_500_000)).toBe('2.5 M');
  });
});
