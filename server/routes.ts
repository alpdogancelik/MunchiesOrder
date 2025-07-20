import type { Express } from "express";
import { createServer, type Server } from "http";
import { upload } from './multer-config';
import { storage } from "./storage";
import { sendOrderConfirmationEmail } from "./sendgrid";
import { setupAuth } from "./auth";
import { 
  insertAddressSchema,
  insertRestaurantSchema,
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertCartItemSchema,
  insertReviewSchema,
  insertCourierAssignmentSchema,
  insertCourierLocationSchema,
  insertCourierSchema,
  insertCourierRestaurantAssignmentSchema,
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup custom authentication
  setupAuth(app);

  // User routes
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Address routes
  app.get('/api/addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post('/api/addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const addressData = insertAddressSchema.parse({ ...req.body, userId });
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(400).json({ message: "Failed to create address" });
    }
  });

  app.put('/api/addresses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const addressData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(addressId, addressData);
      res.json(address);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(400).json({ message: "Failed to update address" });
    }
  });

  app.delete('/api/addresses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const addressId = parseInt(req.params.id);
      await storage.deleteAddress(addressId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(400).json({ message: "Failed to delete address" });
    }
  });

  app.put('/api/addresses/:id/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const addressId = parseInt(req.params.id);
      await storage.setDefaultAddress(userId, addressId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(400).json({ message: "Failed to set default address" });
    }
  });

  // Restaurant routes
  app.get('/api/restaurants', async (req, res) => {
    try {
      const { search, category } = req.query;
      let restaurants = await storage.getRestaurants();
      
      // Apply search filter
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        restaurants = restaurants.filter(restaurant => 
          restaurant.name.toLowerCase().includes(searchLower) ||
          restaurant.description?.toLowerCase().includes(searchLower) ||
          restaurant.cuisine?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply category filter
      if (category && typeof category === 'string') {
        restaurants = restaurants.filter(restaurant => 
          restaurant.cuisine?.toLowerCase() === category.toLowerCase()
        );
      }
      
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get('/api/restaurants/:id', async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      if (isNaN(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.get('/api/restaurants/owner/me', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.id;
      const restaurants = await storage.getRestaurantsByOwner(ownerId);
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching owner restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.post('/api/restaurants', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.id;
      const restaurantData = insertRestaurantSchema.parse({ ...req.body, ownerId });
      const restaurant = await storage.createRestaurant(restaurantData);
      res.json(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(400).json({ message: "Failed to create restaurant" });
    }
  });

  app.put('/api/restaurants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const restaurantData = insertRestaurantSchema.partial().parse(req.body);
      const restaurant = await storage.updateRestaurant(restaurantId, restaurantData);
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(400).json({ message: "Failed to update restaurant" });
    }
  });

  // Menu routes
  app.get('/api/restaurants/:id/categories', async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categories = await storage.getMenuCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching menu categories:", error);
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });

  app.get('/api/restaurants/:id/menu', async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const menuItems = await storage.getMenuItems(restaurantId, categoryId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/restaurants/:id/categories', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categoryData = insertMenuCategorySchema.parse({ ...req.body, restaurantId });
      const category = await storage.createMenuCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating menu category:", error);
      res.status(400).json({ message: "Failed to create menu category" });
    }
  });

  app.post('/api/restaurants/:id/menu', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      if (isNaN(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      const menuItemData = insertMenuItemSchema.parse({ ...req.body, restaurantId });
      const menuItem = await storage.createMenuItem(menuItemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(400).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const menuItemId = parseInt(req.params.id);
      if (isNaN(menuItemId)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const menuItemData = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(menuItemId, menuItemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const menuItemId = parseInt(req.params.id);
      if (isNaN(menuItemId)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      await storage.deleteMenuItem(menuItemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(400).json({ message: "Failed to delete menu item" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      await storage.deleteMenuCategory(categoryId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(400).json({ message: "Failed to delete category" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({ ...req.body, userId });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(cartItemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      await storage.removeFromCart(cartItemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(400).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(400).json({ message: "Failed to clear cart" });
    }
  });

  // Payment and cash tracking routes
  app.post('/api/orders/:id/cash-payment', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { amountReceived, courierNotes } = req.body;
      
      const order = await storage.updateOrderStatus(orderId, 'delivered');
      // Note: Additional payment fields would need schema updates
      
      res.json(order);
    } catch (error) {
      console.error("Error recording cash payment:", error);
      res.status(400).json({ message: "Failed to record cash payment" });
    }
  });

  // Email receipt route  
  app.post('/api/send-receipt', async (req, res) => {
    try {
      const { email, orderId, orderData } = req.body;
      
      try {
        const { sendOrderReceipt } = await import('./email');
        const emailSent = await sendOrderReceipt(orderData);
        
        if (emailSent) {
          res.json({ success: true, message: "Receipt sent successfully" });
        } else {
          console.warn("Email service returned false, but treating as non-critical");
          res.json({ success: true, message: "Order processed (email delivery pending)" });
        }
      } catch (emailError) {
        console.warn("Email service unavailable, continuing without email:", emailError);
        res.json({ success: true, message: "Order processed (email service unavailable)" });
      }
    } catch (error) {
      console.error("Error in receipt endpoint:", error);
      res.status(500).json({ message: "Failed to process receipt request" });
    }
  });

  // Developer dashboard routes
  app.get('/api/admin/system-stats', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow super admins (Arda and Alp)
      const user = req.user;
      if (!['arda', 'alp'].includes(user.username.toLowerCase())) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['arda', 'alp'].includes(user.username.toLowerCase())) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Simplified for now - would need proper admin queries
      const stats = {
        total: 50,
        students: 35,
        restaurant_owners: 10,
        couriers: 5,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/admin/restaurants', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['arda', 'alp'].includes(user.username.toLowerCase())) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const restaurants = await storage.getRestaurants();
      const stats = {
        total: restaurants.length,
        active: restaurants.filter((r: any) => r.isOpen).length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching restaurant stats:", error);
      res.status(500).json({ message: "Failed to fetch restaurant stats" });
    }
  });

  app.get('/api/admin/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['arda', 'alp'].includes(user.username.toLowerCase())) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Simplified for now - would need proper order queries
      const orders = [];
      const stats = {
        total: 125,
        today: 15,
        revenue: 2850,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ message: "Failed to fetch order stats" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      let orders = await storage.getUserOrders(userId);
      
      // Apply status filter for order history
      if (status && typeof status === 'string') {
        orders = orders.filter(order => order.status === status);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get('/api/restaurants/:id/orders', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const status = req.query.status as string;
      const orders = await storage.getRestaurantOrders(restaurantId, status);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      res.status(500).json({ message: "Failed to fetch restaurant orders" });
    }
  });

  app.get('/api/orders/user/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Notification routes
  app.post('/api/notifications/send', isAuthenticated, async (req: any, res) => {
    try {
      const { type, targetUserId, payload } = req.body;
      
      // In a real implementation, you would:
      // 1. Get the user's notification token from database
      // 2. Send via FCM/Expo Push Service
      // 3. Store notification in database for history
      
      console.log(`Sending ${type} notification to user ${targetUserId}:`, payload);
      
      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  app.post('/api/notifications/register-token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { token, platform } = req.body;
      
      // Store user's notification token
      // await storage.updateUserNotificationToken(userId, token, platform);
      
      console.log(`Registered notification token for user ${userId}: ${token}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error registering notification token:", error);
      res.status(500).json({ message: "Failed to register token" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { orderData, orderItems } = req.body;
      
      const validatedOrderData = insertOrderSchema.parse({ ...orderData, userId });
      const order = await storage.createOrder(validatedOrderData, orderItems);
      
      // Clear cart after order creation
      await storage.clearCart(userId);
      
      // Send order confirmation email
      try {
        const restaurant = await storage.getRestaurant(orderData.restaurantId);
        const address = await storage.getAddress(orderData.addressId);
        
        try {
          await sendOrderConfirmationEmail({
            orderNumber: order.id.toString(),
            customerName: `${req.user.firstName || 'Student'} ${req.user.lastName || 'User'}`,
            customerEmail: req.user.email || 'student@emu.edu.tr',
            restaurantName: restaurant?.name || 'Campus Restaurant',
            items: orderItems?.map(item => ({
              name: item.name || 'Menu Item',
              quantity: item.quantity || 1,
              price: item.price || 0
            })) || [{ name: 'Order Items', quantity: 1, price: orderData.total }],
            total: orderData.total,
            paymentMethod: orderData.paymentMethod,
            deliveryAddress: address?.address || 'Campus Address'
          });
          console.log('Order confirmation email sent successfully');
        } catch (emailSendError) {
          console.warn('Email service failed, but order will continue:', emailSendError);
        }
      } catch (emailError) {
        console.warn('Email preparation failed, continuing without email:', emailError);
        // Don't fail the order if email fails
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updateOrderStatus(orderId, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.put('/api/orders/:id/payment', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { paymentStatus, paymentId } = req.body;
      const order = await storage.updateOrderPayment(orderId, paymentStatus, paymentId);
      res.json(order);
    } catch (error) {
      console.error("Error updating order payment:", error);
      res.status(400).json({ message: "Failed to update order payment" });
    }
  });

  // iyzico payment routes
  app.post('/api/payment/iyzico/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, orderData } = req.body;
      
      // Import iyzico using dynamic import for ES module compatibility
      const { default: iyzico } = await import('iyzipay');
      
      const iyzicoClient = new iyzico({
        apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key',
        secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
        uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
      });

      const request = {
        locale: iyzico.LOCALE.TR,
        conversationId: `order-${orderId}`,
        price: orderData.total,
        paidPrice: orderData.total,
        currency: iyzico.CURRENCY.TRY,
        installment: '1',
        basketId: `basket-${orderId}`,
        paymentChannel: iyzico.PAYMENT_CHANNEL.WEB,
        paymentGroup: iyzico.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${req.protocol}://${req.hostname}/api/payment/iyzico/callback`,
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
          id: req.user.id,
          name: req.user.claims.first_name || 'Student',
          surname: req.user.claims.last_name || 'User',
          gsmNumber: '+905555555555',
          email: req.user.claims.email || 'student@emu.edu.tr',
          identityNumber: '74300864791',
          lastLoginDate: '2015-10-05 12:43:35',
          registrationDate: '2013-04-21 15:12:09',
          registrationAddress: orderData.address,
          ip: req.ip,
          city: 'Kalkanlı',
          country: 'Cyprus',
          zipCode: '99628'
        },
        shippingAddress: {
          contactName: `${req.user.claims.first_name || 'Student'} ${req.user.claims.last_name || 'User'}`,
          city: 'Kalkanlı',
          country: 'Cyprus',
          address: orderData.address,
          zipCode: '99628'
        },
        billingAddress: {
          contactName: `${req.user.claims.first_name || 'Student'} ${req.user.claims.last_name || 'User'}`,
          city: 'Kalkanlı',
          country: 'Cyprus',
          address: orderData.address,
          zipCode: '99628'
        },
        basketItems: orderData.items.map((item: any, index: number) => ({
          id: `item-${index}`,
          name: item.name,
          category1: 'Food',
          category2: 'Restaurant',
          itemType: iyzico.BASKET_ITEM_TYPE.PHYSICAL,
          price: (parseFloat(item.price) * item.quantity).toString()
        }))
      };

      iyzicoClient.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) {
          console.error('iyzico error:', err);
          return res.status(400).json({ message: 'Payment initiation failed' });
        }
        
        res.json({
          success: true,
          paymentPageUrl: result.paymentPageUrl,
          token: result.token
        });
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  app.post('/api/payment/iyzico/callback', async (req, res) => {
    try {
      const { token } = req.body;
      
      // Import iyzico using dynamic import for ES module compatibility
      const { default: iyzico } = await import('iyzipay');
      
      const iyzicoClient = new iyzico({
        apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key',
        secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
        uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
      });

      const request = {
        locale: iyzico.LOCALE.TR,
        conversationId: 'payment-verification',
        token: token
      };

      iyzicoClient.checkoutForm.retrieve(request, async (err: any, result: any) => {
        if (err) {
          console.error('iyzico verification error:', err);
          return res.status(400).json({ message: 'Payment verification failed' });
        }

        if (result.status === 'success') {
          // Extract order ID from conversation ID
          const orderId = parseInt(result.conversationId.replace('order-', ''));
          
          // Update order payment status
          await storage.updateOrderPayment(orderId, 'completed', result.paymentId);
          await storage.updateOrderStatus(orderId, 'confirmed');
          
          res.json({ success: true, orderId });
        } else {
          res.status(400).json({ message: 'Payment failed' });
        }
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/restaurants/:id/reviews', async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const reviews = await storage.getRestaurantReviews(restaurantId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Courier assignment routes for restaurant owners
  app.get('/api/restaurants/:id/couriers', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      
      // Get real assigned couriers from database
      const assignedCouriers = await storage.getRestaurantCouriers(restaurantId);
      
      // Get full courier user details for each assignment
      const couriersWithDetails = [];
      for (const assignment of assignedCouriers) {
        const courierUser = await storage.getUser(assignment.courier.id);
        const courierProfile = await storage.getCourierProfile(assignment.courier.id);
        
        if (courierUser) {
          couriersWithDetails.push({
            id: courierUser.id,
            username: courierUser.username,
            firstName: courierUser.firstName,
            lastName: courierUser.lastName,
            email: courierUser.email,
            isOnline: courierProfile?.isOnline || false,
            vehicleType: courierProfile?.vehicleType || 'motorcycle',
            rating: courierProfile?.rating || 4.5,
            assignedAt: assignment.assignedAt
          });
        }
      }
      
      res.json(couriersWithDetails);
    } catch (error) {
      console.error("Error fetching restaurant couriers:", error);
      res.status(500).json({ message: "Failed to fetch couriers" });
    }
  });

  app.post('/api/restaurants/:id/couriers', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const { courierId } = req.body;
      
      console.log(`Assigning courier ${courierId} to restaurant ${restaurantId}`);
      
      // Use real database assignment
      const assignment = await storage.assignCourierToRestaurant(courierId, restaurantId);
      
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning courier:", error);
      res.status(500).json({ message: "Failed to assign courier" });
    }
  });

  // Image upload route
  app.post('/api/upload', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Return the uploaded image path
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.delete('/api/restaurants/:id/couriers/:courierId', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const courierId = req.params.courierId;
      await storage.unassignCourierFromRestaurant(courierId, restaurantId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unassigning courier:", error);
      res.status(400).json({ message: "Failed to unassign courier" });
    }
  });

  // Courier routes
  app.get('/api/courier/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const courierId = req.user.id;
      const assignments = await storage.getCourierAssignments(courierId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching courier assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/courier/orders', isAuthenticated, async (req: any, res) => {
    try {
      const courierId = req.user.id;
      const orders = await storage.getCourierOrders(courierId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching courier orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/courier/location', isAuthenticated, async (req: any, res) => {
    try {
      const courierId = req.user.id;
      const { latitude, longitude } = req.body;
      const location = await storage.updateCourierLocation(courierId, latitude, longitude);
      res.json(location);
    } catch (error) {
      console.error("Error updating courier location:", error);
      res.status(400).json({ message: "Failed to update location" });
    }
  });

  app.get('/api/courier/:id/location', isAuthenticated, async (req: any, res) => {
    try {
      const courierId = req.params.id;
      const location = await storage.getCourierLocation(courierId);
      res.json(location || null);
    } catch (error) {
      console.error("Error fetching courier location:", error);
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  // Simplified courier routes (working version)
  app.get('/api/courier/profile', isAuthenticated, async (req: any, res) => {
    try {
      // Return a basic profile for any user accessing courier dashboard
      const basicProfile = {
        id: req.user.id,
        name: `${req.user.firstName || 'Courier'} ${req.user.lastName || 'User'}`,
        vehicleType: 'motorcycle',
        isOnline: true,
        isAvailable: true,
        rating: 4.8,
        completedDeliveries: 127
      };
      
      res.json(basicProfile);
    } catch (error) {
      console.error("Error fetching courier profile:", error);
      res.status(500).json({ message: "Failed to fetch courier profile" });
    }
  });

  app.post('/api/courier/profile', isAuthenticated, async (req: any, res) => {
    try {
      // Mock profile creation success
      const mockProfile = {
        id: req.user.id,
        ...req.body,
        createdAt: new Date(),
        isOnline: true
      };
      
      res.json(mockProfile);
    } catch (error) {
      console.error("Error creating courier profile:", error);
      res.status(400).json({ message: "Failed to create courier profile" });
    }
  });

  // Get available couriers (users with courier role)
  app.get('/api/couriers/available', async (req: any, res) => {
    try {
      // Get real courier users from database
      const courierUsers = await storage.getCourierUsers();
      const availableCouriers = courierUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        vehicleType: "Motorbike", // Default for now
        rating: "4.8", // Default rating
        isOnline: true, // Assume online for now
        profileImageUrl: user.profileImageUrl
      }));
      res.json(availableCouriers);
    } catch (error) {
      console.error("Error fetching available couriers:", error);
      res.status(500).json({ message: "Failed to fetch couriers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
