import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SetSummary } from '../../lib/db/workouts';

interface PreviousSetReferenceProps {
  data: SetSummary;
}

export function PreviousSetReference({ data }: PreviousSetReferenceProps): React.JSX.Element {
  return (
    <View testID="previous-set-reference" style={styles.container}>
      <Text style={styles.text}>
        Sist: {data.weight_kg}kg × {data.set_count} sett ({data.reps} reps)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  text: {
    color: '#5DCAA5',
    fontSize: 13,
  },
});
