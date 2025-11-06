# MunchiesOrder

Temizlenmiş repo yapısı: web client ve Replit artefaktları kaldırıldı, odak Expo (mobile) + server + shared üzerinde.

## Yapı
- `mobile/` — Expo (React Native) uygulaması
- `server/` — Node/Express + Drizzle (Postgres)
- `shared/` — Ortak tipler ve şema
- `docs/` — Kurulum ve entegrasyon dokümanları (örn. `SUPABASE.md`)

## Hızlı Başlangıç
- Ortam değişkenlerini `.env` dosyasına ekleyin (bkz. `docs/SUPABASE.md`).
- Bağımlılıkları kurun ve geliştirme sunucusunu başlatın:

```powershell
# kök dizin
npm i

# server (opsiyonel ayrı çalıştırma gerekiyorsa)
# npm run dev:server

# mobile (Expo)
cd mobile
npm i
npm run start
```

Notlar:
- Tailwind config `mobile/shared/server` içeriklerini tarar; eski `client/` yolu kaldırıldı.
- shadcn-ui için `components.json` CSS yolu `mobile/app/globals.css` olarak güncellendi.

## Lisans
Bu proje sadece demo amaçlıdır.