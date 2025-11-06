import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export type RestaurantCardProps = {
    restaurant: {
        id: number;
        name: string;
        cuisine?: string;
        description?: string;
        imageUrl?: string;
        rating?: string | number;
        reviewCount?: number;
        deliveryTime?: string;
        deliveryFee?: string | number;
        isActive?: boolean;
    };
    onPress?: () => void;
};

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
    const deliveryFeeText = Number(restaurant.deliveryFee ?? 0) === 0
        ? 'Free delivery'
        : `₺${restaurant.deliveryFee} delivery`;

    return (
        <Pressable onPress={onPress} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <View className="w-full h-48 bg-gray-200">
                {restaurant.imageUrl ? (
                    <Image source={{ uri: restaurant.imageUrl }} className="w-full h-48" resizeMode="cover" />
                ) : (
                    <View className="w-full h-48 items-center justify-center">
                        <Text className="text-4xl text-gray-400">🏬</Text>
                    </View>
                )}
            </View>
            <View className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold text-gray-900">{restaurant.name}</Text>
                    {restaurant.rating && Number(restaurant.rating) > 0 ? (
                        <View className="px-2 py-1 rounded-full bg-emerald-100">
                            <Text className="text-emerald-700">⭐ {Number(restaurant.rating).toFixed(1)}</Text>
                        </View>
                    ) : null}
                </View>
                <Text className="text-gray-600 text-sm mb-3">
                    {restaurant.cuisine ? `${restaurant.cuisine} • ` : ''}
                    {restaurant.description || 'Delicious food'}
                </Text>
                <View className="flex-row items-center justify-between">
                    <Text className="text-gray-500">⏱️ {restaurant.deliveryTime || '30-40m'}</Text>
                    <Text className="text-gray-500">🏍️ {deliveryFeeText}</Text>
                </View>
            </View>
        </Pressable>
    );
}
