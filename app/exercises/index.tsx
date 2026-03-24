import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, SectionList, ScrollView, Modal,
  Pressable, StyleSheet, Alert,
} from 'react-native';
import { getExercises, createExercise } from '../../lib/db/exercises';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Exercise } from '../../supabase/types';

type Category = 'Alle' | 'Rygg' | 'Bryst' | 'Ben' | 'Skuldre' | 'Biceps' | 'Triceps' | 'Magemuskler';
const CATEGORIES: Category[] = ['Alle', 'Rygg', 'Bryst', 'Ben', 'Skuldre', 'Biceps', 'Triceps', 'Magemuskler'];

interface Section {
  title: string;
  data: Exercise[];
}

export default function ExercisesScreen(): React.JSX.Element {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Alle');
  const [modalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<Exclude<Category, 'Alle'>>('Rygg');
  const [error, setError] = useState<string | null>(null);

  const loadExercises = useCallback(async (): Promise<void> => {
    try {
      const data = await getExercises();
      setExercises(data);
    } catch {
      Alert.alert('Feil', 'Kunne ikke laste øvelser');
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const filtered = selectedCategory === 'Alle'
    ? exercises
    : exercises.filter((e) => e.category === selectedCategory);

  const sections: Section[] = CATEGORIES
    .filter((c) => c !== 'Alle')
    .map((cat) => ({
      title: cat,
      data: filtered.filter((e) => e.category === cat),
    }))
    .filter((s) => s.data.length > 0);

  async function handleCreate(): Promise<void> {
    setError(null);
    if (!nameInput.trim()) {
      setError('Navn er påkrevd');
      return;
    }
    try {
      await createExercise({ name: nameInput.trim(), category: categoryInput });
      setModalVisible(false);
      setNameInput('');
      await loadExercises();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feil ved opprettelse');
    }
  }

  return (
    <View style={styles.container}>
      {/* Category filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {sections.length === 0 ? (
        <EmptyState
          iconName="dumbbell"
          title="Ingen øvelser"
          subtitle="Legg til din første øvelse"
          action={{ label: 'Ny øvelse', onPress: () => setModalVisible(true) }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{item.name}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.fab}>
        <Button label="Ny øvelse" onPress={() => setModalVisible(true)} />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ny øvelse</Text>
            <View style={styles.inputWrapper}>
              <Input
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Navn på øvelse"
                errorText={error ?? undefined}
              />
            </View>
            <Text style={styles.label}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
              {(CATEGORIES.filter((c) => c !== 'Alle') as Exclude<Category, 'Alle'>[]).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategoryInput(cat)}
                  style={[styles.chip, categoryInput === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipText, categoryInput === cat && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <Button label="Legg til" onPress={handleCreate} />
              <View style={styles.cancelWrapper}>
                <Button label="Avbryt" onPress={() => { setModalVisible(false); setError(null); }} variant="secondary" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(32,210,170,0.3)', marginRight: 8 },
  chipActive: { backgroundColor: '#20D2AA', borderColor: '#20D2AA' },
  chipText: { color: '#5DCAA5', fontSize: 14 },
  chipTextActive: { color: '#0A1F1C', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionHeader: { color: '#5DCAA5', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', paddingTop: 16, paddingBottom: 8 },
  exerciseRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(32,210,170,0.1)' },
  exerciseName: { color: '#E0F5F0', fontSize: 16 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112826', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { color: '#E0F5F0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  inputWrapper: { marginBottom: 16 },
  label: { color: '#5DCAA5', fontSize: 13, marginBottom: 8 },
  categoryPicker: { flexGrow: 0, marginBottom: 16 },
  modalButtons: { marginTop: 8 },
  cancelWrapper: { marginTop: 8 },
});
