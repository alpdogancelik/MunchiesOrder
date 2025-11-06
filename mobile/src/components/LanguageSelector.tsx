import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

export default function LanguageSelector() {
    const { lang, toggle } = useLanguage();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text>Dil: {lang.toUpperCase()}</Text>
            <Pressable onPress={toggle}>
                <Text style={{ color: '#007AFF' }}>Değiştir</Text>
            </Pressable>
        </View>
    );
}
