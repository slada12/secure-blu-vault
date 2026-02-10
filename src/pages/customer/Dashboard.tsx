import { useState } from 'react';
import { Send, ArrowDownToLine, CreditCard, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BankCard } from '@/components/bank/BankCard';
import { TransactionItem } from '@/components/bank/TransactionItem';
import { QuickAction } from '@/components/bank/QuickAction';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/ui/BottomNav';
import { useCustomer } from '@/hooks/useCustomer';
import { useTransactions } from '@/hooks/useTransactions';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Routing number is now per-account from the database

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { customer, profile, isLoading: customerLoading } = useCustomer();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { unreadCount } = useNotifications();
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const accountNumber = customer?.account_number || '0000000000';
  const routingNumber = (customer as any)?.routing_number || '000000000';

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    toast.success('Account number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const quickActions = [
    { icon: Send, label: 'Send', onClick: () => navigate('/send-money'), variant: 'primary' as const },
    { icon: ArrowDownToLine, label: 'Receive', onClick: () => setShowReceiveDialog(true) },
    { icon: CreditCard, label: 'Cards', onClick: () => navigate('/cards') },
  ];

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bank-card-gradient px-4 pt-safe-top pb-8">
          <div className="h-20" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="px-4 -mt-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <BottomNav variant="customer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section with Card */}
      <div className="bank-card-gradient px-4 pt-safe-top pb-8">
        <PageHeader 
          title={`Hello, ${profile?.name?.split(' ')[0] || 'User'}`}
          subtitle="Welcome back"
          showNotification
          notificationCount={unreadCount}
          variant="dark"
        />
        
        {/* Bank Card */}
        <div className="mt-4">
          <BankCard
            name={profile?.name || 'User'}
            accountNumber={customer?.account_number || '0000000000'}
            balance={Number(customer?.balance) || 0}
            showBalance={showBalance}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <QuickAction
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                variant={action.variant}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Balance Toggle */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between p-4 bg-card rounded-xl card-shadow">
          <div>
            <p className="text-sm text-muted-foreground">Balance Visibility</p>
            <p className="text-sm font-medium text-foreground">
              {showBalance ? 'Balance is visible' : 'Balance is hidden'}
            </p>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5 text-primary" />
            ) : (
              <Eye className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Account Number & Routing Number */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between p-4 bg-card rounded-xl card-shadow">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Account Number</p>
            <p className="font-mono text-lg font-semibold text-foreground tracking-wider">
              {showAccountNumber ? accountNumber : '•••• •••• ••'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Routing Number</p>
            <p className="font-mono text-sm font-medium text-foreground">
              {showAccountNumber ? routingNumber : '•••••••••'}
            </p>
          </div>
          <button
            onClick={() => setShowAccountNumber(!showAccountNumber)}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
          >
            {showAccountNumber ? (
              <EyeOff className="w-5 h-5 text-primary" />
            ) : (
              <Eye className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground font-display">Recent Transactions</h2>
          <button 
            onClick={() => navigate('/transactions')}
            className="text-sm text-primary font-medium"
          >
            See All
          </button>
        </div>
        
        <div className="space-y-3">
          {transactionsLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </>
          ) : transactions.slice(0, 5).map((transaction, index) => (
            <div 
              key={transaction.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TransactionItem 
                transaction={{
                  id: transaction.id,
                  customerId: transaction.customer_id,
                  type: transaction.type,
                  amount: Number(transaction.amount),
                  description: transaction.description,
                  recipientName: transaction.recipient_name || undefined,
                  senderName: transaction.sender_name || undefined,
                  reference: transaction.reference,
                  createdAt: new Date(transaction.created_at),
                }}
                onClick={() => navigate(`/transaction/${transaction.id}`)}
              />
            </div>
          ))}
          
          {!transactionsLoading && transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Receive Money Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Receive Money</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Share your account details below to receive money.
            </p>
            <div className="space-y-3 p-4 bg-muted rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                <p className="font-mono text-xl font-bold text-foreground tracking-wider">
                  {accountNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Routing Number</p>
                <p className="font-mono text-lg font-semibold text-foreground tracking-wider">
                  {routingNumber}
                </p>
              </div>
              <button
                onClick={copyAccountNumber}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                {copied ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Account Number</>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {profile?.name || 'Account Holder'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav variant="customer" />
    </div>
  );
}
