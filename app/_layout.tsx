import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../lib/supabase';
import { getOpenWorkout } from '../lib/db/workouts';

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        try {
          const openWorkout = await getOpenWorkout();
          if (openWorkout) {
            router.replace(`/workout/${openWorkout.id}` as Parameters<typeof router.replace>[0]);
          } else {
            router.replace('/(tabs)');
          }
        } catch {
          router.replace('/(tabs)');
        }
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        router.replace('/(auth)/sign-in');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#071412' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="workout/[id]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="workout/history/[id]" />
      <Stack.Screen name="exercises" />
    </Stack>
  );
}
