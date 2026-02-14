// Pure logic tests - no external imports

type MilestoneType =
  | 'goal_25' | 'goal_50' | 'goal_75' | 'goal_100'
  | 'streak_4' | 'streak_8' | 'streak_12';

interface Dog {
  initial_weight: number;
  target_weight: number;
}

interface WeighIn {
  weight: number;
  weighed_on: string;
}

interface Milestone {
  milestone_type: MilestoneType;
}

interface MilestoneCheck {
  type: MilestoneType;
  weightAt: number;
}

function checkGoalMilestones(
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

function checkStreakMilestones(
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

function getMilestoneLabel(type: MilestoneType): string {
  const labels: Record<MilestoneType, string> = {
    goal_25: '25% to Goal!', goal_50: 'Halfway There!', goal_75: '75% to Goal!',
    goal_100: 'Goal Reached!', streak_4: '4 Week Streak!', streak_8: '8 Week Streak!', streak_12: '12 Week Streak!',
  };
  return labels[type];
}

function getMilestoneEmoji(type: MilestoneType): string {
  const emojis: Record<MilestoneType, string> = {
    goal_25: '🌟', goal_50: '⭐', goal_75: '🏆', goal_100: '🎉',
    streak_4: '🔥', streak_8: '💪', streak_12: '👑',
  };
  return emojis[type];
}

// --- Tests ---

const makeDog = (overrides: Partial<Dog> = {}): Dog => ({
  initial_weight: 80,
  target_weight: 60,
  ...overrides,
});

const makeMilestone = (type: MilestoneType): Milestone => ({ milestone_type: type });

describe('checkGoalMilestones', () => {
  const dog = makeDog();

  test('returns 25% milestone when 25% progress reached', () => {
    const result = checkGoalMilestones(dog, 75, []);
    expect(result).toEqual([{ type: 'goal_25', weightAt: 75 }]);
  });

  test('returns multiple milestones when multiple thresholds crossed', () => {
    const result = checkGoalMilestones(dog, 65, []);
    expect(result).toHaveLength(3);
    expect(result.map((m) => m.type)).toEqual(['goal_25', 'goal_50', 'goal_75']);
  });

  test('returns all four milestones at goal weight', () => {
    const result = checkGoalMilestones(dog, 60, []);
    expect(result).toHaveLength(4);
    expect(result.map((m) => m.type)).toContain('goal_100');
  });

  test('skips already earned milestones', () => {
    const existing = [makeMilestone('goal_25'), makeMilestone('goal_50')];
    const result = checkGoalMilestones(dog, 65, existing);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('goal_75');
  });

  test('returns empty when no progress', () => {
    expect(checkGoalMilestones(dog, 80, [])).toHaveLength(0);
  });

  test('returns empty when target equals initial weight', () => {
    expect(checkGoalMilestones(makeDog({ initial_weight: 60, target_weight: 60 }), 60, [])).toHaveLength(0);
  });
});

describe('checkStreakMilestones', () => {
  const makeWeighIns = (count: number): WeighIn[] =>
    Array.from({ length: count }, (_, i) => {
      const date = new Date('2024-01-01');
      date.setDate(date.getDate() + i * 7);
      return { weight: 75 - i * 0.5, weighed_on: date.toISOString().split('T')[0] };
    });

  test('returns 4-week streak milestone', () => {
    const result = checkStreakMilestones(makeWeighIns(4), 'weekly', []);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('streak_4');
  });

  test('returns multiple streak milestones at 8 weeks', () => {
    const result = checkStreakMilestones(makeWeighIns(8), 'weekly', []);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.type)).toEqual(['streak_4', 'streak_8']);
  });

  test('returns all streak milestones at 12+ weeks', () => {
    const result = checkStreakMilestones(makeWeighIns(12), 'weekly', []);
    expect(result).toHaveLength(3);
  });

  test('tolerates +/-2 day variance', () => {
    const weighIns: WeighIn[] = [
      { weight: 75, weighed_on: '2024-01-01' },
      { weight: 74, weighed_on: '2024-01-09' }, // +8 days
      { weight: 73, weighed_on: '2024-01-15' }, // +6 days
      { weight: 72, weighed_on: '2024-01-22' }, // +7 days
    ];
    const result = checkStreakMilestones(weighIns, 'weekly', []);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('streak_4');
  });

  test('breaks streak on large gap', () => {
    const weighIns: WeighIn[] = [
      { weight: 75, weighed_on: '2024-01-01' },
      { weight: 74, weighed_on: '2024-01-08' },
      { weight: 73, weighed_on: '2024-01-25' }, // 17 day gap
      { weight: 72, weighed_on: '2024-02-01' },
    ];
    expect(checkStreakMilestones(weighIns, 'weekly', [])).toHaveLength(0);
  });

  test('skips already earned milestones', () => {
    const result = checkStreakMilestones(makeWeighIns(8), 'weekly', [makeMilestone('streak_4')]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('streak_8');
  });

  test('returns empty with fewer than 4 weigh-ins', () => {
    expect(checkStreakMilestones(makeWeighIns(3), 'weekly', [])).toHaveLength(0);
  });
});

describe('getMilestoneLabel', () => {
  test('returns correct labels for all types', () => {
    expect(getMilestoneLabel('goal_25')).toBe('25% to Goal!');
    expect(getMilestoneLabel('goal_50')).toBe('Halfway There!');
    expect(getMilestoneLabel('goal_75')).toBe('75% to Goal!');
    expect(getMilestoneLabel('goal_100')).toBe('Goal Reached!');
    expect(getMilestoneLabel('streak_4')).toBe('4 Week Streak!');
    expect(getMilestoneLabel('streak_8')).toBe('8 Week Streak!');
    expect(getMilestoneLabel('streak_12')).toBe('12 Week Streak!');
  });
});

describe('getMilestoneEmoji', () => {
  test('returns emoji for each type', () => {
    const types: MilestoneType[] = ['goal_25', 'goal_50', 'goal_75', 'goal_100', 'streak_4', 'streak_8', 'streak_12'];
    types.forEach((t) => expect(getMilestoneEmoji(t)).toBeTruthy());
  });
});
