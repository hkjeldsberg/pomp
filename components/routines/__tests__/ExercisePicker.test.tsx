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

  it('tapping unselected exercise calls onToggle with exercise', () => {
    const onToggle = jest.fn();
    const { getByText } = render(<ExercisePicker {...baseProps} onToggle={onToggle} />);
    fireEvent.press(getByText('Benkpress'));
    expect(onToggle).toHaveBeenCalledWith(mockExercises[0]);
  });

  it('selected exercises shown with selected testID', () => {
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

  it('tapping already-selected exercise shows duplicate message', () => {
    const onToggle = jest.fn();
    const { getByTestId, getByText } = render(
      <ExercisePicker {...baseProps} selectedIds={['e1']} onToggle={onToggle} />
    );
    fireEvent.press(getByTestId('selected-e1'));
    expect(getByText('Benkpress er allerede i rutinen')).toBeTruthy();
    expect(getByTestId('duplicate-msg')).toBeTruthy();
  });

  it('tapping already-selected exercise does NOT call onToggle', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <ExercisePicker {...baseProps} selectedIds={['e1']} onToggle={onToggle} />
    );
    fireEvent.press(getByTestId('selected-e1'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('no duplicate message shown initially', () => {
    const { queryByTestId } = render(<ExercisePicker {...baseProps} />);
    expect(queryByTestId('duplicate-msg')).toBeNull();
  });
});
