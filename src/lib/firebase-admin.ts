
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // This will initialize the app with Application Default Credentials
    // It's useful for local development with `gcloud auth application-default login`
    // and for environments like Cloud Run and App Engine.
    console.log("Initializing Firebase Admin with Application Default Credentials.");
    admin.initializeApp();
  }
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
