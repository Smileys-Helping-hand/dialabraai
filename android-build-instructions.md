# Android Build & Packaging (Capacitor)

These notes capture the Android packaging flow for the Dial-A-Braai admin dashboard. The app is optimized to boot directly into the admin order feed, persist admin sessions, and ship with branded splash/icon assets.

## Prerequisites
- Node 18+
- Java 17 (matching the Android Gradle plugin)
- Android Studio with Android SDK, platform tools, and an emulator or USB-debuggable device
- Supabase env set locally: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Production build steps
1. Install dependencies
   ```bash
   npm install
   ```
2. Build Next.js output (app router) and export static assets for Capacitor
   ```bash
   npm run build
   npm run export
   ```
   This populates the `out/` directory used by Capacitor (`webDir`).
3. Sync native platforms
   ```bash
   npx cap sync android
   ```
4. Open Android Studio
   ```bash
   npx cap open android
   ```
5. Build/Run from Android Studio (or CLI `./gradlew assembleDebug`).

## Start URL and routing
- `capacitor.config.ts` includes `startPath: '/admin/orders'` to hint native loading into the admin order feed. When using a live dev server, set `CAP_SERVER_URL` in `capacitor.config.ts` (or the generated native config) to point to your host—keep the `/admin/orders` path so the WebView boots into the dashboard.
- WebView navigation is allowed for all hosts (`allowNavigation: ['*']`) to support Supabase/CDN assets.

## Splash screen & icon
- Provide 1:1 SVG/PNG logo at least 1024x1024, background color `#1A1715` (charcoal) with flame/gold accents.
- Use `npx capacitor-assets generate --android --icon path/to/icon.png --splash path/to/splash.png` after placing assets in your repo; rerun `npx cap sync android` afterward.
- Splash settings are preconfigured via the `SplashScreen` plugin in `capacitor.config.ts` with a 1.8s display and centered crop.

## Persistent admin login
- Admin sessions are stored via localStorage and mirrored into a cookie (`sb-admin-token`) by `lib/supabase.js`.
- CapacitorCookies plugin is enabled in the config to keep tokens across WebView restarts. Clearing app storage will sign the admin out.

## Performance & offline notes
- Prefer compressed hero/menu images (<= 150 KB where possible) and set width/height in components to avoid layout shift.
- Rely on ISR or static export for menu/menu list pages; admin views remain client-driven with Supabase subscriptions for real-time updates.
- Enable HTTP cache for Supabase storage/CDN assets; Cap WebView respects caching headers.
- Use `webContentsDebuggingEnabled: false` in production (already set) to reduce overhead; toggle to `true` for debugging builds only.

## Updating the start path or hostname
- Edit `startPath` or `hostname` in `capacitor.config.ts` and rerun `npx cap sync android` to propagate changes into native configs (`android/app/src/main/assets/capacitor.config.json`).

