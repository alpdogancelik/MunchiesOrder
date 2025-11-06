import React from 'react';
import { View } from 'react-native';
export default function Toaster({ children }: React.PropsWithChildren) { return <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>{children}</View>; }
