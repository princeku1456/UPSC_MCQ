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
let markedForReview = {};
let currentQuizData = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let quizSubmitted = false;
let isReviewMode = false;
let reviewSource = null;
let isRegistering = false;
let isPracticeMode = false; // Isse global banayein hain taaki practice.js mein bhi access ho sake
let currentDashboardMode = 'quiz'; // 'quiz' or 'practice'

const quizDataCache = {};
let userHistory = [];
let practiceHistory = [];
let confidenceChartInstance = null; //
let globalConfidenceChartInstance = null; //
let dashboardDataLoaded = false;
let performanceChartInstance = null;
let comparisonChartInstance = null;
let currentQuizTimer = null;
let currentReviewStats = null;
// Add these to auth.js
let isTimerPaused = false;
let currentTimerSeconds = 0;
/* =========================================
   MORNING SYNC LOGIC
   ========================================= */

/**
 * Checks if it's a new day and fetches all questions if necessary.
 */
/* =========================================
   MORNING SYNC LOGIC (Updated)
   ========================================= */
async function performMorningSync() {
  console.log("🌞 Refreshing manifests and clearing cache...");

  try {
    // 1. Force Refresh Manifests (Subjects & Chapters)
    // 2. Clear Question & Stats Cache to ensure fresh content on reload
    // This addresses the user requirement: "Refresh page = Get new data"
    // Executed in parallel for performance optimization
    await Promise.all([
      DataManager.fetchQuizManifest(true),
      DataManager.fetchPracticeManifest(true),
      DataManager.invalidateCacheByPrefix("quiz_questions_"),
      DataManager.invalidateCacheByPrefix("practice_questions_"),
      DataManager.invalidateCacheByPrefix("global_stats_")
    ]);

    console.log("✅ Sync complete. Cache invalidated.");
  } catch (error) {
    console.error("Morning sync failed:", error);
  }
}

/* =========================================
   1.5 DARK MODE FUNCTIONS
   ========================================= */

/**
 * Applies the specified theme to the document
 * @param {string} theme - Either 'light' or 'dark'
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  // Refresh Dashboard Charts
  if (typeof refreshDashboardChartsOnly === 'function') {
    refreshDashboardChartsOnly();
  }

  // Refresh Review Mode Chart
  if (comparisonChartInstance && currentReviewStats) {
    renderReviewMode(null); // Triggers re-render with current theme context
  }
}
/**
 * Toggles between light and dark themes
 */
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
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
          hideGlobalLoader();
          return;
        }
        currentUser = freshUser;
        updateUIForLogin();
        showDashboard();
        performMorningSync();
        hideGlobalLoader();
      })
      .catch((err) => {
        console.error("Auth sync error:", err);
        auth.signOut();
        hideGlobalLoader();
      });
  } else {
    currentUser = null;
    userHistory = [];
    dashboardDataLoaded = false;
    updateUIForLogout();
    showHome();
    hideGlobalLoader();
  }
});

function signInWithGoogle() {
  auth
    .signInWithPopup(googleProvider)
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
          toastr.error(
            "Login denied: Email not verified. Please verify your email. (check spam folder)"
          );
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
  renderBreadcrumbs([]);
}

function showDashboard() {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  isPracticeMode = false;
  hideAllSections();
  document.getElementById("dashboard-section").style.display = "block";
  loadUserDashboard();
  renderBreadcrumbs([
      { label: 'Home', onclick: 'showHome()' },
      { label: 'Dashboard' }
  ]);
}

function showPerformance() {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  isPracticeMode = false;
  hideAllSections();
  document.getElementById("performance-section").style.display = "block";
  renderBreadcrumbs([
      { label: 'Home', onclick: 'showHome()' },
      { label: 'Dashboard', onclick: 'showDashboard()' },
      { label: 'Performance' }
  ]);
}

function showTestSelection() {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  isPracticeMode = false;
  hideAllSections();
  document.getElementById("test-selection-section").style.display = "block";
  renderSubjects(); // This will now fetch data if it's missing
}

function exitQuiz() {
  if (currentQuizTimer) currentQuizTimer.stop();

  // Check if we are in Practice Mode
  if (isPracticeMode) {
    startPracticeSelection(); // Practice configuration page par wapas le jayega
    return;
  }

  // Regular Quiz Logic
  if (isReviewMode && reviewSource === "performance") {
    showPerformance();
  } else if (currentSubject && allQuizData[currentSubject]) {
    hideAllSections();
    document.getElementById("test-selection-section").style.display = "block";
    renderChapters(currentSubject);
  } else {
    // Safety Fallback: Agar kuch samajh na aaye toh Dashboard dikhao
    showDashboard();
  }
}

/* --- Add this helper function at the bottom of auth.js --- */
function hideGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.add("loader-hidden");
    // Completely remove from layout after transition
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }
}


/* =========================================
   BREADCRUMBS UTILITY
   ========================================= */
function renderBreadcrumbs(breadcrumbs) {
  const container = document.getElementById("breadcrumb-container");
  if (!container) return;

  if (!breadcrumbs || breadcrumbs.length === 0) {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }

  container.style.display = "block";
  container.innerHTML = ""; // Clear existing content

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "breadcrumb");

  const ol = document.createElement("ol");
  ol.className = "breadcrumb bg-transparent p-0 m-0";

  breadcrumbs.forEach((item, index) => {
    const isLast = index === breadcrumbs.length - 1;
    const li = document.createElement("li");

    if (isLast) {
      li.className = "breadcrumb-item active text-truncate";
      li.setAttribute("aria-current", "page");
      li.textContent = item.label; // Safe text content
    } else {
      li.className = "breadcrumb-item";
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = item.label; // Safe text content
      if (item.onclick) {
        // We expect item.onclick to be a function call string like "showHome()"
        // To be safe, we assign it to the onclick attribute but this is still slightly fragile if not careful.
        // However, setting it via attribute handles quotes better than string concat.
        // Better yet: attach event listener if possible, but our architecture passes strings.
        // We will sanitize the string slightly or just trust it's a function call.
        // Given the legacy architecture, we will use setAttribute('onclick', ...) but prepend event.preventDefault()
        a.setAttribute("onclick", `event.preventDefault(); ${item.onclick}`);
      }
      li.appendChild(a);
    }
    ol.appendChild(li);
  });

  nav.appendChild(ol);
  container.appendChild(nav);
}
