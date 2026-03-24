/**
 * Historical data importer — reads csv/data/rep_history.csv and upserts into Supabase.
 * Run AFTER Phase 9 is complete:  pnpm tsx scripts/import-csv.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS for bulk insert).
 * Remove the service role key from .env.local after import.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface CsvRow {
  Dato: string;
  Rutine: string;
  Øvelse: string;
  Kategori: string;
  Sett: string;
  Vekt: string;
  Reps: string;
  StartTid: string;
  SluttTid: string;
}

async function readCsv(filePath: string): Promise<CsvRow[]> {
  const rows: CsvRow[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    const cols = line.split(';');
    if (isFirst) {
      headers = cols;
      isFirst = false;
      continue;
    }
    if (cols.length < headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = cols[i]?.trim() ?? ''));
    rows.push(row as unknown as CsvRow);
  }

  return rows;
}

async function main(): Promise<void> {
  const csvPath = path.join(__dirname, '..', 'csv', 'data', 'rep_history.csv');
  console.log(`Reading CSV from: ${csvPath}`);
  const rows = await readCsv(csvPath);
  console.log(`Parsed ${rows.length} rows`);

  // Get authenticated user for user_id
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Could not get user — ensure service role key is set correctly');
    process.exit(1);
  }
  const userId = user.id;

  // Upsert exercises by (userId, name)
  const exerciseMap = new Map<string, string>(); // name -> id
  const uniqueExercises = [...new Set(rows.map((r) => JSON.stringify({ name: r['Øvelse'], category: r['Kategori'] })))]
    .map((s) => JSON.parse(s) as { name: string; category: string });

  for (const ex of uniqueExercises) {
    const { data, error } = await supabase
      .from('exercises')
      .upsert({ user_id: userId, name: ex.name, category: ex.category }, { onConflict: 'user_id,name' })
      .select('id, name')
      .single();
    if (error) console.error(`Exercise upsert error: ${ex.name}`, error.message);
    else if (data) exerciseMap.set(data.name, data.id);
  }
  console.log(`Upserted ${exerciseMap.size} exercises`);

  // Upsert routines by (userId, name)
  const routineMap = new Map<string, string>(); // name -> id
  const uniqueRoutines = [...new Set(rows.map((r) => r['Rutine']))];

  for (const routineName of uniqueRoutines) {
    const { data, error } = await supabase
      .from('routines')
      .upsert({ user_id: userId, name: routineName }, { onConflict: 'user_id,name' })
      .select('id, name')
      .single();
    if (error) console.error(`Routine upsert error: ${routineName}`, error.message);
    else if (data) routineMap.set(data.name, data.id);
  }
  console.log(`Upserted ${routineMap.size} routines`);

  // Group rows into workouts by (startedAt, endedAt, routineName)
  const workoutGroups = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const key = `${row['StartTid']}|${row['SluttTid']}|${row['Rutine']}`;
    if (!workoutGroups.has(key)) workoutGroups.set(key, []);
    workoutGroups.get(key)!.push(row);
  }
  console.log(`Found ${workoutGroups.size} unique workouts`);

  let workoutCount = 0;
  let setCount = 0;

  for (const [key, workoutRows] of workoutGroups) {
    const [startedAt, endedAt, routineName] = key.split('|');
    const routineId = routineMap.get(routineName);

    const { data: workout, error: wError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        routine_id: routineId ?? null,
        started_at: new Date(startedAt).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
      })
      .select('id')
      .single();

    if (wError || !workout) {
      console.error(`Workout insert error`, wError?.message);
      continue;
    }
    workoutCount++;

    // Group sets by exercise and derive set_number from row order
    const exerciseSets = new Map<string, number>();
    for (const row of workoutRows) {
      const exerciseName = row['Øvelse'];
      const exerciseId = exerciseMap.get(exerciseName);
      if (!exerciseId) continue;

      const setNumber = (exerciseSets.get(exerciseId) ?? 0) + 1;
      exerciseSets.set(exerciseId, setNumber);

      const { error: sError } = await supabase.from('workout_sets').insert({
        workout_id: workout.id,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight_kg: parseFloat(row['Vekt'].replace(',', '.')) || 0,
        reps: parseInt(row['Reps'], 10) || 1,
        completed: true,
      });

      if (sError) console.error(`Set insert error`, sError.message);
      else setCount++;
    }
  }

  console.log(`Import complete: ${workoutCount} workouts, ${setCount} sets`);
}

main().catch(console.error);
