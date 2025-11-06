import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestPushPermissions() {
    // Configure how notifications are displayed when app is foregrounded
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            // SDK 54+ uses shouldShowBanner/shouldShowList on iOS; keep legacy fields too
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return undefined;
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
}
