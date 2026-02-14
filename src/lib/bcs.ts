import { WeightCategory } from '../types';

interface BreedWeightRange {
  min: number;
  max: number;
}

// Returns weight category based on breed average ranges
export function estimateBCS(
  currentWeight: number,
  breedRange: BreedWeightRange | null,
  weightUnit: 'lbs' | 'kg' = 'lbs'
): { category: WeightCategory; score: number; description: string } {
  if (!breedRange) {
    return { category: 'ideal', score: 5, description: 'No breed data available for BCS estimate' };
  }

  const weight = weightUnit === 'kg' ? currentWeight * 2.205 : currentWeight;
  const { min, max } = breedRange;
  const midpoint = (min + max) / 2;
  const range = max - min;

  let category: WeightCategory;
  let score: number;

  if (weight < min * 0.85) {
    category = 'underweight';
    score = 2;
  } else if (weight < min) {
    category = 'underweight';
    score = 3;
  } else if (weight <= max) {
    // Within breed range
    const position = (weight - min) / range;
    if (position <= 0.5) {
      score = 4 + position;
      category = position < 0.2 ? 'ideal' : 'ideal';
    } else {
      score = 4.5 + position;
      category = 'ideal';
    }
    category = 'ideal';
    score = Math.round((4 + (position * 2)) * 10) / 10; // 4-6 range
  } else if (weight <= max * 1.15) {
    category = 'overweight';
    score = 7;
  } else {
    category = 'obese';
    score = 8 + Math.min(1, (weight - max * 1.15) / (max * 0.15));
  }

  const descriptions: Record<WeightCategory, string> = {
    underweight: 'Below ideal weight range for breed',
    ideal: 'Within healthy weight range for breed',
    overweight: 'Above ideal weight range for breed',
    obese: 'Significantly above ideal weight range',
  };

  return { category, score: Math.round(score * 10) / 10, description: descriptions[category] };
}

export function getWeightCategoryColor(category: WeightCategory): string {
  switch (category) {
    case 'underweight': return '#F59E0B';
    case 'ideal': return '#10B981';
    case 'overweight': return '#F97316';
    case 'obese': return '#EF4444';
  }
}

export function convertWeight(weight: number, from: 'lbs' | 'kg', to: 'lbs' | 'kg'): number {
  if (from === to) return weight;
  return from === 'lbs' ? weight * 0.4536 : weight * 2.205;
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.4536;
}

export function kgToLbs(kg: number): number {
  return kg * 2.205;
}
