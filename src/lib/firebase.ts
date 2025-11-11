import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBAjKPMxOT-VgLBwTfYZVLnmJUpkUdv0Ts",
  authDomain: "invensaas-b0781.firebaseapp.com",
  projectId: "invensaas-b0781",
  storageBucket: "invensaas-b0781.firebasestorage.app",
  messagingSenderId: "19568760091",
  appId: "1:19568760091:web:e39c60b296e40ec51cafbe",
  measurementId: "G-CC3FG5NQZY"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
