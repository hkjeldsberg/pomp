# Feature Specification: Pomp — Gym Workout Tracker (v1)

**Feature Branch**: `001-workout-log`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Pomp er en norsk treningslogg-app for styrketrening på gym — enkel å bruke under trening, med historikk, rutiner og progresjon."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Account & Authentication (Priority: P1)

A new user creates an account with email and password so their data is stored securely and
persists across sessions. A returning user signs in and is taken directly to the dashboard
without having to re-authenticate on every open.

**Why this priority**: Authentication is a prerequisite for all data storage and personalisation.
Without it, no other user story can deliver persistent value.

**Independent Test**: Register with a new email, sign out, sign back in — the account exists
and the user lands on the dashboard with no data loss.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they enter a valid email and password and submit the
   registration form, **Then** their account is created, a confirmation email is sent, and
   they are navigated to the main dashboard.
2. **Given** a registered user, **When** they enter correct credentials and tap sign in,
   **Then** they are authenticated and navigated to the dashboard.
3. **Given** a signed-in user who closes and reopens the app, **When** the app loads, **Then**
   they are taken directly to the dashboard without being asked to sign in again.
4. **Given** a user who enters an incorrect password, **When** they submit, **Then** they see
   a clear error message; no account data is exposed.
5. **Given** a signed-in user, **When** they tap sign out, **Then** their session ends and
   they are returned to the sign-in screen.

---

### User Story 2 — Active Workout Session (Priority: P1)

A user starts a workout session from a routine, logs each set with weight and reps, optionally
adds notes, marks sets as done, and ends the session — all in real time at the gym.

**Why this priority**: This is the core value of the app. Every other feature supports or
enriches this real-time logging loop.

**Independent Test**: Start a session from a routine, log 3 sets across 2 exercises, end the
session — all data appears in history immediately after.

**Acceptance Scenarios**:

1. **Given** a user taps "Start" on a routine, **When** the session opens, **Then** all
   exercises from that routine are listed and the session start time is recorded automatically.
2. **Given** an exercise has been performed in a previous session of the same routine,
   **When** the user views it in the active session, **Then** the previous session's weight,
   reps, and set count are displayed in a visually dimmed reference row beneath the exercise
   heading.
3. **Given** the user is logging a set, **When** they enter weight (kg) and reps and confirm,
   **Then** the set appears immediately in the set list.
4. **Given** a set has been logged, **When** the user marks it as completed, **Then** it is
   visually distinguished from incomplete sets (e.g., checkmark and distinct colour).
5. **Given** the user is logging a set, **When** they optionally fill in a note, **Then** the
   note is saved alongside the weight and reps for that set.
6. **Given** the user taps "End session" and confirms, **When** the action completes, **Then**
   the end time is recorded, all sets are persisted, and the user is shown a session summary
   or navigated to history.
7. **Given** an in-progress session, **When** the user force-closes and reopens the app,
   **Then** the session is still shown as in-progress and the user can continue logging.
8. **Given** a user wants to discard a session started by mistake, **When** they tap
   "Avbryt økt" and confirm, **Then** all sets are deleted, the session is removed, and
   the user is returned to the previous screen with no trace in history.
9. **Given** a user taps a logged set, **When** the edit view opens, **Then** the weight
   and reps inputs are pre-filled with the current values; confirming saves the updated
   values in place.

---

### User Story 3 — Routines (Priority: P2)

A user creates named workout routines containing an ordered list of exercises so they can
repeat structured workouts without re-entering exercises each time.

**Why this priority**: Routines are the primary entry point for starting sessions and unlock
the "previous session reference" feature in US2.

**Independent Test**: Create a routine with 3 exercises, start a session from it — all 3
exercises appear in the session in the correct order.

**Acceptance Scenarios**:

1. **Given** a user creates a routine with a name and at least one exercise, **When** saved,
   **Then** the routine appears in the routine list.
2. **Given** a user edits an existing routine, **When** they change the name, add, remove, or
   reorder exercises and save, **Then** the updated routine is reflected immediately.
3. **Given** a user deletes a routine, **When** confirmed, **Then** the routine is removed
   from the list; all past sessions logged under that routine remain in history.
4. **Given** a user views the routine list, **When** they tap "Start" on any routine,
   **Then** a new active session begins with that routine's exercises pre-populated.
5. **Given** a user has no routines, **When** they open the routine screen, **Then** they see
   an empty state with a prompt to create their first routine.

---

### User Story 4 — Exercise Library (Priority: P2)

A user manages a personal library of exercises categorised by muscle group so they can build
routines and understand which muscles each exercise targets.

**Why this priority**: Exercises are the building blocks of routines. A categorised library
speeds up routine creation.

**Independent Test**: Create a custom exercise in the "Back" category — it appears in the
exercise list under "Back" and is available to add to a routine.

**Acceptance Scenarios**:

1. **Given** a user creates an exercise with a name and muscle group, **When** saved, **Then**
   it appears in the exercise list and is available in the routine editor.
2. **Given** a user opens the exercise library, **When** they filter by a muscle group (e.g.,
   Back, Chest, Legs, Shoulders, Arms, Core), **Then** only exercises in that category are
   shown.
3. **Given** exercises exist, **When** no filter is active, **Then** exercises are grouped by
   muscle group by default.
4. **Given** a user tries to create an exercise whose name already exists in their library,
   **When** they submit, **Then** they see an error indicating the name is already in use.

---

### User Story 5 — Workout History (Priority: P3)

A user reviews their log of completed workout sessions to track training frequency and recall
exactly what they did in any previous session.

**Why this priority**: History provides accountability and underpins the statistics feature.
It is secondary to the active logging loop.

**Independent Test**: Complete 3 sessions — history shows all 3 newest-first with correct
date, duration, and set count. Tapping any session reveals all exercises and sets.

**Acceptance Scenarios**:

1. **Given** a user opens history, **When** the list loads, **Then** completed sessions are
   shown newest-first, each displaying date, routine name, session duration, and total set
   count.
2. **Given** a user taps a session in history, **When** the detail view opens, **Then** every
   exercise and each logged set (weight, reps, note if present) is visible.
3. **Given** a user views the history screen, **When** they tap "Start a routine", **Then**
   they can select from their routine list and begin a new session.
4. **Given** a user has no completed sessions, **When** they open history, **Then** they see
   an empty state encouraging them to complete their first workout.

---

### User Story 6 — Progress & Statistics (Priority: P3)

A user views aggregate training statistics and per-exercise progression charts to understand
training trends and strength gains over time.

**Why this priority**: Statistics add long-term motivational value but must not impact the
speed or reliability of the active workout screen.

**Independent Test**: After 5 sessions including the same exercise, the statistics screen
shows a weight progression chart and an estimated 1RM trend for that exercise.

**Acceptance Scenarios**:

1. **Given** a user opens the statistics screen, **When** it loads, **Then** they see
   aggregate totals: total sessions, total sets, total reps, and total volume (kg × reps).
2. **Given** a user views the statistics screen, **When** charts render, **Then** workout
   duration per session is plotted as a line chart over time.
3. **Given** a user views the statistics screen, **When** charts render, **Then** total volume
   (kg × reps) per session is plotted as a line chart over time.
4. **Given** a user selects an exercise, **When** its data loads, **Then** the highest weight
   lifted per session is shown as a progression chart over time.
5. **Given** a user selects an exercise, **When** its data loads, **Then** estimated 1RM per
   session is shown over time, calculated as: weight × (1 + reps ÷ 30).
6. **Given** a user selects an exercise, **When** viewing its detail, **Then** the reps per
   set from the most recent session containing that exercise are listed.

---

### Edge Cases

- What happens if a user closes the app mid-session? The session remains in-progress and is
  resumable on next open.
- What happens if weight or reps are empty when logging a set? An inline validation error is
  shown; the set is not saved until both fields are filled.
- What happens if an exercise is deleted from the library after sessions referencing it are
  logged? Historical data is retained and the exercise name still appears in history; it is
  simply no longer available for new routines.
- What happens if a routine is deleted while a session based on it is in progress? The active
  session continues; the session log retains the routine name as a label.
- What happens if the user has no internet connection? The app requires connectivity for all
  data operations in v1; the user sees a clear error message and cannot log until connectivity
  is restored.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication**

- **FR-001**: Users MUST be able to register with a valid email address and password.
- **FR-002**: The system MUST send a confirmation email upon successful registration.
- **FR-003**: Users MUST be able to sign in with correct credentials and be directed to the
  main dashboard.
- **FR-004**: Authenticated sessions MUST persist across app restarts so users are not required
  to sign in on every open.
- **FR-005**: Users MUST be able to sign out, ending their authenticated session.

**Exercise Library**

- **FR-006**: Users MUST be able to create exercises by providing a name and a muscle group
  category.
- **FR-007**: The system MUST enforce unique exercise names per user; duplicate names MUST be
  rejected with a clear error message.
- **FR-008**: Users MUST be able to view all exercises grouped by muscle group.
- **FR-009**: Users MUST be able to filter the exercise list by muscle group.
- **FR-010**: Supported muscle group categories MUST include at minimum: Back, Chest, Legs,
  Shoulders, Arms, Core.

**Routines**

- **FR-011**: Users MUST be able to create a routine with a name and at least one exercise.
- **FR-012**: Users MUST be able to add, remove, and reorder exercises within a routine.
- **FR-013**: Users MUST be able to rename a routine.
- **FR-014**: Users MUST be able to delete a routine; all historical session data linked to
  that routine MUST be preserved.
- **FR-015**: Users MUST be able to start a workout session directly from the routine list.

**Active Session**

- **FR-016**: Starting a session from a routine MUST pre-populate the session with all
  exercises from that routine, in their defined order.
- **FR-017**: Session start time MUST be recorded automatically when a session begins.
- **FR-018**: For each exercise in an active session, the system MUST display the weight, reps,
  and set count from the most recent previous session of the same routine as a dimmed
  reference.
- **FR-019**: Users MUST be able to log a set by entering weight (kg) and reps. When adding
  a new set for an exercise, the weight and reps inputs MUST pre-fill with the values from
  the most recent set already logged for that exercise in the current session (if any).
  The first set of an exercise in a session starts with blank inputs.
- **FR-020**: Users MUST be able to add an optional free-text note to any set.
- **FR-021**: Users MUST be able to mark a set as completed; completed sets MUST be visually
  distinct from pending sets.
- **FR-021a**: Users MUST be able to delete a logged set from an active session (e.g., via
  long-press or swipe-to-delete); a brief confirmation is shown before the set is removed.
- **FR-021b**: Users MUST be able to edit the weight and reps of a logged set by tapping it;
  the edit view MUST pre-fill the current values and save on confirmation.
- **FR-022**: Users MUST be able to end a session; ending it MUST record the end time and
  persist all logged sets.
- **FR-022a**: Users MUST be able to cancel (discard) an in-progress session; cancellation
  MUST delete all logged sets and the session record, returning the user to the previous
  screen with no trace in history.
- **FR-023**: An in-progress session MUST be resumable if the user closes and reopens the app.

**Workout History**

- **FR-024**: Users MUST be able to view all completed sessions in reverse chronological order.
- **FR-025**: The history list MUST display date, routine name, session duration, and total set
  count for each session.
- **FR-026**: Users MUST be able to tap a session entry to view its full detail: all exercises
  and every logged set (weight, reps, note if present).
- **FR-027**: Users MUST be able to initiate a new session from the history screen.

**Statistics**

- **FR-028**: The statistics screen MUST display aggregate totals: total session count, total
  sets, total reps, and total volume (kg × reps).
- **FR-029**: The statistics screen MUST render workout duration per session over time as a
  chart.
- **FR-030**: The statistics screen MUST render total volume (kg × reps) per session over time
  as a chart.
- **FR-031**: Users MUST be able to select any exercise and view its highest weight per session
  over time as a progression chart.
- **FR-032**: Users MUST be able to view estimated 1RM per session for a selected exercise,
  calculated as: weight × (1 + reps ÷ 30) (Epley formula).
- **FR-033**: For a selected exercise, the system MUST display the reps per set from the most
  recent session containing that exercise.

**Quality & Testability**

- **FR-034**: Every interactive interface element (buttons, inputs, toggles, form controls)
  MUST be verified by automated component-level tests covering: correct rendering, primary
  interaction behaviour, and conditional states (disabled, empty, error).
- **FR-035**: Critical user flows MUST be covered by integration tests: account sign-in/up,
  starting a session, logging a set (including failed-write recovery), and ending a session.

### Key Entities

- **User**: Authenticated individual. All data is exclusively scoped to the authenticated user.
- **Exercise**: A named movement associated with a muscle group category. Created by and owned
  by a user.
- **Routine**: A named, ordered collection of exercises used as a template to start sessions.
  Belongs to a user.
- **Session**: A completed or in-progress workout instance. Records start time, end time, and
  the routine it was based on (if any). Belongs to a user.
- **SessionExercise**: An ordered exercise entry within a session, linking the session to a
  specific exercise.
- **Set**: A single logged effort within a session exercise. Stores weight (kg), reps,
  completion status, and an optional free-text note.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can complete account creation and log their first set in under
  3 minutes.
- **SC-002**: A returning user can start a session from a routine in under 30 seconds from app
  open.
- **SC-003**: Logging a set during an active session feels instant — the logged set appears in
  the UI without any perceptible delay.
- **SC-004**: 100% of sessions explicitly ended by the user are persisted; no data loss occurs
  during normal session completion.
- **SC-005**: History and statistics screens display data within 2 seconds for users with up to
  200 logged sessions.
- **SC-006**: The app is fully usable on all iPhone widths from 375pt to 430pt.
- **SC-007**: Every interactive element meets a minimum touch target of 44×44 points.
- **SC-008**: The app uses a dark theme throughout; all text maintains high contrast against
  its background — no grey-on-grey combinations anywhere.
- **SC-009**: All user-facing text is in Norwegian (Bokmål).
- **SC-010**: All interactive interface elements (buttons, inputs, toggles, set completion
  controls) have automated tests that pass before any user story is marked complete. Critical
  flows (auth, session start, set logging, session end) have integration test coverage.

## Assumptions

- The app is Norwegian-language (Bokmål) only for v1; internationalisation is out of scope.
- An internet connection is required for all data operations in v1; offline mode is out of
  scope.
- Only one session can be active per user at a time.
- Exercises are user-created; no pre-seeded global exercise library is required for v1.
- Weight is always expressed in kilograms (kg); unit switching is out of scope for v1.
- Ad-hoc sessions are out of scope for v1; all sessions MUST be started from a pre-defined routine.
- Landscape orientation is not supported for v1.
- The Epley formula (weight × (1 + reps ÷ 30)) is the sole 1RM estimation method for v1.
- Visual design follows the Midnight Teal style guide provided with the initial brief (dark
  background, teal accent, minimal motion). Detailed colour and typography values are design
  artefacts for the planning phase.

## Clarifications

### Session 2026-03-24

- Q: When adding a new set, should weight/rep inputs pre-fill from the previous set in the
  current session, from the previous session's data, or start blank? → A: Pre-fill from
  the most recent set logged for that exercise in the current session; first set starts blank.
- Q: Should the app support ad-hoc sessions (started without a routine) in addition to
  routine-based sessions? → A: No. All sessions MUST be started from a pre-defined routine.
  Ad-hoc sessions are out of scope for v1.
- Q: Can a user delete a set they logged in error during an active session? → A: Yes —
  long-press or swipe-to-delete on a set row removes the set with brief confirmation.
- Q: Can a user cancel (discard) an in-progress session started by mistake? → A: Yes —
  "Avbryt økt" deletes all sets and the session record; no trace remains in history.
- Q: Can a user edit the weight or reps of a set after logging it? → A: Yes — tapping a
  logged set opens an inline edit with pre-filled inputs; confirming saves the updated values.
