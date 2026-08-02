import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForLedgerShopApp123456',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ledger-shop-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ledger-shop-app',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:100200300400:web:abcdef1234567890',
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return {
      firebaseUser: result.user,
      idToken,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    };
  } catch (err: any) {
    // If popup closed or not configured yet in Firebase console, handle gracefully
    console.warn('Firebase popup sign-in notice/error:', err);
    throw err;
  }
}

export function signOutFirebase() {
  return firebaseSignOut(auth).catch(() => {});
}
