import { useState } from 'react';
import { ArrowLeft, Mail, Phone, CreditCard, Lock, Unlock, Snowflake, Send, History, Ban, Pencil, Plus, DollarSign, User, MapPin, Globe, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/bank/StatusBadge';
import { TransactionItem } from '@/components/bank/TransactionItem';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { customers, customersLoading, updateCustomerStatus } = useAdminData();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'block' | 'freeze' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit transaction state
  const [editingTxn, setEditingTxn] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  // Add transaction state
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [newTxnType, setNewTxnType] = useState<'credit' | 'debit'>('credit');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [newTxnDescription, setNewTxnDescription] = useState('');
  const [newTxnDate, setNewTxnDate] = useState('');
  const [newTxnName, setNewTxnName] = useState('');
  const [isAddingTxn, setIsAddingTxn] = useState(false);

  // Fund account state
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundDescription, setFundDescription] = useState('');
  const [isFunding, setIsFunding] = useState(false);

  // Edit profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const customer = customers.find(c => c.id === customerId);

  // Fetch full profile with new fields
  const { data: fullProfile } = useQuery({
    queryKey: ['admin-customer-profile', customer?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', customer!.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!customer?.user_id,
  });

  // Fetch transactions for this customer
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin-customer-transactions', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  if (customersLoading) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="bg-secondary px-4 pt-4 pb-20"><Skeleton className="h-12 w-48" /></div>
        <div className="px-4 -mt-12"><Skeleton className="h-64 rounded-2xl" /></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'active' | 'blocked' | 'frozen') => {
    setIsUpdating(true);
    try {
      await updateCustomerStatus.mutateAsync({
        customerId: customer.id,
        updates: {
          status: newStatus,
          can_send_money: newStatus === 'active',
          can_login: newStatus !== 'blocked',
        },
        action: newStatus === 'active' ? 'UNBLOCK_CUSTOMER' : newStatus === 'blocked' ? 'BLOCK_CUSTOMER' : 'FREEZE_ACCOUNT',
        details: `Account ${newStatus === 'active' ? 'activated' : newStatus === 'blocked' ? 'blocked' : 'frozen'} by admin`,
      });
      toast.success(`Account ${newStatus}`);
    } catch {
      toast.error('Failed to update customer status');
    } finally {
      setIsUpdating(false);
      setShowBlockDialog(false);
    }
  };

  const handleToggle = async (field: 'can_send_money' | 'can_login') => {
    setIsUpdating(true);
    try {
      const newValue = !customer[field];
      await updateCustomerStatus.mutateAsync({
        customerId: customer.id,
        updates: { [field]: newValue },
        action: field === 'can_send_money' ? (newValue ? 'ENABLE_TRANSFERS' : 'DISABLE_TRANSFERS') : (newValue ? 'ENABLE_LOGIN' : 'DISABLE_LOGIN'),
        details: `${field === 'can_send_money' ? 'Transfer' : 'Login'} permission ${newValue ? 'enabled' : 'disabled'}`,
      });
      toast.success('Permission updated');
    } catch {
      toast.error('Failed to update permission');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFundAccount = async () => {
    if (!customerId || !fundAmount) return;
    setIsFunding(true);
    try {
      const amount = parseFloat(fundAmount);
      // Update balance
      const { error: balanceError } = await supabase
        .from('customers')
        .update({ balance: Number(customer.balance) + amount })
        .eq('id', customerId);
      if (balanceError) throw balanceError;

      // Create credit transaction
      const reference = `FUND-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await supabase.from('transactions').insert({
        customer_id: customerId,
        type: 'credit',
        amount,
        description: fundDescription || 'Admin Deposit',
        reference,
        status: 'completed' as any,
        sender_name: 'NexusBank Admin',
      });

      // Audit log
      await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: 'FUND_ACCOUNT',
        target_customer_id: customerId,
        details: `Funded account with $${amount}${fundDescription ? ` - ${fundDescription}` : ''}`,
      });

      // Send notification to customer
      await supabase.from('notifications').insert({
        user_id: customer.user_id,
        title: 'Deposit Received',
        message: `Your account has been credited with $${amount.toFixed(2)}.${fundDescription ? ` Description: ${fundDescription}` : ''}`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customer-transactions', customerId] });
      toast.success(`Account funded with $${amount.toFixed(2)}`);
      setShowFundDialog(false);
      setFundAmount('');
      setFundDescription('');
    } catch {
      toast.error('Failed to fund account');
    } finally {
      setIsFunding(false);
    }
  };

  const openEditProfile = () => {
    setEditName(customer.profile?.name || '');
    setEditEmail(customer.profile?.email || '');
    setEditPhone(customer.profile?.phone || '');
    setEditDOB(fullProfile?.date_of_birth || '');
    setEditAddress(fullProfile?.home_address || '');
    setEditNationality(fullProfile?.nationality || '');
    setEditCurrency((customer as any).currency || 'USD');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    setIsSavingProfile(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: editName,
          email: editEmail,
          phone: editPhone || null,
          date_of_birth: editDOB || null,
          home_address: editAddress || null,
          nationality: editNationality || null,
        })
        .eq('user_id', customer.user_id);
      if (profileError) throw profileError;

      // Update currency
      const { error: currencyError } = await supabase
        .from('customers')
        .update({ currency: editCurrency })
        .eq('id', customer.id);
      if (currencyError) throw currencyError;

      // Audit
      await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: 'EDIT_CUSTOMER_PROFILE',
        target_customer_id: customerId,
        details: `Updated profile: name=${editName}, email=${editEmail}, currency=${editCurrency}`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customer-profile'] });
      toast.success('Customer profile updated');
      setShowEditProfile(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const currency = (customer as any).currency || 'USD';
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(customer.balance));

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-secondary px-4 pt-4 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full text-secondary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-secondary-foreground">
            <h1 className="text-lg font-semibold font-display">Customer Details</h1>
            <p className="text-sm text-secondary-foreground/70">Manage account</p>
          </div>
        </div>
      </div>

      {/* Customer Card */}
      <div className="px-4 -mt-12">
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bank-card-gradient flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {customer.profile?.name?.split(' ').map(n => n[0]).join('') || '?'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{customer.profile?.name || 'Unknown'}</h2>
                <StatusBadge status={customer.status} />
              </div>
              <p className="text-muted-foreground text-sm">{customer.account_number}</p>
              <p className="text-xs text-muted-foreground">Currency: {currency}</p>
            </div>
            <button onClick={openEditProfile} className="p-2 hover:bg-muted rounded-full" title="Edit customer">
              <Pencil className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Balance */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Balance</p>
                <p className="text-3xl font-bold balance-text">{formattedBalance}</p>
              </div>
              <Button size="sm" onClick={() => { setShowFundDialog(true); setFundAmount(''); setFundDescription(''); }}>
                <DollarSign className="w-4 h-4 mr-1" /> Fund
              </Button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{customer.profile?.email || 'N/A'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{customer.profile?.phone || 'Not set'}</p></div>
            </div>
            {fullProfile?.date_of_birth && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div><p className="text-sm text-muted-foreground">Date of Birth</p><p className="font-medium">{fullProfile.date_of_birth}</p></div>
              </div>
            )}
            {fullProfile?.home_address && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div><p className="text-sm text-muted-foreground">Address</p><p className="font-medium">{fullProfile.home_address}</p></div>
              </div>
            )}
            {fullProfile?.nationality && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div><p className="text-sm text-muted-foreground">Nationality</p><p className="font-medium">{fullProfile.nationality}</p></div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div><p className="text-sm text-muted-foreground">Card Status</p><StatusBadge status={customer.card_status as any} /></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <History className="w-5 h-5 text-muted-foreground" />
              </div>
              <div><p className="text-sm text-muted-foreground">Routing Number</p><p className="font-medium font-mono">{(customer as any).routing_number || 'N/A'}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 font-display">Permissions</h3>
        <div className="bg-card rounded-2xl card-shadow divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Send className="w-5 h-5 text-muted-foreground" /></div>
              <div><p className="font-medium">Can Send Money</p><p className="text-sm text-muted-foreground">Allow outgoing transfers</p></div>
            </div>
            <Switch checked={customer.can_send_money} onCheckedChange={() => handleToggle('can_send_money')} disabled={isUpdating} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Lock className="w-5 h-5 text-muted-foreground" /></div>
              <div><p className="font-medium">Can Login</p><p className="text-sm text-muted-foreground">Allow account access</p></div>
            </div>
            <Switch checked={customer.can_login} onCheckedChange={() => handleToggle('can_login')} disabled={isUpdating} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 font-display">Account Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {customer.status === 'active' ? (
            <>
              <Button variant="outline" onClick={() => { setPendingAction('freeze'); setShowBlockDialog(true); }} disabled={isUpdating} className="h-auto py-4 flex flex-col gap-2">
                <Snowflake className="w-5 h-5 text-blue-500" /><span>Freeze Account</span>
              </Button>
              <Button variant="outline" onClick={() => { setPendingAction('block'); setShowBlockDialog(true); }} disabled={isUpdating} className="h-auto py-4 flex flex-col gap-2 border-destructive/20 text-destructive hover:bg-destructive/10">
                <Ban className="w-5 h-5" /><span>Block Customer</span>
              </Button>
            </>
          ) : (
            <Button onClick={() => handleStatusChange('active')} disabled={isUpdating} className="col-span-2 h-auto py-4 flex flex-col gap-2 btn-gradient">
              <Unlock className="w-5 h-5" /><span>Unblock Account</span>
            </Button>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold font-display">Transaction History</h3>
          </div>
          <Button size="sm" onClick={() => { setShowAddTxn(true); setNewTxnType('credit'); setNewTxnAmount(''); setNewTxnDescription(''); setNewTxnName(''); setNewTxnDate(new Date().toISOString().slice(0, 16)); }} className="gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {transactionsLoading ? (
            <><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <TransactionItem transaction={{
                    id: transaction.id, customerId: transaction.customer_id,
                    type: transaction.type as 'credit' | 'debit', amount: Number(transaction.amount),
                    description: transaction.description, recipientName: transaction.recipient_name || undefined,
                    senderName: transaction.sender_name || undefined, reference: transaction.reference,
                    createdAt: new Date(transaction.created_at),
                  }} />
                </div>
                <button onClick={() => { setEditingTxn(transaction); setEditAmount(String(transaction.amount)); setEditDate(new Date(transaction.created_at).toISOString().slice(0, 16)); }}
                  className="p-2 hover:bg-muted rounded-full shrink-0" title="Edit transaction">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground"><p>No transactions yet</p></div>
          )}
        </div>
      </div>

      {/* Block/Freeze Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction === 'block' ? 'Block Customer' : 'Freeze Account'}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'block' ? 'This will prevent the customer from logging in and making any transactions.' : 'This will temporarily restrict the account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange(pendingAction === 'block' ? 'blocked' : 'frozen')} disabled={isUpdating}
              className={pendingAction === 'block' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              {isUpdating ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : pendingAction === 'block' ? 'Block' : 'Freeze'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTxn} onOpenChange={() => setEditingTxn(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-sm font-medium mb-1 block">Amount</label>
              <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Date & Time</label>
              <Input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTxn(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (!editingTxn) return;
              try {
                await supabase.from('transactions').update({ amount: parseFloat(editAmount), created_at: new Date(editDate).toISOString() }).eq('id', editingTxn.id);
                await supabase.from('audit_logs').insert({ admin_id: user?.id, action: 'EDIT_TRANSACTION', target_customer_id: customerId, details: `Updated transaction ${editingTxn.reference}` });
                queryClient.invalidateQueries({ queryKey: ['admin-customer-transactions', customerId] });
                toast.success('Transaction updated');
                setEditingTxn(null);
              } catch { toast.error('Failed to update transaction'); }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTxn} onOpenChange={setShowAddTxn}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Transaction History</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-sm font-medium mb-1 block">Type</label>
              <div className="flex gap-2">
                <Button type="button" variant={newTxnType === 'credit' ? 'default' : 'outline'} onClick={() => setNewTxnType('credit')} className="flex-1">Credit</Button>
                <Button type="button" variant={newTxnType === 'debit' ? 'default' : 'outline'} onClick={() => setNewTxnType('debit')} className="flex-1">Debit</Button>
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Amount</label>
              <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={newTxnAmount} onChange={(e) => setNewTxnAmount(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Description</label>
              <Input placeholder="e.g. Wire transfer, Deposit..." value={newTxnDescription} onChange={(e) => setNewTxnDescription(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">{newTxnType === 'credit' ? 'Sender Name' : 'Recipient Name'}</label>
              <Input placeholder="Full name" value={newTxnName} onChange={(e) => setNewTxnName(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Date & Time</label>
              <Input type="datetime-local" value={newTxnDate} onChange={(e) => setNewTxnDate(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTxn(false)}>Cancel</Button>
            <Button disabled={isAddingTxn || !newTxnAmount || !newTxnDescription} onClick={async () => {
              if (!customerId) return;
              setIsAddingTxn(true);
              try {
                const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                await supabase.from('transactions').insert({
                  customer_id: customerId, type: newTxnType, amount: parseFloat(newTxnAmount),
                  description: newTxnDescription, reference, status: 'completed' as any,
                  created_at: new Date(newTxnDate).toISOString(),
                  ...(newTxnType === 'credit' ? { sender_name: newTxnName || null } : { recipient_name: newTxnName || null }),
                });
                await supabase.from('audit_logs').insert({ admin_id: user?.id, action: 'ADD_TRANSACTION', target_customer_id: customerId, details: `Added ${newTxnType}: $${newTxnAmount} - ${newTxnDescription}` });
                queryClient.invalidateQueries({ queryKey: ['admin-customer-transactions', customerId] });
                toast.success('Transaction added');
                setShowAddTxn(false);
              } catch { toast.error('Failed to add transaction'); } finally { setIsAddingTxn(false); }
            }}>
              {isAddingTxn ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fund Account Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Fund Account</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-sm font-medium mb-1 block">Amount ({currency})</label>
              <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Description (optional)</label>
              <Input placeholder="e.g. Initial deposit, Bonus..." value={fundDescription} onChange={(e) => setFundDescription(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundDialog(false)}>Cancel</Button>
            <Button disabled={isFunding || !fundAmount} onClick={handleFundAccount}>
              {isFunding ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Fund Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Customer Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Phone</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Date of Birth</label>
              <Input type="date" value={editDOB} onChange={(e) => setEditDOB(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Home Address</label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Nationality</label>
              <Input value={editNationality} onChange={(e) => setEditNationality(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Currency</label>
              <Select value={editCurrency} onValueChange={setEditCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>Cancel</Button>
            <Button disabled={isSavingProfile || !editName || !editEmail} onClick={handleSaveProfile}>
              {isSavingProfile ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
