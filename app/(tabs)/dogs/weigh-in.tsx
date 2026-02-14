import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDog } from '../../../src/hooks/useDogs';
import { useWeighIns, useCreateWeighIn } from '../../../src/hooks/useWeighIns';
import { useMilestones } from '../../../src/hooks/useMilestones';
import { checkGoalMilestones, checkStreakMilestones, saveMilestones } from '../../../src/lib/milestone';
import { Button, Input, Card, LoadingScreen, colors, spacing, fontSize } from '../../../src/components/ui';
import { format } from 'date-fns';

export default function WeighInScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const { data: dog, isLoading } = useDog(dogId!);
  const { data: weighIns } = useWeighIns(dogId!);
  const { data: existingMilestones } = useMilestones(dogId!);
  const createWeighIn = useCreateWeighIn();

  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (!dog) return null;

  const handleSave = async () => {
    const numWeight = Number(weight);
    if (!weight || isNaN(numWeight) || numWeight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    setSaving(true);
    try {
      await createWeighIn.mutateAsync({
        dog_id: dog.id,
        weight: numWeight,
        weighed_on: format(new Date(), 'yyyy-MM-dd'),
        notes: notes || null,
      });

      // Check for milestones
      const goalMilestones = checkGoalMilestones(dog, numWeight, existingMilestones || []);
      const allWeighIns = [...(weighIns || []), { weight: numWeight, weighed_on: format(new Date(), 'yyyy-MM-dd') }] as any;
      const streakMilestones = checkStreakMilestones(allWeighIns, 'weekly', existingMilestones || []);
      const newMilestones = [...goalMilestones, ...streakMilestones];

      if (newMilestones.length > 0) {
        await saveMilestones(dog.id, newMilestones);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Milestone!', `${dog.name} reached a new milestone! Check their profile to see it.`);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save weigh-in');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backBtn}>{'\u2190'} Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Log Weigh-In</Text>
          </View>

          <Card style={styles.dogInfo}>
            <Text style={styles.dogName}>{dog.name}</Text>
            <Text style={styles.dogDetail}>Target: {dog.target_weight} {dog.weight_unit}</Text>
          </Card>

          <Input
            label={`Weight (${dog.weight_unit})`}
            value={weight}
            onChangeText={setWeight}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />

          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any observations..."
            multiline
            numberOfLines={3}
          />

          <Text style={styles.date}>Date: {format(new Date(), 'MMMM d, yyyy')}</Text>

          <Button
            title="Save Weigh-In"
            onPress={handleSave}
            loading={saving}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginLeft: spacing.md },
  dogInfo: { padding: spacing.md, marginBottom: spacing.lg },
  dogName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  dogDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  saveBtn: { marginTop: spacing.lg },
});
