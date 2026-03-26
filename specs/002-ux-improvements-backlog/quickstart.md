# Quickstart: UX Improvements & Feature Backlog

**Branch**: `002-ux-improvements-backlog` | **Date**: 2026-03-25

This guide orients a developer (or AI agent) to implement the changes in this feature. Read
`spec.md` for requirements, `research.md` for decisions, `data-model.md` for types and schema,
and `contracts/ui-components.md` for component interfaces.

---

## Prerequisites

- Supabase project configured with `.env.local` (see `.env.example`)
- `pnpm install` completed
- Supabase types regenerated after migration: `pnpm supabase gen types typescript --local > supabase/types.ts`

---

## Step 0: Database Migration

Apply the new migration before writing any app code:

```bash
# Local development
pnpm supabase db push

# Or apply manually via Supabase dashboard SQL editor
# File: supabase/migrations/002_user_preferences.sql
```

Regenerate types after applying:

```bash
pnpm supabase gen types typescript --local > supabase/types.ts
```

---

## Implementation Order (by priority)

Work is ordered so that each step is independently shippable and testable.

### P1 — Core Workout Flow (Stories 1–4)

**Story 1** (Home screen): Minor — verify `app/(tabs)/index.tsx` renders history in correct
order and has a visible "+" button. Empty state should route to the routine picker.

**Story 2** (Routine picker): The picker already exists as a modal. Verify: routine rows show
exercise count; tapping a routine calls `createWorkout()` and navigates without an extra
confirmation step. Add empty-state shortcut to routines tab if no routines exist.

**Story 3** (Inline active workout): Main effort for P1.
1. Update `useActiveWorkout` to load `previousSets` via `getPreviousSessionSets()` at init.
2. Update `ExerciseCard` to accept `plannedSetCount` and render all rows upfront.
3. Update `SetRow` to accept `previousValue` and `onConfirmSame`.
4. Remove modal-based set entry from `app/workout/[id].tsx`; replace with inline callbacks.
5. Write/update component tests.

**Story 4** (Completion & abort):
1. Add `abortSession(id, autoComplete)` to `useActiveWorkout`.
2. Update `app/workout/[id].tsx` abort button to show `Alert.alert` with three options.
3. Auto-complete on "All sets done" — detect in hook and surface a completion prompt.

### P2 — Incremental Improvements (Stories 5–8)

**Story 5** (Rest timer):
1. Implement `lib/hooks/useRestTimer.ts`.
2. Implement `components/workout/RestTimer.tsx`.
3. Wire into `app/workout/[id].tsx`: call `startTimer()` on `onConfirmSame` / `onToggleComplete`.
4. Add rest timer settings to `app/(tabs)/profile.tsx`.
5. Apply DB migration `002_user_preferences.sql`; implement `lib/db/userPreferences.ts`.

**Story 6** (History editing):
1. Wire `onEdit` / `onDelete` no-ops in `app/workout/history/[id].tsx` to call `updateSet()` /
   `deleteSet()` from `lib/db/sets.ts`.
2. Reload history detail after write; trigger statistics invalidation.

**Story 7** (Routine validation):
1. In `app/(tabs)/routines.tsx`: block "Save" when exercise list is empty.
2. In `components/routines/ExercisePicker.tsx`: reject duplicate selections.
3. In routine picker (home screen modal): block "Start" if routine has zero exercises.

**Story 8** (Live timer on active screen):
1. Add `startedAt` to `useActiveWorkout` (already available from the `workout` object).
2. Add a `useEffect` with `setInterval` in `app/workout/[id].tsx` to display elapsed time in
   the screen header.

### P3 — Polish (Stories 9–10)

**Story 9** (Statistics filter):
1. Add `DateRange` type and `dateRangeCutoff()` to `lib/db/statistics.ts`.
2. Update all query functions to accept optional `dateRange`.
3. Update `useStatistics` to accept and forward `dateRange`.
4. Implement `components/statistics/DateRangeFilter.tsx`.
5. Wire into `app/(tabs)/statistics.tsx`.

**Story 10** (Input validation):
1. Add `validateSetInput()` to `lib/db/sets.ts` (or `lib/validation.ts`).
2. Call it in `SetRow` before invoking confirm; display `validationError` inline.
3. Show confirmation `Alert` for weight > 500 kg.

---

## Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Specific component
pnpm test components/workout/SetRow
```

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| Active workout screen | `app/workout/[id].tsx` |
| History detail screen | `app/workout/history/[id].tsx` |
| Active workout hook | `lib/hooks/useActiveWorkout.ts` |
| Rest timer hook (new) | `lib/hooks/useRestTimer.ts` |
| Set DB queries | `lib/db/sets.ts` |
| Statistics DB queries | `lib/db/statistics.ts` |
| User preferences (new) | `lib/db/userPreferences.ts` |
| ExerciseCard component | `components/workout/ExerciseCard.tsx` |
| SetRow component | `components/workout/SetRow.tsx` |
| RestTimer component (new) | `components/workout/RestTimer.tsx` |
| DateRangeFilter (new) | `components/statistics/DateRangeFilter.tsx` |
| Supabase migration (new) | `supabase/migrations/002_user_preferences.sql` |
| Generated DB types | `supabase/types.ts` |
