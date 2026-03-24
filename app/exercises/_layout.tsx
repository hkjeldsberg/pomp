import React from 'react';
import { Stack } from 'expo-router';

export default function ExercisesLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1F1D' },
        headerTintColor: '#E0F5F0',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Øvelser' }} />
    </Stack>
  );
}
