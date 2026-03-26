-- Migration 004: delete all routines except the three named ones
-- Run in Supabase SQL Editor

BEGIN;

-- Delete routine_exercises for routines being removed (safe even with CASCADE)
DELETE FROM pomp.routine_exercises
WHERE routine_id IN (
  SELECT id FROM pomp.routines
  WHERE name NOT IN ('A: Back & Bi', 'B: Legs & Shoulders', 'C: Shoulders & Tri')
);

-- Delete the routines themselves
DELETE FROM pomp.routines
WHERE name NOT IN ('A: Back & Bi', 'B: Legs & Shoulders', 'C: Shoulders & Tri');

COMMIT;
