const auth = firebase.auth();
const db = firebase.firestore();

// REDUCED READS: Memory cache for admin analysis
const adminAnalysisCache = {};

// Global variable for quiz structure
let allQuizData = null;

/* --- Auth & UI Management --- */
auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection("admins")
      .doc(user.uid)
      .get()
      .then(async (doc) => { // Added async
        if (doc.exists) {
          showDashboard();
          await loadSubjects(); // Call the updated loader
        } else {
          auth.signOut();
          showLogin();
        }
      });
  } else {
    showLogin();
  }
});

function showLogin() {
  document.getElementById("admin-login-section").style.display = "block";
  document.getElementById("admin-dashboard-section").style.display = "none";
}

function showDashboard() {
  document.getElementById("admin-login-section").style.display = "none";
  document.getElementById("admin-dashboard-section").style.display = "block";
}

document.getElementById("admin-login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  auth
    .signInWithEmailAndPassword(
      document.getElementById("admin-email").value,
      document.getElementById("admin-password").value
    )
    .catch((err) => toastr.error(err.message));
});

function logoutAdmin() {
  auth.signOut();
}

/* --- Data Selection --- */
async function loadSubjects() {
  const subSelect = document.getElementById("subject-select");
  subSelect.innerHTML = '<option value="">Loading Subjects...</option>';

  // Fetch manifest if not already loaded
  if (!allQuizData) {
    allQuizData = await DataManager.fetchQuizManifest();
  }

  if (!allQuizData) {
    subSelect.innerHTML = '<option value="">Error loading data</option>';
    return;
  }

  subSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
  
  // Sort subjects alphabetically/numerically to match the user portal
  const sortedSubjects = Object.keys(allQuizData).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  const fragment = document.createDocumentFragment();
  sortedSubjects.forEach((sub) => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    fragment.appendChild(opt);
  });
  subSelect.appendChild(fragment);
  
  subSelect.addEventListener("change", loadChapters);
}

function loadChapters() {
  const sub = document.getElementById("subject-select").value;
  const chapSelect = document.getElementById("chapter-select");
  chapSelect.innerHTML = '<option value="">-- Choose Test --</option>';
  
  if (!sub || !allQuizData[sub]) {
    chapSelect.disabled = true;
    return;
  }

  // Sort chapters numerically (e.g., Test-1, Test-2)
  const sortedChapters = Object.keys(allQuizData[sub]).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  const fragment = document.createDocumentFragment();
  sortedChapters.forEach((chapId) => {
    const opt = document.createElement("option");
    // ID generation logic matching quiz.js
    opt.value = sub.replace(/\s+/g, "_") + "_" + chapId;
    opt.textContent = chapId;
    fragment.appendChild(opt);
  });
  chapSelect.appendChild(fragment);
  chapSelect.disabled = false;
}

/* --- Optimized Analysis Logic with Heat Map Palette --- */
/* =========================================
   RE-FETCHING LOGIC: Always get fresh data on Analyze click
   ========================================= */
async function loadTestAnalysis() {
  const dbChapterId = document.getElementById("chapter-select").value;
  const container = document.getElementById("analysis-container");
  const layout = document.getElementById("analysis-main-layout");
  const emptyState = document.getElementById("empty-state");

  if (!dbChapterId) return toastr.warning("Select Subject and Test.");

  // Clear specific cache for this test so we always get fresh data from Firestore
  delete adminAnalysisCache[dbChapterId];

  emptyState.style.display = "none";
  // We keep the layout as is (if already visible) but update the container with a loader
  container.innerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p>Fetching latest discussion data...</p></div>';

  try {
    let quizQuestions, statsData, results;

    // Fetch fresh data from Firestore
    const [quizData, statsDoc, resultsSnap] = await Promise.all([
      DataManager.fetchQuizQuestions(dbChapterId),
      db.collection("chapter_stats").doc(dbChapterId).get(),
      db
        .collection("results")
        .where("chapterId", "==", dbChapterId)
        .orderBy("timestamp", "desc")
        .limit(100)
        .get(),
    ]);

    if (!quizData) throw new Error("Quiz content not found.");

    quizQuestions = quizData;
    statsData = statsDoc.exists
      ? statsDoc.data()
      : { totalAttempts: 0, average: 0 };
    results = resultsSnap.docs.map((doc) => doc.data());

    // Re-save to cache for any internal logic that might use it
    adminAnalysisCache[dbChapterId] = {
      questions: quizQuestions,
      stats: statsData,
      results: results,
    };

    container.innerHTML = "";
    layout.style.display = "flex";

    const questionAccuracies = calculateAccuracies(quizQuestions, results);

    // Re-render all components with fresh data
    renderPalette(questionAccuracies);
    renderOptimizedLeaderboard(
      container,
      statsData.leaderboard || [],
      statsData
    );
    renderQuestionAnalysis(
      container,
      quizQuestions,
      results,
      questionAccuracies
    );
    
    toastr.success("Discussion data updated!");
  } catch (error) {
    console.error("Analysis Fetch Error:", error);
    container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    emptyState.style.display = "block";
  }
}

function calculateAccuracies(questions, results) {
  return questions.map((q, qIdx) => {
    const correctIndex = getCorrectIndex(q);
    let correctCount = 0;
    results.forEach((res) => {
      const choice = res.userAnswers ? res.userAnswers[qIdx] : null;
      if (choice && choice.answer === correctIndex) correctCount++;
    });
    return results.length > 0
      ? Math.round((correctCount / results.length) * 100)
      : 0;
  });
}

function renderPalette(accuracies) {
  const grid = document.getElementById("admin-palette-grid");
  grid.innerHTML = "";

  const fragment = document.createDocumentFragment();

  accuracies.forEach((acc, i) => {
    const item = document.createElement("div");
    let heatClass = "heat-high";
    if (acc < 40) heatClass = "heat-low";
    else if (acc <= 70) heatClass = "heat-mid";

    item.className = `palette-item ${heatClass}`;
    item.textContent = i + 1;
    item.title = `Accuracy: ${acc}%`;

    // Accessibility Attributes
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Question ${i + 1}: ${acc}% Accuracy`);
    item.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    };

    item.onclick = () => {
      const el = document.getElementById(`q-card-${i}`);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    fragment.appendChild(item);
  });
  grid.appendChild(fragment);
}

/**
 * UPDATED: Renders question analysis including user-specific surety percentages
 */
function renderQuestionAnalysis(container, questions, results, accuracies) {
  const header = document.createElement("div");
  header.className = "d-flex justify-content-between align-items-center mb-4 mt-2";
  header.innerHTML = `<h4 class="fw-bold text-dark border-start border-4 border-primary ps-3">📊 Discussion Dashboard</h4>`;
  container.appendChild(header);

  // PERFORMANCE OPTIMIZATION: Pre-calculate user names to avoid redundant string splitting in the nested loop
  const resultsWithUserNames = results.map(res => ({
    original: res,
    userName: res.userEmail ? res.userEmail.split("@")[0] : "Guest"
  }));

  questions.forEach((q, qIdx) => {
    // Each bucket now stores objects containing the username and their surety level
    const optionBuckets = q.options.map(() => []);
    const skippedUsers = [];
    const correctIndex = getCorrectIndex(q);

    resultsWithUserNames.forEach((item) => {
      const res = item.original;
      const userName = item.userName;
      const choice = res.userAnswers ? res.userAnswers[qIdx] : null;
      
      // Extract surety from the saved result data
      const suretyVal = (choice && choice.surety !== undefined) ? choice.surety + "%" : "N/A";

      if (!choice || choice.answer === undefined || choice.answer === -1) {
        skippedUsers.push({ name: userName, surety: suretyVal });
      } else if (optionBuckets[choice.answer]) {
        optionBuckets[choice.answer].push({ name: userName, surety: suretyVal });
      }
    });

    const accuracy = accuracies[qIdx];
    const card = document.createElement("div");
    card.id = `q-card-${qIdx}`;
    card.className = `card mb-5 shadow-sm border-0 rounded-4 admin-q-card ${accuracy < 40 ? "high-error" : ""}`;

    let optionsHtml = "";
    q.options.forEach((opt, oIdx) => {
      const isCorrect = oIdx === correctIndex;
      const users = optionBuckets[oIdx];
      const percent = results.length > 0 ? Math.round((users.length / results.length) * 100) : 0;

      optionsHtml += `
        <div class="p-3 border rounded-3 mb-2 ${isCorrect ? "bg-success bg-opacity-10 border-success" : "bg-white"}">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge ${isCorrect ? "bg-success" : "bg-secondary"} me-2">${String.fromCharCode(65 + oIdx)}</span>
                    <span class="${isCorrect ? "fw-bold text-success" : ""}">${opt}</span>
                </div>
                <span class="fw-bold text-muted small">${users.length} Users (${percent}%)</span>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-2 user-list-container">
                ${users.map(u => `
                    <span class="badge user-tag d-flex align-items-center gap-1">
                        ${u.name} 
                        <strong class="text-primary" style="font-size: 0.65rem; border-left: 1px solid #ddd; padding-left: 4px;">
                            ${u.surety}
                        </strong>
                    </span>
                `).join("")}
            </div>
        </div>`;
    });

    card.innerHTML = `
        <div class="card-body p-4">
            <div class="d-flex justify-content-between mb-3">
                <span class="badge bg-primary bg-opacity-10 text-primary">Question ${qIdx + 1}</span>
                <span class="badge bg-light text-dark border">Accuracy: ${accuracy}%</span>
            </div>
            <div class="fw-bold mb-4 h5">${TextFormatter.formatQuestionText(q.text)}</div>
            <div class="row g-4">
                <div class="col-lg-8">
                    ${optionsHtml}
                    <div class="mt-3 p-2 bg-light rounded-3 border-dashed border-2">
                        <small class="text-muted fw-bold">⚪ SKIPPED (${skippedUsers.length})</small>
                        <div class="d-flex flex-wrap gap-1 mt-1">
                            ${skippedUsers.map(u => `
                                <span class="badge user-tag border-secondary text-secondary">
                                    ${u.name} <small class="ms-1 opacity-50">(${u.surety})</small>
                                </span>
                            `).join("") || "None"}
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="explanation-box mb-3">
                        <h6 class="fw-bold text-warning-emphasis"><i class="bi bi-lightbulb"></i> Explanation:</h6>
                        <p class="small m-0">${q.explanation || "No explanation."}</p>
                    </div>
                    <div class="p-3 bg-primary bg-opacity-10 rounded-3">
                        <small class="fw-bold text-primary d-block mb-1">DISCUSSION TIP</small>
                        <p class="small m-0 text-primary-emphasis">
                            ${accuracy < 40 ? "⚠️ High error rate with mixed confidence." : "✅ Concept generally understood."}
                        </p>
                    </div>
                </div>
            </div>
        </div>`;
    container.appendChild(card);
  });
}

function renderOptimizedLeaderboard(container, leaderboardArr, stats) {
  let rows = leaderboardArr
    .map(
      (entry, i) => `
        <tr>
            <td class="fw-bold">#${i + 1}</td>
            <td>${entry.userEmail.split("@")[0]}</td>
            <td>${entry.score.toFixed(1)}</td>
            <td><span class="badge ${
              entry.scorePercent >= 80 ? "bg-success" : "bg-secondary"
            }">${entry.scorePercent}%</span></td>
        </tr>`
    )
    .join("");

  container.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div class="card-header bg-white border-bottom p-4">
                <h5 class="fw-bold text-primary m-0">🏆 Leaderboard</h5>
                <small class="text-muted">Total Attempts: ${
                  stats.totalAttempts
                } | Global Avg: ${
    stats.average ? stats.average.toFixed(1) : 0
  }%</small>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light"><tr><th>Rank</th><th>User</th><th>Score</th><th>Accuracy</th></tr></thead>
                    <tbody>${
                      rows ||
                      '<tr><td colspan="4" class="text-center">No records.</td></tr>'
                    }</tbody>
                </table>
            </div>
        </div>`;
}


/**
 * Fetches all test attempts for a specific user email
 */
async function searchUserAttempts() {
    const email = document.getElementById("user-search-email").value.trim().toLowerCase();
    const container = document.getElementById("user-attempts-container");
    const tbody = document.getElementById("user-attempts-body");
    const displayEmail = document.getElementById("display-search-email");

    if (!email) return toastr.warning("Please enter a user email.");

    // UI Loading state
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Fetching user records...</td></tr>';
    container.style.display = "block";
    displayEmail.textContent = email;

    try {
        const snapshot = await db.collection("results")
            .where("userEmail", "==", email)
            .orderBy("timestamp", "desc")
            .get();

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No attempts found for this user.</td></tr>';
            return;
        }

        tbody.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "N/A";
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><small class="text-muted">${date}</small></td>
                <td><span class="fw-bold">${data.subject}</span></td>
                <td>${data.chapterName}</td>
                <td><span class="badge bg-primary">${data.scorePercent}%</span></td>
                <td class="text-end">
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteAttempt('${doc.id}', '${data.chapterName}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Search Error:", error);
        toastr.error("Error fetching user data. Ensure index is created in Firebase if required.");
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

/**
 * Deletes a specific result document from Firestore
 */
/**
 * Advanced Delete: Removes the result document and reverts global chapter statistics.
 */
async function deleteAttempt(docId, testName) {
    if (!confirm(`CRITICAL: This will delete the attempt for "${testName}" and RECALCULATE all global class statistics. Proceed?`)) {
        return;
    }

    try {
        // 1. Get the result data first to know what values to subtract from stats
        const resultRef = db.collection("results").doc(docId);
        const resultSnap = await resultRef.get();

        if (!resultSnap.exists) {
            toastr.error("Result record not found.");
            return;
        }

        const data = resultSnap.data();
        const chapterId = data.chapterId;
        const scorePercent = data.scorePercent;
        const userAnswers = data.userAnswers || {};
        const statsRef = db.collection("chapter_stats").doc(chapterId);

        // 2. Run a Transaction to ensure atomic updates
        await db.runTransaction(async (transaction) => {
            const statsSnap = await transaction.get(statsRef);
            
            // Delete the primary result record
            transaction.delete(resultRef);

            if (statsSnap.exists) {
                const stats = statsSnap.data();
                
                // Calculate new aggregate values
                const newAttempts = Math.max(0, (stats.totalAttempts || 1) - 1);
                const newTotalScore = Math.max(0, (stats.totalScore || 0) - scorePercent);
                const newAverage = newAttempts > 0 ? newTotalScore / newAttempts : 0;

                // Update allScores array (remove one instance of this score)
                let newAllScores = [...(stats.allScores || [])];
                const scoreIndex = newAllScores.indexOf(scorePercent);
                if (scoreIndex > -1) newAllScores.splice(scoreIndex, 1);
                
                const newHighest = newAllScores.length > 0 ? Math.max(...newAllScores) : 0;

                // Update Leaderboard (remove this specific user's entry)
                let newLeaderboard = (stats.leaderboard || []).filter(entry => {
                    // 1. Primary Check: If we have a linked Result ID (new system), match exactly
                    if (entry.resultId && entry.resultId === docId) {
                        return false; // Remove this entry
                    }

                    // 2. Fallback Check: For legacy data, match Email + Score + Approximate Time
                    if (entry.userEmail === data.userEmail) {
                        const scoreMatch = Math.abs(entry.scorePercent - scorePercent) < 0.1;

                        // Time match: entry.rankTime is ISO String, data.timestamp is Firestore Timestamp
                        const entryTime = new Date(entry.rankTime).getTime();
                        const dataTime = data.timestamp ? data.timestamp.toDate().getTime() : 0;
                        const timeDiff = Math.abs(entryTime - dataTime);
                        const timeMatch = timeDiff < 5000; // 5 seconds tolerance

                        if (scoreMatch && timeMatch) {
                            return false; // Remove this entry
                        }
                    }

                    return true; // Keep this entry
                });

                // Revert Question-wise Counts (correctCounts and attemptedCounts)
                let cCounts = [...(stats.correctCounts || [])];
                let aCounts = [...(stats.attemptedCounts || [])];

                // Note: We need the quiz structure to know which index is correct
                // This assumes quizDataCache or a global quiz reference is available
                // If not, we use the isCorrect flag stored in userAnswers if available
                Object.entries(userAnswers).forEach(([idx, ans]) => {
                    const i = parseInt(idx);
                    if (aCounts[i] > 0) aCounts[i]--;
                    if (ans.isCorrect && cCounts[i] > 0) cCounts[i]--;
                });

                transaction.update(statsRef, {
                    totalAttempts: newAttempts,
                    totalScore: newTotalScore,
                    average: newAverage,
                    allScores: newAllScores,
                    highestScore: newHighest,
                    leaderboard: newLeaderboard,
                    correctCounts: cCounts,
                    attemptedCounts: aCounts
                });
            }
        });

        toastr.success("Attempt deleted and global stats updated!");
        
        // Refresh UI
        searchUserAttempts();
        
        // Clear local caches to force fresh data on next analysis
        for (let key in adminAnalysisCache) delete adminAnalysisCache[key];

    } catch (error) {
        console.error("Delete Transaction Error:", error);
        toastr.error("Failed to complete full deletion.");
    }
}