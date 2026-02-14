import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { MilestoneCard } from './MilestoneCard';
import { shareMilestoneCard } from '../../lib/share';
import { MilestoneType } from '../../types';
import { Button, colors, spacing, fontSize } from '../ui';
import { supabase } from '../../lib/supabase';

interface CelebrationSheetProps {
  visible: boolean;
  onDismiss: () => void;
  milestoneType: MilestoneType;
  dogName: string;
  dogId: string;
  milestoneId: string;
  weightAt: number | null;
  weightUnit: 'lbs' | 'kg';
  achievedAt: string;
}

export function CelebrationSheet({
  visible,
  onDismiss,
  milestoneType,
  dogName,
  dogId,
  milestoneId,
  weightAt,
  weightUnit,
  achievedAt,
}: CelebrationSheetProps) {
  const cardRef = useRef<View>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleShare = useCallback(async () => {
    const shared = await shareMilestoneCard(cardRef);
    if (shared) {
      await supabase
        .from('milestones')
        .update({ shared: true })
        .eq('id', milestoneId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [milestoneId]);

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.close();
    onDismiss();
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={onDismiss}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>{dogName} reached a new milestone</Text>

        <View style={styles.cardWrapper}>
          <MilestoneCard
            ref={cardRef}
            milestoneType={milestoneType}
            dogName={dogName}
            weightAt={weightAt}
            weightUnit={weightUnit}
            achievedAt={achievedAt}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Share"
            onPress={handleShare}
            variant="primary"
            style={styles.shareBtn}
          />
          <Button
            title="Close"
            onPress={handleDismiss}
            variant="ghost"
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  indicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  shareBtn: {
    width: '100%',
  },
});
