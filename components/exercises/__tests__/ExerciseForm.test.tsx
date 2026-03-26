import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseForm } from '../ExerciseForm';

describe('ExerciseForm', () => {
  it('renders without crashing with no initial values', () => {
    const { getByTestId } = render(
      <ExerciseForm onSave={jest.fn()} onCancel={jest.fn()} />
    );
    expect(getByTestId('exercise-form')).toBeTruthy();
  });

  it('calls onSave with entered name and default category', () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <ExerciseForm onSave={onSave} onCancel={jest.fn()} />
    );
    fireEvent.changeText(getByTestId('name-input'), 'Knebøy');
    fireEvent.press(getByTestId('save-button'));
    expect(onSave).toHaveBeenCalledWith('Knebøy', 'Chest');
  });

  it('calls onSave with selected category', () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <ExerciseForm onSave={onSave} onCancel={jest.fn()} />
    );
    fireEvent.changeText(getByTestId('name-input'), 'Markløft');
    fireEvent.press(getByTestId('category-Back'));
    fireEvent.press(getByTestId('save-button'));
    expect(onSave).toHaveBeenCalledWith('Markløft', 'Back');
  });

  it('displays inline error when error prop is set', () => {
    const { getByTestId } = render(
      <ExerciseForm onSave={jest.fn()} onCancel={jest.fn()} error="Navn er påkrevd" />
    );
    expect(getByTestId('form-error')).toBeTruthy();
  });

  it('disables save button when isSaving is true', () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <ExerciseForm onSave={onSave} onCancel={jest.fn()} isSaving />
    );
    fireEvent.press(getByTestId('save-button'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button pressed', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <ExerciseForm onSave={jest.fn()} onCancel={onCancel} />
    );
    fireEvent.press(getByTestId('cancel-button'));
    expect(onCancel).toHaveBeenCalled();
  });
});
