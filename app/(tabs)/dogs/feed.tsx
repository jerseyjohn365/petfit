import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDog } from '../../../src/hooks/useDogs';
import { useFoodProducts } from '../../../src/hooks/useFoodProducts';
import { useCreateFeedingLog } from '../../../src/hooks/useFeedingLog';
import { useLatestWeighIn } from '../../../src/hooks/useWeighIns';
import { calculateDER, lbsToKg } from '../../../src/lib/calories';
import { FoodProduct, MealType } from '../../../src/types';
import { Button, Input, Card, LoadingScreen, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';

export default function FeedScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const { data: dog, isLoading } = useDog(dogId!);
  const { data: latestWeighIn } = useLatestWeighIn(dogId!);
  const createFeedingLog = useCreateFeedingLog();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodProduct | null>(null);
  const [portion, setPortion] = useState('');
  const [mealType, setMealType] = useState<MealType>('meal');
  const [saving, setSaving] = useState(false);

  const { data: foods } = useFoodProducts(searchQuery);

  if (isLoading) return <LoadingScreen />;
  if (!dog) return null;

  const currentWeight = latestWeighIn?.weight ?? dog.initial_weight;
  const weightKg = dog.weight_unit === 'kg' ? currentWeight : lbsToKg(currentWeight);
  const dailyCalories = calculateDER(weightKg, dog.activity_level);

  const handleSave = async () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food');
      return;
    }
    const numPortion = Number(portion);
    if (!portion || isNaN(numPortion) || numPortion <= 0) {
      Alert.alert('Error', 'Please enter a valid portion size');
      return;
    }

    const calories = numPortion * selectedFood.calories_per_cup;
    setSaving(true);
    try {
      await createFeedingLog.mutateAsync({
        dog_id: dog.id,
        food_product_id: selectedFood.id,
        portion_size: numPortion,
        portion_unit: 'cups',
        calories: Math.round(calories),
        meal_type: mealType,
        fed_at: new Date().toISOString(),
        notes: null,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log meal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backBtn}>{'\u2190'} Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Log Meal</Text>
          </View>

          <Card style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>Daily Calorie Target</Text>
            <Text style={styles.calorieValue}>{dailyCalories} kcal</Text>
            <Text style={styles.disclaimer}>Consult your vet for a personalized feeding plan</Text>
          </Card>

          <Input
            label="Search Food"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by brand or product..."
          />

          {!selectedFood && foods && foods.length > 0 && (
            <View style={styles.foodList}>
              {foods.slice(0, 10).map((food) => (
                <TouchableOpacity key={food.id} style={styles.foodItem} onPress={() => { setSelectedFood(food); setSearchQuery(food.brand + ' ' + food.product_name); }}>
                  <Text style={styles.foodName}>{food.brand} - {food.product_name}</Text>
                  <Text style={styles.foodCals}>{food.calories_per_cup} kcal/cup</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedFood && (
            <Card style={styles.selectedCard}>
              <Text style={styles.selectedName}>{selectedFood.brand} - {selectedFood.product_name}</Text>
              <Text style={styles.selectedCals}>{selectedFood.calories_per_cup} kcal/cup ({selectedFood.food_type})</Text>
              <TouchableOpacity onPress={() => { setSelectedFood(null); setSearchQuery(''); }}>
                <Text style={styles.changeLink}>Change food</Text>
              </TouchableOpacity>
            </Card>
          )}

          <Input
            label="Portion (cups)"
            value={portion}
            onChangeText={setPortion}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />

          {selectedFood && portion && !isNaN(Number(portion)) && (
            <Text style={styles.calEstimate}>
              Estimated: {Math.round(Number(portion) * selectedFood.calories_per_cup)} kcal
            </Text>
          )}

          <View style={styles.mealTypeRow}>
            <Text style={styles.mealTypeLabel}>Meal Type</Text>
            <View style={styles.mealTypes}>
              {(['breakfast', 'lunch', 'dinner', 'snack', 'meal'] as MealType[]).map((mt) => (
                <TouchableOpacity key={mt} style={[styles.mealTypeOption, mealType === mt && styles.mealTypeActive]} onPress={() => setMealType(mt)}>
                  <Text style={[styles.mealTypeText, mealType === mt && styles.mealTypeTextActive]}>
                    {mt.charAt(0).toUpperCase() + mt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button title="Log Meal" onPress={handleSave} loading={saving} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginLeft: spacing.md },
  calorieCard: { padding: spacing.md, marginBottom: spacing.lg, alignItems: 'center' },
  calorieLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  calorieValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.primary, marginTop: 4 },
  disclaimer: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs, fontStyle: 'italic' },
  foodList: { backgroundColor: colors.surface, borderRadius: borderRadius.md, marginBottom: spacing.md, maxHeight: 250 },
  foodItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  foodName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  foodCals: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  selectedCard: { padding: spacing.md, marginBottom: spacing.md },
  selectedName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  selectedCals: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  changeLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '500', marginTop: spacing.sm },
  calEstimate: { fontSize: fontSize.md, fontWeight: '600', color: colors.secondary, marginBottom: spacing.md },
  mealTypeRow: { marginBottom: spacing.md },
  mealTypeLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  mealTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  mealTypeOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  mealTypeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  mealTypeText: { fontSize: fontSize.sm, color: colors.text },
  mealTypeTextActive: { color: '#FFFFFF' },
  saveBtn: { marginTop: spacing.md, marginBottom: spacing.xxl },
});
