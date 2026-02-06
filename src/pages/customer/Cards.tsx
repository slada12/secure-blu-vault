import { useState } from 'react';
import { CreditCard, Plus, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/ui/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCustomer } from '@/hooks/useCustomer';
import { useCardRequests } from '@/hooks/useCardRequests';
import { StatusBadge } from '@/components/bank/StatusBadge';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function CardsPage() {
  const { customer, profile, isLoading } = useCustomer();
  const { cardRequests, createCardRequest } = useCardRequests();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<'debit' | 'credit'>('debit');
  const [isRequesting, setIsRequesting] = useState(false);

  const hasCard = customer?.card_status === 'approved';
  const hasPendingRequest = customer?.card_status === 'pending' || 
    cardRequests.some(r => r.status === 'pending');

  const handleRequestCard = async () => {
    setIsRequesting(true);
    try {
      await createCardRequest.mutateAsync(selectedCardType);
      setShowRequestModal(false);
      toast.success('Card request submitted! We\'ll review it shortly.');
    } catch (error) {
      toast.error('Failed to submit card request. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="Cards" subtitle="Manage your cards" />
        <div className="px-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <BottomNav variant="customer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Cards"
        subtitle="Manage your cards"
      />

      <div className="px-4 space-y-6">
        {/* Current Card or Request Option */}
        {hasCard ? (
          <div className="space-y-4">
            {/* Active Card */}
            <div className="bank-card-gradient rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm text-white/70">NexusBank</p>
                  <p className="font-semibold">Debit Card</p>
                </div>
                <StatusBadge status="approved" className="bg-white/20 text-white" />
              </div>
              <p className="font-mono text-lg tracking-wider mb-4">
                •••• •••• •••• {customer?.account_number?.slice(-4) || '0000'}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-white/70">CARD HOLDER</p>
                  <p className="font-medium uppercase">{profile?.name || 'User'}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">EXPIRES</p>
                  <p className="font-medium">12/28</p>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-card rounded-xl card-shadow text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Freeze Card</span>
              </button>
              <button className="p-4 bg-card rounded-xl card-shadow text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Card Details</span>
              </button>
            </div>
          </div>
        ) : hasPendingRequest ? (
          <div className="bg-card rounded-2xl p-6 card-shadow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Card Request Pending</h3>
            <p className="text-muted-foreground mb-4">
              Your card request is being reviewed. We'll notify you once it's approved.
            </p>
            <StatusBadge status="pending" />
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-6 card-shadow text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Cards Yet</h3>
            <p className="text-muted-foreground mb-6">
              Request a debit or credit card to start spending with NexusBank.
            </p>
            <Button
              onClick={() => setShowRequestModal(true)}
              className="btn-gradient"
            >
              <Plus className="w-5 h-5 mr-2" />
              Request a Card
            </Button>
          </div>
        )}

        {/* Card Benefits */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Card Benefits</h3>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, title: 'No annual fee', desc: 'Zero fees on your NexusBank card' },
              { icon: CheckCircle, title: 'Worldwide acceptance', desc: 'Use your card anywhere Mastercard is accepted' },
              { icon: CheckCircle, title: 'Instant notifications', desc: 'Get notified for every transaction' },
              { icon: CheckCircle, title: 'Contactless payments', desc: 'Tap to pay for quick transactions' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-card rounded-xl">
                <benefit.icon className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Card Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Card</DialogTitle>
            <DialogDescription>
              Choose the type of card you'd like to request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <button
              onClick={() => setSelectedCardType('debit')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedCardType === 'debit' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Debit Card</p>
                  <p className="text-sm text-muted-foreground">Spend directly from your balance</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedCardType('credit')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedCardType === 'credit' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Credit Card</p>
                  <p className="text-sm text-muted-foreground">Build credit with monthly payments</p>
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={handleRequestCard}
            disabled={isRequesting}
            className="w-full btn-gradient"
          >
            {isRequesting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogContent>
      </Dialog>

      <BottomNav variant="customer" />
    </div>
  );
}
