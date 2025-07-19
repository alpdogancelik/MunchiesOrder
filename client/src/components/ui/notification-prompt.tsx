import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationPromptProps {
  onDismiss?: () => void;
  className?: string;
}

export function NotificationPrompt({ onDismiss, className = "" }: NotificationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { permission, isLoading, requestPermissions } = useNotifications();

  if (isDismissed || permission.granted) {
    return null;
  }

  const handleEnable = async () => {
    await requestPermissions();
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={`bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-base text-orange-900 dark:text-orange-100">
              Enable Notifications
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
          Get real-time updates about your orders, including when they're being prepared, 
          out for delivery, and special offers from your favorite restaurants.
        </p>
        <div className="flex space-x-3">
          <Button
            onClick={handleEnable}
            disabled={isLoading}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Bell className="w-4 h-4 mr-2" />
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
          >
            <BellOff className="w-4 h-4 mr-2" />
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}