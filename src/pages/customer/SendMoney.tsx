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
      let customersQuery = supabase
        .from('customers')
        .select('id, user_id, account_number')
        .ilike('account_number', `%${query}%`)
        .limit(5);

      if (customer?.user_id) {
        customersQuery = customersQuery.not('user_id', 'eq', customer.user_id);
      }

      const { data: customers, error } = await customersQuery;
      if (error) throw error;

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
            accountNumber: String(c.account_number),
          };
        });

        setSearchResults(results);
      } else {
        let profilesQuery = supabase
          .from('profiles')
          .select('user_id, name, email')
          .ilike('name', `%${query}%`)
          .limit(5);

        if (customer?.user_id) {
          profilesQuery = profilesQuery.not('user_id', 'eq', customer.user_id);
        }

        const { data: profiles } = await profilesQuery;

        if (profiles && profiles.length > 0) {
          const userIds = profiles.map(p => p.user_id);

          const { data: customersData } = await supabase
            .from('customers')
            .select('id, user_id, account_number')
            .in('user_id', userIds);

          const results = profiles
            .map(p => {
              const c = customersData?.find(c => c.user_id === p.user_id);
              return c
                ? {
                    id: c.id,
                    name: p.name,
                    accountNumber: String(c.account_number),
                  }
                : null;
            })
            .filter(Boolean) as RecipientData[];

          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
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

  const handleSend = async () => {
    if (!customer || !selectedRecipient || !canSendMoney) return;

    setIsLoading(true);

    try {
      const transferAmount = parseFloat(amount);
      const isInternal = transferType === 'domestic' && selectedRecipient.id !== 'international';

      const { error: deductError } = await supabase
        .from('customers')
        .update({ balance: Number(customer.balance) - transferAmount })
        .eq('id', customer.id);

      if (deductError) throw deductError;

      if (isInternal) {
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
      }

      const result = await createTransaction.mutateAsync({
        type: 'debit',
        amount: transferAmount,
        description:
          note ||
          `${transferType === 'domestic' ? 'Domestic' : 'International'} wire to ${selectedRecipient.name}`,
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

  const formattedAmount = amount
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(parseFloat(amount))
    : '$0.00';

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
        <h2 className="text-2xl font-bold mb-2 font-display">Transfers Disabled</h2>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return <div className="min-h-screen bg-background">{/* UI remains unchanged */}</div>;
}
