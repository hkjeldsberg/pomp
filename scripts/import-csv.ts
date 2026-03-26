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
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'pomp' },
});

interface CsvRow {
  'Treningens start': string;
  'Treningens slutt': string;
  Øvelse: string;
  Kategori: string;
  Vekt: string;
  Repetisjoner: string;
  Navn: string; // routine name
  Notater: string;
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
    headers.forEach((h, i) => (row[h.trim()] = (cols[i]?.trim() ?? '').replace(/^"|"$/g, '')));
    rows.push(row as unknown as CsvRow);
  }

  return rows;
}

async function main(): Promise<void> {
  const csvPath = path.join(__dirname, '..', 'csv', 'data', 'rep_history.csv');
  console.log(`Reading CSV from: ${csvPath}`);
  const rows = await readCsv(csvPath);
  console.log(`Parsed ${rows.length} rows`);

  // List users via admin API (service role required)
  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers({ perPage: 1 });
  if (userError || !usersData?.users?.length) {
    console.error('Could not list users — ensure service role key is set correctly');
    process.exit(1);
  }
  const userId = usersData.users[0].id;
  console.log(`Importing as user: ${usersData.users[0].email}`);

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
    if (error) console.error(`Exercise upsert error: "${ex.name}"`, error.message);
    else if (data) exerciseMap.set(data.name, data.id);
  }
  console.log(`Upserted ${exerciseMap.size} exercises`);

  // Insert-or-select routines (no unique constraint — avoid duplicates via select first)
  const routineMap = new Map<string, string>(); // name -> id
  const uniqueRoutines = [...new Set(rows.map((r) => r['Navn']).filter(Boolean))];

  for (const routineName of uniqueRoutines) {
    const { data: existing } = await supabase
      .from('routines')
      .select('id, name')
      .eq('user_id', userId)
      .eq('name', routineName)
      .maybeSingle();
    if (existing) {
      routineMap.set(existing.name, existing.id);
      continue;
    }
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, name: routineName })
      .select('id, name')
      .single();
    if (error) console.error(`Routine insert error: "${routineName}"`, error.message);
    else if (data) routineMap.set(data.name, data.id);
  }
  console.log(`Upserted ${routineMap.size} routines`);

  // Group rows into workouts by (startedAt, endedAt, routineName)
  const workoutGroups = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const key = `${row['Treningens start']}|${row['Treningens slutt']}|${row['Navn']}`;
    if (!workoutGroups.has(key)) workoutGroups.set(key, []);
    workoutGroups.get(key)!.push(row);
  }
  console.log(`Found ${workoutGroups.size} unique workouts`);

  let workoutCount = 0;
  let setCount = 0;
  const total = workoutGroups.size;

  const parseDate = (s: string): Date => new Date(s.replace(' ', 'T') + ':00');

  for (const [key, workoutRows] of workoutGroups) {
    const [startedAt, endedAt, routineName] = key.split('|');
    const routineId = routineMap.get(routineName);

    const startDate = parseDate(startedAt);
    let endDate = parseDate(endedAt);
    if (endDate <= startDate) endDate = new Date(startDate.getTime() + 60000);

    const { data: workout, error: wError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        routine_id: routineId ?? null,
        started_at: startDate.toISOString(),
        ended_at: endDate.toISOString(),
      })
      .select('id')
      .single();

    if (wError || !workout) {
      console.error(`Workout insert error`, wError?.message);
      continue;
    }
    workoutCount++;
    process.stdout.write(`\rInserting workouts: ${workoutCount}/${total}`);

    // Build all sets for this workout and insert in one batch
    const exerciseSets = new Map<string, number>();
    const setsToInsert: object[] = [];
    for (const row of workoutRows) {
      const exerciseName = row['Øvelse'];
      const exerciseId = exerciseMap.get(exerciseName);
      if (!exerciseId) continue;

      const setNumber = (exerciseSets.get(exerciseId) ?? 0) + 1;
      exerciseSets.set(exerciseId, setNumber);

      setsToInsert.push({
        workout_id: workout.id,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight_kg: parseFloat(row['Vekt'].replace(',', '.')) || 0,
        reps: parseInt(row['Repetisjoner'], 10) || 1,
        completed: true,
      });
    }
    if (setsToInsert.length > 0) {
      const { error: sError } = await supabase.from('workout_sets').insert(setsToInsert);
      if (sError) console.error(`Sets insert error for workout ${workout.id}`, sError.message);
      else setCount += setsToInsert.length;
    }
  }

  console.log(`\nImport complete: ${workoutCount} workouts, ${setCount} sets`);
}

main().catch(console.error);
