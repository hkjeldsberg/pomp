import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { DateRange } from '../../lib/db/statistics';

interface Option {
  value: DateRange;
  label: string;
}

const OPTIONS: Option[] = [
  { value: '4w', label: '4 weeks' },
  { value: '3m', label: '3 mo' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All' },
];

interface DateRangeFilterProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
  testID?: string;
}

export function DateRangeFilter({ selected, onChange, testID }: DateRangeFilterProps): React.JSX.Element {
  return (
    <View testID={testID ?? 'date-range-filter'} style={styles.container}>
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.value}
          testID={`range-option-${opt.value}`}
          onPress={() => onChange(opt.value)}
          style={[styles.option, selected === opt.value && styles.optionActive]}
        >
          <Text style={[styles.optionText, selected === opt.value && styles.optionTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 210, 170, 0.3)',
  },
  optionActive: {
    backgroundColor: '#20D2AA',
    borderColor: '#20D2AA',
  },
  optionText: {
    color: '#5DCAA5',
    fontSize: 13,
  },
  optionTextActive: {
    color: '#0A1F1C',
    fontWeight: '700',
  },
});
