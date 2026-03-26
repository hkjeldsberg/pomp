import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders label text', () => {
    const { getByText } = render(<Button label="Press me" onPress={() => {}} />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Press me" onPress={onPress} />);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Press me" onPress={onPress} disabled />);
    fireEvent.press(getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders primary variant without crashing', () => {
    const { getByText } = render(<Button label="Primary" onPress={() => {}} variant="primary" />);
    expect(getByText('Primary')).toBeTruthy();
  });

  it('renders secondary variant without crashing', () => {
    const { getByText } = render(<Button label="Secondary" onPress={() => {}} variant="secondary" />);
    expect(getByText('Secondary')).toBeTruthy();
  });
});
