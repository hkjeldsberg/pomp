# Research: UX Improvements & Feature Backlog

**Branch**: `002-ux-improvements-backlog` | **Date**: 2026-03-25

## Decision 1: Rest Timer Implementation

**Decision**: Use `setInterval` with a wall-clock reference (`Date.now()`) inside a custom hook
`useRestTimer`, combined with `expo-haptics` for vibration feedback when the timer reaches zero.

**Rationale**: `setInterval` is sufficient for a ≥ 1-second countdown — precision beyond 1 s is
not required by the spec. Using `Date.now()` as the reference rather than an accumulator prevents
drift when the app is backgrounded (matches the requirement in FR-024 for the elapsed timer). No
additional third-party package is required: `expo-haptics` ships with Expo SDK 54 and is already
evaluated as compliant with Principle I (prefer Expo built-ins).

**Alternatives considered**:
- `expo-notifications` (local scheduled notifications): Out of scope per spec Assumptions; would
  require background permissions and significantly more setup.
- `react-native-background-timer`: Unnecessary third-party dependency; Expo's AppState +
  wall-clock reference achieves the same accuracy.
- `Animated` / `react-native-reanimated` timer: Only needed if the countdown UI requires 60 fps
  animation — a simple integer second display does not.

---

## Decision 2: Inline Active Workout Screen (No Modal for Set Entry)

**Decision**: Replace the current modal-based set entry in `app/workout/[id].tsx` and
`components/workout/ExerciseCard.tsx` with an inline scrollable list. Each set row becomes an
editable row with `TextInput` fields for weight and reps, pre-populated with greyed-out previous
values. A "confirm same" checkmark icon appears beside each unedited row.

**Rationale**: The spec (Story 3) defines this as a P1 requirement. The current `ExerciseCard`
component already renders a set list — the change is to render _all planned set rows_ upfront
(defaulting to 3 per exercise where no prior session exists) instead of requiring the user to tap
"Add Set" per row. The `useActiveWorkout` hook's optimistic update pattern is preserved; the only
change is when the write is triggered (on confirm rather than modal save).

**Alternatives considered**:
- Keep modal, improve it: Would not satisfy Story 3 acceptance criteria (full plan visible without
  additional taps).
- Drawer/bottom sheet per exercise: Partial improvement but still hides the full plan.

---

## Decision 3: Previous-Session Pre-fill Wiring

**Decision**: Load previous-session values via `getPreviousSessionSets(routineId, exerciseId)`
(already implemented in `lib/db/workouts.ts`) at workout start, store them in `useActiveWorkout`
state keyed by `exercise_id + set_number`, and pass them as `placeholder` props to each `SetRow`.

**Rationale**: The DB function already exists. The only missing piece is calling it during the
active workout load phase and threading the data down to `SetRow`. The "confirm same" action
writes the placeholder values to the DB as a completed set, satisfying FR-007 without any new
DB query.

**Alternatives considered**:
- Fetch previous values lazily per exercise card: Creates multiple waterfall requests; upfront
  parallel fetch is simpler and faster.

---

## Decision 4: Abort with Auto-Complete Logic

**Decision**: Add an `abortSession` function to `useActiveWorkout` that accepts an
`autoComplete: boolean` parameter. When `true`, all uncompleted set rows are marked complete
with their current input values (or placeholder fallback), then the session is ended via
`endWorkout()`. When `false`, the session is ended as-is. The choice is presented to the user
via an `Alert.alert` dialog in the screen component.

**Rationale**: The existing `cancelWorkout()` deletes all data — this is different from abort.
A new `abortSession` function is needed. Auto-completion only touches in-memory state before the
final `endWorkout()` write, so no additional DB round-trips are required beyond what `endWorkout`
already does.

**Alternatives considered**:
- New `abortWorkout(id, autoComplete)` DB function: Adds complexity to the query layer for
  logic that is already available in the hook's local state.

---

## Decision 5: User Preferences Storage

**Decision**: Add a `user_preferences` table to the `pomp` Supabase schema (one row per user).
Columns: `user_id` (PK), `rest_timer_seconds` (int, default 90), `rest_timer_enabled` (bool,
default true). A new `lib/db/userPreferences.ts` module provides `getUserPreferences()` and
`upsertUserPreferences()`.

**Rationale**: The spec requires both a global rest timer duration setting (FR-015) and the
ability to disable the timer (FR-016). Storing preferences in Supabase ensures they persist
across devices and reinstalls, consistent with the app's existing Supabase-only data model.
RLS ensures only the authenticated user can read or write their own preferences row.

**Alternatives considered**:
- `AsyncStorage` (device-local): Would lose preferences on reinstall and not sync across
  devices — inconsistent with the rest of the app's data model.
- `expo-secure-store`: Designed for sensitive credentials; overkill for timer preferences.

---

## Decision 6: Statistics Date Range Filtering

**Decision**: Add a `DateRange` union type (`'4w' | '3m' | '1y' | 'all'`) to the statistics
query layer. Each function in `lib/db/statistics.ts` accepts an optional `dateRange` parameter
and applies a `WHERE started_at >= [cutoff]` filter. The `useStatistics` hook forwards this
parameter. A new `DateRangeFilter` component renders a segmented control; the statistics screen
stores the selected range in local state.

**Rationale**: The filter is a pure query-layer concern. No schema change is required — `started_at`
is already indexed. Applying the filter in the DB query (not in-memory) keeps data transfer
minimal for users with large history.

**Alternatives considered**:
- In-memory filtering: Downloads all sessions and filters client-side. Inefficient at scale and
  inconsistent with how Supabase is used elsewhere.
- Date picker (custom range): Greater complexity than the spec requires; the four preset windows
  satisfy SC-009 and are standard in fitness apps.

---

## Decision 7: History Set Editing Architecture

**Decision**: Wire the `onEdit` and `onDelete` callbacks that already exist as no-ops in
`app/workout/history/[id].tsx`'s `SetRow` usage to call `updateSet()` and `deleteSet()` from
`lib/db/sets.ts` (already implemented). Display an edit sheet (reusing the existing modal
pattern) and a confirmation `Alert` for delete. After write, invalidate and refresh the
`getWorkoutDetail` call and trigger a statistics reload.

**Rationale**: The DB functions and component callbacks are already defined; this is purely a
matter of wiring. The pattern matches the active workout screen's edit flow, keeping the codebase
consistent. Statistics are reloaded after edit/delete to satisfy FR-019.

**Alternatives considered**:
- Optimistic updates in history view: More complex to implement for a non-time-critical screen;
  standard reload-after-write is sufficient here.

---

## Decision 8: Routine Validation

**Decision**: Add client-side guards in `app/(tabs)/routines.tsx`:
1. On "Save routine": check that `selectedExerciseIds.length > 0` before calling
   `createRoutine` / `updateRoutine`; show inline error if empty.
2. In `ExercisePicker.onToggle`: if the toggled exercise is already selected, reject the toggle
   and show a brief in-component message (not a full modal alert).
3. On "Start workout": guard in `app/(tabs)/index.tsx` (or the routine picker) to check exercise
   count before calling `createWorkout`.

**Rationale**: These are front-end validation guards — no schema changes required since the DB
already permits zero exercises (the constraint needs to be enforced at the app layer per the spec
Assumptions). Client-side validation is fast and aligns with how input validation is handled
elsewhere.

---

## Decision 9: Input Validation for Set Save

**Decision**: Add a `validateSetInput(weight_kg: number, reps: number)` utility in `lib/db/sets.ts`
(or a separate `lib/validation.ts`) that:
- Returns an error string if `reps < 1`
- Returns a warning flag if `weight_kg > 500`
- Returns an error if either field is empty/NaN

The active workout `SetRow` calls this before invoking the hook's confirm action. The error is
displayed inline on the `SetRow` (via the `Input` component's existing `errorText` prop).

**Rationale**: The `Input` component already supports `errorText` display. Validation logic
belongs in `lib/` per Principle V, not inline in the component.

---

## Resolved Unknowns

All NEEDS CLARIFICATION items from Technical Context have been resolved:

| Item | Resolution |
|------|-----------|
| Rest timer library | `expo-haptics` (Expo SDK) + `setInterval` — no new dependency |
| User preferences storage | New `user_preferences` Supabase table |
| Abort vs cancel distinction | `abortSession(autoComplete)` in `useActiveWorkout` |
| Per-exercise rest override | Long-press on exercise card → rest seconds override stored in local hook state during session (not persisted to DB in v1 — deferred) |
| Statistics filter location | Query-layer parameter in `lib/db/statistics.ts` |
| History editing trigger | Wire existing no-op callbacks in `history/[id].tsx` |
