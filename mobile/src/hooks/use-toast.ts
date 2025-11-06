import { useCallback } from 'react';
import { Alert } from 'react-native';

export type ToastOptions = { title?: string; description?: string };

export function useToast() {
    const toast = useCallback((opts: ToastOptions) => {
        Alert.alert(opts.title ?? 'Bilgi', opts.description ?? '');
    }, []);
    return { toast } as const;
}
