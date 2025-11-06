import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import LiveMap from '@components/LiveMap';

export default function CourierTracking() {
    return (
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
            <Text>Courier Tracking</Text>
            <View style={{ marginTop: 12 }}>
                <LiveMap />
            </View>
        </SafeAreaView>
    );
}
