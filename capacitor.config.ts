import { CapacitorConfig } from '@capacitor/cli';

const startPath = '/admin/orders';

const config = {
  appId: 'com.dialabraai.app',
  appName: 'Dial-A-Braai Admin',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    hostname: 'dialabraai.admin',
    allowNavigation: ['*'],
    cleartext: true,
    // Hint for native WebView routing; ensure Android loads the admin dashboard first.
    // If you use a live dev server, set CAP_SERVER_URL to override this hostname.
    startPath,
  },
  android: {
    backgroundColor: '#1A1715',
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#1A1715',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
} satisfies CapacitorConfig & { server: CapacitorConfig['server'] & { startPath?: string } };

export default config;
