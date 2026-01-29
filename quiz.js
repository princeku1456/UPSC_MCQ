/* =========================================
   4. TAKE TEST LOGIC (Subjects & Chapters)
   ========================================= */

/**
 * Saves current quiz state, now including the timer
 */
function updateQuestionTimer() {
  if (typeof currentQuestionStartTime === "undefined" || !currentQuestionStartTime || quizSubmitted || isReviewMode) return;

  const now = Date.now();
  const elapsed = (now - currentQuestionStartTime) / 1000; // seconds

  if (typeof questionTimeSpent === "undefined") questionTimeSpent = {};

  questionTimeSpent[currentQuestionIndex] = (questionTimeSpent[currentQuestionIndex] || 0) + elapsed;
  currentQuestionStartTime = now;
}

function saveQuizProgress() {
  if (!currentChapterId || quizSubmitted || isReviewMode) return;

  // Update time for current question without resetting start time (just for saving)
  let currentQTime = 0;
  if (typeof currentQuestionStartTime !== "undefined" && currentQuestionStartTime) {
      currentQTime = (Date.now() - currentQuestionStartTime) / 1000;
  }

  // Clone to avoid modifying global state directly during save
  const timeData = { ...(typeof questionTimeSpent !== "undefined" ? questionTimeSpent : {}) };
  timeData[currentQuestionIndex] = (timeData[currentQuestionIndex] || 0) + currentQTime;

  const progressData = {
    userAnswers: userAnswers,
    markedForReview: markedForReview,
    questionTimeSpent: timeData, // Save time tracking
    lastQuestionIndex: currentQuestionIndex,
    remainingTime: currentTimerSeconds, // Save the current timer state
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(
    `quiz_progress_${currentChapterId}`,
    JSON.stringify(progressData)
  );
}

function clearQuizProgress(chapterId) {
  localStorage.removeItem(`quiz_progress_${chapterId}`);
}

// --------------------------------------

/**
 * UPDATED: Renders subjects directly into the dashboard's test container.
 * Removed the "Back to Dashboard" button as this is now part of the main view.
/**
 * Renders subjects in sorted order directly into the dashboard's test container.
 */
/**
 * UPDATED: Fetches manifest from Firestore if missing, then renders subjects.
 */
async function renderSubjects() {
  const container = document.getElementById("test-content-container");

  // If data isn't loaded yet, fetch it from Firestore
  if (typeof allQuizData === "undefined" || !allQuizData) {
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading Subjects from Cloud...</p>
        </div>`;

    await DataManager.fetchQuizManifest(); // Helper function to get data from Firebase
  }

  // Double check if data is now available after fetch
  if (typeof allQuizData === "undefined" || !allQuizData) {
    container.innerHTML =
      '<div class="alert alert-danger text-center">Failed to load Quiz Data from Firebase!</div>';
    return;
  }

  // Clear container and start rendering
  container.innerHTML = `
        <button class="btn btn-primary-custom px-4 shadow mb-4" onclick="showDashboard()">← Back to Dashboard</button>
        <div class="text-center mb-4">
            <h4 class="fw-bold section-title">Select a Subject</h4>
            <div class="title-underline mx-auto"></div>
        </div>
        <div class="row justify-content-center g-4" id="subjects-row"></div>
    `;

  const row = document.getElementById("subjects-row");

  // Sort and render subjects as before
  const sortedSubjectKeys = Object.keys(allQuizData).sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  sortedSubjectKeys.forEach((subjectKey) => {
    const chapters = allQuizData[subjectKey];
    const totalChapters = Object.keys(chapters).length;
    const subjectPrefix = subjectKey.replace(/\s+/g, "_") + "_";

    const completedChaptersCount = Object.keys(chapters).filter((chapId) => {
      const fullId = subjectPrefix + chapId;
      return userHistory && userHistory.some((h) => h.chapterId === fullId);
    }).length;

    const progressPercent =
      totalChapters > 0
        ? Math.round((completedChaptersCount / totalChapters) * 100)
        : 0;
    const isCompleted = progressPercent === 100;

    const col = document.createElement("div");
    col.className = "col-md-4 col-lg-3 mb-4";
    col.innerHTML = `
            <div class="card topic-card h-100 ${
              isCompleted ? "subject-completed" : ""
            }" style="cursor: pointer;">
                <div class="card-body text-center p-4 d-flex flex-column">
                    <div class="display-4 mb-3">${
                      isCompleted ? "🏆" : "📖"
                    }</div>
                    ${
                      isCompleted
                        ? '<div class="badge bg-success mb-2 animate-fade-in">✨ Completed</div>'
                        : ""
                    }
                    <h5 class="card-title text-primary fw-bold">${subjectKey}</h5>
                    <p class="text-muted small mb-3">${completedChaptersCount} / ${totalChapters} Chapters Done</p>
                    <div class="mt-auto">
                        <div class="progress mb-2" style="height: 25px; background-color: var(--border-color); border-radius: 5px;">
                            <div class="progress-bar ${
                              isCompleted ? "bg-success" : ""
                            }" 
                                 role="progressbar" 
                                 style="width: ${progressPercent}%; ${
      !isCompleted ? "background-color: var(--accent-color);" : ""
    } border-radius: 5px;">
                            </div>
                        </div>
                        <small class="fw-bold ${
                          isCompleted ? "text-success" : "text-secondary"
                        }">${progressPercent}% Complete</small>
                    </div>
                </div>
            </div>`;

    col.onclick = () => renderChapters(subjectKey);
    row.appendChild(col);
  });
}

/**
 * UPDATED: Navigates back to showDashboard (the consolidated view)
 */
/**
 * UPDATED: Renders chapters for a selected subject in sorted order.
 */
function renderChapters(subjectKey) {
  const container = document.getElementById("test-content-container");

  // Create the layout for the chapters view
  container.innerHTML = `
        <button class="btn btn-primary-custom px-4 shadow mb-4" onclick="renderSubjects()">← Back to Subjects</button>
        <div class="text-center mb-4">
            <h4 class="fw-bold section-title">Chapters: ${subjectKey}</h4>
            <div class="title-underline mx-auto"></div>
        </div>
        <div class="row" id="chapters-row"></div>
    `;

  const row = document.getElementById("chapters-row");
  const chapters = allQuizData[subjectKey];

  // FIX: Sort the chapter IDs numerically before rendering to ensure Test-1, Test-2 order
  const sortedChapterIds = Object.keys(chapters).sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  sortedChapterIds.forEach((chapId) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4";

    const subjectPrefix = subjectKey.replace(/\s+/g, "_") + "_";
    const fullChapterId = subjectPrefix + chapId;

    // Check if the user has already taken this test
    const latestResult =
      userHistory && userHistory.find((h) => h.chapterId === fullChapterId);
    const hasTaken = !!latestResult;

    const startBtnText = hasTaken ? "↻ Retake Test" : "🚀 Start Test";

    let reviewBtnHtml = "";
    if (hasTaken) {
      reviewBtnHtml = `
            <button class="btn btn-secondary-custom w-100 mt-2 review-perf-btn">
                👁 Review Performance
            </button>
        `;
    }

    col.innerHTML = `
            <div class="card chapter-card h-100 border-0">
                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-dark">${chapId}</h5>
                    <div class="mt-auto">
                        <button class="btn btn-primary-custom w-100 action-btn">
                            ${startBtnText}
                        </button>
                        ${reviewBtnHtml}
                    </div>
                </div>
            </div>`;

    // Handle Start/Retake Test click
    col.querySelector(".action-btn").onclick = () => {
      loadQuiz(subjectKey, chapId, encodeURIComponent(chapId));
    };

    // Handle Review Performance click if the test was previously completed
    if (hasTaken) {
      col.querySelector(".review-perf-btn").onclick = () => {
        reviewTest(latestResult, "chapters");
      };
    }

    row.appendChild(col);
  });
}

/* =========================================
   5. QUIZ CORE
   ========================================= */

function getCorrectIndex(question) {
  if (typeof question.correctAnswer === "number") return question.correctAnswer;
  const optionIndex = question.options.indexOf(question.correctAnswer);
  if (optionIndex !== -1) return optionIndex;
  if (!isNaN(question.correctAnswer)) return Number(question.correctAnswer);
  return -1;
}

/* =========================================
   QUIZ CORE (Updated loadQuiz)
   ========================================= */
async function loadQuiz(
  subjectKey,
  chapterId,
  chapterName,
  reviewMode = false,
  pastData = null,
  source = null
) {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  isPracticeMode = false;
  currentSubject = subjectKey;
  currentChapterId = subjectKey.replace(/\s+/g, "_") + "_" + chapterId;
  currentChapterName = decodeURIComponent(chapterName);

  isReviewMode = reviewMode;
  reviewSource = source;
  let savedTime = null;
  hideAllSections();
  document.getElementById("quiz-section").style.display = "block";

  const quizContent = document.getElementById("quiz-content");
  quizContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading Questions...</p>
        </div>`;

  try {
    currentQuizData = await DataManager.fetchQuizQuestions(currentChapterId);
    if (!currentQuizData) {
      toastr.error("Quiz questions not found in database!");
      showDashboard();
      return;
    }

    currentQuestionIndex = 0;
    userAnswers = {};
    markedForReview = {};
    questionTimeSpent = {}; // NEW
    currentQuestionStartTime = null; // NEW
    quizSubmitted = false;

    if (!reviewMode) {
      const savedProgress = localStorage.getItem(
        `quiz_progress_${currentChapterId}`
      );
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        const oneDay = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - parsedProgress.timestamp < oneDay) {
          userAnswers = parsedProgress.userAnswers || {};
          markedForReview = parsedProgress.markedForReview || {};
          questionTimeSpent = parsedProgress.questionTimeSpent || {}; // NEW
          currentQuestionIndex = parsedProgress.lastQuestionIndex || 0;
          savedTime = parsedProgress.remainingTime; // Restore the time value
          toastr.info("Restored your previous progress and time.");
        }
      }
    }

    // Timer and UI initialization
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
      timerDisplay.textContent = "";
      timerDisplay.classList.remove("text-danger");
    }
    if (currentQuizTimer) currentQuizTimer.stop();

    if (reviewMode && pastData) {
      userAnswers = pastData.userAnswers || {};
      questionTimeSpent = pastData.questionTimeSpent || {};
      quizSubmitted = true;
    }

    const quizNav = document.getElementById("quiz-nav");
    if (isReviewMode) {
      // Keep the layout consistent: 8 cols for content, 4 cols for sidebar
      quizContent.parentElement.className = "col-lg-8 mb-4";
      quizNav.parentElement.style.display = "block";
      renderReviewMode(pastData);
    } else {
      quizContent.parentElement.className = "col-lg-8 mb-4";
      quizNav.parentElement.style.display = "block";
      renderQuizLayout(currentChapterName);
      renderQuestion();
      renderNav();
      startTimer(currentQuizData.length, savedTime);
      currentQuestionStartTime = Date.now(); // NEW: Start tracking first question
    }
  } catch (error) {
    console.error("Firebase fetch error:", error);
    toastr.error("Failed to load questions.");
    showDashboard();
  }
}

function reviewTest(resultObj, source = "performance") {
  const subjectPrefix = resultObj.subject.replace(/\s+/g, "_") + "_";
  const originalChapId = resultObj.chapterId.replace(subjectPrefix, "");
  loadQuiz(
    resultObj.subject,
    originalChapId,
    resultObj.chapterName,
    true,
    resultObj,
    source
  );
}

/* =========================================
   REVIEW MODE LOGIC, LEADERBOARD & STATS
   ========================================= */

async function loadLeaderboard(chapterId) {
  const container = document.getElementById("leaderboard-container");
  if (!container) return;
  const stats = await DataManager.fetchGlobalStats(chapterId);
  if (stats && stats.leaderboard) {
    renderLeaderboardHTML(container, stats.leaderboard);
  } else {
    renderLeaderboardHTML(container, []);
  }
}

function generateDeepDiveStats(quizData, userAnswers, timeData, globalStats) {
  let stats = {
      easy: { total: 0, attempted: 0, correct: 0 },
      medium: { total: 0, attempted: 0, correct: 0 },
      hard: { total: 0, attempted: 0, correct: 0 }
  };

  let timeStats = {
      correct: { total: 0, count: 0, min: 9999, max: 0 },
      incorrect: { total: 0, count: 0, min: 9999, max: 0 }
  };

  quizData.forEach((q, i) => {
      // Difficulty
      let difficulty = 'medium';
      if (globalStats && globalStats.correctCounts) {
          const total = globalStats.totalAttempts || 1;
          const correct = globalStats.correctCounts[i] || 0;
          const p = (correct / total) * 100;
          if (p >= 70) difficulty = 'easy';
          else if (p <= 40) difficulty = 'hard';
      }

      stats[difficulty].total++;

      const uAns = userAnswers[i];
      const time = (timeData && timeData[i]) ? timeData[i] : 0;

      if (uAns) {
          stats[difficulty].attempted++;
          const isCorrect = uAns.answer === getCorrectIndex(q);

          if (isCorrect) {
              stats[difficulty].correct++;
              timeStats.correct.total += time;
              timeStats.correct.count++;
              if (time < timeStats.correct.min) timeStats.correct.min = time;
              if (time > timeStats.correct.max) timeStats.correct.max = time;
          } else {
              timeStats.incorrect.total += time;
              timeStats.incorrect.count++;
              if (time < timeStats.incorrect.min) timeStats.incorrect.min = time;
              if (time > timeStats.incorrect.max) timeStats.incorrect.max = time;
          }
      }
  });

  const getAcc = (s) => s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;

  const avgTimeCorrect = timeStats.correct.count > 0 ? (timeStats.correct.total / timeStats.correct.count).toFixed(1) : "0";
  const avgTimeWrong = timeStats.incorrect.count > 0 ? (timeStats.incorrect.total / timeStats.incorrect.count).toFixed(1) : "0";

  return `
      <div class="row g-4 mb-5 border-top pt-4">
          <div class="col-lg-6">
              <h6 class="fw-bold text-secondary mb-3">🎯 Performance by Difficulty</h6>
              <div class="table-responsive">
                  <table class="table table-sm table-bordered text-center align-middle">
                      <thead class="table-light">
                          <tr>
                              <th>Level</th>
                              <th>Total</th>
                              <th>Attempted</th>
                              <th>Accuracy</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><span class="badge bg-success">Easy</span></td>
                              <td>${stats.easy.total}</td>
                              <td>${stats.easy.attempted}</td>
                              <td class="${getAcc(stats.easy) < 50 ? 'text-danger' : 'text-success'} fw-bold">${getAcc(stats.easy)}%</td>
                          </tr>
                          <tr>
                              <td><span class="badge bg-warning text-dark">Medium</span></td>
                              <td>${stats.medium.total}</td>
                              <td>${stats.medium.attempted}</td>
                              <td class="${getAcc(stats.medium) < 50 ? 'text-danger' : 'text-success'} fw-bold">${getAcc(stats.medium)}%</td>
                          </tr>
                          <tr>
                              <td><span class="badge bg-danger">Hard</span></td>
                              <td>${stats.hard.total}</td>
                              <td>${stats.hard.attempted}</td>
                              <td class="${getAcc(stats.hard) < 50 ? 'text-danger' : 'text-success'} fw-bold">${getAcc(stats.hard)}%</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
          <div class="col-lg-6">
              <h6 class="fw-bold text-secondary mb-3">⏱️ Time Analysis</h6>
              <div class="row g-2">
                  <div class="col-6">
                      <div class="p-3 border rounded bg-success-subtle h-100">
                          <small class="text-success fw-bold d-block">Avg Time (Correct)</small>
                          <span class="h4 fw-bold text-dark">${avgTimeCorrect}s</span>
                      </div>
                  </div>
                  <div class="col-6">
                      <div class="p-3 border rounded bg-danger-subtle h-100">
                          <small class="text-danger fw-bold d-block">Avg Time (Wrong)</small>
                          <span class="h4 fw-bold text-dark">${avgTimeWrong}s</span>
                      </div>
                  </div>
                  <div class="col-12">
                     <div class="p-2 small text-muted bg-light rounded border">
                        <i class="bi bi-info-circle me-1"></i>
                        Fastest Wrong: <strong>${timeStats.incorrect.min === 9999 ? '-' : timeStats.incorrect.min.toFixed(1) + 's'}</strong>
                        | Slowest Correct: <strong>${timeStats.correct.max === 0 ? '-' : timeStats.correct.max.toFixed(1) + 's'}</strong>
                     </div>
                  </div>
              </div>
          </div>
      </div>
  `;
}

function renderLeaderboardHTML(container, data) {
  if (!data || data.length === 0) {
    container.innerHTML =
      '<div class="alert alert-light border text-center text-muted small">No other attempts yet. Be the first!</div>';
    return;
  }

  // --- Logic to remove duplicate users and keep the best score ---
  const uniqueUsers = {};
  data.forEach((entry) => {
    const email = entry.userEmail || "Guest";
    // If the user isn't in the map yet, or if this current score is higher than their stored best score
    if (
      !uniqueUsers[email] ||
      entry.scorePercent > uniqueUsers[email].scorePercent
    ) {
      uniqueUsers[email] = entry;
    }
  });

  // Convert the unique user object back into an array and sort by scorePercent descending
  const filteredSortedData = Object.values(uniqueUsers).sort(
    (a, b) => b.scorePercent - a.scorePercent
  );
  // ---------------------------------------------------------------

  let rows = "";
  let rank = 1;

  // Iterate through the filtered and sorted data instead of the raw data
  filteredSortedData.forEach((entry) => {
    const email = entry.userEmail || "Guest";
    const rawName = email.split("@")[0];
    const displayName =
      rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
    const isMe = currentUser && entry.userEmail === currentUser.email;

    rows += `
            <tr class="${isMe ? "table-warning fw-bold" : ""}">
                <td class="ps-3 text-secondary">#${rank++}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style="width:24px; height:24px; font-size:10px;">
                            ${rawName.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-dark">${displayName}</span>
                        ${
                          isMe
                            ? '<span class="badge bg-warning text-dark dummy-tag ms-2" style="font-size:0.6rem">YOU</span>'
                            : ""
                        }
                    </div>
                </td>
                <td class="text-end pe-3">
                    <span class="badge ${
                      entry.scorePercent >= 80 ? "bg-success" : "bg-primary"
                    }">${entry.scorePercent}%</span>
                </td>
            </tr>
        `;
  });

  container.innerHTML = `
        <div class="card border-0 shadow-sm overflow-hidden mt-3">
            <div class="card-header bg-white border-bottom py-2">
                 <div class="d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold text-primary m-0">🏆 Leaderboard</h6>
                    <small class="text-muted">Top Students</small>
                 </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0 align-middle" style="font-size: 0.9rem;">
                    <tbody class="bg-white">${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * UPDATED: Advanced UPSC Performance Review
 */
async function renderReviewMode(resultData) {
  // Pre-fetch stats to ensure they are available for community comparison
  currentReviewStats = await DataManager.fetchGlobalStats(currentChapterId);
  let confStats = {
    100: { total: 0, correct: 0 },
    75: { total: 0, correct: 0 },
    50: { total: 0, correct: 0 },
    0: { total: 0, correct: 0 },
  };
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  // NEW: UPSC specific trackers
  let sillyMistakes = 0;
  let hardSuccess = 0;
  let missedEasyQNumbers = [];
  currentQuizData.forEach((q, i) => {
    const uAns = userAnswers[i];
    const correctIndex = getCorrectIndex(q);

    // Community accuracy calculation for Silly Mistake vs Hard Success flagging
    const commCorrect = currentReviewStats?.correctCounts?.[i] || 0;
    const commTotal = currentReviewStats?.totalAttempts || 1;
    const commAccuracy = (commCorrect / commTotal) * 100;
    // 2. Track accuracy per confidence level
    const confidence = uAns?.surety;
    if (uAns && confidence !== undefined) {
      confStats[confidence].total++;
      if (uAns.answer === getCorrectIndex(q)) {
        confStats[confidence].correct++;
      }
    }

    if (!uAns) {
      unattempted++;
    } else if (uAns.answer === correctIndex) {
      correct++;
      if (commAccuracy < 40) hardSuccess++; // Correct on a low-accuracy question
    } else {
      incorrect++;
      // Flag if user missed a question that >65% of students got right
      if (commAccuracy > 65) {
        sillyMistakes++;
        missedEasyQNumbers.push(`Q${i + 1}`);
      }
    }
  });
  // 3. Calculate final percentages for the chart
  const confChartLabels = [
    "100% Confidence",
    "75% Confidence",
    "50% Confidence",
    "0% Confidence",
  ];
  const confChartValues = [
    confStats[100].total > 0
      ? ((confStats[100].correct / confStats[100].total) * 100).toFixed(1)
      : 0,
    confStats[75].total > 0
      ? ((confStats[75].correct / confStats[75].total) * 100).toFixed(1)
      : 0,
    confStats[50].total > 0
      ? ((confStats[50].correct / confStats[50].total) * 100).toFixed(1)
      : 0,
    confStats[0].total > 0
      ? ((confStats[0].correct / confStats[0].total) * 100).toFixed(1)
      : 0,
  ];

  const totalQuestions = currentQuizData.length;
  const attempted = correct + incorrect;
  const score = resultData
    ? resultData.score
    : (correct * 2 - incorrect * 0.66).toFixed(2);
  const totalMarks = totalQuestions * 2;

  // Advanced Stats Calculation
  const marksLost = (incorrect * 0.66).toFixed(2);
  const accuracyRate = ((correct / (correct + incorrect)) * 100 || 0).toFixed(
    1
  );

  const deepDiveHtml = generateDeepDiveStats(currentQuizData, userAnswers, questionTimeSpent, currentReviewStats);

  const content = document.getElementById("quiz-content");

  content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-bottom pb-3">
            <div>
                <h4 class="fw-bold text-primary m-0">${currentChapterName}</h4>
                <span class="badge bg-secondary">Performance Review</span>
            </div>
            <div class="btn-group shadow-sm" role="group">
                <button class="btn btn-outline-primary active" id="btn-all" onclick="filterReview('all', this)">All</button>
                <button class="btn btn-outline-success" id="btn-correct" onclick="filterReview('correct', this)">Correct</button>
                <button class="btn btn-outline-danger" id="btn-incorrect" onclick="filterReview('incorrect', this)">Incorrect</button>
                <button class="btn btn-outline-secondary" id="btn-unattempted" onclick="filterReview('unattempted', this)">Unattempted</button>
            </div>
        </div>

        <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body">
                <h5 class="fw-bold card-title mb-3">📊 UPSC Prep Index</h5>
                
                <div class="row g-3 text-center mb-4">
                    <div class="col-6 col-md-3">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-primary">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Accuracy</h6>
                            <h3 class="fw-bold text-dark m-0">${accuracyRate}%</h3>
                            <small class="text-muted">on attempted</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-danger">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Negative Loss</h6>
                            <h3 class="fw-bold text-danger m-0">-${marksLost}</h3>
                            <small class="text-muted">marks lost</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Concept Gaps</h6>
                            <h3 class="fw-bold text-warning m-0">${sillyMistakes}</h3>
                             <small class="text-muted d-block">
                                ${
                                  missedEasyQNumbers.length > 0
                                    ? `Easy Qs Missed -- <span class="text-danger fw-bold">"${missedEasyQNumbers.join(
                                        ", "
                                      )}"</span>`
                                    : "No Easy Qs Missed"
                                }
                            </small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 bg-primary text-white rounded shadow-sm">
                            <h6 class="text-white-50 text-uppercase small fw-bold mb-1">Final Score</h6>
                            <h3 class="fw-bold m-0">${score} <span class="fs-6 text-white-50">/ ${totalMarks}</span></h3>
                        </div>
                    </div>
                </div>
                <div class="row g-2 mb-4 text-center">
                    <div class="col-4 col-md">
                        <div class="p-2 border rounded bg-light">
                            <small class="text-muted d-block small fw-bold">TOTAL Qs</small>
                            <span class="fw-bold">${totalQuestions}</span>
                        </div>
                    </div>
                    <div class="col-4 col-md">
                        <div class="p-2 border rounded bg-light">
                            <small class="text-muted d-block small fw-bold">ATTEMPTED</small>
                            <span class="fw-bold text-primary">${attempted}</span>
                        </div>
                    </div>
                    <div class="col-4 col-md">
                        <div class="p-2 border rounded bg-light">
                            <small class="text-muted d-block small fw-bold">UNATTEMPTED</small>
                            <span class="fw-bold text-secondary">${unattempted}</span>
                        </div>
                    </div>
                    <div class="col-6 col-md">
                        <div class="p-2 border rounded bg-light border-success-subtle">
                            <small class="text-success d-block small fw-bold">CORRECT</small>
                            <span class="fw-bold text-success">${correct}</span>
                        </div>
                    </div>
                    <div class="col-6 col-md">
                        <div class="p-2 border rounded bg-light border-danger-subtle">
                            <small class="text-danger d-block small fw-bold">INCORRECT</small>
                            <span class="fw-bold text-danger">${incorrect}</span>
                        </div>
                    </div>
                </div>

                <div class="row mb-4 g-3">
                    <div class="col-md-6">
                        <div class="alert alert-info border-0 shadow-sm h-100">
                            <h6 class="fw-bold"><i class="fas fa-lightbulb me-2"></i>Strategy Insight</h6>
                            <p class="small mb-0">
                                ${
                                  accuracyRate < 70
                                    ? "Your accuracy is below threshold. Focus on elimination techniques."
                                    : "Good precision. You are making calculated attempts."
                                }
                                ${
                                  sillyMistakes > 2
                                    ? `You missed <strong>${sillyMistakes} basic questions</strong> that 65% of students got right. Tighten your fundamentals.`
                                    : "You handled the 'easy' questions with professional precision."
                                }
                            </p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="alert alert-success border-0 shadow-sm h-100">
                            <h6 class="fw-bold"><i class="fas fa-trophy me-2"></i>Competitive Edge</h6>
                            <p class="small mb-0">
                                You solved <strong>${hardSuccess} high-difficulty</strong> questions where the community struggled. This indicates depth in complex topics.
                            </p>
                        </div>
                    </div>
                </div>
                <div id="leaderboard-container" class="mb-4">
                     <div class="text-center py-3">
                        <span class="spinner-border spinner-border-sm text-primary"></span> Loading Leaderboard...
                    </div>
                </div>

                <div class="row align-items-center pt-3 border-top" id="global-stats-container">
                    <div class="col-12 text-center py-3">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="text-muted small mt-2">Comparing with other students...</p>
                    </div>
                </div>
                <div class="mb-5 mt-5 p-3 rounded border bg-white">
    <h6 class="fw-bold text-secondary mb-3"><i class="bi bi-graph-up-arrow me-2"></i>Confidence vs Accuracy Analysis</h6>
    <div style="height: 250px; width: 100%;">
        <canvas id="confidenceChart"></canvas>
    </div>
    <p class="small text-muted mt-2 text-center">Correct attempts as a % of each confidence level.</p>
</div> 
${deepDiveHtml}
            </div>
        </div>
        
        <div id="review-container"></div>
        
        <div class="text-center mt-5">
            <button class="btn btn-primary-custom px-5 shadow py-2" onclick="exitQuiz()">← Back</button>
        </div>
    `;

  filterReview("all", document.getElementById("btn-all"));
  renderReviewNav();
  loadLeaderboard(currentChapterId);

  const stats = currentReviewStats;
  const container = document.getElementById("global-stats-container");

  if (!stats) {
    container.innerHTML = `<div class="col-12 text-center text-muted">Not enough data for global comparison yet.</div>`;
    return;
  }

  const myScore = resultData ? resultData.scorePercent : 0;
  const betterThan = stats.allScores.filter((s) => s < myScore).length;
  const percentile =
    stats.totalAttempts > 0
      ? ((betterThan / stats.totalAttempts) * 100).toFixed(0)
      : 0;

  container.innerHTML = `
        <div class="col-md-4 mb-3 mb-md-0 text-center">
            <h6 class="text-uppercase text-muted small fw-bold">Your Rank</h6>
            <h2 class="fw-bold text-primary">Top ${100 - percentile}%</h2>
            <p class="small text-muted">Better than ${percentile}% of users</p>
        </div>
        <div class="col-md-8">
            <div style="height: 200px; width: 100%;">
                <canvas id="comparisonChart"></canvas>
            </div>
        </div>
    `;

  const ctx = document.getElementById("comparisonChart");
  if (comparisonChartInstance) comparisonChartInstance.destroy();

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#e5e7eb" : "#666";

  comparisonChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Global Avg", "Your Score", "Topper"],
      datasets: [
        {
          label: "Score (%)",
          data: [
            stats.avg.toFixed(1),
            myScore.toFixed(1),
            stats.highest.toFixed(1),
          ],
          backgroundColor: [
            "rgba(108, 117, 125, 0.5)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(245, 158, 11, 0.8)",
          ],
          borderColor: [
            "rgba(108, 117, 125, 1)",
            "rgba(30, 58, 138, 1)",
            "rgba(245, 158, 11, 1)",
          ],
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: { display: false },
          ticks: { color: textColor },
        },
        y: { grid: { display: false }, ticks: { color: textColor } },
      },
    },
  });
  ChartHelper.renderConfidenceChart(document.getElementById("confidenceChart"), confChartValues, confStats);
}

function filterReview(filterType, btnElement) {
  const buttons = document.querySelectorAll(".btn-group .btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  renderReviewQuestions(filterType);
}

function renderReviewQuestions(filterType) {
  const container = document.getElementById("review-container");
  container.innerHTML = "";

  let visibleCount = 0;

  currentQuizData.forEach((question, index) => {
    const correctIndex = getCorrectIndex(question);
    const uAns = userAnswers[index];
    const userSurety = uAns?.surety !== undefined ? uAns.surety : "N/A";

    let status = "unattempted";
    if (uAns) {
      status = uAns.answer === correctIndex ? "correct" : "incorrect";
    }

    if (filterType !== "all" && status !== filterType) return;
    visibleCount++;

    let badgeHtml = "";
    let borderClass = "";
    let suretyClass = "surety-0";
    if (userSurety === 100) suretyClass = "surety-100";
    else if (userSurety === 75) suretyClass = "surety-75";
    else if (userSurety === 50) suretyClass = "surety-50";

    if (status === "correct") {
      badgeHtml = '<span class="badge bg-success mb-2">Correct</span>';
      borderClass = "border-success";
    } else if (status === "incorrect") {
      badgeHtml = '<span class="badge bg-danger mb-2">Incorrect</span>';
      borderClass = "border-danger";
    } else {
      badgeHtml = '<span class="badge bg-secondary mb-2">Unattempted</span>';
      borderClass = "border-secondary";
    }

    let statsHtml = "";
    let difficultyBadge = "";

    if (currentReviewStats && currentReviewStats.totalAttempts > 0) {
      const total = currentReviewStats.totalAttempts;
      const correctCount =
        (currentReviewStats.correctCounts &&
          currentReviewStats.correctCounts[index]) ||
        0;
      const attemptedCount =
        (currentReviewStats.attemptedCounts &&
          currentReviewStats.attemptedCounts[index]) ||
        0;
      const pCorrect = Math.round((correctCount / total) * 100);
      const pIncorrect = Math.round(
        ((attemptedCount - correctCount) / total) * 100
      );
      const pUnattempted = 100 - pCorrect - pIncorrect;

      // Determine Difficulty based on community accuracy
      let diffLabel = "Medium";
      let diffColor = "warning"; // yellow/orange
      if (pCorrect >= 70) {
          diffLabel = "Easy";
          diffColor = "success"; // green
      } else if (pCorrect <= 40) {
          diffLabel = "Hard";
          diffColor = "danger"; // red
      }
      difficultyBadge = `<span class="badge bg-${diffColor} ms-2">${diffLabel}</span>`;

      statsHtml = `
            <div class="mt-2 mb-4 p-3 bg-light bg-opacity-75 rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small fw-bold text-uppercase text-secondary" style="letter-spacing: 0.5px;">👥 Community Stats</span>
                    <span class="fw-bold" style="color: #4338ca;">${pCorrect}% Correct</span>
                </div>
                <div class="progress shadow-sm" style="height: 40px; background-color: #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div class="progress-bar stats-bar-correct d-flex align-items-center justify-content-center" role="progressbar" style="width: ${pCorrect}%">
                         <span class="progress-bar-text">${
                           pCorrect > 12 ? pCorrect + "%" : ""
                         }</span>
                    </div>
                    <div class="progress-bar stats-bar-incorrect d-flex align-items-center justify-content-center" role="progressbar" style="width: ${pIncorrect}%">
                         <span class="progress-bar-text">${
                           pIncorrect > 12 ? pIncorrect + "%" : ""
                         }</span>
                    </div>
                    <div class="progress-bar stats-bar-left d-flex align-items-center justify-content-center" role="progressbar" style="width: ${pUnattempted}%">
                         <span class="progress-bar-text">${
                           pUnattempted > 12 ? pUnattempted + "%" : ""
                         }</span>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 mt-2">
                    <span class="fw-bold" style="color: #4338ca;">Total Question Attempts: ${attemptedCount}</span>
                </div>
            </div>
        `;
    }

    let optionsHtml = "";
    question.options.forEach((opt, optIdx) => {
      let optionClass = "option p-3 mb-2 border rounded";
      let icon = "";
      if (optIdx === correctIndex) {
        optionClass =
          "option p-3 mb-2 border rounded bg-success-subtle border-success fw-bold text-success";
        icon = "✅";
      } else if (uAns && uAns.answer === optIdx && status === "incorrect") {
        optionClass =
          "option p-3 mb-2 border rounded bg-danger-subtle border-danger text-danger";
        icon = "❌";
      }
      optionsHtml += `<div class="${optionClass}">${icon} <span class="ms-1">${opt}</span></div>`;
    });

    // Time Badge Logic
    const timeSec = (questionTimeSpent && questionTimeSpent[index]) ? Math.round(questionTimeSpent[index]) : 0;
    const timeLabel = timeSec < 60 ? `${timeSec}s` : `${Math.floor(timeSec/60)}m ${timeSec%60}s`;
    const timeBadge = `<span class="badge bg-light text-dark border ms-2">⏱ ${timeLabel}</span>`;

    const card = document.createElement("div");
    card.id = `review-q-${index}`; // ID for navigation
    card.className = `card mb-4 shadow-sm border-0 border-start border-5 ${borderClass}`;
    card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                        <h6 class="text-muted fw-bold m-0 me-2">Question ${index + 1}</h6>
                        <span class="surety-badge ${suretyClass}">Confidence: ${userSurety}%</span>
                        ${difficultyBadge}
                        ${timeBadge}
                    </div>
                    ${badgeHtml}
                </div>
                ${statsHtml} 
                <div class="fs-5 fw-medium mb-3">${TextFormatter.formatQuestionText(question.text)}</div>
                <div class="mb-3">${optionsHtml}</div>
                <div class="explanation mt-3 shadow-sm">
                    <strong>💡 Explanation:</strong>
                    <div class="mt-1 small">${
                      question.explanation || "No explanation provided."
                    }</div>
                </div>
            </div>
        `;
    container.appendChild(card);
  });

  if (visibleCount === 0) {
    container.innerHTML = `<div class="alert alert-info text-center">No questions found for this filter.</div>`;
  }
}

function renderReviewNav() {
  const navContainer = document.getElementById("quiz-nav");
  if (!navContainer) return;

  navContainer.innerHTML = `
      <div class="nav-header">Question Palette</div>
      <div class="mb-3 px-3">
          <small class="text-muted">Click to jump to question</small>
      </div>
      <div id="review-nav-grid" class="nav-grid"></div>

      <div class="mt-4 px-3">
        <div class="d-flex align-items-center mb-2"><span class="badge bg-success me-2" style="width: 20px; height: 20px;"> </span> Correct</div>
        <div class="d-flex align-items-center mb-2"><span class="badge bg-danger me-2" style="width: 20px; height: 20px;"> </span> Incorrect</div>
        <div class="d-flex align-items-center mb-2"><span class="badge bg-secondary me-2" style="width: 20px; height: 20px;"> </span> Unattempted</div>
      </div>
  `;

  const grid = document.getElementById("review-nav-grid");

  currentQuizData.forEach((q, i) => {
      const uAns = userAnswers[i];
      const correctIdx = getCorrectIndex(q);

      let statusClass = "unattempted";
      if (uAns) {
          if (uAns.answer === correctIdx) statusClass = "correct-nav";
          else statusClass = "incorrect-nav";
      }

      const btn = document.createElement("div");
      btn.className = `nav-item shadow-sm ${statusClass}`;
      btn.textContent = i + 1;
      btn.onclick = () => {
          const el = document.getElementById(`review-q-${i}`);
          if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.style.transition = "transform 0.3s, box-shadow 0.3s";
              el.style.transform = "scale(1.02)";
              el.classList.remove("shadow-sm");
              el.classList.add("shadow-lg");
              setTimeout(() => {
                  el.style.transform = "scale(1)";
                  el.classList.remove("shadow-lg");
                  el.classList.add("shadow-sm");
              }, 1500);
          }
      };
      grid.appendChild(btn);
  });
}

/* =========================================
   6. TIMER & NAVIGATION
   ========================================= */

/**
 * Starts the timer with persistence support
 */
function startTimer(numQuestions, savedTime = null) {
  // If savedTime is provided from localStorage, use it.
  // Otherwise, calculate default (1.2 mins per Q)
  currentTimerSeconds =
    savedTime !== null ? savedTime : Math.floor(numQuestions * 1.2 * 60);
  isTimerPaused = false;

  if (currentQuizTimer) currentQuizTimer.stop();

  currentQuizTimer = new QuizTimer("timer-display",
      (seconds) => {
          currentTimerSeconds = seconds;
          saveQuizProgress();
      },
      () => {
          toastr.warning("Time's up! Submitting test...");
          submitAll(true);
      }
  );

  currentQuizTimer.start(currentTimerSeconds);
}

function toggleTimer() {
  const btn = document.getElementById("timer-pause-btn");
  const qContainer = document.getElementById("question-container");
  if (!btn || !currentQuizTimer) return;

  if (currentQuizTimer.isPaused) {
      currentQuizTimer.resume();
      isTimerPaused = false;
  } else {
      currentQuizTimer.pause();
      isTimerPaused = true;
  }

  if (isTimerPaused) {
    btn.innerHTML = '<i class="bi bi-play-fill"></i> Resume';
    // Swap specific color classes only
    btn.classList.replace("btn-secondary-custom", "btn-primary-custom");

    if (qContainer) {
      qContainer.style.filter = "blur(8px)";
      qContainer.style.pointerEvents = "none";
    }
    toastr.info("Timer Paused");
  } else {
    btn.innerHTML = '<i class="bi bi-pause-fill"></i> Pause';
    btn.classList.replace("btn-primary-custom", "btn-secondary-custom");

    if (qContainer) {
      qContainer.style.filter = "none";
      qContainer.style.pointerEvents = "all";
    }
    toastr.success("Timer Resumed");
  }
}

function renderQuizLayout(title) {
  document.getElementById("quiz-content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold text-primary m-0">${title}</h4>
            <button id="mark-review-btn" class="btn btn-primary-custom btn-sm fw-bold shadow-sm" onclick="toggleMarkForReview()">
                <i class="bi bi-bookmark-star"></i> Mark for Review
            </button>
        </div>
        <div id="question-container"></div>
        <div class="d-flex justify-content-between mt-4">
            <button id="prev-btn" class="btn btn-secondary-custom px-4 ">Previous</button>
            <button id="clear-btn" class="btn btn-primary-custom px-4 ">Clear</button>
            <button id="next-btn" class="btn btn-secondary-custom px-4 ">Next</button>
        </div>
        <div id="question-feedback" class="mt-3 text-center"></div>
        <div id="result" class="mt-4 text-center"></div>
    `;

  document.getElementById("quiz-nav").innerHTML = `
    <div class="nav-header">Question Palette</div>
    <div class="timer-container shadow-sm position-relative" style="padding-bottom: 45px !important;">
        <span class="timer-label">Time Remaining</span>
        <div id="timer-display" class="timer-value">00:00</div>
        
        <button id="timer-pause-btn" 
                class="btn btn-sm btn-secondary-custom fw-bold position-absolute" 
                style="bottom: 12px; right: 12px; font-size: 0.85rem; padding: 5px 12px; border-radius: 8px;"
                onclick="toggleTimer()">
            <i class="bi bi-pause-fill"></i> Pause
        </button>
    </div>
    <div id="nav-container" class="nav-grid"></div>
    <button id="final-submit-btn" class="btn btn-success-custom w-100 mt-4 py-2 fw-bold">Submit Test</button>
`;

  document
    .getElementById("prev-btn")
    .addEventListener("click", () => navigateQuestions(-1));
  document
    .getElementById("next-btn")
    .addEventListener("click", () => navigateQuestions(1));
  document
    .getElementById("clear-btn")
    .addEventListener("click", clearSelection);
  document
    .getElementById("final-submit-btn")
    .addEventListener("click", () => submitAll(false));
}

function renderQuestion() {
  const container = document.getElementById("question-container");
  container.innerHTML = "";
  const question = currentQuizData[currentQuestionIndex];
  const correctIndex = getCorrectIndex(question);

  const markBtn = document.getElementById("mark-review-btn");
  if (markBtn) {
    if (markedForReview[currentQuestionIndex]) {
      markBtn.innerHTML = `<i class="bi bi-bookmark-check-fill"></i> Unmark Review`;
      markBtn.classList.replace("btn-secondary-custom", "btn-primary-custom");
    } else {
      markBtn.innerHTML = `<i class="bi bi-bookmark-star"></i> Mark for Review`;
      markBtn.classList.replace("btn-primary-custom", "btn-secondary-custom");
    }
  }

  const div = document.createElement("div");
  div.className = "question";
  const formattedText = TextFormatter.formatQuestionText(question.text);
  div.innerHTML = `<div class="mb-3 lead fw-bold">Q${
    currentQuestionIndex + 1
  }. ${formattedText}</div>`;

  question.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "option shadow-sm";
    const uAns = userAnswers[currentQuestionIndex];
    const isSelected = uAns && uAns.answer === idx;

    let inputHTML = `<input type="radio" name="q${currentQuestionIndex}" value="${idx}" ${
      isSelected ? "checked" : ""
    } ${quizSubmitted ? "disabled" : ""}>`;
    label.innerHTML = `${inputHTML} <span>${opt}</span>`;

    if (quizSubmitted) {
      if (idx === correctIndex) label.classList.add("correct-answer-label");
      if (isSelected && idx !== correctIndex)
        label.classList.add("incorrect-answer-label");
    } else {
      label.querySelector("input").addEventListener("change", () => {
        if (!userAnswers[currentQuestionIndex])
          userAnswers[currentQuestionIndex] = {};
        userAnswers[currentQuestionIndex].answer = idx;
        updateNavHighlights();
        saveQuizProgress();
      });
    }
    div.appendChild(label);
  });

  // --- SURETY MATRIX IMPLEMENTATION ---
  const currentSurety = userAnswers[currentQuestionIndex]?.surety;
  const suretyDiv = document.createElement("div");
  suretyDiv.className = "mt-4 mb-3 animate-fade-in";
  suretyDiv.innerHTML = `
    <div class="surety-label">Confidence Level</div>
    <div class="surety-matrix shadow-sm">
        <div class="surety-opt surety-100 ${
          currentSurety === 100 ? "selected" : ""
        }" data-val="100">100%</div>
        <div class="surety-opt surety-75 ${
          currentSurety === 75 ? "selected" : ""
        }" data-val="75">75%</div>
        <div class="surety-opt surety-50 ${
          currentSurety === 50 ? "selected" : ""
        }" data-val="50">50%</div>
        <div class="surety-opt surety-0 ${
          currentSurety === 0 ? "selected" : ""
        }" data-val="0">0%</div>
    </div>
  `;

  if (!quizSubmitted) {
    suretyDiv.querySelectorAll(".surety-opt").forEach((opt) => {
      opt.onclick = function () {
        const val = parseInt(this.getAttribute("data-val"));
        if (!userAnswers[currentQuestionIndex])
          userAnswers[currentQuestionIndex] = { answer: -1 };
        userAnswers[currentQuestionIndex].surety = val;

        // Toggle 'selected' class only
        suretyDiv
          .querySelectorAll(".surety-opt")
          .forEach((o) => o.classList.remove("selected"));
        this.classList.add("selected");
        saveQuizProgress();
      };
    });
  }
  div.appendChild(suretyDiv);

  if (quizSubmitted && question.explanation) {
    const exp = document.createElement("div");
    exp.className = "explanation shadow-sm mt-3";
    exp.innerHTML = `<strong>💡 Explanation:</strong> <br>${question.explanation}`;
    div.appendChild(exp);
  }

  container.appendChild(div);
  updateButtonStates();
  if (quizSubmitted) showFeedbackText(correctIndex);
  else {
    const feedback = document.getElementById("question-feedback");
    if (feedback) feedback.textContent = "";
  }
}
function showFeedbackText(correctIndex) {
  const resultDiv = document.getElementById("question-feedback");
  const uAns = userAnswers[currentQuestionIndex];
  if (uAns && uAns.answer === correctIndex)
    resultDiv.innerHTML = `<h5 class="text-success fw-bold">Correct! 🎉</h5>`;
  else if (uAns)
    resultDiv.innerHTML = `<h5 class="text-danger fw-bold">Incorrect. ❌</h5>`;
  else
    resultDiv.innerHTML = `<h5 class="text-secondary fw-bold">Unattempted. ⚪</h5>`;
}

function updateButtonStates() {
  const p = document.getElementById("prev-btn");
  const n = document.getElementById("next-btn");
  if (p) p.disabled = currentQuestionIndex === 0;
  if (n) n.disabled = currentQuestionIndex === currentQuizData.length - 1;
}

function navigateQuestions(dir) {
  const next = currentQuestionIndex + dir;
  if (next >= 0 && next < currentQuizData.length) {
    updateQuestionTimer(); // Save time for current question
    currentQuestionIndex = next;
    renderQuestion();
    updateNavHighlights();
    saveQuizProgress();
  }
}

function clearSelection() {
  if (quizSubmitted) return;
  delete userAnswers[currentQuestionIndex];
  renderQuestion();
  updateNavHighlights();
  saveQuizProgress();
}

function renderNav() {
  const nav = document.getElementById("nav-container");
  nav.innerHTML = "";
  currentQuizData.forEach((_, i) => {
    const item = document.createElement("div");
    item.className = "nav-item shadow-sm nav-item-animate";
    item.textContent = i + 1;
    item.style.setProperty("--animation-delay", `${i * 30}ms`);
    item.onclick = () => {
      updateQuestionTimer(); // Save time for current question
      currentQuestionIndex = i;
      renderQuestion();
      updateNavHighlights();
      saveQuizProgress();
    };
    nav.appendChild(item);
  });
  updateNavHighlights();
}

function updateNavHighlights() {
  document.querySelectorAll(".nav-item").forEach((item, i) => {
    item.className = "nav-item shadow-sm";
    if (i === currentQuestionIndex) item.classList.add("active");

    const uAns = userAnswers[i];
    const isMarked = markedForReview[i]; // NEW

    if (quizSubmitted) {
      const correctIndex = getCorrectIndex(currentQuizData[i]);
      if (!uAns) item.classList.add("unattempted");
      else if (uAns.answer === correctIndex) item.classList.add("correct-nav");
      else item.classList.add("incorrect-nav");
    } else {
      if (uAns) item.classList.add("attempted");
      if (isMarked) item.classList.add("marked-nav"); // NEW: Apply purple highlight
    }
  });
}
/* =========================================
   7. SUBMIT & STATISTICS
   ========================================= */

function submitAll(forceSubmit = false) {
  if (!forceSubmit && !confirm("Are you sure you want to submit?")) return;

  if (currentQuizTimer) currentQuizTimer.stop();
  updateQuestionTimer(); // Finalize time for the last question

  quizSubmitted = true;
  clearQuizProgress(currentChapterId);

  let score = 0;
  let correct = 0,
    incorrect = 0,
    unattempted = 0;
  const totalQ = currentQuizData.length;

  currentQuizData.forEach((q, i) => {
    const uAns = userAnswers[i];
    const cIdx = getCorrectIndex(q);

    if (uAns) {
      const isCorrect = uAns.answer === cIdx;
      userAnswers[i].isCorrect = isCorrect;
      if (isCorrect) {
        score += 2;
        correct++;
      } else {
        score -= 0.66;
        incorrect++;
      }
    } else {
      unattempted++;
    }
  });

  const finalScore = parseFloat(score.toFixed(2));
  const totalMarks = totalQ * 2;
  const percentage =
    totalMarks > 0 ? ((finalScore / totalMarks) * 100).toFixed(1) : 0;

  const leaderboardEntry = {
    userEmail: currentUser ? currentUser.email : "guest",
    scorePercent: parseFloat(percentage),
    score: finalScore,
    rankTime: new Date().toISOString(),
  };

  const resultObject = {
    userId: currentUser ? currentUser.uid : "guest",
    userEmail: currentUser ? currentUser.email : "guest",
    subject: currentSubject,
    chapterId: currentChapterId,
    chapterName: currentChapterName,
    score: finalScore,
    totalMarks: totalMarks,
    scorePercent: parseFloat(percentage),
    userAnswers: userAnswers,
    questionTimeSpent: questionTimeSpent, // Save time per question
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  document.getElementById("result").innerHTML = `
        <div class="alert alert-primary mt-3 shadow-sm" role="alert">
            <h4 class="alert-heading fw-bold">Test Complete! 🏆</h4>
            <hr>
            <p>✅ Correct: <strong>${correct}</strong> | ❌ Incorrect: <strong>${incorrect}</strong></p>
            <p>⚪ Unattempted: <strong>${unattempted}</strong></p>
            <h3 class="text-primary mt-2">Score: ${finalScore} / ${totalMarks} (${percentage}%)</h3>
            <div id="stats-loading" class="mt-2 text-muted small"><span class="spinner-border spinner-border-sm"></span> Calculating class standing...</div>
        </div>
        <div id="result-actions" class="d-flex justify-content-center gap-2 mt-2"></div>
    `;

  const actionsDiv = document.getElementById("result-actions");
  const reviewBtn = document.createElement("button");
  reviewBtn.className = "btn btn-primary-custom px-4 shadow";
  reviewBtn.innerHTML = "👁 Review Performance";
  reviewBtn.onclick = () => {
    const subjectPrefix = currentSubject.replace(/\s+/g, "_") + "_";
    const originalChapId = currentChapterId.replace(subjectPrefix, "");
    loadQuiz(
      currentSubject,
      originalChapId,
      encodeURIComponent(currentChapterName),
      true,
      resultObject,
      "chapters"
    );
  };

  actionsDiv.appendChild(reviewBtn);
  if (document.getElementById("final-submit-btn"))
    document.getElementById("final-submit-btn").style.display = "none";
  if (document.getElementById("clear-btn"))
    document.getElementById("clear-btn").disabled = true;

  renderQuestion();
  updateNavHighlights();

  if (currentUser) {
    db.collection("results")
      .add({ ...resultObject })
      .then(async () => {
        userHistory.unshift({ ...resultObject, timestamp: new Date() });
        if (userHistory.length > 20) userHistory.pop();
        dashboardDataLoaded = true;

        // Invalidate caches
        await DataManager.invalidateCache(`global_stats_${currentChapterId}`);
        await DataManager.invalidateCache(`user_history_${currentUser.uid}`);

        const statsRef = db.collection("chapter_stats").doc(currentChapterId);
        try {
          await db.runTransaction(async (transaction) => {
            const sfDoc = await transaction.get(statsRef);
            const newScore = parseFloat(percentage);

            if (!sfDoc.exists) {
              const initCorrectCounts = currentQuizData.map((q, i) =>
                userAnswers[i] && userAnswers[i].answer === getCorrectIndex(q)
                  ? 1
                  : 0
              );
              const initAttemptedCounts = currentQuizData.map((q, i) =>
                userAnswers[i] ? 1 : 0
              );
              transaction.set(statsRef, {
                totalScore: newScore,
                totalAttempts: 1,
                average: newScore,
                highestScore: newScore,
                allScores: [newScore],
                leaderboard: [leaderboardEntry],
                correctCounts: initCorrectCounts,
                attemptedCounts: initAttemptedCounts,
              });
            } else {
              const data = sfDoc.data();
              const newAttempts = (data.totalAttempts || 0) + 1;
              const newAvg = ((data.totalScore || 0) + newScore) / newAttempts;
              let currentLeaderboard = data.leaderboard || [];
              currentLeaderboard.push(leaderboardEntry);
              currentLeaderboard.sort(
                (a, b) => b.scorePercent - a.scorePercent
              );
              if (currentLeaderboard.length > 10)
                currentLeaderboard = currentLeaderboard.slice(0, 10);

              let cCounts = data.correctCounts || [];
              let aCounts = data.attemptedCounts || [];
              currentQuizData.forEach((q, i) => {
                if (userAnswers[i]) {
                  aCounts[i] = (aCounts[i] || 0) + 1;
                  if (userAnswers[i].answer === getCorrectIndex(q))
                    cCounts[i] = (cCounts[i] || 0) + 1;
                }
              });

              transaction.update(statsRef, {
                totalScore: (data.totalScore || 0) + newScore,
                totalAttempts: newAttempts,
                average: newAvg,
                highestScore: Math.max(data.highestScore || 0, newScore),
                allScores: [...(data.allScores || []), newScore],
                leaderboard: currentLeaderboard,
                correctCounts: cCounts,
                attemptedCounts: aCounts,
              });
            }
          });
          toastr.success("Result and stats saved!");
        } catch (e) {
          console.error("Stats update failed:", e);
        }

        const stats = await DataManager.fetchGlobalStats(currentChapterId, true);
        if (stats) {
          const betterThan = stats.allScores.filter(
            (s) => s < parseFloat(percentage)
          ).length;
          const percentile =
            stats.totalAttempts > 0
              ? ((betterThan / stats.totalAttempts) * 100).toFixed(0)
              : 0;
          if (document.getElementById("stats-loading"))
            document.getElementById(
              "stats-loading"
            ).innerHTML = `🌍 Performance: Top <strong>${
              100 - percentile
            }%</strong>. (Avg: ${stats.avg.toFixed(1)}%)`;
        }
      });
  }
}

function toggleMarkForReview() {
  if (quizSubmitted) return;

  if (markedForReview[currentQuestionIndex]) {
    delete markedForReview[currentQuestionIndex];
    toastr.info("Removed from Review");
  } else {
    markedForReview[currentQuestionIndex] = true;
    toastr.success("Marked for Review");
  }

  renderQuestion(); // Refresh the UI to update button text
  updateNavHighlights(); // Refresh palette colors
  saveQuizProgress(); // Save state
}
