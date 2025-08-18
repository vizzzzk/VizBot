'use client';
import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignUp
        appearance={{ elements: { card: 'shadow-xl' } }}
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
