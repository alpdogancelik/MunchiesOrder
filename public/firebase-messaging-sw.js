// Firebase Cloud Messaging Service Worker
// This handles background notifications for the web app

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "demo-api-key",
  authDomain: "munchies-food-delivery.firebaseapp.com",
  projectId: "munchies-food-delivery",
  storageBucket: "munchies-food-delivery.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const { title, body, icon, badge, data } = payload.data || payload.notification;

  const notificationOptions = {
    body: body || payload.notification?.body,
    icon: icon || '/icon-192x192.png',
    badge: badge || '/badge-72x72.png',
    data: data || payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(
    title || payload.notification?.title || 'Munchies',
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the app to the relevant page
    const deepLink = event.notification.data?.deepLink || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if the app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(deepLink);
            return client.focus();
          }
        }
        // If app is not open, open a new window
        if (clients.openWindow) {
          return clients.openWindow(deepLink);
        }
      })
    );
  }
});

// Handle push events (for display notifications when app is closed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    console.log('Push event received:', payload);
    
    // Show notification if the app is not in focus
    if (!self.clients || self.clients.length === 0) {
      const options = {
        body: payload.body || payload.notification?.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data,
        requireInteraction: true
      };
      
      event.waitUntil(
        self.registration.showNotification(
          payload.title || payload.notification?.title || 'Munchies',
          options
        )
      );
    }
  }
});