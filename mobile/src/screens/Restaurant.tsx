import { View, Text, StyleSheet, FlatList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import type { MenuItem } from '@shared/schema';
import { useCart } from '@lib/cart';
import { apiGet, apiRequest } from '@lib/api';
import MenuItemCard from '@components/MenuItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

export default function RestaurantScreen({ route }: Props) {
    const { id } = route.params || {};
    const [name, setName] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [items, setItems] = useState<MenuItem[]>([]);
    const { add } = useCart();

    useEffect(() => {
        if (!id) return;
        // Try API first for parity with web; fallback to Supabase
        apiGet<any>(`/api/restaurants/${id}`)
            .then((r) => {
                setName(r?.name ?? 'Restoran');
                setDesc(r?.description ?? '');
            })
            .catch(() => {
                supabase.from('restaurants').select('*').eq('id', id).single().then(({ data }) => {
                    if (data) {
                        setName((data as any).name ?? 'Restoran');
                        setDesc((data as any).description ?? '');
                    }
                });
            });
        apiGet<MenuItem[]>(`/api/restaurants/${id}/menu`)
            .then((list) => setItems(list as unknown as MenuItem[]))
            .catch(() => {
                supabase.from('menu_items').select('*').eq('restaurant_id', id).then(({ data }) => {
                    if (data) setItems(data as unknown as MenuItem[]);
                });
            });
    }, [id]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{name || 'Restoran'}</Text>
            <Text style={styles.subtitle}>{desc || 'Restoran detayları ve menü burada listelenecek.'}</Text>
            <FlatList
                style={{ marginTop: 16 }}
                data={items}
                keyExtractor={(m) => String(m.id)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                    <MenuItemCard
                        item={{
                            id: Number(item.id),
                            name: item.name,
                            description: item.description || undefined,
                            price: String(item.price),
                            imageUrl: (item as any).imageUrl,
                            isAvailable: true,
                            isPopular: Boolean((item as any).isPopular),
                        }}
                        onAddToCart={async () => {
                            // Attempt server cart first; if 401 or failure, fall back to local cart
                            try {
                                await apiRequest('POST', '/api/cart', {
                                    restaurantId: Number((item as any).restaurantId || (item as any).restaurant_id || id),
                                    menuItemId: Number(item.id),
                                    quantity: 1,
                                });
                            } catch (e) {
                                // Local cart fallback (dev)
                                add({ id: Number(item.id), name: item.name, price: item.price as any, restaurantId: Number((item as any).restaurantId || id) });
                            }
                        }}
                    />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Bu restoran için menü bulunamadı.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { color: '#6b7280', marginTop: 8 },
    emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
});
