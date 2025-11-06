import { SplashScreen, Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect } from "react";

import './globals.css';
import * as Sentry from '@sentry/react-native';
import useAuthStore from "@/store/auth.store";

Sentry.init({
    dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
    sendDefaultPii: true,
    replaysSessionSampleRate: 1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

export default Sentry.wrap(function RootLayout() {
    const { isLoading, fetchAuthenticatedUser } = useAuthStore();

    const [fontsLoaded, error] = useFonts({
        // NOTE: Fonts must exist in ./assets/fonts. Copy from food_ordering-main.
        // Temporarily comment these if assets aren't copied yet.
        "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
        "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
        "QuickSand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
        "QuickSand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
        "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
    });

    useEffect(() => {
        if (error) throw error;
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded, error]);

    useEffect(() => {
        fetchAuthenticatedUser();
    }, []);

    if (!fontsLoaded || isLoading) return null;

    return <Stack screenOptions={{ headerShown: false }} />;
});

Sentry.showFeedbackWidget();
