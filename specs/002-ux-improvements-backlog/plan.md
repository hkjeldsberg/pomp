# Implementation Plan: UX Improvements & Feature Backlog

**Branch**: `002-ux-improvements-backlog` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ux-improvements-backlog/spec.md`

## Summary

Delivers 11 user stories that transform Pomp v1 from a functional logger into a polished gym app.
The active workout screen is redesigned from modal-based set entry to a fully-visible inline layout
with previous-session pre-fill; a rest timer is added; workout abort options are formalised;
history editing is enabled; routine validation prevents empty/duplicate states; the statistics
screen gains date-range filtering; and input validation prevents garbage data from entering the
database.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode)
**Primary Dependencies**: React Native 0.81.5, Expo SDK 54 (Expo Router 6), Supabase JS 2.x,
NativeWind 4, Victory Native 41 (Skia), expo-haptics (Expo SDK built-in)
**Storage**: Supabase (PostgreSQL), schema `pomp`
**Testing**: Jest (jest-expo preset) + @testing-library/react-native
**Target Platform**: iOS 15+ (iPhone 375pt–430pt); Android supported but not primary for v1
**Project Type**: Mobile app
**Performance Goals**: Optimistic UI for all set interactions; active workout screen JS thread
never blocked during timer ticks; 60 fps layout on workout screen
**Constraints**: Internet-required (no offline); rest timer notifications are in-app only (haptic
+ on-screen); < 3 s from "+" tap to active workout screen open (SC-001)
**Scale/Scope**: Single-user personal fitness app; history may reach 500+ sessions over 2 years

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | TypeScript strict enforced; all new files follow existing patterns; no file should approach 300 LOC |
| II. Performance | ✅ PASS | Rest timer uses `setInterval` (lightweight); no new synchronous work on main thread during active workout; statistics date filter applied at query layer |
| III. Accessibility | ⚠️ WATCH | New confirm-set button, rest timer tap target, and date filter chips must be ≥ 44×44pt; greyed-out placeholder text must meet contrast ratio on dark card background — verified in Phase 1 |
| IV. Security | ✅ PASS | No auth changes; all new DB queries scoped to authenticated user via existing RLS; `user_preferences` table requires same RLS policies |
| V. Maintainability | ✅ PASS | Timer logic → `lib/hooks/useRestTimer.ts`; preferences queries → `lib/db/userPreferences.ts`; screens remain logic-free; statistics filter param added to existing query functions |
| VI. Testing | ✅ PASS | All new interactive components (RestTimer, updated SetRow, DateRangeFilter) require `__tests__/` files; integration tests cover abort + auto-complete flow |

**Pre-research gate**: No blocking violations. One watch item (III) tracked to Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/002-ux-improvements-backlog/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/           # Phase 1 output (/speckit.plan)
│   └── ui-components.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (tabs)/
│   ├── index.tsx              # Logg — UPDATED: empty state wired to routine picker
│   ├── routines.tsx           # Rutiner — UPDATED: validation (empty routine, duplicate exercise)
│   └── statistics.tsx         # Statistikk — UPDATED: date range filter passed to hooks
└── workout/
    ├── [id].tsx               # Active workout — MAJOR REDESIGN: inline layout, rest timer, abort flow
    └── history/
        └── [id].tsx           # History detail — UPDATED: edit + delete set actions wired

components/
├── workout/
│   ├── ExerciseCard.tsx       # UPDATED: renders all set rows inline; no "Add Set" modal required
│   ├── SetRow.tsx             # UPDATED: placeholder text for prev values; confirm-same action
│   ├── RestTimer.tsx          # NEW: countdown display; haptic on zero; auto-stops on next set tap
│   └── __tests__/
│       ├── ExerciseCard.test.tsx  # UPDATED
│       ├── SetRow.test.tsx        # UPDATED: confirm-same, placeholder, validation states
│       └── RestTimer.test.tsx     # NEW
├── routines/
│   ├── ExercisePicker.tsx     # UPDATED: duplicate detection + user-facing message
│   └── __tests__/
│       └── ExercisePicker.test.tsx  # UPDATED
└── statistics/
    ├── DateRangeFilter.tsx    # NEW: segmented control (4 weeks / 3 months / 1 year / all time)
    └── __tests__/
        └── DateRangeFilter.test.tsx  # NEW

lib/
├── db/
│   ├── sets.ts                # UPDATED: validateSet() guard before write
│   ├── statistics.ts          # UPDATED: dateRange param on all query functions
│   └── userPreferences.ts     # NEW: getUserPreferences(), upsertUserPreferences()
└── hooks/
    ├── useActiveWorkout.ts    # UPDATED: abort/auto-complete flow; prev-session pre-fill
    ├── useRestTimer.ts        # NEW: countdown hook with per-exercise duration support
    └── useStatistics.ts       # UPDATED: accepts DateRange filter, passes to lib/db/statistics.ts

supabase/
└── migrations/
    └── 002_user_preferences.sql  # NEW: user_preferences table with RLS
```

**Structure Decision**: Mobile app with Expo Router. No new navigation routes required — all UX
improvements are additive changes to existing screens and components. One new Supabase migration
for the `user_preferences` table.

---

## Post-Design Constitution Check

*Re-evaluated after Phase 1 design artifacts are complete.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | `useRestTimer` + `userPreferences.ts` + `DateRangeFilter` are each focused, single-responsibility modules well under 300 LOC; no `any` types in contracts |
| II. Performance | ✅ PASS | Rest timer `setInterval` runs once per second — negligible cost; statistics filter applied at Supabase query layer, not in-memory; `previousSets` loaded once at session start |
| III. Accessibility | ✅ PASS (resolved) | Confirmed: confirm-same icon and RestTimer tap target specified at ≥ 44×44pt in contracts; DateRangeFilter segments min 44pt tall; placeholder text uses opacity-based dimming on existing `#E0F5F0` (not grey-on-grey — passes contrast) |
| IV. Security | ✅ PASS | `user_preferences` table has same RLS pattern as all other tables; no auth changes |
| V. Maintainability | ✅ PASS | All new logic in `lib/`; screens delegate to hooks and db functions; generated types will cover `user_preferences` after migration |
| VI. Testing | ✅ PASS | `RestTimer.test.tsx`, updated `SetRow.test.tsx`, `DateRangeFilter.test.tsx` all required; integration test for abort+auto-complete flow required |

**Post-design gate**: All principles pass. No complexity tracking entries required.
