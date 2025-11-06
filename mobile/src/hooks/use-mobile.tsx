import { Platform } from 'react-native';

export default function useMobile() {
    return Platform.OS === 'ios' || Platform.OS === 'android';
}
