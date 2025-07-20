# GitHub'a Yükleme Rehberi - Munchies Yemek Siparişi

## Adım 1: GitHub Hesabı ve Repository Oluşturma

### GitHub Hesabı
1. [GitHub.com](https://github.com) adresine gidin
2. Hesabınız yoksa "Sign up" ile ücretsiz hesap oluşturun
3. Email adresinizi doğrulayın

### Repository Oluşturma
1. GitHub'a giriş yaptıktan sonra sağ üstteki "+" işaretine tıklayın
2. "New repository" seçin
3. Repository bilgilerini doldurun:
   - **Repository name**: `munchies-food-delivery`
   - **Description**: "METU Kuzey Kıbrıs Kampüsü için kapsamlı yemek siparişi platformu"
   - **Public** veya **Private** seçin (Public önerilir)
   - **Add a README file** seçeneğini İŞARETLEMEYİN (zaten var)

## Adım 2: Proje Dosyalarını Yükleme

### Yöntem A: GitHub Web Arayüzü (En Kolay)
1. Repository oluşturduktan sonra "uploading an existing file" linkine tıklayın
2. Tüm proje dosyalarını sürükleyip bırakın, ANCAK şunları YÜKLEMEYIN:
   - `node_modules/` klasörü
   - `.env` dosyası (güvenlik nedeniyle)
   - `dist/` klasörü
   - `.replit` dosyası

### Yöntem B: Git Komutları (İleri Seviye)
Eğer git komutlarını biliyorsanız:

```bash
git init
git add .
git commit -m "İlk yükleme: Munchies yemek siparişi platformu"
git remote add origin https://github.com/alpdogancelik/munchies-food-delivery.git
git push -u origin main
```

## Adım 3: Deployment (Canlı Yayına Alma)

### Replit'te Deployment (Önerilir)
1. Replit hesabınıza gidin
2. "New Repl" → "Import from GitHub"
3. Repository URL'ini girin: `https://github.com/alpdogancelik/munchies-food-delivery`
4. Secrets sekmesine gidin ve environment variables'ları ekleyin:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `SENDGRID_API_KEY`
   - `GOOGLE_MAPS_API_KEY`

### Vercel'de Deployment
1. [Vercel.com](https://vercel.com) hesabı oluşturun
2. "New Project" → GitHub'dan import edin
3. Environment variables'ları ekleyin
4. Deploy edin

### Railway'de Deployment  
1. [Railway.app](https://railway.app) hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables'ları ekleyin
4. Otomatik deployment başlar

## Adım 4: Gerekli Environment Variables

Deployment platformunuzda şu değişkenleri ekleyin:

```
DATABASE_URL=postgresql://kullanici:sifre@host:port/veritabani
SESSION_SECRET=rastgele-guvenli-anahtar
SENDGRID_API_KEY=SG.sendgrid-api-anahtariniz
GOOGLE_MAPS_API_KEY=AIza...google-maps-api-anahtariniz
```

## Adım 5: API Anahtarları Alma

### SendGrid API Key
1. [SendGrid.com](https://sendgrid.com) hesabı oluşturun
2. Settings → API Keys → Create API Key
3. Full Access verin ve anahtarı kopyalayın

### Google Maps API Key
1. [Google Cloud Console](https://console.cloud.google.com)'a gidin
2. Yeni proje oluşturun
3. APIs & Services → Enable APIs → Maps JavaScript API'yi aktifleştirin
4. Credentials → Create Credentials → API Key

## Adım 6: Domain Ayarlama (Opsiyonel)

### Replit Domain
1. Replit Pro/Teams hesabı gerekli
2. Webview → Domain settings
3. Custom domain ekleyin

### Vercel Domain
1. Project Settings → Domains
2. Custom domain ekleyin
3. DNS ayarlarını yapın

## Adım 7: Test ve Doğrulama

### Deployment Testi
1. Canlı URL'e gidin
2. Tüm özellikler çalışıyor mu kontrol edin:
   - Kullanıcı kayıt/giriş
   - Restoran listeleme
   - Sipariş verme
   - Email bildirimleri
   - Google Maps navigasyon

### Performance Kontrolü
- Sayfa yükleme hızları
- Mobil uyumluluk
- Veritabanı bağlantıları

## Sorun Giderme

### Yaygın Sorunlar

**Database Bağlantı Hatası**:
- DATABASE_URL formatını kontrol edin
- Veritabanı erişim izinlerini kontrol edin

**Environment Variable Hatası**:
- Tüm gerekli değişkenlerin eklendiğini kontrol edin
- Değişken isimlerinde yazım hatası olup olmadığını kontrol edin

**Build Hatası**:
- Node.js sürümü 18+ olmalı
- package.json'daki bağımlılıkları kontrol edin

## İletişim

- **Geliştirici**: Alpcan Çelik
- **Email**: alpdogan.celik1@gmail.com
- **GitHub**: @alpdogancelik

## Sonraki Adımlar

1. ✅ Repository GitHub'a yüklendi
2. ✅ Deployment platformu seçildi
3. ✅ Environment variables eklendi
4. ✅ API anahtarları alındı
5. 🔄 Test edildi ve canlıya alındı
6. 📱 Mobil uyumluluk kontrol edildi
7. 🚀 Kullanıma hazır!

---

**Başarılı Deployment!** 🎉

Munchies artık canlı ve METU NCC öğrencilerinin hizmetinde! 

*Kalkanlı'dan sevgilerle - lezzeti topluluğa bağlıyoruz* 🍽️