import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "sonner";
import { Roboto_Mono } from 'next/font/google';

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
    <html lang="en" className={`${robotoMono.variable}`}>
      <body className="font-code antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
