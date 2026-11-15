import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTNuIyage6u0TxZureIZt1E18deqZ10UE",
  authDomain: "upsc-mcq-app.firebaseapp.com",
  projectId: "upsc-mcq-app",
  storageBucket: "upsc-mcq-app.firebasestorage.app",
  messagingSenderId: "998675793958",
  appId: "1:998675793958:web:d4eeaae3edbaec8b30bee7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

enableIndexedDbPersistence(db, { synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open; persistence enabled in only one tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence.');
  }
});

export { app, auth, db, googleProvider };
