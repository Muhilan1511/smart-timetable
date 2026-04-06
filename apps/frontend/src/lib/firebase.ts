import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBAgWpHEcBfRAUYxoAZIT-0mwOmXWwdB_I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-timetable-78834.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-timetable-78834",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://smart-timetable-78834-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-timetable-78834.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "146723746861",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:146723746861:web:56f7dac6b08af42b99b4a4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZF18XEWLWZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app, firebaseConfig.databaseURL);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Storage persistence is best-effort in constrained browser contexts.
});