# Data Model: Exercise Management, Statistics Polish & UX Feedback

**Branch**: `003-exercise-stats-ux` | **Date**: 2026-03-25

---

## Existing Schema (unchanged)

### `pomp.exercises`

```sql
CREATE TABLE pomp.exercises (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  category    text NOT NULL CHECK (category IN (
                'Rygg','Bryst','Ben','Skuldre','Biceps','Triceps','Magemuskler'
              )),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
```

**No schema changes required.** All new behaviour (seeding, edit, delete) is implemented at the application layer using the existing schema.

---

## New TypeScript Interfaces

### `ExerciseSeedEntry`

A static entry in the seed dataset (no DB row — this is source data only):

```typescript
interface ExerciseSeedEntry {
  name: string;
  category: 'Rygg' | 'Bryst' | 'Ben' | 'Skuldre' | 'Biceps' | 'Triceps' | 'Magemuskler';
}
```

**Location**: `lib/data/exerciseSeedData.ts`

---

## New DB Functions (`lib/db/exercises.ts`)

### `updateExercise(id: string, data: { name: string; category: string }): Promise<Exercise>`

Updates the name and/or category of an existing exercise. Throws if the new name conflicts with an existing exercise (UNIQUE constraint on user_id + name).

### `deleteExercise(id: string): Promise<void>`

Deletes an exercise. Will throw a Supabase error if the exercise is referenced in `routine_exercises` (ON DELETE RESTRICT). The caller catches this and presents a user-friendly message.

### `seedExercises(): Promise<{ inserted: number }>`

Inserts all entries from `exerciseSeedData` for the current authenticated user using `ON CONFLICT (user_id, name) DO NOTHING`. Returns the count of newly inserted exercises (0 if already seeded).

---

## New Utility Functions

### `filterOutliersByIQR<T>(data: T[], valueKey: keyof T, minCount?: number): T[]`

**Location**: `lib/utils/statistics.ts`

Filters out data points outside the IQR fence (Q1 − 1.5×IQR, Q3 + 1.5×IQR). Returns the original array unchanged when `data.length < minCount` (default: 5).

```typescript
// Input: DurationPoint[] → Output: DurationPoint[] (outliers removed)
// Input: VolumePoint[]   → Output: VolumePoint[]   (outliers removed)
```

### `formatStatNumber(n: number): string`

**Location**: `lib/utils/format.ts`

Formats a non-negative integer for display in statistics:

| Input range | Example output |
|-------------|---------------|
| `n < 1000` | `"850"` |
| `1000 ≤ n < 1_000_000` | `"12 450"` |
| `n ≥ 1_000_000` | `"1.2 M"` |

---

## Affected Hooks

### `useStatistics` (`lib/hooks/useStatistics.ts`)

`durationPoints` and `volumePoints` returned by the hook will be filtered through `filterOutliersByIQR` after fetching. The raw (unfiltered) totals used in `AggregateStats` remain unaffected.

---

## Seed Dataset Summary

**Location**: `lib/data/exerciseSeedData.ts`

~50 common exercises distributed across all 7 categories:

| Category | Examples |
|----------|---------|
| Bryst | Benkpress, Skrå benkpress, Kabelkryss |
| Rygg | Markløft, Nedtrekk, Sittende roing |
| Ben | Knebøy, Beinpress, Utfall |
| Skuldre | Militærpress, Sidehev, Frontpress |
| Biceps | Stangcurl, Hammercurl, Konsentrasjonscurl |
| Triceps | Triceps pushdown, Skulderpress m/nakke, Franske press |
| Magemuskler | Situps, Planke, Beinheving |
