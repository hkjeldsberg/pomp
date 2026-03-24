import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseCard } from '../ExerciseCard';

const mockSets = [
  { setId: 's1', weightKg: 100, reps: 5, completed: false },
  { setId: 's2', weightKg: 80, reps: 8, completed: true },
];

const baseProps = {
  exerciseId: 'ex-1',
  exerciseName: 'Benkpress',
  sets: mockSets,
  onAddSet: jest.fn(),
  onToggleComplete: jest.fn(),
  onEditSet: jest.fn(),
  onDeleteSet: jest.fn(),
};

describe('ExerciseCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders exercise name', () => {
    const { getByText } = render(<ExerciseCard {...baseProps} />);
    expect(getByText('Benkpress')).toBeTruthy();
  });

  it('renders correct number of SetRow children', () => {
    const { getAllByTestId } = render(<ExerciseCard {...baseProps} />);
    expect(getAllByTestId('set-row')).toHaveLength(2);
  });

  it('renders PreviousSetReference when previousData prop provided', () => {
    const { getByTestId } = render(
      <ExerciseCard {...baseProps} previousData={{ weight_kg: 90, reps: 6, set_count: 3 }} />
    );
    expect(getByTestId('previous-set-reference')).toBeTruthy();
  });

  it('does not render PreviousSetReference when no previousData', () => {
    const { queryByTestId } = render(<ExerciseCard {...baseProps} />);
    expect(queryByTestId('previous-set-reference')).toBeNull();
  });

  it('"Legg til sett" button fires onAddSet callback', () => {
    const onAddSet = jest.fn();
    const { getByText } = render(<ExerciseCard {...baseProps} onAddSet={onAddSet} />);
    fireEvent.press(getByText('Legg til sett'));
    expect(onAddSet).toHaveBeenCalledWith('ex-1');
  });
});
