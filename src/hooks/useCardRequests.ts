import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomer } from './useCustomer';

export interface CardRequestData {
  id: string;
  customer_id: string;
  card_type: 'debit' | 'credit';
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
}

export function useCardRequests() {
  const { customer } = useCustomer();
  const queryClient = useQueryClient();

  const { data: cardRequests, isLoading, refetch } = useQuery({
    queryKey: ['cardRequests', customer?.id],
    queryFn: async () => {
      if (!customer) return [];
      const { data, error } = await supabase
        .from('card_requests')
        .select('*')
        .eq('customer_id', customer.id)
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data as CardRequestData[];
    },
    enabled: !!customer,
  });

  const createCardRequest = useMutation({
    mutationFn: async (cardType: 'debit' | 'credit') => {
      if (!customer) throw new Error('No customer found');
      
      const { data, error } = await supabase
        .from('card_requests')
        .insert({
          customer_id: customer.id,
          card_type: cardType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardRequests'] });
    },
  });

  return {
    cardRequests: cardRequests ?? [],
    isLoading,
    refetch,
    createCardRequest,
  };
}
