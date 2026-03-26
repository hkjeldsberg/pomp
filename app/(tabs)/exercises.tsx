import React, { useCallback, useState } from 'react';
import { View, Text, SectionList, Modal, Alert, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getExercises, createExercise, updateExercise, deleteExercise, seedExercises } from '../../lib/db/exercises';
import { ExerciseListItem } from '../../components/exercises/ExerciseListItem';
import { ExerciseForm } from '../../components/exercises/ExerciseForm';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Exercise } from '../../supabase/types';

interface Section {
  title: string;
  data: Exercise[];
}

export default function OvelserScreen(): React.JSX.Element {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    const data = await getExercises();
    setExercises(data);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function openCreate(): void {
    setEditTarget(null);
    setFormError(null);
    setFormVisible(true);
  }

  function openEdit(exercise: Exercise): void {
    setEditTarget(exercise);
    setFormError(null);
    setFormVisible(true);
  }

  function handleDeleteRequest(exercise: Exercise): void {
    Alert.alert(
      'Delete exercise',
      `Delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExercise(exercise.id);
              await load();
            } catch (err) {
              const msg = err instanceof Error ? err.message : '';
              if (msg.includes('violates foreign key') || msg.includes('restrict')) {
                Alert.alert('Cannot delete', 'Exercise is used in a routine. Remove it from all routines first.');
              } else {
                Alert.alert('Error', 'Could not delete exercise');
              }
            }
          },
        },
      ]
    );
  }

  async function handleSave(name: string, category: string): Promise<void> {
    setIsSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await updateExercise(editTarget.id, { name, category });
      } else {
        await createExercise({ name, category });
      }
      setFormVisible(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error saving';
      setFormError(msg.includes('duplicate') || msg.includes('unique') ? 'An exercise with this name already exists' : msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSeed(): Promise<void> {
    setIsSeeding(true);
    try {
      const { inserted } = await seedExercises();
      await load();
      if (inserted === 0) {
        Alert.alert('Already loaded', 'Preset exercises are already in your library.');
      }
    } catch {
      Alert.alert('Error', 'Could not load preset exercises');
    } finally {
      setIsSeeding(false);
    }
  }

  const sections: Section[] = Object.entries(
    exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
      const cat = ex.category ?? 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ex);
      return acc;
    }, {})
  ).map(([title, data]) => ({ title, data }));

  return (
    <View style={styles.container}>
      {exercises.length === 0 ? (
        <EmptyState
          iconName="figure.strengthtraining.traditional"
          title="No exercises"
          subtitle="Load preset exercises or create your own"
          action={{ label: isSeeding ? 'Loading...' : 'Load preset exercises', onPress: handleSeed }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <ExerciseListItem
              exercise={item}
              onEdit={openEdit}
              onDelete={handleDeleteRequest}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Pressable testID="new-exercise-fab" onPress={openCreate} style={styles.fab}>
        <Text style={styles.fabText}>+ New exercise</Text>
      </Pressable>

      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editTarget ? 'Edit exercise' : 'New exercise'}
            </Text>
            <ExerciseForm
              initialName={editTarget?.name}
              initialCategory={editTarget?.category ?? undefined}
              onSave={handleSave}
              onCancel={() => setFormVisible(false)}
              isSaving={isSaving}
              error={formError}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071412', paddingTop: 56 },
  list: { paddingBottom: 100 },
  sectionHeader: {
    color: '#5DCAA5',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: '#071412',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#20D2AA',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#0A1F1C', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#112826',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    color: '#E0F5F0',
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
    paddingBottom: 8,
  },
});
