import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomer } from './useCustomer';

export interface TransactionData {
  id: string;
  customer_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  recipient_name: string | null;
  sender_name: string | null;
  recipient_account: string | null;
  sender_account: string | null;
  reference: string;
  created_at: string;
}

export function useTransactions() {
  const { customer } = useCustomer();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', customer?.id],
    queryFn: async () => {
      if (!customer) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransactionData[];
    },
    enabled: !!customer,
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: {
      type: 'credit' | 'debit';
      amount: number;
      description: string;
      recipient_name?: string;
      sender_name?: string;
      recipient_account?: string;
      sender_account?: string;
      status?: 'pending' | 'completed';
    }) => {
      if (!customer) throw new Error('No customer found');
      
      const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          customer_id: customer.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          recipient_name: transaction.recipient_name,
          sender_name: transaction.sender_name,
          recipient_account: transaction.recipient_account,
          sender_account: transaction.sender_account,
          reference,
          status: transaction.status || 'completed',
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });

  return {
    transactions: transactions ?? [],
    isLoading,
    refetch,
    createTransaction,
  };
}
