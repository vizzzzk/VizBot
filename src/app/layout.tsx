import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "sonner";
import { DebugAuthProvider } from '@/hooks/use-auth';


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
    <html lang="en" className="dark">
      <body>
        <DebugAuthProvider>
          {children}
          <Toaster />
        </DebugAuthProvider>
      </body>
    </html>
  );
}
