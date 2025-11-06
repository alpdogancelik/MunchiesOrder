# Munchies Mobile — Expo Router + Appwrite (migrated)

This app has been migrated to match the food_ordering-main architecture: Expo Router, NativeWind, Zustand and Appwrite.

## Quick start

1) Install dependencies:

```powershell
cd "c:\Users\alpdo\OneDrive\Desktop\MunchiesOrder (3)\MunchiesOrder\mobile"
npm install
```

2) Configure environment in `app.json` → `expo.extra`:

- `EXPO_PUBLIC_APPWRITE_ENDPOINT`
- `EXPO_PUBLIC_APPWRITE_PROJECT_ID`

Optional: Sentry DSN (wired in `app/_layout.tsx`).

3) Copy assets from food_ordering-main (required):

- Copy `food_ordering-main/assets/fonts/*.ttf` → `mobile/assets/fonts/`
- Copy `food_ordering-main/assets/icons/*.png` → `mobile/assets/icons/`
- Copy `food_ordering-main/assets/images/*.png` → `mobile/assets/images/`

The filenames must match; these are referenced by `constants/index.ts` and font loader in `app/_layout.tsx`.

4) Start the app:

```powershell
npm run start
```

- Press `a` to open Android (if an emulator is running) or scan the QR code with Expo Go.

## Structure

- `app/` — Expo Router routes `(auth)`, `(tabs)`; `_layout.tsx` sets fonts/theme.
- `components/` — UI building blocks: CustomInput/Button, CartItem, etc.
- `constants/` — Theme assets and demo data.
- `lib/appwrite.ts` — Appwrite SDK setup and data helpers.
- `store/` — Zustand stores (auth, cart).

## Styling

NativeWind (Tailwind) is enabled. Use the `className` prop on RN components:

```tsx
<View className="p-4 bg-white" />
```

Tailwind config lives in `tailwind.config.js`.

## Notes

- Legacy `src/**` (Supabase + React Navigation) is excluded from build and can be deleted once migration is complete.
- Tailwind and NativeWind are wired via `tailwind.config.js`, `babel.config.js` and `metro.config.js` (withNativeWind).
- If you haven’t copied fonts yet, comment out the `useFonts` block in `app/_layout.tsx` temporarily to run without custom fonts.

## Next steps

## Next steps

- Wire Appwrite collections (IDs in `lib/appwrite.ts`) to your project or adapt to your schema.
- Start seeding (optional) with the `lib/seed.ts` from the original project.
- Remove `src/**` once you confirm the new router flow works end-to-end.
