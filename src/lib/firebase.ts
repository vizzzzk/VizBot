// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration is automatically provided by App Hosting.
// https://firebase.google.com/docs/hosting/frameworks/nextjs
// For local development, you'll need to add your own firebaseConfig object
// and set up a .env.local file with your project's credentials.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A function to safely initialize and get the Firebase app
let app: FirebaseApp;
if (typeof window !== "undefined") {
  const apps = getApps();
  if (apps.length > 0) {
    app = getApp();
  } else {
    // In a deployed App Hosting environment, `window.firebaseConfig` will be populated.
    // For local development, it uses the firebaseConfig object defined above from your .env file.
    const config = (window as any).firebaseConfig ?? firebaseConfig;
    if (config && config.apiKey) {
      app = initializeApp(config);
    }
  }
}

// It's safe to call these here because the `app` instance is guarded.
// These will only be used on the client-side where `app` is initialized.
// @ts-ignore
const auth = getAuth(app);
// @ts-ignore
const db = getFirestore(app);


export { app, auth, db };
