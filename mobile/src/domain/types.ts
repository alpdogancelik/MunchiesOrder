export type PaymentMethod = "cash" | "pos";

export type OrderStatus =
    | "pending"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "canceled";

export type Address = {
    id: string;
    label: string;
    line1: string;
    block?: string;
    room?: string;
    city: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
};

export type Restaurant = {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
};

export type MenuItem = {
    id: string;
    restaurantId: string;
    name: string;
    description?: string;
    price: number;
    etaMinutes?: number;
    visible: boolean;
};

export type CartItem = {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    customizations?: { id: string; name: string; price: number }[];
};

export type Order = {
    id: string;
    userId: string;
    restaurantId: string;
    items: CartItem[];
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    tip: number;
    total: number;
    etaMinutes?: number;
    createdAt: string;
    updatedAt: string;
};

export type Review = {
    id: string;
    productId: string;
    userId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    createdAt: string;
};
