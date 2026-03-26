import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps): React.JSX.Element {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#112826',
    borderWidth: 1,
    borderColor: 'rgba(32, 210, 170, 0.15)',
    borderRadius: 14,
    padding: 16,
  },
});
