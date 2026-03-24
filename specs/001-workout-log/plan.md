# Implementation Plan: Pomp — Gym Workout Tracker (v1)

**Branch**: `001-workout-log` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-workout-log/spec.md`

## Summary

Pomp is a Norwegian-language iOS gym workout tracker. Users log sets in real time during
active sessions, manage reusable routines, review workout history, and track strength
progression via charts. Built with Expo Router (file-based navigation), TypeScript strict,
NativeWind v4 (Midnight Teal dark theme), and Supabase (schema `pomp`, RLS on all tables).
Historical training data (~3,646 rows from a CSV export) is seeded once via a ts-node import
script. Charts use `victory-native` (Victory Native XL) — Skia + Reanimated v3 crosshair
interactions run on the UI thread, which is critical for smooth chart scrubbing. Optimistic UI updates ensure zero-perceptible-latency set logging during workouts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React Native via Expo SDK 52
**Primary Dependencies**: Expo Router v4, NativeWind v4, Supabase JS v2,
  victory-native + @shopify/react-native-skia, Expo Reanimated v3, ts-node (import script only)
**Storage**: Supabase Postgres — schema `pomp`; tables: `exercises`, `routines`,
  `routine_exercises`, `workouts`, `workout_sets`
**Testing**: Jest (Expo preset) + `@testing-library/react-native` — unit tests for
  `lib/calculations.ts` and `lib/db/`; component tests REQUIRED for all interactive
  components in `components/ui/`, `components/workout/`, `components/routines/`,
  `components/statistics/`; integration tests for auth, active session, and end-session flows
**Target Platform**: iOS (iPhone 375pt–430pt), Expo managed workflow, EAS Build + TestFlight
**Project Type**: Mobile app (Expo managed)
**Performance Goals**: Set logging reflected in UI < 100ms (optimistic local state);
  stats/charts load < 2s for 200 sessions
**Constraints**: Online-only (v1); single active session per user at a time;
  all data scoped via RLS; landscape orientation not supported
**Scale/Scope**: Personal app (~1 user initially); ~200 sessions, ~3,646 historical rows
  at import time; pnpm as package manager

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality

- [x] `tsconfig.json` MUST have `"strict": true`; `tsc --noEmit` MUST pass with zero errors
- [x] No `any` in production source (`lib/`, `components/`, `app/`); linter rule enforced
- [x] All exported functions in `lib/` MUST have explicit return types
- [x] No single source file (`*.ts`, `*.tsx`) may exceed 300 lines — enforced by code review
- [x] One chart library only: `victory-native` (Victory Native XL — see Complexity Tracking
  for rationale on Skia dependency)
- [x] All commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)

### II. Performance

- [x] `app/workout/[id].tsx` MUST write set to local React state first (optimistic) then call
  `lib/db/sets.ts` — Supabase write is fire-and-forget with error rollback
- [x] No synchronous computation on main thread during active session; Epley/volume
  calculations run in `lib/calculations.ts` synchronously but are O(n) trivial
- [x] `(tabs)/statistics.tsx` MUST lazy-load: `useStatistics` hook fetches ONLY when the
  tab is first mounted; no pre-fetch on app boot

### III. Accessibility & Mobile-first

- [x] All `Pressable` / `TouchableOpacity` components MUST set `minHeight: 44, minWidth: 44`
  (enforced via shared `Button` and `Card` components in `components/ui/`)
- [x] Midnight Teal palette verified high-contrast: primary text `#E0F5F0` on `#071412`
  background = contrast ratio > 10:1 (passes WCAG AA/AAA)
- [x] All layouts MUST be tested on iPhone SE (375pt) and iPhone 15 Pro Max (430pt) via
  Expo Go / Simulator before marking a user story complete

### IV. Security & Privacy

- [x] Auth exclusively via `supabase.auth` — no custom session storage or token management
- [x] `.env.local` MUST be in `.gitignore`; `.env.example` MUST exist with placeholder values
- [x] All 5 tables in schema `pomp` MUST have RLS enabled with `user_id = auth.uid()` policy
- [x] No API keys, tokens, or Supabase URLs in source code — only read from env vars

### V. Maintainability

- [x] All DB queries isolated in `lib/db/` — route files (`app/**/*.tsx`) MUST NOT contain
  Supabase calls directly
- [x] DB types imported from `supabase/types.ts` (generated via `supabase gen types
  typescript --schema pomp`) — no hand-written DB type declarations
- [x] All queries target schema `pomp`; verified by generated types namespace
- [x] `components/` for shared UI, `lib/` for business logic, `lib/db/` for queries —
  no cross-contamination

### VI. Testing

- [x] `@testing-library/react-native` installed; Jest Expo preset configured
- [x] All interactive components in `components/ui/`, `components/workout/`,
  `components/routines/`, `components/statistics/` MUST have `__tests__/` directories with
  component tests covering: renders, primary interaction, conditional states
- [x] Integration tests MUST cover: auth sign-in/up, create + start session, log set with
  optimistic update + error rollback, end session
- [x] A user story MUST NOT be marked complete until all component tests introduced in that
  story are written and passing (`pnpm test` passes)
- [ ] ⚠ Tests not yet written — to be created per task during `/speckit.tasks` phase

**Result: All gates PASS (VI pending implementation — test files to be created per task).
No blocking violations. Proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-log/
├── plan.md           ← this file
├── research.md       ← Phase 0 output
├── data-model.md     ← Phase 1 output
├── quickstart.md     ← Phase 1 output
├── contracts/        ← Phase 1 output
│   ├── supabase-queries.md
│   └── navigation.md
└── tasks.md          ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                     # Root layout — auth gate, theme provider
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── (tabs)/
│   ├── _layout.tsx                 # Tab bar config
│   ├── index.tsx                   # Logg — workout history list + start session CTA
│   ├── routines.tsx                # Rutiner — routine list + create/edit
│   ├── statistics.tsx              # Statistikk — charts, lazy-loaded
│   └── profile.tsx                 # Profil — sign out, settings placeholder
├── workout/
│   ├── [id].tsx                    # Aktiv økt — full-screen modal
│   └── history/
│       └── [id].tsx                # Historisk økt-detalj
└── exercises/
    ├── _layout.tsx
    └── index.tsx                   # Øvelsesbibliotek — list + create

components/
├── ui/
│   ├── Button.tsx                  # Primary/secondary buttons, min 44×44pt
│   ├── Card.tsx                    # Surface card, teal border
│   ├── Input.tsx                   # Text input, dark theme
│   └── EmptyState.tsx              # Empty list states
├── workout/
│   ├── SetRow.tsx                  # Single set row (weight, reps, note, complete toggle)
│   ├── ExerciseCard.tsx            # Exercise section header in active session
│   └── PreviousSetReference.tsx    # Dimmed reference row (last session data)
├── routines/
│   ├── RoutineCard.tsx             # Routine list item + Start button
│   └── ExercisePicker.tsx          # Exercise selection modal for routine editor
└── statistics/
    ├── ProgressionChart.tsx        # Line chart (weight / 1RM over time)
    └── AggregateStats.tsx          # Total sessions/sets/reps/volume summary

lib/
├── calculations.ts                 # Epley 1RM, volume, duration helpers
├── db/
│   ├── exercises.ts               # CRUD for exercises
│   ├── routines.ts                # CRUD for routines + routine_exercises
│   ├── workouts.ts                # Create/end/resume workout sessions
│   ├── sets.ts                    # Log/update/delete sets
│   └── statistics.ts              # Aggregate queries for statistics screen
└── hooks/
    ├── useActiveWorkout.ts         # Manages active session state (optimistic)
    ├── useWorkoutHistory.ts        # Fetches completed sessions list
    └── useStatistics.ts            # Lazy-fetches stats data for charts

supabase/
├── migrations/
│   └── 001_initial_schema.sql     # Schema, tables, RLS policies
└── types.ts                       # Generated: `supabase gen types typescript --schema pomp`

scripts/
└── import-csv.ts                  # One-off historical data importer (ts-node)

csv/
└── data/
    └── rep_history.csv            # Source data (3,646 rows, semicolon-delimited)

.env.example                       # SUPABASE_URL, SUPABASE_ANON_KEY placeholders
.env.local                         # gitignored — real keys
tailwind.config.js                 # Midnight Teal theme tokens
babel.config.js                    # NativeWind transform
metro.config.js                    # NativeWind + Expo metro config
```

**Structure Decision**: Mobile app layout — Expo Router file-based, single project root.
No backend/frontend split needed; Supabase replaces the backend entirely. The `lib/db/`
layer isolates all Supabase logic per constitution Principle V.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| NativeWind v4 (external styling dep) | Consistent utility-class dark theme across all components; Midnight Teal tokens as Tailwind config eliminates per-component colour duplication | `StyleSheet` API alone requires duplicating colour values in every component — violates DRY and makes theme changes error-prone |
| victory-native + @shopify/react-native-skia (external chart dep) | Line charts for 4 progression metrics with smooth UI-thread crosshair scrubbing (Skia + Reanimated v3) — not available in Expo SDK or React Native built-ins | No built-in chart primitive in RN; SVG-from-scratch exceeds 300-line limit; gifted-charts crosshair runs on JS thread and stutters during gym use |
| ts-node import script (external dev dep) | One-off CSV parsing and bulk Supabase upsert for 3,646 historical rows | Manual data entry is infeasible; the script is a dev-only artefact and does not ship in the app bundle |
