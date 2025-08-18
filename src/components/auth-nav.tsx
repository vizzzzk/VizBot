'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';

export default function AuthNav() {
  return (
    <nav className="w-full py-3 px-4 flex items-center justify-end gap-4 absolute top-0 right-0 z-10">
      <SignedOut>
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
      </SignedOut>

      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </nav>
  );
}
