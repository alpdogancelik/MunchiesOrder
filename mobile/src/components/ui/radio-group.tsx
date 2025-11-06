import React from 'react';
import { View, Pressable, Text } from 'react-native';
export default function RadioGroup({ options = [], value, onChange }: { options?: string[]; value?: string; onChange?: (v: string) => void }) {
    return (
        <View style={{ gap: 8 }}>
            {options.map((opt) => (
                <Pressable key={opt} onPress={() => onChange?.(opt)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 18, height: 18, borderWidth: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                        {value === opt ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111' }} /> : null}
                    </View>
                    <Text>{opt}</Text>
                </Pressable>
            ))}
        </View>
    );
}
