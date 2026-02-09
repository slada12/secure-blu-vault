import { Bell, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/ui/BottomNav';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="Notifications" subtitle="Stay up to date" />

      <div className="px-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  markAsRead.mutate(notification.id);
                }
              }}
              className={`w-full text-left p-4 rounded-xl card-shadow transition-colors ${
                notification.read ? 'bg-card' : 'bg-primary/5 border border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notification.read ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  {notification.read ? (
                    <Check className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Bell className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>

      <BottomNav variant="customer" />
    </div>
  );
}
