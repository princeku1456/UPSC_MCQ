// --- DO NOT USE "import" HERE. USE THIS EXACT CODE ---

const firebaseConfig = {
  apiKey: "AIzaSyCTNuIyage6u0TxZureIZt1E18deqZ10UE",
  authDomain: "upsc-mcq-app.firebaseapp.com",
  projectId: "upsc-mcq-app",
  storageBucket: "upsc-mcq-app.firebasestorage.app",
  messagingSenderId: "998675793958",
  appId: "1:998675793958:web:d4eeaae3edbaec8b30bee7",
};

// AI Configuration
// WARNING: This key is exposed to the client. Restrict it by HTTP Referrer in Google Cloud Console.
const GEMINI_API_KEY = "AIzaSyBKEG1pxFGUkKmsjfiN1lle2DzGNT0hGZY";

// Initialize Firebase (Compat Version)
// This checks if the Firebase SDK was loaded successfully in index.html
if (typeof firebase !== "undefined") {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);

    // OPTIMIZATION: Use modern FirestoreSettings.cache
    // This reduces reads and allows multi-tab synchronization
    firebase.firestore().settings({
      localCache: firebase.firestore.persistentLocalCache({
        tabManager: firebase.firestore.persistentMultipleTabManager()
      })
    });
  }
} else {
  console.error("Firebase SDK not found!");
}
