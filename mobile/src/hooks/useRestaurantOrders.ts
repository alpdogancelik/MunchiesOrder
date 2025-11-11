import { useCallback, useEffect, useState } from "react";
import { getRestaurantOrders, listenToOrders, updateOrderStatus } from "@/lib/firebaseAuth";
import type { RestaurantOrder } from "@/type";

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
        const unsubscribe = listenToOrders(
            { restaurantId },
            (incoming) => {
                setOrders(Array.isArray(incoming) ? (incoming as RestaurantOrder[]) : []);
            },
            (err) => {
                setError(err?.message || "Unable to fetch orders");
            },
        );
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
