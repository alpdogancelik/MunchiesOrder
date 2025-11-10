import { memo, useCallback } from 'react';
import { Text, TouchableOpacity, Platform, View } from 'react-native';
import { Image } from 'expo-image';
import { appwriteConfig } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";

type MenuCardProps = {
    item: any;
    onPress?: () => void;
};

const MenuCard = ({ item, onPress }: MenuCardProps) => {
    const { $id, image_url, name, price } = item || {};
    const imageUrl = image_url
        ? image_url.startsWith("http")
            ? image_url
            : `${image_url}?project=${appwriteConfig.projectId}`
        : undefined;
    const { addItem } = useCartStore();
    const numericPrice = Number(price || 0);

    const handleAdd = useCallback(() => {
        addItem({
            id: $id || `menu-${Date.now()}`,
            name: name || "Menu Item",
            price: numericPrice || 0,
            image_url: imageUrl || '',
            customizations: [],
        });
    }, [$id, addItem, imageUrl, name, numericPrice]);

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={onPress ?? (() => { })}
            className="menu-card"
            style={Platform.OS === 'android' ? { elevation: 6, shadowColor: '#0F172A' } : {}}
        >
            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-2">
                    <Text className="body-medium uppercase text-dark-60 tracking-[2px]">chef's pick</Text>
                    <Text className="text-2xl font-quicksand-bold text-dark-100" numberOfLines={2}>{name}</Text>
                    <Text className="paragraph-semibold text-primary-dark">TRY {numericPrice.toFixed(2)}</Text>
                </View>
                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        className="h-24 w-24 -mr-3 -mt-4"
                        contentFit="cover"
                        transition={300}
                    />
                )}
            </View>

            <View className="mt-5 flex-row items-center justify-between">
                <View className="chip bg-primary/10 border-transparent">
                    <Text className="body-medium text-primary-dark">15-25 min</Text>
                </View>
                <TouchableOpacity
                    onPress={handleAdd}
                    className="px-4 py-2 rounded-full bg-dark-100"
                >
                    <Text className="paragraph-semibold text-white">Add to bag</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default memo(MenuCard);
