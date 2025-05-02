import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOSf31twW4bN80e8lVAMA6jA3NkyPzehg",
  authDomain: "naocrm-cde53.firebaseapp.com",
  projectId: "naocrm-cde53",
  storageBucket: "naocrm-cde53.firebasestorage.app",
  messagingSenderId: "486597790447",
  appId: "1:486597790447:web:2fb2f6493463a8e5d9691a",
};

// Initialiser Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
