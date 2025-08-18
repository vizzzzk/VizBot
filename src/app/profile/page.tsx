// src/app/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import AvatarUpdater from '@/components/AvatarUpdater';

export default function ProfilePage() {
  const { user, resetPassword } = useAuth();
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handlePasswordReset = async () => {
      if (!user?.email) {
          toast.error("No email found for your account.");
          return;
      }
      setIsSendingReset(true);
      const toastId = toast.loading("Sending reset email...");
      try {
          await resetPassword(user.email);
          toast.success("Password reset email sent. Please check your inbox.", { id: toastId });
      } catch (error: any) {
          toast.error(error.message, {id: toastId});
      } finally {
          setIsSendingReset(false);
      }
  }

  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
        <Separator />
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AvatarUpdater />
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                        Your email address ({user?.email}) is linked to your account and cannot be changed.
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                        Manage your password and account security settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handlePasswordReset} disabled={isSendingReset}>
                        {isSendingReset ? 'Sending...' : 'Send Password Reset Email'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
