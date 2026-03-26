import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button(props: ButtonProps): React.JSX.Element {
  const { label, onPress, variant = 'primary', disabled = false } = props;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        // Inline color overrides go LAST so NativeWind preflight cannot override them
        isPrimary
          ? { backgroundColor: '#20D2AA' }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#20D2AA' },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    minWidth: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelPrimary: {
    color: '#0A1F1C',
  },
  labelSecondary: {
    color: '#20D2AA',
  },
});
