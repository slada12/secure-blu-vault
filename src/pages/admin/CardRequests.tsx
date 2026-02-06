import { useState } from 'react';
import { CreditCard, Check, X, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBadge } from '@/components/bank/StatusBadge';
import { useAdminData, AdminCardRequest } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
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

export default function CardRequests() {
  const { cardRequests, cardRequestsLoading, processCardRequest } = useAdminData();
  const [selectedRequest, setSelectedRequest] = useState<AdminCardRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingRequests = cardRequests.filter(r => r.status === 'pending');
  const processedRequests = cardRequests.filter(r => r.status !== 'pending');

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    setIsProcessing(true);
    try {
      await processCardRequest.mutateAsync({
        requestId: selectedRequest.id,
        customerId: selectedRequest.customer_id,
        status: actionType === 'approve' ? 'approved' : 'rejected',
        action: actionType === 'approve' ? 'APPROVE_CARD' : 'REJECT_CARD',
        details: `${selectedRequest.card_type} card request ${actionType === 'approve' ? 'approved' : 'rejected'}`,
      });
      
      toast.success(
        actionType === 'approve' 
          ? `Card request approved for ${selectedRequest.customer?.profile?.name || 'customer'}`
          : `Card request rejected for ${selectedRequest.customer?.profile?.name || 'customer'}`
      );
    } catch (error) {
      toast.error('Failed to process card request');
    } finally {
      setIsProcessing(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (cardRequestsLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="Card Requests" subtitle="Loading..." />
        <div className="px-4 space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <BottomNav variant="admin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Card Requests"
        subtitle={`${pendingRequests.length} pending requests`}
      />

      {/* Pending Requests */}
      <div className="px-4">
        {pendingRequests.length > 0 ? (
          <>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Pending Approval</h3>
            <div className="space-y-3 mb-8">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card rounded-2xl p-4 card-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.customer?.profile?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {request.card_type} Card Request
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="pending" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Requested {formatDate(request.requested_at)}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType('approve');
                      }}
                      className="flex-1 btn-gradient"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType('reject');
                      }}
                      className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="font-medium text-foreground">All caught up!</p>
            <p className="text-muted-foreground text-sm">No pending card requests</p>
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">History</h3>
            <div className="space-y-3">
              {processedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-card rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.status === 'approved' ? 'bg-success/10' : 'bg-destructive/10'
                    }`}>
                      {request.status === 'approved' ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : (
                        <X className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{request.customer?.profile?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {request.card_type} Card
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={request.status as 'approved' | 'rejected'} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Card Request' : 'Reject Card Request'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? `Are you sure you want to approve the ${selectedRequest?.card_type} card request for ${selectedRequest?.customer?.profile?.name || 'this customer'}?`
                : `Are you sure you want to reject the ${selectedRequest?.card_type} card request for ${selectedRequest?.customer?.profile?.name || 'this customer'}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : 'btn-gradient'}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                actionType === 'approve' ? 'Approve' : 'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav variant="admin" />
    </div>
  );
}
