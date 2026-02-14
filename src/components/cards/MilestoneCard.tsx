import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MilestoneType } from '../../types';
import { getMilestoneLabel, getMilestoneEmoji } from '../../lib/milestone';
import { colors, spacing, fontSize, borderRadius } from '../ui/theme';

interface MilestoneCardProps {
  milestoneType: MilestoneType;
  dogName: string;
  weightAt: number | null;
  weightUnit: 'lbs' | 'kg';
  achievedAt: string;
}

const gradients: Record<string, [string, string]> = {
  goal_25: ['#818CF8', '#4F46E5'],
  goal_50: ['#34D399', '#10B981'],
  goal_75: ['#F59E0B', '#D97706'],
  goal_100: ['#F472B6', '#EC4899'],
  streak_4: ['#FB923C', '#F97316'],
  streak_8: ['#38BDF8', '#0EA5E9'],
  streak_12: ['#A78BFA', '#7C3AED'],
};

export const MilestoneCard = forwardRef<View, MilestoneCardProps>(
  ({ milestoneType, dogName, weightAt, weightUnit, achievedAt }, ref) => {
    const gradient = gradients[milestoneType] || gradients.goal_25;
    const emoji = getMilestoneEmoji(milestoneType);
    const label = getMilestoneLabel(milestoneType);
    const dateStr = new Date(achievedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <View ref={ref} collapsable={false} style={styles.outer}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <View style={styles.content}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.dogName}>{dogName}</Text>

            {weightAt != null && (
              <View style={styles.weightBadge}>
                <Text style={styles.weightText}>
                  {weightAt} {weightUnit}
                </Text>
              </View>
            )}

            <Text style={styles.date}>{dateStr}</Text>

            <View style={styles.branding}>
              <Text style={styles.brandingText}>PetFit</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

MilestoneCard.displayName = 'MilestoneCard';

const styles = StyleSheet.create({
  outer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    width: 320,
    aspectRatio: 4 / 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dogName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.lg,
  },
  weightBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  weightText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  date: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  branding: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  brandingText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
});
