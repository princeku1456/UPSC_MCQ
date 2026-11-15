import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import DataManager from '../lib/dataManager';
import { toastr } from '../lib/toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const performMorningSync = useCallback(async () => {
    try {
      await DataManager.fetchQuizManifest(true);
      await DataManager.fetchPracticeManifest(true);
      await DataManager.invalidateCacheByPrefix('quiz_questions_');
      await DataManager.invalidateCacheByPrefix('practice_questions_');
      await DataManager.invalidateCacheByPrefix('global_stats_');
    } catch (e) {
      console.error('Morning sync failed:', e);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload();
          const freshUser = auth.currentUser;
          if (freshUser && !freshUser.emailVerified) {
            setUser(null);
            await signOut(auth);
            setLoading(false);
            return;
          }
          setUser(freshUser);
          performMorningSync();
        } catch (err) {
          console.error('Auth sync error:', err);
          await signOut(auth);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [performMorningSync]);

  const login = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        toastr.error('Login denied: Email not verified. Please verify your email (check spam folder).');
        await signOut(auth);
        return;
      }
      toastr.success('Logged in successfully!');
    } catch (err) {
      handleAuthError(err);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      toastr.success('Account created! Please verify your email (check spam folder), then login.');
      await signOut(auth);
    } catch (err) {
      handleAuthError(err);
    }
  }, []);

  const googleSignIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toastr.success('Signed in with Google successfully!');
    } catch (err) {
      handleAuthError(err);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    toastr.info('Logged out');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, theme, toggleTheme, login, register, googleSignIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function handleAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      toastr.error('This email is already registered.');
      break;
    case 'auth/weak-password':
      toastr.error('Password is too weak. Min 6 characters.');
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      toastr.error('Invalid email or password.');
      break;
    case 'auth/popup-closed-by-user':
      toastr.info('Login cancelled.');
      break;
    default:
      toastr.error(error.message);
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
