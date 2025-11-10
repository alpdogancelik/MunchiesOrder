import { describe, expect, it } from "vitest";
import { transitionOrderStatus, canTransition } from "../src/domain/orderMachine";
import type { Order } from "../src/domain/types";

const createOrder = (status: Order["status"]): Order => ({
    id: "order-1",
    userId: "user-1",
    restaurantId: "rest-1",
    items: [
        {
            menuItemId: "m-1",
            name: "Sample",
            quantity: 1,
            price: 10,
        },
    ],
    status,
    paymentMethod: "cash",
    subtotal: 10,
    deliveryFee: 0,
    serviceFee: 0,
    discount: 0,
    tip: 0,
    total: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

describe("Order state machine", () => {
    it("allows linear happy path", () => {
        const statuses: Order["status"][] = [
            "pending",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
        ];
        let order = createOrder("pending");
        statuses.slice(1).forEach((next) => {
            expect(() => {
                order = transitionOrderStatus(order, next);
            }).not.toThrow();
            expect(order.status).toBe(next);
        });
    });

    it("prevents skipping steps", () => {
        const order = createOrder("pending");
        expect(canTransition(order, "ready")).toBe(false);
        expect(() => transitionOrderStatus(order, "ready")).toThrow();
    });

    it("disallows returning from terminal states", () => {
        const delivered = createOrder("delivered");
        expect(canTransition(delivered, "preparing")).toBe(false);
        expect(() => transitionOrderStatus(delivered, "preparing")).toThrow();
    });

    it("guards require out_for_delivery before delivered", () => {
        const ready = createOrder("ready");
        expect(canTransition(ready, "delivered")).toBe(false);
    });
});
