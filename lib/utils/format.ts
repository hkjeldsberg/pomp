export function formatStatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)} M`;
  }
  if (n >= 1_000) {
    return n.toLocaleString('nb-NO').replace(/\u00a0/g, ' ');
  }
  return String(n);
}
