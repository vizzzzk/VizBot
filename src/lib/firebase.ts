// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

// ⚠️ Firebase client config is public by design. Keep secrets server-side only.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Fail-fast check to ensure environment variables are loaded.
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
    throw new Error("Missing Firebase config. Make sure .env file is set up correctly and the dev server is restarted.");
}


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export a single shared auth instance
const auth = getAuth(app);

// Choose your default persistence (local keeps users signed in across tabs/restarts)
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Fallback if third-party cookies blocked etc.
  setPersistence(auth, browserSessionPersistence);
});

export { app, auth };
