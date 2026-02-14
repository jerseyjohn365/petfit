import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogs } from '../../../src/hooks/useDogs';
import { supabase } from '../../../src/lib/supabase';
import { registerForPushNotifications } from '../../../src/lib/notifications';
import { ReminderSettings, ReminderFrequency } from '../../../src/types';
import { Button, Card, LoadingScreen, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FREQUENCIES: { key: ReminderFrequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Bi-weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export default function RemindersScreen() {
  const { data: dogs, isLoading: dogsLoading } = useDogs();
  const [reminders, setReminders] = useState<Record<string, ReminderSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReminders();
  }, [dogs]);

  const loadReminders = async () => {
    if (!dogs) return;
    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .in('dog_id', dogs.map(d => d.id));
    if (data) {
      const map: Record<string, ReminderSettings> = {};
      data.forEach((r: ReminderSettings) => { map[r.dog_id] = r; });
      setReminders(map);
    }
    setLoading(false);
  };

  const saveReminder = async (dogId: string, settings: Partial<ReminderSettings>) => {
    setSaving(true);
    try {
      const token = await registerForPushNotifications();
      const existing = reminders[dogId];

      if (existing) {
        await supabase.from('reminder_settings').update({ ...settings, expo_push_token: token }).eq('id', existing.id);
      } else {
        await supabase.from('reminder_settings').insert({
          dog_id: dogId,
          frequency: 'weekly',
          day_of_week: 0,
          preferred_time: '09:00',
          expo_push_token: token,
          enabled: true,
          ...settings,
        });
      }
      await loadReminders();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    setSaving(false);
  };

  if (dogsLoading || loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reminders</Text>
        </View>

        {dogs?.map((dog) => {
          const reminder = reminders[dog.id];
          return (
            <Card key={dog.id} style={styles.dogCard}>
              <Text style={styles.dogName}>{dog.name}</Text>

              <Text style={styles.fieldLabel}>Frequency</Text>
              <View style={styles.optionRow}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.option, reminder?.frequency === f.key && styles.optionActive]}
                    onPress={() => saveReminder(dog.id, { frequency: f.key })}
                  >
                    <Text style={[styles.optionText, reminder?.frequency === f.key && styles.optionTextActive]}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(reminder?.frequency === 'weekly' || reminder?.frequency === 'biweekly') && (
                <>
                  <Text style={styles.fieldLabel}>Day</Text>
                  <View style={styles.optionRow}>
                    {DAYS.map((day, i) => (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayOption, reminder?.day_of_week === i && styles.optionActive]}
                        onPress={() => saveReminder(dog.id, { day_of_week: i })}
                      >
                        <Text style={[styles.optionText, reminder?.day_of_week === i && styles.optionTextActive]}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {!reminder && (
                <Button title="Enable Reminders" onPress={() => saveReminder(dog.id, {})} size="sm" style={styles.enableBtn} />
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginLeft: spacing.md },
  dogCard: { padding: spacing.md, marginBottom: spacing.md },
  dogName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  option: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  dayOption: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: fontSize.xs, color: colors.text },
  optionTextActive: { color: '#FFFFFF' },
  enableBtn: { marginTop: spacing.md },
});
