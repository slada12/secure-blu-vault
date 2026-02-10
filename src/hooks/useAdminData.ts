import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminCustomerData {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  status: 'active' | 'blocked' | 'frozen';
  card_status: 'none' | 'pending' | 'approved' | 'rejected';
  can_send_money: boolean;
  can_login: boolean;
  created_at: string;
  currency: string;
  routing_number: string | null;
  profile?: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface AdminCardRequest {
  id: string;
  customer_id: string;
  card_type: 'debit' | 'credit';
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  customer?: {
    account_number: string;
    profile?: {
      name: string;
      email: string;
    };
  };
}

export interface AuditLogData {
  id: string;
  admin_id: string | null;
  action: string;
  target_customer_id: string | null;
  details: string | null;
  created_at: string;
}

export function useAdminData() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all customers with profiles
  const { data: customers, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customersError) throw customersError;

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Combine customers with profiles
      const customersWithProfiles = customersData.map(customer => {
        const profile = profilesData.find(p => p.user_id === customer.user_id);
        return {
          ...customer,
          profile: profile ? {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          } : undefined,
        };
      });

      return customersWithProfiles as AdminCustomerData[];
    },
    enabled: isAdmin,
  });

  // Fetch all card requests with customer info
  const { data: cardRequests, isLoading: cardRequestsLoading, refetch: refetchCardRequests } = useQuery({
    queryKey: ['admin-card-requests'],
    queryFn: async () => {
      const { data: requestsData, error: requestsError } = await supabase
        .from('card_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (requestsError) throw requestsError;

      // Fetch customers and profiles
      const { data: customersData } = await supabase.from('customers').select('*');
      const { data: profilesData } = await supabase.from('profiles').select('*');

      const requestsWithCustomer = requestsData.map(request => {
        const customer = customersData?.find(c => c.id === request.customer_id);
        const profile = customer ? profilesData?.find(p => p.user_id === customer.user_id) : undefined;
        return {
          ...request,
          customer: customer ? {
            account_number: customer.account_number,
            profile: profile ? {
              name: profile.name,
              email: profile.email,
            } : undefined,
          } : undefined,
        };
      });

      return requestsWithCustomer as AdminCardRequest[];
    },
    enabled: isAdmin,
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading: auditLogsLoading, refetch: refetchAuditLogs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AuditLogData[];
    },
    enabled: isAdmin,
  });

  // Update customer status
  const updateCustomerStatus = useMutation({
    mutationFn: async ({ customerId, updates, action, details }: {
      customerId: string;
      updates: Partial<AdminCustomerData>;
      action: string;
      details: string;
    }) => {
      const { error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId);
      
      if (updateError) throw updateError;

      // Log the action
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          admin_id: user?.id,
          action,
          target_customer_id: customerId,
          details,
        });
      
      if (logError) console.error('Failed to log action:', logError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    },
  });

  // Process card request
  const processCardRequest = useMutation({
    mutationFn: async ({ requestId, customerId, status, action, details }: {
      requestId: string;
      customerId: string;
      status: 'approved' | 'rejected';
      action: string;
      details: string;
    }) => {
      const { error: requestError } = await supabase
        .from('card_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq('id', requestId);
      
      if (requestError) throw requestError;

      // Update customer card status if approved
      if (status === 'approved') {
        const { error: customerError } = await supabase
          .from('customers')
          .update({ card_status: 'approved' })
          .eq('id', customerId);
        
        if (customerError) throw customerError;
      }

      // Log the action
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          admin_id: user?.id,
          action,
          target_customer_id: customerId,
          details,
        });
      
      if (logError) console.error('Failed to log action:', logError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-card-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    },
  });

  return {
    customers: customers ?? [],
    cardRequests: cardRequests ?? [],
    auditLogs: auditLogs ?? [],
    customersLoading,
    cardRequestsLoading,
    auditLogsLoading,
    refetchCustomers,
    refetchCardRequests,
    refetchAuditLogs,
    updateCustomerStatus,
    processCardRequest,
  };
}
