# Data Model: UX Improvements & Feature Backlog

**Branch**: `002-ux-improvements-backlog` | **Date**: 2026-03-25

## Schema Changes

### New Table: `pomp.user_preferences`

```sql
CREATE TABLE pomp.user_preferences (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rest_timer_seconds   integer NOT NULL DEFAULT 90 CHECK (rest_timer_seconds >= 0),
  rest_timer_enabled   boolean NOT NULL DEFAULT true,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can only read/write their own row
ALTER TABLE pomp.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON pomp.user_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

**Rationale**: One row per user. `UPSERT` on first access creates the row with defaults; no
explicit "create preferences" step required.

---

## Existing Schema — No Changes Required

All other tables (`workouts`, `workout_sets`, `routines`, `routine_exercises`, `exercises`)
are unchanged. The existing constraints (`reps >= 1`, `weight_kg >= 0`) in `workout_sets`
already enforce part of FR-028/FR-030 at the DB level; the app-layer validation added in
Story 10 provides user-facing feedback before the DB write.

---

## New TypeScript Types

### `DateRange` (lib/db/statistics.ts)

```typescript
export type DateRange = '4w' | '3m' | '1y' | 'all';

// Utility: convert DateRange → ISO cutoff date string (or null for 'all')
export function dateRangeCutoff(range: DateRange): string | null {
  if (range === 'all') return null;
  const now = new Date();
  if (range === '4w')  now.setDate(now.getDate() - 28);
  if (range === '3m')  now.setMonth(now.getMonth() - 3);
  if (range === '1y')  now.setFullYear(now.getFullYear() - 1);
  return now.toISOString();
}
```

### `UserPreferences` (lib/db/userPreferences.ts)

```typescript
export interface UserPreferences {
  userId: string;
  restTimerSeconds: number;
  restTimerEnabled: boolean;
}

export async function getUserPreferences(): Promise<UserPreferences>;
export async function upsertUserPreferences(
  prefs: Partial<Omit<UserPreferences, 'userId'>>
): Promise<void>;
```

### `PreviousSetValue` (lib/hooks/useActiveWorkout.ts)

```typescript
// Keyed by `${exercise_id}:${set_number}` — used for placeholder display and confirm-same
export interface PreviousSetValue {
  weightKg: number;
  reps: number;
}

export type PreviousSetMap = Record<string, PreviousSetValue>;
```

### Updated `useActiveWorkout` Interface

```typescript
interface UseActiveWorkoutReturn {
  // Existing
  sets: ActiveSet[];
  isLoading: boolean;
  error: string | null;
  logSet: (data: LogSetInput) => Promise<void>;
  editSet: (id: string, data: EditSetInput) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  cancelSession: (id: string) => Promise<void>;

  // New
  previousSets: PreviousSetMap;          // pre-fill placeholder data
  confirmSame: (exerciseId: string, setNumber: number) => Promise<void>; // FR-007
  abortSession: (id: string, autoComplete: boolean) => Promise<void>;    // FR-010/011
}
```

### `useRestTimer` Hook Interface

```typescript
export interface RestTimerConfig {
  defaultSeconds: number;
  enabled: boolean;
  overrideByExerciseId?: Record<string, number>; // per-exercise override (in-session only)
}

export interface UseRestTimerReturn {
  secondsRemaining: number | null;  // null = not running
  isRunning: boolean;
  startTimer: (exerciseId?: string) => void;  // starts with override or default
  stopTimer: () => void;
  resetTimer: () => void;
}
```

---

## State Transitions

### Active Workout Set Row States

```
EMPTY (no input, no placeholder)
  │
  ├─ [previous session exists] → PLACEHOLDER (greyed-out weight + reps shown)
  │       │
  │       ├─ [user taps confirm] → CONFIRMED (set logged with placeholder values)
  │       └─ [user taps field]  → EDITING (field active, placeholder cleared)
  │
  └─ [no previous session] → EDITING (blank input fields)

EDITING
  └─ [valid input + confirm] → CONFIRMED (set logged with entered values)

CONFIRMED
  └─ [user taps edit] → EDITING (re-opens with current values)
```

### Rest Timer States

```
IDLE (not running)
  └─ [set confirmed] → COUNTING_DOWN (secondsRemaining = configured duration)

COUNTING_DOWN
  ├─ [secondsRemaining > 0, every 1s] → COUNTING_DOWN (decrement)
  ├─ [secondsRemaining = 0] → ALERTING (haptic + visual)
  └─ [user taps next set field] → IDLE (stopTimer called)

ALERTING
  └─ [1s elapsed or user taps] → IDLE
```

### Abort Workflow States

```
ACTIVE_WORKOUT
  └─ [user taps "Abort"] → ABORT_DIALOG

ABORT_DIALOG
  ├─ [Cancel] → ACTIVE_WORKOUT
  ├─ [Save as-is] → abortSession(id, autoComplete=false) → HOME
  └─ [Auto-complete remaining] → abortSession(id, autoComplete=true) → HOME
```

---

## Entities Reference (Existing — No Change)

| Entity | Key Fields | Relationship |
|--------|-----------|--------------|
| Workout | id, user_id, routine_id, started_at, ended_at | has many WorkoutSets |
| WorkoutSet | id, workout_id, exercise_id, set_number, weight_kg, reps, completed | belongs to Workout + Exercise |
| Exercise | id, user_id, name, category | referenced by WorkoutSet, RoutineExercise |
| Routine | id, user_id, name | has many RoutineExercises |
| RoutineExercise | routine_id, exercise_id, order_index | join table |
| UserPreferences | user_id (PK), rest_timer_seconds, rest_timer_enabled | NEW — one per user |
