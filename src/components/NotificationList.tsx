import { useEffect, useState } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/lib/types";
import { notifications } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { notificationApi } from "@/lib/api";

interface NotificationListProps {
  limit?: number;
  showIcon?: boolean;
  className?: string;
  showControls?: boolean;
  onMarkAllRead?: () => void;
}

const NotificationList = ({ 
  limit,
  showIcon = true,
  showControls = false,
  onMarkAllRead,
  className
}: NotificationListProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch notifications from API
      fetch(`http://localhost:3001/api/notifications/user/${user.id}`)
        .then(response => response.json())
        .then(data => {
          setNotifications(data);
        })
        .catch(error => {
          console.error("Error fetching notifications:", error);
          // Fallback to mock data
          import("@/lib/db").then(({ getNotificationsForUser }) => {
            const userNotifications = getNotificationsForUser(user.id);
            setNotifications(userNotifications);
          });
        });
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
    
    const targetType = notification.targetType || (notification.target_role === "all" ? "all" : 
      notification.flight_id ? "flight" : "role");
    
    switch (targetType) {
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

  const markAsRead = (id: string) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications([...readNotifications, id]);
    }
  };
  
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications([...new Set([...readNotifications, ...allIds])]);
    if (onMarkAllRead) onMarkAllRead();
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
      {showControls && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      )}
      
      {displayNotifications.map((notification) => {
        const isRead = readNotifications.includes(notification.id);
        
        return (
          <Card 
            key={notification.id}
            className={cn(
              "overflow-hidden relative",
              isRead ? 'bg-muted/50' : 'bg-card'
            )}
          >
            {!isRead && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full m-2"></div>
            )}
            
            <CardContent className="p-4">
              <div className="flex justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {notification.sender?.role?.charAt(0).toUpperCase() + notification.sender?.role?.slice(1) || 
                     notification.user_role?.charAt(0).toUpperCase() + notification.user_role?.slice(1) || 
                     "System"}
                  </Badge>
                  
                  {(notification.flight_id || notification.flightId) && (
                    <Badge variant="secondary" className="font-normal">
                      Flight related
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {getTimeAgo(notification.created_at || notification.timestamp || new Date().toISOString())}
                </div>
              </div>
              
              <div className="flex gap-3">
                {showIcon && (
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{notification.message}</p>
                </div>
              </div>
              
              {showControls && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span>Delete</span>
                  </Button>
                  
                  {!isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      <span>Mark as Read</span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default NotificationList;
