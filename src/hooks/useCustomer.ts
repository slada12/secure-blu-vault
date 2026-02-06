import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerData {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  status: 'active' | 'blocked' | 'frozen';
  card_status: 'none' | 'pending' | 'approved' | 'rejected';
  can_send_money: boolean;
  can_login: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useCustomer() {
  const { user } = useAuth();

  const { data: customer, isLoading: customerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ['customer', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as CustomerData | null;
    },
    enabled: !!user,
  });

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ProfileData | null;
    },
    enabled: !!user,
  });

  return {
    customer,
    profile,
    isLoading: customerLoading || profileLoading,
    refetchCustomer,
    refetchProfile,
  };
}
