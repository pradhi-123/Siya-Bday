import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Paste your Firebase Config object here
// You can get this from Firebase Console -> Project Settings -> General -> Web Apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Auto-check if user has replaced the default configuration template
const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "" &&
  !firebaseConfig.apiKey.startsWith("YOUR_") &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "" &&
  !firebaseConfig.projectId.startsWith("YOUR_");

let app = null;
let db = null;
let storage = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully! Cloud Sync Active. ☁️");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.log("Firebase config not found or using default placeholders. Running in Local Mode. 🔒");
}

export { db, storage };
export const isFirebaseConfigured = isConfigured && db !== null;
