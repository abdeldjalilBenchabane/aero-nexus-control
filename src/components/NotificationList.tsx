
import { useEffect, useState } from "react";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, getNotificationsForUser } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationListProps {
  limit?: number;
  showIcon?: boolean;
  className?: string;
}

const NotificationList = ({ 
  limit,
  showIcon = true, 
  className
}: NotificationListProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userNotifications = getNotificationsForUser(user.id);
      setNotifications(userNotifications);
    }
  }, [user]);

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    
    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
  };

  const getNotificationIcon = (notification: Notification) => {
    if (!showIcon) return null;
    
    switch (notification.targetType) {
      case "all":
        return <Info className="text-blue-500" size={18} />;
      case "role":
        return <AlertTriangle className="text-yellow-500" size={18} />;
      case "flight":
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  const displayNotifications = limit 
    ? notifications.slice(0, limit) 
    : notifications;

  if (displayNotifications.length === 0) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {displayNotifications.map((notification) => (
        <div 
          key={notification.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
        >
          {showIcon && (
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{notification.message}</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                {getTimeAgo(notification.timestamp)}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                From: {notification.sender.role}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
