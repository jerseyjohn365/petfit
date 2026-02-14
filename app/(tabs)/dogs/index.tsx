import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogs } from '../../../src/hooks/useDogs';
import { Dog } from '../../../src/types';
import { Card, EmptyState, LoadingScreen, ScreenHeader, Badge, Button, colors, spacing, fontSize, borderRadius } from '../../../src/components/ui';
import { Image } from 'expo-image';

function DogListItem({ dog }: { dog: Dog }) {
  return (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/dogs/${dog.id}`)}>
      <Card style={styles.dogCard}>
        <View style={styles.dogRow}>
          {dog.photo_url ? (
            <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} contentFit="cover" />
          ) : (
            <View style={styles.dogPhotoPlaceholder}>
              <Text style={styles.dogPhotoEmoji}>{'\u{1F415}'}</Text>
            </View>
          )}
          <View style={styles.dogInfo}>
            <Text style={styles.dogName}>{dog.name}</Text>
            {dog.breed && <Text style={styles.dogBreed}>{dog.breed}</Text>}
            <Text style={styles.dogWeight}>
              Target: {dog.target_weight} {dog.weight_unit}
            </Text>
          </View>
          <Text style={styles.chevron}>{'\u203A'}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function DogsListScreen() {
  const { data: dogs, isLoading, refetch, isRefetching } = useDogs();

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="My Dogs"
        rightAction={{ label: '+ Add', onPress: () => router.push('/(tabs)/dogs/add') }}
      />
      {!dogs || dogs.length === 0 ? (
        <EmptyState
          icon={'\u{1F415}'}
          title="No dogs yet"
          message="Add your first dog to get started!"
          actionLabel="Add Dog"
          onAction={() => router.push('/(tabs)/dogs/add')}
        />
      ) : (
        <FlatList
          data={dogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DogListItem dog={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.md },
  dogCard: { padding: spacing.md },
  dogRow: { flexDirection: 'row', alignItems: 'center' },
  dogPhoto: { width: 56, height: 56, borderRadius: borderRadius.full },
  dogPhotoPlaceholder: {
    width: 56, height: 56, borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  dogPhotoEmoji: { fontSize: 28 },
  dogInfo: { flex: 1, marginLeft: spacing.md },
  dogName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  dogBreed: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  dogWeight: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textLight },
});
