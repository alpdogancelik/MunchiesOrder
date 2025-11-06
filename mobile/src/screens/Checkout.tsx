import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiRequest } from '@lib/api';
import { SERVICE_FEE } from '@lib/constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
    const [cart, setCart] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [addressId, setAddressId] = useState<number | null>(null);
    const [method, setMethod] = useState<'card' | 'cash' | 'card_at_door'>('cash');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        let mounted = true;
        Promise.all([
            apiGet<any[]>('/api/cart').catch(() => []),
            apiGet<any[]>('/api/addresses').catch(() => []),
        ]).then(([c, a]) => {
            if (!mounted) return;
            setCart(c);
            setAddresses(a);
            setAddressId(a?.[0]?.id ?? null);
        }).finally(() => setLoading(false));
        return () => { mounted = false; };
    }, []);

    const subtotal = useMemo(() => cart.reduce((s, it) => s + Number(it.menuItem.price) * Number(it.quantity), 0), [cart]);
    const deliveryFee = 5;
    const total = subtotal + deliveryFee + SERVICE_FEE;

    const placeOrder = async () => {
        if (!addressId) return;
        try {
            setPlacing(true);
            const items = cart.map((it) => ({ menuItemId: it.menuItemId, quantity: it.quantity, price: it.menuItem.price, name: it.menuItem.name }));
            const orderData = {
                addressId,
                paymentMethod: method === 'card' ? 'iyzico' : method,
                total,
                items,
            };
            const res = await apiRequest('POST', '/api/orders', { orderData, orderItems: items });
            const order = await res.json();
            if (method === 'cash' || method === 'card_at_door') {
                navigation.replace('OrderTracking', { orderId: String(order.id) });
            } else {
                navigation.navigate('Checkout');
            }
        } catch (e) {
            // basit hata gösterimi
            console.warn(e);
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Ödeme</Text>
            <Text style={styles.section}>Adres Seçimi</Text>
            <Pressable onPress={() => navigation.navigate('Addresses')} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                <Text style={{ color: '#2563eb', fontWeight: '600' }}>Adresleri Yönet</Text>
            </Pressable>
            <View style={{ gap: 8 }}>
                {addresses.map((a) => (
                    <Pressable key={a.id} onPress={() => setAddressId(a.id)} style={[styles.addr, addressId === a.id && styles.addrActive]}>
                        <Text style={{ fontWeight: '600' }}>{a.title}</Text>
                        <Text style={{ color: '#6b7280' }}>{a.address || a.addressLine1}</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.section}>Ödeme Yöntemi</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                    { key: 'card', label: 'Kart (iyzico)' },
                    { key: 'cash', label: 'Nakit' },
                    { key: 'card_at_door', label: 'Kapıda Kart' },
                ].map((m) => (
                    <Pressable key={m.key} onPress={() => setMethod(m.key as any)} style={[styles.method, method === m.key && styles.methodActive]}>
                        <Text style={{ color: method === m.key ? 'white' : '#111827' }}>{m.label}</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.section}>Özet</Text>
            <View style={styles.box}>
                {cart.map((it) => (
                    <View key={it.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text>{it.quantity}x {it.menuItem.name}</Text>
                        <Text>{(Number(it.menuItem.price) * Number(it.quantity)).toFixed(2)} ₺</Text>
                    </View>
                ))}
                <View style={styles.row}><Text>Ara Toplam</Text><Text>{subtotal.toFixed(2)} ₺</Text></View>
                <View style={styles.row}><Text>Kurye</Text><Text>{deliveryFee.toFixed(2)} ₺</Text></View>
                <View style={styles.row}><Text>Servis</Text><Text>{SERVICE_FEE.toFixed(2)} ₺</Text></View>
                <View style={[styles.row, { marginTop: 8 }]}><Text style={{ fontWeight: '700' }}>Toplam</Text><Text style={{ fontWeight: '700' }}>{total.toFixed(2)} ₺</Text></View>
            </View>

            <Pressable disabled={placing || !addressId} onPress={placeOrder} style={[styles.placeBtn, (!addressId || placing) && { opacity: 0.6 }]}>
                <Text style={styles.placeBtnText}>{placing ? 'Gönderiliyor…' : `Siparişi Ver (${total.toFixed(2)} ₺)`}</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 12 },
    title: { fontSize: 22, fontWeight: '700' },
    section: { marginTop: 16, fontWeight: '700' },
    addr: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    addrActive: { backgroundColor: '#ffedd5', borderColor: '#fdba74' },
    method: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
    methodActive: { backgroundColor: '#111827', borderColor: '#111827' },
    box: { padding: 12, borderRadius: 12, backgroundColor: '#f9fafb' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    placeBtn: { marginTop: 16, backgroundColor: '#111827', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
    placeBtnText: { color: 'white', fontWeight: '700' },
});
