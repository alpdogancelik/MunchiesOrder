export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
} as const;

export const PAYMENT_METHODS = {
    POS: 'pos',
    CASH: 'cash',
} as const;

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'yellow',
    [ORDER_STATUS.CONFIRMED]: 'blue',
    [ORDER_STATUS.PREPARING]: 'yellow',
    [ORDER_STATUS.READY]: 'blue',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'purple',
    [ORDER_STATUS.DELIVERED]: 'green',
    [ORDER_STATUS.CANCELLED]: 'red',
} as const;

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Order Pending',
    [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
    [ORDER_STATUS.PREPARING]: 'Being Prepared',
    [ORDER_STATUS.READY]: 'Ready for Pickup',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const CUISINE_TYPES = [
    'Italian',
    'Turkish',
    'American',
    'Chinese',
    'Indian',
    'Mexican',
    'Mediterranean',
    'Fast Food',
    'Pizza',
    'Burger',
    'Kebab',
    'Dessert',
    'Coffee',
    'Healthy',
] as const;

export const SERVICE_FEE = 2;
export const FREE_DELIVERY_THRESHOLD = 50;
