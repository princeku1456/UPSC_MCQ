// --- DO NOT USE "import" HERE. USE THIS EXACT CODE ---

const firebaseConfig = {
  apiKey: "AIzaSyCTNuIyage6u0TxZureIZt1E18deqZ10UE",
  authDomain: "upsc-mcq-app.firebaseapp.com",
  projectId: "upsc-mcq-app",
  storageBucket: "upsc-mcq-app.firebasestorage.app",
  messagingSenderId: "998675793958",
  appId: "1:998675793958:web:d4eeaae3edbaec8b30bee7",
};

// Initialize Firebase (Compat Version)
// This checks if the Firebase SDK was loaded successfully in index.html
if (typeof firebase !== "undefined") {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);

    // OPTIMIZATION: Enable Offline Persistence to serve data from local disk cache
    firebase
      .firestore()
      .enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("Persistence failed: Multiple tabs open.");
        } else if (err.code === "unimplemented") {
          console.warn("Persistence not supported by browser.");
        }
      });
  }
} else {
  console.error("Firebase SDK not found!");
}
