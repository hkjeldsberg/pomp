import { estimatedOneRM, sessionVolume, sessionDurationMinutes } from '../calculations';

describe('estimatedOneRM', () => {
  it('calculates Epley 1RM at 1 rep', () => {
    expect(estimatedOneRM(100, 1)).toBeCloseTo(100 * (1 + 1 / 30));
  });

  it('calculates Epley 1RM at 5 reps', () => {
    expect(estimatedOneRM(80, 5)).toBeCloseTo(80 * (1 + 5 / 30));
  });

  it('calculates Epley 1RM at 10 reps', () => {
    expect(estimatedOneRM(60, 10)).toBeCloseTo(60 * (1 + 10 / 30));
  });

  it('calculates Epley 1RM at 30 reps', () => {
    expect(estimatedOneRM(40, 30)).toBeCloseTo(40 * (1 + 30 / 30));
  });

  it('returns weight when reps is 0', () => {
    expect(estimatedOneRM(100, 0)).toBe(100);
  });
});

describe('sessionVolume', () => {
  it('sums weight × reps correctly', () => {
    const sets = [
      { weightKg: 100, reps: 5 },
      { weightKg: 80, reps: 8 },
    ];
    expect(sessionVolume(sets)).toBe(100 * 5 + 80 * 8);
  });

  it('returns 0 for empty sets', () => {
    expect(sessionVolume([])).toBe(0);
  });
});

describe('sessionDurationMinutes', () => {
  it('returns correct duration in minutes', () => {
    const start = '2026-01-01T10:00:00Z';
    const end = '2026-01-01T11:30:00Z';
    expect(sessionDurationMinutes(start, end)).toBeCloseTo(90);
  });

  it('returns 0 for same start and end', () => {
    const t = '2026-01-01T10:00:00Z';
    expect(sessionDurationMinutes(t, t)).toBe(0);
  });
});
