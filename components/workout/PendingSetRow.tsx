import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { validateSetInput } from '../../lib/validation';

interface PreviousValue {
  weightKg: number;
  reps: number;
}

interface PendingSetRowProps {
  setNumber: number;
  previousValue?: PreviousValue;
  onConfirm: (weightKg: number, reps: number) => void;
  validationError?: string | null;
}

export function PendingSetRow({ setNumber, previousValue, onConfirm, validationError }: PendingSetRowProps): React.JSX.Element {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const [localError, setLocalError] = useState<string | null>(null);

  function handleConfirm(): void {
    const w = weight ? parseFloat(weight) : null;
    const r = reps ? parseInt(reps, 10) : null;
    const result = validateSetInput(w, r);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    if (result.requiresConfirmation) {
      Alert.alert(
        'Unusually high weight',
        `That's ${w} kg — is that correct?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => { setLocalError(null); onConfirm(w!, r!); } },
        ]
      );
      return;
    }
    setLocalError(null);
    onConfirm(w!, r!);
  }

  function handleConfirmSame(): void {
    if (previousValue) {
      onConfirm(previousValue.weightKg, previousValue.reps);
    }
  }

  return (
    <View testID="pending-set-row">
      <View style={styles.row}>
        <View style={styles.setNumBox}>
          <Text style={styles.setNum}>{setNumber}</Text>
        </View>
        <TextInput
          testID="weight-input"
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder={previousValue ? String(previousValue.weightKg) : 'kg'}
          placeholderTextColor="#5DCAA5"
          keyboardType="numeric"
        />
        <TextInput
          testID="reps-input"
          style={styles.input}
          value={reps}
          onChangeText={setReps}
          placeholder={previousValue ? String(previousValue.reps) : 'reps'}
          placeholderTextColor="#5DCAA5"
          keyboardType="numeric"
        />
        <Pressable
          testID="confirm-input"
          onPress={handleConfirm}
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmBtnText}>✓</Text>
        </Pressable>
        {previousValue ? (
          <Pressable
            testID="confirm-same"
            onPress={handleConfirmSame}
            style={styles.sameBtn}
          >
            <Text style={styles.sameBtnText}>≡</Text>
          </Pressable>
        ) : null}
      </View>
      {(validationError || localError) ? (
        <Text style={styles.validationError}>{validationError ?? localError}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  setNumBox: {
    minWidth: 24,
    alignItems: 'center',
  },
  setNum: {
    color: '#5DCAA5',
    fontSize: 13,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#0D2622',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 210, 170, 0.3)',
    color: '#E0F5F0',
    paddingHorizontal: 10,
    fontSize: 15,
  },
  confirmBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20D2AA',
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#0A1F1C',
    fontSize: 18,
    fontWeight: '700',
  },
  sameBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20D2AA',
  },
  sameBtnText: {
    color: '#20D2AA',
    fontSize: 18,
    fontWeight: '700',
  },
  validationError: {
    color: '#ff6b6b',
    fontSize: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
});
