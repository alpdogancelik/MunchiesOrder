import React from 'react';
import { View } from 'react-native';
export default function Sheet({ children }: React.PropsWithChildren) { return <View style={{ padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>{children}</View>; }
