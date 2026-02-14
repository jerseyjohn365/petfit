import { Dog, WeighIn, MilestoneType, Milestone } from '../types';
import { supabase } from './supabase';

interface MilestoneCheck {
  type: MilestoneType;
  weightAt: number;
}

export function checkGoalMilestones(
  dog: Dog,
  currentWeight: number,
  existingMilestones: Milestone[]
): MilestoneCheck[] {
  const newMilestones: MilestoneCheck[] = [];
  const existingTypes = new Set(existingMilestones.map(m => m.milestone_type));

  const totalChange = dog.initial_weight - dog.target_weight;
  if (totalChange === 0) return [];

  const currentProgress = dog.initial_weight - currentWeight;
  const progressPercent = (currentProgress / totalChange) * 100;

  const goalMilestones: { type: MilestoneType; threshold: number }[] = [
    { type: 'goal_25', threshold: 25 },
    { type: 'goal_50', threshold: 50 },
    { type: 'goal_75', threshold: 75 },
    { type: 'goal_100', threshold: 100 },
  ];

  for (const milestone of goalMilestones) {
    if (progressPercent >= milestone.threshold && !existingTypes.has(milestone.type)) {
      newMilestones.push({ type: milestone.type, weightAt: currentWeight });
    }
  }

  return newMilestones;
}

export function checkStreakMilestones(
  weighIns: WeighIn[],
  frequency: 'weekly' | 'biweekly' = 'weekly',
  existingMilestones: Milestone[]
): MilestoneCheck[] {
  const newMilestones: MilestoneCheck[] = [];
  const existingTypes = new Set(existingMilestones.map(m => m.milestone_type));

  if (weighIns.length < 4) return [];

  const sorted = [...weighIns].sort(
    (a, b) => new Date(a.weighed_on).getTime() - new Date(b.weighed_on).getTime()
  );

  const expectedIntervalDays = frequency === 'weekly' ? 7 : 14;
  const toleranceDays = 2;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].weighed_on).getTime();
    const curr = new Date(sorted[i].weighed_on).getTime();
    const daysDiff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (Math.abs(daysDiff - expectedIntervalDays) <= toleranceDays) {
      streak++;
    } else {
      streak = 1;
    }
  }

  const streakMilestones: { type: MilestoneType; threshold: number }[] = [
    { type: 'streak_4', threshold: 4 },
    { type: 'streak_8', threshold: 8 },
    { type: 'streak_12', threshold: 12 },
  ];

  const latestWeight = sorted[sorted.length - 1]?.weight ?? 0;

  for (const milestone of streakMilestones) {
    if (streak >= milestone.threshold && !existingTypes.has(milestone.type)) {
      newMilestones.push({ type: milestone.type, weightAt: latestWeight });
    }
  }

  return newMilestones;
}

export async function saveMilestones(dogId: string, milestones: MilestoneCheck[]): Promise<Milestone[]> {
  if (milestones.length === 0) return [];

  const rows = milestones.map(m => ({
    dog_id: dogId,
    milestone_type: m.type,
    weight_at: m.weightAt,
  }));

  const { data, error } = await supabase
    .from('milestones')
    .upsert(rows, { onConflict: 'dog_id,milestone_type' })
    .select();

  if (error) throw error;
  return data as Milestone[];
}

export function getMilestoneLabel(type: MilestoneType): string {
  const labels: Record<MilestoneType, string> = {
    goal_25: '25% to Goal!',
    goal_50: 'Halfway There!',
    goal_75: '75% to Goal!',
    goal_100: 'Goal Reached!',
    streak_4: '4 Week Streak!',
    streak_8: '8 Week Streak!',
    streak_12: '12 Week Streak!',
  };
  return labels[type];
}

export function getMilestoneEmoji(type: MilestoneType): string {
  const emojis: Record<MilestoneType, string> = {
    goal_25: '\u{1F31F}',
    goal_50: '\u2B50',
    goal_75: '\u{1F3C6}',
    goal_100: '\u{1F389}',
    streak_4: '\u{1F525}',
    streak_8: '\u{1F4AA}',
    streak_12: '\u{1F451}',
  };
  return emojis[type];
}
