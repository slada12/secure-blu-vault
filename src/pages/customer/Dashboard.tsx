import { Send, ArrowDownToLine, CreditCard, Smartphone, Receipt, QrCode } from 'lucide-react';
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

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { customer, profile, isLoading: customerLoading } = useCustomer();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { unreadCount } = useNotifications();

  const quickActions = [
    { icon: Send, label: 'Send', onClick: () => navigate('/send-money'), variant: 'primary' as const },
    { icon: ArrowDownToLine, label: 'Receive', onClick: () => navigate('/receive-money') },
    { icon: CreditCard, label: 'Cards', onClick: () => navigate('/cards') },
    { icon: Smartphone, label: 'Top Up', onClick: () => navigate('/top-up') },
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

      {/* More Actions */}
      <div className="px-4 mt-6">
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/pay-bill')}
            className="flex-1 flex items-center gap-3 p-4 bg-card rounded-xl card-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">Pay Bills</span>
          </button>
          <button 
            onClick={() => navigate('/scan-qr')}
            className="flex-1 flex items-center gap-3 p-4 bg-card rounded-xl card-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">Scan QR</span>
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

      <BottomNav variant="customer" />
    </div>
  );
}
