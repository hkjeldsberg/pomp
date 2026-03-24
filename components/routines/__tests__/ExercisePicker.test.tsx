import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExercisePicker } from '../ExercisePicker';

import type { Exercise } from '../../../supabase/types';

const mockExercises: Exercise[] = [
  { id: 'e1', user_id: 'u1', name: 'Benkpress', category: 'Bryst', created_at: '2026-01-01' },
  { id: 'e2', user_id: 'u1', name: 'Markløft', category: 'Rygg', created_at: '2026-01-01' },
];

const baseProps = {
  exercises: mockExercises,
  selectedIds: [] as string[],
  onToggle: jest.fn(),
  onConfirm: jest.fn(),
  onClose: jest.fn(),
};

describe('ExercisePicker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders exercises grouped by category', () => {
    const { getByText } = render(<ExercisePicker {...baseProps} />);
    expect(getByText('Benkpress')).toBeTruthy();
    expect(getByText('Markløft')).toBeTruthy();
  });

  it('tapping exercise calls onToggle with exercise', () => {
    const onToggle = jest.fn();
    const { getByText } = render(<ExercisePicker {...baseProps} onToggle={onToggle} />);
    fireEvent.press(getByText('Benkpress'));
    expect(onToggle).toHaveBeenCalledWith(mockExercises[0]);
  });

  it('selected exercises shown differently (testID)', () => {
    const { getByTestId } = render(
      <ExercisePicker {...baseProps} selectedIds={['e1']} />
    );
    expect(getByTestId('selected-e1')).toBeTruthy();
  });

  it('confirm button fires onConfirm with selected array', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <ExercisePicker {...baseProps} selectedIds={['e1', 'e2']} onConfirm={onConfirm} />
    );
    fireEvent.press(getByText('Velg'));
    expect(onConfirm).toHaveBeenCalledWith(['e1', 'e2']);
  });
});
