import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExercisePickerModal } from '../ExercisePickerModal';
import type { Exercise } from '../../../supabase/types';

const exercises: Exercise[] = [
  { id: '1', user_id: 'u', name: 'Bench press', category: 'Chest', created_at: '' },
  { id: '2', user_id: 'u', name: 'Squat', category: 'Legs', created_at: '' },
  { id: '3', user_id: 'u', name: 'Deadlift', category: 'Back', created_at: '' },
];

describe('ExercisePickerModal', () => {
  it('renders without crashing when visible', () => {
    const { getByTestId } = render(
      <ExercisePickerModal
        visible
        exercises={exercises}
        selectedId={null}
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(getByTestId('exercise-picker-modal')).toBeTruthy();
  });

  it('shows all exercises initially', () => {
    const { getByText } = render(
      <ExercisePickerModal visible exercises={exercises} selectedId={null} onSelect={jest.fn()} onClose={jest.fn()} />
    );
    expect(getByText('Bench press')).toBeTruthy();
    expect(getByText('Squat')).toBeTruthy();
    expect(getByText('Deadlift')).toBeTruthy();
  });

  it('filters list by search input (case-insensitive)', () => {
    const { getByTestId, queryByText } = render(
      <ExercisePickerModal visible exercises={exercises} selectedId={null} onSelect={jest.fn()} onClose={jest.fn()} />
    );
    fireEvent.changeText(getByTestId('search-input'), 'squa');
    expect(queryByText('Bench press')).toBeNull();
    expect(queryByText('Squat')).toBeTruthy();
  });

  it('calls onSelect with the correct exercise when tapped', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <ExercisePickerModal visible exercises={exercises} selectedId={null} onSelect={onSelect} onClose={jest.fn()} />
    );
    fireEvent.press(getByTestId('exercise-option-2'));
    expect(onSelect).toHaveBeenCalledWith(exercises[1]);
  });

  it('shows empty state when search returns no matches', () => {
    const { getByTestId, getByText } = render(
      <ExercisePickerModal visible exercises={exercises} selectedId={null} onSelect={jest.fn()} onClose={jest.fn()} />
    );
    fireEvent.changeText(getByTestId('search-input'), 'zzz');
    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No exercises found')).toBeTruthy();
  });

  it('calls onClose when close button pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ExercisePickerModal visible exercises={exercises} selectedId={null} onSelect={jest.fn()} onClose={onClose} />
    );
    fireEvent.press(getByTestId('close-button'));
    expect(onClose).toHaveBeenCalled();
  });
});
