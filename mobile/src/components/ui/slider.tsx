import React from 'react';
import { View, Text } from 'react-native';
export default function Slider({ value = 0, onChange }: { value?: number; onChange?: (v: number) => void }) { return <View><Text>Slider {value}</Text></View>; }
