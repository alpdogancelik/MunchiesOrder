import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '@lib/supabase';
import { apiGet } from '@lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Restaurant } from '../../../shared/schema';
import RestaurantCard from '@components/RestaurantCard';
import BottomNavigation from '@components/BottomNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [items, setItems] = useState<Restaurant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('All');

    const filters = ['All', 'Pizza', 'Burger', 'Turkish', 'Dessert', 'Coffee'];

    useEffect(() => {
        let mounted = true;
        // Example fetch: adapt to your actual table or API endpoint
        // Prefer server API (same as web) for parity; fall back to Supabase if it fails
        apiGet<Restaurant[]>('/api/restaurants')
            .then((data) => {
                if (!mounted) return;
                setItems((data as unknown[]) as Restaurant[]);
            })
            .catch(() => {
                supabase
                    .from('restaurants')
                    .select('*')
                    .limit(20)
                    .then(({ data, error }) => {
                        if (!mounted) return;
                        if (error) console.warn(error.message);
                        if (data) setItems(data as unknown as Restaurant[]);
                    });
            });
        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return items.filter((r) => {
            const cuisine = ((r as any).cuisine || '').toString().toLowerCase();
            const name = (r.name || '').toString().toLowerCase();
            const desc = ((r as any).description || '').toString().toLowerCase();
            const matchesFilter = selectedFilter === 'All' || cuisine === selectedFilter.toLowerCase();
            const matchesQuery = !q || name.includes(q) || desc.includes(q) || cuisine.includes(q);
            return matchesFilter && matchesQuery;
        });
    }, [items, searchQuery, selectedFilter]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: '700' }}>M</Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>Good day,</Text>
                        <Text style={styles.title}>Student</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
                        <Text>⚙️</Text>
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => supabase.auth.signOut()}>
                        <Text>🚪</Text>
                    </Pressable>
                </View>
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 16 }}>
                <View style={{ backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                    <TextInput
                        placeholder="Search restaurants or dishes..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
                {filters.map((f) => (
                    <Pressable key={f} onPress={() => setSelectedFilter(f)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, backgroundColor: selectedFilter === f ? '#111827' : '#f3f4f6' }}>
                        <Text style={{ color: selectedFilter === f ? 'white' : '#374151', fontWeight: '600' }}>{f}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Promo */}
            <View style={{ paddingHorizontal: 16 }}>
                <View style={{ backgroundColor: '#ff6b00', borderRadius: 16, padding: 16 }}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Student Discount</Text>
                    <Text style={{ color: 'white', opacity: 0.9 }}>20% off your first order</Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
                renderItem={({ item }) => (
                    <RestaurantCard
                        restaurant={{
                            id: Number(item.id),
                            name: item.name,
                            description: (item as any).description,
                            imageUrl: (item as any).imageUrl,
                            rating: (item as any).rating,
                            deliveryTime: (item as any).deliveryTime ?? '30-40m',
                            deliveryFee: (item as any).deliveryFee ?? '0',
                            cuisine: (item as any).cuisine,
                        }}
                        onPress={() => navigation.navigate('Restaurant', { id: String(item.id) })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Hiç öğe yok. Supabase bağlantısını yapılandırın.</Text>
                    </View>
                }
            />

            <BottomNavigation navigation={navigation} current="home" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { color: '#6b7280' },
    iconBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
    logoutBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#111827' },
    logoutText: { color: '#111827', fontWeight: '600' },
    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyText: { color: '#6b7280' },
});
