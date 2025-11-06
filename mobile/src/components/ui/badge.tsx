import React from 'react';
import { View, Text } from 'react-native';
export default function Badge({ children }: React.PropsWithChildren) { return <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#eee', borderRadius: 8 }}><Text>{children as any}</Text></View>; }
