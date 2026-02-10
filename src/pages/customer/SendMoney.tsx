import { useState } from 'react';
import { ArrowLeft, User, AtSign, Send, CheckCircle, Globe, Building2, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomer } from '@/hooks/useCustomer';
import { useTransactions } from '@/hooks/useTransactions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateTransferReceipt } from '@/lib/generateTransferReceipt';
import InternationalRecipientForm, { type InternationalRecipientData } from '@/components/bank/InternationalRecipientForm';

const ROUTING_NUMBER = '021000021';

interface RecipientData {
  id: string;
  name: string;
  accountNumber: string;
}

type TransferType = 'domestic' | 'international';

export default function SendMoney() {
  const navigate = useNavigate();
  const { customer, profile, refetchCustomer } = useCustomer();
  const { createTransaction } = useTransactions();
  const [step, setStep] = useState<'type' | 'recipient' | 'amount' | 'confirm' | 'success'>('type');
  const [transferType, setTransferType] = useState<TransferType>('domestic');
  const [recipient, setRecipient] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientData | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<RecipientData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastReference, setLastReference] = useState('');
  const [internationalData, setInternationalData] = useState<InternationalRecipientData | null>(null);

  const canSendMoney = customer?.can_send_money && customer?.status === 'active';

  const handleSearch = async (query: string) => {
    setRecipient(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, user_id, account_number')
        .or(`account_number.ilike.%${query}%`)
        .neq('user_id', customer?.user_id)
        .limit(5);

      if (customersError) throw customersError;

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

  const handleInternationalRecipient = (data: InternationalRecipientData) => {
    setInternationalData(data);
    setSelectedRecipient({
      id: 'international',
      name: data.recipientName,
      accountNumber: data.accountNumber,
    });
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

  // Check if recipient is internal (same bank) based on whether they were found in our customers table
  const isInternalTransfer = selectedRecipient !== null; // All searchable recipients are internal

  const handleSend = async () => {
    if (!customer || !selectedRecipient || !canSendMoney) return;

    setIsLoading(true);
    try {
      const transferAmount = parseFloat(amount);
      const isInternal = transferType === 'domestic' && selectedRecipient.id !== 'international';

      if (isInternal) {
        // Internal transfer: deduct sender, credit recipient, status = completed
        const { error: deductError } = await supabase
          .from('customers')
          .update({ balance: Number(customer.balance) - transferAmount })
          .eq('id', customer.id);
        if (deductError) throw deductError;

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
      } else {
        // External transfer: deduct sender, status = pending (admin must approve)
        const { error: deductError } = await supabase
          .from('customers')
          .update({ balance: Number(customer.balance) - transferAmount })
          .eq('id', customer.id);
        if (deductError) throw deductError;
      }

      const result = await createTransaction.mutateAsync({
        type: 'debit',
        amount: transferAmount,
        description: note || `${transferType === 'domestic' ? 'Domestic' : 'International'} wire to ${selectedRecipient.name}`,
        recipient_name: selectedRecipient.name,
        recipient_account: selectedRecipient.accountNumber,
        status: isInternal ? 'completed' : 'pending',
      });

      setLastReference(result.reference);
      await refetchCustomer();
      setStep('success');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!selectedRecipient || !customer || !profile) return;
    generateTransferReceipt({
      senderName: profile.name,
      senderAccount: customer.account_number,
      recipientName: selectedRecipient.name,
      recipientAccount: selectedRecipient.accountNumber,
      amount: parseFloat(amount),
      note: note || undefined,
      reference: lastReference || `TRF-${Date.now().toString().slice(-8)}`,
      transferType,
      routingNumber: ROUTING_NUMBER,
      date: new Date(),
    });
  };

  const formattedAmount = amount ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(amount)) : '$0.00';

  const goBack = () => {
    if (step === 'type') navigate(-1);
    else if (step === 'recipient') setStep('type');
    else if (step === 'amount') setStep('recipient');
    else if (step === 'confirm') setStep('amount');
    else navigate('/dashboard');
  };

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
        <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full max-w-xs">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold font-display">
          {step === 'success' ? 'Transfer Complete' : 'Wire Transfer'}
        </h1>
      </div>

      {/* Transfer Type Step */}
      {step === 'type' && (
        <div className="p-4 space-y-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-semibold font-display mb-2">Select Transfer Type</h2>
            <p className="text-muted-foreground text-sm">Choose the type of wire transfer</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => { setTransferType('domestic'); setStep('recipient'); }}
              className="w-full flex items-center gap-4 p-5 bg-card rounded-2xl card-shadow hover:bg-muted transition-colors text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">Domestic Wire</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transfer within the United States. Typically arrives same day.
                </p>
              </div>
            </button>

            <button
              onClick={() => { setTransferType('international'); setStep('recipient'); }}
              className="w-full flex items-center gap-4 p-5 bg-card rounded-2xl card-shadow hover:bg-muted transition-colors text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">International Wire</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transfer to accounts worldwide. May take 1-5 business days.
                </p>
              </div>
            </button>
          </div>

          {/* Account info */}
          <div className="bg-card rounded-2xl p-4 card-shadow space-y-2">
            <p className="text-sm text-muted-foreground">Your Account Details</p>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Account Number</span>
              <span className="text-sm font-mono font-medium">{customer?.account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Routing Number</span>
              <span className="text-sm font-mono font-medium">{ROUTING_NUMBER}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Step */}
      {step === 'recipient' && transferType === 'domestic' && (
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-3 py-1 rounded-full font-medium bg-primary/10 text-primary">
              Domestic Wire
            </span>
          </div>

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

          {isSearching && (
            <div className="text-center py-4 text-muted-foreground">Searching...</div>
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

      {/* International Recipient Step */}
      {step === 'recipient' && transferType === 'international' && (
        <InternationalRecipientForm onSubmit={handleInternationalRecipient} />
      )}

      {/* Amount Step */}
      {step === 'amount' && selectedRecipient && (
        <div className="p-4 space-y-6">
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

          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="input-bank"
            />
          </div>

          <Button onClick={handleAmountConfirm} className="w-full h-12 btn-gradient text-base font-semibold">
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
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                transferType === 'domestic'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent/10 text-accent'
              }`}>
                {transferType === 'domestic' ? 'Domestic Wire' : 'International Wire'}
              </span>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">{selectedRecipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium font-mono text-right max-w-[60%] break-all">{selectedRecipient.accountNumber}</span>
              </div>
              {internationalData && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SWIFT / BIC</span>
                    <span className="font-medium font-mono">{internationalData.swiftCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Name</span>
                    <span className="font-medium text-right max-w-[60%]">{internationalData.bankName}</span>
                  </div>
                  {internationalData.bankRoutingNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank Routing</span>
                      <span className="font-medium font-mono">{internationalData.bankRoutingNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country</span>
                    <span className="font-medium">{internationalData.country}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">From Account</span>
                <span className="font-medium font-mono">{customer?.account_number}</span>
              </div>
              {transferType === 'domestic' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Routing Number</span>
                  <span className="font-medium font-mono">{ROUTING_NUMBER}</span>
                </div>
              )}
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
              {transferType === 'international' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-yellow-500">Pending Review</span>
                </div>
              )}
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
            Reference: {lastReference || `TRF-${Date.now().toString().slice(-8)}`}
          </p>

          <div className="w-full space-y-3">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Download PDF Receipt
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 btn-gradient text-base font-semibold"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
