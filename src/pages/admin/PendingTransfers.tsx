import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/ui/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PendingTransfer {
  id: string;
  customer_id: string;
  amount: number;
  description: string;
  recipient_name: string | null;
  recipient_account: string | null;
  reference: string;
  created_at: string;
  status: string;
  customerName?: string;
  customerAccount?: string;
}

export default function PendingTransfers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionDialog, setActionDialog] = useState<{ id: string; action: 'approve' | 'reject'; transfer: PendingTransfer } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['admin-pending-transfers'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('transactions')
        .select('*') as any)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const txns = (data || []) as any[];
      const customerIds = [...new Set(txns.map((t: any) => t.customer_id))] as string[];
      const { data: customers } = await supabase
        .from('customers')
        .select('id, user_id, account_number')
        .in('id', customerIds);

      const userIds = customers?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      return txns.map((t: any) => {
        const cust = customers?.find(c => c.id === t.customer_id);
        const prof = profiles?.find(p => p.user_id === cust?.user_id);
        return {
          ...t,
          customerName: prof?.name || 'Unknown',
          customerAccount: cust?.account_number || '',
        } as PendingTransfer;
      });
    },
  });

  const processTransfer = useMutation({
    mutationFn: async ({ transferId, action, transfer }: { transferId: string; action: 'approve' | 'reject'; transfer: PendingTransfer }) => {
      const newStatus = action === 'approve' ? 'completed' : 'rejected';

      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus } as any)
        .eq('id', transferId);

      if (error) throw error;

      // If rejected, refund the sender
      if (action === 'reject') {
        const { data: sender } = await supabase
          .from('customers')
          .select('balance')
          .eq('id', transfer.customer_id)
          .single();

        if (sender) {
          await supabase
            .from('customers')
            .update({ balance: Number(sender.balance) + Number(transfer.amount) })
            .eq('id', transfer.customer_id);
        }
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: action === 'approve' ? 'APPROVE_TRANSFER' : 'REJECT_TRANSFER',
        target_customer_id: transfer.customer_id,
        details: `${action === 'approve' ? 'Approved' : 'Rejected'} transfer of $${transfer.amount} to ${transfer.recipient_name || 'Unknown'}. Ref: ${transfer.reference}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
  });

  const handleAction = async () => {
    if (!actionDialog) return;
    setIsProcessing(true);
    try {
      await processTransfer.mutateAsync({
        transferId: actionDialog.id,
        action: actionDialog.action,
        transfer: actionDialog.transfer,
      });
      toast.success(`Transfer ${actionDialog.action === 'approve' ? 'approved' : 'rejected'}`);
    } catch {
      toast.error('Failed to process transfer');
    } finally {
      setIsProcessing(false);
      setActionDialog(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold font-display">Pending Transfers</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : transfers && transfers.length > 0 ? (
          transfers.map((transfer) => (
            <div key={transfer.id} className="bg-card rounded-2xl p-4 card-shadow space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{transfer.customerName}</p>
                  <p className="text-sm text-muted-foreground">Acct: •••• {transfer.customerAccount.slice(-4)}</p>
                </div>
                <div className="flex items-center gap-1 text-warning">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Pending</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To: {transfer.recipient_name || 'N/A'}</span>
                <span className="font-bold text-lg">{formatCurrency(Number(transfer.amount))}</span>
              </div>
              <p className="text-xs text-muted-foreground">{transfer.description}</p>
              <p className="text-xs text-muted-foreground font-mono">Ref: {transfer.reference}</p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 bg-success hover:bg-success/90 text-white"
                  onClick={() => setActionDialog({ id: transfer.id, action: 'approve', transfer })}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setActionDialog({ id: transfer.id, action: 'reject', transfer })}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No pending transfers</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog?.action === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.action === 'approve'
                ? 'This will complete the transfer. Are you sure?'
                : 'This will reject the transfer and refund the sender. Are you sure?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={actionDialog?.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : actionDialog?.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav variant="admin" />
    </div>
  );
}
