import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RestTimer } from '../RestTimer';

describe('RestTimer', () => {
  it('renders nothing when secondsRemaining is null and not running', () => {
    const { toJSON } = render(
      <RestTimer secondsRemaining={null} isRunning={false} onStop={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders countdown when running', () => {
    const { getByText } = render(
      <RestTimer secondsRemaining={60} isRunning={true} onStop={jest.fn()} />
    );
    expect(getByText('60s')).toBeTruthy();
  });

  it('calls onStop when pressed', () => {
    const onStop = jest.fn();
    const { getByTestId } = render(
      <RestTimer secondsRemaining={30} isRunning={true} onStop={onStop} testID="timer" />
    );
    fireEvent.press(getByTestId('timer'));
    expect(onStop).toHaveBeenCalled();
  });

  it('shows rest-complete cue when secondsRemaining is 0', () => {
    const { getByText } = render(
      <RestTimer secondsRemaining={0} isRunning={false} onStop={jest.fn()} />
    );
    expect(getByText('Klar! 🔔')).toBeTruthy();
  });

  it('uses default testID "rest-timer"', () => {
    const { getByTestId } = render(
      <RestTimer secondsRemaining={10} isRunning={true} onStop={jest.fn()} />
    );
    expect(getByTestId('rest-timer')).toBeTruthy();
  });
});
