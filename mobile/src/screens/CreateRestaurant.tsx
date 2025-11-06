import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function CreateRestaurant() {
    return (
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
            <Text>Create Restaurant</Text>
        </SafeAreaView>
    );
}
