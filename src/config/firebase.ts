import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

const config = window.APP_CONFIG || {};

const firebaseConfig = {
  apiKey: config.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgABxwmyDoNTmU5N2WLyZJb55_qktyow0",
  authDomain: config.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sara-sandbox-interns.firebaseapp.com",
  projectId: config.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID || "sara-sandbox-interns",
  storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sara-sandbox-interns.firebasestorage.app",
  messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "53494160780",
  appId: config.VITE_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || "1:53494160780:web:87ae2f5fca3aa4bd3ccaa9"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig); // Registers your specific client application with Firebase SDK, reads credentials(your API key, Project ID...)

// Initialize Firebase Auth
const auth = getAuth(app); // Auth layer, keeps track of whether a user is logged in, manages session tokens and browser storage..

// Conditionally connect to Firebase Auth Emulator
const useEmulator = config.VITE_USE_FIREBASE_EMULATOR !== undefined
  ? config.VITE_USE_FIREBASE_EMULATOR === 'true'
  : import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator) {
  const authHost = config.VITE_FIREBASE_AUTH_EMULATOR_HOST || import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  connectAuthEmulator(auth, `http://${authHost}`);
  console.log(`[Firebase Auth] Connected to local emulator at http://${authHost}`);
}

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider(); // Tells firebase you want to use Google OAuth for SSO
googleProvider.setCustomParameters({
  prompt: 'select_account' // always shows the Google sign-in pop-up, asking user to choose which Google account they want to use. 
});

export { auth, googleProvider };
