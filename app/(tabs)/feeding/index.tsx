import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays, subDays } from 'date-fns';
import { useDogs } from '../../../src/hooks/useDogs';
import { useFeedingLogs } from '../../../src/hooks/useFeedingLog';
import { useLatestWeighIn } from '../../../src/hooks/useWeighIns';
import { calculateDER, lbsToKg } from '../../../src/lib/calories';
import { Card, EmptyState, LoadingScreen, ScreenHeader, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';

function DogFeedingSummary({ dogId, dogName, date }: { dogId: string; dogName: string; date: Date }) {
  const { data: logs } = useFeedingLogs(dogId, date);
  const totalCalories = logs?.reduce((sum, log) => sum + log.calories, 0) ?? 0;

  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryDogName}>{dogName}</Text>
        <Text style={styles.summaryCalories}>{totalCalories} kcal</Text>
      </View>
      {logs && logs.length > 0 ? (
        logs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <Text style={styles.logMealType}>{log.meal_type}</Text>
            <Text style={styles.logCalories}>{log.calories} kcal</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noLogs}>No meals logged</Text>
      )}
      <TouchableOpacity style={styles.addMealBtn} onPress={() => router.push(`/(tabs)/dogs/feed?dogId=${dogId}`)}>
        <Text style={styles.addMealText}>+ Log Meal</Text>
      </TouchableOpacity>
    </Card>
  );
}

export default function FeedingScreen() {
  const { data: dogs, isLoading } = useDogs();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView>
        <ScreenHeader title="Feeding Log" subtitle="Track daily meals" />

        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => setSelectedDate(subDays(selectedDate, 1))}>
            <Text style={styles.dateNavBtn}>{'\u2190'} Prev</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{format(selectedDate, 'EEEE, MMM d')}</Text>
          <TouchableOpacity onPress={() => setSelectedDate(addDays(selectedDate, 1))}>
            <Text style={styles.dateNavBtn}>Next {'\u2192'}</Text>
          </TouchableOpacity>
        </View>

        {!dogs || dogs.length === 0 ? (
          <EmptyState icon={'\u{1F356}'} title="No dogs yet" message="Add a dog first to start logging meals" actionLabel="Add Dog" onAction={() => router.push('/(tabs)/dogs/add')} />
        ) : (
          <View style={styles.dogFeedings}>
            {dogs.map((dog) => (
              <DogFeedingSummary key={dog.id} dogId={dog.id} dogName={dog.name} date={selectedDate} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  dateNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  dateNavBtn: { color: colors.primary, fontWeight: '600', fontSize: fontSize.sm },
  dateText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  dogFeedings: { padding: spacing.md, gap: spacing.md },
  summaryCard: { padding: spacing.md },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  summaryDogName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  summaryCalories: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  logMealType: { fontSize: fontSize.sm, color: colors.text, textTransform: 'capitalize' },
  logCalories: { fontSize: fontSize.sm, color: colors.textSecondary },
  noLogs: { fontSize: fontSize.sm, color: colors.textLight, fontStyle: 'italic', paddingVertical: spacing.sm },
  addMealBtn: { marginTop: spacing.sm, alignItems: 'center' },
  addMealText: { color: colors.primary, fontWeight: '600', fontSize: fontSize.sm },
});
