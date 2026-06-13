import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgABxwmyDoNTmU5N2WLyZJb55_qktyow0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sara-sandbox-interns.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sara-sandbox-interns",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sara-sandbox-interns.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "53494160780",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:53494160780:web:87ae2f5fca3aa4bd3ccaa9"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Conditionally connect to Firebase Auth Emulator
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  connectAuthEmulator(auth, `http://${authHost}`);
  console.log(`[Firebase Auth] Connected to local emulator at http://${authHost}`);
}

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
