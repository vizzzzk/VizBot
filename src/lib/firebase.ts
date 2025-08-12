// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";

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
const getFirebaseApp = (): FirebaseApp | undefined => {
  // This function should only be called on the client-side.
  if (typeof window === "undefined") {
    return undefined;
  }

  // If apps are already initialized, return the default app
  if (getApps().length > 0) {
    return getApp();
  }

  // In a deployed App Hosting environment, `window.firebaseConfig` will be populated.
  // For local development, it uses the firebaseConfig object defined above from your .env file.
  const config = (window as any).firebaseConfig ?? firebaseConfig;

  // Ensure the config object has the necessary keys before initializing
  if (config && config.apiKey) {
    return initializeApp(config);
  } else {
    // Log an error if the config is missing. This will show in the browser console.
    console.error("Firebase config is missing. Please check your .env.local file or App Hosting setup.");
    return undefined;
  }
};

// Call the function to get the app instance.
// This will be `undefined` on the server and the FirebaseApp instance on the client.
const app = getFirebaseApp();

export { app };
