import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressForm, { Address as AddressFormValues } from '@components/AddressForm';
import { apiGet, apiRequest } from '@lib/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Addresses'>;

type Address = {
    id?: number;
    title: string;
    addressLine1: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    isDefault?: boolean;
};

const STORAGE_KEY = 'munchies.addresses';

export default function AddressesScreen({ navigation }: Props) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'list' | 'form'>('list');
    const [editing, setEditing] = useState<Address | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiGet<Address[]>('/api/addresses');
                if (!mounted) return;
                setAddresses(res);
            } catch (e) {
                // fallback to local storage when unauthenticated
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                const local: Address[] = raw ? JSON.parse(raw) : [];
                if (!mounted) return;
                setAddresses(local);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const persistLocal = async (next: Address[]) => {
        setAddresses(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const addNew = () => {
        setEditing(null);
        setMode('form');
    };

    const editOne = (addr: Address) => {
        setEditing(addr);
        setMode('form');
    };

    const deleteOne = (addr: Address) => {
        Alert.alert('Delete Address', `Delete "${addr.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        if (addr.id) await apiRequest('DELETE', `/api/addresses/${addr.id}`);
                        setAddresses((prev) => prev.filter((a) => a !== addr));
                        // also update local cache
                        const next = addresses.filter((a) => a !== addr);
                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                    } catch (e) {
                        // local fallback
                        const next = addresses.filter((a) => a !== addr);
                        await persistLocal(next);
                    }
                }
            }
        ]);
    };

    const setDefault = async (addr: Address) => {
        try {
            if (addr.id) await apiRequest('PUT', `/api/addresses/${addr.id}/default`);
            const next = addresses.map((a) => ({ ...a, isDefault: a === addr }));
            await persistLocal(next);
        } catch (e) {
            const next = addresses.map((a) => ({ ...a, isDefault: a === addr }));
            await persistLocal(next);
        }
    };

    const onSaveForm = async (form: AddressFormValues) => {
        try {
            if (editing?.id) {
                await apiRequest('PUT', `/api/addresses/${editing.id}`, form);
            } else {
                await apiRequest('POST', '/api/addresses', form);
            }
            // refetch from server
            const res = await apiGet<Address[]>('/api/addresses').catch(() => null);
            if (res) {
                setAddresses(res);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res));
            } else {
                // update local list
                const next = editing?.id
                    ? addresses.map((a) => (a.id === editing?.id ? { ...editing, ...form } as Address : a))
                    : [{ ...form, id: Date.now() } as Address, ...addresses];
                await persistLocal(next);
            }
        } catch (e) {
            // local fallback only
            const next = editing?.id
                ? addresses.map((a) => (a.id === editing?.id ? { ...editing, ...form } as Address : a))
                : [{ ...form, id: Date.now() } as Address, ...addresses];
            await persistLocal(next);
        } finally {
            setMode('list');
            setEditing(null);
        }
    };

    if (mode === 'form') {
        return (
            <AddressForm
                address={editing ?? undefined}
                onClose={() => { setMode('list'); setEditing(null); }}
                onSave={onSaveForm}
            />
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={{ fontSize: 18 }}>←</Text></Pressable>
                <Text style={styles.title}>Addresses</Text>
                <Pressable onPress={addNew} style={styles.addBtn}><Text style={styles.addBtnText}>Add</Text></Pressable>
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => String(item.id ?? item.title)}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                {item.isDefault ? <Text style={styles.badge}>Default</Text> : null}
                            </View>
                            <Text style={styles.cardAddress}>
                                {item.addressLine1}
                                {item.addressLine2 ? `, ${item.addressLine2}` : ''}
                            </Text>
                            <Text style={styles.cardFooter}>{item.city || 'Kalkanlı'}, {item.country || 'TRNC'}</Text>
                        </View>
                        <View style={styles.actions}>
                            {!item.isDefault && (
                                <Pressable onPress={() => setDefault(item)} style={[styles.actionBtn, styles.secondary]}>
                                    <Text style={styles.actionText}>Set Default</Text>
                                </Pressable>
                            )}
                            <Pressable onPress={() => editOne(item)} style={[styles.actionBtn, styles.primary]}>
                                <Text style={[styles.actionText, { color: 'white' }]}>Edit</Text>
                            </Pressable>
                            <Pressable onPress={() => deleteOne(item)} style={[styles.actionBtn, styles.danger]}>
                                <Text style={[styles.actionText, { color: 'white' }]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Text style={{ fontWeight: '600' }}>No addresses yet</Text>
                        <Text style={{ color: '#6b7280', marginTop: 4 }}>Add one to speed up checkout.</Text>
                        <Pressable onPress={addNew} style={[styles.addBtn, { marginTop: 12 }]}><Text style={styles.addBtnText}>Add Address</Text></Pressable>
                    </View>
                )}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: '700' },
    addBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#111827', borderRadius: 10 },
    addBtnText: { color: 'white', fontWeight: '700' },
    card: { backgroundColor: 'white', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardAddress: { color: '#374151', marginTop: 6 },
    cardFooter: { color: '#6b7280', marginTop: 2, fontSize: 12 },
    badge: { marginLeft: 6, backgroundColor: '#d1fae5', color: '#065f46', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, fontSize: 12 },
    actions: { marginTop: 10, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    actionBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
    secondary: { backgroundColor: '#f3f4f6' },
    primary: { backgroundColor: '#111827', borderColor: '#111827' },
    danger: { backgroundColor: '#dc2626', borderColor: '#b91c1c' },
    actionText: { fontWeight: '600' },
    empty: { padding: 24, alignItems: 'center' },
});
