import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

const ADMIN_SESSION_KEY = 'dab-admin-session';
const ADMIN_TOKEN_COOKIE = 'sb-admin-token';

const isBrowser = () => typeof window !== 'undefined';

export const persistAdminSession = (session) => {
  if (!session) return;
  try {
    const payload = JSON.stringify({
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
      expires_at: session?.expires_at,
    });
    if (isBrowser()) {
      window.localStorage.setItem(ADMIN_SESSION_KEY, payload);
      const maxAge = session?.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 60 * 60 * 12;
      document.cookie = `${ADMIN_TOKEN_COOKIE}=${session?.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  } catch (err) {
    console.warn('Failed to persist admin session', err);
  }
};

export const getStoredAdminSession = () => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Unable to parse stored admin session', err);
    return null;
  }
};

export const clearAdminSession = () => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    document.cookie = `${ADMIN_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to clear admin session', err);
  }
};

export const getAdminTokenFromCookies = (cookieString) => {
  if (!cookieString) return null;
  const tokenPair = cookieString
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_TOKEN_COOKIE}=`));
  return tokenPair ? tokenPair.split('=')[1] : null;
};

export const adminSessionKeys = { ADMIN_SESSION_KEY, ADMIN_TOKEN_COOKIE };
