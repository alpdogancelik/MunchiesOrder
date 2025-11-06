import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export type MenuItemProps = {
    item: {
        id: number;
        name: string;
        description?: string;
        price: string | number;
        imageUrl?: string;
        isAvailable: boolean;
        isPopular: boolean;
    };
    onAddToCart: () => void;
    isLoading?: boolean;
};

export default function MenuItem({ item, onAddToCart, isLoading }: MenuItemProps) {
    return (
        <View className="bg-white rounded-2xl shadow-sm p-4">
            <View className="flex-row gap-4">
                <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden items-center justify-center">
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} className="w-20 h-20" resizeMode="cover" />
                    ) : (
                        <Text className="text-gray-400">🍽️</Text>
                    )}
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                            <Text className="font-semibold text-gray-900">{item.name}</Text>
                            {item.isPopular ? (
                                <View className="px-2 py-0.5 rounded-full bg-emerald-100">
                                    <Text className="text-emerald-700 text-xs">Popular</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                    {item.description ? (
                        <Text numberOfLines={2} className="text-gray-600 text-sm mb-2">
                            {item.description}
                        </Text>
                    ) : null}
                    <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-primary text-lg">₺{Number(item.price).toFixed(2)}</Text>
                        <Pressable
                            onPress={onAddToCart}
                            disabled={!item.isAvailable || !!isLoading}
                            className={`${!item.isAvailable ? 'bg-gray-300' : 'bg-black'} px-4 py-2 rounded-xl`}
                        >
                            <Text className={`${!item.isAvailable ? 'text-gray-500' : 'text-white'} font-medium`}>
                                {isLoading ? '...' : !item.isAvailable ? 'Unavailable' : 'Add'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}
