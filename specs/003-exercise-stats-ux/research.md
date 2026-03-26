# Research: Exercise Management, Statistics Polish & UX Feedback

**Branch**: `003-exercise-stats-ux` | **Date**: 2026-03-25

---

## 1. Exercise Library Seeding Pattern

**Decision**: Use `INSERT ... ON CONFLICT (user_id, name) DO NOTHING` with a TypeScript seed function called at sign-in.

**Rationale**: The `exercises` table has `UNIQUE(user_id, name)` already. Every exercise belongs to a user (no global table exists, and none is needed due to RLS). The ON CONFLICT clause makes seeding fully idempotent — safe to call multiple times with no duplicates. Triggering it on the `SIGNED_IN` Supabase auth event in `app/_layout.tsx` ensures every new user gets the library automatically without any extra UX step.

**Alternatives considered**:
- A separate global exercises table (rejected: violates RLS model, adds schema complexity)
- A SQL migration with hardcoded `auth.uid()` placeholder (rejected: migrations run at deploy time, not per-user)
- A manual "Seed library" button in the profile screen (viable as a secondary fallback option, but primary trigger should be automatic)

**Seed dataset**: No pre-defined exercise data exists in the project. A curated list of ~50 common Norwegian-labelled exercises (matching the existing category enum: Rygg, Bryst, Ben, Skuldre, Biceps, Triceps, Magemuskler) will be created in `lib/data/exerciseSeedData.ts`.

---

## 2. Outlier Filtering Strategy

**Decision**: IQR-based filtering (Q1 − 1.5×IQR to Q3 + 1.5×IQR) implemented as a pure utility function applied post-fetch, not in the database query layer.

**Rationale**: Fixed thresholds (e.g., < 5 min) would work for duration but fail for volume where "normal" varies widely between users. IQR adapts to each user's distribution — a user who consistently trains 90-minute sessions won't have their long sessions flagged. Post-fetch filtering keeps the database layer simple and allows the aggregate totals card to continue counting all sessions unfiltered.

**Minimum session threshold**: Filtering is skipped when fewer than 5 sessions exist to avoid over-filtering sparse data.

**Location**: `lib/utils/statistics.ts` — a pure function `filterOutliersByIQR<T>(data: T[], valueKey: keyof T): T[]`. Applied inside `lib/hooks/useStatistics.ts` after fetching duration and volume points.

**Alternatives considered**:
- Fixed thresholds (rejected: too rigid, fails for volume)
- Database-layer WHERE clause (rejected: can't compute IQR in a single SQL query without CTEs; also removes data from aggregates)
- Z-score filtering (rejected: assumes normal distribution; IQR is more robust to skewed gym data)

---

## 3. Statistics Exercise Picker

**Decision**: Replace the horizontal FlatList chip scroll with a bottom-sheet style modal containing a TextInput search filter and a scrollable list of matching exercises.

**Rationale**: With 50+ exercises seeded, a horizontal chip list is unusable. A searchable modal is the standard pattern for mobile exercise selection (seen in Strong, Hevy, and other gym trackers). It reuses the existing Modal + FlatList pattern already in the routines screen.

**Component**: `components/statistics/ExercisePickerModal.tsx` — accepts `exercises`, `selectedId`, `onSelect`, `onClose` props.

**Alternatives considered**:
- Vertical scrollable chip grid (rejected: still poor for 50+ items without search)
- Dropdown/picker (rejected: React Native's built-in Picker is not suitable for long searchable lists)

---

## 4. Number Formatting

**Decision**: Create `formatStatNumber(n: number): string` in `lib/utils/format.ts` using a space as thousands separator (Norwegian locale convention).

**Rules**:
- `n < 1000` → `"850"`
- `1000 ≤ n < 1_000_000` → `"12 450"`
- `n ≥ 1_000_000` → `"1.2 M"`

**Rationale**: `Intl.NumberFormat` with `'nb-NO'` locale would work but adds runtime overhead and has inconsistent behaviour across React Native JS engines. A simple manual formatter is more predictable and testable.

**Alternatives considered**:
- `Intl.NumberFormat` (rejected: JS engine inconsistency on older Android; manual formatter is simpler and fully testable)
- Third-party number formatting library (rejected: violates Principle I — minimal dependencies)

---

## 5. Long-press Visual Feedback

**Decision**: Use `Pressable`'s `style` callback `({ pressed }) => [styles.card, pressed && styles.cardPressed]` where `cardPressed` applies `opacity: 0.75` and `transform: [{ scale: 0.98 }]`.

**Rationale**: React Native's `Pressable` provides the `pressed` state natively with no extra packages. The combination of slight dimming and scale gives clear tactile feedback consistent with iOS interaction patterns. No extra gesture library needed.

**Applies to**: `RoutineCard.tsx` long-press area (the info Pressable).

---

## 6. Exercise Management Screen

**Decision**: Add a new `app/(tabs)/exercises.tsx` tab screen listing all exercises grouped by category, with inline create, edit, and delete actions.

**Rationale**: Exercise management is a top-level concern (users will want to browse and manage their library independent of building a routine). A dedicated tab is the right scope. The existing `ExercisePicker` in routines continues to work as-is (it calls `getExercises()` which returns the updated list).

**Delete guard**: `exercises` table has `ON DELETE RESTRICT` on `routine_exercises.exercise_id` — deleting an exercise referenced in a routine will fail at the DB level. The app layer catches this error and shows a user-friendly message listing the constraint.
