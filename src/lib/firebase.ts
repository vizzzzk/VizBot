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
let app: FirebaseApp;
if (typeof window !== "undefined") {
  // This function should only be called on the client-side.
  const apps = getApps();
  if (apps.length > 0) {
    app = getApp();
  } else {
    // In a deployed App Hosting environment, `window.firebaseConfig` will be populated.
    // For local development, it uses the firebaseConfig object defined above from your .env file.
    const config = (window as any).firebaseConfig ?? firebaseConfig;

    if (config && config.apiKey) {
      app = initializeApp(config);
    } else {
      console.error("Firebase config is missing. Please check your .env.local file or App Hosting setup.");
      // Provide a dummy app or handle the error gracefully
      // This part is tricky, as without a config, Firebase can't work.
      // For now, we'll let it error out in the console but prevent a hard crash here.
    }
  }
}

export { app };
