// Pure logic tests - inline functions to avoid RN/Supabase imports

type ActivityLevel = 'weight_loss' | 'maintenance' | 'active';

function calculateRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

function calculateDER(weightKg: number, activityLevel: ActivityLevel): number {
  const rer = calculateRER(weightKg);
  const multipliers: Record<ActivityLevel, number> = {
    weight_loss: 1.0, maintenance: 1.6, active: 2.0,
  };
  return Math.round(rer * multipliers[activityLevel]);
}

function calculateDailyPortions(dailyCalories: number, caloriesPerCup: number): number {
  if (caloriesPerCup <= 0) return 0;
  return Math.round((dailyCalories / caloriesPerCup) * 100) / 100;
}

function lbsToKg(lbs: number): number { return lbs * 0.4536; }

function getActivityLevelLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    weight_loss: 'Weight Loss (1.0x RER)', maintenance: 'Maintenance (1.6x RER)', active: 'Active (2.0x RER)',
  };
  return labels[level];
}

// --- Tests ---

describe('calculateRER', () => {
  test('calculates RER for a 10kg dog', () => {
    const rer = calculateRER(10);
    expect(rer).toBeCloseTo(394, 0);
  });

  test('calculates RER for a 30kg dog', () => {
    const rer = calculateRER(30);
    expect(rer).toBeGreaterThan(600);
    expect(rer).toBeLessThan(1000);
  });

  test('returns 0 for 0 weight', () => {
    expect(calculateRER(0)).toBe(0);
  });
});

describe('calculateDER', () => {
  test('weight loss uses 1.0x multiplier', () => {
    const rer = calculateRER(10);
    expect(calculateDER(10, 'weight_loss')).toBe(Math.round(rer * 1.0));
  });

  test('maintenance uses 1.6x multiplier', () => {
    const rer = calculateRER(10);
    expect(calculateDER(10, 'maintenance')).toBe(Math.round(rer * 1.6));
  });

  test('active uses 2.0x multiplier', () => {
    const rer = calculateRER(10);
    expect(calculateDER(10, 'active')).toBe(Math.round(rer * 2.0));
  });

  test('returns an integer', () => {
    expect(Number.isInteger(calculateDER(15, 'maintenance'))).toBe(true);
  });
});

describe('calculateDailyPortions', () => {
  test('calculates cups correctly', () => {
    expect(calculateDailyPortions(400, 350)).toBeCloseTo(1.14, 2);
  });

  test('returns 0 for zero calories per cup', () => {
    expect(calculateDailyPortions(400, 0)).toBe(0);
  });

  test('handles exact division', () => {
    expect(calculateDailyPortions(700, 350)).toBe(2);
  });
});

describe('lbsToKg', () => {
  test('converts correctly', () => {
    expect(lbsToKg(22)).toBeCloseTo(9.979, 2);
  });
});

describe('getActivityLevelLabel', () => {
  test('returns labels for all levels', () => {
    expect(getActivityLevelLabel('weight_loss')).toContain('Weight Loss');
    expect(getActivityLevelLabel('maintenance')).toContain('Maintenance');
    expect(getActivityLevelLabel('active')).toContain('Active');
  });
});
