import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable, ScrollView } from 'react-native';

export type Address = {
    title?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    isDefault?: boolean;
};

export default function AddressForm({ address, onClose, onSave }: { address?: Address; onClose?: () => void; onSave?: (a: Address) => void }) {
    const [form, setForm] = useState<Address>({
        title: address?.title || '',
        addressLine1: address?.addressLine1 || '',
        addressLine2: address?.addressLine2 || '',
        city: address?.city || 'Kalkanlı',
        country: address?.country || 'TRNC',
        isDefault: address?.isDefault || false,
    });

    const handleChange = (key: keyof Address, value: any) => setForm((p) => ({ ...p, [key]: value }));

    const submit = () => {
        if (!form.title?.trim() || !form.addressLine1?.trim()) return; // simple guard
        onSave?.(form);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Pressable onPress={onClose} className="mr-4 px-2 py-1">
                        <Text className="text-xl">←</Text>
                    </Pressable>
                    <Text className="text-lg font-semibold">{address ? 'Edit Address' : 'Add New Address'}</Text>
                </View>
                <Pressable onPress={submit} className="px-3 py-2 rounded-xl bg-black">
                    <Text className="text-white font-medium">Save</Text>
                </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="gap-4">
                    <View>
                        <Text className="text-sm text-gray-700 mb-1">Address Title *</Text>
                        <TextInput value={form.title} onChangeText={(v) => handleChange('title', v)} placeholder="Home, Dormitory..." className="bg-white p-3 rounded-xl border border-gray-200" />
                    </View>
                    <View>
                        <Text className="text-sm text-gray-700 mb-1">Address Line 1 *</Text>
                        <TextInput
                            value={form.addressLine1}
                            onChangeText={(v) => handleChange('addressLine1', v)}
                            placeholder="Street, building, room"
                            className="bg-white p-3 rounded-xl border border-gray-200"
                            multiline
                        />
                    </View>
                    <View>
                        <Text className="text-sm text-gray-700 mb-1">Address Line 2</Text>
                        <TextInput
                            value={form.addressLine2}
                            onChangeText={(v) => handleChange('addressLine2', v)}
                            placeholder="Landmarks"
                            className="bg-white p-3 rounded-xl border border-gray-200"
                            multiline
                        />
                    </View>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-sm text-gray-700 mb-1">City</Text>
                            <TextInput value={form.city} onChangeText={(v) => handleChange('city', v)} className="bg-white p-3 rounded-xl border border-gray-200" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-gray-700 mb-1">Country</Text>
                            <TextInput value={form.country} onChangeText={(v) => handleChange('country', v)} className="bg-white p-3 rounded-xl border border-gray-200" />
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <View>
                            <Text className="text-sm font-medium">Set as Default Address</Text>
                            <Text className="text-xs text-gray-500">Use this address for future orders</Text>
                        </View>
                        <Switch value={!!form.isDefault} onValueChange={(v) => handleChange('isDefault', v)} />
                    </View>
                </View>

                <View className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
                    <View className="flex-row gap-3 items-start">
                        <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                            <Text>💡</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-medium mb-1">Address Tips</Text>
                            <Text className="text-sm text-gray-600">• Include building and room for accuracy</Text>
                            <Text className="text-sm text-gray-600">• Add landmarks for faster delivery</Text>
                            <Text className="text-sm text-gray-600">• Double-check spelling</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
