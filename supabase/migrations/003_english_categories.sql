-- Migration 003: translate exercise names and categories to English
-- Run in Supabase SQL Editor

BEGIN;

-- Drop old constraint if it still exists (safe to run even if already dropped)
ALTER TABLE pomp.exercises DROP CONSTRAINT IF EXISTS exercises_category_check;

-- Catch-all: translate any remaining Norwegian category values to English.
-- This covers all exercises regardless of name.
UPDATE pomp.exercises SET category = 'Back'      WHERE category = 'Rygg';
UPDATE pomp.exercises SET category = 'Chest'     WHERE category = 'Bryst';
UPDATE pomp.exercises SET category = 'Legs'      WHERE category = 'Ben';
UPDATE pomp.exercises SET category = 'Shoulders' WHERE category = 'Skuldre';
UPDATE pomp.exercises SET category = 'Core'      WHERE category = 'Magemuskler';

-- Translate Norwegian exercise names to English.
-- Each pair: delete the Norwegian row if the English name already exists for that user,
-- then rename any remaining Norwegian row.

-- Chest
DELETE FROM pomp.exercises WHERE name = 'Benkpress'             AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Bench press');
UPDATE pomp.exercises SET name = 'Bench press'             WHERE name = 'Benkpress';

DELETE FROM pomp.exercises WHERE name = 'Skrå benkpress'        AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Incline bench press');
UPDATE pomp.exercises SET name = 'Incline bench press'     WHERE name = 'Skrå benkpress';

DELETE FROM pomp.exercises WHERE name = 'Nedoverskrå benkpress' AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Decline bench press');
UPDATE pomp.exercises SET name = 'Decline bench press'     WHERE name = 'Nedoverskrå benkpress';

DELETE FROM pomp.exercises WHERE name = 'Hantelbenkpress'       AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Dumbbell bench press');
UPDATE pomp.exercises SET name = 'Dumbbell bench press'    WHERE name = 'Hantelbenkpress';

DELETE FROM pomp.exercises WHERE name = 'Kabelkryss'            AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Cable crossover');
UPDATE pomp.exercises SET name = 'Cable crossover'         WHERE name = 'Kabelkryss';

DELETE FROM pomp.exercises WHERE name = 'Brystpress maskin'     AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Chest press machine');
UPDATE pomp.exercises SET name = 'Chest press machine'     WHERE name = 'Brystpress maskin';

-- Back
DELETE FROM pomp.exercises WHERE name = 'Markløft'              AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Deadlift');
UPDATE pomp.exercises SET name = 'Deadlift'                WHERE name = 'Markløft';

DELETE FROM pomp.exercises WHERE name = 'Nedtrekk bredt grep'   AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Wide-grip lat pulldown');
UPDATE pomp.exercises SET name = 'Wide-grip lat pulldown'  WHERE name = 'Nedtrekk bredt grep';

DELETE FROM pomp.exercises WHERE name = 'Nedtrekk smalt grep'   AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Close-grip lat pulldown');
UPDATE pomp.exercises SET name = 'Close-grip lat pulldown' WHERE name = 'Nedtrekk smalt grep';

DELETE FROM pomp.exercises WHERE name = 'Sittende roing kabel'  AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Seated cable row');
UPDATE pomp.exercises SET name = 'Seated cable row'        WHERE name = 'Sittende roing kabel';

DELETE FROM pomp.exercises WHERE name = 'Roing med stang'       AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Barbell row');
UPDATE pomp.exercises SET name = 'Barbell row'             WHERE name = 'Roing med stang';

DELETE FROM pomp.exercises WHERE name = 'Ettarms hantelroing'   AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Single-arm dumbbell row');
UPDATE pomp.exercises SET name = 'Single-arm dumbbell row' WHERE name = 'Ettarms hantelroing';

DELETE FROM pomp.exercises WHERE name = 'Rygghev (hyperextension)' AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Back extension (hyperextension)');
UPDATE pomp.exercises SET name = 'Back extension (hyperextension)' WHERE name = 'Rygghev (hyperextension)';

-- Legs
DELETE FROM pomp.exercises WHERE name = 'Knebøy'                AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Squat');
UPDATE pomp.exercises SET name = 'Squat'                   WHERE name = 'Knebøy';

DELETE FROM pomp.exercises WHERE name = 'Frontknebøy'           AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Front squat');
UPDATE pomp.exercises SET name = 'Front squat'             WHERE name = 'Frontknebøy';

DELETE FROM pomp.exercises WHERE name = 'Beinpress'             AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Leg press');
UPDATE pomp.exercises SET name = 'Leg press'               WHERE name = 'Beinpress';

DELETE FROM pomp.exercises WHERE name = 'Utfall'                AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Lunges');
UPDATE pomp.exercises SET name = 'Lunges'                  WHERE name = 'Utfall';

DELETE FROM pomp.exercises WHERE name = 'Bulgarsk splittknebøy' AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Bulgarian split squat');
UPDATE pomp.exercises SET name = 'Bulgarian split squat'   WHERE name = 'Bulgarsk splittknebøy';

DELETE FROM pomp.exercises WHERE name = 'Stiv markløft'         AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Romanian deadlift');
UPDATE pomp.exercises SET name = 'Romanian deadlift'       WHERE name = 'Stiv markløft';

DELETE FROM pomp.exercises WHERE name = 'Tåhev stående'         AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Standing calf raise');
UPDATE pomp.exercises SET name = 'Standing calf raise'     WHERE name = 'Tåhev stående';

DELETE FROM pomp.exercises WHERE name = 'Tåhev sittende'        AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Seated calf raise');
UPDATE pomp.exercises SET name = 'Seated calf raise'       WHERE name = 'Tåhev sittende';

-- Shoulders
DELETE FROM pomp.exercises WHERE name = 'Militærpress stang'    AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Barbell overhead press');
UPDATE pomp.exercises SET name = 'Barbell overhead press'  WHERE name = 'Militærpress stang';

DELETE FROM pomp.exercises WHERE name = 'Militærpress hantel'   AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Dumbbell overhead press');
UPDATE pomp.exercises SET name = 'Dumbbell overhead press' WHERE name = 'Militærpress hantel';

DELETE FROM pomp.exercises WHERE name = 'Sidehev'               AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Lateral raise');
UPDATE pomp.exercises SET name = 'Lateral raise'           WHERE name = 'Sidehev';

DELETE FROM pomp.exercises WHERE name = 'Fronthev'              AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Front raise');
UPDATE pomp.exercises SET name = 'Front raise'             WHERE name = 'Fronthev';

DELETE FROM pomp.exercises WHERE name = 'Bakdelt fugl'          AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Rear delt fly');
UPDATE pomp.exercises SET name = 'Rear delt fly'           WHERE name = 'Bakdelt fugl';

DELETE FROM pomp.exercises WHERE name = 'Skulderpress maskin'   AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Shoulder press machine');
UPDATE pomp.exercises SET name = 'Shoulder press machine'  WHERE name = 'Skulderpress maskin';

-- Biceps
DELETE FROM pomp.exercises WHERE name = 'Stangcurl'             AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Barbell curl');
UPDATE pomp.exercises SET name = 'Barbell curl'            WHERE name = 'Stangcurl';

DELETE FROM pomp.exercises WHERE name = 'Hantelcurl'            AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Dumbbell curl');
UPDATE pomp.exercises SET name = 'Dumbbell curl'           WHERE name = 'Hantelcurl';

DELETE FROM pomp.exercises WHERE name = 'Hammercurl'            AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Hammer curl');
UPDATE pomp.exercises SET name = 'Hammer curl'             WHERE name = 'Hammercurl';

DELETE FROM pomp.exercises WHERE name = 'Konsentrasjonscurl'    AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Concentration curl');
UPDATE pomp.exercises SET name = 'Concentration curl'      WHERE name = 'Konsentrasjonscurl';

DELETE FROM pomp.exercises WHERE name = 'Kabelbicepscurl'       AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Cable bicep curl');
UPDATE pomp.exercises SET name = 'Cable bicep curl'        WHERE name = 'Kabelbicepscurl';

-- Triceps
DELETE FROM pomp.exercises WHERE name = 'Triceps pushdown kabel' AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Cable tricep pushdown');
UPDATE pomp.exercises SET name = 'Cable tricep pushdown'   WHERE name = 'Triceps pushdown kabel';

DELETE FROM pomp.exercises WHERE name = 'Skulderpress med nakke' AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Behind-neck press');
UPDATE pomp.exercises SET name = 'Behind-neck press'       WHERE name = 'Skulderpress med nakke';

DELETE FROM pomp.exercises WHERE name = 'Franske press'         AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Skull crushers');
UPDATE pomp.exercises SET name = 'Skull crushers'          WHERE name = 'Franske press';

DELETE FROM pomp.exercises WHERE name = 'Close grip benkpress'  AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Close-grip bench press');
UPDATE pomp.exercises SET name = 'Close-grip bench press'  WHERE name = 'Close grip benkpress';

-- Core
DELETE FROM pomp.exercises WHERE name = 'Planke'                AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Plank');
UPDATE pomp.exercises SET name = 'Plank'                   WHERE name = 'Planke';

DELETE FROM pomp.exercises WHERE name = 'Situps'                AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Sit-ups');
UPDATE pomp.exercises SET name = 'Sit-ups'                 WHERE name = 'Situps';

DELETE FROM pomp.exercises WHERE name = 'Beinheving'            AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Leg raises');
UPDATE pomp.exercises SET name = 'Leg raises'              WHERE name = 'Beinheving';

DELETE FROM pomp.exercises WHERE name = 'Kabeltwist'            AND user_id IN (SELECT user_id FROM pomp.exercises WHERE name = 'Cable twist');
UPDATE pomp.exercises SET name = 'Cable twist'             WHERE name = 'Kabeltwist';

-- Safety net: any remaining rows with a category not in the English set
-- are remapped to 'Other' → which we temporarily hold in 'Back' here.
-- If you have custom categories you want to preserve, run this first to inspect:
--   SELECT DISTINCT category FROM pomp.exercises WHERE category NOT IN ('Back','Chest','Legs','Shoulders','Biceps','Triceps','Core');
UPDATE pomp.exercises
  SET category = 'Back'
  WHERE category NOT IN ('Back','Chest','Legs','Shoulders','Biceps','Triceps','Core');

-- Add new English-only constraint
ALTER TABLE pomp.exercises
  ADD CONSTRAINT exercises_category_check
  CHECK (category IN ('Back','Chest','Legs','Shoulders','Biceps','Triceps','Core'));

COMMIT;
