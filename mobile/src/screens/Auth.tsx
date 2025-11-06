import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '@lib/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // Loading sadece aktif isteği kilitler; farklı bir cooldown uygulanmaz

    function validate() {
        const e = email.trim();
        if (!e.includes('@')) {
            Alert.alert('Hatalı e‑posta', 'Lütfen geçerli bir e‑posta girin.');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Zayıf şifre', 'Şifre en az 6 karakter olmalı.');
            return false;
        }
        return true;
    }

    async function signIn() {
        if (loading) return;
        if (!validate()) return;
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) {
                const msg = error.status === 400 ? 'E‑posta veya şifre hatalı ya da e‑posta doğrulanmamış.' : error.message;
                Alert.alert('Giriş başarısız', msg);
                return;
            }
            navigation.replace('Home');
        } catch (err: any) {
            Alert.alert('Giriş başarısız', err?.message ?? 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    }

    async function signUp() {
        if (loading) return;
        if (!validate()) return;
        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email: email.trim(), password });
            if (error) {
                const msg = error.status === 429 ? 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.' : error.message;
                Alert.alert('Kayıt başarısız', msg);
                return;
            }
            Alert.alert('E‑posta doğrulaması gönderildi', 'Lütfen e‑postanızı kontrol edin.');
        } catch (err: any) {
            Alert.alert('Kayıt başarısız', err?.message ?? 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giriş / Kayıt</Text>
            <TextInput
                placeholder="E-posta"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Şifre"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />
            <Pressable
                style={[styles.btn, loading && { opacity: 0.6 }]}
                onPress={signIn}
                disabled={loading}
                accessibilityLabel="Giriş yap"
            >
                <Text style={styles.btnText}>{loading ? 'Bekleyin…' : 'Giriş yap'}</Text>
            </Pressable>
            <Pressable
                style={[styles.btnOutline, loading && { opacity: 0.6 }]}
                onPress={signUp}
                disabled={loading}
                accessibilityLabel="Kayıt ol"
            >
                <Text style={styles.btnOutlineText}>Kayıt ol</Text>
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
    btnOutline: { width: '100%', alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#111827', borderRadius: 10, marginTop: 10 },
    btnOutlineText: { color: '#111827', fontWeight: '600' },
});
