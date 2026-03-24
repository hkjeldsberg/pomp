import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('renders value prop', () => {
    const { getByDisplayValue } = render(
      <Input value="hello" onChangeText={() => {}} />
    );
    expect(getByDisplayValue('hello')).toBeTruthy();
  });

  it('calls onChangeText with new text', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <Input value="hello" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue('hello'), 'world');
    expect(onChangeText).toHaveBeenCalledWith('world');
  });

  it('renders errorText below input when provided', () => {
    const { getByText } = render(
      <Input value="" onChangeText={() => {}} errorText="Required field" />
    );
    expect(getByText('Required field')).toBeTruthy();
  });

  it('renders without crashing when no errorText', () => {
    const { queryByText } = render(
      <Input value="" onChangeText={() => {}} />
    );
    expect(queryByText('Required field')).toBeNull();
  });
});
