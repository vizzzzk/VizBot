
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

let app: FirebaseApp | undefined;

// Initialize Firebase only on the client side
if (typeof window !== "undefined") {
  if (!getApps().length) {
    // This configuration will be used for both local development and deployed environments.
    // In a deployed App Hosting environment, the config object will be automatically populated.
    // For local development, it uses the firebaseConfig object defined above from your .env.local file.
    const config = (window as any).firebaseConfig ?? firebaseConfig;
    if (config && config.apiKey) {
      app = initializeApp(config);
    } else {
      console.error("Firebase config is missing. Please check your .env.local file or App Hosting setup.");
    }
  } else {
    app = getApp();
  }
}

export { app };
