import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newRestaurants: boolean;
  deliveryAlerts: boolean;
}

export function NotificationManager() {
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: false,
    newRestaurants: true,
    deliveryAlerts: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    // Check current permission status
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
    
    // Load saved settings from localStorage
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === "granted") {
        // Show test notification
        new Notification("Munchies Notifications Enabled!", {
          body: "You'll now receive order updates and delivery notifications",
          icon: "/favicon.ico",
          tag: "test-notification"
        });
        
        toast({
          title: "Notifications Enabled",
          description: "You'll receive order and delivery updates",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Notifications Blocked",
          description: "Enable notifications in your browser settings to receive updates",
        });
      }
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const sendTestNotification = () => {
    if (permissionStatus === "granted") {
      new Notification("Test Notification from Munchies", {
        body: "This is how your order notifications will look!",
        icon: "/favicon.ico",
        tag: "test-notification"
      });
      
      toast({
        title: "Test Notification Sent",
        description: "Check if you received it!",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              {permissionStatus === "granted" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-gray-600">
                  {permissionStatus === "granted" 
                    ? "Notifications are enabled"
                    : "Click to enable notifications"
                  }
                </p>
              </div>
            </div>
            
            {permissionStatus === "granted" ? (
              <div className="flex space-x-2">
                <Badge variant="outline" className="text-green-600">
                  Enabled
                </Badge>
                <Button size="sm" variant="outline" onClick={sendTestNotification}>
                  Test
                </Button>
              </div>
            ) : (
              <Button onClick={requestPermission} size="sm">
                Enable
              </Button>
            )}
          </div>

          {/* Notification Categories */}
          {permissionStatus === "granted" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-gray-600">Get notified when your order status changes</p>
                </div>
                <Switch
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) => updateSetting('orderUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Delivery Alerts</p>
                  <p className="text-sm text-gray-600">Know when your courier is nearby</p>
                </div>
                <Switch
                  checked={settings.deliveryAlerts}
                  onCheckedChange={(checked) => updateSetting('deliveryAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">New Restaurants</p>
                  <p className="text-sm text-gray-600">Discover new restaurants on campus</p>
                </div>
                <Switch
                  checked={settings.newRestaurants}
                  onCheckedChange={(checked) => updateSetting('newRestaurants', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Promotions</p>
                  <p className="text-sm text-gray-600">Get notified about discounts and deals</p>
                </div>
                <Switch
                  checked={settings.promotions}
                  onCheckedChange={(checked) => updateSetting('promotions', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export notification utility functions
export const sendNotification = (title: string, options?: NotificationOptions) => {
  if ("Notification" in window && Notification.permission === "granted") {
    return new Notification(title, {
      icon: "/favicon.ico",
      ...options,
    });
  }
  return null;
};

export const notifyOrderUpdate = (orderId: number, status: string) => {
  const statusMessages = {
    confirmed: "Your order has been confirmed by the restaurant",
    preparing: "Your order is being prepared",
    ready: "Your order is ready for pickup",
    out_for_delivery: "Your courier is on the way!",
    delivered: "Your order has been delivered. Enjoy!",
  };

  const message = statusMessages[status as keyof typeof statusMessages] || `Order status: ${status}`;
  
  return sendNotification(`Order #${orderId} Update`, {
    body: message,
    tag: `order-${orderId}`,
  });
};