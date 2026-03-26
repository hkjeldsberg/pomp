# UI Component Contracts: UX Improvements & Feature Backlog

**Branch**: `002-ux-improvements-backlog` | **Date**: 2026-03-25

These contracts define the prop interfaces for new and updated components. They are
technology-agnostic descriptions of what each component accepts and emits — implementation
details are not prescribed here.

---

## New Component: `RestTimer`

**Location**: `components/workout/RestTimer.tsx`
**Purpose**: Displays the countdown timer after a set is confirmed; emits a stop signal when
the user taps the next set row.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `secondsRemaining` | `number \| null` | yes | Current countdown value; `null` = timer not running (component renders nothing or a hidden state) |
| `isRunning` | `boolean` | yes | Whether the timer is actively counting down |
| `onStop` | `() => void` | yes | Called when the user taps the timer to dismiss it early |
| `testID` | `string` | no | For test targeting |

### Behaviour Contract
- When `secondsRemaining` is `null` or `isRunning` is `false`, the component renders nothing
  (returns `null` or a hidden placeholder).
- When `secondsRemaining` reaches `0`, the component shows a "Rest complete" visual cue (colour
  change or icon); haptics are triggered by `useRestTimer`, not this component.
- Touch target of the timer display must be ≥ 44×44pt (Principle III).
- The timer display must NOT use grey-on-grey text; minimum contrast ratio 4.5:1.

---

## Updated Component: `SetRow`

**Location**: `components/workout/SetRow.tsx`
**Purpose**: A single editable set row in the active workout screen. Now supports inline editing,
placeholder (previous-session) values, confirm-same action, and validation error display.

### New / Changed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `previousValue` | `{ weightKg: number; reps: number } \| null` | no | When provided, weight and reps fields show greyed-out placeholder text |
| `onConfirmSame` | `(() => void) \| null` | no | When provided (and `previousValue` is set), renders a confirm-same action; calling it logs the previous values as-is |
| `validationError` | `string \| null` | no | Inline error message displayed below the row (uses `Input.errorText` pattern) |
| `onWeightChange` | `(value: string) => void` | no | Called on every keystroke in the weight field (enables live validation) |
| `onRepsChange` | `(value: string) => void` | no | Called on every keystroke in the reps field |

### Retained Props (unchanged)
- `set` — the current set data
- `onToggleComplete` — mark/unmark complete
- `onEdit` — open edit action
- `onDelete` — delete action

### Behaviour Contract
- When `previousValue` is set and the user has not yet typed in either field, the weight and
  reps fields show the previous values as placeholder text (styled differently from active input —
  lower opacity or different colour, never grey-on-grey per Principle III).
- The confirm-same button/icon renders only when `previousValue` is non-null and `onConfirmSame`
  is provided.
- `validationError` text is displayed inline below the row, not in a toast or modal.
- All tappable areas (confirm-same icon, toggle) must be ≥ 44×44pt.

---

## New Component: `DateRangeFilter`

**Location**: `components/statistics/DateRangeFilter.tsx`
**Purpose**: Segmented control for selecting the statistics time window. Emits the selected range
to the statistics screen.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selected` | `DateRange` | yes | Currently selected range: `'4w' \| '3m' \| '1y' \| 'all'` |
| `onChange` | `(range: DateRange) => void` | yes | Called when the user selects a different range |
| `testID` | `string` | no | For test targeting |

### Behaviour Contract
- Renders four labelled segments: "4 uker", "3 mnd", "1 år", "Alt" (Norwegian UI strings).
- The active segment is visually distinguished (background fill or underline using the app's
  primary teal accent `#20D2AA`).
- Each segment touch target must be ≥ 44pt tall.
- When `onChange` is called, the parent is responsible for refetching data; the component itself
  is stateless.

---

## Updated Component: `ExerciseCard`

**Location**: `components/workout/ExerciseCard.tsx`
**Purpose**: Groups a full exercise's set rows in the active workout. Redesigned to render all
planned set rows upfront without requiring an "Add Set" tap.

### Changed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `plannedSetCount` | `number` | yes | Number of set rows to pre-render (default 3 if no prior session); replaces the implicit "add set" flow |
| `previousSets` | `PreviousSetValue[]` | no | Previous session values ordered by set_number; passed down to each `SetRow` as `previousValue` |
| `onConfirmSame` | `(setNumber: number) => void` | no | Forwarded to each `SetRow.onConfirmSame` |
| `onRestTimerStop` | `() => void` | no | Called when the user taps a set row input, stopping any running rest timer |

### Retained Props (unchanged)
- `exercise` — exercise data (name, id)
- `sets` — currently logged sets
- `onLogSet`, `onEditSet`, `onDeleteSet`, `onToggleComplete` — CRUD callbacks

### Behaviour Contract
- Renders exactly `Math.max(plannedSetCount, loggedSets.length)` set rows, always.
- Rows with an existing logged set show current values; rows without a logged set show the
  previous session value as placeholder (or empty fields if none).
- "Add Set" button is removed from this component; additional rows beyond the plan are added
  via a separate mechanism (e.g., a "+" icon at the card footer, out of scope for P1).

---

## Updated Hook: `useActiveWorkout`

**Location**: `lib/hooks/useActiveWorkout.ts`
**See also**: `data-model.md` → "Updated `useActiveWorkout` Interface"

### New Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `confirmSame` | `(exerciseId: string, setNumber: number) => Promise<void>` | Logs the previous session's values for this set as-is; marks complete |
| `abortSession` | `(id: string, autoComplete: boolean) => Promise<void>` | Ends session; if `autoComplete=true`, marks all incomplete sets complete using their current/placeholder values first |

### Invariant
- `previousSets` map is populated once at load time from `getPreviousSessionSets()` and does
  not change during the session.
- `abortSession` with `autoComplete=true` MUST NOT make additional DB writes for sets that were
  already marked complete.

---

## Hook: `useRestTimer`

**Location**: `lib/hooks/useRestTimer.ts`
**See also**: `data-model.md` → "`useRestTimer` Hook Interface"

### Behaviour Contract
- Timer uses `Date.now()` as reference, not accumulated `setInterval` ticks, to remain accurate
  after backgrounding.
- Calling `startTimer()` while a timer is running resets it (user completed another set quickly).
- `expo-haptics.notificationAsync(NotificationFeedbackType.Success)` is triggered when
  `secondsRemaining` transitions to `0`.
- When `enabled` is `false` in `RestTimerConfig`, `startTimer()` is a no-op.
