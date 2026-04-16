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
  loadAllUserEmails();
}

/**
 * Fetches all unique user emails to populate the search datalist
 */
async function loadAllUserEmails() {
  try {
    const snapshot = await db.collection("results").get();
    const emails = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.userEmail && data.userEmail !== "guest") {
        emails.add(data.userEmail.toLowerCase());
      }
    });

    const select = document.getElementById("user-search-email");
    if (!select) return;

    // Keep the first default option
    select.innerHTML = '<option value="" disabled selected>Select a User Email...</option>';
    const sortedEmails = Array.from(emails).sort();

    const fragment = document.createDocumentFragment();
    sortedEmails.forEach(email => {
      const option = document.createElement("option");
      option.value = email;
      option.textContent = email;
      fragment.appendChild(option);
    });

    select.appendChild(fragment);

    // Initialize Select2 after populating
    $(select).select2({
      theme: 'bootstrap-5',
      placeholder: "Select a User Email...",
      allowClear: true
    });
  } catch (error) {
    console.error("Error loading user emails:", error);
  }
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

    const optionsHtml = q.options.map((opt, oIdx) => {
      const isCorrect = oIdx === correctIndex;
      const users = optionBuckets[oIdx];
      const percent = results.length > 0 ? Math.round((users.length / results.length) * 100) : 0;

      return `
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
    }).join("");

    card.innerHTML = `
        <div class="card-body p-4">
            <div class="d-flex justify-content-between mb-3">
                <span class="badge bg-primary bg-opacity-10 text-primary">Question ${qIdx + 1}</span>
                <span class="badge bg-light text-dark border">Accuracy: ${accuracy}%</span>
            </div>
            <div class="fw-bold mb-4 h5">${TextFormatter.formatQuestionText(q.text)}</div>
            <div class="row g-4">
                <div class="col-12">
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
                <div class="col-12">
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
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="viewUserAttempt('${doc.id}', '${data.chapterId}', '${data.chapterName}')">
                        <i class="bi bi-eye"></i> View
                    </button>
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
/**
 * Views a specific attempt in a modal.
 */
async function viewUserAttempt(docId, chapterId, chapterName) {
    const modalBody = document.getElementById("user-review-modal-body");
    const modalTitle = document.getElementById("user-review-modal-title");

    modalTitle.textContent = `Review: ${chapterName}`;
    modalBody.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p>Fetching test details...</p></div>';

    const reviewModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('user-review-modal'));
    reviewModal.show();

    try {
        // Fetch result and questions in parallel
        const [resultSnap, questions] = await Promise.all([
            db.collection("results").doc(docId).get(),
            DataManager.fetchQuizQuestions(chapterId)
        ]);

        if (!resultSnap.exists) {
            throw new Error("Result record not found.");
        }
        if (!questions) {
            throw new Error("Quiz questions not found.");
        }


        const resultData = resultSnap.data();
        const userAnswers = resultData.userAnswers || {};

        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;

        let subjectStats = {};

        questions.forEach((q, index) => {
            const correctIndex = getCorrectIndex(q);
            const uAns = userAnswers[index];
            const attempted = uAns !== undefined;
            const isCorrect = attempted && uAns.answer === correctIndex;

            if (!attempted) {
                unattemptedCount++;
            } else if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }

            if (q.subject) {
                const subj = q.subject.trim();
                if (!subjectStats[subj]) {
                    subjectStats[subj] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
                }
                subjectStats[subj].total++;
                if (!attempted) subjectStats[subj].unattempted++;
                else if (isCorrect) subjectStats[subj].correct++;
                else subjectStats[subj].incorrect++;
            }
        });

        let subjectStatsHtml = '';
        if (Object.keys(subjectStats).length > 0) {
            subjectStatsHtml = `
                <div class="card mb-4 border-0 shadow-sm">
                    <div class="card-header bg-white fw-bold"><i class="bi bi-bar-chart-fill me-2 text-primary"></i>Subject-wise Performance</div>
                    <div class="table-responsive">
                        <table class="table table-sm table-hover mb-0 text-center align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th class="text-start">Subject</th>
                                    <th>Total</th>
                                    <th class="text-success">Correct</th>
                                    <th class="text-danger">Incorrect</th>
                                    <th class="text-secondary">Unattempted</th>
                                    <th>Accuracy</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            Object.keys(subjectStats).sort().forEach(subj => {
                const s = subjectStats[subj];
                const attempted = s.correct + s.incorrect;
                const acc = attempted > 0 ? Math.round((s.correct / attempted) * 100) : 0;
                subjectStatsHtml += `
                    <tr>
                        <td class="text-start fw-bold">${subj}</td>
                        <td>${s.total}</td>
                        <td class="text-success">${s.correct}</td>
                        <td class="text-danger">${s.incorrect}</td>
                        <td class="text-secondary">${s.unattempted}</td>
                        <td><span class="badge ${acc >= 70 ? 'bg-success' : acc >= 40 ? 'bg-warning text-dark' : 'bg-danger'}">${acc}%</span></td>
                    </tr>
                `;
            });
            subjectStatsHtml += `</tbody></table></div></div>`;
        }

        let html = `
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white border-0 shadow-sm h-100">
                        <div class="card-body text-center p-3">
                            <h6 class="opacity-75 mb-1">Score</h6>
                            <h3 class="fw-bold mb-0">${resultData.scorePercent}%</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white border-0 shadow-sm h-100">
                        <div class="card-body text-center p-3">
                            <h6 class="opacity-75 mb-1">Correct</h6>
                            <h3 class="fw-bold mb-0">${correctCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white border-0 shadow-sm h-100">
                        <div class="card-body text-center p-3">
                            <h6 class="opacity-75 mb-1">Incorrect</h6>
                            <h3 class="fw-bold mb-0">${incorrectCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-secondary text-white border-0 shadow-sm h-100">
                        <div class="card-body text-center p-3">
                            <h6 class="opacity-75 mb-1">Unattempted</h6>
                            <h3 class="fw-bold mb-0">${unattemptedCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            ${subjectStatsHtml}

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold m-0">Detailed Analysis</h5>
                <div class="btn-group btn-group-sm" role="group">
                    <input type="radio" class="btn-check" name="adminQFilter" id="btnradio-all" autocomplete="off" checked onchange="filterAdminQuestions('all')">
                    <label class="btn btn-outline-primary" for="btnradio-all">All</label>

                    <input type="radio" class="btn-check" name="adminQFilter" id="btnradio-correct" autocomplete="off" onchange="filterAdminQuestions('correct')">
                    <label class="btn btn-outline-success" for="btnradio-correct">Correct</label>

                    <input type="radio" class="btn-check" name="adminQFilter" id="btnradio-incorrect" autocomplete="off" onchange="filterAdminQuestions('incorrect')">
                    <label class="btn btn-outline-danger" for="btnradio-incorrect">Incorrect</label>

                    <input type="radio" class="btn-check" name="adminQFilter" id="btnradio-unattempted" autocomplete="off" onchange="filterAdminQuestions('unattempted')">
                    <label class="btn btn-outline-secondary" for="btnradio-unattempted">Unattempted</label>
                </div>
                <select id="adminSubjFilter" class="form-select form-select-sm w-auto ms-2" onchange="filterAdminQuestions()">
                    <option value="all">All Subjects</option>
                    ${Object.keys(subjectStats).sort().map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>

            <div class="mt-2" id="admin-questions-list">
        `;

        questions.forEach((q, index) => {
            const correctIndex = getCorrectIndex(q);
            const uAns = userAnswers[index];
            const attempted = uAns !== undefined;
            const isCorrect = attempted && uAns.answer === correctIndex;

            let statusBadge = '';
            let borderClass = 'border-secondary';
            let statusClass = 'unattempted';

            if (!attempted) {
                statusBadge = '<span class="badge bg-secondary mb-2">Unattempted</span>';
            } else if (isCorrect) {
                statusBadge = '<span class="badge bg-success mb-2">Correct</span>';
                borderClass = 'border-success';
                statusClass = 'correct';
            } else {
                statusBadge = '<span class="badge bg-danger mb-2">Incorrect</span>';
                borderClass = 'border-danger';
                statusClass = 'incorrect';
            }

            const suretyLabel = attempted && uAns.surety !== undefined ? `<span class="badge bg-info text-dark ms-2">Confidence: ${uAns.surety}%</span>` : '';
            const subjDataAttr = q.subject ? `data-subj="${q.subject.trim()}"` : '';

            html += `
                <div class="card mb-4 border-0 shadow-sm border-start border-4 ${borderClass} admin-review-q-card" data-status="${statusClass}" ${subjDataAttr}>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold text-secondary mb-0">Question ${index + 1}</h6>
                            <div>${statusBadge}${suretyLabel}</div>
                        </div>
                                <div class="mb-3 lead" style="font-size: 1.1rem;">${TextFormatter.formatQuestionText(q.text || q.question || 'Missing question text')}</div>
                        <div class="options-container ps-3">
            `;

            q.options.forEach((opt, optIdx) => {
                let optClass = "p-2 mb-2 rounded border";
                let icon = "";

                if (optIdx === correctIndex) {
                    optClass += " bg-success text-white border-success";
                    icon = '<i class="bi bi-check-circle-fill me-2"></i>';
                } else if (attempted && uAns.answer === optIdx) {
                    optClass += " bg-danger text-white border-danger";
                    icon = '<i class="bi bi-x-circle-fill me-2"></i>';
                } else {
                    optClass += " bg-white text-dark";
                    icon = '<i class="bi bi-circle me-2 text-muted"></i>';
                }

                html += `<div class="${optClass}">${icon}${TextFormatter.formatQuestionText(opt)}</div>`;
            });

            html += `
                        </div>
                        ${q.explanation ? `
                            <div class="mt-3 p-3 bg-light rounded border-start border-warning border-4">
                                <h6 class="fw-bold text-warning-emphasis"><i class="bi bi-lightbulb me-1"></i>Explanation</h6>
                                <div class="small">${TextFormatter.formatQuestionText(q.explanation)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        modalBody.innerHTML = html;

    } catch (error) {
        console.error("Error loading user attempt details:", error);
        modalBody.innerHTML = `<div class="alert alert-danger">Error loading details: ${error.message}</div>`;
    }
}


function filterAdminQuestions(statusOverride) {
    let selectedStatus = 'all';

    // Find selected status from radio buttons
    document.querySelectorAll('input[name="adminQFilter"]').forEach(radio => {
        if (radio.checked) {
            selectedStatus = radio.id.replace('btnradio-', '');
        }
    });

    // Handle direct click override from radio buttons (because onchange passes 'all', 'correct' etc)
    if (statusOverride) {
        selectedStatus = statusOverride;
    }

    const selectedSubj = document.getElementById('adminSubjFilter') ? document.getElementById('adminSubjFilter').value : 'all';

    const cards = document.querySelectorAll('.admin-review-q-card');
    cards.forEach(card => {
        const qStatus = card.getAttribute('data-status');
        const qSubj = card.getAttribute('data-subj');

        const statusMatch = selectedStatus === 'all' || selectedStatus === qStatus;
        const subjMatch = selectedSubj === 'all' || selectedSubj === qSubj;

        if (statusMatch && subjMatch) {
            card.classList.remove('d-none');
        } else {
            card.classList.add('d-none');
        }
    });
}
