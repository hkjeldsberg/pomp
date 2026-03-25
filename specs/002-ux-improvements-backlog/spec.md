# Feature Specification: UX Improvements & Feature Backlog

**Feature Branch**: `002-ux-improvements-backlog`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Based on the current code base, can you make a new file with questions or potential features that another claude code session could easily read from and start implementing? Consider anything from improved user friendlyness to edge cases."

## Purpose

This document is a prioritized backlog of UX improvements and missing features for Pomp v1. Stories 1–5 define the intended core workout flow and should be treated as the product's north-star UX. Stories 6–11 are incremental improvements that can be implemented independently in any order.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Home Screen: Workout History and Start Button (Priority: P1)

When the user opens the app they immediately see their past workout history in chronological order. A prominent "+" button starts the new-workout flow. This is the app's entry point and must feel fast and clear.

**Why this priority**: The home screen is the first thing every user sees on every session. It sets the tone for the entire app. Currently the history list exists but the visual hierarchy and start-workout entry point need to be clearly defined.

**Independent Test**: Open the app with an account that has 3 completed workouts. Confirm the history list shows all 3 in reverse-chronological order with date, routine name, and duration visible. Confirm a clearly labelled "+" or "New workout" button is accessible without scrolling.

**Acceptance Scenarios**:

1. **Given** the user opens the app, **When** the home screen loads, **Then** a list of completed workouts is shown in reverse-chronological order, each row showing date, routine name, set count, and duration
2. **Given** the user has no completed workouts yet, **When** the home screen loads, **Then** an empty state is shown with a clear prompt to start their first workout
3. **Given** the home screen is visible, **When** the user taps the "+" button, **Then** the routine picker opens immediately (see Story 2)
4. **Given** the user taps a past workout in the list, **When** the detail screen opens, **Then** the full workout history detail is shown

---

### User Story 2 - Routine Selection to Start a Workout (Priority: P1)

After tapping "+" the user is shown their list of available routines. Tapping one immediately starts an active workout session based on that routine.

**Why this priority**: This is the single most frequent action in the app. The transition from "I want to work out" to "workout has started" must be as frictionless as possible — ideally one tap after the "+" button.

**Independent Test**: With 3 routines created, tap "+", confirm all 3 routines are listed with their names and exercise counts, tap one, and confirm the active workout screen opens with the correct exercises loaded.

**Acceptance Scenarios**:

1. **Given** the routine picker is open and the user has routines, **When** the list renders, **Then** each routine is shown with its name and the number of exercises it contains
2. **Given** the user taps a routine in the picker, **When** the selection is confirmed, **Then** a new active workout session begins and the active workout screen opens immediately — no additional confirmation step
3. **Given** the user has no routines and opens the routine picker, **When** the empty state is displayed, **Then** a "Create your first routine →" shortcut is shown so the user does not need to navigate away manually

---

### User Story 3 - Active Workout Screen: Full Routine Layout Visible Upfront (Priority: P1)

When a workout starts, the active workout screen shows the entire routine structure — every exercise and every planned set — as a scrollable list. The user does not need to open a modal or tap to reveal what comes next. Each set row is pre-populated with the previous session's numbers shown in a greyed-out placeholder style, ready for the user to confirm or override.

**Why this priority**: The current design requires the user to add each set through a modal, which hides the workout plan and creates unnecessary taps. Showing the full plan upfront matches how athletes think: they already know what they're doing and just need to record it.

**Independent Test**: Start a workout from a routine that has 3 exercises with 4 sets each. Confirm the screen shows all 3 exercises and all 12 set rows immediately without any additional taps. If a previous session exists, confirm weight/rep fields show greyed-out previous values.

**Acceptance Scenarios**:

1. **Given** a workout starts from a routine with exercises and planned sets, **When** the active workout screen opens, **Then** all exercises are listed in routine order, each with all their planned set rows pre-rendered and visible without tapping
2. **Given** the user performed this routine in a previous session, **When** the workout screen loads, **Then** each set row displays the previous session's weight and reps as greyed-out placeholder text within the input fields
3. **Given** the user has never done this routine before, **When** the workout screen loads, **Then** set rows show empty input fields with no placeholder values
4. **Given** the user taps into a weight or reps field, **When** they start typing, **Then** the greyed-out previous value is replaced by the user's live input and the field styling changes to indicate active entry
5. **Given** the user wants to confirm the same values as last time, **When** they tap a "confirm" or checkmark action on a set row, **Then** the previous session's values are accepted as-is and the set is marked complete — no retyping required
6. **Given** the workout screen is open, **When** the user views the header, **Then** a live elapsed timer showing current workout duration is visible (see Story 9 for timer detail)

---

### User Story 4 - Workout Completion: Natural Finish vs Abort (Priority: P1)

When all sets in the routine are marked complete, the app automatically prompts the user to finish the session. If the user wants to stop early, an "Abort workout" option is available at any time; tapping it asks whether to auto-complete the remaining unchecked sets before saving.

**Why this priority**: The current "End workout" button exists but there is no distinct flow for natural completion vs early termination. This distinction is important: auto-completing sets on abort preserves a clean history record rather than having partial-set workouts that distort statistics.

**Independent Test**: Start a workout with 2 exercises, complete all sets on the first exercise only, then tap "Abort". Confirm the dialog asks "Auto-complete remaining sets?". Select "Yes" and confirm the workout is saved with all sets marked complete. Then repeat and select "No" and confirm only the manually completed sets are saved.

**Acceptance Scenarios**:

1. **Given** the user has marked every set in the routine as complete, **When** the last set is checked off, **Then** a "Finish workout" prompt appears automatically
2. **Given** the "Finish workout" prompt appears, **When** the user confirms, **Then** the session end time is recorded, the workout is marked complete, and the user is returned to the home screen where the new session appears at the top of the history list
3. **Given** the user wants to stop mid-workout, **When** they tap the "Abort workout" button, **Then** a dialog appears with two options: "Save as-is" and "Auto-complete remaining sets"
4. **Given** the user chooses "Auto-complete remaining sets" on abort, **When** the action is confirmed, **Then** all unchecked sets are marked complete using the most recently entered values (or the greyed-out previous values if the fields were not touched), and the session is saved
5. **Given** the user chooses "Save as-is" on abort, **When** the action is confirmed, **Then** only the sets explicitly marked complete are saved and the session ends
6. **Given** the abort dialog is open, **When** the user taps "Cancel", **Then** the dialog closes and the workout continues with no changes

---

### User Story 5 - Rest Timer Between Sets (Priority: P2)

After the user marks a set as completed, a countdown timer automatically starts so they know when their rest period is over. The user can configure their preferred rest duration globally or per-exercise.

**Why this priority**: Rest timers are a standard gym app feature. Without one, users must use a separate timer app, breaking focus. This is a net-new feature with visible, frequent impact during every workout.

**Independent Test**: Can be tested by completing a set, observing the rest timer counting down from the configured default (e.g., 90 seconds), and confirming an audible or haptic notification fires when the timer reaches zero.

**Acceptance Scenarios**:

1. **Given** a user marks a set as complete, **When** the completion is registered, **Then** a visible countdown timer starts with the user's configured rest duration
2. **Given** the rest timer is counting down, **When** the timer reaches zero, **Then** the device produces a haptic buzz and/or audible beep to alert the user
3. **Given** the rest timer is running, **When** the user taps the next set row to begin entering values, **Then** the timer stops automatically
4. **Given** the user wants a different rest time for a specific exercise, **When** they long-press or tap a settings icon on that exercise card, **Then** they can override the rest duration for that exercise only
5. **Given** the user prefers no timer, **When** they disable it in settings, **Then** completing a set produces no timer UI

---

### User Story 6 - Edit or Delete Sets in Workout History (Priority: P2)

A user who made a typo (e.g., entered 100kg instead of 10kg) can correct their mistake directly from the workout history detail screen, rather than having the wrong data permanently pollute their statistics.

**Why this priority**: The history screen currently passes empty no-op callbacks to the set row component for edit and delete actions, making those UI affordances silently broken. A user who sees an edit icon and taps it with nothing happening loses trust in the app. Enabling actual editing also improves statistics accuracy.

**Independent Test**: Navigate to a past workout's detail screen, tap the edit icon on a set row, change the weight value, save, and confirm the new value persists after navigating away and back.

**Acceptance Scenarios**:

1. **Given** a user views a completed workout's detail page, **When** they tap the edit icon on a set, **Then** an edit modal opens pre-filled with that set's current weight, reps, and notes
2. **Given** the edit modal is open, **When** the user changes values and confirms, **Then** the updated values are saved and reflected in the history view and statistics
3. **Given** a user wants to remove an incorrectly logged set, **When** they tap delete on a set row in history, **Then** a confirmation dialog appears, and on confirmation the set is removed and statistics update accordingly
4. **Given** a user deletes all sets for one exercise in a history entry, **When** the last set for that exercise is deleted, **Then** the exercise section disappears from the history view

---

### User Story 7 - Guard Against Empty Routines and Duplicate Exercises (Priority: P2)

The app prevents users from creating routines with zero exercises or adding the same exercise twice to the same routine, giving a clear explanation if they try.

**Why this priority**: Both conditions are currently permitted and lead to confusing states. Starting a workout from an empty routine opens an empty session with no exercises to log. Duplicate exercises in a routine clutter the workout screen and split set counts.

**Independent Test**: Attempt to save a routine with no exercises (should see a validation message). Then select the same exercise twice in the exercise picker (second selection should be rejected with a notification).

**Acceptance Scenarios**:

1. **Given** a user is building a routine and has added zero exercises, **When** they tap "Save routine", **Then** saving is blocked and a message reads "Add at least one exercise to your routine"
2. **Given** a user already has "Bench Press" in their routine, **When** they select "Bench Press" again in the exercise picker, **Then** the selection is rejected and a brief message reads "Bench Press is already in this routine"
3. **Given** a user tries to start a workout from a routine that somehow has zero exercises, **When** they tap "Start workout", **Then** they are shown a message prompting them to add exercises before starting

---

### User Story 8 - Live Duration Timer on Active Workout Screen (Priority: P2)

The active workout screen displays a running clock showing how long the current session has been going, updating in real time.

**Why this priority**: There is currently no way to know how long a workout has been running without checking the phone clock manually. Duration is already computed and shown in history, so users expect to see it live too. This is also referenced in the core workout flow (Story 3).

**Independent Test**: Start a workout, wait 30 seconds, and confirm the timer on the screen reads approximately "0:30" and continues incrementing each second.

**Acceptance Scenarios**:

1. **Given** a workout session is active, **When** the user views the active workout screen, **Then** a timer in the header or top bar shows elapsed time in MM:SS or HH:MM:SS format, updating every second
2. **Given** the user backgrounds the app and returns after 5 minutes, **When** the active workout screen reappears, **Then** the timer reflects the correct elapsed time (wall-clock based, not paused)

---

### User Story 9 - Statistics Date Range Filter (Priority: P3)

Users can filter the statistics view to a specific time window — last 4 weeks, last 3 months, last year, or all time — so charts are not overwhelmed by years of data and trends are easier to read.

**Why this priority**: The statistics screen currently loads all history on every visit. As workout history grows, the charts become too zoomed-out to show meaningful recent trends. A date range selector is standard practice in fitness apps.

**Independent Test**: Select "Last 4 weeks" from a dropdown on the statistics screen and confirm all charts and aggregate counts update to reflect only workouts in that window.

**Acceptance Scenarios**:

1. **Given** a user views the statistics screen, **When** they tap a date range selector, **Then** options are shown: "Last 4 weeks", "Last 3 months", "Last year", "All time"
2. **Given** the user selects "Last 4 weeks", **When** the selection is confirmed, **Then** all charts, aggregate counts (sessions, sets, volume), and exercise progression data refresh to reflect only that window
3. **Given** no workouts exist within the selected date range, **When** the filter is applied, **Then** an appropriate empty state is shown ("No workouts in this period") rather than an error or blank charts

---

### User Story 10 - Input Validation Feedback Before Saving a Set (Priority: P3)

Before a set is saved, the app validates that weight and reps are plausible values and shows a clear inline error if not (e.g., reps of 0 or weight of 999999 are blocked).

**Why this priority**: Currently sets are sent to the database with no client-side validation. A slip of a key could log a 999kg squat which silently corrupts statistics (estimated 1RM, personal bests, volume charts). Validation should prevent this before the record is written.

**Independent Test**: Attempt to save a set with 0 reps (should see "Reps must be at least 1") and a weight of 9999 kg (should see a confirmation prompt about an unusually high weight).

**Acceptance Scenarios**:

1. **Given** a user enters 0 in the reps field and taps save, **When** the save is attempted, **Then** saving is blocked and the reps field is highlighted with the message "Reps must be at least 1"
2. **Given** a user enters a weight above a reasonable maximum (e.g., > 500 kg), **When** the save is attempted, **Then** a confirmation dialog asks "That's [X] kg — is that correct?" with Cancel and Confirm options
3. **Given** a user leaves the weight field blank, **When** the save is attempted, **Then** saving is blocked with "Enter a weight to save this set" (bodyweight exercises without weight are a separate user story)

---

## Requirements *(mandatory)*

### Functional Requirements

**Core Workout Flow (P1)**
- **FR-001**: The home screen MUST display completed workouts in reverse-chronological order showing date, routine name, set count, and duration per entry
- **FR-002**: The home screen MUST show a clearly accessible "+" or "New workout" button that opens the routine picker
- **FR-003**: The routine picker MUST list all of the user's routines with name and exercise count, and one tap MUST start the workout immediately with no additional confirmation step
- **FR-004**: The active workout screen MUST render all exercises and all planned set rows upfront, without requiring any modal or additional tap to reveal them
- **FR-005**: Each set row in the active workout MUST display the corresponding previous session's weight and reps as greyed-out placeholder text when a prior session exists
- **FR-006**: When the user taps into a set row's input field, the greyed-out placeholder MUST clear and the field MUST accept live input
- **FR-007**: A set row MUST provide a one-tap "confirm same as last time" action that accepts the greyed-out values without requiring the user to type them
- **FR-008**: The active workout screen MUST show a live elapsed timer in the header, updated every second
- **FR-009**: When all sets are marked complete, the app MUST automatically prompt the user to finish the session
- **FR-010**: The app MUST provide an "Abort workout" option at any time during an active session
- **FR-011**: When aborting, the app MUST ask the user whether to auto-complete remaining unchecked sets or save only the explicitly completed sets
- **FR-012**: Auto-completing sets on abort MUST use the most recently entered values, falling back to the greyed-out previous session values if the fields were not touched

**Rest Timer (P2)**
- **FR-013**: The app MUST start a configurable countdown timer automatically when the user marks a set as completed
- **FR-014**: The app MUST notify the user (haptic and/or audio) when the rest timer reaches zero
- **FR-015**: Users MUST be able to set a default rest duration in seconds (global preference)
- **FR-016**: Users MUST be able to disable the rest timer entirely

**History Editing (P2)**
- **FR-017**: Users MUST be able to edit the weight, reps, and notes of any set in their workout history
- **FR-018**: Users MUST be able to delete any set from their workout history after confirming intent
- **FR-019**: Edits and deletions to history sets MUST immediately update displayed statistics

**Routine Validation (P2)**
- **FR-020**: The app MUST prevent saving a routine with zero exercises and display an explanatory message
- **FR-021**: The app MUST prevent adding the same exercise to a routine more than once and inform the user
- **FR-022**: The app MUST prevent starting a workout from a routine that contains zero exercises

**Live Timer (P2)**
- **FR-023**: The active workout screen MUST display a live elapsed timer that updates every second
- **FR-024**: The elapsed timer MUST accurately reflect wall-clock time even if the app was backgrounded

**Statistics Filtering (P3)**
- **FR-025**: The statistics screen MUST allow filtering all displayed data to a selected time range
- **FR-026**: Available time range options MUST include at minimum: last 4 weeks, last 3 months, last year, all time
- **FR-027**: When no data exists in the selected range, the app MUST show an appropriate empty state

**Input Validation (P3)**
- **FR-028**: The app MUST reject set saves where reps is zero or negative
- **FR-029**: The app MUST prompt confirmation when weight exceeds a plausible maximum (e.g., 500 kg)
- **FR-030**: The app MUST require both weight and reps fields to be filled before saving a set

### Key Entities

- **Workout Session**: A timed event belonging to a user, optionally tied to a routine, with a start time, optional end time, completion status, and an optional text note
- **Workout Set**: A single logged set within a session, belonging to one exercise, with a weight value, rep count, set order number, completion flag, and optional text note
- **Exercise**: A named movement belonging to a user, categorized (e.g., push, pull, legs), referenced by both routines and workout sets
- **Routine**: A named, ordered collection of exercises belonging to a user, used as a template to start workout sessions; each exercise has a planned number of sets
- **User Preferences**: A user-level configuration store holding rest timer duration and rest timer enabled/disabled state

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can go from tapping "+" to having an active workout screen open in under 3 seconds (excluding network latency)
- **SC-002**: The full routine layout — all exercises and sets — is visible on the active workout screen without any additional taps after the workout starts
- **SC-003**: Users with a prior session for the same routine see previous performance values pre-filled as greyed-out text; zero extra navigation required
- **SC-004**: Users completing a full routine are prompted to finish without needing to find or tap a manual "End workout" button
- **SC-005**: Users who abort mid-workout can choose to auto-complete remaining sets in under 2 taps
- **SC-006**: Users completing workouts with the rest timer enabled never need to switch to a separate timer app — 100% of rest timing is handled in-app
- **SC-007**: Users can correct a mistakenly logged set in workout history in under 30 seconds
- **SC-008**: Zero sets with physically impossible values (e.g., 0 reps, negative weight) appear in the database after input validation is in place
- **SC-009**: Statistics charts remain readable and useful for users with 2+ years of workout history, thanks to date range filtering

---

## Assumptions

- The routine data model does not currently store a planned set count per exercise (`routine_exercises` only tracks exercise order); each exercise in the active workout MUST default to 3 set rows
- "Greyed-out previous values" refers to placeholder text within the input fields, not separate read-only labels; the input field itself is always editable
- The "confirm same as last time" action on a set row does not require a separate button if a simpler interaction (e.g., swipe or long-press) is more natural for the platform
- All improvements are additive — no destructive data migrations are required
- The app continues to require an internet connection; full offline support is out of scope for this backlog
- Norwegian strings are intentional for the primary target audience; no localization infrastructure changes are required
- Rest timer notifications use on-screen alerts or haptic feedback only; background push notifications are out of scope
- When editing history sets, changes are applied immediately with optimistic updates consistent with the existing active workout pattern
- Bodyweight exercises (no weight entry) are an edge case that may warrant a separate feature — this backlog focuses on weighted exercises
