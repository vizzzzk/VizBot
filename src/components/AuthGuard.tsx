// src/components/AuthGuard.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from 'lucide-react';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until loading is complete
    }

    if (!user) {
      // Remember the path the user wanted to visit
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/sign-in${next}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Loader className="animate-spin text-primary" />
            <p className="ml-2">Authenticating...</p>
        </div>
    );
  }

  return <>{children}</>;
}
