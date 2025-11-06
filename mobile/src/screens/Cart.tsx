import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useCart } from '@lib/cart';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiRequest } from '@lib/api';
import { SERVICE_FEE } from '@lib/constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
    // Server cart (web-parity) + local fallback
    const { state, remove, clear, total } = useCart();
    const [serverItems, setServerItems] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        let mounted = true;
        apiGet<any[]>('/api/cart')
            .then((items) => {
                if (!mounted) return;
                setServerItems(items);
            })
            .catch(() => setServerItems(null))
            .finally(() => setLoading(false));
        return () => { mounted = false; };
    }, []);

    const list = serverItems ?? state.lines.map((l) => ({ id: l.item.id, quantity: l.quantity, menuItem: { name: l.item.name, price: l.item.price } }));
    const subtotal = useMemo(() => (serverItems
        ? serverItems.reduce((s, it) => s + Number(it.menuItem.price) * Number(it.quantity), 0)
        : total
    ), [serverItems, total]);
    const deliveryFee = 5;
    const calculatedTotal = subtotal + deliveryFee + SERVICE_FEE;

    const onClear = async () => {
        if (serverItems) {
            try {
                setClearing(true);
                await apiRequest('DELETE', '/api/cart');
                setServerItems([]);
            } catch {
                // fall back
                clear();
            } finally {
                setClearing(false);
            }
        } else {
            clear();
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
        <View style={styles.container}>
            <Text style={styles.title}>Sepet</Text>
            <FlatList
                style={{ marginTop: 16 }}
                data={list}
                keyExtractor={(l) => String(l.id)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                    <View style={styles.line}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.lineTitle}>
                                {item.menuItem?.name} x{item.quantity}
                            </Text>
                            <Text style={styles.linePrice}>
                                {(Number(item.menuItem?.price) * Number(item.quantity)).toFixed(2)} ₺
                            </Text>
                        </View>
                        {!serverItems && (
                            <Pressable onPress={() => remove(Number(item.id))} style={styles.removeBtn}>
                                <Text style={styles.removeText}>Kaldır</Text>
                            </Pressable>
                        )}
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Sepetiniz boş.</Text>}
            />
            <View style={styles.footer}>
                <View>
                    <Text style={styles.total}>Toplam: {calculatedTotal.toFixed(2)} ₺</Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>Alt toplam {subtotal.toFixed(2)} ₺ • Kurye {deliveryFee.toFixed(2)} ₺ • Servis {SERVICE_FEE.toFixed(2)} ₺</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={onClear} disabled={clearing} style={styles.clearBtn}>
                        <Text style={styles.clearText}>{clearing ? '...' : 'Temizle'}</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('Checkout')} style={[styles.clearBtn, { backgroundColor: '#ff6b00' }]}>
                        <Text style={styles.clearText}>Ödeme</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { color: '#6b7280', marginTop: 8 },
    line: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f3f4f6', borderRadius: 12 },
    lineTitle: { fontWeight: '600' },
    linePrice: { color: '#374151', marginTop: 4 },
    removeBtn: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#111827', borderRadius: 8 },
    removeText: { color: '#111827', fontWeight: '600' },
    empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
    footer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    total: { fontWeight: '700', fontSize: 16 },
    clearBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#111827', borderRadius: 8 },
    clearText: { color: '#fff', fontWeight: '600' },
});
