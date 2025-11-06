import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
    url: string;
};

export default function PaymentWebview({ url }: Props) {
    const ref = useRef<WebView>(null);

    useEffect(() => {
        // You can add message listeners here for postMessage callbacks
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={ref}
                source={{ uri: url }}
                startInLoadingState
                renderLoading={() => (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator />
                    </View>
                )}
            />
        </View>
    );
}
