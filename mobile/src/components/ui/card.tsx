import React from 'react';
import { View } from 'react-native';
export function Card({ children }: React.PropsWithChildren) { return <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#fff' }}>{children}</View>; }
