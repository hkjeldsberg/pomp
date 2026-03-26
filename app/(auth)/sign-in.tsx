import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Log in</Text>
      <View style={styles.inputWrapper}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputWrapper}>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          errorText={error ?? undefined}
        />
      </View>
      <Button label="Log in" onPress={handleSignIn} disabled={loading} />
      <Pressable onPress={() => router.push('/(auth)/sign-up')} style={styles.link}>
        <Text style={styles.linkText}>Create account</Text>
      </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#071412' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { color: '#E0F5F0', fontSize: 28, fontWeight: '700', marginBottom: 32 },
  inputWrapper: { marginBottom: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#20D2AA', fontSize: 15 },
});
