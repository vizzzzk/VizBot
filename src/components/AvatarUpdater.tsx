// src/components/AvatarUpdater.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2 } from 'lucide-react';


export default function AvatarUpdater() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.photoURL ?? null);
  const [name, setName] = useState(user?.displayName ?? '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const taskRef = useRef<ReturnType<typeof uploadBytesResumable> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        setName(user.displayName ?? '');
        setPreview(user.photoURL ?? null);
    }
  }, [user]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!/^image\/(png|jpeg|webp|jpg)$/.test(f.type)) {
      toast.error('Please select a PNG/JPG/WEBP image.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5 MB).');
      return;
    }
    setFile(f);
  };

  const cancelUpload = () => {
    taskRef.current?.cancel();
    setBusy(false);
    setProgress(0);
    toast.info('Upload canceled.');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); 
    setProgress(0);

    const toastId = toast.loading("Updating profile...");

    if (!user) {
      setBusy(false); 
      toast.error('You must be signed in to update your profile.', { id: toastId }); 
      return;
    }

    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setBusy(false);
      toast.error('Upload timed out. Please check your network and try again.', { id: toastId });
    }, 20000); // 20s guard

    try {
      let photoURL = user.photoURL ?? null;

      if (file) {
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const path = `users/${user.uid}/avatar_${Date.now()}.${ext}`;
        const storageRef = ref(storage, path);

        const task = uploadBytesResumable(storageRef, file, {
          contentType: file.type || 'image/png',
          cacheControl: 'public,max-age=3600',
        });
        taskRef.current = task;

        photoURL = await new Promise<string>((resolve, reject) => {
          task.on(
            'state_changed',
            snap => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
              setProgress(pct);
            },
            error => {
                // e.g. storage/unauthorized
                console.error("Upload failed:", error.code, error.message);
                reject(new Error(`Upload failed: ${error.code}. Check storage rules.`));
            },
            async () => {
              try {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
              } catch (e) {
                reject(e);
              }
            }
          );
        });
      }

      await updateProfile(user, {
        displayName: name || undefined,
        photoURL: photoURL || undefined,
      });

      await user.reload(); // Ensures the user object is fresh
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (e: any) {
      console.error('Avatar update error:', e?.code, e?.message || e);
      toast.error(e?.message || 'Failed to update profile.', { id: toastId });
    } finally {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      setBusy(false);
      setFile(null); // Clear file after upload attempt
      taskRef.current = null;
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
    <form onSubmit={handleUpdate} className="space-y-6">
        <div className="flex items-center gap-4">
             <Avatar className="h-20 w-20">
                <AvatarImage src={preview ?? `https://placehold.co/128x128.png`} alt={user?.displayName ?? 'User'} data-ai-hint="profile picture" />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onPick}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
            />
            <div className='flex-grow'>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Picture
                </Button>
                {progress > 0 && busy && (
                    <div className='mt-2'>
                        <Progress value={progress} className="w-full" />
                        <button type="button" className="text-xs underline mt-1 text-muted-foreground" onClick={cancelUpload}>
                         Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full name</label>
        <Input
          id="fullName"
          className="w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      
      <Button type="submit" disabled={busy}>
        {busy ? 'Updating…' : 'Update Profile'}
      </Button>
    </form>
  );
}
