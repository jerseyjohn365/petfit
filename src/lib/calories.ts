import { ActivityLevel } from '../types';

// Resting Energy Requirement: 70 * (weight_kg ^ 0.75)
export function calculateRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

// Daily Energy Requirement based on activity level
export function calculateDER(weightKg: number, activityLevel: ActivityLevel): number {
  const rer = calculateRER(weightKg);
  const multipliers: Record<ActivityLevel, number> = {
    weight_loss: 1.0,
    maintenance: 1.6,
    active: 2.0,
  };
  return Math.round(rer * multipliers[activityLevel]);
}

// Calculate how many cups of food per day
export function calculateDailyPortions(
  dailyCalories: number,
  caloriesPerCup: number
): number {
  if (caloriesPerCup <= 0) return 0;
  return Math.round((dailyCalories / caloriesPerCup) * 100) / 100;
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.4536;
}

export function getActivityLevelLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    weight_loss: 'Weight Loss (1.0x RER)',
    maintenance: 'Maintenance (1.6x RER)',
    active: 'Active (2.0x RER)',
  };
  return labels[level];
}
