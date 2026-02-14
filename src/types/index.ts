export type UnitSystem = 'imperial' | 'metric';
export type WeightUnit = 'lbs' | 'kg';
export type ActivityLevel = 'weight_loss' | 'maintenance' | 'active';
export type FoodType = 'dry' | 'wet' | 'raw' | 'dehydrated';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'meal';
export type ReminderFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type MilestoneType =
  | 'goal_25'
  | 'goal_50'
  | 'goal_75'
  | 'goal_100'
  | 'streak_4'
  | 'streak_8'
  | 'streak_12';

export type WeightCategory = 'underweight' | 'ideal' | 'overweight' | 'obese';

export interface Profile {
  id: string;
  display_name: string | null;
  unit_system: UnitSystem;
  created_at: string;
  updated_at: string;
}

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
  initial_weight: number;
  target_weight: number;
  weight_unit: WeightUnit;
  activity_level: ActivityLevel;
  created_at: string;
  updated_at: string;
}

export interface WeighIn {
  id: string;
  dog_id: string;
  weight: number;
  weighed_on: string;
  notes: string | null;
  created_at: string;
}

export interface FoodProduct {
  id: string;
  brand: string;
  product_name: string;
  calories_per_cup: number;
  food_type: FoodType;
  is_curated: boolean;
  approved: boolean;
  submitted_by: string | null;
  created_at: string;
}

export interface FeedingLog {
  id: string;
  dog_id: string;
  food_product_id: string | null;
  portion_size: number;
  portion_unit: 'cups' | 'grams' | 'oz';
  calories: number;
  meal_type: MealType;
  fed_at: string;
  notes: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  dog_id: string;
  milestone_type: MilestoneType;
  weight_at: number | null;
  achieved_at: string;
  shared: boolean;
  created_at: string;
}

export interface ReminderSettings {
  id: string;
  dog_id: string;
  frequency: ReminderFrequency;
  day_of_week: number | null;
  preferred_time: string;
  expo_push_token: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BreedWeight {
  id: string;
  breed_name: string;
  min_weight_lbs: number;
  max_weight_lbs: number;
}

export interface OfflineAction {
  id: string;
  type: 'weigh_in' | 'feeding_log';
  payload: Record<string, unknown>;
  created_at: number;
}
