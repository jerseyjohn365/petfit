import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useCreateDog } from '../../../src/hooks/useDogs';
import { Button, Input, Card, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { ActivityLevel, WeightUnit } from '../../../src/types';

const dogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().optional(),
  date_of_birth: z.string().optional(),
  initial_weight: z.string().min(1, 'Initial weight is required').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  target_weight: z.string().min(1, 'Target weight is required').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
});

type DogForm = z.infer<typeof dogSchema>;

export default function AddDogScreen() {
  const createDog = useCreateDog();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('maintenance');
  const [uploading, setUploading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<DogForm>({
    defaultValues: { name: '', breed: '', date_of_birth: '', initial_weight: '', target_weight: '' },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, blob, { contentType: `image/${ext}` });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('dog-photos').getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch {
      return null;
    }
  };

  const onSubmit = async (formData: DogForm) => {
    setUploading(true);
    let photoUrl: string | null = null;
    if (photoUri) {
      photoUrl = await uploadPhoto(photoUri);
    }

    try {
      await createDog.mutateAsync({
        name: formData.name,
        breed: formData.breed || null,
        date_of_birth: formData.date_of_birth || null,
        photo_url: photoUrl,
        initial_weight: Number(formData.initial_weight),
        target_weight: Number(formData.target_weight),
        weight_unit: weightUnit,
        activity_level: activityLevel,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add dog');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backBtn}>{'\u2190'} Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Dog</Text>
          </View>

          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>{'\u{1F4F7}'}</Text>
                <Text style={styles.photoLabel}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <Input label="Name *" value={value} onChangeText={onChange} placeholder="Dog's name" error={errors.name?.message} />
          )} />

          <Controller control={control} name="breed" render={({ field: { onChange, value } }) => (
            <Input label="Breed" value={value} onChangeText={onChange} placeholder="e.g., Labrador Retriever" />
          )} />

          <Controller control={control} name="date_of_birth" render={({ field: { onChange, value } }) => (
            <Input label="Date of Birth" value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" />
          )} />

          <View style={styles.unitRow}>
            <Text style={styles.unitLabel}>Weight Unit</Text>
            <View style={styles.unitToggle}>
              {(['lbs', 'kg'] as WeightUnit[]).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitOption, weightUnit === unit && styles.unitOptionActive]}
                  onPress={() => setWeightUnit(unit)}
                >
                  <Text style={[styles.unitOptionText, weightUnit === unit && styles.unitOptionTextActive]}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Controller control={control} name="initial_weight" render={({ field: { onChange, value } }) => (
            <Input label={`Current Weight (${weightUnit}) *`} value={value} onChangeText={onChange} placeholder="0.0" keyboardType="decimal-pad" error={errors.initial_weight?.message} />
          )} />

          <Controller control={control} name="target_weight" render={({ field: { onChange, value } }) => (
            <Input label={`Target Weight (${weightUnit}) *`} value={value} onChangeText={onChange} placeholder="0.0" keyboardType="decimal-pad" error={errors.target_weight?.message} />
          )} />

          <View style={styles.unitRow}>
            <Text style={styles.unitLabel}>Activity Level</Text>
            <View style={styles.activityOptions}>
              {([
                { key: 'weight_loss' as const, label: 'Weight Loss' },
                { key: 'maintenance' as const, label: 'Maintenance' },
                { key: 'active' as const, label: 'Active' },
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.activityOption, activityLevel === opt.key && styles.activityOptionActive]}
                  onPress={() => setActivityLevel(opt.key)}
                >
                  <Text style={[styles.activityOptionText, activityLevel === opt.key && styles.activityOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button title="Add Dog" onPress={handleSubmit(onSubmit)} loading={uploading || createDog.isPending} style={styles.submitBtn} />
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
  photoContainer: { alignSelf: 'center', marginBottom: spacing.lg },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
  },
  photoIcon: { fontSize: 32 },
  photoLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  unitRow: { marginBottom: spacing.md },
  unitLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  unitToggle: { flexDirection: 'row', gap: spacing.sm },
  unitOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  unitOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitOptionText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  unitOptionTextActive: { color: '#FFFFFF' },
  activityOptions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  activityOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  activityOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  activityOptionText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  activityOptionTextActive: { color: '#FFFFFF' },
  submitBtn: { marginTop: spacing.lg, marginBottom: spacing.xxl },
});
