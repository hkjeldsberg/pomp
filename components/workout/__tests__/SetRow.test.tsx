import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SetRow } from '../SetRow';

const baseProps = {
  setId: 'set-1',
  weightKg: 100,
  reps: 5,
  completed: false,
  onToggleComplete: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('SetRow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders weight and reps', () => {
    const { getByText } = render(<SetRow {...baseProps} />);
    expect(getByText('100 kg')).toBeTruthy();
    expect(getByText('5 reps')).toBeTruthy();
  });

  it('fires onToggleComplete when toggle is pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(<SetRow {...baseProps} onToggleComplete={onToggle} />);
    fireEvent.press(getByTestId('complete-toggle'));
    expect(onToggle).toHaveBeenCalledWith('set-1');
  });

  it('renders checkmark/distinct style when completed=true', () => {
    const { getByTestId } = render(<SetRow {...baseProps} completed={true} />);
    expect(getByTestId('complete-toggle')).toBeTruthy();
  });

  it('renders note text when provided', () => {
    const { getByText } = render(<SetRow {...baseProps} note="Drop set" />);
    expect(getByText('Drop set')).toBeTruthy();
  });

  it('fires onEdit when row is pressed', () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(<SetRow {...baseProps} onEdit={onEdit} />);
    fireEvent.press(getByTestId('set-row'));
    expect(onEdit).toHaveBeenCalledWith('set-1');
  });

  it('fires onDelete when row is long-pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(<SetRow {...baseProps} onDelete={onDelete} />);
    fireEvent(getByTestId('set-row'), 'longPress');
    expect(onDelete).toHaveBeenCalledWith('set-1');
  });

  it('shows confirm-same button when previousValue and onConfirmSame provided and not completed', () => {
    const onConfirmSame = jest.fn();
    const { getByTestId } = render(
      <SetRow
        {...baseProps}
        previousValue={{ weightKg: 90, reps: 6 }}
        onConfirmSame={onConfirmSame}
      />
    );
    expect(getByTestId('confirm-same')).toBeTruthy();
  });

  it('fires onConfirmSame when confirm-same is pressed', () => {
    const onConfirmSame = jest.fn();
    const { getByTestId } = render(
      <SetRow
        {...baseProps}
        previousValue={{ weightKg: 90, reps: 6 }}
        onConfirmSame={onConfirmSame}
      />
    );
    fireEvent.press(getByTestId('confirm-same'));
    expect(onConfirmSame).toHaveBeenCalled();
  });

  it('does not show confirm-same when completed=true', () => {
    const { queryByTestId } = render(
      <SetRow
        {...baseProps}
        completed={true}
        previousValue={{ weightKg: 90, reps: 6 }}
        onConfirmSame={jest.fn()}
      />
    );
    expect(queryByTestId('confirm-same')).toBeNull();
  });

  it('displays validationError inline', () => {
    const { getByText } = render(
      <SetRow {...baseProps} validationError="Reps must be at least 1" />
    );
    expect(getByText('Reps must be at least 1')).toBeTruthy();
  });

  it('does not display validationError when null', () => {
    const { queryByText } = render(
      <SetRow {...baseProps} validationError={null} />
    );
    expect(queryByText('Reps must be at least 1')).toBeNull();
  });
});
