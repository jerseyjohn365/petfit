import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Dog } from '../../types';
import { useLatestWeighIn } from '../../hooks/useWeighIns';
import { Card, Badge, colors, spacing, fontSize, borderRadius } from '../ui';
import { estimateBCS, getWeightCategoryColor } from '../../lib/bcs';

interface DogSummaryCardProps {
  dog: Dog;
}

export function DogSummaryCard({ dog }: DogSummaryCardProps) {
  const { data: latestWeighIn } = useLatestWeighIn(dog.id);

  const currentWeight = latestWeighIn?.weight ?? dog.initial_weight;
  const bcs = estimateBCS(currentWeight, null, dog.weight_unit);

  const totalChange = dog.initial_weight - dog.target_weight;
  const currentProgress = dog.initial_weight - currentWeight;
  const progressPercent = totalChange !== 0
    ? Math.max(0, Math.min(100, Math.round((currentProgress / totalChange) * 100)))
    : 0;

  return (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/dogs/${dog.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          {dog.photo_url ? (
            <Image source={{ uri: dog.photo_url }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoEmoji}>🐕</Text>
            </View>
          )}

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{dog.name}</Text>
              <Badge
                label={bcs.category.charAt(0).toUpperCase() + bcs.category.slice(1)}
                color={getWeightCategoryColor(bcs.category)}
              />
            </View>

            <View style={styles.weightRow}>
              <Text style={styles.currentWeight}>
                {currentWeight} {dog.weight_unit}
              </Text>
              <Text style={styles.targetWeight}>
                → {dog.target_weight} {dog.weight_unit}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent >= 100 ? colors.secondary : colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progressPercent}%</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  currentWeight: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  targetWeight: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
});
