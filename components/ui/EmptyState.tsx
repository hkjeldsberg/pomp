import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  iconName: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ iconName: _iconName, title, subtitle, action }: EmptyStateProps): React.JSX.Element {
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? (
        <View style={styles.actionContainer}>
          <Button label={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#E0F5F0',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5DCAA5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionContainer: {
    marginTop: 16,
  },
});
