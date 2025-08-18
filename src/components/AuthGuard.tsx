// src/components/AuthGuard.tsx
'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading) return; // wait for Firebase to resolve
    if (!user && !redirected.current) {
      redirected.current = true; // prevent double redirects
      // Optional: if user lands on a protected deep link, remember it
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/sign-in?next=${next}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <div className="grid min-h-[50vh] place-items-center">Loading…</div>;
  }
  return <>{children}</>;
}
