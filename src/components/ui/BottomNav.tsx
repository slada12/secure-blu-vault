import { Home, History, CreditCard, User, Settings, Users, FileText, Bell, ArrowRightLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface BottomNavProps {
  variant: 'customer' | 'admin';
}

const customerNavItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: History, label: 'History', path: '/transactions' },
  { icon: CreditCard, label: 'Cards', path: '/cards' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const adminNavItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: ArrowRightLeft, label: 'Transfers', path: '/admin/transfers' },
  { icon: FileText, label: 'Requests', path: '/admin/requests' },
  { icon: Bell, label: 'Activity', path: '/admin/activity' },
];

export function BottomNav({ variant }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = variant === 'customer' ? customerNavItems : adminNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'nav-tab flex-1',
                isActive && 'active'
              )}
            >
              <item.icon className={cn(
                'w-6 h-6 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
