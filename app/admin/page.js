'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <p className="text-charcoal/70">Redirecting to admin login...</p>
    </div>
  );
}
