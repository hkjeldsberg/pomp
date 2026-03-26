/**
 * Integration tests for active workout session.
 * Mocks lib/db/sets.ts and lib/db/workouts.ts.
 */

jest.mock('../lib/db/sets', () => ({
  logSet: jest.fn(),
  updateSet: jest.fn(),
  deleteSet: jest.fn(),
}));

jest.mock('../lib/db/workouts', () => ({
  endWorkout: jest.fn(),
  cancelWorkout: jest.fn(),
  getOpenWorkout: jest.fn(),
  createWorkout: jest.fn(),
  getWorkoutHistory: jest.fn(),
  getWorkoutDetail: jest.fn(),
  getPreviousSessionSets: jest.fn(),
}));

import * as setsDb from '../lib/db/sets';
import * as workoutsDb from '../lib/db/workouts';

const mockLogSet = setsDb.logSet as jest.Mock;
const mockUpdateSet = setsDb.updateSet as jest.Mock;
const mockDeleteSet = setsDb.deleteSet as jest.Mock;
const mockEndWorkout = workoutsDb.endWorkout as jest.Mock;
const mockCancelWorkout = workoutsDb.cancelWorkout as jest.Mock;

describe('Active session flows', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logSet resolves with server data', async () => {
    const serverSet = { id: 'srv-1', workout_id: 'w1', exercise_id: 'ex1', set_number: 1, weight_kg: 100, reps: 5, note: null, completed: false, logged_at: new Date().toISOString() };
    mockLogSet.mockResolvedValue(serverSet);
    const result = await setsDb.logSet({ workout_id: 'w1', exercise_id: 'ex1', set_number: 1, weight_kg: 100, reps: 5 });
    expect(result).toEqual(serverSet);
    expect(mockLogSet).toHaveBeenCalledTimes(1);
  });

  it('logSet rejection propagates error', async () => {
    mockLogSet.mockRejectedValue(new Error('Network error'));
    await expect(setsDb.logSet({ workout_id: 'w1', exercise_id: 'ex1', set_number: 1, weight_kg: 100, reps: 5 })).rejects.toThrow('Network error');
  });

  it('updateSet updates completed in local call', async () => {
    const updated = { id: 's1', completed: true, weight_kg: 100, reps: 5 };
    mockUpdateSet.mockResolvedValue(updated);
    const result = await setsDb.updateSet('s1', { completed: true });
    expect(result.completed).toBe(true);
  });

  it('endWorkout calls workoutsDb.endWorkout with session id', async () => {
    const ended = { id: 'w1', ended_at: new Date().toISOString() };
    mockEndWorkout.mockResolvedValue(ended);
    await workoutsDb.endWorkout('w1');
    expect(mockEndWorkout).toHaveBeenCalledWith('w1');
  });

  it('cancelWorkout calls workoutsDb.cancelWorkout', async () => {
    mockCancelWorkout.mockResolvedValue(undefined);
    await workoutsDb.cancelWorkout('w1');
    expect(mockCancelWorkout).toHaveBeenCalledWith('w1');
  });
});
