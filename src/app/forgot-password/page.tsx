// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(''); 
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null); 
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setBusy(true); 
    setErr(null); 
    setMsg(null);
    try { 
      await resetPassword(email); 
      setMsg('Password reset email sent. Check your inbox.'); 
    } catch (e:any) { 
      setErr(e.message); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
       <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>
                Enter your email to receive a password reset link.
            </CardDescription>
        </CardHeader>
        <form onSubmit={submit}>
            <CardContent className="grid gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        autoFocus
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                    />
                </div>
                {err && <p className="text-sm text-destructive">{err}</p>}
                {msg && <p className="text-sm text-green-600">{msg}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                 <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Sending..." : "Send reset link"}
                </Button>
                <div className="mt-4 text-center text-sm">
                    <Link href="/sign-in" className="underline">
                        Back to sign in
                    </Link>
                </div>
            </CardFooter>
        </form>
       </Card>
    </div>
  );
}
