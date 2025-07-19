import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
      
      const order = await storage.updateOrder(orderId, {
        paymentStatus: 'paid',
        cashReceived: amountReceived,
        courierNotes: courierNotes || null,
        status: 'delivered'
      });
      
      res.json(order);
    } catch (error) {
      console.error("Error recording cash payment:", error);
      res.status(400).json({ message: "Failed to record cash payment" });
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
      
      const users = await storage.getAllUsers();
      const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        restaurant_owners: users.filter(u => u.role === 'restaurant_owner').length,
        couriers: users.filter(u => u.role === 'courier').length,
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
      
      const restaurants = await storage.getAllRestaurants();
      const stats = {
        total: restaurants.length,
        active: restaurants.filter(r => r.isOpen).length,
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
      
      const orders = await storage.getAllOrders();
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.createdAt!).toDateString() === today);
      
      const stats = {
        total: orders.length,
        today: todayOrders.length,
        revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
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
      
      // TODO: Implement iyzico payment initiation
      // This should create a payment request with iyzico and return payment form URL
      const iyzico = require('iyzipay');
      
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
      
      // TODO: Implement iyzico payment verification
      // This should verify the payment status with iyzico
      const iyzico = require('iyzipay');
      
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
      const couriers = await storage.getRestaurantCouriers(restaurantId);
      res.json(couriers);
    } catch (error) {
      console.error("Error fetching restaurant couriers:", error);
      res.status(500).json({ message: "Failed to fetch couriers" });
    }
  });

  app.post('/api/restaurants/:id/couriers', isAuthenticated, async (req: any, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const { courierId } = req.body;
      const assignment = await storage.assignCourierToRestaurant(courierId, restaurantId);
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning courier:", error);
      res.status(400).json({ message: "Failed to assign courier" });
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

  // Courier profile routes (new system)
  app.get('/api/courier/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const courierProfile = await storage.getCourierProfile(userId);
      if (!courierProfile) {
        return res.status(404).json({ message: "Courier profile not found" });
      }
      res.json(courierProfile);
    } catch (error) {
      console.error("Error fetching courier profile:", error);
      res.status(500).json({ message: "Failed to fetch courier profile" });
    }
  });

  app.post('/api/courier/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const courierData = insertCourierSchema.parse({ ...req.body, userId });
      const courierProfile = await storage.createCourierProfile(courierData);
      res.json(courierProfile);
    } catch (error) {
      console.error("Error creating courier profile:", error);
      res.status(400).json({ message: "Failed to create courier profile" });
    }
  });

  app.put('/api/courier/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const courierData = insertCourierSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateCourierProfile(userId, courierData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating courier profile:", error);
      res.status(400).json({ message: "Failed to update courier profile" });
    }
  });

  app.put('/api/courier/online-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { isOnline } = req.body;
      const updatedProfile = await storage.updateCourierOnlineStatus(userId, isOnline);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating courier online status:", error);
      res.status(400).json({ message: "Failed to update online status" });
    }
  });

  // Get available couriers (users with courier role)
  app.get('/api/couriers/available', isAuthenticated, async (req: any, res) => {
    try {
      const couriers = await storage.getCourierUsers();
      res.json(couriers);
    } catch (error) {
      console.error("Error fetching available couriers:", error);
      res.status(500).json({ message: "Failed to fetch couriers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
