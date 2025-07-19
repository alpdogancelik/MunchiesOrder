import { useState, useEffect } from 'react';
import { notificationService, NotificationPayload, NotificationPermission } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({ granted: false });
  const [isLoading, setIsLoading] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationPayload[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial notification history
    setNotificationHistory(notificationService.getNotificationHistory());
    
    // Check if permissions are already granted
    if ('Notification' in window) {
      setPermission({ granted: Notification.permission === 'granted' });
    }
  }, []);

  const requestPermissions = async () => {
    setIsLoading(true);
    try {
      const result = await notificationService.requestPermissions();
      setPermission(result);
      
      if (result.granted) {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for orders and updates",
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: result.error || "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permissions",
        variant: "destructive",
      });
      return { granted: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async (payload: NotificationPayload, userToken?: string) => {
    const success = await notificationService.sendNotification(payload, userToken);
    
    if (success) {
      // Update local history
      setNotificationHistory(notificationService.getNotificationHistory());
      
      // Show in-app toast as fallback
      toast({
        title: payload.title,
        description: payload.body,
      });
    }
    
    return success;
  };

  const clearHistory = () => {
    notificationService.clearNotificationHistory();
    setNotificationHistory([]);
  };

  return {
    permission,
    isLoading,
    notificationHistory,
    requestPermissions,
    sendNotification,
    clearHistory,
    isEnabled: permission.granted,
  };
}