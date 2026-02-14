// Pure logic tests - inline functions to avoid RN/Supabase imports

type WeightCategory = 'underweight' | 'ideal' | 'overweight' | 'obese';

interface BreedWeightRange {
  min: number;
  max: number;
}

function estimateBCS(
  currentWeight: number,
  breedRange: BreedWeightRange | null,
  weightUnit: 'lbs' | 'kg' = 'lbs'
): { category: WeightCategory; score: number; description: string } {
  if (!breedRange) {
    return { category: 'ideal', score: 5, description: 'No breed data available for BCS estimate' };
  }
  const weight = weightUnit === 'kg' ? currentWeight * 2.205 : currentWeight;
  const { min, max } = breedRange;
  const range = max - min;
  let category: WeightCategory;
  let score: number;
  if (weight < min * 0.85) {
    category = 'underweight'; score = 2;
  } else if (weight < min) {
    category = 'underweight'; score = 3;
  } else if (weight <= max) {
    const position = (weight - min) / range;
    category = 'ideal';
    score = Math.round((4 + (position * 2)) * 10) / 10;
  } else if (weight <= max * 1.15) {
    category = 'overweight'; score = 7;
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

function getWeightCategoryColor(category: WeightCategory): string {
  switch (category) {
    case 'underweight': return '#F59E0B';
    case 'ideal': return '#10B981';
    case 'overweight': return '#F97316';
    case 'obese': return '#EF4444';
  }
}

function convertWeight(weight: number, from: 'lbs' | 'kg', to: 'lbs' | 'kg'): number {
  if (from === to) return weight;
  return from === 'lbs' ? weight * 0.4536 : weight * 2.205;
}

function lbsToKg(lbs: number): number { return lbs * 0.4536; }
function kgToLbs(kg: number): number { return kg * 2.205; }

// --- Tests ---

describe('estimateBCS', () => {
  const labRange = { min: 55, max: 80 };

  test('returns ideal for weight within breed range', () => {
    const result = estimateBCS(65, labRange);
    expect(result.category).toBe('ideal');
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.score).toBeLessThanOrEqual(6);
  });

  test('returns underweight for weight below range', () => {
    expect(estimateBCS(45, labRange).category).toBe('underweight');
  });

  test('returns overweight for weight slightly above range', () => {
    expect(estimateBCS(88, labRange).category).toBe('overweight');
  });

  test('returns obese for weight significantly above range', () => {
    expect(estimateBCS(100, labRange).category).toBe('obese');
  });

  test('returns ideal with no breed data', () => {
    const result = estimateBCS(70, null);
    expect(result.category).toBe('ideal');
    expect(result.description).toContain('No breed data');
  });

  test('handles kg weight unit', () => {
    const result = estimateBCS(30, labRange, 'kg');
    expect(result.category).toBe('ideal');
  });
});

describe('getWeightCategoryColor', () => {
  test('returns correct colors', () => {
    expect(getWeightCategoryColor('underweight')).toBe('#F59E0B');
    expect(getWeightCategoryColor('ideal')).toBe('#10B981');
    expect(getWeightCategoryColor('overweight')).toBe('#F97316');
    expect(getWeightCategoryColor('obese')).toBe('#EF4444');
  });
});

describe('convertWeight', () => {
  test('converts lbs to kg', () => {
    expect(convertWeight(100, 'lbs', 'kg')).toBeCloseTo(45.36, 1);
  });

  test('converts kg to lbs', () => {
    expect(convertWeight(45, 'kg', 'lbs')).toBeCloseTo(99.225, 1);
  });

  test('returns same value when units match', () => {
    expect(convertWeight(50, 'lbs', 'lbs')).toBe(50);
    expect(convertWeight(50, 'kg', 'kg')).toBe(50);
  });
});

describe('lbsToKg', () => {
  test('converts correctly', () => {
    expect(lbsToKg(10)).toBeCloseTo(4.536, 2);
    expect(lbsToKg(0)).toBe(0);
  });
});

describe('kgToLbs', () => {
  test('converts correctly', () => {
    expect(kgToLbs(10)).toBeCloseTo(22.05, 1);
    expect(kgToLbs(0)).toBe(0);
  });
});
