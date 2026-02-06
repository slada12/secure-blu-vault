import { useState } from 'react';
import { ArrowLeft, User, AtSign, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomer } from '@/hooks/useCustomer';
import { useTransactions } from '@/hooks/useTransactions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecipientData {
  id: string;
  name: string;
  accountNumber: string;
}

export default function SendMoney() {
  const navigate = useNavigate();
  const { customer, profile, refetchCustomer } = useCustomer();
  const { createTransaction } = useTransactions();
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm' | 'success'>('recipient');
  const [recipient, setRecipient] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientData | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<RecipientData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check if customer can send money
  const canSendMoney = customer?.can_send_money && customer?.status === 'active';

  const handleSearch = async (query: string) => {
    setRecipient(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search by account number or name
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, user_id, account_number')
        .or(`account_number.ilike.%${query}%`)
        .neq('user_id', customer?.user_id)
        .limit(5);

      if (customersError) throw customersError;

      // Get profiles for these customers
      if (customers && customers.length > 0) {
        const userIds = customers.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        const results = customers.map(c => {
          const p = profiles?.find(p => p.user_id === c.user_id);
          return {
            id: c.id,
            name: p?.name || 'Unknown',
            accountNumber: c.account_number,
          };
        }).filter(r => 
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.accountNumber.includes(query)
        );

        setSearchResults(results);
      } else {
        // Search by name in profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .ilike('name', `%${query}%`)
          .neq('user_id', customer?.user_id)
          .limit(5);

        if (profiles && profiles.length > 0) {
          const userIds = profiles.map(p => p.user_id);
          const { data: customersData } = await supabase
            .from('customers')
            .select('id, user_id, account_number')
            .in('user_id', userIds);

          const results = profiles.map(p => {
            const c = customersData?.find(c => c.user_id === p.user_id);
            return c ? {
              id: c.id,
              name: p.name,
              accountNumber: c.account_number,
            } : null;
          }).filter(Boolean) as RecipientData[];

          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecipientSelect = (recipientData: RecipientData) => {
    setSelectedRecipient(recipientData);
    setStep('amount');
  };

  const handleAmountConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > Number(customer?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }
    setStep('confirm');
  };

  const handleSend = async () => {
    if (!customer || !selectedRecipient || !canSendMoney) return;
    
    setIsLoading(true);
    try {
      const transferAmount = parseFloat(amount);

      // Deduct from sender's balance
      const { error: deductError } = await supabase
        .from('customers')
        .update({ balance: Number(customer.balance) - transferAmount })
        .eq('id', customer.id);

      if (deductError) throw deductError;

      // Add to recipient's balance
      const { error: addError } = await supabase
        .from('customers')
        .update({ 
          balance: supabase.rpc ? undefined : transferAmount // Will need edge function for atomic update
        })
        .eq('id', selectedRecipient.id);

      // For now, just update the recipient balance directly
      const { data: recipientData } = await supabase
        .from('customers')
        .select('balance')
        .eq('id', selectedRecipient.id)
        .single();
      
      if (recipientData) {
        await supabase
          .from('customers')
          .update({ balance: Number(recipientData.balance) + transferAmount })
          .eq('id', selectedRecipient.id);
      }

      // Create debit transaction for sender
      await createTransaction.mutateAsync({
        type: 'debit',
        amount: transferAmount,
        description: note || `Transfer to ${selectedRecipient.name}`,
        recipient_name: selectedRecipient.name,
        recipient_account: selectedRecipient.accountNumber,
      });

      // Refresh customer data
      await refetchCustomer();

      setStep('success');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedAmount = amount ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(amount)) : '$0.00';

  if (!canSendMoney) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <Send className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2 font-display">Transfers Disabled</h2>
        <p className="text-muted-foreground mb-8">
          {customer?.status === 'frozen' 
            ? 'Your account is frozen. Please contact support.'
            : customer?.status === 'blocked'
            ? 'Your account is blocked. Please contact support.'
            : 'Money transfers have been disabled on your account.'}
        </p>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="w-full max-w-xs"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <button 
          onClick={() => {
            if (step === 'recipient') navigate(-1);
            else if (step === 'amount') setStep('recipient');
            else if (step === 'confirm') setStep('amount');
            else navigate('/dashboard');
          }}
          className="p-2 -ml-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold font-display">
          {step === 'success' ? 'Transfer Complete' : 'Send Money'}
        </h1>
      </div>

      {/* Recipient Step */}
      {step === 'recipient' && (
        <div className="p-4 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={recipient}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Account number or name"
              className="input-bank pl-12"
            />
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-4 text-muted-foreground">
              Searching...
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Results</h3>
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleRecipientSelect(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{result.name}</p>
                      <p className="text-sm text-muted-foreground">•••• {result.accountNumber.slice(-4)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recipient.length >= 3 && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recipients found</p>
              <p className="text-sm mt-1">Try searching by name or account number</p>
            </div>
          )}

          {recipient.length < 3 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Enter at least 3 characters to search</p>
            </div>
          )}
        </div>
      )}

      {/* Amount Step */}
      {step === 'amount' && selectedRecipient && (
        <div className="p-4 space-y-6">
          {/* Recipient Info */}
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {selectedRecipient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedRecipient.name}</p>
              <p className="text-sm text-muted-foreground">
                •••• {selectedRecipient.accountNumber.slice(-4)}
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="text-center py-8">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-5xl font-bold text-center bg-transparent outline-none w-full balance-text"
              autoFocus
            />
            <p className="text-muted-foreground mt-2">
              Available: ${Number(customer?.balance || 0).toLocaleString()}
            </p>
          </div>

          {/* Quick Amounts */}
          <div className="flex gap-3 justify-center">
            {['50', '100', '250', '500'].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className="px-4 py-2 bg-muted rounded-full text-sm font-medium hover:bg-muted/80"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          {/* Note */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="input-bank"
            />
          </div>

          <Button
            onClick={handleAmountConfirm}
            className="w-full h-12 btn-gradient text-base font-semibold"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Confirm Step */}
      {step === 'confirm' && selectedRecipient && (
        <div className="p-4 space-y-6">
          <div className="bg-card rounded-2xl p-6 card-shadow space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">You're sending</p>
              <p className="text-4xl font-bold balance-text">{formattedAmount}</p>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">{selectedRecipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium">•••• {selectedRecipient.accountNumber.slice(-4)}</span>
              </div>
              {note && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Note</span>
                  <span className="font-medium">{note}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium text-success">Free</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="w-full h-12 btn-gradient text-base font-semibold"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Confirm & Send
                <Send className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && selectedRecipient && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2 font-display">Transfer Successful!</h2>
          <p className="text-muted-foreground mb-2">
            You sent {formattedAmount} to {selectedRecipient.name}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Reference: TRF-{Date.now().toString().slice(-8)}
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 btn-gradient text-base font-semibold"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
