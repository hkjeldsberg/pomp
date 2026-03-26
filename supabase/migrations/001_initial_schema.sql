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
ALTER TABLE pomp.exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.routines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.workouts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomp.workout_sets      ENABLE ROW LEVEL SECURITY;

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

-- Indexes
CREATE INDEX idx_workouts_user_id        ON pomp.workouts(user_id);
CREATE INDEX idx_workouts_open           ON pomp.workouts(user_id) WHERE ended_at IS NULL;
CREATE INDEX idx_workout_sets_workout_id ON pomp.workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise   ON pomp.workout_sets(exercise_id);
CREATE INDEX idx_exercises_user_id       ON pomp.exercises(user_id);
CREATE INDEX idx_routines_user_id        ON pomp.routines(user_id);
