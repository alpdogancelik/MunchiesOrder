import React from 'react';
import MapView, { Polyline } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

export default function LiveMap() {
    return (
        <View style={styles.container}>
            <MapView style={StyleSheet.absoluteFill}>
                {/* TODO: Draw courier route when available */}
                <Polyline coordinates={[]} strokeWidth={4} strokeColor="#ff0000" />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 240, width: '100%', overflow: 'hidden', borderRadius: 8 },
});
