import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { FeedingLog } from '../types';
import { useOfflineStore } from '../store/offlineStore';
import NetInfo from '@react-native-community/netinfo';
import { startOfDay, endOfDay } from 'date-fns';

export function useFeedingLogs(dogId: string, date?: Date) {
  const targetDate = date || new Date();

  return useQuery({
    queryKey: ['feeding_logs', dogId, targetDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const start = startOfDay(targetDate).toISOString();
      const end = endOfDay(targetDate).toISOString();

      const { data, error } = await supabase
        .from('feeding_logs')
        .select('*, food_products(*)')
        .eq('dog_id', dogId)
        .gte('fed_at', start)
        .lte('fed_at', end)
        .order('fed_at', { ascending: true });
      if (error) throw error;
      return data as (FeedingLog & { food_products: any })[];
    },
    enabled: !!dogId,
  });
}

export function useCreateFeedingLog() {
  const queryClient = useQueryClient();
  const addOfflineAction = useOfflineStore((s) => s.addAction);

  return useMutation({
    mutationFn: async (log: Omit<FeedingLog, 'id' | 'created_at'>) => {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        addOfflineAction({ type: 'feeding_log', payload: log as unknown as Record<string, unknown> });
        return log as FeedingLog;
      }

      const { data, error } = await supabase
        .from('feeding_logs')
        .insert(log)
        .select()
        .single();
      if (error) throw error;
      return data as FeedingLog;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feeding_logs', variables.dog_id] });
    },
  });
}

export function useDeleteFeedingLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dogId }: { id: string; dogId: string }) => {
      const { error } = await supabase.from('feeding_logs').delete().eq('id', id);
      if (error) throw error;
      return dogId;
    },
    onSuccess: (dogId) => {
      queryClient.invalidateQueries({ queryKey: ['feeding_logs', dogId] });
    },
  });
}
