// --- DO NOT USE "import" HERE. USE THIS EXACT CODE ---

const firebaseConfig = {
    apiKey: "AIzaSyCTNuIyage6u0TxZureIZt1E18deqZ10UE",
    authDomain: "upsc-mcq-app.firebaseapp.com",
    projectId: "upsc-mcq-app",
    storageBucket: "upsc-mcq-app.firebasestorage.app",
    messagingSenderId: "998675793958",
    appId: "1:998675793958:web:d4eeaae3edbaec8b30bee7"
};

// Initialize Firebase (Compat Version)
// This checks if the Firebase SDK was loaded successfully in index.html
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.error("Firebase SDK not found! Make sure you added the scripts in index.html");
}