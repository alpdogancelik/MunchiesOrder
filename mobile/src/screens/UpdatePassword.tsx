import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '@lib/supabase';

export default function UpdatePasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    async function update() {
        if (loading) return;
        if (password.length < 6) return Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
        if (password !== confirm) return Alert.alert('Hata', 'Şifreler eşleşmiyor.');
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            if (error) return Alert.alert('Başarısız', error.message);
            Alert.alert('Başarılı', 'Şifreniz güncellendi.');
        } catch (err: any) {
            Alert.alert('Başarısız', err?.message ?? 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Yeni Şifre</Text>
            <TextInput
                placeholder="Yeni şifre"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />
            <TextInput
                placeholder="Yeni şifre (tekrar)"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
            />
            <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={update} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Bekleyin…' : 'Güncelle'}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
    input: {
        width: '100%',
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },
    btn: { width: '100%', alignItems: 'center', paddingVertical: 12, backgroundColor: '#111827', borderRadius: 10 },
    btnText: { color: '#fff', fontWeight: '600' },
});