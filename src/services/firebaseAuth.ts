// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, updateProfile, sendEmailVerification } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// Register with email and password
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// Register with email/password and set a username (displayName), also send a verification email
export const registerWithEmailAndUsername = async (email: string, password: string, username: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: username });
    try { await sendEmailVerification(auth.currentUser); } catch {}
  }
  return cred.user;
};


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb6SW4PqXVfC51w5yKzLMmfwEsSbTh1SU",
  authDomain: "studytracker-e7ae1.firebaseapp.com",
  projectId: "studytracker-e7ae1",
  storageBucket: "studytracker-e7ae1.appspot.com",
  messagingSenderId: "584135858072",
  appId: "1:584135858072:web:8ba63dcb1d9ec606953ded",
  measurementId: "G-5YB1VSKW2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Guard analytics: only initialize in browser and when safe (reduces console noise in dev)
let analytics: ReturnType<typeof getAnalytics> | undefined;
try {
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (isHttps && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }
} catch {
  // ignore analytics init errors in unsupported environments
}
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    return null;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

export { auth, db };

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// Resend verification email to the currently signed-in user (if any)
export const resendVerificationEmail = async (): Promise<boolean> => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (e) {
      console.error('Resend verification error:', e);
    }
  }
  return false;
};
