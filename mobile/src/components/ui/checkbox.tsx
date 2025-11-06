import React from 'react';
import { Pressable, View } from 'react-native';
export default function Checkbox({ checked, onChange }: { checked?: boolean; onChange?: (v: boolean) => void }) { return <Pressable onPress={() => onChange?.(!checked)}><View style={{ width: 20, height: 20, borderWidth: 1, backgroundColor: checked ? '#111' : 'transparent' }} /></Pressable>; }
