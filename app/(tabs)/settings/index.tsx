import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/lib/auth';
import { useProfile, useUpdateProfile } from '../../../src/hooks/useProfile';
import { Card, Button, ScreenHeader, LoadingScreen, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';
import { UnitSystem } from '../../../src/types';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  if (isLoading) return <LoadingScreen />;

  const handleUnitChange = async (unit: UnitSystem) => {
    try {
      await updateProfile.mutateAsync({ unit_system: unit });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView>
        <ScreenHeader title="Settings" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Display Name</Text>
              <Text style={styles.value}>{profile?.display_name || 'Not set'}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Unit System</Text>
              <View style={styles.unitToggle}>
                {(['imperial', 'metric'] as UnitSystem[]).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitOption, profile?.unit_system === unit && styles.unitOptionActive]}
                    onPress={() => handleUnitChange(unit)}
                  >
                    <Text style={[styles.unitText, profile?.unit_system === unit && styles.unitTextActive]}>
                      {unit === 'imperial' ? 'lbs' : 'kg'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <Card style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/(tabs)/settings/reminders')}>
              <Text style={styles.label}>Manage Reminders</Text>
              <Text style={styles.chevron}>{'\u203A'}</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Button title="Sign Out" onPress={handleSignOut} variant="danger" />
        </View>

        <Text style={styles.version}>PetFit v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm },
  card: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: fontSize.md, color: colors.text },
  value: { fontSize: fontSize.md, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textLight },
  unitToggle: { flexDirection: 'row', gap: spacing.xs },
  unitOption: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  unitOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { fontSize: fontSize.sm, color: colors.text },
  unitTextActive: { color: '#FFFFFF' },
  version: { textAlign: 'center', color: colors.textLight, fontSize: fontSize.sm, paddingBottom: spacing.xxl },
});
