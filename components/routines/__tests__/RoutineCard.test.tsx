import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoutineCard } from '../RoutineCard';

const baseProps = {
  routineId: 'r1',
  name: 'Push Day',
  exerciseCount: 3,
  onStart: jest.fn(),
  onEdit: jest.fn(),
};

describe('RoutineCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders routine name', () => {
    const { getByText } = render(<RoutineCard {...baseProps} />);
    expect(getByText('Push Day')).toBeTruthy();
  });

  it('renders exercise count', () => {
    const { getByText } = render(<RoutineCard {...baseProps} />);
    expect(getByText('3 exercises')).toBeTruthy();
  });

  it('"Start" Pressable fires onStart callback', () => {
    const onStart = jest.fn();
    const { getByText } = render(<RoutineCard {...baseProps} onStart={onStart} />);
    fireEvent.press(getByText('Start'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('long-press fires onEdit callback', () => {
    const onEdit = jest.fn();
    const { getByText } = render(<RoutineCard {...baseProps} onEdit={onEdit} />);
    fireEvent(getByText('Push Day'), 'longPress');
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
