import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { WeighIn } from '../types';
import { useOfflineStore } from '../store/offlineStore';
import NetInfo from '@react-native-community/netinfo';

export function useWeighIns(dogId: string) {
  return useQuery({
    queryKey: ['weigh_ins', dogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weigh_ins')
        .select('*')
        .eq('dog_id', dogId)
        .order('weighed_on', { ascending: true });
      if (error) throw error;
      return data as WeighIn[];
    },
    enabled: !!dogId,
  });
}

export function useLatestWeighIn(dogId: string) {
  return useQuery({
    queryKey: ['weigh_ins', dogId, 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weigh_ins')
        .select('*')
        .eq('dog_id', dogId)
        .order('weighed_on', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as WeighIn | null;
    },
    enabled: !!dogId,
  });
}

export function useCreateWeighIn() {
  const queryClient = useQueryClient();
  const addOfflineAction = useOfflineStore((s) => s.addAction);

  return useMutation({
    mutationFn: async (weighIn: Omit<WeighIn, 'id' | 'created_at'>) => {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        addOfflineAction({ type: 'weigh_in', payload: weighIn as unknown as Record<string, unknown> });
        return weighIn as WeighIn;
      }

      const { data, error } = await supabase
        .from('weigh_ins')
        .insert(weighIn)
        .select()
        .single();
      if (error) throw error;
      return data as WeighIn;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weigh_ins', variables.dog_id] });
    },
  });
}
