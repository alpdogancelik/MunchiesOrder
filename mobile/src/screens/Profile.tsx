import { View, Text, StyleSheet, Pressable } from 'react-native';
import { supabase } from '@lib/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.subtitle}>Kullanıcı bilgileri ve ayarlar</Text>

            <View style={{ height: 12 }} />
            <Pressable style={[styles.card]} onPress={() => navigation.navigate('Addresses')}>
                <Text style={{ fontWeight: '700' }}>Adresleri Yönet</Text>
                <Text style={{ color: '#6b7280', marginTop: 2 }}>Adres ekle, düzenle, varsayılanı ayarla</Text>
            </Pressable>

            <View style={{ height: 12 }} />
            <Pressable style={[styles.btn, { alignSelf: 'stretch' }]} onPress={() => supabase.auth.signOut()}>
                <Text style={styles.btnText}>Çıkış Yap</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { color: '#6b7280', marginTop: 8 },
    btn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#111827', borderRadius: 10, alignSelf: 'flex-start' },
    btnText: { color: '#fff', fontWeight: '600' },
    card: { padding: 16, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
});
