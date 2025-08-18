'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function AuthNav() {
  const { user, logout } = useAuth();
  return (
    <nav className="w-full py-3 px-4 flex items-center justify-end gap-4 absolute top-0 right-0 z-10">
      {user ? (
         <>
            <p className='text-sm text-muted-foreground'>Welcome, {user.email}</p>
            <Button onClick={logout} variant="ghost">
              Logout
            </Button>
         </>
      ) : (
         <>
            <Button asChild variant="ghost">
              <Link href="/sign-in">
                Sign in
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">
                Create account
              </Link>
            </Button>
         </>
      )}
    </nav>
  );
}
