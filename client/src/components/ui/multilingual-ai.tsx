import { useState, useEffect } from 'react';

interface MultilingualAIProps {
  text: string;
  targetLanguage: string;
  fallback?: string;
}

// Simple AI translation service mock
// In production, this would connect to a real AI translation API
export function useAITranslation(text: string, targetLanguage: string): string {
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (targetLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    // Mock AI translation - in production this would be a real API call
    const translations: { [key: string]: { [key: string]: string } } = {
      'tr': {
        'Food delivery for METU NCC and Kalkanlı Campus': 'ODTÜ KKC ve Kalkanlı Kampüsü için yemek teslimatı',
        'Crave & Receive': 'İste & Al',
        'Get Started': 'Başlayın',
        'Coming Soon': 'Yakında',
        'Campus groceries & essentials delivery': 'Kampüs market alışverişi ve temel ihtiyaçlar teslimatı',
        'Student': 'Öğrenci',
        'Restaurant': 'Restoran',
        'Courier': 'Kurye',
        'Order History': 'Sipariş Geçmişi',
        'View Order History': 'Sipariş Geçmişini Görüntüle',
        'View Earnings Report': 'Kazanç Raporunu Görüntüle',
        'Navigate': 'Yol Tarifi',
        'Call Customer': 'Müşteriyi Ara',
        'Mark Delivered': 'Teslim Edildi',
        'Start Delivery': 'Teslimatı Başlat',
        'Active Orders': 'Aktif Siparişler',
        'Today\'s Deliveries': 'Bugünkü Teslimatlar',
        'Today\'s Earnings': 'Bugünkü Kazançlar',
        'Rating': 'Değerlendirme',
        'Online': 'Çevrimiçi',
        'Offline': 'Çevrimdışı',
        'Ready for Pickup': 'Alınmaya Hazır',
        'Out for Delivery': 'Yolda'
      }
    };

    const translated = translations[targetLanguage]?.[text];
    if (translated) {
      setTranslatedText(translated);
    }
  }, [text, targetLanguage]);

  return translatedText;
}

export function MultilingualText({ text, targetLanguage, fallback }: MultilingualAIProps) {
  const translatedText = useAITranslation(text, targetLanguage);
  return translatedText || fallback || text;
}