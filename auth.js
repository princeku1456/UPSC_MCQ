/* =========================================
   1. GLOBAL VARIABLES
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;
let currentSubject = "";
let currentChapterId = "";
let currentChapterName = "";
let currentQuizData = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let quizSubmitted = false;
let isReviewMode = false;
let reviewSource = null;
let isRegistering = false;

const quizDataCache = {};
let userHistory = [];
let dashboardDataLoaded = false;
let globalStatsCache = {};
let leaderboardCache = {};
let performanceChartInstance = null;
let comparisonChartInstance = null;
let quizTimerInterval = null;
let currentReviewStats = null;

/* =========================================
   1.5 DARK MODE FUNCTIONS
   ========================================= */

/**
 * Applies the specified theme to the document
 * @param {string} theme - Either 'light' or 'dark'
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update button icon
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
  
  // Refresh charts if they exist to apply dark mode colors
  if (performanceChartInstance) {
    renderPerformanceChart(userHistory);
  }
  if (comparisonChartInstance && currentReviewStats) {
    // Re-render comparison chart with new theme
    const ctx = document.getElementById('comparisonChart');
    if (ctx) {
      const isDark = theme === 'dark';
      const textColor = isDark ? '#e5e7eb' : '#666';
      
      if (comparisonChartInstance) {
        comparisonChartInstance.options.scales.x.ticks.color = textColor;
        comparisonChartInstance.options.scales.y.ticks.color = textColor;
        comparisonChartInstance.update();
      }
    }
  }
}

/**
 * Toggles between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/* =========================================
   2. INITIALIZATION & AUTH
   ========================================= */

auth.onAuthStateChanged((user) => {
  if (user) {
    user
      .reload()
      .then(() => {
        const freshUser = auth.currentUser;
        if (freshUser && !freshUser.emailVerified) {
          currentUser = null;
          updateUIForLogout();
          showHome();
          auth.signOut();
          return;
        }
        currentUser = freshUser;
        updateUIForLogin();
        showDashboard();
      })
      .catch((err) => {
        console.error("Auth sync error:", err);
        auth.signOut();
      });
  } else {
    currentUser = null;
    userHistory = [];
    dashboardDataLoaded = false;
    globalStatsCache = {};
    leaderboardCache = {};
    updateUIForLogout();
    showHome();
  }
});

function signInWithGoogle() {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      toastr.success("Signed in with Google successfully!");
    })
    .catch((error) => {
      console.error("Google Auth Error:", error);
      handleAuthError(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
});

function toggleAuthMode() {
  isRegistering = !isRegistering;
  const btn = document.getElementById("auth-submit-btn");
  const link = document.querySelector(".card-body small a");
  const title = document.getElementById("auth-title");
  const sub = document.getElementById("auth-subtitle");
  
  // We no longer need to find or hide the google-auth-container here
  // because we want it to stay visible in both modes.

  if (isRegistering) {
    title.textContent = "Create Account";
    sub.textContent = "Join us to start practicing.";
    btn.textContent = "Register";
    link.textContent = "Login here";
  } else {
    title.textContent = "Welcome Back!";
    sub.textContent = "Login to access your dashboard.";
    btn.textContent = "Login";
    link.textContent = "Register here";
  }
}

document.getElementById("auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-password").value;

  if (!email || !pass) {
    toastr.warning("Please enter both email and password.");
    return;
  }

  if (isRegistering) {
    auth
      .createUserWithEmailAndPassword(email, pass)
      .then((userCredential) => {
        userCredential.user.sendEmailVerification();
        toastr.success(
          "Account created! Please verify your email (check spam folder), then login."
        );
        document.getElementById("auth-password").value = "";
        if (isRegistering) toggleAuthMode();
        auth.signOut();
      })
      .catch((err) => handleAuthError(err));
  } else {
    auth
      .signInWithEmailAndPassword(email, pass)
      .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
          toastr.error("Login denied: Email not verified. Please verify your email. (check spam folder)");
          auth.signOut();
        } else {
          toastr.success("Logged in successfully!");
        }
      })
      .catch((err) => handleAuthError(err));
  }
});

function handleAuthError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      toastr.error("This email is already registered.");
      break;
    case "auth/weak-password":
      toastr.error("Password is too weak. Min 6 characters.");
      break;
    case "auth/user-not-found":
    case "auth/wrong-password":
      toastr.error("Invalid email or password.");
      break;
    case "auth/popup-closed-by-user":
      toastr.info("Login cancelled.");
      break;
    default:
      toastr.error(error.message);
  }
}

function logoutUser() {
  auth.signOut().then(() => {
    toastr.info("Logged out");
  });
}

function updateUIForLogin() {
  document.getElementById("user-profile").style.display = "block";
  const userName = currentUser.email ? currentUser.email.split("@")[0] : "User";
  document.getElementById("user-name-display").textContent = userName;
}

function updateUIForLogout() {
  document.getElementById("user-profile").style.display = "none";
}

function handleLogoClick() {
  if (currentUser && currentUser.emailVerified) showDashboard();
  else showHome();
}

function hideAllSections() {
  const sections = [
    "hero-section",
    "dashboard-section",
    "performance-section",
    "test-selection-section",
    "quiz-section",
  ];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function showHome() {
  hideAllSections();
  document.getElementById("hero-section").style.display = "flex";
}

function showDashboard() {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  hideAllSections();
  document.getElementById("dashboard-section").style.display = "block";
  loadUserDashboard();
}

function showPerformance() {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  hideAllSections();
  document.getElementById("performance-section").style.display = "block";
}

function showTestSelection() {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  hideAllSections();
  document.getElementById("test-selection-section").style.display = "block";
  renderSubjects();
}

function exitQuiz() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);

  if (isReviewMode && reviewSource === "performance") {
    showPerformance();
  } else {
    hideAllSections();
    document.getElementById("test-selection-section").style.display = "block";
    renderChapters(currentSubject);
  }
}