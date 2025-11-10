export type OrderEvent = {
    id: string;
    status?: string;
    total?: number;
    restaurant?: { name?: string };
    orderItems?: { name?: string; quantity?: number }[];
    createdAt?: string;
};

type Handler = (payload: OrderEvent) => void;

const listeners = new Map<string, Set<Handler>>();
let feedStarted = false;

const randomItem = () => {
    const meals = ["Classic Burger", "Falafel Bowl", "Veggie Wrap", "Halloumi Wrap"];
    return meals[Math.floor(Math.random() * meals.length)];
};

const generateMockOrder = (): OrderEvent => ({
    id: String(Date.now()),
    status: "pending",
    restaurant: { name: "Campus Burger" },
    total: 99 + Math.round(Math.random() * 60),
    orderItems: [
        { name: randomItem(), quantity: 1 },
        { name: randomItem(), quantity: 1 },
    ],
    createdAt: new Date().toISOString(),
});

const startMockFeed = () => {
    if (feedStarted) return;
    feedStarted = true;
    setInterval(() => {
        const event = generateMockOrder();
        emitOrderEvent("orders:*", event);
        emitOrderEvent("order_state_changed", event);
    }, 20000);
};

export const subscribeToOrders = (channel: string, handler: Handler) => {
    if (!listeners.has(channel)) listeners.set(channel, new Set());
    listeners.get(channel)!.add(handler);
    startMockFeed();
    return () => {
        listeners.get(channel)?.delete(handler);
    };
};

export const emitOrderEvent = (channel: string, payload: OrderEvent) => {
    const dispatch = (name: string) => {
        listeners.get(name)?.forEach((handler) => handler(payload));
    };
    dispatch(channel);
    if (channel !== "orders:*") {
        dispatch("orders:*");
    }
};
