import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
export default function Textarea(props: TextInputProps) { return <TextInput {...props} multiline style={[{ borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top' }, props.style as any]} />; }
