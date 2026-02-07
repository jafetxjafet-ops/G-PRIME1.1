
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export { firebase };
