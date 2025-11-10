import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            profile: {
                header: {
                    edit: "Edit",
                    signOut: "Sign out",
                    signingOut: "Signing out...",
                },
                defaultAddress: "Default delivery address",
                manageAddresses: "Manage addresses",
                noAddress: "No address on file yet.",
                activeOrders: "Active orders",
                noActiveOrders: "No ongoing deliveries. Hungry?",
                accountActions: "Account actions",
                restaurantConsole: "Open Restaurant Console",
                courierConsole: "Courier Dispatch Center",
                modal: {
                    title: "Order details",
                    status: "Status",
                    eta: "ETA",
                    total: "Total",
                    close: "Close",
                },
            },
            status: {
                preparing: "Preparing",
                ready: "Ready",
                canceled: "Canceled",
            },
            misc: {
                manageSoon: "Address management will launch soon.",
                editSoon: "Profile editing will arrive soon.",
            },
        },
    },
    tr: {
        translation: {
            profile: {
                header: {
                    edit: "Düzenle",
                    signOut: "Çıkış yap",
                    signingOut: "Çıkış yapılıyor...",
                },
                defaultAddress: "Varsayılan teslimat adresi",
                manageAddresses: "Adresleri yönet",
                noAddress: "Henüz kayıtlı adres yok.",
                activeOrders: "Aktif siparişler",
                noActiveOrders: "Devam eden sipariş yok. Acıktın mı?",
                accountActions: "Hesap işlemleri",
                restaurantConsole: "Restoran Panelini Aç",
                courierConsole: "Kurye Merkezi",
                modal: {
                    title: "Sipariş detayları",
                    status: "Durum",
                    eta: "Tahmini süre",
                    total: "Toplam",
                    close: "Kapat",
                },
            },
            status: {
                preparing: "Hazırlanıyor",
                ready: "Hazır",
                canceled: "İptal edildi",
            },
            misc: {
                manageSoon: "Adres yönetimi çok yakında.",
                editSoon: "Profil düzenleme yakında.",
            },
        },
    },
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources,
        lng: "en",
        fallbackLng: "en",
        compatibilityJSON: "v3",
        interpolation: {
            escapeValue: false,
        },
    });
}

export default i18n;
