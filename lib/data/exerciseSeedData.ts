interface ExerciseSeedEntry {
  name: string;
  category: 'Back' | 'Chest' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core';
}

export const EXERCISE_SEED_DATA: ExerciseSeedEntry[] = [
  // Chest
  { name: 'Bench press', category: 'Chest' },
  { name: 'Incline bench press', category: 'Chest' },
  { name: 'Decline bench press', category: 'Chest' },
  { name: 'Dumbbell bench press', category: 'Chest' },
  { name: 'Cable crossover', category: 'Chest' },
  { name: 'Chest press machine', category: 'Chest' },
  { name: 'Push-ups', category: 'Chest' },
  // Back
  { name: 'Deadlift', category: 'Back' },
  { name: 'Wide-grip lat pulldown', category: 'Back' },
  { name: 'Close-grip lat pulldown', category: 'Back' },
  { name: 'Seated cable row', category: 'Back' },
  { name: 'Barbell row', category: 'Back' },
  { name: 'Single-arm dumbbell row', category: 'Back' },
  { name: 'Back extension (hyperextension)', category: 'Back' },
  { name: 'Pull-ups', category: 'Back' },
  { name: 'Chin-ups', category: 'Back' },
  // Legs
  { name: 'Squat', category: 'Legs' },
  { name: 'Front squat', category: 'Legs' },
  { name: 'Leg press', category: 'Legs' },
  { name: 'Lunges', category: 'Legs' },
  { name: 'Bulgarian split squat', category: 'Legs' },
  { name: 'Leg curl', category: 'Legs' },
  { name: 'Leg extension', category: 'Legs' },
  { name: 'Hip thrust', category: 'Legs' },
  { name: 'Romanian deadlift', category: 'Legs' },
  { name: 'Standing calf raise', category: 'Legs' },
  { name: 'Seated calf raise', category: 'Legs' },
  // Shoulders
  { name: 'Barbell overhead press', category: 'Shoulders' },
  { name: 'Dumbbell overhead press', category: 'Shoulders' },
  { name: 'Lateral raise', category: 'Shoulders' },
  { name: 'Front raise', category: 'Shoulders' },
  { name: 'Rear delt fly', category: 'Shoulders' },
  { name: 'Arnold press', category: 'Shoulders' },
  { name: 'Face pull', category: 'Shoulders' },
  { name: 'Shoulder press machine', category: 'Shoulders' },
  // Biceps
  { name: 'Barbell curl', category: 'Biceps' },
  { name: 'Dumbbell curl', category: 'Biceps' },
  { name: 'Hammer curl', category: 'Biceps' },
  { name: 'Concentration curl', category: 'Biceps' },
  { name: 'Cable bicep curl', category: 'Biceps' },
  { name: 'Preacher curl', category: 'Biceps' },
  // Triceps
  { name: 'Cable tricep pushdown', category: 'Triceps' },
  { name: 'Behind-neck press', category: 'Triceps' },
  { name: 'Skull crushers', category: 'Triceps' },
  { name: 'Dips', category: 'Triceps' },
  { name: 'Triceps kickback', category: 'Triceps' },
  { name: 'Close-grip bench press', category: 'Triceps' },
  // Core
  { name: 'Plank', category: 'Core' },
  { name: 'Sit-ups', category: 'Core' },
  { name: 'Leg raises', category: 'Core' },
  { name: 'Ab wheel rollout', category: 'Core' },
  { name: 'Cable twist', category: 'Core' },
];
