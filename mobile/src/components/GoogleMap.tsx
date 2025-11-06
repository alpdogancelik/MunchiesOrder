import React from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

type Props = {
    region?: Region;
};

export default function GoogleMap({ region }: Props) {
    const defaultRegion: Region = region ?? {
        latitude: 41.015137,
        longitude: 28.97953,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };
    return (
        <View style={styles.container}>
            <MapView style={StyleSheet.absoluteFill} initialRegion={defaultRegion}>
                <Marker coordinate={defaultRegion} />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 200, width: '100%', overflow: 'hidden', borderRadius: 8 },
});
