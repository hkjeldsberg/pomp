import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SignInScreen(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(): Promise<void> {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      }
      // Navigation handled by onAuthStateChange in _layout.tsx
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logg inn</Text>
      <View style={styles.inputWrapper}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="E-post"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputWrapper}>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Passord"
          secureTextEntry
          errorText={error ?? undefined}
        />
      </View>
      <Button label="Logg inn" onPress={handleSignIn} disabled={loading} />
      <Pressable onPress={() => router.push('/(auth)/sign-up')} style={styles.link}>
        <Text style={styles.linkText}>Opprett konto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#071412' },
  title: { color: '#E0F5F0', fontSize: 28, fontWeight: '700', marginBottom: 32 },
  inputWrapper: { marginBottom: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#20D2AA', fontSize: 15 },
});
