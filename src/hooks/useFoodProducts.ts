import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { FoodProduct } from '../types';
import { useAuth } from '../lib/auth';

export function useFoodProducts(searchQuery?: string) {
  return useQuery({
    queryKey: ['food_products', searchQuery],
    queryFn: async () => {
      let query = supabase.from('food_products').select('*');

      if (searchQuery && searchQuery.trim()) {
        query = query.or(
          `brand.ilike.%${searchQuery}%,product_name.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order('brand').limit(50);
      if (error) throw error;
      return data as FoodProduct[];
    },
  });
}

export function useCreateFoodProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (product: Pick<FoodProduct, 'brand' | 'product_name' | 'calories_per_cup' | 'food_type'>) => {
      const { data, error } = await supabase
        .from('food_products')
        .insert({
          ...product,
          submitted_by: user!.id,
          is_curated: false,
          approved: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as FoodProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food_products'] });
    },
  });
}
