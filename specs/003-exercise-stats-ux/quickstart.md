# Quickstart: Exercise Management, Statistics Polish & UX Feedback

**Branch**: `003-exercise-stats-ux` | **Date**: 2026-03-25

---

## Manual Test Scenarios

### Scenario 1: Exercise Library Seed (US2 → must pass before US1 is meaningful)

1. Sign in to the app with a fresh account (or clear all exercises from the DB).
2. Navigate to the **Øvelser** tab.
3. Confirm empty state with a "Last inn standardøvelser" button is shown.
4. Tap the button.
5. ✅ Verify: The list populates with ~50 exercises grouped by category (Rygg, Bryst, Ben, etc.).
6. Tap the seed button again.
7. ✅ Verify: No duplicates appear; exercise count stays the same.

---

### Scenario 2: Create a Custom Exercise (US1)

1. Navigate to the **Øvelser** tab.
2. Tap "Ny øvelse".
3. Enter name: "Bulgarian Split Squat", select category: "Ben".
4. Tap "Lagre".
5. ✅ Verify: The new exercise appears in the list under "Ben".
6. Open the routine builder → exercise picker.
7. ✅ Verify: "Bulgarian Split Squat" is available.

---

### Scenario 3: Edit an Exercise (US1)

1. Find any exercise in the **Øvelser** tab (e.g., "Benkpress").
2. Tap the edit icon.
3. Change the name to "Flat benkpress".
4. Tap "Lagre".
5. ✅ Verify: The exercise name updates in the list.
6. Open a routine that included this exercise.
7. ✅ Verify: The updated name is shown in the routine.

---

### Scenario 4: Delete a Free Exercise (US1)

1. Create a new exercise not used in any routine (e.g., "Test Exercise").
2. Tap the delete icon. Confirm the dialog.
3. ✅ Verify: The exercise is removed from the list.

---

### Scenario 5: Block Delete of Exercise in Routine (US1 edge case)

1. Add "Knebøy" to a routine.
2. Navigate to **Øvelser** and attempt to delete "Knebøy".
3. ✅ Verify: An error message appears: e.g., "Kan ikke slette — øvelsen brukes i en rutine".
4. The exercise remains in the list.

---

### Scenario 6: Statistics Outlier Filtering (US3)

1. Ensure at least 6 completed workout sessions exist.
2. Manually create (or observe) a session with duration < 5 minutes and one with duration > 300 minutes.
3. Navigate to **Statistikk** → view the duration chart.
4. ✅ Verify: The short and excessively long sessions do not appear in the chart; the Y-axis scale reflects the typical session range.
5. ✅ Verify: The aggregate "Total sessions" card still counts all sessions (unfiltered).

---

### Scenario 7: Statistics Exercise Picker (US4)

1. With 30+ exercises seeded, navigate to **Statistikk**.
2. Tap the exercise picker button (previously the horizontal chip list).
3. ✅ Verify: A modal opens with a search input and a scrollable exercise list.
4. Type "dead" in the search field.
5. ✅ Verify: Only exercises containing "dead" (e.g., "Markløft") are shown.
6. Select an exercise.
7. ✅ Verify: The modal closes and the charts update for that exercise.

---

### Scenario 8: Large Number Formatting (US5)

1. Accumulate total workout volume exceeding 10,000 kg (or temporarily seed test data).
2. Navigate to **Statistikk**.
3. ✅ Verify: Total volume is displayed as e.g. "12 450 kg" (with space as thousands separator).
4. ✅ Verify: All other numeric aggregate stats use consistent formatting.

---

### Scenario 9: Long-press Visual Feedback (US6)

1. Navigate to **Rutiner** with at least one routine.
2. Begin a long press on a routine card.
3. ✅ Verify: The card dims noticeably before the options menu appears.
4. Start a long press and release immediately (before the threshold).
5. ✅ Verify: The card returns to its normal appearance; no menu appears.
