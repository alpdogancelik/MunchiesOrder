import React from 'react';
import { Pressable, Text } from 'react-native';
export default function Button({ title = 'Button', onPress }: { title?: string; onPress?: () => void }) { return <Pressable onPress={onPress} style={{ padding: 12, backgroundColor: '#111', borderRadius: 8 }}><Text style={{ color: 'white', textAlign: 'center' }}>{title}</Text></Pressable>; }
