import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { getUserPreferences, upsertUserPreferences } from '../../lib/db/userPreferences';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export default function ProfilScreen(): React.JSX.Element {
  const [email, setEmail] = useState<string | null>(null);
  const [restEnabled, setRestEnabled] = useState(true);
  const [restSeconds, setRestSeconds] = useState('120');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    getUserPreferences().then((prefs) => {
      setRestEnabled(prefs.restTimerEnabled);
      setRestSeconds(String(prefs.restTimerSeconds));
    }).catch(() => {});
  }, []);

  async function handleSignOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function handleSaveTimerSettings(): Promise<void> {
    const seconds = parseInt(restSeconds, 10);
    if (isNaN(seconds) || seconds < 0) {
      Alert.alert('Invalid value', 'Rest duration must be 0 or more');
      return;
    }
    try {
      await upsertUserPreferences({ restTimerEnabled: restEnabled, restTimerSeconds: seconds });
      Alert.alert('Saved', 'Settings updated');
    } catch {
      Alert.alert('Error', 'Could not save settings');
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.email}>{email ?? '—'}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Rest timer</Text>
        <View style={styles.row}>
          <Text style={styles.settingLabel}>Enable rest timer</Text>
          <Switch
            testID="rest-timer-toggle"
            value={restEnabled}
            onValueChange={setRestEnabled}
            trackColor={{ false: '#1a3330', true: '#20D2AA' }}
            thumbColor={restEnabled ? '#E0F5F0' : '#5DCAA5'}
          />
        </View>
        {restEnabled ? (
          <View style={styles.inputRow}>
            <Text style={styles.settingLabel}>Rest duration (seconds)</Text>
            <Input
              value={restSeconds}
              onChangeText={setRestSeconds}
              keyboardType="numeric"
              placeholder="120"
            />
          </View>
        ) : null}
        <View style={styles.saveButton}>
          <Button label="Save" onPress={handleSaveTimerSettings} />
        </View>
      </Card>

      <View style={styles.buttonWrapper}>
        <Button label="Log out" onPress={handleSignOut} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#071412' },
  card: { marginTop: 24 },
  label: { color: '#5DCAA5', fontSize: 13, marginBottom: 4 },
  email: { color: '#E0F5F0', fontSize: 16, fontWeight: '500' },
  sectionTitle: { color: '#E0F5F0', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  settingLabel: { color: '#E0F5F0', fontSize: 15, flex: 1 },
  inputRow: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
  buttonWrapper: { marginTop: 24 },
});
