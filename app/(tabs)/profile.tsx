import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function ProfilScreen(): React.JSX.Element {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.label}>Innlogget som</Text>
        <Text style={styles.email}>{email ?? '—'}</Text>
      </Card>
      <View style={styles.buttonWrapper}>
        <Button label="Logg ut" onPress={handleSignOut} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#071412' },
  card: { marginTop: 48 },
  label: { color: '#5DCAA5', fontSize: 13, marginBottom: 4 },
  email: { color: '#E0F5F0', fontSize: 16, fontWeight: '500' },
  buttonWrapper: { marginTop: 24 },
});
