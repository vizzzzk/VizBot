// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ⚠️ Firebase client config is public by design. Keep secrets server-side only.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fail-fast check to ensure environment variables are loaded.
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    throw new Error(`[Firebase config] Missing environment variable ${key}. Please check your .env.local file and restart the server.`);
  }
}

if (!String(firebaseConfig.apiKey).startsWith("AIza")) {
  throw new Error("[Firebase config] apiKey does not look valid (should start with 'AIza'). Please check your .env.local file.");
}


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export a single shared auth instance
const auth = getAuth(app);
const storage = getStorage(app);

// Choose your default persistence (local keeps users signed in across tabs/restarts)
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Fallback if third-party cookies blocked etc.
  setPersistence(auth, browserSessionPersistence);
});

export { app, auth, storage };
