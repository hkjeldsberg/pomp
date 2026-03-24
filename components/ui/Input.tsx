import React from 'react';
import { TextInput, Text, View, StyleSheet, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  errorText?: string;
}

export function Input(props: InputProps): React.JSX.Element {
  const { value, onChangeText, errorText, ...rest } = props;

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor="#5DCAA5"
        {...rest}
      />
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#0D1F1D',
    color: '#E0F5F0',
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(32, 210, 170, 0.2)',
  },
  error: {
    color: '#5DCAA5',
    fontSize: 13,
    marginTop: 4,
  },
});
