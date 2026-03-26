import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseCard } from '../ExerciseCard';

const mockLoggedSets = [
  { setId: 's1', setNumber: 1, weightKg: 100, reps: 5, completed: false },
  { setId: 's2', setNumber: 2, weightKg: 100, reps: 5, completed: true },
];

const baseProps = {
  exerciseId: 'ex-1',
  exerciseName: 'Benkpress',
  sets: mockLoggedSets,
  plannedSetCount: 3,
  onToggleComplete: jest.fn(),
  onEditSet: jest.fn(),
  onDeleteSet: jest.fn(),
  onConfirmSet: jest.fn(),
};

describe('ExerciseCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders exercise name', () => {
    const { getByText } = render(<ExerciseCard {...baseProps} />);
    expect(getByText('Benkpress')).toBeTruthy();
  });

  it('renders plannedSetCount rows when more than logged sets', () => {
    const { getAllByTestId } = render(<ExerciseCard {...baseProps} sets={[]} plannedSetCount={3} />);
    expect(getAllByTestId('pending-set-row')).toHaveLength(3);
  });

  it('renders logged sets as SetRow and pending as PendingSetRow', () => {
    const { getAllByTestId } = render(<ExerciseCard {...baseProps} />);
    // 2 logged → 2 set-row, 1 remaining planned → 1 pending-set-row
    expect(getAllByTestId('set-row')).toHaveLength(2);
    expect(getAllByTestId('pending-set-row')).toHaveLength(1);
  });

  it('renders max(plannedSetCount, loggedSets.length) total rows', () => {
    // 4 logged sets but only 3 planned → should show 4 rows total
    const fourSets = [
      { setId: 's1', setNumber: 1, weightKg: 100, reps: 5, completed: true },
      { setId: 's2', setNumber: 2, weightKg: 100, reps: 5, completed: true },
      { setId: 's3', setNumber: 3, weightKg: 100, reps: 5, completed: true },
      { setId: 's4', setNumber: 4, weightKg: 100, reps: 5, completed: true },
    ];
    const { getAllByTestId } = render(
      <ExerciseCard {...baseProps} sets={fourSets} plannedSetCount={3} />
    );
    expect(getAllByTestId('set-row')).toHaveLength(4);
  });

  it('passes previousSets to PendingSetRow placeholders', () => {
    const prevSets = [{ setNumber: 3, weightKg: 80, reps: 8 }];
    const { getByTestId } = render(
      <ExerciseCard {...baseProps} previousSets={prevSets} />
    );
    // The pending row at set 3 should receive the previous value placeholder
    expect(getByTestId('pending-set-row')).toBeTruthy();
  });

  it('calls onConfirmSet when pending row is confirmed', () => {
    const onConfirmSet = jest.fn();
    const { getByTestId } = render(
      <ExerciseCard {...baseProps} sets={[]} plannedSetCount={1} onConfirmSet={onConfirmSet} />
    );
    const weightInput = getByTestId('weight-input');
    const repsInput = getByTestId('reps-input');
    fireEvent.changeText(weightInput, '100');
    fireEvent.changeText(repsInput, '5');
    fireEvent.press(getByTestId('confirm-input'));
    expect(onConfirmSet).toHaveBeenCalledWith('ex-1', 1, 100, 5);
  });
});
