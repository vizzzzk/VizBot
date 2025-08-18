'use client';
import { useAuth } from '@/lib/use-auth';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <AuthGuard>
       <div className="min-h-screen grid place-items-center p-6">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Profile</CardTitle>
                 <CardDescription>Your user information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <p><b>Email:</b> {user?.email}</p>
                <p><b>Name:</b> {user?.displayName ?? '—'}</p>
                <p><b>UID:</b> {user?.uid}</p>
                <p><b>Email verified:</b> {user?.emailVerified ? 'Yes' : 'No'}</p>
            </CardContent>
            <CardFooter>
                 <Button onClick={logout} variant="outline">Log out</Button>
            </CardFooter>
        </Card>
       </div>
    </AuthGuard>
  );
}
