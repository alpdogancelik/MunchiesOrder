import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { images } from "@/constants";

type Restaurant = {
    id: number;
    name: string;
    cuisine?: string;
    rating?: number;
    reviewCount?: number;
    deliveryTime?: string;
    deliveryFee?: string;
    imageUrl?: string;
};

interface Props {
    restaurant: Restaurant;
    onPress?: () => void;
}

const formatCurrency = (value?: string | number) => {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) return "TRY 0.00";
    return `TRY ${amount.toFixed(2)}`;
};

const RestaurantCard = ({ restaurant, onPress }: Props) => {
    const {
        name,
        cuisine,
        rating,
        reviewCount,
        deliveryTime,
        deliveryFee,
        imageUrl,
    } = restaurant;
    const badgeText = rating ? `${Number(rating).toFixed(1)}` : "New";

    return (
        <TouchableOpacity activeOpacity={0.9} className="restaurant-card" onPress={onPress}>
            <View className="w-28 h-28 rounded-3xl overflow-hidden bg-primary/10">
                <Image
                    source={imageUrl ? { uri: imageUrl } : images.logo}
                    className="w-full h-full"
                    contentFit="cover"
                    transition={300}
                />
            </View>
            <View className="flex-1 gap-2">
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-lg font-quicksand-bold text-dark-100 flex-1" numberOfLines={1}>
                        {name}
                    </Text>
                    <View className="rating-pill">
                        <Image source={images.star} className="size-3.5 mr-1" contentFit="contain" tintColor="#FFB703" />
                        <Text className="paragraph-semibold text-dark-100">{badgeText}</Text>
                    </View>
                </View>
                <Text className="body-medium">{cuisine || "World Kitchen"}</Text>
                <View className="flex-row flex-wrap gap-2">
                    {deliveryTime && (
                        <View className="info-chip">
                            <Image source={images.clock} className="size-3.5" contentFit="contain" tintColor="#FF8C42" />
                            <Text className="body-medium text-dark-80">{deliveryTime} min</Text>
                        </View>
                    )}
                    {deliveryFee && (
                        <View className="info-chip">
                            <Image source={images.dollar} className="size-3.5" contentFit="contain" tintColor="#FF8C42" />
                            <Text className="body-medium text-dark-80">{`${formatCurrency(deliveryFee)} fee`}</Text>
                        </View>
                    )}
                    {reviewCount !== undefined && (
                        <View className="info-chip">
                            <Image source={images.person} className="size-3.5" contentFit="contain" tintColor="#FF8C42" />
                            <Text className="body-medium text-dark-80">{reviewCount} reviews</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default memo(RestaurantCard);
