# Contract: Supabase Query Definitions

**Branch**: `001-workout-log` | **Date**: 2026-03-24
**All queries in**: `lib/db/` | **All queries target**: schema `pomp`

---

## lib/db/exercises.ts

### `getExercises(userId: string): Promise<Exercise[]>`
Fetches all exercises for the user, ordered by category then name.
```
SELECT * FROM pomp.exercises
WHERE user_id = auth.uid()
ORDER BY category, name
```

### `createExercise(data: { name, category }): Promise<Exercise>`
Inserts a new exercise. Throws on duplicate name (unique constraint).
```
INSERT INTO pomp.exercises (user_id, name, category)
VALUES (auth.uid(), $name, $category)
RETURNING *
```

---

## lib/db/routines.ts

### `getRoutines(): Promise<RoutineWithExercises[]>`
Fetches all routines with their exercises (ordered).
```
SELECT r.*,
  json_agg(
    json_build_object('exercise', e.*, 'order_index', re.order_index)
    ORDER BY re.order_index
  ) AS exercises
FROM pomp.routines r
LEFT JOIN pomp.routine_exercises re ON re.routine_id = r.id
LEFT JOIN pomp.exercises e ON e.id = re.exercise_id
WHERE r.user_id = auth.uid()
GROUP BY r.id
ORDER BY r.created_at DESC
```

### `createRoutine(data: { name, exerciseIds: string[] }): Promise<Routine>`
Creates routine + inserts routine_exercises in order.

### `updateRoutine(id, data: { name?, exerciseIds? }): Promise<Routine>`
Updates name and/or replaces exercises (delete + re-insert routine_exercises).

### `deleteRoutine(id: string): Promise<void>`
Deletes routine; cascade removes routine_exercises; workouts retain routine_id reference
which goes to NULL via SET NULL.

---

## lib/db/workouts.ts

### `getOpenWorkout(): Promise<Workout | null>`
Checks for an in-progress session (used on app boot for resume).
```
SELECT * FROM pomp.workouts
WHERE user_id = auth.uid() AND ended_at IS NULL
LIMIT 1
```

### `createWorkout(data: { routineId?: string }): Promise<Workout>`
Creates a new session. Must first verify no open session exists.
```
INSERT INTO pomp.workouts (user_id, routine_id)
VALUES (auth.uid(), $routineId)
RETURNING *
```

### `endWorkout(id: string): Promise<Workout>`
Sets ended_at to now().
```
UPDATE pomp.workouts
SET ended_at = now()
WHERE id = $id AND user_id = auth.uid()
RETURNING *
```

### `getWorkoutHistory(): Promise<WorkoutSummary[]>`
Returns completed sessions newest-first with aggregate set count.
```
SELECT w.*, r.name AS routine_name,
  COUNT(ws.id) AS set_count,
  EXTRACT(EPOCH FROM (w.ended_at - w.started_at))/60 AS duration_minutes
FROM pomp.workouts w
LEFT JOIN pomp.routines r ON r.id = w.routine_id
LEFT JOIN pomp.workout_sets ws ON ws.workout_id = w.id
WHERE w.user_id = auth.uid() AND w.ended_at IS NOT NULL
GROUP BY w.id, r.name
ORDER BY w.started_at DESC
```

### `getWorkoutDetail(id: string): Promise<WorkoutDetail>`
Full session detail with all exercises and sets.
```
SELECT w.*,
  json_agg(DISTINCT jsonb_build_object(
    'exercise', row_to_json(e),
    'sets', (
      SELECT json_agg(row_to_json(ws2) ORDER BY ws2.set_number)
      FROM pomp.workout_sets ws2
      WHERE ws2.workout_id = w.id AND ws2.exercise_id = e.id
    )
  )) AS exercises
FROM pomp.workouts w
JOIN pomp.workout_sets ws ON ws.workout_id = w.id
JOIN pomp.exercises e ON e.id = ws.exercise_id
WHERE w.id = $id AND w.user_id = auth.uid()
GROUP BY w.id
```

### `getPreviousSessionSets(routineId: string, exerciseId: string): Promise<SetSummary | null>`
Fetches the previous session reference for a given routine + exercise (for the dimmed
reference row in the active session screen).
```
SELECT weight_kg, reps, COUNT(*) AS set_count
FROM pomp.workout_sets ws
JOIN pomp.workouts w ON w.id = ws.workout_id
WHERE w.routine_id = $routineId
  AND ws.exercise_id = $exerciseId
  AND w.user_id = auth.uid()
  AND w.ended_at IS NOT NULL
ORDER BY w.started_at DESC
LIMIT 1
-- Returns the last set logged for this exercise in the most recent completed session
-- of this routine. Caller groups by set_number to get full set list.
```

---

## lib/db/sets.ts

### `logSet(data: { workoutId, exerciseId, setNumber, weightKg, reps, note? }): Promise<WorkoutSet>`
Inserts a new set. Called after optimistic UI update.
```
INSERT INTO pomp.workout_sets
  (workout_id, exercise_id, set_number, weight_kg, reps, note)
VALUES ($workoutId, $exerciseId, $setNumber, $weightKg, $reps, $note)
RETURNING *
```

### `updateSet(id: string, data: Partial<{ weightKg, reps, note, completed }>): Promise<WorkoutSet>`
Updates an existing set (e.g., toggling completed, editing weight/reps).
```
UPDATE pomp.workout_sets
SET weight_kg = $weightKg, reps = $reps, note = $note, completed = $completed
WHERE id = $id AND workout_id IN (
  SELECT id FROM pomp.workouts WHERE user_id = auth.uid()
)
RETURNING *
```

### `deleteSet(id: string): Promise<void>`
Removes a set (swipe-to-delete or long-press in active session).

---

## lib/db/statistics.ts

### `getAggregateStats(): Promise<AggregateStats>`
Returns total sessions, sets, reps, volume across all completed workouts.
```
SELECT
  COUNT(DISTINCT w.id)   AS total_sessions,
  COUNT(ws.id)           AS total_sets,
  SUM(ws.reps)           AS total_reps,
  SUM(ws.weight_kg * ws.reps) AS total_volume_kg
FROM pomp.workouts w
JOIN pomp.workout_sets ws ON ws.workout_id = w.id
WHERE w.user_id = auth.uid() AND w.ended_at IS NOT NULL
```

### `getSessionDurations(): Promise<DurationPoint[]>`
Returns `{ date, durationMinutes }` per completed session for the duration chart.
```
SELECT
  started_at::date AS date,
  EXTRACT(EPOCH FROM (ended_at - started_at))/60 AS duration_minutes
FROM pomp.workouts
WHERE user_id = auth.uid() AND ended_at IS NOT NULL
ORDER BY started_at ASC
```

### `getSessionVolumes(): Promise<VolumePoint[]>`
Returns `{ date, volumeKg }` per completed session for the volume chart.
```
SELECT
  w.started_at::date AS date,
  SUM(ws.weight_kg * ws.reps) AS volume_kg
FROM pomp.workouts w
JOIN pomp.workout_sets ws ON ws.workout_id = w.id
WHERE w.user_id = auth.uid() AND w.ended_at IS NOT NULL
GROUP BY w.id, w.started_at
ORDER BY w.started_at ASC
```

### `getExerciseProgression(exerciseId: string): Promise<ProgressionPoint[]>`
Returns `{ date, maxWeightKg, estimated1rm }` per session for the exercise progression chart.
Estimated 1RM uses Epley: `weight_kg × (1 + reps / 30)`.
```
SELECT
  w.started_at::date AS date,
  MAX(ws.weight_kg) AS max_weight_kg,
  MAX(ws.weight_kg * (1 + ws.reps / 30.0)) AS estimated_1rm
FROM pomp.workouts w
JOIN pomp.workout_sets ws ON ws.workout_id = w.id
WHERE w.user_id = auth.uid()
  AND ws.exercise_id = $exerciseId
  AND w.ended_at IS NOT NULL
GROUP BY w.id, w.started_at
ORDER BY w.started_at ASC
```

### `getLatestExerciseSets(exerciseId: string): Promise<WorkoutSet[]>`
Returns sets from the most recent completed session containing this exercise
(for the "last time" reps display).
```
SELECT ws.*
FROM pomp.workout_sets ws
JOIN pomp.workouts w ON w.id = ws.workout_id
WHERE w.user_id = auth.uid()
  AND ws.exercise_id = $exerciseId
  AND w.ended_at IS NOT NULL
ORDER BY w.started_at DESC, ws.set_number ASC
LIMIT 10
-- Only the most recent session's sets
```
