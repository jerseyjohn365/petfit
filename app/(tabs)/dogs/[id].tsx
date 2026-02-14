import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useDog } from '../../../src/hooks/useDogs';
import { useWeighIns, useLatestWeighIn } from '../../../src/hooks/useWeighIns';
import { useMilestones } from '../../../src/hooks/useMilestones';
import { Card, Badge, LoadingScreen, Button, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';
import { WeightChart } from '../../../src/components/charts/WeightChart';
import { estimateBCS, getWeightCategoryColor } from '../../../src/lib/bcs';
import { getMilestoneLabel, getMilestoneEmoji } from '../../../src/lib/milestone';

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dog, isLoading: dogLoading } = useDog(id!);
  const { data: weighIns, isLoading: weighInsLoading, refetch } = useWeighIns(id!);
  const { data: latestWeighIn } = useLatestWeighIn(id!);
  const { data: milestones } = useMilestones(id!);

  if (dogLoading || weighInsLoading) return <LoadingScreen />;
  if (!dog) return null;

  const currentWeight = latestWeighIn?.weight ?? dog.initial_weight;
  const bcs = estimateBCS(currentWeight, null, dog.weight_unit);
  const progressPercent = dog.initial_weight !== dog.target_weight
    ? Math.round(((dog.initial_weight - currentWeight) / (dog.initial_weight - dog.target_weight)) * 100)
    : 0;
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          {dog.photo_url ? (
            <Image source={{ uri: dog.photo_url }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}><Text style={{ fontSize: 40 }}>{'\u{1F415}'}</Text></View>
          )}
          <Text style={styles.dogName}>{dog.name}</Text>
          {dog.breed && <Text style={styles.dogBreed}>{dog.breed}</Text>}
          <Badge label={bcs.category.charAt(0).toUpperCase() + bcs.category.slice(1)} color={getWeightCategoryColor(bcs.category)} style={styles.badge} />
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{currentWeight}</Text>
            <Text style={styles.statLabel}>Current ({dog.weight_unit})</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{dog.target_weight}</Text>
            <Text style={styles.statLabel}>Target ({dog.weight_unit})</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{clampedProgress}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </Card>
        </View>

        {weighIns && weighIns.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Weight History</Text>
            <WeightChart weighIns={weighIns} targetWeight={dog.target_weight} weightUnit={dog.weight_unit} />
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="Log Weigh-In"
            onPress={() => router.push(`/(tabs)/dogs/weigh-in?dogId=${dog.id}`)}
            style={{ flex: 1 }}
          />
          <Button
            title="Log Meal"
            onPress={() => router.push(`/(tabs)/dogs/feed?dogId=${dog.id}`)}
            variant="secondary"
            style={{ flex: 1 }}
          />
        </View>

        {milestones && milestones.length > 0 && (
          <View style={styles.milestoneSection}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            {milestones.map((m) => (
              <Card key={m.id} style={styles.milestoneCard}>
                <Text style={styles.milestoneEmoji}>{getMilestoneEmoji(m.milestone_type)}</Text>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneLabel}>{getMilestoneLabel(m.milestone_type)}</Text>
                  <Text style={styles.milestoneDate}>{new Date(m.achieved_at).toLocaleDateString()}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  backBtn: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
  profileSection: { alignItems: 'center', paddingVertical: spacing.lg },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  dogName: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  dogBreed: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 },
  badge: { marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  chartCard: { marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md, paddingHorizontal: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, marginTop: spacing.lg },
  milestoneSection: { marginTop: spacing.lg, paddingBottom: spacing.xxl },
  milestoneCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md },
  milestoneEmoji: { fontSize: 28 },
  milestoneInfo: { marginLeft: spacing.md },
  milestoneLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  milestoneDate: { fontSize: fontSize.sm, color: colors.textSecondary },
});
