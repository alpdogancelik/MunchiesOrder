import {
  users,
  addresses,
  restaurants,
  menuCategories,
  menuItems,
  orders,
  orderItems,
  cartItems,
  reviews,
  securityLogs,
  courierAssignments,
  courierLocations,
  couriers,
  courierRestaurantAssignments,
  type User,
  type UpsertUser,
  type SecurityLog,
  type InsertSecurityLog,
  type Address,
  type InsertAddress,
  type Restaurant,
  type InsertRestaurant,
  type MenuCategory,
  type InsertMenuCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type Review,
  type InsertReview,
  type CourierAssignment,
  type InsertCourierAssignment,
  type CourierLocation,
  type InsertCourierLocation,
  type Courier,
  type InsertCourier,
  type CourierRestaurantAssignment,
  type InsertCourierRestaurantAssignment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (custom auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { id: string; username: string; email: string; password: string; firstName?: string; lastName?: string; }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Address operations
  getUserAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
  setDefaultAddress(userId: string, addressId: number): Promise<void>;
  getAddress(id: number): Promise<Address | undefined>;

  // Restaurant operations
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;

  // Menu operations
  getMenuCategories(restaurantId: number): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory>;
  deleteMenuCategory(id: number): Promise<void>;

  getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { menuItem: MenuItem; restaurant: Restaurant })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<(Order & { restaurant: Restaurant; address: Address })[]>;
  getRestaurantOrders(restaurantId: number, status?: string): Promise<(Order & { user: User; address: Address; orderItems: (OrderItem & { menuItem: MenuItem })[] })[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPayment(id: number, paymentStatus: string, paymentId?: string): Promise<Order>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getRestaurantReviews(restaurantId: number): Promise<(Review & { user: User })[]>;

  // Security operations
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  getSecurityLogs(userId?: string): Promise<SecurityLog[]>;

  // Courier profile operations
  createCourierProfile(courier: InsertCourier): Promise<Courier>;
  getCourierProfile(userId: string): Promise<Courier | undefined>;
  updateCourierProfile(userId: string, courier: Partial<InsertCourier>): Promise<Courier>;
  getCourierUsers(): Promise<User[]>;
  updateCourierOnlineStatus(userId: string, isOnline: boolean): Promise<Courier>;

  // Courier assignment operations
  assignCourierToRestaurant(courierId: string, restaurantId: number): Promise<CourierAssignment>;
  unassignCourierFromRestaurant(courierId: string, restaurantId: number): Promise<void>;
  getRestaurantCouriers(restaurantId: number): Promise<(CourierAssignment & { courier: User })[]>;
  getCourierAssignments(courierId: string): Promise<(CourierAssignment & { restaurant: Restaurant })[]>;

  // Courier restaurant assignment operations (new system)
  createCourierRestaurantAssignment(assignment: InsertCourierRestaurantAssignment): Promise<CourierRestaurantAssignment>;
  getCourierRestaurantAssignments(courierId: number): Promise<(CourierRestaurantAssignment & { restaurant: Restaurant })[]>;
  getRestaurantCourierAssignments(restaurantId: number): Promise<any[]>;

  // Courier location operations
  updateCourierLocation(courierId: string, latitude: number, longitude: number): Promise<CourierLocation>;
  getCourierLocation(courierId: string): Promise<CourierLocation | undefined>;

  // Enhanced order operations for courier tracking
  getCourierOrders(userId: string): Promise<(Order & { restaurant: Restaurant; orderItems: (OrderItem & { menuItem: MenuItem })[] })[]>;
  assignOrderToCourier(orderId: number, courierId?: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: { id: string; username: string; email: string; password: string; firstName?: string; lastName?: string; }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Address operations
  async getUserAddresses(userId: string): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, id));
    return address;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is set as default, unset other defaults
    if (address.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }

    const [newAddress] = await db
      .insert(addresses)
      .values(address)
      .returning();
    return newAddress;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    if (address.isDefault && address.userId) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }

    const [updatedAddress] = await db
      .update(addresses)
      .set(address)
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  async setDefaultAddress(userId: string, addressId: number): Promise<void> {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));

    await db
      .update(addresses)
      .set({ isDefault: true })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
  }

  // Restaurant operations
  async getRestaurants(): Promise<Restaurant[]> {
    return await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .orderBy(desc(restaurants.rating));
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, ownerId));
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db
      .insert(restaurants)
      .values(restaurant)
      .returning();
    return newRestaurant;
  }

  async updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant> {
    const [updatedRestaurant] = await db
      .update(restaurants)
      .set(restaurant)
      .where(eq(restaurants.id, id))
      .returning();
    return updatedRestaurant;
  }

  // Menu operations
  async getMenuCategories(restaurantId: number): Promise<MenuCategory[]> {
    return await db
      .select()
      .from(menuCategories)
      .where(and(eq(menuCategories.restaurantId, restaurantId), eq(menuCategories.isActive, true)))
      .orderBy(asc(menuCategories.displayOrder), asc(menuCategories.name));
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const [newCategory] = await db
      .insert(menuCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory> {
    const [updatedCategory] = await db
      .update(menuCategories)
      .set(category)
      .where(eq(menuCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteMenuCategory(id: number): Promise<void> {
    await db.delete(menuCategories).where(eq(menuCategories.id, id));
  }

  async getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]> {
    if (categoryId) {
      return await db
        .select()
        .from(menuItems)
        .where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.categoryId, categoryId)))
        .orderBy(desc(menuItems.isPopular), asc(menuItems.name));
    }

    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId))
      .orderBy(desc(menuItems.isPopular), asc(menuItems.name));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db
      .insert(menuItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { menuItem: MenuItem; restaurant: Restaurant })[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        restaurantId: cartItems.restaurantId,
        menuItemId: cartItems.menuItemId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        menuItem: menuItems,
        restaurant: restaurants,
      })
      .from(cartItems)
      .innerJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .innerJoin(restaurants, eq(cartItems.restaurantId, restaurants.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.menuItemId, cartItem.menuItemId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values(cartItem)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();

    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    await db.insert(orderItems).values(orderItemsWithOrderId);

    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: string): Promise<(Order & { restaurant: Restaurant; address: Address })[]> {
    return await db
      .select({
        id: orders.id,
        userId: orders.userId,
        restaurantId: orders.restaurantId,
        addressId: orders.addressId,
        status: orders.status,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        serviceFee: orders.serviceFee,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        iyzico_payment_id: orders.iyzico_payment_id,
        iyzico_conversation_id: orders.iyzico_conversation_id,
        specialInstructions: orders.specialInstructions,
        estimatedDeliveryTime: orders.estimatedDeliveryTime,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        restaurant: restaurants,
        address: addresses,
      })
      .from(orders)
      .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getRestaurantOrders(restaurantId: number, status?: string): Promise<(Order & { user: User; address: Address; orderItems: (OrderItem & { menuItem: MenuItem })[] })[]> {
    const whereConditions = status
      ? and(eq(orders.restaurantId, restaurantId), eq(orders.status, status))
      : eq(orders.restaurantId, restaurantId);

    const ordersData = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        restaurantId: orders.restaurantId,
        addressId: orders.addressId,
        status: orders.status,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        serviceFee: orders.serviceFee,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        iyzico_payment_id: orders.iyzico_payment_id,
        iyzico_conversation_id: orders.iyzico_conversation_id,
        specialInstructions: orders.specialInstructions,
        estimatedDeliveryTime: orders.estimatedDeliveryTime,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        user: users,
        address: addresses,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(whereConditions)
      .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            notes: orderItems.notes,
            menuItem: menuItems,
          })
          .from(orderItems)
          .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderPayment(id: number, paymentStatus: string, paymentId?: string): Promise<Order> {
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date(),
    };

    if (paymentId) {
      updateData.iyzico_payment_id = paymentId;
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();

    // Update restaurant rating
    const [ratingData] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.restaurantId, review.restaurantId));

    await db
      .update(restaurants)
      .set({
        rating: ratingData.avgRating.toFixed(2),
        reviewCount: ratingData.reviewCount,
      })
      .where(eq(restaurants.id, review.restaurantId));

    return newReview;
  }

  async getRestaurantReviews(restaurantId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        restaurantId: reviews.restaurantId,
        orderId: reviews.orderId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: users,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.restaurantId, restaurantId))
      .orderBy(desc(reviews.createdAt));
  }

  // Security operations
  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [newLog] = await db
      .insert(securityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getSecurityLogs(userId?: string): Promise<SecurityLog[]> {
    if (userId) {
      return await db
        .select()
        .from(securityLogs)
        .where(eq(securityLogs.userId, userId))
        .orderBy(desc(securityLogs.createdAt))
        .limit(100);
    }

    return await db
      .select()
      .from(securityLogs)
      .orderBy(desc(securityLogs.createdAt))
      .limit(100);
  }

  // Courier assignment operations
  async assignCourierToRestaurant(courierId: string, restaurantId: number): Promise<CourierAssignment> {
    try {
      // First check if assignment already exists
      const existing = await db
        .select()
        .from(courierAssignments)
        .where(
          and(
            eq(courierAssignments.courierId, courierId),
            eq(courierAssignments.restaurantId, restaurantId)
          )
        );

      if (existing.length > 0) {
        // Update existing assignment
        const [assignment] = await db
          .update(courierAssignments)
          .set({ isActive: true, assignedAt: new Date() })
          .where(
            and(
              eq(courierAssignments.courierId, courierId),
              eq(courierAssignments.restaurantId, restaurantId)
            )
          )
          .returning();
        return assignment;
      } else {
        // Create new assignment
        const [assignment] = await db
          .insert(courierAssignments)
          .values({
            courierId,
            restaurantId,
            isActive: true,
            assignedAt: new Date(),
          })
          .returning();
        return assignment;
      }
    } catch (error) {
      console.error("Database assignment error:", error);
      // Return a mock assignment if database fails
      return {
        id: Date.now(),
        courierId,
        restaurantId,
        isActive: true,
        assignedAt: new Date(),
      };
    }
  }

  async unassignCourierFromRestaurant(courierId: string, restaurantId: number): Promise<void> {
    await db
      .update(courierAssignments)
      .set({ isActive: false })
      .where(
        and(
          eq(courierAssignments.courierId, courierId),
          eq(courierAssignments.restaurantId, restaurantId)
        )
      );
  }

  async getRestaurantCouriers(restaurantId: number): Promise<(CourierAssignment & { courier: User })[]> {
    return await db
      .select({
        id: courierAssignments.id,
        courierId: courierAssignments.courierId,
        restaurantId: courierAssignments.restaurantId,
        isActive: courierAssignments.isActive,
        assignedAt: courierAssignments.assignedAt,
        courier: users,
      })
      .from(courierAssignments)
      .innerJoin(users, eq(courierAssignments.courierId, users.id))
      .where(
        and(
          eq(courierAssignments.restaurantId, restaurantId),
          eq(courierAssignments.isActive, true)
        )
      );
  }

  async getCourierAssignments(courierId: string): Promise<(CourierAssignment & { restaurant: Restaurant })[]> {
    return await db
      .select({
        id: courierAssignments.id,
        courierId: courierAssignments.courierId,
        restaurantId: courierAssignments.restaurantId,
        isActive: courierAssignments.isActive,
        assignedAt: courierAssignments.assignedAt,
        restaurant: restaurants,
      })
      .from(courierAssignments)
      .innerJoin(restaurants, eq(courierAssignments.restaurantId, restaurants.id))
      .where(
        and(
          eq(courierAssignments.courierId, courierId),
          eq(courierAssignments.isActive, true)
        )
      );
  }

  // Courier location operations
  async updateCourierLocation(courierId: string, latitude: number, longitude: number): Promise<CourierLocation> {
    const [location] = await db
      .insert(courierLocations)
      .values({
        courierId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      })
      .onConflictDoUpdate({
        target: courierLocations.courierId,
        set: {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          lastUpdated: new Date(),
        },
      })
      .returning();
    return location;
  }

  async getCourierLocation(courierId: string): Promise<CourierLocation | undefined> {
    const [location] = await db
      .select()
      .from(courierLocations)
      .where(eq(courierLocations.courierId, courierId));
    return location;
  }



  async assignOrderToCourier(orderId: number, courierId?: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: courierId ? 'assigned_to_courier' : 'ready',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  // Get all users who are couriers (based on role field)
  async getCourierUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'courier'));
  }

  // Courier profile operations
  async createCourierProfile(courier: InsertCourier): Promise<Courier> {
    const [newCourier] = await db
      .insert(couriers)
      .values(courier)
      .returning();
    return newCourier;
  }

  async getCourierProfile(userId: string): Promise<Courier | undefined> {
    const [courier] = await db
      .select()
      .from(couriers)
      .where(eq(couriers.userId, userId));
    return courier;
  }

  async updateCourierProfile(userId: string, courier: Partial<InsertCourier>): Promise<Courier> {
    const [updatedCourier] = await db
      .update(couriers)
      .set({
        ...courier,
        updatedAt: new Date(),
      })
      .where(eq(couriers.userId, userId))
      .returning();
    return updatedCourier;
  }

  async updateCourierOnlineStatus(userId: string, isOnline: boolean): Promise<Courier> {
    const [updatedCourier] = await db
      .update(couriers)
      .set({
        isOnline,
        updatedAt: new Date(),
      })
      .where(eq(couriers.userId, userId))
      .returning();
    return updatedCourier;
  }

  // Courier restaurant assignment operations (new system)
  async createCourierRestaurantAssignment(assignment: InsertCourierRestaurantAssignment): Promise<CourierRestaurantAssignment> {
    const [newAssignment] = await db
      .insert(courierRestaurantAssignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async getCourierRestaurantAssignments(courierId: number): Promise<(CourierRestaurantAssignment & { restaurant: Restaurant })[]> {
    return await db
      .select({
        id: courierRestaurantAssignments.id,
        courierId: courierRestaurantAssignments.courierId,
        restaurantId: courierRestaurantAssignments.restaurantId,
        assignedAt: courierRestaurantAssignments.assignedAt,
        isActive: courierRestaurantAssignments.isActive,
        restaurant: restaurants,
      })
      .from(courierRestaurantAssignments)
      .innerJoin(restaurants, eq(courierRestaurantAssignments.restaurantId, restaurants.id))
      .where(
        and(
          eq(courierRestaurantAssignments.courierId, courierId),
          eq(courierRestaurantAssignments.isActive, true)
        )
      );
  }

  async getRestaurantCourierAssignments(restaurantId: number): Promise<any[]> {
    return [];  // Simplified for now
  }

  // Enhanced order operations for courier tracking (updated)
  async getCourierOrders(userId: string): Promise<(Order & { restaurant: Restaurant; orderItems: (OrderItem & { menuItem: MenuItem })[] })[]> {
    // First get the courier profile
    const courierProfile = await this.getCourierProfile(userId);
    if (!courierProfile) {
      return [];
    }

    // Get orders from restaurants assigned to this courier
    const assignments = await this.getCourierRestaurantAssignments(courierProfile.id);
    const restaurantIds = assignments.map(a => a.restaurantId);

    if (restaurantIds.length === 0) {
      return [];
    }

    const ordersData = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        restaurantId: orders.restaurantId,
        addressId: orders.addressId,
        status: orders.status,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        serviceFee: orders.serviceFee,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        iyzico_payment_id: orders.iyzico_payment_id,
        iyzico_conversation_id: orders.iyzico_conversation_id,
        specialInstructions: orders.specialInstructions,
        estimatedDeliveryTime: orders.estimatedDeliveryTime,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        restaurant: restaurants,
      })
      .from(orders)
      .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .where(and(
        sql`${orders.restaurantId} = ANY(${sql`ARRAY[${sql.join(restaurantIds.map(id => sql`${id}`), sql`, `)}]`})`,
        sql`${orders.status} IN ('confirmed', 'preparing', 'ready', 'out_for_delivery')`
      ))
      .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            notes: orderItems.notes,
            menuItem: menuItems,
          })
          .from(orderItems)
          .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }
}

export const storage = new DatabaseStorage();
