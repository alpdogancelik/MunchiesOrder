import React from 'react';
import { View, Text } from 'react-native';

type Props = {
    title?: string;
    price?: number;
    quantity?: number;
};

export default function CartItem({ title = 'Ürün', price = 0, quantity = 1 }: Props) {
    return (
        <View style={{ padding: 12 }}>
            <Text>{title}</Text>
            <Text>{quantity} x {price}₺</Text>
        </View>
    );
}
