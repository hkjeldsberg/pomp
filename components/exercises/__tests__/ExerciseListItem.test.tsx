import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseListItem } from '../ExerciseListItem';
import type { Exercise } from '../../../supabase/types';

const mockExercise: Exercise = {
  id: 'ex-1',
  user_id: 'user-1',
  name: 'Knebøy',
  category: 'Ben',
  created_at: '2026-01-01T00:00:00Z',
};

describe('ExerciseListItem', () => {
  it('renders exercise name without crashing', () => {
    const { getByText } = render(
      <ExerciseListItem exercise={mockExercise} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText('Knebøy')).toBeTruthy();
  });

  it('calls onEdit when edit button is pressed', () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(
      <ExerciseListItem exercise={mockExercise} onEdit={onEdit} onDelete={jest.fn()} />
    );
    fireEvent.press(getByTestId('edit-button'));
    expect(onEdit).toHaveBeenCalledWith(mockExercise);
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <ExerciseListItem exercise={mockExercise} onEdit={jest.fn()} onDelete={onDelete} />
    );
    fireEvent.press(getByTestId('delete-button'));
    expect(onDelete).toHaveBeenCalledWith(mockExercise);
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = render(
      <ExerciseListItem exercise={mockExercise} onEdit={jest.fn()} onDelete={jest.fn()} testID="my-item" />
    );
    expect(getByTestId('my-item')).toBeTruthy();
  });
});
