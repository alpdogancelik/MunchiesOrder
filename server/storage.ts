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
  type User,
  type UpsertUser,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Address operations
  getUserAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
  setDefaultAddress(userId: string, addressId: number): Promise<void>;

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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
    let query = db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId));

    if (categoryId) {
      query = query.where(eq(menuItems.categoryId, categoryId));
    }

    return await query.orderBy(desc(menuItems.isPopular), asc(menuItems.name));
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
    let query = db
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
      .where(eq(orders.restaurantId, restaurantId));

    if (status) {
      query = query.where(eq(orders.status, status));
    }

    const ordersData = await query.orderBy(desc(orders.createdAt));

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
}

export const storage = new DatabaseStorage();
