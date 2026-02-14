import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Dog } from '../types';
import { useAuth } from '../lib/auth';

export function useDogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dogs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Dog[];
    },
    enabled: !!user,
  });
}

export function useDog(dogId: string) {
  return useQuery({
    queryKey: ['dogs', dogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', dogId)
        .single();
      if (error) throw error;
      return data as Dog;
    },
    enabled: !!dogId,
  });
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (dog: Omit<Dog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('dogs')
        .insert({ ...dog, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Dog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    },
  });
}

export function useUpdateDog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Dog> & { id: string }) => {
      const { data, error } = await supabase
        .from('dogs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Dog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['dogs', data.id] });
    },
  });
}

export function useDeleteDog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dogId: string) => {
      const { error } = await supabase.from('dogs').delete().eq('id', dogId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    },
  });
}
