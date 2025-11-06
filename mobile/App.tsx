import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/Home';
import AuthScreen from './src/screens/Auth';
import RestaurantScreen from './src/screens/Restaurant';
import CartScreen from './src/screens/Cart';
import CheckoutScreen from './src/screens/Checkout';
import OrderTrackingScreen from './src/screens/OrderTracking';
import ProfileScreen from './src/screens/Profile';
// Newly mapped screens from client/pages
import AdminDashboard from './src/screens/AdminDashboard';
import CourierDashboard from './src/screens/CourierDashboard';
import CourierLogin from './src/screens/CourierLogin';
import CourierManagement from './src/screens/CourierManagement';
import CourierTracking from './src/screens/CourierTracking';
import CreateRestaurant from './src/screens/CreateRestaurant';
import DeveloperDashboard from './src/screens/DeveloperDashboard';
import Landing from './src/screens/Landing';
import MenuManagement from './src/screens/MenuManagement';
import NotFound from './src/screens/NotFound';
import OrderHistory from './src/screens/OrderHistory';
import Payment from './src/screens/Payment';
import StudentHome from './src/screens/StudentHome';
import AddressManagement from './src/screens/AddressManagement';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { CartProvider } from '@lib/cart';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Restaurant: { id: string } | undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string } | undefined;
  Profile: undefined;
  Addresses: undefined;
  UpdatePassword: undefined;
  // Extra routes ported from web pages (placeholders for now)
  AdminDashboard: undefined;
  CourierDashboard: undefined;
  CourierLogin: undefined;
  CourierManagement: undefined;
  CourierTracking: undefined;
  CreateRestaurant: undefined;
  DeveloperDashboard: undefined;
  Landing: undefined;
  MenuManagement: undefined;
  NotFound: undefined;
  OrderHistory: undefined;
  Payment: undefined;
  StudentHome: undefined;
  AddressManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setInitialRoute(data.session ? 'Home' : 'Auth');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && navigationRef.isReady()) {
        navigationRef.navigate('UpdatePassword');
      }
      setInitialRoute(session ? 'Home' : 'Auth');
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Giriş' }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Munchies' }} />
            <Stack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: 'Restoran' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Sepet' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Ödeme' }} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Takip' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
            <Stack.Screen name="Addresses" component={require('./src/screens/Addresses').default} options={{ title: 'Adresler' }} />
            <Stack.Screen name="UpdatePassword" component={require('./src/screens/UpdatePassword').default} options={{ title: 'Şifreyi Güncelle' }} />
            {/* Ported screens (can be navigated programmatically) */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin' }} />
            <Stack.Screen name="CourierDashboard" component={CourierDashboard} options={{ title: 'Kurye Paneli' }} />
            <Stack.Screen name="CourierLogin" component={CourierLogin} options={{ title: 'Kurye Giriş' }} />
            <Stack.Screen name="CourierManagement" component={CourierManagement} options={{ title: 'Kurye Yönetimi' }} />
            <Stack.Screen name="CourierTracking" component={CourierTracking} options={{ title: 'Kurye Takibi' }} />
            <Stack.Screen name="CreateRestaurant" component={CreateRestaurant} options={{ title: 'Restoran Oluştur' }} />
            <Stack.Screen name="DeveloperDashboard" component={DeveloperDashboard} options={{ title: 'Developer' }} />
            <Stack.Screen name="Landing" component={Landing} options={{ title: 'Landing' }} />
            <Stack.Screen name="MenuManagement" component={MenuManagement} options={{ title: 'Menu Yönetimi' }} />
            <Stack.Screen name="NotFound" component={NotFound} options={{ title: 'Bulunamadı' }} />
            <Stack.Screen name="OrderHistory" component={OrderHistory} options={{ title: 'Sipariş Geçmişi' }} />
            <Stack.Screen name="Payment" component={Payment} options={{ title: 'Ödeme' }} />
            <Stack.Screen name="StudentHome" component={StudentHome} options={{ title: 'Öğrenci' }} />
            <Stack.Screen name="AddressManagement" component={AddressManagement} options={{ title: 'Adres Yönetimi' }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </CartProvider>
    </SafeAreaProvider>
  );
}
