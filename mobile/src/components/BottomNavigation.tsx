import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useCart } from '@lib/cart';
import { useEffect, useState } from 'react';
import { apiGet } from '@lib/api';
// Use a broad type for navigation prop to avoid route-specific constraints here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavAny = any;

export default function BottomNavigation({
    navigation,
    current,
}: {
    navigation: NavAny;
    current?: 'home' | 'cart' | 'orders' | 'profile';
}) {
    const { state } = useCart();
    const [serverCount, setServerCount] = useState<number | null>(null);
    const localCount = state.lines.reduce((s, l) => s + l.quantity, 0);

    useEffect(() => {
        // Try server cart for parity; ignore errors when unauthenticated
        apiGet<any[]>('/api/cart')
            .then((items) => setServerCount(items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)))
            .catch(() => setServerCount(null));
    }, []);

    const cartCount = serverCount ?? localCount;

    const Item = ({ label, onPress, active, badge }: { label: string; onPress: () => void; active?: boolean; badge?: number }) => (
        <Pressable onPress={onPress} className="items-center justify-center px-3 py-1.5 relative">
            <Text className={`text-xs ${active ? 'text-orange-600' : 'text-gray-500'}`}>{label}</Text>
            {badge ? (
                <View className="absolute -top-1 -right-1 bg-orange-600 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-[10px] font-semibold">{badge}</Text>
                </View>
            ) : null}
        </Pressable>
    );

    return (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <View className="flex-row items-center justify-around py-2">
                <Item label="Home" active={current === 'home'} onPress={() => navigation.navigate('Home')} />
                <Item label="Cart" active={current === 'cart'} onPress={() => navigation.navigate('Cart')} badge={cartCount || undefined} />
                <Item label="Orders" active={current === 'orders'} onPress={() => navigation.navigate('OrderTracking', { orderId: '' as any })} />
                <Item label="Profile" active={current === 'profile'} onPress={() => navigation.navigate('Profile')} />
            </View>
        </View>
    );
}
