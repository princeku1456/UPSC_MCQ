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
const GEMINI_API_KEY = null;

// Initialize Firebase (Compat Version)
// This checks if the Firebase SDK was loaded successfully in index.html
if (typeof firebase !== "undefined") {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);

    // OPTIMIZATION: Use modern FirestoreSettings.cache
    // This reduces reads and allows multi-tab synchronization
    try {
        firebase.firestore().settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
    } catch (err) {
        if (err.code !== 'failed-precondition') {
            console.error("Firestore settings error", err);
        }
    }

    // Enable offline persistence separately in compat v9/v10
    if (firebase.firestore().enablePersistence) {
        firebase.firestore().enablePersistence({ synchronizeTabs: true })
            .catch(function(err) {
                if (err.code == 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
                } else if (err.code == 'unimplemented') {
                    console.warn('The current browser does not support all of the features required to enable persistence');
                }
            });
    }

  }
} else {
  console.error("Firebase SDK not found!");
}
