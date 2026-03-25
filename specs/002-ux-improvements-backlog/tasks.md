# Tasks: UX Improvements & Feature Backlog

**Input**: Design documents from `/specs/002-ux-improvements-backlog/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-components.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing. Constitution Principle VI requires component tests for ALL new interactive UI components.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story (US1–US10)

---

## Phase 1: Setup

**Purpose**: Database migration and type regeneration before any app code is written.

- [x] T001 Create `supabase/migrations/002_user_preferences.sql` — user_preferences table with rest_timer_seconds (int default 90), rest_timer_enabled (bool default true), and RLS policy scoped to auth.uid()
- [x] T002 Apply migration and regenerate types: `pnpm supabase gen types typescript --local > supabase/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook updates that US3 and US4 depend on.

**⚠️ CRITICAL**: US3 (inline layout) and US4 (abort flow) cannot start until this phase is complete.

- [x] T003 Update `lib/hooks/useActiveWorkout.ts` — add PreviousSetMap state, load previous session values via getPreviousSessionSets() at init, expose confirmSame(exerciseId, setNumber) and abortSession(id, autoComplete) methods per data-model.md interface

**Checkpoint**: Foundation ready — all user stories can begin.

---

## Phase 3: User Story 1 — Home Screen: Workout History and Start Button (Priority: P1) 🎯 MVP

**Goal**: The home screen shows completed workouts in reverse-chronological order with a clearly accessible "+" button. An empty state prompts new users to start their first workout.

**Independent Test**: Open app with 3 completed workouts — confirm reverse-chrono list showing date, routine name, set count, and duration. Confirm "+" button is visible without scrolling. Open with a fresh account — confirm empty state with action prompt.

- [x] T004 [US1] Verify `app/(tabs)/index.tsx` renders FlatList in reverse-chronological order; each row must show date, routine name, set count, and duration — add missing fields to WorkoutSummary row if absent
- [x] T005 [US1] Ensure "+" or "New workout" button in `app/(tabs)/index.tsx` is visible at top of screen without scrolling and navigates to routine picker on tap
- [x] T006 [US1] Wire EmptyState in `app/(tabs)/index.tsx` to show "Start your first workout" prompt when sessions list is empty

**Checkpoint**: US1 fully functional and independently testable.

---

## Phase 4: User Story 2 — Routine Selection to Start a Workout (Priority: P1)

**Goal**: Tapping "+" shows the routine picker with name and exercise count per routine. Selecting a routine starts the workout immediately with no extra confirmation step.

**Independent Test**: With 3 routines, tap "+", confirm all 3 listed with name and exercise count, tap one, confirm active workout screen opens immediately with correct exercises.

- [x] T007 [US2] Update routine picker modal in `app/(tabs)/index.tsx` — ensure each routine row shows exercise count; remove any extra confirmation step between routine selection and createWorkout() call
- [x] T008 [US2] Add "Create your first routine →" empty state shortcut in routine picker modal in `app/(tabs)/index.tsx` when user has no routines

**Checkpoint**: US2 fully functional and independently testable.

---

## Phase 5: User Story 3 — Active Workout Screen: Full Routine Layout Visible Upfront (Priority: P1)

**Goal**: Active workout shows all exercises and all planned set rows immediately. Each set row displays greyed-out previous-session values. A confirm-same action accepts previous values without retyping.

**Independent Test**: Start a workout from a routine with 3 exercises × 4 sets each. Confirm all 12 set rows are visible without any tap. With a prior session, confirm greyed-out placeholder values. Tap a confirm-same icon — confirm values are logged without typing.

- [x] T009 [P] [US3] Update `components/workout/SetRow.tsx` — add previousValue prop (displays greyed-out placeholder), onConfirmSame callback (confirm-same icon), validationError prop (inline error via existing errorText pattern), onWeightChange and onRepsChange callbacks; per contracts/ui-components.md
- [x] T010 [P] [US3] Update `components/workout/ExerciseCard.tsx` — accept plannedSetCount (default 3), previousSets array (PreviousSetValue[]), onConfirmSame(setNumber), onRestTimerStop; render Math.max(plannedSetCount, loggedSets.length) set rows upfront; remove "Add Set" modal trigger; per contracts/ui-components.md
- [x] T011 [US3] Refactor `app/workout/[id].tsx` — replace modal-based set entry with inline callbacks; pass previousSets from useActiveWorkout to ExerciseCard; wire onConfirmSame to hook's confirmSame(); pass plannedSetCount from routine exercises (default 3)
- [x] T012 [US3] Write component tests for updated `components/workout/SetRow.tsx` in `components/workout/__tests__/SetRow.test.tsx` — cover: renders without crashing, confirm-same fires callback, placeholder text shown when previousValue set, validationError displayed inline, completed state styling
- [x] T013 [US3] Write component tests for updated `components/workout/ExerciseCard.tsx` in `components/workout/__tests__/ExerciseCard.test.tsx` — cover: renders all plannedSetCount rows without additional tap, renders without crashing, previousSets passed to child SetRows

**Checkpoint**: US3 fully functional and independently testable.

---

## Phase 6: User Story 4 — Workout Completion: Natural Finish vs Abort (Priority: P1)

**Goal**: When all sets are complete, a "Finish workout" prompt appears automatically. An "Abort" option lets users stop early with a choice to auto-complete remaining sets or save as-is.

**Independent Test**: Complete all sets — confirm finish prompt appears. Start workout, complete half, tap "Abort" — confirm three-option dialog. Select "Auto-complete" — confirm all sets saved. Repeat, select "Save as-is" — confirm only completed sets saved.

- [x] T014 [US4] Add auto-complete detection to `lib/hooks/useActiveWorkout.ts` — when all sets across all exercises are marked complete, emit a completion event or expose an `allSetsComplete` boolean; implement abortSession(id, autoComplete=true) to mark uncomplete sets complete using current/placeholder values then call endWorkout()
- [x] T015 [US4] Update `app/workout/[id].tsx` — (a) show "Finish workout" Alert.alert when allSetsComplete becomes true; (b) update abort button to show three-option Alert: "Cancel", "Save as-is" (autoComplete=false), "Auto-complete remaining sets" (autoComplete=true)
- [x] T016 [US4] Write integration test for abort+auto-complete flow in `__tests__/active-session.integration.test.ts` — cover: abort with autoComplete=false saves only completed sets; abort with autoComplete=true saves all sets

**Checkpoint**: US4 fully functional. Complete P1 core workout flow is done.

---

## Phase 7: User Story 5 — Rest Timer Between Sets (Priority: P2)

**Goal**: After marking a set complete, a configurable countdown timer starts. Haptic feedback fires at zero. Users can set a global default or per-exercise override. Timer can be disabled.

**Independent Test**: Complete a set — confirm countdown starts from configured default (90s). Wait for zero — confirm haptic fires. Tap next set field — confirm timer stops. Disable in settings — confirm no timer UI after completing a set.

- [x] T017 [P] [US5] Implement `lib/hooks/useRestTimer.ts` — countdown using Date.now() reference (not accumulated ticks); startTimer(exerciseId?) applies per-exercise override or global default; stopTimer(); resetTimer(); triggers expo-haptics on transition to zero; no-op when enabled=false; per data-model.md interface
- [x] T018 [P] [US5] Implement `lib/db/userPreferences.ts` — getUserPreferences() fetches or returns defaults, upsertUserPreferences(partial) uses Supabase UPSERT on user_preferences table; per data-model.md types
- [x] T019 [US5] Create `components/workout/RestTimer.tsx` — displays secondsRemaining countdown; hidden when not running; "Rest complete" visual cue at zero; onStop callback on tap; ≥ 44×44pt touch target; per contracts/ui-components.md
- [x] T020 [US5] Wire useRestTimer into `app/workout/[id].tsx` — load UserPreferences at mount; pass config to useRestTimer; call startTimer(exerciseId) in onConfirmSame and onToggleComplete handlers; call stopTimer in ExerciseCard's onRestTimerStop (fires when user taps an input field); render RestTimer component in workout screen
- [x] T021 [US5] Add rest timer settings section to `app/(tabs)/profile.tsx` — toggle for rest_timer_enabled, numeric input for rest_timer_seconds; wire to upsertUserPreferences() on change
- [x] T022 [US5] Write component tests for `components/workout/RestTimer.tsx` in `components/workout/__tests__/RestTimer.test.tsx` — cover: renders nothing when not running, shows countdown when running, calls onStop on press, shows rest-complete cue at zero

**Checkpoint**: US5 fully functional and independently testable.

---

## Phase 8: User Story 6 — Edit or Delete Sets in Workout History (Priority: P2)

**Goal**: Users can correct typos in logged sets from the workout history detail screen. Edit and delete icons on set rows are functional.

**Independent Test**: Navigate to a past workout, tap edit on a set row, change weight, save — confirm new value persists after navigating away and back. Tap delete on a set row, confirm dialog — confirm set removed and statistics update.

- [x] T023 [US6] Wire onEdit callback in `app/workout/history/[id].tsx` — open edit modal (reuse existing modal pattern from active workout) pre-filled with current set values; on save call updateSet() from lib/db/sets.ts
- [x] T024 [US6] Wire onDelete callback in `app/workout/history/[id].tsx` — show Alert.alert confirmation; on confirm call deleteSet() from lib/db/sets.ts; handle deletion of last set for an exercise (hide exercise section)
- [x] T025 [US6] After edit or delete in `app/workout/history/[id].tsx` — refresh getWorkoutDetail() and invalidate statistics (call useStatistics reload if statistics screen is mounted, or set a refresh flag via context/navigation param)

**Checkpoint**: US6 fully functional and independently testable.

---

## Phase 9: User Story 7 — Guard Against Empty Routines and Duplicate Exercises (Priority: P2)

**Goal**: Saving a routine with no exercises is blocked. Adding the same exercise twice is rejected. Starting a workout from an empty routine is blocked.

**Independent Test**: Attempt to save a routine with zero exercises — confirm blocking message. Select the same exercise twice in the picker — confirm second selection rejected with message. Attempt to start an empty routine — confirm blocking message.

- [x] T026 [P] [US7] Add empty-routine save guard in `app/(tabs)/routines.tsx` — before calling createRoutine/updateRoutine, check selectedExerciseIds.length > 0; display inline error "Add at least one exercise to your routine" if check fails
- [x] T027 [P] [US7] Update `components/routines/ExercisePicker.tsx` — in onToggle handler, if exerciseId is already in selectedIds, reject and display brief inline message "[Exercise name] is already in this routine" instead of toggling; per contracts/ui-components.md
- [x] T028 [US7] Add empty-routine start guard in routine picker modal in `app/(tabs)/index.tsx` — if selected routine has zero exercises, block createWorkout() and show message prompting user to add exercises first
- [x] T029 [US7] Update component tests for `components/routines/ExercisePicker.tsx` in `components/routines/__tests__/ExercisePicker.test.tsx` — cover: duplicate selection is rejected, message shown on duplicate, normal selection still works

**Checkpoint**: US7 fully functional and independently testable.

---

## Phase 10: User Story 8 — Live Duration Timer on Active Workout Screen (Priority: P2)

**Goal**: A running clock in the active workout header shows elapsed time, updating every second. Accurate after app backgrounding.

**Independent Test**: Start a workout, wait 30 seconds — confirm header timer reads approximately "0:30" and continues incrementing. Background app for 5 minutes, return — confirm timer reflects correct wall-clock elapsed time.

- [x] T030 [US8] Add elapsed timer to `app/workout/[id].tsx` header — useEffect with setInterval(1000) using workout.started_at as wall-clock reference (Date.now() - startedAt.getTime()); format as MM:SS or HH:MM:SS; clear interval on unmount; AppState listener to recalculate on foreground

**Checkpoint**: US8 fully functional and independently testable.

---

## Phase 11: User Story 9 — Statistics Date Range Filter (Priority: P3)

**Goal**: The statistics screen can be filtered to last 4 weeks, 3 months, 1 year, or all time. All charts and aggregates reflect only the selected window.

**Independent Test**: Select "Last 4 weeks" — confirm all charts and totals update to show only workouts in that window. Select a range with no workouts — confirm appropriate empty state, not an error.

- [x] T031 [P] [US9] Add DateRange type ('4w' | '3m' | '1y' | 'all') and dateRangeCutoff() utility to `lib/db/statistics.ts`; update getAggregateStats(), getSessionDurations(), getSessionVolumes(), getExerciseProgression(), getLatestExerciseSets() to accept optional dateRange and apply WHERE started_at >= cutoff filter
- [x] T032 [P] [US9] Update `lib/hooks/useStatistics.ts` to accept DateRange parameter and forward it to all lib/db/statistics.ts query calls
- [x] T033 [US9] Create `components/statistics/DateRangeFilter.tsx` — segmented control with four options: "4 uker", "3 mnd", "1 år", "Alt"; active segment styled with teal accent #20D2AA; each segment ≥ 44pt tall; stateless (selected + onChange props); per contracts/ui-components.md
- [x] T034 [US9] Wire DateRangeFilter into `app/(tabs)/statistics.tsx` — add local selectedRange state (default 'all'); pass to useStatistics; render DateRangeFilter above charts; add empty state when no data in range
- [x] T035 [US9] Write component tests for `components/statistics/DateRangeFilter.tsx` in `components/statistics/__tests__/DateRangeFilter.test.tsx` — cover: renders without crashing, all 4 options visible, onChange fires on press, selected option is visually distinguished

**Checkpoint**: US9 fully functional and independently testable.

---

## Phase 12: User Story 10 — Input Validation Feedback Before Saving a Set (Priority: P3)

**Goal**: Invalid set inputs (0 reps, blank weight) are blocked with inline errors. Unusually high weight triggers a confirmation prompt.

**Independent Test**: Enter 0 reps and attempt to save — confirm inline error "Reps must be at least 1". Enter weight > 500 kg — confirm confirmation dialog with cancel and confirm options. Leave weight blank and attempt to save — confirm blocking error.

- [x] T036 [P] [US10] Create `lib/validation.ts` — export validateSetInput(weight_kg: number | null, reps: number | null): { error: string | null; requiresConfirmation: boolean } with rules: reps < 1 → error; weight null/NaN → error; weight > 500 → requiresConfirmation flag
- [x] T037 [US10] Integrate validateSetInput into `components/workout/SetRow.tsx` confirm flow — call validateSetInput before invoking onConfirmSame/save; set validationError prop on error; bubble requiresConfirmation flag up via callback
- [x] T038 [US10] Handle requiresConfirmation in `app/workout/[id].tsx` confirm handler — show Alert.alert "That's [X] kg — is that correct?" with Cancel and Confirm; only proceed with set save on Confirm

**Checkpoint**: US10 fully functional. All user stories complete.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, type safety verification, and full regression test run.

- [x] T039 [P] Accessibility audit — verify all new interactive elements (RestTimer, DateRangeFilter segments, confirm-same icon, edit/delete history buttons) have ≥ 44×44pt touch targets per Principle III
- [x] T040 [P] TypeScript strict compliance check — run `pnpm tsc --noEmit` and ensure zero errors; no `any` types in lib/hooks/useRestTimer.ts, lib/db/userPreferences.ts, lib/validation.ts, or new components
- [x] T041 Run full test suite via `pnpm test` — fix any regressions; ensure all __tests__/ files pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types must be regenerated first)
- **US1, US2 (Phases 3–4)**: Depend only on Foundational — no cross-story dependencies; can start immediately after Phase 2
- **US3, US4 (Phases 5–6)**: Depend on Foundational (T003 useActiveWorkout update)
- **US5 (Phase 7)**: Depends on Foundational (types); independent of US3/US4
- **US6 (Phase 8)**: Independent of all other stories; depends only on Foundational
- **US7 (Phase 9)**: Independent of all other stories; depends only on Foundational
- **US8 (Phase 10)**: Depends on US3 (shares app/workout/[id].tsx) — implement after US3 complete
- **US9 (Phase 11)**: Independent of all other stories; depends only on Foundational
- **US10 (Phase 12)**: Depends on US3 (adds validation to SetRow updated in US3)
- **Polish (Phase 13)**: Depends on all stories complete

### User Story Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational: useActiveWorkout)
        ├── US1 (independent)
        ├── US2 (independent)
        ├── US3 ──────────────┬── US8 (shares same screen file)
        │                     └── US10 (adds to SetRow from US3)
        ├── US4 (uses abortSession from Foundational)
        ├── US5 (independent)
        ├── US6 (independent)
        ├── US7 (independent)
        └── US9 (independent)
```

### Parallel Opportunities

Stories US1, US2, US5, US6, US7, US9 are fully independent after Phase 2 and can be
implemented simultaneously. US3 and US4 must be done sequentially (US4 builds on US3's
inline layout). US8 and US10 extend US3's screen/component and should be done after US3.

---

## Parallel Example: US3 (Phase 5)

```
# These two tasks can run in parallel (different component files):
Task T009: Update components/workout/SetRow.tsx
Task T010: Update components/workout/ExerciseCard.tsx

# Then sequentially (screen depends on both components):
Task T011: Refactor app/workout/[id].tsx

# Tests can run in parallel with each other (different test files):
Task T012: SetRow tests
Task T013: ExerciseCard tests
```

---

## Implementation Strategy

### MVP (P1 Stories Only — Stories 1–4)

1. Phase 1: Setup (T001–T002)
2. Phase 2: Foundational (T003)
3. Phase 3: US1 (T004–T006)
4. Phase 4: US2 (T007–T008)
5. Phase 5: US3 (T009–T013)
6. Phase 6: US4 (T014–T016)
7. **Stop and validate**: Full P1 core workout flow working end-to-end

### Incremental Delivery

After P1 MVP, add P2 stories in any order (all are independent):

- US5 (Rest Timer) — highest user impact during workouts
- US6 (History Editing) — fixes existing broken UI affordances
- US7 (Routine Validation) — prevents confusing states
- US8 (Live Duration Timer) — low effort, high polish

Then P3:

- US9 (Statistics Filter) — important for users with longer history
- US10 (Input Validation) — prevents database corruption

---

## Notes

- [P] tasks = different files, no shared dependencies — safe to parallelize
- Constitution Principle VI: component tests are REQUIRED for all interactive components; tasks T012, T013, T022, T029, T035 are non-optional
- Each user story phase is a complete, independently demonstrable increment
- Follow Conventional Commits: `feat:`, `fix:`, `refactor:` — commit after each phase
- All Supabase queries must use generated types from supabase/types.ts (no manual type declarations)
- All tables in `pomp` schema — verify migration uses `CREATE TABLE pomp.user_preferences`
