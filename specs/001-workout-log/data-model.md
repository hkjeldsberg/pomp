# Data Model: Pomp — Gym Workout Tracker (v1)

**Branch**: `001-workout-log` | **Date**: 2026-03-24
**Schema**: `pomp` (all tables)

---

## Entity Overview

```
User (Supabase Auth)
 │
 ├── Exercise (n) ─────────────────┐
 │                                 │
 ├── Routine (n)                   │
 │    └── RoutineExercise (n) ─────┤ references Exercise
 │                                 │
 └── Workout/Session (n)           │
      └── WorkoutSet (n) ──────────┘ references Exercise
```

---

## Tables

### `pomp.exercises`

Represents a named exercise owned by a user.

| Column       | Type                        | Constraints                          |
|---|---|---|
| `id`         | `uuid`                      | PK, default `gen_random_uuid()`      |
| `user_id`    | `uuid`                      | NOT NULL, FK → `auth.users(id)`      |
| `name`       | `text`                      | NOT NULL                             |
| `category`   | `text`                      | NOT NULL, CHECK (see categories)     |
| `created_at` | `timestamptz`               | NOT NULL, default `now()`            |

**Unique constraint**: `(user_id, name)` — exercise names MUST be unique per user (FR-007).

**Valid categories** (Norwegian, matching CSV `Kategori` field):
`Rygg`, `Bryst`, `Ben`, `Skuldre`, `Biceps`, `Triceps`, `Magemuskler`

**Validation rules**:
- `name` MUST be non-empty (min 1 char, max 100 chars)
- `category` MUST be one of the valid categories above

**RLS policy**: `user_id = auth.uid()`

---

### `pomp.routines`

A named, ordered template of exercises used to start workout sessions.

| Column       | Type          | Constraints                          |
|---|---|---|
| `id`         | `uuid`        | PK, default `gen_random_uuid()`      |
| `user_id`    | `uuid`        | NOT NULL, FK → `auth.users(id)`      |
| `name`       | `text`        | NOT NULL                             |
| `created_at` | `timestamptz` | NOT NULL, default `now()`            |

**Validation rules**:
- `name` MUST be non-empty (min 1 char, max 100 chars)

**RLS policy**: `user_id = auth.uid()`

---

### `pomp.routine_exercises`

Join table linking routines to exercises with ordering.

| Column        | Type      | Constraints                              |
|---|---|---|
| `id`          | `uuid`    | PK, default `gen_random_uuid()`          |
| `routine_id`  | `uuid`    | NOT NULL, FK → `pomp.routines(id)` CASCADE DELETE |
| `exercise_id` | `uuid`    | NOT NULL, FK → `pomp.exercises(id)`      |
| `order_index` | `integer` | NOT NULL, ≥ 0                            |

**Unique constraint**: `(routine_id, order_index)` — no two exercises share the same position.

**Validation rules**:
- `order_index` MUST be ≥ 0
- Deleting a routine cascades — all routine_exercises are removed

**RLS policy**: Inherited via join to `routines` — `routine_id IN (SELECT id FROM pomp.routines WHERE user_id = auth.uid())`

---

### `pomp.workouts`

A single workout session (in-progress or completed).

| Column       | Type          | Constraints                              |
|---|---|---|
| `id`         | `uuid`        | PK, default `gen_random_uuid()`          |
| `user_id`    | `uuid`        | NOT NULL, FK → `auth.users(id)`          |
| `routine_id` | `uuid`        | NULLABLE, FK → `pomp.routines(id)` SET NULL ON DELETE |
| `started_at` | `timestamptz` | NOT NULL, default `now()`                |
| `ended_at`   | `timestamptz` | NULLABLE — NULL means session in-progress |
| `note`       | `text`        | NULLABLE                                 |

**Session state**:
- `ended_at IS NULL` → session in progress (at most one per user at a time)
- `ended_at IS NOT NULL` → session completed

**Constraint**: Only one active session per user at a time — enforced by application logic
in `lib/db/workouts.ts` (query for open session before creating a new one).

**Validation rules**:
- `ended_at` MUST be ≥ `started_at` when set
- `ended_at` set only when the user explicitly ends the session

**RLS policy**: `user_id = auth.uid()`

---

### `pomp.workout_sets`

An individual logged set within a workout session.

| Column        | Type          | Constraints                                        |
|---|---|---|
| `id`          | `uuid`        | PK, default `gen_random_uuid()`                    |
| `workout_id`  | `uuid`        | NOT NULL, FK → `pomp.workouts(id)` CASCADE DELETE  |
| `exercise_id` | `uuid`        | NOT NULL, FK → `pomp.exercises(id)`                |
| `set_number`  | `integer`     | NOT NULL, ≥ 1 — ordinal position within exercise in session |
| `weight_kg`   | `numeric(6,2)`| NOT NULL, ≥ 0                                      |
| `reps`        | `integer`     | NOT NULL, ≥ 1                                      |
| `note`        | `text`        | NULLABLE                                           |
| `completed`   | `boolean`     | NOT NULL, default `false`                          |
| `logged_at`   | `timestamptz` | NOT NULL, default `now()`                          |

**Validation rules**:
- `weight_kg` MUST be ≥ 0 (bodyweight exercises may be 0 kg)
- `reps` MUST be ≥ 1
- `set_number` MUST be ≥ 1; derived from existing set count for that `(workout_id, exercise_id)` + 1

**RLS policy**: Inherited via `workout_id IN (SELECT id FROM pomp.workouts WHERE user_id = auth.uid())`

---

## Derived Calculations (application layer, not stored)

### Estimated 1RM — Epley Formula

Applied per set where `reps >= 1`:

```
1RM = weight_kg × (1 + reps / 30)
```

Displayed as the highest 1RM across all sets in a session for a given exercise.
Implemented in `lib/calculations.ts → estimatedOneRM(weightKg, reps)`.

### Session Volume

```
volume = Σ (weight_kg × reps) for all sets in a workout
```

Implemented in `lib/calculations.ts → sessionVolume(sets)`.

### Session Duration

```
duration_minutes = (ended_at - started_at) in minutes
```

Computed from `workouts.started_at` and `workouts.ended_at`.

---

## State Transitions

### Workout Session Lifecycle

```
[Not started]
     │
     ▼ user taps "Start" (routine or ad-hoc)
[In progress]  ← ended_at IS NULL
     │   └── sets are logged (workout_sets rows inserted)
     │   └── sets are marked complete (completed = true)
     │
     ▼ user taps "End session"
[Completed]    ← ended_at IS NOT NULL
```

### Set Lifecycle

```
[Pending]   ← completed = false (default)
     │
     ▼ user taps checkmark
[Completed] ← completed = true
```

Note: Sets can be un-completed in v1 (toggle back to pending) — UI decision for
active session screen.

---

## Indexes (recommended)

```sql
CREATE INDEX idx_workouts_user_id        ON pomp.workouts(user_id);
CREATE INDEX idx_workouts_open           ON pomp.workouts(user_id) WHERE ended_at IS NULL;
CREATE INDEX idx_workout_sets_workout_id ON pomp.workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise   ON pomp.workout_sets(exercise_id);
CREATE INDEX idx_exercises_user_id       ON pomp.exercises(user_id);
CREATE INDEX idx_routines_user_id        ON pomp.routines(user_id);
```

---

## SQL Migration Skeleton

```sql
-- Migration 001: initial schema
-- Run in Supabase SQL Editor or via supabase/migrations/

CREATE SCHEMA IF NOT EXISTS pomp;

-- exercises
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

-- routines
CREATE TABLE pomp.routines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- routine_exercises
CREATE TABLE pomp.routine_exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   uuid NOT NULL REFERENCES pomp.routines(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES pomp.exercises(id) ON DELETE RESTRICT,
  order_index  integer NOT NULL CHECK (order_index >= 0),
  UNIQUE (routine_id, order_index)
);

-- workouts
CREATE TABLE pomp.workouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id  uuid REFERENCES pomp.routines(id) ON DELETE SET NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  note        text,
  CONSTRAINT ended_after_started CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- workout_sets
CREATE TABLE pomp.workout_sets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id   uuid NOT NULL REFERENCES pomp.workouts(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES pomp.exercises(id) ON DELETE RESTRICT,
  set_number   integer NOT NULL CHECK (set_number >= 1),
  weight_kg    numeric(6,2) NOT NULL CHECK (weight_kg >= 0),
  reps         integer NOT NULL CHECK (reps >= 1),
  note         text,
  completed    boolean NOT NULL DEFAULT false,
  logged_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE pomp.exercises       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.routines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.workouts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.workout_sets    ENABLE ROW LEVEL SECURITY;

-- Policies (select + insert + update + delete for owner)
-- exercises
CREATE POLICY "owner" ON pomp.exercises
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- routines
CREATE POLICY "owner" ON pomp.routines
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- routine_exercises (via routine ownership)
CREATE POLICY "owner" ON pomp.routine_exercises
  USING (routine_id IN (
    SELECT id FROM pomp.routines WHERE user_id = auth.uid()
  ))
  WITH CHECK (routine_id IN (
    SELECT id FROM pomp.routines WHERE user_id = auth.uid()
  ));

-- workouts
CREATE POLICY "owner" ON pomp.workouts
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- workout_sets (via workout ownership)
CREATE POLICY "owner" ON pomp.workout_sets
  USING (workout_id IN (
    SELECT id FROM pomp.workouts WHERE user_id = auth.uid()
  ))
  WITH CHECK (workout_id IN (
    SELECT id FROM pomp.workouts WHERE user_id = auth.uid()
  ));
```
