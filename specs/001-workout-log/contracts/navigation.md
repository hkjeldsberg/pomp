# Contract: Navigation & Route Parameters

**Branch**: `001-workout-log` | **Date**: 2026-03-24
**Router**: Expo Router v4 (file-based)

---

## Route Tree

```
app/
├── _layout.tsx                   Root layout (auth gate)
├── (auth)/
│   ├── _layout.tsx               Stack navigator
│   ├── sign-in.tsx               → No params
│   └── sign-up.tsx               → No params
├── (tabs)/
│   ├── _layout.tsx               Tab bar (4 tabs)
│   ├── index.tsx                 Logg (history list + start CTA)
│   ├── routines.tsx              Rutiner
│   ├── statistics.tsx            Statistikk
│   └── profile.tsx               Profil
├── workout/
│   ├── [id].tsx                  Aktiv økt (presented as modal)
│   └── history/
│       └── [id].tsx              Historisk økt-detalj
└── exercises/
    ├── _layout.tsx
    └── index.tsx                 Øvelsesbibliotek
```

---

## Route Parameter Contracts

### `app/(auth)/sign-in.tsx`
- **Params**: none
- **Navigates to**: `/(tabs)` on success

### `app/(auth)/sign-up.tsx`
- **Params**: none
- **Navigates to**: `/(tabs)` on success

### `app/(tabs)/index.tsx` — Logg
- **Params**: none
- **Actions**:
  - "Start ny økt" → opens routine picker sheet → navigates to `/workout/[id]`
  - Tap session row → navigates to `/workout/history/[sessionId]`

### `app/(tabs)/routines.tsx` — Rutiner
- **Params**: none
- **Actions**:
  - Tap "Start" on routine → creates workout, navigates to `/workout/[id]`
  - Tap routine name → opens inline edit sheet (no separate route)

### `app/(tabs)/statistics.tsx` — Statistikk
- **Params**: none
- **Data fetched on mount** (lazy, per constitution Principle II)

### `app/(tabs)/profile.tsx` — Profil
- **Params**: none

### `app/workout/[id].tsx` — Aktiv økt

```typescript
type WorkoutParams = {
  id: string; // workout UUID (created before navigation)
};
```

- Presented as full-screen modal (`presentation: 'fullScreenModal'` in `_layout.tsx`)
- **Pre-condition**: Workout row already created in DB before navigating here
- **Actions**: Add set, mark complete, end session → pops modal, returns to `(tabs)/index`

### `app/workout/history/[id].tsx` — Historisk økt-detalj

```typescript
type HistoryDetailParams = {
  id: string; // workout UUID
};
```

- Push navigation (back button to history list)
- Read-only view

### `app/exercises/index.tsx` — Øvelsesbibliotek
- **Params**: none; optionally opened as sheet from routine editor
- Optional query param for pre-selecting a category filter:

```typescript
type ExercisesParams = {
  category?: string; // pre-selected filter (optional)
};
```

---

## Navigation Flows

### New User Flow
```
/sign-up → (email confirmed) → /(tabs)/index
```

### Returning User (session persisted)
```
App boot → _layout.tsx checks auth → /(tabs)/index
```

### Session Resume Flow
```
App boot → _layout.tsx checks auth →
  lib/db/workouts.ts:getOpenWorkout() →
    if open session found → /workout/[id] (full-screen modal)
    else → /(tabs)/index
```

### Start Workout from Routines Tab
```
/(tabs)/routines
  → tap "Start" on routine
  → createWorkout(routineId)  [lib/db/workouts.ts]
  → router.push('/workout/' + newWorkout.id)
```

### Start Workout from History Tab
```
/(tabs)/index
  → tap "Start rutine"
  → routine picker sheet (local modal, not a route)
  → createWorkout(selectedRoutineId)
  → router.push('/workout/' + newWorkout.id)
```

### End Workout
```
/workout/[id]
  → tap "Avslutt økt" → confirm dialog
  → endWorkout(id)  [lib/db/workouts.ts]
  → router.back() (returns to tab)
```

---

## Tab Bar Configuration

| Tab index | Route | Label | SF Symbol |
|---|---|---|---|
| 0 | `/(tabs)/index` | Logg | `list.bullet` |
| 1 | `/(tabs)/routines` | Rutiner | `rectangle.stack` |
| 2 | `/(tabs)/statistics` | Statistikk | `chart.line.uptrend.xyaxis` |
| 3 | `/(tabs)/profile` | Profil | `person.circle` |

Tab bar colours:
- Inactive icon: `#5DCAA5` (accent-muted)
- Active icon: `#20D2AA` (accent)
- Background: `#0D1F1D` (surface)
- Border top: `rgba(32,210,170,0.15)`
