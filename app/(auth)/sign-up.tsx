import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SignUpScreen(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(): Promise<void> {
    setError(null);
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opprett konto</Text>
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
      <Button label="Opprett konto" onPress={handleSignUp} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#071412' },
  title: { color: '#E0F5F0', fontSize: 28, fontWeight: '700', marginBottom: 32 },
  inputWrapper: { marginBottom: 16 },
});
