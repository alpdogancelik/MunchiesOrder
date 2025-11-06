import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = { url: string };

export default function PaymentWebview({ url }: Props) {
    return (
        <View style={{ flex: 1 }}>
            <WebView source={{ uri: url }} startInLoadingState renderLoading={() => <ActivityIndicator />} />
        </View>
    );
}
