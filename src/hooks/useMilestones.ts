import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Milestone } from '../types';

export function useMilestones(dogId: string) {
  return useQuery({
    queryKey: ['milestones', dogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('dog_id', dogId)
        .order('achieved_at', { ascending: false });
      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!dogId,
  });
}
