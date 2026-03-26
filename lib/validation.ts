export interface SetValidationResult {
  error: string | null;
  requiresConfirmation: boolean;
}

const MAX_WEIGHT_KG = 500;

export function validateSetInput(
  weightKg: number | null | undefined,
  reps: number | null | undefined
): SetValidationResult {
  if (weightKg === null || weightKg === undefined || isNaN(weightKg as number)) {
    return { error: 'Enter weight to save the set', requiresConfirmation: false };
  }
  if (reps === null || reps === undefined || isNaN(reps as number)) {
    return { error: 'Enter reps to save the set', requiresConfirmation: false };
  }
  if ((reps as number) < 1) {
    return { error: 'Reps must be at least 1', requiresConfirmation: false };
  }
  if ((weightKg as number) > MAX_WEIGHT_KG) {
    return { error: null, requiresConfirmation: true };
  }
  return { error: null, requiresConfirmation: false };
}
