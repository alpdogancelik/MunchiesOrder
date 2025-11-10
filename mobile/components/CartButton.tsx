import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";

const CartButton = () => {
    const { getTotalItems } = useCartStore();
    const totalItems = getTotalItems();
    const router = useRouter();

    return (
        <TouchableOpacity className="cart-btn" onPress={() => router.push("/cart")}>
            <Image source={images.bag} className="size-5" resizeMode="contain" />

            {totalItems > 0 && (
                <View className="cart-badge">
                    <Text className="small-bold text-white">{totalItems}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}
export default CartButton
