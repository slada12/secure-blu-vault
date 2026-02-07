import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BankCardProps {
  name: string;
  accountNumber: string;
  balance: number;
  showBalance?: boolean;
  className?: string;
}

export function BankCard({ name, accountNumber, balance, showBalance = true, className }: BankCardProps) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(balance);

  const maskedNumber = `•••• •••• •••• ${accountNumber.slice(-4)}`;

  return (
    <div className={cn(
      'relative w-full aspect-[1.6/1] rounded-2xl p-6 bank-card-gradient overflow-hidden',
      className
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
        <div className="absolute -right-5 top-20 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute left-10 -bottom-10 w-24 h-24 rounded-full bg-white/10" />
      </div>
      
      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between text-white">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70 mb-1">Current Balance</p>
            <p className="text-2xl font-bold balance-text">
              {showBalance ? formattedBalance : '••••••'}
            </p>
          </div>
          <Wifi className="w-6 h-6 rotate-90 text-white/70" />
        </div>
        
        {/* Footer */}
        <div className="space-y-3">
          <p className="font-mono text-lg tracking-wider">{maskedNumber}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium uppercase tracking-wide">{name}</p>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-red-500 opacity-80" />
              <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80 -ml-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
