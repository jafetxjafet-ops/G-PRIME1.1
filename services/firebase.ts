
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: Credentials must be configured in the Firebase console.
// The API key is obtained from the environment as required.
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "gymg-elite.firebaseapp.com",
  projectId: "gymg-elite",
  storageBucket: "gymg-elite.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
