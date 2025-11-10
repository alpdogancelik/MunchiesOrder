import { useCallback, useEffect, useState } from "react";
import { getRestaurantOrders, updateOrderStatus } from "@/lib/appwrite";
import type { RestaurantOrder } from "@/type";
import { subscribeToOrders } from "@/src/lib/realtime";

export const useRestaurantOrders = (restaurantId?: string) => {
    const [orders, setOrders] = useState<RestaurantOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!restaurantId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getRestaurantOrders(restaurantId);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.message || "Unable to fetch orders");
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (!restaurantId) return undefined;
        const unsubscribe = subscribeToOrders("orders:*", (event) => {
            setOrders((prev) => {
                const exists = prev.find((order) => order.id === event.id || order.$id === event.id);
                if (exists) {
                    return prev.map((order) =>
                        order.id === event.id || order.$id === event.id ? { ...order, ...event } : order,
                    );
                }
                return [
                    {
                        ...event,
                        id: event.id,
                        orderItems: event.orderItems ?? [],
                        total: event.total ?? 0,
                        status: event.status ?? "pending",
                    } as RestaurantOrder,
                    ...prev,
                ];
            });
        });
        return unsubscribe;
    }, [restaurantId]);

    const optimisticUpdate = (orderId: string, status: string) => {
        setOrders((prev) =>
            prev.map((order) =>
                String(order.id ?? order.$id) === orderId ? { ...order, status } : order,
            ),
        );
    };

    const mutateStatus = async (orderId: string, status: string) => {
        optimisticUpdate(orderId, status);
        try {
            await updateOrderStatus(orderId, status);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update order");
            fetchOrders();
        }
    };

    return {
        orders,
        loading,
        error,
        refetch: fetchOrders,
        setOrders,
        mutateStatus,
    };
};

export default useRestaurantOrders;
