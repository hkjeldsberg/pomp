import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';

const CATEGORIES = ['Back', 'Chest', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core'] as const;
type Category = typeof CATEGORIES[number];

interface ExerciseFormProps {
  initialName?: string;
  initialCategory?: string;
  onSave: (name: string, category: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
  testID?: string;
}

export function ExerciseForm({
  initialName = '',
  initialCategory = 'Chest',
  onSave,
  onCancel,
  isSaving = false,
  error,
  testID,
}: ExerciseFormProps): React.JSX.Element {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<Category>((initialCategory as Category) ?? 'Chest');

  function handleSave(): void {
    if (!name.trim()) return;
    onSave(name.trim(), category);
  }

  return (
    <View testID={testID ?? 'exercise-form'} style={styles.container}>
      <TextInput
        testID="name-input"
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Exercise name"
        placeholderTextColor="#5DCAA5"
        maxLength={80}
        autoFocus
      />
      {error ? <Text testID="form-error" style={styles.error}>{error}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            testID={`category-${cat}`}
            onPress={() => setCategory(cat)}
            style={[styles.chip, category === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.buttons}>
        <Pressable
          testID="save-button"
          onPress={handleSave}
          style={[styles.btn, styles.btnPrimary, isSaving && styles.btnDisabled]}
          disabled={isSaving}
        >
          <Text style={styles.btnPrimaryText}>{isSaving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
        <Pressable testID="cancel-button" onPress={onCancel} style={[styles.btn, styles.btnSecondary]}>
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    height: 48,
    backgroundColor: '#0D2622',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32,210,170,0.3)',
    color: '#E0F5F0',
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  error: { color: '#ff6b6b', fontSize: 13, marginBottom: 8 },
  categoryScroll: { flexGrow: 0, marginBottom: 16 },
  categoryRow: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(32,210,170,0.3)',
  },
  chipActive: { backgroundColor: '#20D2AA', borderColor: '#20D2AA' },
  chipText: { color: '#5DCAA5', fontSize: 13 },
  chipTextActive: { color: '#0A1F1C', fontWeight: '600' },
  buttons: { gap: 8 },
  btn: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#20D2AA' },
  btnPrimaryText: { color: '#0A1F1C', fontWeight: '700', fontSize: 15 },
  btnSecondary: { borderWidth: 1, borderColor: 'rgba(32,210,170,0.3)' },
  btnSecondaryText: { color: '#5DCAA5', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
});
