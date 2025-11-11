import admin from 'firebase-admin';
import { getApp, getApps } from 'firebase-admin/app';

export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'invensaas-b0781';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Initialize with default credentials for development
      admin.initializeApp({
        projectId,
      });
    }
  }

  return getApp();
}

// Initialize admin app
initializeFirebaseAdmin();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();