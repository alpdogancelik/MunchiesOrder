import React from 'react';
import { View } from 'react-native';
export default function ToggleGroup({ children }: React.PropsWithChildren) { return <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>; }
