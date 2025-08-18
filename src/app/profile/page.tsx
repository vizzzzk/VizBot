// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, updateUserProfile, resetPassword, updateUserProfilePicture } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || displayName === user.displayName) return;

    setIsSaving(true);
    const toastId = toast.loading('Saving profile...');

    try {
      await updateUserProfile({ displayName });
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

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

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File is too large. Please select an image under 2MB.");
        return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading picture...");
    try {
        await updateUserProfilePicture(file);
        toast.success("Profile picture updated successfully!", { id: toastId });
    } catch (error: any) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsUploading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };


  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
        <Separator />
        <div className="grid gap-6">
           <form onSubmit={handleProfileUpdate}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.photoURL ?? `https://placehold.co/128x128.png`} alt={user?.displayName ?? 'User'} data-ai-hint="profile picture" />
                            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePictureUpload}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Picture
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your full name"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                         <Input
                            id="email"
                            value={user?.email ?? ''}
                            readOnly
                            disabled
                            className="cursor-not-allowed"
                        />
                    </div>

                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving || displayName === user?.displayName}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
           </form>

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
