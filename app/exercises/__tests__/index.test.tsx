/**
 * Component tests for the exercises screen.
 * Mocks lib/db/exercises.ts.
 */

jest.mock('../../../lib/db/exercises', () => ({
  getExercises: jest.fn(),
  createExercise: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as exercisesDb from '../../../lib/db/exercises';
import ExercisesScreen from '../index';

const mockGetExercises = exercisesDb.getExercises as jest.Mock;
const mockCreateExercise = exercisesDb.createExercise as jest.Mock;

const mockExercises = [
  { id: 'e1', user_id: 'u1', name: 'Benkpress', category: 'Bryst', created_at: '2026-01-01' },
  { id: 'e2', user_id: 'u1', name: 'Markløft', category: 'Rygg', created_at: '2026-01-01' },
];

describe('ExercisesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetExercises.mockResolvedValue(mockExercises);
  });

  it('renders exercises grouped by category', async () => {
    const { getByText } = render(<ExercisesScreen />);
    await waitFor(() => {
      expect(getByText('Benkpress')).toBeTruthy();
      expect(getByText('Markløft')).toBeTruthy();
    });
  });

  it('"Ny øvelse" button shows creation form', async () => {
    const { getByText, getByPlaceholderText } = render(<ExercisesScreen />);
    await waitFor(() => getByText('Ny øvelse'));
    fireEvent.press(getByText('Ny øvelse'));
    await waitFor(() => {
      expect(getByPlaceholderText('Navn på øvelse')).toBeTruthy();
    });
  });

  it('calls createExercise on valid form submission', async () => {
    mockCreateExercise.mockResolvedValue({ id: 'e3', name: 'Squat', category: 'Ben' });
    const { getByText, getByPlaceholderText } = render(<ExercisesScreen />);
    await waitFor(() => getByText('Ny øvelse'));
    fireEvent.press(getByText('Ny øvelse'));
    await waitFor(() => getByPlaceholderText('Navn på øvelse'));
    fireEvent.changeText(getByPlaceholderText('Navn på øvelse'), 'Squat');
    fireEvent.press(getByText('Legg til'));
    await waitFor(() => {
      expect(mockCreateExercise).toHaveBeenCalled();
    });
  });
});
