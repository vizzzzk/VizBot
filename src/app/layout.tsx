import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "sonner";
import { AuthProvider } from '@/lib/use-auth';


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
    <AuthProvider>
      <html lang="en" className="dark">
        <body className='font-code'>
          {children}
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
