import { useState } from 'react';
import { Globe, Building2, User, Hash, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface InternationalRecipientData {
  recipientName: string;
  accountNumber: string;
  swiftCode: string;
  bankName: string;
  bankRoutingNumber: string;
  bankAddress: string;
  country: string;
}

interface Props {
  onSubmit: (data: InternationalRecipientData) => void;
}

export default function InternationalRecipientForm({ onSubmit }: Props) {
  const [form, setForm] = useState<InternationalRecipientData>({
    recipientName: '',
    accountNumber: '',
    swiftCode: '',
    bankName: '',
    bankRoutingNumber: '',
    bankAddress: '',
    country: '',
  });

  const update = (field: keyof InternationalRecipientData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.recipientName.trim().length > 0 &&
    form.accountNumber.trim().length > 0 &&
    form.swiftCode.trim().length >= 8 &&
    form.bankName.trim().length > 0 &&
    form.country.trim().length > 0;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-3 py-1 rounded-full font-medium bg-accent/10 text-accent">
          International Wire
        </span>
      </div>

      <div className="space-y-4">
        {/* Recipient Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Recipient Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.recipientName}
              onChange={(e) => update('recipientName', e.target.value)}
              placeholder="John Doe"
              className="input-bank pl-11"
            />
          </div>
        </div>

        {/* Account / IBAN */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Account Number / IBAN</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => update('accountNumber', e.target.value)}
              placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
              className="input-bank pl-11"
            />
          </div>
        </div>

        {/* SWIFT / BIC */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">SWIFT / BIC Code</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.swiftCode}
              onChange={(e) => update('swiftCode', e.target.value.toUpperCase())}
              placeholder="e.g. NWBKGB2L"
              maxLength={11}
              className="input-bank pl-11 uppercase"
            />
          </div>
          <p className="text-xs text-muted-foreground">8 or 11 characters</p>
        </div>

        {/* Bank Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Recipient Bank Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => update('bankName', e.target.value)}
              placeholder="e.g. National Westminster Bank"
              className="input-bank pl-11"
            />
          </div>
        </div>

        {/* Bank Routing Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Bank Routing Number</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.bankRoutingNumber}
              onChange={(e) => update('bankRoutingNumber', e.target.value)}
              placeholder="e.g. 601613"
              className="input-bank pl-11"
            />
          </div>
        </div>

        {/* Bank Address */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Bank Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.bankAddress}
              onChange={(e) => update('bankAddress', e.target.value)}
              placeholder="e.g. 250 Bishopsgate, London"
              className="input-bank pl-11"
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Country</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              placeholder="e.g. United Kingdom"
              className="input-bank pl-11"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={() => onSubmit(form)}
        disabled={!isValid}
        className="w-full h-12 btn-gradient text-base font-semibold"
      >
        Continue
      </Button>
    </div>
  );
}
