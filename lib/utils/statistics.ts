export function filterOutliersByIQR<T>(
  data: T[],
  valueKey: keyof T,
  minCount: number = 5
): T[] {
  if (data.length < minCount) return data;

  const sorted = [...data].sort(
    (a, b) => (a[valueKey] as number) - (b[valueKey] as number)
  );
  const n = sorted.length;
  const q1 = (sorted[Math.floor(n * 0.25)][valueKey] as number);
  const q3 = (sorted[Math.floor(n * 0.75)][valueKey] as number);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  return data.filter((d) => {
    const v = d[valueKey] as number;
    return v >= lower && v <= upper;
  });
}
