// Notification System for Munchies Food Delivery App
// Supports both Expo Notifications and Firebase Cloud Messaging

export type NotificationType = 
  // Student notifications
  | 'order_received' 
  | 'order_preparing' 
  | 'courier_on_way' 
  | 'order_delivered' 
  | 'special_offer'
  // Restaurant notifications
  | 'new_order'
  | 'order_cancelled'
  | 'order_delivered_restaurant'
  | 'new_review'
  | 'courier_assigned'
  // Courier notifications
  | 'delivery_assigned'
  | 'order_ready_pickup'
  | 'delivery_completed'
  | 'order_cancelled_courier'
  | 'weekly_summary';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    orderId?: number;
    restaurantId?: number;
    courierId?: string;
    customerId?: string;
    deepLink?: string;
    [key: string]: any;
  };
}

export interface NotificationPermission {
  granted: boolean;
  token?: string;
  error?: string;
}

class NotificationService {
  private isExpoEnvironment = false;
  private isFirebaseInitialized = false;
  private notificationHistory: NotificationPayload[] = [];

  constructor() {
    this.detectEnvironment();
    this.initializeService();
  }

  private detectEnvironment() {
    // Check if running in Expo environment
    this.isExpoEnvironment = typeof window !== 'undefined' && 
      ('ExpoNotifications' in window || navigator.userAgent.includes('Expo'));
  }

  private async initializeService() {
    if (this.isExpoEnvironment) {
      await this.initializeExpo();
    } else {
      await this.initializeFirebase();
    }
  }

  private async initializeExpo() {
    try {
      // Expo Notifications setup
      if (typeof window !== 'undefined' && 'ExpoNotifications' in window) {
        const { Notifications } = (window as any).ExpoNotifications;
        
        // Set notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        console.log('Expo Notifications initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Expo Notifications:', error);
    }
  }

  private async initializeFirebase() {
    try {
      // Firebase Cloud Messaging setup for web
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Register service worker for FCM
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered for FCM:', registration);
        this.isFirebaseInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  async requestPermissions(): Promise<NotificationPermission> {
    try {
      if (this.isExpoEnvironment) {
        return await this.requestExpoPermissions();
      } else {
        return await this.requestWebPermissions();
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return { granted: false, error: error.message };
    }
  }

  private async requestExpoPermissions(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'ExpoNotifications' in window) {
      const { Notifications } = (window as any).ExpoNotifications;
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        return { granted: true, token: token.data };
      }

      return { granted: false, error: 'Permission denied' };
    }

    return { granted: false, error: 'Expo not available' };
  }

  private async requestWebPermissions(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return { granted: false, error: 'Notifications not supported' };
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      // For Firebase, you would get the FCM token here
      // const token = await getMessaging().getToken();
      return { granted: true };
    }

    return { granted: false, error: 'Permission denied' };
  }

  async sendNotification(payload: NotificationPayload, userToken?: string): Promise<boolean> {
    try {
      // Store in local history
      this.notificationHistory.unshift({
        ...payload,
        data: { ...payload.data, timestamp: Date.now() }
      });

      // Keep only last 50 notifications
      if (this.notificationHistory.length > 50) {
        this.notificationHistory = this.notificationHistory.slice(0, 50);
      }

      if (this.isExpoEnvironment) {
        return await this.sendExpoNotification(payload, userToken);
      } else {
        return await this.sendWebNotification(payload);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  private async sendExpoNotification(payload: NotificationPayload, userToken?: string): Promise<boolean> {
    if (userToken) {
      // Send via Expo Push Service
      const message = {
        to: userToken,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: 'default',
        badge: 1,
      };

      // In production, send to Expo Push API
      // const response = await fetch('https://exp.host/--/api/v2/push/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(message),
      // });

      console.log('Would send Expo notification:', message);
      return true;
    }

    // Local notification fallback
    if (typeof window !== 'undefined' && 'ExpoNotifications' in window) {
      const { Notifications } = (window as any).ExpoNotifications;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger: null, // Immediate
      });
      return true;
    }

    return false;
  }

  private async sendWebNotification(payload: NotificationPayload): Promise<boolean> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data,
        requireInteraction: true,
        actions: payload.data?.deepLink ? [
          { action: 'view', title: 'View' }
        ] : undefined
      });

      notification.onclick = () => {
        if (payload.data?.deepLink) {
          window.location.href = payload.data.deepLink;
        }
        notification.close();
      };

      return true;
    }

    return false;
  }

  getNotificationHistory(): NotificationPayload[] {
    return [...this.notificationHistory];
  }

  clearNotificationHistory(): void {
    this.notificationHistory = [];
  }

  // Predefined notification templates
  static getStudentNotifications() {
    return {
      orderReceived: (restaurantName: string, orderId: number): NotificationPayload => ({
        type: 'order_received',
        title: 'Order Confirmed! 🎉',
        body: `Your order has been received by ${restaurantName}`,
        data: { orderId, deepLink: `/order/${orderId}` }
      }),

      orderPreparing: (restaurantName: string, orderId: number): NotificationPayload => ({
        type: 'order_preparing',
        title: 'Good news! 👨‍🍳',
        body: `Your order is now being prepared at ${restaurantName}`,
        data: { orderId, deepLink: `/order/${orderId}` }
      }),

      courierOnWay: (courierName: string, orderId: number): NotificationPayload => ({
        type: 'courier_on_way',
        title: 'Your courier is on the way! 🚴',
        body: `${courierName} is heading to you with your order`,
        data: { orderId, deepLink: `/order/${orderId}` }
      }),

      orderDelivered: (orderId: number): NotificationPayload => ({
        type: 'order_delivered',
        title: 'Delivered! 🎉',
        body: 'Your order has been delivered. Enjoy your meal!',
        data: { orderId, deepLink: `/order/${orderId}` }
      }),

      specialOffer: (discount: string, cuisine: string): NotificationPayload => ({
        type: 'special_offer',
        title: `Special Deal! ${discount}`,
        body: `Limited time offer on ${cuisine} dishes`,
        data: { deepLink: '/' }
      })
    };
  }

  static getRestaurantNotifications() {
    return {
      newOrder: (customerName: string, orderId: number): NotificationPayload => ({
        type: 'new_order',
        title: 'New Order! 📋',
        body: `New order received from ${customerName}`,
        data: { orderId, deepLink: `/admin/orders/${orderId}` }
      }),

      orderCancelled: (orderId: number): NotificationPayload => ({
        type: 'order_cancelled',
        title: 'Order Cancelled',
        body: `Order #${orderId} has been cancelled by the customer`,
        data: { orderId, deepLink: `/admin/orders` }
      }),

      orderDelivered: (orderId: number): NotificationPayload => ({
        type: 'order_delivered_restaurant',
        title: 'Order Delivered ✅',
        body: `Order #${orderId} has been delivered successfully`,
        data: { orderId, deepLink: `/admin/orders/${orderId}` }
      }),

      newReview: (customerName: string, rating: number): NotificationPayload => ({
        type: 'new_review',
        title: 'New Review! ⭐',
        body: `${customerName} left you a ${rating}-star review`,
        data: { deepLink: '/admin/reviews' }
      }),

      courierAssigned: (courierName: string, orderId: number): NotificationPayload => ({
        type: 'courier_assigned',
        title: 'Courier Assigned 🚚',
        body: `${courierName} has been assigned to Order #${orderId}`,
        data: { orderId, deepLink: `/admin/orders/${orderId}` }
      })
    };
  }

  static getCourierNotifications() {
    return {
      deliveryAssigned: (restaurantName: string, orderId: number): NotificationPayload => ({
        type: 'delivery_assigned',
        title: 'New Delivery! 🚚',
        body: `New delivery assigned: Pickup from ${restaurantName}`,
        data: { orderId, deepLink: `/courier/delivery/${orderId}` }
      }),

      orderReadyPickup: (restaurantName: string, orderId: number): NotificationPayload => ({
        type: 'order_ready_pickup',
        title: 'Ready for Pickup! 📦',
        body: `Order #${orderId} is ready for pickup at ${restaurantName}`,
        data: { orderId, deepLink: `/courier/delivery/${orderId}` }
      }),

      deliveryCompleted: (orderId: number): NotificationPayload => ({
        type: 'delivery_completed',
        title: 'Delivery Complete! ✅',
        body: `You successfully delivered Order #${orderId}`,
        data: { orderId, deepLink: '/courier/earnings' }
      }),

      orderCancelled: (orderId: number): NotificationPayload => ({
        type: 'order_cancelled_courier',
        title: 'Order Cancelled',
        body: `Order #${orderId} was cancelled by the restaurant`,
        data: { orderId, deepLink: '/courier/deliveries' }
      }),

      weeklySummary: (deliveryCount: number, earnings: number): NotificationPayload => ({
        type: 'weekly_summary',
        title: 'Weekly Summary 📊',
        body: `You completed ${deliveryCount} deliveries this week. Great job! Earned: ${earnings}₺`,
        data: { deepLink: '/courier/earnings' }
      })
    };
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export notification templates for easy use
export const StudentNotifications = NotificationService.getStudentNotifications();
export const RestaurantNotifications = NotificationService.getRestaurantNotifications();
export const CourierNotifications = NotificationService.getCourierNotifications();