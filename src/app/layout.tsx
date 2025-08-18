import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "sonner";
import { Roboto_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import AuthNav from '@/components/auth-nav';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

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
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${robotoMono.variable} font-code antialiased`}>
          <AuthNav />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
