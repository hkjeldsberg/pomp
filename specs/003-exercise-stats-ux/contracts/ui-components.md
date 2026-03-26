# UI Component Contracts: Exercise Management, Statistics Polish & UX Feedback

**Branch**: `003-exercise-stats-ux` | **Date**: 2026-03-25

---

## New Components

### `ExerciseListItem` (`components/exercises/ExerciseListItem.tsx`)

A row in the exercises tab list. Shows name and category badge. Long-press triggers edit; swipe or dedicated button triggers delete.

```typescript
interface ExerciseListItemProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  testID?: string;
}
```

**Behaviour**:
- Renders exercise name and category label
- `onEdit` fires when user taps the edit icon or long-presses the row
- `onDelete` fires when user taps delete icon; caller is responsible for confirmation dialog
- Minimum touch target for edit/delete icons: 44×44pt

**Tests required** (`components/exercises/__tests__/ExerciseListItem.test.tsx`):
1. Renders name and category without crashing
2. `onEdit` called when edit button pressed
3. `onDelete` called when delete button pressed

---

### `ExerciseForm` (`components/exercises/ExerciseForm.tsx`)

Inline form for creating or editing an exercise. Shown in a modal sheet.

```typescript
interface ExerciseFormProps {
  initialName?: string;
  initialCategory?: string;
  onSave: (name: string, category: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
  testID?: string;
}
```

**Behaviour**:
- TextInput for name (max 80 chars shown, 100 allowed by DB)
- Category picker: horizontal scrollable list of the 7 category chips
- "Lagre" button is disabled while `isSaving` is true
- Inline `error` text shown below the name input if provided
- "Avbryt" calls `onCancel`

**Tests required** (`components/exercises/__tests__/ExerciseForm.test.tsx`):
1. Renders without crashing with no initial values
2. "Lagre" calls `onSave` with entered name and selected category
3. Inline error is displayed when `error` prop is set
4. Save button is disabled when `isSaving` is true

---

### `ExercisePickerModal` (`components/statistics/ExercisePickerModal.tsx`)

A full-screen modal for selecting an exercise in the statistics screen. Replaces the horizontal chip scroll.

```typescript
interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  testID?: string;
}
```

**Behaviour**:
- TextInput at top for search/filter by name (case-insensitive substring match)
- Filtered FlatList below showing matching exercises
- Active exercise row highlighted with teal accent
- Tapping an exercise calls `onSelect` and closes the modal
- "Lukk" button or swipe-down closes without selection
- Empty state shown when search returns no matches

**Tests required** (`components/statistics/__tests__/ExercisePickerModal.test.tsx`):
1. Renders without crashing when visible
2. Search input filters the list by name
3. Tapping an exercise calls `onSelect` with correct exercise
4. Shows empty state when search matches nothing

---

## Modified Components

### `RoutineCard` (`components/routines/RoutineCard.tsx`)

**Change**: Add visual pressed state to the long-pressable info area.

```typescript
// Style callback on the Pressable wrapping name + count:
style={({ pressed }) => [styles.info, pressed && styles.infoPressed]}
```

```typescript
// New style:
infoPressed: {
  opacity: 0.6,
}
```

**Tests update** (`components/routines/__tests__/RoutineCard.test.tsx`):
- Verify `onLongPress` is still called (existing test)
- No new test required for opacity (visual only, not behaviour)

---

### `AggregateStats` (`components/statistics/AggregateStats.tsx`)

**Change**: Wrap all displayed numbers through `formatStatNumber()` before rendering.

Props are unchanged. Output changes only for values ≥ 1,000.

---

## Screen Changes

### `app/(tabs)/exercises.tsx` (new screen)

New tab screen for exercise management.

- Header: "Øvelser" title + "Ny øvelse" button (top-right or FAB)
- Body: SectionList grouped by category, each section showing category name + `ExerciseListItem` rows
- Seed button in empty state: "Last inn standardøvelser" — calls `seedExercises()`
- After seeding or after any CRUD operation: reload exercise list

### `app/(tabs)/statistics.tsx`

**Change**: Replace horizontal `FlatList` chip exercise picker with an `ExercisePickerModal` trigger.

- A single pressable row/button labelled with the selected exercise name (or "Velg øvelse") opens the modal
- `ExercisePickerModal` manages search state internally
