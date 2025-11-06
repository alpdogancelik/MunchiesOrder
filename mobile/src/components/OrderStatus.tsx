import React from 'react';
import { Text, View } from 'react-native';

export type OrderStatusSize = 'sm' | 'md' | 'lg';

export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
} as const;

export default function OrderStatus({ status, size = 'md' }: { status: string; size?: OrderStatusSize }) {
    const icon = (() => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return '⏰';
            case ORDER_STATUS.CONFIRMED:
                return '✅';
            case ORDER_STATUS.PREPARING:
                return '🍽️';
            case ORDER_STATUS.READY:
                return '📦';
            case ORDER_STATUS.OUT_FOR_DELIVERY:
                return '🏍️';
            case ORDER_STATUS.DELIVERED:
                return '🏠';
            case ORDER_STATUS.CANCELLED:
                return '❌';
            default:
                return '❓';
        }
    })();

    const color = (() => {
        switch (status) {
            case ORDER_STATUS.PREPARING:
            case ORDER_STATUS.PENDING:
                return 'bg-yellow-100';
            case ORDER_STATUS.CONFIRMED:
            case ORDER_STATUS.READY:
                return 'bg-blue-100';
            case ORDER_STATUS.OUT_FOR_DELIVERY:
                return 'bg-purple-100';
            case ORDER_STATUS.DELIVERED:
                return 'bg-green-100';
            case ORDER_STATUS.CANCELLED:
                return 'bg-red-100';
            default:
                return 'bg-gray-100';
        }
    })();

    const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
    const fontSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-4xl' : 'text-2xl';

    const pulse = status === ORDER_STATUS.PREPARING || status === ORDER_STATUS.OUT_FOR_DELIVERY;

    return (
        <View className={`rounded-full items-center justify-center ${color} ${sizeClass} ${pulse ? 'animate-pulse' : ''}`}>
            <Text className={`${fontSize}`}>{icon}</Text>
        </View>
    );
}
