import React from 'react';
import { Pressable, Text } from 'react-native';
export default function LogoutButton({ onPress }: { onPress?: () => void }) { return <Pressable onPress={onPress}><Text>Çıkış</Text></Pressable>; }
