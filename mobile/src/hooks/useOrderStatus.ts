import { useCallback, useEffect, useRef, useState } from "react";
import { getOrderStatus, PendingOrderStatus } from "@/src/services/order";

type UseOrderStatusResult = {
    status: PendingOrderStatus;
    setStatus: (status: PendingOrderStatus) => void;
    refresh: () => Promise<void>;
};

export function useOrderStatus(orderId: string, intervalMs = 4000): UseOrderStatusResult {
    const [status, setStatus] = useState<PendingOrderStatus>("awaiting_confirmation");
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const latestId = useRef(orderId);

    const fetchStatus = useCallback(async () => {
        if (!latestId.current) return;
        const response = await getOrderStatus(latestId.current);
        setStatus(response.status);
    }, []);

    useEffect(() => {
        latestId.current = orderId;
        if (!orderId) return undefined;

        fetchStatus().catch(() => null);
        pollingRef.current = setInterval(() => {
            fetchStatus().catch(() => null);
        }, intervalMs);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [orderId, intervalMs, fetchStatus]);

    return {
        status,
        setStatus,
        refresh: fetchStatus,
    };
}

export default useOrderStatus;
