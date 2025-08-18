'use client';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignIn
        appearance={{ elements: { card: 'shadow-xl' } }}
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
