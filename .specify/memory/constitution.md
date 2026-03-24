<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Modified principles: none renamed
Added sections:
  - Principle VI: Testing (new) — component-level tests required for all interactive UI elements
Removed sections: N/A
Templates reviewed:
  - .specify/templates/plan-template.md         ✅ aligned — Constitution Check adds VI gate
  - .specify/templates/spec-template.md         ✅ aligned — no structural changes needed
  - .specify/templates/tasks-template.md        ✅ updated — component tests now REQUIRED
  - .specify/templates/agent-file-template.md   ✅ no changes needed
  - .claude/commands/speckit.plan.md            ✅ no changes needed
  - .claude/commands/speckit.specify.md         ✅ no changes needed
  - specs/001-workout-log/plan.md               ✅ updated — VI gate added, Testing context updated
  - specs/001-workout-log/spec.md               ✅ updated — FR-034 + SC-010 added
  - CLAUDE.md                                   ✅ updated — testing requirement noted
Follow-up TODOs:
  - tasks.md for 001-workout-log not yet generated; when created via /speckit.tasks, component
    test tasks MUST be included for all interactive components (not marked optional).
-->

# Pump Constitution

## Core Principles

### I. Code Quality

TypeScript strict mode is MANDATORY — `any` is forbidden; all functions MUST declare explicit
return types. No single source file may exceed 300 lines; files approaching the limit MUST be
split into focused modules before the limit is reached. All commits MUST follow
[Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`,
`docs:`, `style:`, `refactor:`, `test:`. A commit MUST be made after each major feature or
implementation phase. New features MUST NOT modify core/shared modules unless strictly
necessary — isolate changes to feature-specific code. External dependencies MUST be minimised;
prefer Expo SDK and React Native built-ins over third-party packages.

**Rationale**: Strict typing prevents runtime errors in a domain (workout logging) where data
correctness is critical. Small files and conventional commits reduce cognitive load and make
automated changelogs reliable.

### II. Performance

Workout logging interactions MUST use optimistic UI updates — the UI MUST reflect the user's
action before Supabase confirms the write. No synchronous or long-running work is permitted on
the main (JS) thread during an active workout session. Statistics and chart screens MUST be
lazy-loaded; they MUST NOT be fetched or rendered until the user navigates to them.

**Rationale**: The active workout screen is the core UX. Any perceptible delay during a set or
rep log breaks user trust. Heavy data processing belongs on background threads or deferred
loads.

### III. Accessibility & Mobile-first

Every interactive element MUST have a minimum touch target of 44×44pt (iOS HIG standard).
Text MUST maintain high contrast against its background — grey-on-grey combinations are
forbidden. The app is designed for iPhone at 375pt–430pt width; all layouts MUST render
correctly within this range. Landscape orientation is out of scope for v1.

**Rationale**: Fitness apps are used mid-workout with sweaty hands and poor lighting conditions.
Accessible touch targets and contrast are non-negotiable for usability, not just compliance.

### IV. Security & Privacy

Authentication MUST be handled exclusively via Supabase Auth. Custom session management is
forbidden. Session tokens MUST NOT be exposed in logs, source code, or committed to version
control. All data queries MUST be scoped to the authenticated user via Row Level Security (RLS)
policies in Supabase. `.env.local` MUST be gitignored; all required environment variables MUST
be documented in `.env.example` with placeholder values only.

**Rationale**: User workout data is personal health information. RLS enforces data isolation at
the database level as a hard guarantee, not a soft application-layer convention.

### V. Maintainability

Folder structure MUST follow Expo Router conventions. Shared UI components belong in
`components/`; business logic belongs in `lib/`; all Supabase queries belong in `lib/db/`.
Route and screen files MUST contain no business logic — all non-trivial logic MUST be
delegated to `lib/` functions. All Supabase queries MUST use types generated via
`supabase gen types`; manual type declarations for database shapes are forbidden. All tables
MUST reside in the `pomp` schema.

**Rationale**: Clear separation of concerns lets the codebase scale without screens becoming
god-objects. Generated types ensure the application stays in sync with the database schema
without manual maintenance.

### VI. Testing

Every interactive UI component in `components/` MUST have component-level tests. A component
is considered interactive if it accepts any user input — including press, tap, text entry,
toggle, swipe, or gesture. Tests MUST be co-located in a `__tests__/` directory adjacent to
the component file. Each test suite MUST cover at minimum:

1. The component renders without crashing.
2. The primary user interaction (press, input, etc.) triggers the expected callback or state
   change.
3. Conditional rendering (e.g., disabled state, empty state, error state) is correct.

Integration tests MUST be written for critical user flows: authentication, starting an active
session, logging a set (including optimistic update + rollback), and ending a session.
Test tooling: `@testing-library/react-native` with the Jest Expo preset.

**Rationale**: Workout logging is performed under time pressure at the gym. Silent breakage
in interactive components (e.g., a "Mark complete" button that stops firing) would only be
caught by the user mid-workout. Automated component tests catch regressions before they ship.

## Technology Stack

- **Runtime**: React Native via Expo SDK (latest stable)
- **Language**: TypeScript (strict mode — see Principle I)
- **Navigation**: Expo Router (file-based routing)
- **Backend/Auth/DB**: Supabase — schema `pomp`
- **DB Types**: Generated via `supabase gen types typescript`
- **Target Platform**: iOS (iPhone 375pt–430pt); Android supported but not primary for v1
- **Package Manager**: pnpm (with `node-linker=hoisted` and `shamefully-hoist=true` in `.npmrc`)
- **Testing**: Jest (Expo preset) + `@testing-library/react-native`

New dependencies MUST be evaluated against Principle I (minimal external deps) before
introduction. Any dependency that duplicates Expo SDK or React Native built-in functionality
MUST be rejected.

## Development Workflow

- **Branching**: Feature branches created via `/speckit.specify`; sequential numbering
  (`###-feature-name`) as configured in `.specify/init-options.json`
- **Commit discipline**: Conventional Commits format enforced; commits made after each
  implementation phase (see Principle I)
- **Specs first**: All features MUST have a spec (`/speckit.specify`) before planning
  (`/speckit.plan`) and tasks (`/speckit.tasks`)
- **Constitution Check**: Every implementation plan MUST include a Constitution Check gate
  verifying compliance with all six principles before Phase 0 research begins
- **Review gate**: PRs MUST NOT be merged with unresolved constitution violations. Justified
  violations MUST be documented in the plan's Complexity Tracking table
- **Test gate**: A user story MUST NOT be marked complete unless all component tests for
  interactive elements introduced in that story are written and passing

## Governance

This constitution supersedes all other development practices and informal conventions.
Amendments require: (1) a documented rationale, (2) a version bump per the policy below,
(3) a migration note if existing code must change to comply.

**Versioning policy**:
- **MAJOR** (x.0.0): Backward-incompatible governance change — principle removed, redefined,
  or fundamentally scoped differently
- **MINOR** (x.y.0): New principle or section added; material expansion of existing guidance
- **PATCH** (x.y.z): Clarifications, wording improvements, typo fixes, non-semantic refinements

All PRs and code reviews MUST verify compliance with this constitution. Complexity or
violations that cannot be avoided MUST be justified in the plan's Complexity Tracking table.
Use `.specify/memory/constitution.md` as the authoritative runtime reference during development.

**Version**: 1.1.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
