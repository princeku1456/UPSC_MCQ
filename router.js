/* =========================================
   ROUTER LOGIC
   ========================================= */

const router = {
  routes: [
    { path: /^\/$/, handler: showHome },
    { path: /^\/login$/, handler: showHome },
    { path: /^\/dashboard$/, handler: showDashboard, protected: true },
    { path: /^\/tests$/, handler: showTestSelection, protected: true },
    {
      path: /^\/tests\/([^\/]+)$/,
      handler: (match) => renderChapters(decodeURIComponent(match[1])),
      protected: true,
    },
    {
      path: /^\/quiz\/([^\/]+)\/([^\/]+)$/,
      handler: (match) =>
        loadQuiz(
          decodeURIComponent(match[1]),
          decodeURIComponent(match[2]),
          decodeURIComponent(match[2])
        ),
      protected: true,
    },
    { path: /^\/practice$/, handler: startPracticeSelection, protected: true },
  ],

  async handleLocation() {
    let path = location.hash.slice(1) || "/";

    // Normalize path (remove trailing slash if exists and length > 1)
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // Find matching route
    const route = this.routes.find((r) => r.path.test(path));

    if (route) {
      // Check auth for protected routes
      // We rely on auth.js to have set currentUser before calling this on initial load.
      // For subsequent navigation, currentUser should be set.
      if (route.protected && (!currentUser || !currentUser.emailVerified)) {
        // If not authenticated, redirect to login
        window.location.hash = "#/";
        return;
      }

      const match = path.match(route.path);
      try {
        await route.handler(match);
        // Ensure loader is hidden after route handler finishes
        hideGlobalLoader();
      } catch (e) {
        console.error("Route handler error:", e);
        toastr.error("Navigation error occurred.");
        hideGlobalLoader();
      }
    } else {
      console.warn("No route found for", path);
      // Default to home or dashboard depending on auth
      if (currentUser && currentUser.emailVerified) {
          window.location.hash = "#/dashboard";
      } else {
          window.location.hash = "#/";
      }
    }
  },

  init() {
    window.addEventListener("hashchange", () => this.handleLocation());
  },

  navigateTo(path) {
      window.location.hash = path;
  }
};

// Initialize router when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  router.init();
});
