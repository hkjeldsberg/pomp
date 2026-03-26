# Tasks: Exercise Management, Statistics Polish & UX Feedback

**Input**: Design documents from `/specs/003-exercise-stats-ux/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-components.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.
Constitution Principle VI requires component tests for ALL new interactive UI components.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story (US1–US6)

---

## Phase 1: Setup

**Purpose**: Shared utility infrastructure needed by multiple user stories.

- [x] T001 [P] Create `lib/utils/format.ts` — export `formatStatNumber(n: number): string`: n < 1000 → plain string, 1000–999999 → space as thousands separator (e.g. "12 450"), ≥ 1 000 000 → abbreviated (e.g. "1.2 M")
- [x] T002 [P] Create `lib/utils/statistics.ts` — export `filterOutliersByIQR<T>(data: T[], valueKey: keyof T, minCount?: number): T[]`: computes Q1, Q3, IQR; filters points outside Q1 − 1.5×IQR / Q3 + 1.5×IQR fence; returns original array unchanged when data.length < minCount (default 5)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Seed dataset needed by US1 (seed button) and US2 (auto-seed). Must exist before exercises tab is built.

- [x] T003 Create `lib/data/exerciseSeedData.ts` — export `EXERCISE_SEED_DATA: Array<{ name: string; category: 'Rygg'|'Bryst'|'Ben'|'Skuldre'|'Biceps'|'Triceps'|'Magemuskler' }>` with ~50 common exercises distributed across all 7 categories (e.g. Benkpress/Bryst, Markløft/Rygg, Knebøy/Ben, Militærpress/Skuldre, Stangcurl/Biceps, Triceps pushdown/Triceps, Planke/Magemuskler)

**Checkpoint**: Foundation ready — US1 and US2 can begin.

---

## Phase 3: User Story 1 — Exercise Management: Create, Edit, Delete (Priority: P1) 🎯 MVP

**Goal**: Users can create, rename, and delete exercises from a dedicated Øvelser tab. Deletion is blocked if the exercise is used in a routine.

**Independent Test**: Navigate to Øvelser tab, create "Bulgarian Split Squat" under Ben, verify it appears in the routine builder exercise picker. Rename it, confirm updated name. Delete it, confirm removal. Attempt to delete an exercise used in a routine — confirm blocking message.

- [x] T004 Add `updateExercise(id: string, data: { name: string; category: string }): Promise<Exercise>` and `deleteExercise(id: string): Promise<void>` to `lib/db/exercises.ts`
- [x] T005 [P] [US1] Create `components/exercises/ExerciseListItem.tsx` — displays exercise name and category badge; edit icon button (onEdit callback) and delete icon button (onDelete callback); both icon buttons ≥ 44×44pt touch target; per contracts/ui-components.md
- [x] T006 [P] [US1] Create `components/exercises/ExerciseForm.tsx` — TextInput for name (placeholder, max 80 chars shown); horizontal scrollable category chip picker with 7 options; "Lagre" button (disabled when isSaving prop is true); "Avbryt" button; optional inline error text; per contracts/ui-components.md
- [x] T007 [US1] Create `app/(tabs)/exercises.tsx` — SectionList of exercises grouped by category; FAB / header button "Ny øvelse" opens ExerciseForm in Modal; tapping edit icon opens ExerciseForm pre-filled; tapping delete icon shows Alert.alert confirmation then calls deleteExercise(); catches Supabase foreign-key error on delete and shows "Kan ikke slette — øvelsen brukes i en rutine"; reloads list after any CRUD operation via useFocusEffect
- [x] T008 [US1] Add Øvelser tab to `app/(tabs)/_layout.tsx` — add exercises route following the same Tabs.Screen pattern as existing tabs; use appropriate SF Symbol icon
- [x] T009 [P] [US1] Write component tests for `components/exercises/ExerciseListItem.tsx` in `components/exercises/__tests__/ExerciseListItem.test.tsx` — covers: renders without crashing with exercise data, onEdit called when edit button pressed, onDelete called when delete button pressed
- [x] T010 [P] [US1] Write component tests for `components/exercises/ExerciseForm.tsx` in `components/exercises/__tests__/ExerciseForm.test.tsx` — covers: renders without crashing, onSave called with entered name and selected category, inline error displayed when error prop set, save button disabled when isSaving is true

**Checkpoint**: US1 fully functional and independently testable.

---

## Phase 4: User Story 2 — Pre-defined Exercise Library Seed (Priority: P1)

**Goal**: New users automatically receive ~50 common exercises on first sign-in. Re-seeding never creates duplicates.

**Independent Test**: Sign in with a fresh account (or clear exercises). Verify ~50 exercises appear automatically in the Øvelser tab. Sign out and back in — verify no duplicates added.

- [x] T011 [US2] Add `seedExercises(): Promise<{ inserted: number }>` to `lib/db/exercises.ts` — batch-inserts all entries from EXERCISE_SEED_DATA for current authenticated user using `.upsert([...], { onConflict: 'user_id,name', ignoreDuplicates: true })` or equivalent ON CONFLICT DO NOTHING pattern; returns count of inserted rows
- [x] T012 [US2] Wire auto-seed in `app/_layout.tsx` — in the `SIGNED_IN` auth state handler, call `seedExercises()` asynchronously (fire-and-forget, no await blocking navigation); also add "Last inn standardøvelser" fallback button to the empty state in `app/(tabs)/exercises.tsx`

**Checkpoint**: US2 fully functional. P1 scope complete (exercise management + seeded library).

---

## Phase 5: User Story 3 — Statistics: Outlier Filtering (Priority: P2)

**Goal**: Duration and volume charts exclude anomalous sessions. Aggregate totals are unaffected.

**Independent Test**: With 6+ sessions including one < 5 min and one extremely long, view the duration chart — outliers absent. Aggregate session count includes all.

- [x] T013 [US3] Update `lib/hooks/useStatistics.ts` — after fetching durationPoints and volumePoints, apply `filterOutliersByIQR(durationPoints, 'durationMinutes')` and `filterOutliersByIQR(volumePoints, 'volumeKg')` before storing in state; keep raw totals for aggregates (do not filter the data used for AggregateStats)
- [x] T014 [US3] Write unit tests for `filterOutliersByIQR` in `lib/utils/__tests__/statistics.test.ts` — covers: filters data point outside IQR fence, returns all points when count < minCount (5), generic across different value keys, returns original array when no outliers exist

**Checkpoint**: US3 fully functional and independently testable.

---

## Phase 6: User Story 4 — Statistics: Searchable Exercise Picker (Priority: P2)

**Goal**: Statistics screen uses a searchable modal picker instead of a horizontal chip scroll. 30+ exercises are navigable within 3 interactions.

**Independent Test**: With 30+ exercises seeded, open statistics, tap exercise picker, type "kne" — confirm only matching exercises shown. Select one — confirm charts update.

- [x] T015 [P] [US4] Create `components/statistics/ExercisePickerModal.tsx` — Modal with visible/onClose props; TextInput search at top (case-insensitive substring filter); FlatList of filtered exercises below; selected exercise row highlighted; tapping exercise calls onSelect(exercise) and closes modal; empty state text when search returns nothing; per contracts/ui-components.md
- [x] T016 [US4] Update `app/(tabs)/statistics.tsx` — replace horizontal FlatList chip exercise scroll with a single Pressable showing selected exercise name (or "Velg øvelse →"); tapping it sets pickerVisible = true; render ExercisePickerModal; onSelect updates selectedExercise and loads exercise data
- [x] T017 [US4] Write component tests for `ExercisePickerModal` in `components/statistics/__tests__/ExercisePickerModal.test.tsx` — covers: renders without crashing when visible, search input filters list by name, tapping exercise fires onSelect with correct exercise, empty state shown when no match

**Checkpoint**: US4 fully functional and independently testable.

---

## Phase 7: User Story 5 — Statistics: Large Number Formatting (Priority: P2)

**Goal**: All numeric aggregate values ≥ 1,000 on the statistics screen display with thousands separators.

**Independent Test**: With total volume > 10,000 kg, view statistics — confirm "12 450 kg" not "12450". Confirm all numeric stats formatted consistently.

- [x] T018 [US5] Update `components/statistics/AggregateStats.tsx` — wrap totalSets, totalReps, and totalVolumeKg through `formatStatNumber()` before rendering; import from `lib/utils/format.ts`
- [x] T019 [US5] Write unit tests for `formatStatNumber` in `lib/utils/__tests__/format.test.ts` — covers: 999 → "999", 1000 → "1 000", 12450 → "12 450", 1_000_000 → "1.0 M", 1_234_567 → "1.2 M"

**Checkpoint**: US5 fully functional and independently testable.

---

## Phase 8: User Story 6 — Visual Long-press Feedback (Priority: P3)

**Goal**: Routine cards show a visual pressed state (dimming) during long press before the menu appears.

**Independent Test**: Begin long-pressing a routine card — card dims noticeably. Release before menu threshold — card returns to normal without action firing.

- [x] T020 [US6] Update `components/routines/RoutineCard.tsx` — change the info `Pressable` style from `styles.info` to `({ pressed }) => [styles.info, pressed && styles.infoPressed]`; add `infoPressed: { opacity: 0.6 }` to StyleSheet

**Checkpoint**: US6 fully functional. All user stories complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T021 [P] Run full test suite `pnpm test` — fix any regressions; all 14+ test suites must pass
- [x] T022 [P] Run TypeScript check `pnpm tsc --noEmit` — verify zero new errors in `lib/utils/format.ts`, `lib/utils/statistics.ts`, `lib/data/exerciseSeedData.ts`, `lib/db/exercises.ts`, `components/exercises/`, `components/statistics/ExercisePickerModal.tsx`, `app/(tabs)/exercises.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 run in parallel immediately
- **Foundational (Phase 2)**: No dependencies — T003 runs immediately (independently of Phase 1)
- **US1 (Phase 3)**: Depends on T003 (seed data) for the empty-state seed button; T005/T006 run in parallel; T007 depends on T005+T006; T008 depends on T007
- **US2 (Phase 4)**: Depends on US1 (exercises tab must exist for the fallback seed button); T011 and T012 run sequentially
- **US3 (Phase 5)**: Depends on T002 (filterOutliersByIQR utility); independent of US1/US2
- **US4 (Phase 6)**: Independent of US1/US2/US3
- **US5 (Phase 7)**: Depends on T001 (formatStatNumber utility); independent of all other stories
- **US6 (Phase 8)**: Fully independent of all other stories
- **Polish (Phase 9)**: Depends on all stories complete

### User Story Dependencies

```
Phase 1 (Setup: format.ts, statistics.ts)
Phase 2 (Foundational: exerciseSeedData.ts)
  └── US1 (Exercise Management) ──── US2 (Seed — uses exercises tab)

Phase 1 → US5 (formatStatNumber → AggregateStats)
Phase 1 → US3 (filterOutliersByIQR → useStatistics)

US4 (ExercisePickerModal) — fully independent
US6 (RoutineCard pressed state) — fully independent
```

### Parallel Opportunities

- T001 and T002 (Phase 1) run in parallel
- T003 (Phase 2) runs in parallel with Phase 1
- T005 and T006 (both in US1) run in parallel
- T009 and T010 (US1 tests) run in parallel
- US3, US4, US5, US6 are all independent of each other after their respective utility dependencies

---

## Parallel Example: US1 (Phase 3)

```
# These two tasks run in parallel (different component files):
T005: Create components/exercises/ExerciseListItem.tsx
T006: Create components/exercises/ExerciseForm.tsx

# Then sequentially (screen depends on both components):
T007: Create app/(tabs)/exercises.tsx

# Then independently:
T008: Add tab to app/(tabs)/_layout.tsx

# Tests run in parallel (different test files):
T009: ExerciseListItem.test.tsx
T010: ExerciseForm.test.tsx
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: utility files
2. Complete Phase 2: seed data
3. Complete Phase 3: Exercise Management (US1)
4. Complete Phase 4: Auto-seed (US2)
5. **STOP and VALIDATE**: Users can create, edit, delete exercises; ~50 exercises auto-load on sign-in
6. Demo on phone

### Full Delivery

1. Setup + Foundational + US1 + US2 → Exercise library working
2. US3 → Statistics charts cleaned up
3. US4 → Exercise picker usable with 50+ exercises
4. US5 → Numbers legible
5. US6 → Long-press polish
6. Polish phase → all tests green, TypeScript clean
