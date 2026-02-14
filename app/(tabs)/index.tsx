import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogs } from '../../src/hooks/useDogs';
import { useAuth } from '../../src/lib/auth';
import { useProfile } from '../../src/hooks/useProfile';
import { Card, EmptyState, LoadingScreen, ScreenHeader, colors, spacing, fontSize, borderRadius } from '../../src/components/ui';
import { DogSummaryCard } from '../../src/components/dog/DogSummaryCard';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: dogs, isLoading, refetch, isRefetching } = useDogs();

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <ScreenHeader
          title={profile?.display_name ? `Hi, ${profile.display_name}!` : 'Dashboard'}
          subtitle="Your dogs' progress at a glance"
        />

        {!dogs || dogs.length === 0 ? (
          <EmptyState
            icon="\u{1F415}"
            title="No dogs yet"
            message="Add your first dog to start tracking their weight journey!"
            actionLabel="Add Dog"
            onAction={() => router.push('/(tabs)/dogs/add')}
          />
        ) : (
          <View style={styles.dogList}>
            {dogs.map((dog) => (
              <DogSummaryCard key={dog.id} dog={dog} />
            ))}
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/dogs/add')}>
              <Text style={styles.actionIcon}>{'\u2795'}</Text>
              <Text style={styles.actionLabel}>Add Dog</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/feeding')}>
              <Text style={styles.actionIcon}>{'\u{1F356}'}</Text>
              <Text style={styles.actionLabel}>Log Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  dogList: { paddingHorizontal: spacing.md, gap: spacing.md },
  quickActions: { padding: spacing.md, marginTop: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  actionGrid: { flexDirection: 'row', gap: spacing.md },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.sm },
  actionLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
});
