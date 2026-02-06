import { useState } from 'react';
import { User, Mail, Phone, Shield, Lock, ChevronRight, LogOut, Bell, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/ui/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCustomer } from '@/hooks/useCustomer';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { customer, profile, isLoading } = useCustomer();
  const { signOut } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully');
        setShowPasswordModal(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="Profile" subtitle="Manage your account" />
        <div className="px-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <BottomNav variant="customer" />
      </div>
    );
  }

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Info', value: profile?.name || 'User', onClick: () => {} },
        { icon: Mail, label: 'Email', value: profile?.email || '', onClick: () => {} },
        { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set', onClick: () => {} },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: Lock, label: 'Change Password', onClick: () => setShowPasswordModal(true) },
        { 
          icon: Shield, 
          label: 'Two-Factor Authentication', 
          toggle: true,
          checked: twoFactorEnabled,
          onChange: () => {
            setTwoFactorEnabled(!twoFactorEnabled);
            toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled');
          }
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', onClick: () => {} },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Profile"
        subtitle="Manage your account"
      />

      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl card-shadow">
          <div className="w-16 h-16 rounded-full bank-card-gradient flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">{profile?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">
              Account: •••• {customer?.account_number?.slice(-4) || '0000'}
            </p>
          </div>
        </div>

        {/* Profile Sections */}
        {profileSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              {section.title}
            </h3>
            <div className="bg-card rounded-2xl card-shadow divide-y divide-border">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.value && (
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                  {item.toggle ? (
                    <Switch checked={item.checked} onCheckedChange={item.onChange} />
                  ) : (
                    <button onClick={item.onClick}>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 text-destructive border-destructive/20 hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePasswordChange} className="space-y-4 py-4">
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="Current password"
                className="input-bank pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                placeholder="New password"
                className="input-bank pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Confirm new password"
              className="input-bank"
              required
            />

            <Button 
              type="submit" 
              className="w-full btn-gradient"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav variant="customer" />
    </div>
  );
}
