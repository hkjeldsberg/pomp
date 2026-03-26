import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import type { Exercise } from '../../supabase/types';

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  testID?: string;
}

export function ExercisePickerModal({
  visible,
  exercises,
  selectedId,
  onSelect,
  onClose,
  testID,
}: ExercisePickerModalProps): React.JSX.Element {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    : exercises;

  function handleSelect(exercise: Exercise): void {
    onSelect(exercise);
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View testID={testID ?? 'exercise-picker-modal'} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select exercise</Text>
          <Pressable testID="close-button" onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
        <TextInput
          testID="search-input"
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises..."
          placeholderTextColor="#5DCAA5"
          autoCapitalize="none"
        />
        {filtered.length === 0 ? (
          <View testID="empty-state" style={styles.empty}>
            <Text style={styles.emptyText}>No exercises found</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(e) => e.id}
            renderItem={({ item }) => (
              <Pressable
                testID={`exercise-option-${item.id}`}
                onPress={() => handleSelect(item)}
                style={[styles.row, item.id === selectedId && styles.rowActive]}
              >
                <Text style={[styles.rowName, item.id === selectedId && styles.rowNameActive]}>
                  {item.name}
                </Text>
                <Text style={styles.rowCategory}>{item.category}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412', paddingTop: 56 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { color: '#E0F5F0', fontSize: 20, fontWeight: '700' },
  closeBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  closeBtnText: { color: '#5DCAA5', fontSize: 15 },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 44,
    backgroundColor: '#0D2622',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32,210,170,0.3)',
    color: '#E0F5F0',
    paddingHorizontal: 12,
    fontSize: 15,
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 48 },
  emptyText: { color: '#5DCAA5', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(32,210,170,0.12)',
  },
  rowActive: { backgroundColor: 'rgba(32,210,170,0.12)' },
  rowName: { flex: 1, color: '#E0F5F0', fontSize: 15 },
  rowNameActive: { color: '#20D2AA', fontWeight: '600' },
  rowCategory: { color: '#5DCAA5', fontSize: 12 },
});
