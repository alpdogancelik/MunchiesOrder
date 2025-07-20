import { useState, useEffect } from 'react';

// Translation object type
export interface Translations {
  [key: string]: string | Translations;
}

// English translations
const enTranslations: Translations = {
  // Common
  welcome: 'Welcome',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  firstName: 'First Name',
  lastName: 'Last Name',
  username: 'Username',
  userType: 'User Type',
  submit: 'Submit',
  cancel: 'Cancel',
  save: 'Save',
  edit: 'Edit',
  delete: 'Delete',
  search: 'Search',
  loading: 'Loading...',
  
  // User types
  student: 'Student',
  restaurantOwner: 'Restaurant Owner',
  courier: 'Courier',
  
  // Navigation
  home: 'Home',
  restaurants: 'Restaurants',
  profile: 'Profile',
  orders: 'Orders',
  cart: 'Cart',
  
  // Profile
  profileSettings: 'Profile Settings',
  editProfile: 'Edit Profile',
  deliveryAddresses: 'Delivery Addresses',
  orderHistory: 'Order History',
  notifications: 'Notifications',
  darkMode: 'Dark Mode',
  language: 'Language',
  
  // Orders
  viewPastOrders: 'View past orders',
  noOrdersYet: 'No orders yet',
  startOrdering: 'Start ordering from your favorite restaurants',
  browseRestaurants: 'Browse Restaurants',
  placeOrder: 'Place Order',
  orderPlaced: 'Order Placed Successfully',
  paymentMethod: 'Payment Method',
  cashOnDelivery: 'Cash on Delivery',
  cardAtDoor: 'Card at Door',
  onlinePayment: 'Online Payment',
  deliveryAddress: 'Delivery Address',
  specialInstructions: 'Special Instructions',
  orderSummary: 'Order Summary',
  subtotal: 'Subtotal',
  deliveryFee: 'Delivery Fee',
  serviceFee: 'Service Fee',
  total: 'Total',
  orderStatus: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    outForDelivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  },
  
  // Restaurants
  searchRestaurants: 'Search restaurants or dishes...',
  addToCart: 'Add to Cart',
  viewMenu: 'View Menu',
  
  // Cart
  yourCart: 'Your Cart',
  cartEmpty: 'Your cart is empty',
  continueShopping: 'Continue Shopping',
  checkout: 'Checkout',
  
  // Munchies specific
  munchies: 'Munchies',
  tagline: 'Food delivery for METU NCC & Kalkanlı',
  getStarted: 'Get Started',
};

// Turkish translations
const trTranslations: Translations = {
  // Common
  welcome: 'Hoş Geldiniz',
  login: 'Giriş Yap',
  register: 'Kayıt Ol',
  logout: 'Çıkış Yap',
  email: 'E-posta',
  password: 'Şifre',
  confirmPassword: 'Şifreyi Onayla',
  firstName: 'Ad',
  lastName: 'Soyad',
  username: 'Kullanıcı Adı',
  userType: 'Kullanıcı Tipi',
  submit: 'Gönder',
  cancel: 'İptal',
  save: 'Kaydet',
  edit: 'Düzenle',
  delete: 'Sil',
  search: 'Ara',
  loading: 'Yükleniyor...',
  
  // User types
  student: 'Öğrenci',
  restaurantOwner: 'Restoran Sahibi',
  courier: 'Kurye',
  
  // Navigation
  home: 'Ana Sayfa',
  restaurants: 'Restoranlar',
  profile: 'Profil',
  orders: 'Siparişler',
  cart: 'Sepet',
  
  // Profile
  profileSettings: 'Profil Ayarları',
  editProfile: 'Profili Düzenle',
  deliveryAddresses: 'Teslimat Adresleri',
  orderHistory: 'Sipariş Geçmişi',
  notifications: 'Bildirimler',
  darkMode: 'Karanlık Mod',
  language: 'Dil',
  
  // Orders
  viewPastOrders: 'Geçmiş siparişleri görüntüle',
  noOrdersYet: 'Henüz sipariş yok',
  startOrdering: 'Favori restoranlarınızdan sipariş vermeye başlayın',
  browseRestaurants: 'Restoranları İncele',
  placeOrder: 'Sipariş Ver',
  orderPlaced: 'Sipariş Başarıyla Verildi',
  paymentMethod: 'Ödeme Yöntemi',
  cashOnDelivery: 'Kapıda Nakit Ödeme',
  cardAtDoor: 'Kapıda Kart ile Ödeme',
  onlinePayment: 'Online Ödeme',
  deliveryAddress: 'Teslimat Adresi',
  specialInstructions: 'Özel Talimatlar',
  orderSummary: 'Sipariş Özeti',
  subtotal: 'Ara Toplam',
  deliveryFee: 'Teslimat Ücreti',
  serviceFee: 'Hizmet Bedeli',
  total: 'Toplam',
  orderStatus: {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    preparing: 'Hazırlanıyor',
    ready: 'Hazır',
    outForDelivery: 'Yolda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi'
  },
  
  // Restaurants
  searchRestaurants: 'Restoran veya yemek arayın...',
  addToCart: 'Sepete Ekle',
  viewMenu: 'Menüyü Görüntüle',
  
  // Cart
  yourCart: 'Sepetiniz',
  cartEmpty: 'Sepetiniz boş',
  continueShopping: 'Alışverişe Devam Et',
  checkout: 'Ödeme',
  
  // Munchies specific
  munchies: 'Munchies',
  tagline: 'ODTÜ KKK ve Kalkanlı için yemek siparişi',
  getStarted: 'Başlayın',
};

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Check localStorage for saved language, default to English
    return localStorage.getItem('munchies-language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('munchies-language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (langCode: string) => {
    if (translations[langCode as keyof typeof translations]) {
      setCurrentLanguage(langCode);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation not found
    if (value === undefined) {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
  };
}