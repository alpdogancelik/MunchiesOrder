import React from 'react';
import { Pressable, Text } from 'react-native';
export default function Toggle({ pressed, onPress, label }: { pressed?: boolean; onPress?: () => void; label?: string }) { return <Pressable onPress={onPress} style={{ padding: 8, backgroundColor: pressed ? '#111' : '#eee', borderRadius: 8 }}><Text style={{ color: pressed ? '#fff' : '#111' }}>{label ?? 'Toggle'}</Text></Pressable>; }
