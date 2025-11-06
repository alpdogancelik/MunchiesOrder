import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { apiGet } from '@lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import OrderStatus from '@components/OrderStatus';
import { ORDER_STATUS_LABELS } from '@lib/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

export default function OrderTrackingScreen({ route }: Props) {
    const orderId = route.params?.orderId ? Number(route.params.orderId) : null;
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) { setLoading(false); return; }
        apiGet<any>(`/api/orders/${orderId}`)
            .then(setOrder)
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Sipariş Bulunamadı</Text>
                <Text style={styles.subtitle}>Geçersiz ya da silinmiş olabilir.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sipariş Takibi #{order.id}</Text>
            <View style={{ marginTop: 12, alignItems: 'center' }}>
                <OrderStatus status={order.status} />
                <Text style={{ marginTop: 8, fontWeight: '600' }}>{(ORDER_STATUS_LABELS as any)[order.status] || order.status}</Text>
            </View>
            <View style={{ marginTop: 16 }}>
                <Text style={{ color: '#6b7280' }}>Restoran: {order.restaurant?.name || '-'}</Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>Toplam: ₺{Number(order.total).toFixed(2)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { color: '#6b7280', marginTop: 8 },
});
