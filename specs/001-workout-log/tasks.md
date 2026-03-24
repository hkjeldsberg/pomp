---
description: "Task list for Pomp — Gym Workout Tracker (v1)"
---

# Tasks: Pomp — Gym Workout Tracker (v1)

**Input**: Design documents from `specs/001-workout-log/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Component-level tests are REQUIRED for all interactive UI elements (constitution
Principle VI). Integration tests are REQUIRED for auth, active session, set logging, and
end-session flows. Write tests BEFORE implementation (TDD) — ensure they FAIL first.

**Organization**: Tasks grouped by user story for independent implementation and delivery.

**Note on phase order**: US4 (Exercise Library) is implemented in Phase 5 before US3
(Routines) in Phase 6, because exercises are a prerequisite for building routines.
Story labels remain US3/US4 as defined in spec.md.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Parallelizable — different files, no unresolved dependencies
- **[Story]**: Traceability to spec user stories (US1–US6)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Expo project and configure all tools before any feature work.

- [x] T001 Create Expo SDK 52 project with Expo Router v4 at repo root using `pnpm create expo-app . --template tabs`; verify `app/` directory and `package.json` exist
- [x] T002 Configure `package.json` — set `"packageManager": "pnpm@9.4.0"` for EAS Build corepack; add `pnpm test` script pointing to jest
- [x] T003 Create `.npmrc` at repo root with `node-linker=hoisted` and `shamefully-hoist=true` (required for Metro + pnpm compatibility)
- [x] T004 [P] Configure `tsconfig.json` — set `"strict": true`, add `"nativewind-env.d.ts"` to `include` array, ensure `"moduleResolution": "bundler"`
- [x] T005 [P] Configure NativeWind v4: install `nativewind` and `tailwindcss@^3.4`; create `global.css` (`@tailwind base/components/utilities`); create `tailwind.config.js` with Midnight Teal color tokens and `presets: [require('nativewind/preset')]`; update `metro.config.js` with `withNativeWind({ input: './global.css' })`; update `babel.config.js` to use `jsxImportSource: 'nativewind'` on `babel-preset-expo` (NOT `nativewind/babel`); create `nativewind-env.d.ts` with `/// <reference types="nativewind/types" />`
- [x] T006 [P] Create `lib/supabase.ts` — Supabase JS v2 client using `process.env.EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; create `.env.example` with placeholder values; add `.env.local` to `.gitignore`
- [x] T007 [P] Configure Jest: install `@testing-library/react-native` and `jest-expo`; create `jest.config.js` with `preset: 'jest-expo'` and `transformIgnorePatterns` for `node_modules` (include victory-native and react-native-skia)
- [x] T008 [P] Install `victory-native`, `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-gesture-handler` via `npx expo install`; verify `react-native-reanimated/plugin` is the last entry in `babel.config.js` plugins array
- [x] T009 Create `scripts/import-csv.ts` — reads `csv/data/rep_history.csv` (semicolon-delimited, UTF-8); upserts `pomp.exercises` by `(userId, name)`; upserts `pomp.routines` by `(userId, name)`; groups rows into `pomp.workouts` by `(startedAt, endedAt, routineName)`; inserts `pomp.workout_sets` with `set_number` derived from row order per `(workoutId, exerciseId)`; ignores `Kcal`, `Avstand`, `Varighet`, `Kroppsvekt` columns; uses `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` (bypasses RLS for bulk insert)
  > **Note**: This task only CREATES the script. Running it is deferred to the post-build
  > step after Phase 9 — see "Phase 10: Historical Data Import" below.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, generated types, root navigation skeleton, and shared
UI components. NO user story work begins until this phase is complete.

**⚠️ CRITICAL**: All downstream phases depend on `supabase/types.ts` existing (T011)
and shared UI components being available (T012–T017).

- [x] T010 Create `supabase/migrations/001_initial_schema.sql` — full SQL from `specs/001-workout-log/data-model.md` Migration Skeleton section (schema `pomp`; tables: exercises, routines, routine_exercises, workouts, workout_sets; CHECK constraints; RLS policies; indexes); run in Supabase SQL Editor to apply
- [x] T011 Generate `supabase/types.ts` — run `supabase gen types typescript --project-id <id> --schema pomp > supabase/types.ts`; verify the file exports a `Database` type with `pomp` schema tables
- [x] T012 Create `app/_layout.tsx` — import `../global.css` as first import; add `<Stack>` with Supabase `onAuthStateChange` listener; redirect unauthenticated users to `/(auth)/sign-in`; check for open workout (`getOpenWorkout`) and redirect to `/workout/[id]` if found; wrap with NativeWind dark class provider
- [x] T013 Create `app/(tabs)/_layout.tsx` — 4 tabs (Logg `list.bullet`, Rutiner `rectangle.stack`, Statistikk `chart.line.uptrend.xyaxis`, Profil `person.circle`); tabBarActiveTintColor `#20D2AA`, tabBarInactiveTintColor `#5DCAA5`, tabBarStyle background `#0D1F1D`, borderTopColor `rgba(32,210,170,0.15)`
- [x] T014 Create placeholder screens `app/(tabs)/index.tsx`, `app/(tabs)/routines.tsx`, `app/(tabs)/statistics.tsx`, `app/(tabs)/profile.tsx` — each renders a single `<Text>` with the screen name; placeholders are replaced in US phases
- [x] T015 [P] Component test for `components/ui/Button.tsx` in `components/ui/__tests__/Button.test.tsx` — WRITE FIRST: (1) renders label text, (2) `onPress` fires when pressed, (3) `onPress` does not fire when `disabled`, (4) primary and secondary variants render without crashing
- [x] T016 [P] Component test for `components/ui/Input.tsx` in `components/ui/__tests__/Input.test.tsx` — WRITE FIRST: (1) renders `value` prop, (2) `onChangeText` fires with new text, (3) `errorText` renders below input when provided, (4) input is focusable
- [x] T017 [P] Create `components/ui/Button.tsx` — `primary` (bg `#20D2AA`, text `#0A1F1C`) and `secondary` (transparent, teal border) variants; `minHeight: 52`; `minWidth: 44`; `borderRadius: 12`; explicit `(props: ButtonProps): React.JSX.Element` return type
- [x] T018 [P] Create `components/ui/Card.tsx` — background `#112826`; border `1px rgba(32,210,170,0.15)`; borderRadius 14; accepts `style` and `children` props; explicit return type
- [x] T019 [P] Create `components/ui/Input.tsx` — controlled; dark background `#0D1F1D`; text `#E0F5F0`; placeholder color `#5DCAA5`; optional `errorText: string` prop renders inline error in accent-muted; minHeight 44
- [x] T020 [P] Create `components/ui/EmptyState.tsx` — `iconName` (SF Symbol), `title`, optional `subtitle`, optional `action: { label, onPress }` props; renders vertically centered with Card background
- [x] T021 [P] Unit tests for `lib/calculations.ts` in `lib/__tests__/calculations.test.ts` — WRITE FIRST: Epley 1RM at 1/5/10/30 reps, 1RM at 0 reps returns weight, volume sums correctly, duration returns correct minutes
- [x] T022 [P] Create `lib/calculations.ts` — `estimatedOneRM(weightKg: number, reps: number): number` (Epley: `weight * (1 + reps / 30)`); `sessionVolume(sets: readonly { weightKg: number; reps: number }[]): number`; `sessionDurationMinutes(startedAt: string, endedAt: string): number`

**Checkpoint**: `pnpm test` passes for T015/T016/T021. App launches and tab bar renders with Midnight Teal styling. `supabase/types.ts` exists with `Database` type.

---

## Phase 3: User Story 1 — Account & Authentication (Priority: P1) 🎯 MVP Gate

**Goal**: Users can register, sign in, persist session across restarts, and sign out.

**Independent Test**: Register new email → lands on tab bar. Sign out → returns to sign-in.
Re-launch → auto-authenticated. Wrong password → error shown (no crash).

### Tests for User Story 1 *(component tests REQUIRED for interactive elements)*

> **Write these tests FIRST — they must FAIL before implementation**

- [x] T023 [P] [US1] Integration test for auth flows in `__tests__/auth.integration.test.ts` — mock `lib/supabase.ts` Supabase client; test: (1) sign-up with valid email/password calls `signUp`, (2) sign-in with valid credentials calls `signInWithPassword` and navigates to tabs, (3) sign-in with wrong password shows error message and does not navigate, (4) `onAuthStateChange` SIGNED_OUT redirects to `/(auth)/sign-in`, (5) sign-out button calls `supabase.auth.signOut`

### Implementation for User Story 1

- [x] T024 [P] [US1] Create `app/(auth)/_layout.tsx` — `<Stack>` navigator for auth screens; no tab bar; dark background `#071412`
- [x] T025 [P] [US1] Create `app/(auth)/sign-up.tsx` — email Input + password Input + "Opprett konto" Button; calls `supabase.auth.signUp({ email, password })`; shows inline error if response has error; navigates to `/(tabs)` on success
- [x] T026 [P] [US1] Create `app/(auth)/sign-in.tsx` — email Input + password Input + "Logg inn" Button + link to sign-up; calls `supabase.auth.signInWithPassword`; shows inline error on failure
- [x] T027 [US1] Update `app/_layout.tsx` — subscribe to `supabase.auth.onAuthStateChange`; on `SIGNED_IN` or `INITIAL_SESSION` with session: check `getOpenWorkout()` (from `lib/db/workouts.ts`) and route to `/workout/[id]` or `/(tabs)`; on `SIGNED_OUT`: route to `/(auth)/sign-in`
- [x] T028 [US1] Create `app/(tabs)/profile.tsx` — replaces Phase 2 placeholder; display `session.user.email`; "Logg ut" Button calls `supabase.auth.signOut()`; uses components/ui/Button and components/ui/Card

**Checkpoint (US1)**: Auth flow works end-to-end. `pnpm test` still passes including T023.

---

## Phase 4: User Story 2 — Active Workout Session (Priority: P1) 🎯 MVP

**Goal**: Start a session, log sets with optimistic UI, mark complete, end session — all
persisted. Previous session data shown as dimmed reference per exercise.

**Independent Test**: Start session from a routine → log 3 sets across 2 exercises (appears
instantly each time) → mark 2 sets complete → end session → data appears in DB
(verified via `getWorkoutDetail`).

### Tests for User Story 2 *(component tests REQUIRED for interactive elements)*

> **Write these tests FIRST — they must FAIL before implementation**

- [x] T029 [P] [US2] Component test for `components/workout/SetRow.tsx` in `components/workout/__tests__/SetRow.test.tsx` — (1) renders weight and reps, (2) complete toggle Pressable fires `onToggleComplete` callback, (3) completed=true renders checkmark or distinct color, (4) note text renders when provided, (5) minHeight/minWidth ≥ 44 on toggle element, (6) long-press fires `onDelete` callback, (7) tap on row fires `onEdit` callback
- [x] T030 [P] [US2] Component test for `components/workout/ExerciseCard.tsx` in `components/workout/__tests__/ExerciseCard.test.tsx` — (1) renders exercise name, (2) renders correct number of SetRow children, (3) renders PreviousSetReference when `previousData` prop provided, (4) "Legg til sett" button fires `onAddSet` callback
- [x] T031 [US2] Integration test for active session in `__tests__/active-session.integration.test.ts` — mock `lib/db/sets.ts`; test: (1) logSet writes to local state before Supabase resolves (optimistic appears immediately), (2) Supabase `logSet` rejection removes optimistic row from state, (3) toggleComplete updates `completed` in local state, (4) `endWorkout` calls `lib/db/workouts.ts:endWorkout` with session id and navigates back, (5) `cancelSession` calls `lib/db/workouts.ts:cancelWorkout` and navigates back without the session appearing in history

### Implementation for User Story 2

- [x] T032 [P] [US2] Create `lib/db/workouts.ts` — all functions from `specs/001-workout-log/contracts/supabase-queries.md § lib/db/workouts.ts`: `getOpenWorkout`, `createWorkout`, `endWorkout`, `getWorkoutHistory`, `getWorkoutDetail`, `getPreviousSessionSets`; add `cancelWorkout(id: string): Promise<void>` which deletes all `workout_sets` for the workout then deletes the `workouts` row; import from `supabase/types.ts`; explicit return types throughout
- [x] T033 [P] [US2] Create `lib/db/sets.ts` — `logSet(data: LogSetInput): Promise<WorkoutSet>`, `updateSet(id: string, data: Partial<UpdateSetInput>): Promise<WorkoutSet>`, `deleteSet(id: string): Promise<void>`; all queries from `specs/001-workout-log/contracts/supabase-queries.md § lib/db/sets.ts`
- [x] T034 [US2] Create `lib/hooks/useActiveWorkout.ts` — accepts `workoutId: string`; fetches exercises from workout; fetches previous session refs via `getPreviousSessionSets`; maintains `sets` in local React state (optimistic writes); `logSet`: adds optimistic row to state immediately → calls `lib/db/sets.ts:logSet` async → on success replaces temp row with server id → on error removes temp row + calls `onError(message)`; `editSet(id, { weightKg, reps })`: optimistically updates local state → calls `lib/db/sets.ts:updateSet`; `toggleComplete`: calls `updateSet`; `deleteSet`: calls `lib/db/sets.ts:deleteSet` and removes from local state; `endSession`: calls `endWorkout` + navigates back; `cancelSession`: calls `cancelWorkout` + navigates back (no history entry)
- [x] T035 [P] [US2] Create `components/workout/PreviousSetReference.tsx` — dimmed reference row; text color `#5DCAA5`; renders "Sist: Xkg × Y sett (Z reps)" format; non-interactive
- [x] T036 [P] [US2] Create `components/workout/SetRow.tsx` — weight (kg) display, reps display, complete toggle Pressable (minHeight/minWidth 44, teal checkmark when completed); optional note text; tap row fires `onEdit` callback; long-press fires `onDelete` callback (caller shows `Alert.alert` confirmation); `onToggleComplete: (setId: string) => void`; `onEdit: (setId: string) => void`; `onDelete: (setId: string) => void`
- [x] T037 [P] [US2] Create `components/workout/ExerciseCard.tsx` — exercise name heading; renders PreviousSetReference above sets if `previousData` provided; renders list of SetRow; "Legg til sett" Button (secondary variant); `onAddSet: (exerciseId: string) => void` callback
- [x] T038 [US2] Create `app/workout/[id].tsx` — full-screen modal (`presentation: 'fullScreenModal'`); reads `id` from `useLocalSearchParams`; uses `useActiveWorkout(id)` hook; renders ExerciseCard list via FlatList; "Legg til sett" flow: bottom sheet modal with weight + reps Input fields (pre-filled from last set in session if any) + optional note Input + confirm Button; tapping a SetRow opens the same modal pre-filled with that set's values (edit mode → calls `editSet`); long-press SetRow shows `Alert.alert` confirmation → calls `deleteSet`; "Avslutt økt" Button triggers `endSession` with confirmation Alert; "Avbryt økt" option in header triggers `cancelSession` with confirmation Alert ("Dette sletter alle settene og fjerner økten."); Midnight Teal dark background

**Checkpoint (US2)**: Session started from a routine, sets logged (appear instantly), completed sets visually distinct, session ended and saved. `pnpm test` passes including T029/T030/T031.

---

## Phase 5: User Story 4 — Exercise Library (Priority: P2)

**Goal**: Create exercises with name + muscle group, view grouped list, filter by category.
*(Implemented before US3 — exercises are a prerequisite for building routines.)*

**Independent Test**: Create "Benkpress" in "Bryst" → appears under Bryst in grouped list.
Filter to "Bryst" → only chest exercises shown. Duplicate "Benkpress" → error shown.

### Tests for User Story 4 *(component tests REQUIRED for interactive elements)*

> **Write these tests FIRST — they must FAIL before implementation**

- [x] T039 [P] [US4] Component test for `app/exercises/index.tsx` in `app/exercises/__tests__/index.test.tsx` — mock `lib/db/exercises.ts`; (1) renders exercises grouped by category, (2) category filter button press calls `setSelectedCategory`, (3) "Ny øvelse" button shows creation form, (4) submitting form with existing name shows error message, (5) valid form submission calls `createExercise`

### Implementation for User Story 4

- [x] T040 [P] [US4] Create `lib/db/exercises.ts` — `getExercises(): Promise<Exercise[]>` (all user exercises ordered by category, name); `createExercise(data: { name: string; category: string }): Promise<Exercise>` (throws/returns error on unique constraint violation); import from `supabase/types.ts`
- [x] T041 [P] [US4] Create `app/exercises/_layout.tsx` — `<Stack>` header with title "Øvelser", dark background
- [x] T042 [US4] Create `app/exercises/index.tsx` — FlatList of exercises grouped by category using `SectionList`; category filter row (horizontal ScrollView of filter Button chips: Alle, Rygg, Bryst, Ben, Skuldre, Biceps, Triceps, Magemuskler); FAB "+ Ny øvelse" opens bottom sheet modal with name Input + category picker (FlatList of category options); calls `createExercise`; shows inline error on duplicate name; uses EmptyState when no exercises; all interactive elements ≥ 44×44pt

**Checkpoint (US4)**: Exercise library functional. `pnpm test` still passes including T039.

---

## Phase 6: User Story 3 — Routines (Priority: P2)

**Goal**: Create named routines with ordered exercises, edit, delete, and start sessions
from them.

**Independent Test**: Create routine "Push Day" with 3 exercises → appears in list. Tap
"Start" → opens active session screen with those 3 exercises in correct order.

### Tests for User Story 3 *(component tests REQUIRED for interactive elements)*

> **Write these tests FIRST — they must FAIL before implementation**

- [x] T043 [P] [US3] Component test for `components/routines/RoutineCard.tsx` in `components/routines/__tests__/RoutineCard.test.tsx` — (1) renders routine name, (2) renders exercise count, (3) "Start" Pressable fires `onStart` callback, (4) long-press or edit action fires `onEdit`, (5) min 44×44pt on "Start" pressable
- [x] T044 [P] [US3] Component test for `components/routines/ExercisePicker.tsx` in `components/routines/__tests__/ExercisePicker.test.tsx` — (1) renders exercises grouped by category, (2) tapping exercise calls `onToggle(exercise)`, (3) selected exercises shown with checkmark, (4) confirm button fires `onConfirm` with selected array

### Implementation for User Story 3

- [x] T045 [P] [US3] Create `lib/db/routines.ts` — `getRoutines(): Promise<RoutineWithExercises[]>` (with exercises ordered by `order_index`); `createRoutine(data: { name: string; exerciseIds: string[] }): Promise<Routine>`; `updateRoutine(id: string, data: { name?: string; exerciseIds?: string[] }): Promise<Routine>` (replaces routine_exercises on exerciseIds change); `deleteRoutine(id: string): Promise<void>`; all functions import from `supabase/types.ts`
- [x] T046 [P] [US3] Create `components/routines/RoutineCard.tsx` — routine name heading (text-primary `#E0F5F0`); exercise count subtext (text-hint `#5DCAA5`); "Start" Pressable (accent `#20D2AA`, minHeight 44, minWidth 80); `onStart: () => void` and `onEdit: () => void` callbacks
- [x] T047 [P] [US3] Create `components/routines/ExercisePicker.tsx` — modal bottom sheet; SectionList of exercises by category; checkmark on selected exercises; confirm "Velg" Button; `onConfirm: (selectedIds: string[]) => void`; `onClose: () => void`
- [x] T048 [US3] Create `app/(tabs)/routines.tsx` — replaces Phase 2 placeholder; FlatList of RoutineCard; FAB "+ Ny rutine" opens form (name Input + ExercisePicker); tapping routine name opens edit form (pre-populated); swipe-to-delete with confirmation Alert; uses `lib/db/routines.ts`
- [x] T049 [US3] Wire `RoutineCard.onStart` — calls `createWorkout(routineId)` from `lib/db/workouts.ts`; on success calls `router.push('/workout/' + workout.id)` to open active session

**Checkpoint (US3)**: Create "Push Day" with 3 exercises → start from routines tab → active session opens with exercises in correct order. `pnpm test` passes including T043/T044.

---

## Phase 7: User Story 5 — Workout History (Priority: P3)

**Goal**: View all completed sessions newest-first; tap to see full set detail.

**Independent Test**: After completing 3 sessions, history tab shows all 3 with correct
dates, routine names, durations, and set counts. Tapping each reveals all exercises and sets.

### Implementation for User Story 5

- [x] T050 [P] [US5] Create `lib/hooks/useWorkoutHistory.ts` — calls `getWorkoutHistory()` from `lib/db/workouts.ts` on mount; exposes `sessions: WorkoutSummary[]`, `isLoading: boolean`, `error: string | null`, `refresh(): void`
- [x] T051 [US5] Create `app/(tabs)/index.tsx` — replaces Phase 2 placeholder; FlatList of workout summary rows (date formatted in Norwegian `no-NO` locale, routine name, duration in minutes, set count); each row navigates to `/workout/history/[id]`; "Start ny økt" CTA Button at top opens routine picker bottom sheet (FlatList of routines) → calls `createWorkout` + navigates to `/workout/[id]`; EmptyState when no sessions
- [x] T052 [US5] Create `app/workout/history/[id].tsx` — reads `id` from params; calls `getWorkoutDetail(id)`; renders session header (date, routine, duration); SectionList of exercises → each section has SetRow list (read-only: `onToggleComplete` is no-op); back button to history

**Checkpoint (US5)**: History tab shows sessions. Session detail shows all exercises and sets.

---

## Phase 8: User Story 6 — Progress & Statistics (Priority: P3)

**Goal**: Aggregate totals, session duration/volume charts, per-exercise weight + 1RM
progression and latest sets — all loaded lazily on tab mount.

**Independent Test**: After 5 sessions with the same exercise, statistics screen shows
aggregate totals, two line charts, and a progression chart for that exercise when selected.

### Tests for User Story 6 *(component tests REQUIRED for interactive elements)*

> **Write these tests FIRST — they must FAIL before implementation**

- [x] T053 [P] [US6] Component test for `components/statistics/AggregateStats.tsx` in `components/statistics/__tests__/AggregateStats.test.tsx` — (1) renders all 4 totals (sessions/sets/reps/volume), (2) handles `{ totalSessions: 0, totalSets: 0, totalReps: 0, totalVolumeKg: 0 }` without crash
- [x] T054 [P] [US6] Component test for `components/statistics/ProgressionChart.tsx` in `components/statistics/__tests__/ProgressionChart.test.tsx` — (1) renders VictoryChart without crash with empty data `[]`, (2) renders with one data point `[{ date: '2026-01-01', value: 80 }]`, (3) `label` prop text appears in rendered output

### Implementation for User Story 6

- [x] T055 [P] [US6] Create `lib/db/statistics.ts` — all functions from `specs/001-workout-log/contracts/supabase-queries.md § lib/db/statistics.ts`: `getAggregateStats`, `getSessionDurations`, `getSessionVolumes`, `getExerciseProgression`, `getLatestExerciseSets`; explicit return types; import from `supabase/types.ts`
- [x] T056 [P] [US6] Create `lib/hooks/useStatistics.ts` — lazy: accepts `fetchEnabled: boolean`; only fetches when `fetchEnabled` is `true` (set by statistics screen on first mount); exposes `aggregates`, `durationPoints`, `volumePoints`, `getExerciseData(exerciseId: string)`, `isLoading`
- [x] T057 [P] [US6] Create `components/statistics/AggregateStats.tsx` — 2×2 grid of Cards; each cell: large bold accent-colored number + label (e.g., "Økter", "Sett", "Reps", "Volum kg"); accepts `AggregateStats` props
- [x] T058 [P] [US6] Create `components/statistics/ProgressionChart.tsx` — wraps `VictoryChart` with `VictoryLine` and `VictoryVoronoiContainer` (crosshair); line color `#20D2AA`; axis labels in `#5DCAA5`; accepts `data: { date: string; value: number }[]` and `label: string`; dark background `#0D1F1D`; handles empty data with EmptyState
- [x] T059 [US6] Create `app/(tabs)/statistics.tsx` — replaces Phase 2 placeholder; sets `fetchEnabled = true` on mount (lazy-load, Principle II); renders AggregateStats; renders ProgressionChart for session durations; renders ProgressionChart for session volumes; FlatList exercise picker (all exercises) → on select renders ProgressionChart for `maxWeightKg` and `estimated1rm`; renders latest sets list for selected exercise using `lib/calculations.ts:estimatedOneRM`

**Checkpoint (US6)**: Statistics tab lazy-loads, shows all charts, exercise picker works, 1RM calculated correctly. `pnpm test` passes including T053/T054.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility validation, type safety, error handling, and final verification.

- [x] T060 [P] Accessibility audit — check all `Pressable` / `TouchableOpacity` elements across `components/` have `minHeight: 44` and `minWidth: 44` (or 44×44pt via NativeWind `h-11 w-11`); fix any violations; verify no grey-on-grey text (any text in `#5DCAA5` or darker must not appear on `#071412` background in a way that fails WCAG AA)
- [x] T061 [P] Verify all layouts on iPhone SE (375pt) and iPhone 15 Pro Max (430pt) in iOS Simulator — check `app/(tabs)/index.tsx`, `app/workout/[id].tsx`, `app/(tabs)/statistics.tsx`; fix any overflow, truncation, or horizontal scroll issues
- [x] T062 Error handling pass — verify each `lib/db/` function surfaces typed errors (not raw Supabase errors); each screen shows a user-facing error message via `Alert` or inline error state; no screen silently ignores a failed Supabase call; verify optimistic rollback in `useActiveWorkout` is tested in T031
- [x] T063 [P] Run `pnpm tsc --noEmit` — resolve every TypeScript error; confirm no `any` type in `components/`, `lib/`, or `app/`; check that all exported functions have explicit return types
- [x] T064 File size audit — measure line counts on all `*.tsx` and `*.ts` files in `app/`, `components/`, and `lib/`; split any file exceeding 300 lines into smaller focused modules; re-run `pnpm tsc --noEmit` after any splits
- [x] T065 [P] Verify `.env.example` contains `EXPO_PUBLIC_SUPABASE_URL=` and `EXPO_PUBLIC_SUPABASE_ANON_KEY=` with empty or placeholder values; verify `.gitignore` includes `.env.local`; verify no secrets are committed (`git log --all -- .env.local` returns nothing)
- [x] T066 Run `pnpm test` — all unit tests, component tests, and integration tests pass; address any failing tests before marking complete
- [x] T067 Run `quickstart.md` validation checklist — confirm all 7 items in the checklist pass; document any deviations

---

## Phase 10: Historical Data Import (Post-Build, Optional)

**Purpose**: Seed the app with historical workout data from `csv/data/rep_history.csv`.
This phase runs AFTER all app phases are complete and validated. It is entirely independent
of the codebase — the app works without historical data.

**Pre-condition**: T009 (script created in Phase 1) and Phase 9 (Polish) fully complete.

- [ ] T068 Add `SUPABASE_SERVICE_ROLE_KEY=<your-key>` to `.env.local` temporarily (service role bypasses RLS for bulk upsert — remove after import)
- [ ] T069 Run `pnpm tsx scripts/import-csv.ts` — verify console output shows correct exercise, routine, and workout counts matching expected CSV row counts (~3,646 rows)
- [ ] T070 Remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` after successful import
- [ ] T071 [P] Verify imported data in Supabase dashboard — spot-check 2–3 routines and their exercises against the CSV; confirm `workout_sets.set_number` is sequential per `(workout_id, exercise_id)`
- [ ] T072 [P] Launch app and verify history tab shows imported sessions; verify statistics screen renders charts for imported data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately in parallel where marked [P]
- **Foundational (Phase 2)**: Depends on Phase 1 complete — BLOCKS all user story phases
- **US1 Auth (Phase 3)**: Depends on Phase 2 — can start once T010–T014 and shared UI done
- **US2 Active Session (Phase 4)**: Depends on Phase 2 + Phase 3 (user must be authenticated)
- **US4 Exercise Library (Phase 5)**: Depends on Phase 2 + Phase 3; independent of US2
- **US3 Routines (Phase 6)**: Depends on Phase 5 (exercises must exist); uses US2 `createWorkout`
- **US5 History (Phase 7)**: Depends on US2 (session data must exist)
- **US6 Statistics (Phase 8)**: Depends on US5 (history data powers charts)
- **Polish (Phase 9)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story dependencies
- **US2 (P1)**: After US1 (auth required to create sessions)
- **US4 (P2)**: After Phase 2 — independent of US1/US2 (exercises don't need auth UI, but
  the app does; effectively after US1)
- **US3 (P2)**: After US4 (requires exercises to exist)
- **US5 (P3)**: After US2 (requires completed sessions)
- **US6 (P3)**: After US5 (best with real data, though works with 0 sessions)

### Within Each User Story Phase

1. Tests (marked WRITE FIRST) → must FAIL before next step
2. `lib/db/` functions (data layer)
3. `lib/hooks/` (state management)
4. `components/` (UI primitives)
5. `app/` screen (wires everything together)
6. Verify tests now PASS

---

## Parallel Opportunities

### Phase 2 Parallel Block (T015–T022)

```
T015 Button component test    T016 Input component test    T021 calculations unit test
T017 Button.tsx               T018 Card.tsx                T022 calculations.ts
T019 Input.tsx                T020 EmptyState.tsx
```

All can launch simultaneously — each writes a different file.

### Phase 4 (US2) Parallel Block

```
T029 SetRow test              T030 ExerciseCard test
T032 lib/db/workouts.ts       T033 lib/db/sets.ts
T035 PreviousSetReference     T036 SetRow.tsx              T037 ExerciseCard.tsx
```

T031 (integration test) and T034 (useActiveWorkout hook) depend on T032+T033 existing.

### Phase 5–6 Parallel Block

US4 (Phase 5) and US3 (Phase 6) cannot run in parallel — US3 depends on US4.
Within Phase 5: T039+T040+T041 can run in parallel.
Within Phase 6: T043+T044+T045 can run in parallel.

---

## Implementation Strategy

### MVP First (US1 + US4 + US2 + US3)

Since ad-hoc sessions are not supported, a routine must exist before any session can be
started. The minimum working loop is: create exercise → create routine → start session → log sets.

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Auth
4. Complete Phase 5: US4 — Exercise Library (prerequisite for US3)
5. Complete Phase 4: US2 — Active Workout Session (creates session screen + DB layer)
6. Complete Phase 6: US3 — Routines (wires "Start" button → navigates to US2 screen)
7. **STOP and VALIDATE**: Routine session works end-to-end; `pnpm test` passes
8. Deploy via `eas build --platform ios --profile preview` to TestFlight
9. *(Optional: run Phase 10 import after full v1 is shipped)*

### Incremental Delivery

1. Setup + Foundational → app launches
2. Add US1 (Auth) → login/register works ← first TestFlight build
3. Add US4 (Exercise Library) → exercises manageable
4. Add US2 (Active Session) → session screen + DB layer created
5. Add US3 (Routines) → full routine → session loop works ← MVP complete
6. Add US5 (History) → session log visible
7. Add US6 (Statistics) → progression charts ← full v1

### Parallel Team Strategy

With two developers after Phase 2 completes:

- **Dev A**: US2 (Active Session)
- **Dev B**: US4 (Exercise Library) → then US3 (Routines)

Both depend on Phase 2 (shared UI + DB) being complete first.

---

## Notes

- `[P]` tasks write to different files — verify before running in parallel
- `[USn]` label maps to spec.md user stories for traceability
- Tests marked "WRITE FIRST" follow TDD — they should be failing red before implementation
- Run `pnpm tsc --noEmit` after completing each phase
- Commit after each phase with conventional commit message (e.g., `feat: implement US1 auth screens`)
- File size limit: if any file approaches 250 lines during development, plan the split proactively
- All touch targets: use `className="h-11 w-11"` (NativeWind) or `style={{ minHeight: 44, minWidth: 44 }}`
