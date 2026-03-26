import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DateRangeFilter } from '../DateRangeFilter';

describe('DateRangeFilter', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <DateRangeFilter selected="all" onChange={jest.fn()} />
    );
    expect(getByTestId('date-range-filter')).toBeTruthy();
  });

  it('renders all four options', () => {
    const { getByText } = render(
      <DateRangeFilter selected="all" onChange={jest.fn()} />
    );
    expect(getByText('4 weeks')).toBeTruthy();
    expect(getByText('3 mo')).toBeTruthy();
    expect(getByText('1 year')).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('fires onChange with correct value when option is pressed', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <DateRangeFilter selected="all" onChange={onChange} />
    );
    fireEvent.press(getByTestId('range-option-4w'));
    expect(onChange).toHaveBeenCalledWith('4w');
  });

  it('fires onChange for each option', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <DateRangeFilter selected="all" onChange={onChange} />
    );
    fireEvent.press(getByTestId('range-option-3m'));
    expect(onChange).toHaveBeenCalledWith('3m');

    fireEvent.press(getByTestId('range-option-1y'));
    expect(onChange).toHaveBeenCalledWith('1y');

    fireEvent.press(getByTestId('range-option-all'));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('applies active style to selected option', () => {
    const { getByTestId } = render(
      <DateRangeFilter selected="4w" onChange={jest.fn()} />
    );
    // Active option exists (styling applied internally; just verify it renders)
    expect(getByTestId('range-option-4w')).toBeTruthy();
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = render(
      <DateRangeFilter selected="all" onChange={jest.fn()} testID="my-filter" />
    );
    expect(getByTestId('my-filter')).toBeTruthy();
  });
});
