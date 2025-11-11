import { useCallback, useEffect, useRef, useState } from "react";
import { listenToOrder } from "@/lib/firebaseAuth";
import { getOrder } from "@/src/api/client";
import type { Order } from "@/src/domain/types";

type OrderRealtimePayload = {
    order: Order;
    event: "order_state_changed" | "order_auto_canceled";
};

export const useOrderRealtime = (orderId?: string) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchOrder = useCallback(async () => {
        if (!orderId) return;
        try {
            const data = await getOrder(orderId);
            setOrder(data);
        } catch (err: any) {
            setError(err?.message || "Unable to fetch order");
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(fetchOrder, 4000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchOrder]);

    useEffect(() => {
        if (!orderId) return undefined;
        const unsubscribe = listenToOrder(
            orderId,
            (next) => {
                if (!next) return;
                setOrder((prev) => ({ ...(prev ?? {}) as Order, ...next }));
            },
            (err) => setError(err?.message || "Unable to subscribe to order updates"),
        );
        return unsubscribe;
    }, [orderId]);

    return { order, error, refetch: fetchOrder };
};

export default useOrderRealtime;
