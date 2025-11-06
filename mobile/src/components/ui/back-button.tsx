import React from 'react';
import { Pressable, Text } from 'react-native';
export default function BackButton({ onPress }: { onPress?: () => void }) { return <Pressable onPress={onPress}><Text>{'<'}</Text></Pressable>; }
