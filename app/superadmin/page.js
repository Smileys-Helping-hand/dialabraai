'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminRoot() {
  const router = useRouter();
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('sa_session') || 'null');
      if (s?.username && Date.now() - s.ts < 8 * 60 * 60 * 1000) {
        router.replace('/superadmin/dashboard');
        return;
      }
    } catch { /* noop */ }
    router.replace('/superadmin/login');
  }, [router]);
  return null;
}
