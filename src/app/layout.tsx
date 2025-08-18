import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "sonner";
import { ClerkProvider } from '@clerk/nextjs';
import AuthNav from '@/components/auth-nav';

export const metadata: Metadata = {
  title: 'VizBot',
  description: 'A web interface for your bot.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className="dark">
        <body>
          <AuthNav />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
