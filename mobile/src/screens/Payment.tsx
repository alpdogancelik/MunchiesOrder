import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function Payment() {
    return (
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
            <Text>Ödeme</Text>
        </SafeAreaView>
    );
}
