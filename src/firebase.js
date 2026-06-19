import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Paste your Firebase Config object here
// You can get this from Firebase Console -> Project Settings -> General -> Web Apps
const firebaseConfig = {
  apiKey: "AIzaSyDR3eS7wi1IZJ1o_-kXB0OyveE6zlISIfs",
  authDomain: "siya-bday.firebaseapp.com",
  projectId: "siya-bday",
  storageBucket: "siya-bday.firebasestorage.app",
  messagingSenderId: "45908746711",
  appId: "1:45908746711:web:a295fc36fc03f80b464872",
  measurementId: "G-C09ZRF9D40"
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
