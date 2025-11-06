import React from 'react';
import { View, ViewProps } from 'react-native';
export default function Skeleton(props: ViewProps) { return <View {...props} style={[{ backgroundColor: '#e5e7eb', borderRadius: 8, height: 16 }, props.style as any]} />; }
