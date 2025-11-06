import React from 'react';
import { View, Text } from 'react-native';
export default function Toast({ title, description }: { title?: string; description?: string }) { return <View style={{ padding: 12, backgroundColor: '#111', borderRadius: 8 }}><Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text><Text style={{ color: 'white' }}>{description}</Text></View>; }
