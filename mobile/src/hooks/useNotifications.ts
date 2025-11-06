import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export function useNotifications() {
    useEffect(() => {
        Notifications.requestPermissionsAsync();
    }, []);

    const schedule = async (title: string, body: string) => {
        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: null,
        });
    };

    return { schedule } as const;
}
