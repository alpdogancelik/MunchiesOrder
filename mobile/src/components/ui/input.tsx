import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
export default function Input(props: TextInputProps) { return <TextInput {...props} style={[{ borderWidth: 1, borderRadius: 8, padding: 10 }, props.style as any]} />; }
