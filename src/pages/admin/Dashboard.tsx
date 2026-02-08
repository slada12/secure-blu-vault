import { Users, CreditCard, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBadge } from '@/components/bank/StatusBadge';
import { useAdminData } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { customers, cardRequests, customersLoading, cardRequestsLoading } = useAdminData();
  
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const blockedCustomers = customers.filter(c => c.status === 'blocked').length;
  const pendingRequests = cardRequests.filter(r => r.status === 'pending').length;
  const totalBalance = customers.reduce((sum, c) => sum + Number(c.balance), 0);

  const stats = [
    { icon: Users, label: 'Active Customers', value: activeCustomers, color: 'text-success' },
    { icon: AlertTriangle, label: 'Blocked', value: blockedCustomers, color: 'text-destructive' },
    { icon: CreditCard, label: 'Pending Cards', value: pendingRequests, color: 'text-warning' },
    { icon: TrendingUp, label: 'Total Assets', value: `$${(totalBalance / 1000).toFixed(1)}K`, color: 'text-primary' },
  ];

  const isLoading = customersLoading || cardRequestsLoading;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-secondary px-4 pt-4 pb-8">
        <PageHeader 
          title="Admin Dashboard"
          subtitle="NexusBank Management"
          variant="dark"
          showNotification
          notificationCount={pendingRequests}
        />
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-4 card-shadow">
                <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-3 font-display">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/admin/customers')}
            className="flex items-center gap-3 p-4 bg-card rounded-xl card-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">Manage Customers</span>
          </button>
          <button
            onClick={() => navigate('/admin/requests')}
            className="flex items-center gap-3 p-4 bg-card rounded-xl card-shadow relative"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">Card Requests</span>
            {pendingRequests > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-warning text-warning-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/admin/transfers')}
            className="flex items-center gap-3 p-4 bg-card rounded-xl card-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">Pending Transfers</span>
          </button>
        </div>
      </div>

      {/* Customers Overview */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-display">Customers</h2>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="text-sm text-primary font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : customers.slice(0, 4).map((customer) => (
            <button
              key={customer.id}
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
              className="w-full flex items-center justify-between p-4 bg-card rounded-xl card-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {customer.profile?.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium">{customer.profile?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    •••• {customer.account_number.slice(-4)}
                  </p>
                </div>
              </div>
              <StatusBadge status={customer.status} />
            </button>
          ))}
          
          {!isLoading && customers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No customers yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-display">Recent Activity</h2>
          <button 
            onClick={() => navigate('/admin/activity')}
            className="text-sm text-primary font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {pendingRequests > 0 ? (
            cardRequests.filter(r => r.status === 'pending').slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">{request.customer?.profile?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {request.card_type} card request
                    </p>
                  </div>
                </div>
                <StatusBadge status="pending" />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending activity</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav variant="admin" />
    </div>
  );
}
