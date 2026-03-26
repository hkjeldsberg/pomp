# Feature Specification: Exercise Management, Statistics Polish & UX Feedback

**Feature Branch**: `003-exercise-stats-ux`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User feedback after live testing: missing exercise creation, pre-defined exercise seed data, statistics outlier filtering, improved statistics exercise picker, large number formatting, and visual long-press feedback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Exercise Management: Create, Edit, and Delete Exercises (Priority: P1)

As a user I want to manage my exercise library — add new exercises, rename existing ones, and remove ones I no longer use. Currently there is no visible place in the app to do this.

**Why this priority**: Without the ability to manage exercises, users are stuck with whatever was pre-loaded. This is the most fundamental missing capability discovered in testing.

**Independent Test**: Navigate to the exercise library, create a new exercise called "Bulgarian Split Squat", verify it appears in the exercise picker when building a routine. Edit it to rename it. Delete it and confirm it disappears.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user navigates to the exercises section, **Then** a list of all exercises is shown with an option to create a new one.
2. **Given** the exercise list, **When** the user taps "New exercise" and enters a name, **Then** the exercise is saved and immediately available in the routine builder.
3. **Given** an existing custom exercise, **When** the user edits and renames it, **Then** the new name is reflected everywhere the exercise appears (routines, history).
4. **Given** an existing exercise, **When** the user deletes it, **Then** a confirmation is shown; after confirming, it is removed from the library (historical workout sets referencing it preserve the original name).

---

### User Story 2 — Pre-defined Exercise Library Seed (Priority: P1)

As a new user I want a comprehensive set of common exercises available from day one, so I can start building routines without manually entering every exercise. The pre-defined dataset from the project's initial setup should be importable.

**Why this priority**: An empty exercise library makes the app unusable until users manually populate it. Seeding from the existing dataset immediately delivers value.

**Independent Test**: With no exercises in the library, trigger the seed action. Verify all exercises from the dataset appear in the exercise picker. Trigger it again and confirm no duplicates are created.

**Acceptance Scenarios**:

1. **Given** an empty exercise library, **When** the seed action is triggered, **Then** all pre-defined exercises are added to the library.
2. **Given** an already-seeded library, **When** the seed action is triggered again, **Then** no duplicate exercises are created (matched by name, case-insensitive).
3. **Given** a seeded library, **When** the user opens the routine builder, **Then** all seeded exercises appear in the picker.

---

### User Story 3 — Statistics: Outlier Filtering for Duration and Volume (Priority: P2)

As a user viewing my workout trends I want anomalous sessions (e.g., a 3-minute accidental session or a forgotten timer left running for hours) excluded from the duration and volume charts, so the trend line reflects my actual training.

**Why this priority**: A single outlier can scale a chart so large that all other data points become indistinguishable, rendering statistics useless.

**Independent Test**: Create a session with duration < 5 minutes and one with duration > 300 minutes. View the duration chart — confirm neither appears. Create a session with a normal volume. Confirm it is not filtered.

**Acceptance Scenarios**:

1. **Given** a duration chart with one 2-minute session and others at 40–80 minutes, **When** statistics load, **Then** the 2-minute session is excluded.
2. **Given** a volume chart with one extreme outlier session, **When** viewing the chart, **Then** the outlier is excluded and the chart scale reflects the typical range.
3. **Given** all sessions within a normal range, **When** viewing statistics, **Then** all sessions are included and nothing is filtered.

---

### User Story 4 — Statistics: Improved Exercise Selection (Priority: P2)

As a user on the statistics screen I want a more usable way to pick which exercise to inspect. The current horizontal chip scroll is difficult to navigate when there are many exercises.

**Why this priority**: With a seeded library of many exercises, the horizontal chip list becomes unwieldy. A searchable picker dramatically improves discoverability.

**Independent Test**: With 30+ exercises seeded, open the statistics screen. Confirm the exercise picker is navigable without excessive scrolling. Search for "deadlift" and confirm it appears immediately.

**Acceptance Scenarios**:

1. **Given** 30+ exercises exist, **When** the user wants to view stats for a specific exercise, **Then** they can find it within 3 interactions without excessive horizontal scrolling.
2. **Given** the exercise picker is open, **When** the user types a name fragment, **Then** matching exercises are shown immediately.
3. **Given** an exercise is selected, **When** the user closes the picker, **Then** the charts update to reflect the selected exercise.

---

### User Story 5 — Statistics: Readable Large Number Formatting (Priority: P2)

As a user viewing cumulative statistics I want large numbers formatted readably (e.g., "12 450 kg") instead of raw integers like "12450", so I can quickly scan values.

**Why this priority**: After consistent training, aggregate numbers easily exceed 10,000. Unformatted integers are hard to parse at a glance.

**Independent Test**: Accumulate total volume exceeding 10,000 kg. View the statistics screen — confirm the number uses a thousands separator. Confirm all numeric statistics values are formatted consistently.

**Acceptance Scenarios**:

1. **Given** total volume is 12,450 kg, **When** viewing aggregate stats, **Then** it is shown as "12 450 kg" (space as thousands separator, Norwegian locale) rather than "12450".
2. **Given** a value exceeds 1,000,000, **When** displayed, **Then** it uses an abbreviated unit (e.g., "1.2 M kg") to keep it legible.
3. **Given** a value below 1,000, **When** displayed, **Then** no separator is added (e.g., "850 kg").

---

### User Story 6 — Visual Long-press Feedback (Priority: P3)

As a user I want visible confirmation that my long press was registered on interactive elements (such as routine cards) so I know the action was captured before the context menu appears.

**Why this priority**: Without visual feedback, users may repeatedly long-press not knowing if the gesture was detected, eroding trust in the interaction.

**Independent Test**: Long-press a routine card. Before the options menu appears, confirm the card visually changes (darkens or scales). Release early and confirm the card returns to normal without triggering the action.

**Acceptance Scenarios**:

1. **Given** a routine card in the list, **When** the user begins a long press, **Then** the card immediately shows a visual pressed state (dimming or scale reduction).
2. **Given** a long-pressable element, **When** the long press is released before the menu threshold, **Then** the element returns to its normal appearance without triggering the action.
3. **Given** all long-pressable interactive elements in the app, **Then** they all use the same consistent pressed visual style.

---

### Edge Cases

- What happens when a user deletes an exercise that is part of an active routine? Deletion is blocked with a message listing the affected routines.
- What if the seed data contains an exercise with the same name as a user-created one? Skip duplicates (case-insensitive name match), keep existing.
- Outlier filtering applies only to chart display — aggregate totals (total sessions, total volume card) continue to count all sessions unfiltered.
- Outlier filtering is not applied when fewer than 5 sessions exist (insufficient data for statistical significance).
- An exercise with no workout history may be deleted freely; exercises referenced in active routines are blocked from deletion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create a new exercise by providing a name (1–80 characters).
- **FR-002**: Users MUST be able to rename an existing exercise.
- **FR-003**: Users MUST be able to delete an exercise with a confirmation step; deletion MUST be blocked if the exercise is part of one or more routines.
- **FR-004**: Historical workout sets referencing a deleted or renamed exercise MUST continue to display correctly using the name at time of logging.
- **FR-005**: A pre-defined exercise dataset MUST be seedable into the library; re-seeding MUST NOT create duplicates (matched by name, case-insensitive).
- **FR-006**: The statistics duration chart MUST exclude sessions with duration less than 5 minutes or greater than 300 minutes.
- **FR-007**: The statistics volume chart MUST exclude sessions in the bottom 5th percentile by volume when the user has more than 5 sessions.
- **FR-008**: The statistics screen exercise picker MUST support text search/filter by name.
- **FR-009**: All numeric values ≥ 1,000 in statistics displays MUST be formatted with thousands separators (space, Norwegian locale); values ≥ 1,000,000 MUST use abbreviated units.
- **FR-010**: All long-pressable interactive elements MUST show an immediate visual state change on press start, consistent across the app.

### Key Entities

- **Exercise**: A named movement available in the exercise library. Has a name, a flag for whether it is user-created or pre-seeded, and relationships to routines and workout sets.
- **Seed Dataset**: A curated list of common exercises bundled with the app used to populate a fresh library without duplicating existing entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with a fresh account can find and add a common exercise (e.g., "Bench Press") to a routine within 30 seconds of seeding.
- **SC-002**: After seeding, at least 50 pre-defined exercises are available with zero duplicates.
- **SC-003**: Statistics duration and volume charts contain no data points that deviate more than 10× from the median of the visible session set (post-filter).
- **SC-004**: With 30+ exercises, a user can locate a specific exercise in the statistics picker within 3 interactions (including search).
- **SC-005**: Every numeric aggregate value ≥ 1,000 on the statistics screen uses consistent thousands formatting with no raw unformatted integers visible.
- **SC-006**: Long-press visual feedback begins within 100 ms of gesture start on all pressable elements.

## Assumptions

- The pre-defined exercise dataset already exists in the project's initial SQL seed file and does not need to be sourced externally.
- Exercise categories or muscle groups are out of scope for this iteration; a plain name is sufficient.
- Deleting an exercise that is part of a routine is blocked; the user must first remove it from all routines before deletion is allowed.
- "Outlier filtering" applies only to chart display — aggregate cards (total volume, total sessions) are unaffected.
- Thousands separator format follows Norwegian locale convention (space: "12 450") consistent with the app's existing Norwegian language.
- Long-press elements in scope for this iteration: routine cards only. Other pressable elements can be addressed in a future pass.
- The exercise management UI is accessible from the existing exercises tab (the exercise picker area or a dedicated section).
