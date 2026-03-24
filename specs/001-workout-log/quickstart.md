# Quickstart: Pomp — Gym Workout Tracker (v1)

**Branch**: `001-workout-log` | **Date**: 2026-03-24

---

## Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+: `npm install -g pnpm`
- Expo CLI: `pnpm add -g expo-cli eas-cli`
- Xcode 15+ (for iOS Simulator)
- Supabase account + project (free tier sufficient)
- Supabase CLI: `brew install supabase/tap/supabase`

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd pmp
pnpm install
```

`.npmrc` (already committed — required for Expo + pnpm):
```ini
node-linker=hoisted
shamefully-hoist=true
```

---

## 2. Supabase Setup

### 2a. Create project

Create a new Supabase project at supabase.com. Note:
- **Project URL** (e.g., `https://xxxx.supabase.co`)
- **Anon key** (safe for client)
- **Service role key** (used only for the one-off CSV import)

### 2b. Run migration

In Supabase SQL Editor, paste and run the full SQL from:
```
specs/001-workout-log/data-model.md → SQL Migration Skeleton section
```

This creates:
- Schema `pomp`
- Tables: `exercises`, `routines`, `routine_exercises`, `workouts`, `workout_sets`
- RLS policies for all tables
- Recommended indexes

### 2c. Generate types

```bash
supabase gen types typescript \
  --project-id <your-project-id> \
  --schema pomp \
  > supabase/types.ts
```

This creates the strongly-typed DB client. Regenerate whenever the schema changes.

---

## 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Never commit `.env.local`** — it is in `.gitignore`.

---

## 4. Import Historical Data (one-off)

The CSV file at `csv/data/rep_history.csv` contains ~3,646 rows of historical workout data.

```bash
# Add service role key to .env.local (temporary, for import only)
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

pnpm tsx scripts/import-csv.ts
```

The script will:
1. Parse `csv/data/rep_history.csv` (semicolon-delimited, UTF-8)
2. Upsert exercises by `(user_id, name)`
3. Upsert routines by `(user_id, name)`
4. Insert workouts grouped by `(started_at, ended_at, routine_name)`
5. Insert workout_sets with `set_number` derived from row order within each workout+exercise

After import, remove the `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`.

---

## 5. Start Development Server

```bash
pnpm expo start
```

- Press `i` to open iOS Simulator
- Or scan QR code with Expo Go on a physical device

---

## 6. Key Development Commands

| Command | Description |
|---|---|
| `pnpm expo start` | Start dev server |
| `pnpm expo start --clear` | Start with cleared Metro cache |
| `pnpm tsc --noEmit` | TypeScript strict check (must pass) |
| `pnpm test` | Run Jest unit tests |
| `pnpm tsx scripts/import-csv.ts` | Run one-off CSV import |
| `supabase gen types typescript ...` | Regenerate DB types |
| `eas build --platform ios --profile preview` | EAS TestFlight build |

---

## 7. Project Layout Cheatsheet

```
app/              → Expo Router screens (no business logic)
components/       → Shared UI components
lib/calculations  → Epley 1RM, volume helpers
lib/db/           → All Supabase queries (one file per entity)
lib/hooks/        → React hooks (useActiveWorkout, etc.)
supabase/types.ts → Generated DB types
scripts/          → Dev-only scripts (import-csv.ts)
csv/data/         → Source historical data
```

---

## 8. Validation Checklist

Before marking any user story done:

- [ ] `pnpm tsc --noEmit` passes with zero errors
- [ ] No file in `app/`, `components/`, or `lib/` exceeds 300 lines
- [ ] Active session set logging tested: set appears instantly (< 100ms perception)
- [ ] All buttons/interactive elements have `minHeight: 44, minWidth: 44`
- [ ] Screen tested on iPhone SE (375pt) and iPhone 15 Pro Max (430pt) in Simulator
- [ ] Dark theme: no grey-on-grey text combinations
- [ ] Supabase write failures show error feedback (no silent failures)

---

## 9. EAS Build (TestFlight)

```bash
eas login
eas build:configure   # first time only
eas build --platform ios --profile preview
```

EAS will read `.npmrc` from the repo for pnpm compatibility.
Secrets (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) must be added to
EAS Secrets in the Expo dashboard (not committed to repo).
