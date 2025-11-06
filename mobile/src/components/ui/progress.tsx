import React from 'react';
import { View } from 'react-native';
export default function Progress({ value = 0 }: { value?: number }) { return <View style={{ height: 6, backgroundColor: '#eee', borderRadius: 3 }}><View style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: '#111', height: 6, borderRadius: 3 }} /></View>; }
