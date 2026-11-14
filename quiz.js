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
    subject: currentSubject,
    chapterName: currentChapterName,
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

let lastProgressSaveTime = 0;

// Persist at most once every 10s during timer ticks (P0-9).
// Answer, navigation, mark and visibility events still save immediately.
function saveQuizProgressThrottled() {
  const now = Date.now();
  if (now - lastProgressSaveTime >= 10000) {
    lastProgressSaveTime = now;
    saveQuizProgress();
  }
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
let subjectSortMode = "az";
let chapterFilterMode = "all";
let currentChapterSubject = "";
let revisionSubjectKey = "";
let quizMode = "exam";

function getChapterQuestionCount(chapters, chapId) {
  const raw = chapters && chapters[chapId];
  if (typeof raw === "number") return raw;
  if (Array.isArray(raw)) return raw.length;
  if (raw && Array.isArray(raw.questions)) return raw.questions.length;
  if (raw && typeof raw.questionCount === "number") return raw.questionCount;
  if (raw && typeof raw.numQuestions === "number") return raw.numQuestions;
  return null;
}

function getInProgressChapterIds() {
  const ids = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.indexOf("quiz_progress_") === 0) {
      ids.add(key.substring("quiz_progress_".length));
    }
  }
  return ids;
}

function toTimestampMs(ts) {
  if (!ts) return 0;
  if (ts.seconds) return ts.seconds * 1000;
  if (ts.toDate) return ts.toDate().getTime();
  return new Date(ts).getTime() || 0;
}

function formatLastAttempt(timestamp) {
  const ms = toTimestampMs(timestamp);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

async function renderSubjects() {
  renderBreadcrumbs([
      { label: 'Home', onclick: 'showHome()' },
      { label: 'Dashboard', onclick: 'showDashboard()' },
      { label: 'Take Test' }
  ]);
  const container = document.getElementById("test-content-container");

  if (typeof allQuizData === "undefined" || !allQuizData) {
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading Subjects from Cloud...</p>
        </div>`;
    await DataManager.fetchQuizManifest();
  }

  if (typeof allQuizData === "undefined" || !allQuizData) {
    container.innerHTML =
      '<div class="alert alert-danger text-center">Failed to load Quiz Data from Firebase!</div>';
    return;
  }

  const subjects = Object.keys(allQuizData).map((subjectKey) => {
    const chapters = allQuizData[subjectKey];
    const chapterIds = Object.keys(chapters);
    const prefix = subjectKey.replace(/\s+/g, "_") + "_";

    const history = (userHistory || []).filter(
      (h) => h && h.subject === subjectKey
    );
    let lastTs = 0;
    history.forEach((h) => {
      const ts = toTimestampMs(h.timestamp);
      if (ts > lastTs) lastTs = ts;
    });

    const completedCount = chapterIds.filter((cid) =>
      history.some((h) => h.chapterId === prefix + cid)
    ).length;
    const progressPercent =
      chapterIds.length > 0
        ? Math.round((completedCount / chapterIds.length) * 100)
        : 0;

    return {
      subjectKey,
      lastTs,
      completedCount,
      totalChapters: chapterIds.length,
      progressPercent,
    };
  });

  if (subjectSortMode === "progress") {
    subjects.sort((a, b) => b.progressPercent - a.progressPercent);
  } else if (subjectSortMode === "recent") {
    subjects.sort((a, b) => b.lastTs - a.lastTs);
  } else {
    subjects.sort((a, b) =>
      a.subjectKey.localeCompare(b.subjectKey, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }

  container.innerHTML = `
        <div class="text-center mb-4">
            <h4 class="fw-bold section-title">Select a Subject</h4>
            <div class="title-underline mx-auto"></div>
        </div>
        <div class="row justify-content-center mb-4 g-2">
            <div class="col-md-8 col-lg-6">
                <input id="subject-search" class="form-control" type="search" placeholder="Search subjects..." oninput="filterSubjects()">
            </div>
            <div class="col-md-4 col-lg-3">
                <select id="subject-sort" class="form-select" onchange="setSubjectSort(this.value)">
                    <option value="az" ${subjectSortMode === "az" ? "selected" : ""}>Sort: A–Z</option>
                    <option value="progress" ${subjectSortMode === "progress" ? "selected" : ""}>Sort: Progress</option>
                    <option value="recent" ${subjectSortMode === "recent" ? "selected" : ""}>Sort: Recently used</option>
                </select>
            </div>
        </div>
        <div class="row justify-content-center g-4" id="subjects-row"></div>
    `;

  const row = document.getElementById("subjects-row");
  const fragment = document.createDocumentFragment();

  subjects.forEach((s) => {
    const isCompleted = s.progressPercent === 100;
    const col = document.createElement("div");
    col.className = "col-md-4 col-lg-3 mb-4 subject-col";
    col.dataset.subject = s.subjectKey;
    col.innerHTML = `
            <div class="card topic-card h-100 ${
              isCompleted ? "subject-completed" : ""
            }" style="cursor: pointer;"
               role="button"
               tabindex="0"
               aria-label="Select Subject: ${s.subjectKey}"
               onkeydown="if(event.key==='Enter'||event.key===' '){this.click(); event.preventDefault();}">
                <div class="card-body text-center p-4 d-flex flex-column">
                    <div class="display-4 mb-3">${isCompleted ? "🏆" : "📖"}</div>
                    ${
                      isCompleted
                        ? '<div class="badge bg-success mb-2 animate-fade-in">✨ Completed</div>'
                        : ""
                    }
                    <h5 class="card-title text-primary fw-bold">${s.subjectKey}</h5>
                    <p class="text-muted small mb-3">${s.completedCount} / ${s.totalChapters} Chapters Done</p>
                    <div class="mt-auto">
                        <div class="progress mb-2" style="height: 25px; background-color: var(--border-color); border-radius: 5px;">
                            <div class="progress-bar ${
                              isCompleted ? "bg-success" : ""
                            }"
                                 role="progressbar"
                                 style="width: ${s.progressPercent}%; ${
      !isCompleted ? "background-color: var(--accent-color);" : ""
    } border-radius: 5px;">
                            </div>
                        </div>
                        <small class="fw-bold ${
                          isCompleted ? "text-success" : "text-secondary"
                        }">${s.progressPercent}% Complete</small>
                    </div>
                </div>
            </div>`;

    col.onclick = () => renderChapters(s.subjectKey);
    fragment.appendChild(col);
  });

  row.appendChild(fragment);
}

function setSubjectSort(mode) {
  subjectSortMode = mode;
  renderSubjects();
}

function filterSubjects() {
  const q = (document.getElementById("subject-search")?.value || "")
    .toLowerCase()
    .trim();
  document.querySelectorAll("#subjects-row .subject-col").forEach((col) => {
    const name = col.dataset.subject || "";
    col.style.display =
      !q || name.toLowerCase().includes(q) ? "" : "none";
  });
}

/**
 * UPDATED: Navigates back to showDashboard (the consolidated view)
 */
/**
 * UPDATED: Renders chapters for a selected subject in sorted order.
 */
function renderChapters(subjectKey) {
  currentChapterSubject = subjectKey;
  renderBreadcrumbs([
      { label: 'Home', onclick: 'showHome()' },
      { label: 'Dashboard', onclick: 'showDashboard()' },
      { label: 'Take Test', onclick: 'renderSubjects()' },
      { label: subjectKey }
  ]);
  const container = document.getElementById("test-content-container");

  container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div class="text-start">
                <h4 class="fw-bold section-title mb-1">Chapters: ${subjectKey}</h4>
                <div class="title-underline"></div>
            </div>
            <button class="btn btn-secondary-custom shadow-sm fw-bold" onclick="openRevisionModal('${subjectKey}')">
                <i class="bi bi-journal-text me-1"></i>Create Revision Test
            </button>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter chapters">
            <button class="btn btn-sm ${chapterFilterMode === "all" ? "btn-primary-custom" : "btn-outline-secondary"}" onclick="setChapterFilter('all')">All</button>
            <button class="btn btn-sm ${chapterFilterMode === "new" ? "btn-primary-custom" : "btn-outline-secondary"}" onclick="setChapterFilter('new')">New</button>
            <button class="btn btn-sm ${chapterFilterMode === "completed" ? "btn-primary-custom" : "btn-outline-secondary"}" onclick="setChapterFilter('completed')">Completed</button>
            <button class="btn btn-sm ${chapterFilterMode === "in progress" ? "btn-primary-custom" : "btn-outline-secondary"}" onclick="setChapterFilter('in progress')">In progress</button>
        </div>
        <div class="row" id="chapters-row"></div>
    `;

  const row = document.getElementById("chapters-row");
  const chapters = allQuizData[subjectKey];

  const sortedChapterIds = Object.keys(chapters).sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const inProgressIds = getInProgressChapterIds();

  const chapterAttempts = new Map();
  if (typeof userHistory !== "undefined" && userHistory) {
    userHistory.forEach((h) => {
      if (!chapterAttempts.has(h.chapterId)) chapterAttempts.set(h.chapterId, []);
      chapterAttempts.get(h.chapterId).push(h);
    });
  }

  const fragment = document.createDocumentFragment();

  sortedChapterIds.forEach((chapId) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4 chapter-col";

    const subjectPrefix = subjectKey.replace(/\s+/g, "_") + "_";
    const fullChapterId = subjectPrefix + chapId;

    const attempts = chapterAttempts.get(fullChapterId) || [];
    const latestResult = attempts[0] || null;
    const hasTaken = !!latestResult;
    const bestScore = attempts.length
      ? Math.max(...attempts.map((a) => a.scorePercent || 0))
      : null;

    const inProgress = inProgressIds.has(fullChapterId);
    const status = hasTaken ? "completed" : inProgress ? "in progress" : "new";

    const questionCount = getChapterQuestionCount(chapters, chapId);
    const durationMin = questionCount
      ? Math.ceil(questionCount * MARKING_SCHEME.minutesPerQuestion)
      : null;

    let statusChip = '<span class="badge bg-secondary">New</span>';
    if (status === "completed") statusChip = '<span class="badge bg-success">Completed</span>';
    else if (status === "in progress") statusChip = '<span class="badge bg-warning text-dark">In progress</span>';

    let scoreHtml = "";
    if (hasTaken) {
      scoreHtml = `<p class="small text-muted mb-1">Last: ${latestResult.scorePercent}% · Best: ${bestScore}%</p>`;
    }

    let metaHtml = "";
    if (questionCount) {
      metaHtml = `<div class="mb-2"><span class="badge bg-light text-dark border me-1">${questionCount} Qs</span><span class="badge bg-light text-dark border">${durationMin}m</span></div>`;
    }

    let actionHtml = "";
    if (hasTaken) {
      actionHtml = `
            <button class="btn btn-primary-custom w-100 review-perf-btn">👁 Review</button>
            <button class="btn btn-outline-secondary w-100 mt-2 retake-btn">↻ Retake</button>
        `;
    } else {
      const startLabel = inProgress ? "▶ Continue" : "🚀 Start Test";
      actionHtml = `<button class="btn btn-primary-custom w-100 action-btn">${startLabel}</button>`;
    }

    col.dataset.status = status;
    col.innerHTML = `
            <div class="card chapter-card h-100 border-0">
                <div class="card-body d-flex flex-column p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold text-dark mb-0">${chapId}</h5>
                        ${statusChip}
                    </div>
                    ${metaHtml}
                    ${scoreHtml}
                    <p class="small text-muted mb-2">Last attempt: ${formatLastAttempt(
                      latestResult && latestResult.timestamp
                    )}</p>
                    <div class="mt-auto">
                        ${actionHtml}
                    </div>
                </div>
            </div>`;

    const startOrRetake = () => {
      loadQuiz(subjectKey, chapId, encodeURIComponent(chapId));
    };

    col.querySelector(".action-btn")?.addEventListener("click", startOrRetake);
    col.querySelector(".retake-btn")?.addEventListener("click", startOrRetake);
    col.querySelector(".review-perf-btn")?.addEventListener("click", () => {
      reviewTest(latestResult, "chapters");
    });

    fragment.appendChild(col);
  });

  row.appendChild(fragment);
  filterChapters();
}

function setChapterFilter(mode) {
  chapterFilterMode = mode;
  renderChapters(currentChapterSubject);
}

function filterChapters() {
  document.querySelectorAll("#chapters-row .chapter-col").forEach((col) => {
    const status = col.dataset.status;
    col.style.display =
      chapterFilterMode === "all" || chapterFilterMode === status ? "" : "none";
  });
}

/* =========================================
   REVISION TEST LOGIC
   ========================================= */
function openRevisionModal(subjectKey) {
  revisionSubjectKey = subjectKey;
  const listContainer = document.getElementById("revision-tests-list");
  listContainer.innerHTML = "";

  const chapters = allQuizData[subjectKey];
  if (!chapters) return;

  const sortedChapterIds = Object.keys(chapters).sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  sortedChapterIds.forEach((chapId) => {
    const label = document.createElement("label");
    label.className = "list-group-item d-flex gap-2 align-items-center";
    label.innerHTML = `
      <input class="form-check-input flex-shrink-0 revision-checkbox" type="checkbox" value="${chapId}">
      <span>
        ${chapId}
      </span>
    `;
    label.querySelector("input").addEventListener("change", updateRevisionAvailable);
    listContainer.appendChild(label);
  });

  const generateBtn = document.getElementById("generate-revision-btn");
  generateBtn.onclick = () => generateRevisionTest(subjectKey);
  generateBtn.disabled = false;
  generateBtn.innerHTML = "🚀 Generate Test";

  updateRevisionAvailable();

  const modalEl = document.getElementById('revisionTestModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function selectAllRevisionTests() {
  document.querySelectorAll(".revision-checkbox").forEach((cb) => {
    cb.checked = true;
  });
  updateRevisionAvailable();
}

function clearRevisionTests() {
  document.querySelectorAll(".revision-checkbox").forEach((cb) => {
    cb.checked = false;
  });
  updateRevisionAvailable();
}

function updateRevisionAvailable() {
  const checkboxes = document.querySelectorAll(".revision-checkbox");
  let selected = 0;
  let available = 0;
  const chapters = allQuizData && revisionSubjectKey
    ? allQuizData[revisionSubjectKey]
    : null;

  checkboxes.forEach((cb) => {
    if (cb.checked) {
      selected++;
      if (chapters) {
        const qc = getChapterQuestionCount(chapters, cb.value);
        if (qc) available += qc;
      }
    }
  });

  const countEl = document.getElementById("revision-selected-count");
  if (countEl) countEl.textContent = selected + " selected";

  const infoEl = document.getElementById("revision-available-info");
  if (infoEl) {
    infoEl.textContent =
      available > 0
        ? `${available} questions available across selected tests`
        : "Select tests to see the available question count.";
  }
}

async function generateRevisionTest(subjectKey) {
  const checkboxes = document.querySelectorAll(".revision-checkbox:checked");
  if (checkboxes.length === 0) {
    toastr.warning("Please select at least one test.");
    return;
  }

  const generateBtn = document.getElementById("generate-revision-btn");
  const originalText = generateBtn.innerHTML;
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

  const filterType = document.getElementById("revision-filter")?.value || "all";
  const revisionCount = parseInt(
    document.getElementById("revision-count")?.value || "50"
  );
  const timeMinutes = parseInt(
    document.getElementById("revision-time")?.value || "60"
  );

  // OPTIMIZATION: Create O(1) lookup map for user history to easily find latest attempt for each chapter
  const latestResultsMap = new Map();
  if (typeof userHistory !== 'undefined' && userHistory) {
    userHistory.forEach((h) => {
      if (!latestResultsMap.has(h.chapterId)) {
        latestResultsMap.set(h.chapterId, h);
      }
    });
  }

  try {
    let combinedQuestions = [];
    const subjectPrefix = subjectKey.replace(/\s+/g, "_") + "_";

    for (let i = 0; i < checkboxes.length; i++) {
      const chapId = checkboxes[i].value;
      const fullChapterId = subjectPrefix + chapId;
      const questions = await DataManager.fetchQuizQuestions(fullChapterId);

      if (questions && questions.length > 0) {
        const latestResult = latestResultsMap.get(fullChapterId);

        // Tag questions with subject if missing (for potential dashboard analytics)
        const taggedQuestions = questions.map((q, qIndex) => {
            let include = true;

            if (filterType !== "all") {
                if (!latestResult) {
                    // If user hasn't attempted this test, all questions are unattempted.
                    if (filterType === "correct" || filterType === "incorrect") {
                        include = false;
                    } else if (filterType === "unattempted") {
                        include = true;
                    }
                } else {
                    const uAns = latestResult.userAnswers && latestResult.userAnswers[qIndex];
                    if (!isValidAnswer(uAns)) {
                        include = (filterType === "unattempted");
                    } else {
                        const correctIndex = getCorrectIndex(q);
                        const isCorrect = uAns.answer === correctIndex;
                        if (filterType === "correct" && !isCorrect) include = false;
                        if (filterType === "incorrect" && isCorrect) include = false;
                        if (filterType === "unattempted") include = false; // Because it was attempted
                    }
                }
            }

            if (include) {
                return {
                    ...q,
                    subject: q.subject || subjectKey
                };
            }
            return null;
        }).filter(q => q !== null);

        combinedQuestions = combinedQuestions.concat(taggedQuestions);
      }
    }

    if (combinedQuestions.length === 0) {
      toastr.error("No questions found matching your filter criteria.");
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalText;
      return;
    }

    // Shuffle array using Fisher-Yates
    for (let i = combinedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedQuestions[i], combinedQuestions[j]] = [combinedQuestions[j], combinedQuestions[i]];
    }

    // Slice up to the chosen question count
    currentQuizData = combinedQuestions.slice(0, revisionCount);

    currentSubject = subjectKey;
    currentChapterId = "revision_" + Date.now();
    currentChapterName = "Revision Test";

    // Close modal
    const modalEl = document.getElementById('revisionTestModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    // Cleanup state
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;

    // Proceed to quiz execution with the chosen time limit
    startRevisionTestExecution(timeMinutes * 60);

  } catch (error) {
    console.error("Error generating revision test:", error);
    toastr.error("Failed to generate test.");
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;
  }
}

/* =========================================
   5. QUIZ CORE
   ========================================= */

/* =========================================
   QUIZ CORE (Updated loadQuiz)
   ========================================= */
function startRevisionTestExecution(timeSeconds = null) {
  isPracticeMode = false;
  isReviewMode = false;
  quizSubmitted = false;

  currentQuestionIndex = 0;
  userAnswers = {};
  markedForReview = {};
  questionTimeSpent = {};
  currentQuestionStartTime = null;

  hideAllSections();
  document.getElementById("quiz-section").style.display = "block";

  renderBreadcrumbs([
      { label: 'Home', onclick: 'showHome()' },
      { label: 'Dashboard', onclick: 'showDashboard()' },
      { label: 'Take Test', onclick: 'renderSubjects()' },
      { label: currentSubject, onclick: `renderChapters('${currentSubject}')` },
      { label: 'Revision Test' }
  ]);

  const quizContent = document.getElementById("quiz-content");
  const quizNav = document.getElementById("quiz-nav");

  quizContent.parentElement.className = "col-lg-8 mb-4";
  quizNav.parentElement.style.display = "block";
  renderQuizLayout(currentChapterName);
  renderQuestion();
  renderNav();

  const timerDisplay = document.getElementById("timer-display");
  if (timerDisplay) {
    timerDisplay.textContent = "";
    timerDisplay.classList.remove("text-danger");
  }

  startTimer(currentQuizData.length, timeSeconds);
  currentQuestionStartTime = Date.now();
}

function startQuizExecution(savedTime) {
  quizMode = document.getElementById("mode-practice")?.checked
    ? "practice"
    : "exam";

  trackEvent("test_started", {
    subject: currentSubject,
    chapter: currentChapterName,
    mode: quizMode,
  });

  const quizContent = document.getElementById("quiz-content");
  const quizNav = document.getElementById("quiz-nav");

  quizContent.parentElement.className = "col-lg-8 mb-4";
  quizNav.parentElement.style.display = "block";
  renderQuizLayout(currentChapterName);
  renderQuestion();
  renderNav();
  startTimer(currentQuizData.length, savedTime);
  currentQuestionStartTime = Date.now(); // NEW: Start tracking first question
}

let pendingResume = null; // Saved progress awaiting an explicit Resume choice

function showStartModal(subject, chapter) {
    document.getElementById('start-modal-subject').textContent = subject;
    document.getElementById('start-modal-chapter').textContent = chapter;

    // Populate rules from the single marking-scheme constant (P0-2)
    document.getElementById('rules-correct').textContent =
      "+" + MARKING_SCHEME.correctMarks;
    document.getElementById('rules-wrong').textContent =
      "−" + MARKING_SCHEME.wrongMarks;
    document.getElementById('rules-pause').textContent = MARKING_SCHEME.maxPauses;

    // Reset resume UI to the default "new attempt" state
    pendingResume = null;
    document.getElementById('resume-progress-info').classList.add('d-none');
    const resumeBtn = document.getElementById('resume-quiz-btn');
    resumeBtn.classList.add('d-none');
    const startBtn = document.getElementById('start-quiz-btn');
    startBtn.textContent = '🚀 Start Test';

    // Set loading state
    document.getElementById('start-modal-questions').innerHTML = '<span class="spinner-border spinner-border-sm text-primary" role="status"></span>';
    document.getElementById('start-modal-duration').innerHTML = '<span class="spinner-border spinner-border-sm text-primary" role="status"></span>';

    startBtn.disabled = true;
    startBtn.classList.add('disabled');

    // Set Cancel action to go back to chapters
    const cancelBtn = document.querySelector('#startQuizModal .btn-secondary-custom');
    cancelBtn.onclick = function() {
        hideAllSections();
        document.getElementById("test-selection-section").style.display = "block";
        renderChapters(subject);
    };

    const modalEl = document.getElementById('startQuizModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function updateStartModal(numQuestions, savedTime, resumeInfo = null) {
    document.getElementById('start-modal-questions').textContent = numQuestions;

    // Calculate duration: 1.2 min per question
    const durationMin = Math.ceil(numQuestions * MARKING_SCHEME.minutesPerQuestion);
    document.getElementById('start-modal-duration').textContent = durationMin + "m";

    const startBtn = document.getElementById('start-quiz-btn');
    const resumeBtn = document.getElementById('resume-quiz-btn');
    const resumeInfoEl = document.getElementById('resume-progress-info');
    startBtn.disabled = false;
    startBtn.classList.remove('disabled');

    const hideModal = () => {
        const modalEl = document.getElementById('startQuizModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
    };

    if (resumeInfo) {
        startBtn.textContent = '↺ Start Fresh';
        resumeBtn.classList.remove('d-none');
        resumeInfoEl.classList.remove('d-none');
        document.getElementById('resume-answered-count').textContent = resumeInfo.answeredCount;
        document.getElementById('resume-minutes-left').textContent = resumeInfo.minutesLeft;

        resumeBtn.onclick = function() {
            hideModal();
            const restoredTime = applyPendingResume();
            startQuizExecution(restoredTime);
        };

        startBtn.onclick = function() {
            hideModal();
            clearQuizProgress(currentChapterId);
            pendingResume = null;
            startQuizExecution(null);
        };
    } else {
        startBtn.textContent = '🚀 Start Test';
        resumeBtn.classList.add('d-none');
        resumeInfoEl.classList.add('d-none');

        startBtn.onclick = function() {
            hideModal();
            startQuizExecution(savedTime);
        };
    }
}

function applyPendingResume() {
    if (!pendingResume) return null;
    const p = pendingResume;
    userAnswers = p.userAnswers || {};
    markedForReview = p.markedForReview || {};
    questionTimeSpent = p.questionTimeSpent || {};
    currentQuestionIndex = p.lastQuestionIndex || 0;
    pendingResume = null;
    return p.remainingTime;
}

async function loadQuiz(
  subjectKey,
  chapterId,
  chapterName,
  reviewMode = false,
  pastData = null,
  source = null,
  autoResume = false
) {
  if (!currentUser || !currentUser.emailVerified) return showHome();
  isPracticeMode = false;
  currentSubject = subjectKey;
  currentChapterId = subjectKey.replace(/\s+/g, "_") + "_" + chapterId;
  currentChapterName = decodeURIComponent(chapterName);

  isReviewMode = reviewMode;
  reviewSource = source;
  let savedTime = null;

  // Show Modal immediately in Take Test mode (unless auto-resuming)
  if (!reviewMode) {
      // Ensure timer is stopped before showing modal
      if (currentQuizTimer) currentQuizTimer.stop();
      if (!autoResume) showStartModal(currentSubject, currentChapterName);
  } else {
      hideAllSections();
      document.getElementById("quiz-section").style.display = "block";
  }

  // Set Breadcrumbs based on mode
  if (reviewMode) {
      if (source === 'performance') {
          renderBreadcrumbs([
              { label: 'Home', onclick: 'showHome()' },
              { label: 'Dashboard', onclick: 'showDashboard()' },
              { label: 'Performance', onclick: 'showPerformance()' },
              { label: 'Review: ' + currentChapterName }
          ]);
      } else {
          renderBreadcrumbs([
              { label: 'Home', onclick: 'showHome()' },
              { label: 'Dashboard', onclick: 'showDashboard()' },
              { label: 'Take Test', onclick: 'renderSubjects()' },
              { label: currentSubject, onclick: `renderChapters('${currentSubject}')` },
              { label: 'Review: ' + currentChapterName }
          ]);
      }
  } else {
      renderBreadcrumbs([
          { label: 'Home', onclick: 'showHome()' },
          { label: 'Dashboard', onclick: 'showDashboard()' },
          { label: 'Take Test', onclick: 'renderSubjects()' },
          { label: currentSubject, onclick: `renderChapters('${currentSubject}')` },
          { label: currentChapterName }
      ]);
  }

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
      if (!reviewMode) {
          const modalEl = document.getElementById('startQuizModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
      }
      showDashboard();
      return;
    }

    currentQuestionIndex = 0;
    userAnswers = {};
    markedForReview = {};
    questionTimeSpent = {}; // NEW
    currentQuestionStartTime = null; // NEW
    quizSubmitted = false;

    let resumeInfo = null;
    if (!reviewMode) {
      const savedProgress = localStorage.getItem(
        `quiz_progress_${currentChapterId}`
      );
      if (savedProgress) {
        try {
          const parsedProgress = JSON.parse(savedProgress);
          const oneDay = 24 * 60 * 60 * 1000;
          if (new Date().getTime() - parsedProgress.timestamp < oneDay) {
            pendingResume = parsedProgress;
            const answers = parsedProgress.userAnswers || {};
            let answeredCount = 0;
            Object.values(answers).forEach((a) => {
              if (isValidAnswer(a)) answeredCount++;
            });
            const minutesLeft = Math.max(
              0,
              Math.round((parsedProgress.remainingTime || 0) / 60)
            );
            resumeInfo = {
              answeredCount,
              minutesLeft,
            };
          }
        } catch (e) {
          console.error("Failed to parse saved progress:", e);
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
      quizContent.parentElement.className = "col-12";
      quizNav.parentElement.style.display = "none";
      renderReviewMode(pastData);
    } else {
      hideAllSections();
      document.getElementById("quiz-section").style.display = "block";
      if (autoResume && resumeInfo) {
        // Resume directly without re-showing the start modal
        const restoredTime = applyPendingResume();
        startQuizExecution(restoredTime);
      } else {
        if (autoResume) showStartModal(currentSubject, currentChapterName);
        updateStartModal(currentQuizData.length, savedTime, resumeInfo);
      }
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

  let rank = 1;

  // Iterate through the filtered and sorted data instead of the raw data
  const rows = filteredSortedData.map((entry) => {
    const email = entry.userEmail || "Guest";
    const rawName = email.split("@")[0];
    const displayName =
      rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
    const isMe = currentUser && entry.userEmail === currentUser.email;

    return `
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
  }).join('');

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
  trackEvent("review_viewed", { chapter: currentChapterName });

  // Pre-fetch stats to ensure they are available for community comparison
  if (currentChapterId.startsWith('revision_')) {
      currentReviewStats = null;
  } else {
      currentReviewStats = await DataManager.fetchGlobalStats(currentChapterId);
  }
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

  // Calibration & time trackers (P2-6, P2-7)
  let sureWrong = 0;
  let unsureRight = 0;
  let guessTotal = 0;
  let guessCorrect = 0;
  let rushedWrong = 0;
  let totalTimeSec = 0;
  let slowestQ = [];

  // Difficulty Stats
  let difficultyStats = {
      Easy: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      Medium: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      Hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0 }
  };

  // Subject Stats for FLT Test
  let subjectStats = {
      "Polity": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      "Economy": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      "History": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      "Geography": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      "Environment": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      "Science and Tech": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      "IR": { total: 0, correct: 0, incorrect: 0, unattempted: 0 }
  };

  currentQuizData.forEach((q, i) => {
    const uAns = userAnswers[i];
    const correctIndex = getCorrectIndex(q);

    if (q.subject) {
        // Find matching predefined subject (ignoring case/extra spaces just in case)
        const qSubj = q.subject.trim();
        let matchedSubj = Object.keys(subjectStats).find(
            s => s.toLowerCase() === qSubj.toLowerCase()
        );

        // If it doesn't match perfectly, we can still fall back or just use the exact match
        // The prompt says "Mark the subject of each question from the following category..."
        // So we assume it will be one of them. Let's use it as is or default if not found (though prompt implies they will be exactly those).
        if (!matchedSubj && subjectStats[qSubj]) {
            matchedSubj = qSubj;
        }

        if (matchedSubj) {
            subjectStats[matchedSubj].total++;
            if (!isValidAnswer(uAns)) {
                subjectStats[matchedSubj].unattempted++;
            } else if (uAns.answer === correctIndex) {
                subjectStats[matchedSubj].correct++;
            } else {
                subjectStats[matchedSubj].incorrect++;
            }
        }
    }

    // Community accuracy calculation for Silly Mistake vs Hard Success flagging
    const commCorrect = currentReviewStats?.correctCounts?.[i] || 0;
    const commTotal = currentReviewStats?.totalAttempts || 0;

    // Determine Difficulty
    const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);
    const diffLabel = diffInfo.label;
    const commAccuracy = diffInfo.percentage;

    difficultyStats[diffLabel].total++;
    if (!isValidAnswer(uAns)) {
        difficultyStats[diffLabel].unattempted++;
    } else if (uAns.answer === correctIndex) {
        difficultyStats[diffLabel].correct++;
    } else {
        difficultyStats[diffLabel].incorrect++;
    }

    // 2. Track accuracy per confidence level
    const confidence = uAns?.surety;
    if (uAns && confidence !== undefined) {
      confStats[confidence].total++;
      if (uAns.answer === getCorrectIndex(q)) {
        confStats[confidence].correct++;
      }
    }

    // Calibration & time analytics (P2-6, P2-7)
    if (isValidAnswer(uAns)) {
      const isCorrectAns = uAns.answer === correctIndex;
      const surety = uAns.surety;
      if (surety !== undefined) {
        if (surety >= 75 && !isCorrectAns) sureWrong++;
        if (surety <= 50 && isCorrectAns) unsureRight++;
        if (surety === 0) {
          guessTotal++;
          if (isCorrectAns) guessCorrect++;
        }
      }
      const t = (questionTimeSpent && questionTimeSpent[i]) || 0;
      totalTimeSec += t;
      if (t < 10 && !isCorrectAns) rushedWrong++;
      slowestQ.push({ idx: i, time: t });
    }

    if (!isValidAnswer(uAns)) {
      unattempted++;
    } else if (uAns.answer === correctIndex) {
      correct++;
      if (diffLabel === "Hard") hardSuccess++; // Correct on a low-accuracy question
    } else {
      incorrect++;
      // Flag if user missed a question that is classified as Easy
      if (diffLabel === "Easy") {
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

  // Calibration & time insights (P2-6, P2-7)
  const guessAccuracy =
    guessTotal > 0 ? Math.round((guessCorrect / guessTotal) * 100) : 0;
  const avgTimeSec =
    attempted > 0 ? Math.round(totalTimeSec / attempted) : 0;
  const slowest = [...slowestQ].sort((a, b) => b.time - a.time).slice(0, 3);
  const slowestLabel = slowest
    .map((s) => `Q${s.idx + 1} (${Math.round(s.time)}s)`)
    .join(", ");

  const insightsHtml = `
    <div class="card mb-4 border-0 shadow-sm">
      <div class="card-header bg-white border-bottom py-2">
        <h6 class="fw-bold text-primary m-0">🧠 Calibration & Time Insights</h6>
      </div>
      <div class="card-body">
        <div class="row g-3 text-center">
          <div class="col-6 col-md-3"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Sure but wrong</small><strong class="text-danger">${sureWrong}</strong></div></div>
          <div class="col-6 col-md-3"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Unsure but right</small><strong class="text-success">${unsureRight}</strong></div></div>
          <div class="col-6 col-md-3"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Guess accuracy</small><strong>${guessAccuracy}%</strong></div></div>
          <div class="col-6 col-md-3"><div class="p-2 border rounded bg-light"><small class="text-muted d-block">Rushed (wrong &lt;10s)</small><strong class="text-warning">${rushedWrong}</strong></div></div>
        </div>
        <p class="small text-muted mt-3 mb-0">Avg time per attempted question: <strong>${avgTimeSec}s</strong>. Slowest: ${slowestLabel || "—"}</p>
      </div>
    </div>
  `;

  // Generate Difficulty Matrix HTML
  const difficultyRows = ['Easy', 'Medium', 'Hard'].map(level => {
      const stats = difficultyStats[level];
      const attempted = stats.correct + stats.incorrect;
      const acc = attempted > 0 ? ((stats.correct / attempted) * 100).toFixed(1) : 0;
      let badgeClass = 'bg-secondary';
      if (level === 'Easy') badgeClass = 'bg-success';
      if (level === 'Medium') badgeClass = 'bg-warning text-dark';
      if (level === 'Hard') badgeClass = 'bg-danger';

      return `
          <tr>
              <td><span class="badge ${badgeClass}">${level}</span></td>
              <td class="text-center">${stats.total}</td>
              <td class="text-center text-success fw-bold">${stats.correct}</td>
              <td class="text-center text-danger fw-bold">${stats.incorrect}</td>
              <td class="text-center text-muted">${stats.unattempted}</td>
              <td class="text-end fw-bold">${acc}%</td>
          </tr>
      `;
  }).join('');

  const difficultyMatrixHtml = `
      <div class="card mb-4 border-0 shadow-sm">
          <div class="card-header bg-white border-bottom py-2">
              <h6 class="fw-bold text-primary m-0">🎯 Performance by Difficulty</h6>
          </div>
          <div class="table-responsive">
              <table class="table table-hover mb-0 align-middle">
                  <thead class="table-light small text-muted">
                      <tr>
                          <th>Difficulty</th>
                          <th class="text-center">Total</th>
                          <th class="text-center">Correct</th>
                          <th class="text-center">Incorrect</th>
                          <th class="text-center">Unattempted</th>
                          <th class="text-end">Accuracy</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${difficultyRows}
                  </tbody>
              </table>
          </div>
      </div>
  `;

  let subjectMatrixHtml = "";
  // Check if any subject stats were collected to decide whether to render the table.
  // In non-FLT tests, questions may not have a subject field.
  const hasSubjectStats = Object.values(subjectStats).some(stats => stats.total > 0);

  if (hasSubjectStats) {
      const subjectRows = Object.keys(subjectStats).map(subject => {
          const stats = subjectStats[subject];
          if (stats.total === 0) return ''; // Skip empty subjects
          const attempted = stats.correct + stats.incorrect;
          const acc = attempted > 0 ? ((stats.correct / attempted) * 100).toFixed(1) : 0;
          return `
              <tr>
                  <td><span class="badge bg-secondary">${subject}</span></td>
                  <td class="text-center">${stats.total}</td>
                  <td class="text-center text-success fw-bold">${stats.correct}</td>
                  <td class="text-center text-danger fw-bold">${stats.incorrect}</td>
                  <td class="text-center text-muted">${stats.unattempted}</td>
                  <td class="text-end fw-bold">${acc}%</td>
              </tr>
          `;
      }).join('');

      subjectMatrixHtml = `
          <div class="card mb-4 border-0 shadow-sm">
              <div class="card-header bg-white border-bottom py-2">
                  <h6 class="fw-bold text-primary m-0">📚 Subject-wise Performance</h6>
              </div>
              <div class="table-responsive">
                  <table class="table table-hover mb-0 align-middle">
                      <thead class="table-light small text-muted">
                          <tr>
                              <th>Subject</th>
                              <th class="text-center">Total</th>
                              <th class="text-center">Correct</th>
                              <th class="text-center">Incorrect</th>
                              <th class="text-center">Unattempted</th>
                              <th class="text-end">Accuracy</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${subjectRows}
                      </tbody>
                  </table>
              </div>
              <div class="card-body border-top text-center" style="max-height: 400px; display: flex; justify-content: center;">
                  <canvas id="subjectSpiderChart" style="max-height: 350px; width: 100%; max-width: 500px;"></canvas>
              </div>
          </div>
      `;
  }

  const content = document.getElementById("quiz-content");

  let subjectFilterHtml = "";
  if (hasSubjectStats) {
      let options = `<option value="all">All Subjects</option>`;
      Object.keys(subjectStats).forEach(subject => {
          if (subjectStats[subject].total > 0) {
              options += `<option value="${subject}">${subject}</option>`;
          }
      });
      subjectFilterHtml = `
          <select id="subject-filter" class="form-select w-auto shadow-sm" onchange="filterReviewBySubject()">
              ${options}
          </select>
      `;
  }

  content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-bottom pb-3">
            <div>
                <h4 class="fw-bold text-primary m-0">${currentChapterName}</h4>
                <span class="badge bg-secondary">Performance Review</span>
            </div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
                ${subjectFilterHtml}
                <div class="btn-group shadow-sm" role="group">
                    <button class="btn btn-outline-primary active" id="btn-all" onclick="filterReview('all', this)">All</button>
                    <button class="btn btn-outline-success" id="btn-correct" onclick="filterReview('correct', this)">Correct</button>
                    <button class="btn btn-outline-danger" id="btn-incorrect" onclick="filterReview('incorrect', this)">Incorrect</button>
                    <button class="btn btn-outline-secondary" id="btn-unattempted" onclick="filterReview('unattempted', this)">Unattempted</button>
                    <button class="btn btn-outline-warning" id="btn-lowconfidence" onclick="filterReview('lowconfidence', this)">Low Confidence</button>
                    <button class="btn btn-outline-info" id="btn-marked" onclick="filterReview('marked', this)">Marked</button>
                </div>
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

                ${difficultyMatrixHtml}
                ${subjectMatrixHtml}
                ${insightsHtml}

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
            </div>
        </div>
        
        <div id="review-container"></div>
        
        <div class="text-center mt-5">
            <button class="btn btn-primary-custom px-5 shadow py-2" onclick="exitQuiz()">← Back</button>
        </div>
    `;

  filterReview("all", document.getElementById("btn-all"));

  // --- Render Spider Chart if subject stats exist ---
  if (hasSubjectStats) {
      const subjectNames = [];
      const accuracies = [];
      const correctAttempts = [];
      const incorrectAttempts = [];
      const unattemptedQs = [];

      Object.keys(subjectStats).forEach(subject => {
          const stats = subjectStats[subject];
          if (stats.total > 0) {
              subjectNames.push(subject);
              const attempted = stats.correct + stats.incorrect;
              const acc = attempted > 0 ? ((stats.correct / attempted) * 100).toFixed(1) : 0;
              accuracies.push(acc);
              correctAttempts.push(stats.correct);
              incorrectAttempts.push(stats.incorrect);
              unattemptedQs.push(stats.unattempted);
          }
      });

      const ctxSpider = document.getElementById('subjectSpiderChart');
      if (ctxSpider) {
          const isDark = document.documentElement.getAttribute("data-theme") === "dark";
          const textColor = isDark ? "#e5e7eb" : "#666";
          const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

          new Chart(ctxSpider, {
              type: 'bar',
              data: {
                  labels: subjectNames,
                  datasets: [
                      {
                          type: 'line',
                          label: 'Accuracy (%)',
                          data: accuracies,
                          borderColor: 'rgba(59, 130, 246, 1)',
                          backgroundColor: 'rgba(59, 130, 246, 1)',
                          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 3,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          fill: false,
                          yAxisID: 'y1'
                      },
                      {
                          type: 'bar',
                          label: 'Correct Qs',
                          data: correctAttempts,
                          backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald green
                          borderColor: 'rgba(16, 185, 129, 1)',
                          borderWidth: 1,
                          yAxisID: 'y'
                      },
                      {
                          type: 'bar',
                          label: 'Incorrect Qs',
                          data: incorrectAttempts,
                          backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
                          borderColor: 'rgba(239, 68, 68, 1)',
                          borderWidth: 1,
                          yAxisID: 'y'
                      },
                      {
                          type: 'bar',
                          label: 'Unattempted Qs',
                          data: unattemptedQs,
                          backgroundColor: 'rgba(250, 204, 21, 0.8)', // Yellow
                          borderColor: 'rgba(250, 204, 21, 1)',
                          borderWidth: 1,
                          borderRadius: { topLeft: 4, topRight: 4 },
                          yAxisID: 'y'
                      }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                      mode: 'index',
                      intersect: false,
                  },
                  scales: {
                      x: {
                          stacked: true,
                          grid: {
                              display: false
                          },
                          ticks: {
                              color: textColor,
                              font: {
                                  family: "'Poppins', sans-serif"
                              }
                          }
                      },
                      y: {
                          stacked: true,
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                              display: true,
                              text: 'Questions Count',
                              color: textColor,
                              font: { size: 10 }
                          },
                          grid: {
                              color: gridColor,
                              drawBorder: false
                          },
                          ticks: {
                              color: textColor,
                              precision: 0
                          }
                      },
                      y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                              display: true,
                              text: 'Accuracy (%)',
                              color: 'rgba(59, 130, 246, 1)',
                              font: { size: 10 }
                          },
                          grid: {
                              drawOnChartArea: false // only want the grid lines for one axis to show up
                          },
                          ticks: {
                              color: 'rgba(59, 130, 246, 1)',
                              suggestedMin: 0,
                              suggestedMax: 100,
                              stepSize: 20
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          position: 'top',
                          labels: {
                              color: textColor,
                              usePointStyle: true,
                              boxWidth: 8
                          }
                      },
                      tooltip: {
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          titleColor: isDark ? '#f8fafc' : '#0f172a',
                          bodyColor: isDark ? '#cbd5e1' : '#334155',
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          usePointStyle: true,
                          callbacks: {
                              label: function(context) {
                                  let label = context.dataset.label || '';
                                  if (label) {
                                      label += ': ';
                                  }
                                  if (context.parsed.y !== null) {
                                      label += context.parsed.y;
                                      if (context.datasetIndex === 0) { // Accuracy is first dataset
                                          label += '%';
                                      }
                                  }
                                  return label;
                              }
                          }
                      }
                  }
              }
          });
      }
  }

  loadLeaderboard(currentChapterId);

  const stats = currentReviewStats;
  const container = document.getElementById("global-stats-container");

  if (!stats) {
    container.innerHTML = `<div class="col-12 text-center text-muted">Not enough data for global comparison yet.</div>`;
    return;
  }

  const myScore = resultData ? resultData.scorePercent : 0;
  let betterThan = 0;
  for (let i = 0; i < stats.allScores.length; i++) {
    if (stats.allScores[i] < myScore) {
      betterThan++;
    }
  }
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

function filterReviewBySubject() {
    const activeBtn = document.querySelector(".btn-group .btn.active");
    let filterType = "all";
    if (activeBtn) {
        if (activeBtn.id === "btn-correct") filterType = "correct";
        else if (activeBtn.id === "btn-incorrect") filterType = "incorrect";
        else if (activeBtn.id === "btn-unattempted") filterType = "unattempted";
        else if (activeBtn.id === "btn-lowconfidence") filterType = "lowconfidence";
        else if (activeBtn.id === "btn-marked") filterType = "marked";
    }
    renderReviewQuestions(filterType);
}

function reportQuestionIssue(index) {
  const q = currentQuizData[index];
  if (!q) return;
  getDb()
    .collection("question_reports")
    .add({
      userId: currentUser ? currentUser.uid : "guest",
      userEmail: currentUser ? currentUser.email : "guest",
      chapterId: currentChapterId,
      questionIndex: index,
      questionText: (q.text || "").substring(0, 500),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => toastr.success("Issue reported. Thank you!"))
    .catch((e) => {
      console.error("Report issue failed:", e);
      toastr.error("Failed to report issue.");
    });
}

function renderReviewQuestions(filterType) {
  const container = document.getElementById("review-container");

  // Check if we need to initialize (first run or re-entry)
  const existingCards = container.querySelectorAll('.question-card');
  const isInitialized = existingCards.length === currentQuizData.length && container.dataset.chapterId === currentChapterId;

  if (!isInitialized) {
      container.innerHTML = "";
      container.dataset.chapterId = currentChapterId;

      const fragment = document.createDocumentFragment();

      currentQuizData.forEach((question, index) => {
        const correctIndex = getCorrectIndex(question);
        const uAns = userAnswers[index];
        const userSurety = uAns?.surety !== undefined ? uAns.surety : "N/A";

        let status = "unattempted";
        if (isValidAnswer(uAns)) {
          status = uAns.answer === correctIndex ? "correct" : "incorrect";
        }

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

        // Determine Difficulty Badge (Always calculate to match table logic)
        // If stats are missing or attempts are 0, DifficultyHelper returns Medium/warning (0%)
        const commTotal = currentReviewStats?.totalAttempts || 0;
        const commCorrect = currentReviewStats?.correctCounts?.[index] || 0;
        const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);
        const difficultyBadge = `<span class="badge bg-${diffInfo.color} mb-2 ms-2">${diffInfo.label}</span>`;

        if (currentReviewStats && currentReviewStats.totalAttempts > 0) {
          const total = currentReviewStats.totalAttempts;
          const correctCount = commCorrect;
          const attemptedCount =
            (currentReviewStats.attemptedCounts &&
              currentReviewStats.attemptedCounts[index]) ||
            0;
          const pCorrect = Math.round((correctCount / total) * 100);
          const pIncorrect = Math.round(
            ((attemptedCount - correctCount) / total) * 100
          );
          const pUnattempted = 100 - pCorrect - pIncorrect;

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
                        <span class="fw-bold" style="color: #4338ca;">Total test taken by: ${total}</span>
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

        // Subject Badge Logic
        const subjectBadge = question.subject ? `<span class="badge bg-success-subtle text-success ms-2">📚 ${question.subject}</span>` : "";

        const isLowConf = userSurety === 0 || userSurety === 50;
        const isMarkedQ = !!markedForReview[index];

        const card = document.createElement("div");
        card.className = `card mb-4 shadow-sm border-0 border-start border-5 ${borderClass} question-card`;
        card.dataset.status = status;
        card.dataset.subject = question.subject || "";
        card.dataset.lowconfidence = isLowConf ? "true" : "false";
        card.dataset.marked = isMarkedQ ? "true" : "false";

        card.innerHTML = `
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            <h6 class="text-muted fw-bold m-0 me-2">Question ${index + 1}</h6>
                            <span class="surety-badge ${suretyClass}">Confidence: ${userSurety}%</span>
                            ${timeBadge}
                            ${difficultyBadge}
                            ${subjectBadge}
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
                    <div class="text-end mt-2">
                        <button class="btn btn-outline-secondary btn-sm" onclick="reportQuestionIssue(${index})">
                            <i class="bi bi-flag me-1"></i>Report an issue
                        </button>
                    </div>
                </div>
            `;
        fragment.appendChild(card);
      });
      container.appendChild(fragment);
  }

  // Toggle Visibility
  let visibleCount = 0;
  const subjectFilterValue = document.getElementById('subject-filter')?.value || 'all';
  const cards = container.querySelectorAll('.question-card');
  cards.forEach(card => {
      const status = card.dataset.status;
      const cardSubject = card.dataset.subject;

      let matchStatus = filterType === 'all' || status === filterType;
      if (filterType === 'lowconfidence') matchStatus = card.dataset.lowconfidence === "true";
      if (filterType === 'marked') matchStatus = card.dataset.marked === "true";
      const matchSubject = subjectFilterValue === 'all' || cardSubject === subjectFilterValue;

      if (matchStatus && matchSubject) {
          card.classList.remove('d-none');
          visibleCount++;
      } else {
          card.classList.add('d-none');
      }
  });

  // Handle "No questions found"
  let noQuestionsMsg = container.querySelector('.alert-info-no-questions');
  if (visibleCount === 0) {
      if (!noQuestionsMsg) {
          noQuestionsMsg = document.createElement('div');
          noQuestionsMsg.className = 'alert alert-info text-center mt-3 alert-info-no-questions';
          noQuestionsMsg.textContent = 'No questions found for this filter.';
          container.appendChild(noQuestionsMsg);
      }
      noQuestionsMsg.classList.remove('d-none');
  } else {
      if (noQuestionsMsg) {
          noQuestionsMsg.classList.add('d-none');
      }
  }
}

/* =========================================
   6. TIMER & NAVIGATION
   ========================================= */

/**
 * Starts the timer with persistence support
 */
function startTimer(numQuestions, savedTime = null) {
  currentTimerSeconds =
    savedTime !== null
      ? savedTime
      : Math.floor(numQuestions * MARKING_SCHEME.minutesPerQuestion * 60);
  isTimerPaused = false;
  pauseCount = 0;
  lastProgressSaveTime = 0;

  if (currentQuizTimer) currentQuizTimer.stop();

  currentQuizTimer = new QuizTimer("timer-display",
      (seconds) => {
          currentTimerSeconds = seconds;
          saveQuizProgressThrottled();
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
  const mobileBtn = document.getElementById("mobile-pause-btn");
  const qContainer = document.getElementById("question-container");
  if (!btn || !currentQuizTimer) return;

  if (currentQuizTimer.isPaused) {
      currentQuizTimer.resume();
      isTimerPaused = false;
  } else {
      // Default (test) mode is limited; practice/exam policies are handled here
      if (
        !isPracticeMode &&
        quizMode === "exam" &&
        typeof pauseCount !== "undefined" &&
        pauseCount >= MARKING_SCHEME.maxPauses
      ) {
        toastr.warning(
          `Pause limit reached (${MARKING_SCHEME.maxPauses} pauses allowed).`
        );
        return;
      }
      currentQuizTimer.pause();
      isTimerPaused = true;
      if (typeof pauseCount !== "undefined") pauseCount++;
  }

  if (isTimerPaused) {
    btn.innerHTML = '<i class="bi bi-play-fill"></i> Resume';
    btn.classList.replace("btn-secondary-custom", "btn-primary-custom");
    if (mobileBtn)
      mobileBtn.innerHTML = '<i class="bi bi-play-fill"></i>';

    if (qContainer) {
      qContainer.style.filter = "blur(8px)";
      qContainer.style.pointerEvents = "none";
    }
    toastr.info("Timer Paused");
  } else {
    btn.innerHTML = '<i class="bi bi-pause-fill"></i> Pause';
    btn.classList.replace("btn-primary-custom", "btn-secondary-custom");
    if (mobileBtn)
      mobileBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';

    if (qContainer) {
      qContainer.style.filter = "none";
      qContainer.style.pointerEvents = "all";
    }
    toastr.success("Timer Resumed");
  }
}

function renderQuizLayout(title) {
  document.getElementById("quiz-content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h4 class="fw-bold text-primary m-0">${title}</h4>
            <div class="d-flex gap-2 flex-wrap">
                <button id="bookmark-btn" class="btn btn-outline-secondary" onclick="toggleBookmark()" type="button" title="Save to bookmarks">
                    <i class="bi bi-bookmark-star"></i>
                    <span id="bookmark-label">Bookmark</span>
                </button>
                <button id="mark-review-btn" class="btn btn-mark-review" onclick="toggleMarkForReview()" type="button">
                    <i class="bi bi-bookmark"></i>
                    <span id="mark-review-label">Mark for review</span>
                </button>
            </div>
        </div>
        <div id="question-container"></div>
        <div class="quiz-action-row d-flex justify-content-between align-items-center mt-4 gap-2">
            <button id="prev-btn" class="btn btn-secondary-custom px-4">Previous</button>
            <div class="quiz-action-spacer"></div>
            <button id="clear-btn" class="btn btn-outline-secondary px-4">Clear</button>
            <button id="next-btn" class="btn btn-primary-custom px-4">Save &amp; Next</button>
        </div>
        <div class="keyboard-hint small text-muted mt-2 text-center d-none d-md-block">
            <i class="bi bi-keyboard me-1"></i>1–4 / A–D answer · N/P navigate · M mark · C clear · Shift+S submit
        </div>
        <div id="question-feedback" class="mt-3 text-center"></div>
        <div id="result" class="mt-4 text-center"></div>
    `;

  document.getElementById("quiz-nav").innerHTML = `
    <div class="nav-header">Question Palette</div>
    <div class="timer-container shadow-sm">
        <span class="timer-label">Time Remaining</span>
        <div id="timer-display" class="timer-value" role="timer" aria-label="Time remaining">00:00</div>
        <button id="timer-pause-btn" class="btn btn-sm btn-secondary-custom fw-bold mt-3" onclick="toggleTimer()" type="button">
            <i class="bi bi-pause-fill"></i> Pause
        </button>
    </div>
    <div id="nav-container" class="nav-grid"></div>
    <div class="visually-hidden" id="timer-announce" aria-live="polite"></div>
    ${paletteLegendHTML()}
    <button id="final-submit-btn" class="btn btn-success-custom w-100 mt-4 py-2 fw-bold">Submit Test</button>
  `;

  const mobileLegend = document.getElementById("mobile-palette-legend");
  if (mobileLegend) mobileLegend.innerHTML = paletteLegendHTML();

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

function paletteLegendHTML() {
  return `
    <div class="palette-legend mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
        <small class="fw-bold text-muted text-uppercase">Legend</small>
        <small class="fw-bold palette-counters text-end"></small>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <span class="legend-item"><span class="legend-swatch legend-current"></span>Current</span>
        <span class="legend-item"><span class="legend-swatch legend-answered"></span>Answered</span>
        <span class="legend-item"><span class="legend-swatch legend-marked"><i class="bi bi-bookmark-fill"></i></span>Marked</span>
        <span class="legend-item"><span class="legend-swatch legend-answered-marked"></span>Answered + Marked</span>
        <span class="legend-item"><span class="legend-swatch legend-not-visited"></span>Not visited</span>
      </div>
    </div>
  `;
}

function updatePaletteCounters() {
  let answered = 0;
  let marked = 0;
  currentQuizData.forEach((q, i) => {
    if (isValidAnswer(userAnswers[i])) answered++;
    if (markedForReview[i]) marked++;
  });
  const left = currentQuizData.length - answered;
  document.querySelectorAll(".palette-counters").forEach((el) => {
    el.textContent = `${answered} answered · ${marked} marked · ${left} left`;
  });
}

function renderQuestion() {
  const container = document.getElementById("question-container");
  container.innerHTML = "";
  const question = currentQuizData[currentQuestionIndex];
  const correctIndex = getCorrectIndex(question);

  // Mark-for-review control state (P1-6)
  const markBtn = document.getElementById("mark-review-btn");
  const markLabel = document.getElementById("mark-review-label");
  if (markBtn) {
    const isMarked = !!markedForReview[currentQuestionIndex];
    markBtn.classList.toggle("marked", isMarked);
    markBtn.setAttribute("aria-pressed", isMarked ? "true" : "false");
    markBtn.title = isMarked ? "Unmark for review" : "Mark for review";
    const icon = markBtn.querySelector("i");
    if (icon)
      icon.className = isMarked ? "bi bi-bookmark-fill" : "bi bi-bookmark";
    if (markLabel)
      markLabel.textContent = isMarked ? "Marked for review" : "Mark for review";
  }
  updateBookmarkButton();

  const div = document.createElement("div");
  div.className = "question";
  const formattedText = TextFormatter.formatQuestionText(question.text);
  div.innerHTML = `<div class="mb-3 lead fw-bold">Q${
    currentQuestionIndex + 1
  }. ${formattedText}</div>`;

  // Options wrapped in a real fieldset for accessibility (P1-9)
  const fieldset = document.createElement("fieldset");
  fieldset.className = "question-options-fieldset";
  const legend = document.createElement("legend");
  legend.className = "visually-hidden";
  legend.textContent = `Question ${currentQuestionIndex + 1} options`;
  fieldset.appendChild(legend);

  const currentAns = userAnswers[currentQuestionIndex];
  const reveal =
    quizSubmitted || (quizMode === "practice" && isValidAnswer(currentAns));

  question.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "option shadow-sm";
    const uAns = userAnswers[currentQuestionIndex];
    const isSelected = isValidAnswer(uAns) && uAns.answer === idx;

    label.innerHTML = `<input type="radio" name="q${currentQuestionIndex}" value="${idx}" ${
      isSelected ? "checked" : ""
    } ${reveal ? "disabled" : ""}> <span>${opt}</span>`;
    if (isSelected) label.classList.add("selected");

    if (reveal) {
      if (idx === correctIndex) label.classList.add("correct-answer-label");
      if (isSelected && idx !== correctIndex)
        label.classList.add("incorrect-answer-label");
    } else {
      label.querySelector("input").addEventListener("change", () => {
        if (!userAnswers[currentQuestionIndex])
          userAnswers[currentQuestionIndex] = {};
        userAnswers[currentQuestionIndex].answer = idx;
        if (quizMode === "practice") renderQuestion();
        updateNavHighlights();
        saveQuizProgress();
      });

      // Clicking the already-selected option deselects it (P1-12)
      label.addEventListener("click", () => {
        const cur = userAnswers[currentQuestionIndex];
        if (isValidAnswer(cur) && cur.answer === idx) {
          delete cur.answer;
          renderQuestion();
          updateNavHighlights();
          saveQuizProgress();
        }
      });
    }
    fieldset.appendChild(label);
  });

  div.appendChild(fieldset);

  // --- CONFIDENCE SELECTOR (P1-3) ---
  const suretyOptions = [
    { val: 100, pct: "100%", word: "Sure" },
    { val: 75, pct: "75%", word: "Fairly sure" },
    { val: 50, pct: "50%", word: "Unsure" },
    { val: 0, pct: "0%", word: "Guess" },
  ];
  const currentSurety = userAnswers[currentQuestionIndex]?.surety;
  const suretyDiv = document.createElement("div");
  suretyDiv.className = "mt-4 mb-3 animate-fade-in";
  suretyDiv.innerHTML = `
    <div class="surety-label">
      Confidence Level
      <i class="bi bi-question-circle-fill text-muted ms-1" title="Rate how sure you are. Used for your confidence analytics."></i>
    </div>
    <div class="surety-matrix shadow-sm" role="radiogroup" aria-label="Confidence Level">
      ${suretyOptions
        .map(
          (o) => `
        <div class="surety-opt ${
          currentSurety === o.val ? "selected" : ""
        }" data-val="${o.val}" role="radio" tabindex="0"
          aria-checked="${currentSurety === o.val}" aria-label="${o.pct} ${o.word}"
          onkeydown="if(event.key==='Enter'||event.key===' '){this.click(); event.preventDefault();}">
          <span class="surety-pct">${o.pct}</span>
          <span class="surety-word">${o.word}</span>
        </div>`
        )
        .join("")}
    </div>
  `;

  if (!quizSubmitted) {
    suretyDiv.querySelectorAll(".surety-opt").forEach((opt) => {
      opt.onclick = function () {
        const val = parseInt(this.getAttribute("data-val"));
        if (!userAnswers[currentQuestionIndex])
          userAnswers[currentQuestionIndex] = {};
        userAnswers[currentQuestionIndex].surety = val;

        // Toggle 'selected' class and aria-checked
        suretyDiv.querySelectorAll(".surety-opt").forEach((o) => {
            o.classList.remove("selected");
            o.setAttribute("aria-checked", "false");
        });
        this.classList.add("selected");
        this.setAttribute("aria-checked", "true");
        saveQuizProgress();
      };
    });
  }
  div.appendChild(suretyDiv);

  if (reveal && question.explanation) {
    const exp = document.createElement("div");
    exp.className = "explanation shadow-sm mt-3";
    exp.innerHTML = `<strong>💡 Explanation:</strong> <br>${question.explanation}`;
    div.appendChild(exp);
  }

  container.appendChild(div);
  updateButtonStates();
  updateMobileQuestionLabel();
  if (reveal) showFeedbackText(correctIndex);
  else {
    const feedback = document.getElementById("question-feedback");
    if (feedback) feedback.textContent = "";
  }
}

function updateMobileQuestionLabel() {
  const el = document.getElementById("mobile-q-label");
  if (el)
    el.textContent = `Q${currentQuestionIndex + 1}/${currentQuizData.length}`;
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

/* =========================================
   KEYBOARD SHORTCUTS (P1-8)
   ========================================= */
function isQuizActive() {
  const qs = document.getElementById("quiz-section");
  return (
    !isPracticeMode &&
    !isReviewMode &&
    !quizSubmitted &&
    qs &&
    qs.style.display !== "none"
  );
}

function isAnyModalOpen() {
  return !!document.querySelector(".modal.show");
}

function selectOption(idx) {
  if (quizSubmitted) return;
  const q = currentQuizData[currentQuestionIndex];
  if (!q || idx < 0 || idx >= q.options.length) return;
  if (!userAnswers[currentQuestionIndex])
    userAnswers[currentQuestionIndex] = {};
  userAnswers[currentQuestionIndex].answer = idx;
  renderQuestion();
  updateNavHighlights();
  saveQuizProgress();
}

function handleQuizKeydown(e) {
  if (!isQuizActive()) return;
  if (isAnyModalOpen()) return;

  const target = e.target;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  )
    return;

  const key = e.key;
  const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
  const optionMap = {
    "1": 0, "2": 1, "3": 2, "4": 3,
    a: 0, b: 1, c: 2, d: 3,
    A: 0, B: 1, C: 2, D: 3,
  };

  if (!hasModifier && key in optionMap) {
    e.preventDefault();
    selectOption(optionMap[key]);
    return;
  }

  if (e.shiftKey && !hasModifier && (key === "S" || key === "s")) {
    e.preventDefault();
    submitAll(false);
    return;
  }

  if (hasModifier) return;

  switch (key) {
    case "ArrowRight":
    case "n":
    case "N":
      e.preventDefault();
      navigateQuestions(1);
      break;
    case "ArrowLeft":
    case "p":
    case "P":
      e.preventDefault();
      navigateQuestions(-1);
      break;
    case "m":
    case "M":
      e.preventDefault();
      toggleMarkForReview();
      break;
    case "c":
    case "C":
      e.preventDefault();
      clearSelection();
      break;
  }
}

document.addEventListener("keydown", handleQuizKeydown);

function renderNav() {
  renderNavInto("nav-container");
  renderNavInto("mobile-nav-container");
  updateNavHighlights();
  updatePaletteCounters();
}

function renderNavInto(containerId) {
  const nav = document.getElementById(containerId);
  if (!nav) return;
  nav.innerHTML = "";
  const fragment = document.createDocumentFragment();
  currentQuizData.forEach((_, i) => {
    const item = document.createElement("div");
    item.className = "nav-item shadow-sm nav-item-animate";
    item.textContent = i + 1;
    item.style.setProperty("--animation-delay", `${i * 30}ms`);

    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Question ${i + 1}`);
    item.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    };

    item.onclick = () => {
      updateQuestionTimer(); // Save time for current question
      currentQuestionIndex = i;
      renderQuestion();
      updateNavHighlights();
      saveQuizProgress();
    };
    fragment.appendChild(item);
  });
  nav.appendChild(fragment);
}

function updateNavHighlights() {
  const containers = [
    document.getElementById("nav-container"),
    document.getElementById("mobile-nav-container"),
  ];

  containers.forEach((container) => {
    if (!container) return;
    container.querySelectorAll(".nav-item").forEach((item, i) => {
      item.className = "nav-item shadow-sm";
      if (i === currentQuestionIndex) item.classList.add("active");

      const uAns = userAnswers[i];
      const isMarked = markedForReview[i];

      if (quizSubmitted) {
        const correctIndex = getCorrectIndex(currentQuizData[i]);
        if (!isValidAnswer(uAns)) item.classList.add("unattempted");
        else if (uAns.answer === correctIndex) item.classList.add("correct-nav");
        else item.classList.add("incorrect-nav");
      } else {
        if (isValidAnswer(uAns)) item.classList.add("attempted");
        if (isMarked) item.classList.add("marked-nav");
      }

      // Descriptive state for screen readers (P1-9)
      const parts = [`Question ${i + 1}`];
      if (i === currentQuestionIndex) parts.push("current");
      if (isMarked) parts.push("marked");
      if (quizSubmitted) {
        if (!isValidAnswer(uAns)) parts.push("unattempted");
        else if (uAns.answer === getCorrectIndex(currentQuizData[i])) parts.push("correct");
        else parts.push("incorrect");
      } else if (isValidAnswer(uAns)) {
        parts.push("answered");
      } else {
        parts.push("not visited");
      }
      item.setAttribute("aria-label", parts.join(", "));
    });
  });

  updatePaletteCounters();
}
/* =========================================
   7. SUBMIT & STATISTICS
   ========================================= */

function submitAll(forceSubmit = false) {
  if (!forceSubmit) {
    openSubmitSummaryModal();
    return;
  }

  const summaryModal = bootstrap.Modal.getInstance(
    document.getElementById("submitSummaryModal")
  );
  if (summaryModal) summaryModal.hide();

  if (currentQuizTimer) currentQuizTimer.stop();
  updateQuestionTimer(); // Finalize time for the last question

  quizSubmitted = true;
  clearQuizProgress(currentChapterId);

  trackEvent("test_submitted", {
    subject: currentSubject,
    chapter: currentChapterName,
    mode: quizMode,
  });

  let score = 0;
  let correct = 0,
    incorrect = 0,
    unattempted = 0;
  const totalQ = currentQuizData.length;

  currentQuizData.forEach((q, i) => {
    const uAns = userAnswers[i];
    const cIdx = getCorrectIndex(q);

    if (isValidAnswer(uAns)) {
      const isCorrect = uAns.answer === cIdx;
      userAnswers[i].isCorrect = isCorrect;
      if (isCorrect) {
        score += MARKING_SCHEME.correctMarks;
        correct++;
      } else {
        score -= MARKING_SCHEME.wrongMarks;
        incorrect++;
      }
    } else {
      unattempted++;
    }
  });

  const finalScore = parseFloat(score.toFixed(2));
  const totalMarks = totalQ * MARKING_SCHEME.correctMarks;
  const percentage =
    totalMarks > 0 ? ((finalScore / totalMarks) * 100).toFixed(1) : 0;

  const now = new Date();

  const leaderboardEntry = {
    userEmail: currentUser ? currentUser.email : "guest",
    scorePercent: parseFloat(percentage),
    score: finalScore,
    rankTime: now.toISOString(),
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
    pauseCount: typeof pauseCount !== "undefined" ? pauseCount : 0,
    mode: quizMode,
    timestamp: now,
  };

  const marksLost = (incorrect * MARKING_SCHEME.wrongMarks).toFixed(2);
  const totalTimeSec = Object.values(questionTimeSpent || {}).reduce(
    (acc, v) => acc + (v || 0),
    0
  );
  const avgTimeSec = totalQ > 0 ? Math.round(totalTimeSec / totalQ) : 0;
  const timeTakenLabel =
    totalTimeSec < 60
      ? `${Math.round(totalTimeSec)}s`
      : `${Math.floor(totalTimeSec / 60)}m ${Math.round(totalTimeSec % 60)}s`;

  document.getElementById("result").innerHTML = `
        <div class="card border-0 shadow-sm mt-3 result-card">
            <div class="card-body p-4 text-center">
                <h4 class="fw-bold text-primary mb-1">Test Complete! 🏆</h4>
                <div class="result-score fw-bold text-primary my-2">
                    ${finalScore}<span class="fs-5 text-muted"> / ${totalMarks}</span>
                </div>
                <p class="fs-5 fw-bold mb-3">${percentage}%</p>
                <div class="row g-2 mb-3">
                    <div class="col-4"><div class="p-2 bg-light rounded border"><small class="text-muted d-block">Correct</small><strong class="text-success">${correct}</strong></div></div>
                    <div class="col-4"><div class="p-2 bg-light rounded border"><small class="text-muted d-block">Incorrect</small><strong class="text-danger">${incorrect}</strong></div></div>
                    <div class="col-4"><div class="p-2 bg-light rounded border"><small class="text-muted d-block">Unattempted</small><strong class="text-secondary">${unattempted}</strong></div></div>
                </div>
                <p class="small text-muted mb-2">You lost <strong class="text-danger">${marksLost} marks</strong> to wrong answers (negative marking).</p>
                <p class="small text-muted mb-3">Time taken: ${timeTakenLabel} · Avg ${avgTimeSec}s per question</p>
                <div id="stats-loading" class="mt-2 text-muted small"><span class="spinner-border spinner-border-sm"></span> Calculating class standing...</div>
            </div>
        </div>
        <div id="result-actions" class="d-flex justify-content-center gap-2 mt-3 flex-wrap"></div>
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

  const backBtn = document.createElement("button");
  backBtn.className = "btn btn-secondary-custom px-4 shadow";
  backBtn.innerHTML = "← Back to chapters";
  backBtn.onclick = () => {
    if (currentSubject && allQuizData && allQuizData[currentSubject]) {
      hideAllSections();
      document.getElementById("test-selection-section").style.display = "block";
      renderChapters(currentSubject);
    } else {
      showDashboard();
    }
  };
  actionsDiv.appendChild(backBtn);

  // Retry helpers (P2-8)
  if (incorrect > 0) {
    const retryWrongBtn = document.createElement("button");
    retryWrongBtn.className = "btn btn-outline-danger px-4";
    retryWrongBtn.innerHTML = `↻ Retry ${incorrect} mistake${incorrect === 1 ? "" : "s"}`;
    retryWrongBtn.onclick = () => retryFiltered("incorrect");
    actionsDiv.appendChild(retryWrongBtn);
  }
  if (unattempted > 0) {
    const retrySkipBtn = document.createElement("button");
    retrySkipBtn.className = "btn btn-outline-secondary px-4";
    retrySkipBtn.innerHTML = `↻ Retry ${unattempted} unattempted`;
    retrySkipBtn.onclick = () => retryFiltered("unattempted");
    actionsDiv.appendChild(retrySkipBtn);
  }

  // Hide navigation controls now that the test is submitted
  ["final-submit-btn", "prev-btn", "next-btn", "clear-btn"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  renderQuestion();
  updateNavHighlights();

  // Bring the result card into view (it renders below the action row)
  document
    .getElementById("result")
    .scrollIntoView({ behavior: "smooth", block: "center" });

  if (currentUser) {
    saveResultToCloud(resultObject, leaderboardEntry, now, percentage);
  }
}

/**
 * Builds a short retry quiz from incorrect or unattempted questions of the
 * attempt just completed (P2-8).
 */
function retryFiltered(filterType) {
  const filtered = [];
  currentQuizData.forEach((q, i) => {
    const uAns = userAnswers[i];
    const correctIndex = getCorrectIndex(q);
    if (filterType === "incorrect") {
      if (isValidAnswer(uAns) && uAns.answer !== correctIndex)
        filtered.push({ ...q });
    } else if (filterType === "unattempted") {
      if (!isValidAnswer(uAns)) filtered.push({ ...q });
    }
  });

  if (filtered.length === 0) {
    toastr.info("No questions match this filter.");
    return;
  }

  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  currentQuizData = filtered;
  isPracticeMode = false;
  isReviewMode = false;
  quizSubmitted = false;
  quizMode = "exam";
  currentQuestionIndex = 0;
  userAnswers = {};
  markedForReview = {};
  questionTimeSpent = {};
  currentQuestionStartTime = null;
  currentChapterName =
    filterType === "incorrect" ? "Retry Mistakes" : "Retry Unattempted";
  currentChapterId = "retry_" + Date.now();

  hideAllSections();
  document.getElementById("quiz-section").style.display = "block";
  renderBreadcrumbs([
    { label: "Home", onclick: "showHome()" },
    { label: "Dashboard", onclick: "showDashboard()" },
    { label: "Take Test", onclick: "renderSubjects()" },
    { label: currentSubject, onclick: `renderChapters('${currentSubject}')` },
    { label: currentChapterName },
  ]);

  const quizContent = document.getElementById("quiz-content");
  const quizNav = document.getElementById("quiz-nav");
  quizContent.parentElement.className = "col-lg-8 mb-4";
  quizNav.parentElement.style.display = "block";
  renderQuizLayout(currentChapterName);
  renderQuestion();
  renderNav();
  startTimer(currentQuizData.length, null);
  currentQuestionStartTime = Date.now();
}

/**
 * Persists the result document, updates chapter statistics, and computes
 * class standing. Includes a timeout for the standing fetch and a retry
 * affordance if the initial write fails.
 */
async function saveResultToCloud(resultObject, leaderboardEntry, now, percentage) {
  const statsLoadingEl = () => document.getElementById("stats-loading");

  // Fallback if the class-standing fetch hangs or fails silently
  const statsTimeout = setTimeout(() => {
    const el = statsLoadingEl();
    if (el) el.innerHTML = "Couldn't load class standing. Your result is saved.";
  }, 8000);

  try {
    const docRef = await db.collection("results").add({ ...resultObject });
    leaderboardEntry.resultId = docRef.id;
    userHistory.unshift({ ...resultObject, timestamp: now });
    if (userHistory.length > 20) userHistory.pop();
    dashboardDataLoaded = true;

    await DataManager.invalidateCache(`global_stats_${currentChapterId}`);
    await DataManager.invalidateCache(`user_history_${currentUser.uid}`);

    if (!currentChapterId.startsWith("revision_")) {
      const statsRef = db.collection("chapter_stats").doc(currentChapterId);
      try {
        await db.runTransaction(async (transaction) => {
          const sfDoc = await transaction.get(statsRef);
          const newScore = parseFloat(percentage);

          if (!sfDoc.exists) {
            const initCorrectCounts = currentQuizData.map((q, i) =>
              isValidAnswer(userAnswers[i]) &&
              userAnswers[i].answer === getCorrectIndex(q)
                ? 1
                : 0
            );
            const initAttemptedCounts = currentQuizData.map((q, i) =>
              isValidAnswer(userAnswers[i]) ? 1 : 0
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
            currentLeaderboard.sort((a, b) => b.scorePercent - a.scorePercent);
            if (currentLeaderboard.length > 10)
              currentLeaderboard = currentLeaderboard.slice(0, 10);

            let cCounts = [...(data.correctCounts || [])];
            let aCounts = [...(data.attemptedCounts || [])];

            const maxLen = Math.max(
              cCounts.length,
              aCounts.length,
              currentQuizData.length
            );
            for (let j = 0; j < maxLen; j++) {
              if (cCounts[j] == null) cCounts[j] = 0;
              if (aCounts[j] == null) aCounts[j] = 0;
            }

            currentQuizData.forEach((q, i) => {
              if (isValidAnswer(userAnswers[i])) {
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
        toastr.error(
          "Your result was saved, but class statistics could not be updated."
        );
      }
    } else {
      toastr.success("Revision test result saved!");
    }

    const stats = await DataManager.fetchGlobalStats(currentChapterId, true);
    if (stats) {
      let betterThan = 0;
      const pct = parseFloat(percentage);
      stats.allScores.forEach((s) => {
        if (s < pct) betterThan++;
      });
      const percentile =
        stats.totalAttempts > 0
          ? ((betterThan / stats.totalAttempts) * 100).toFixed(0)
          : 0;
      const el = statsLoadingEl();
      if (el)
        el.innerHTML = `🌍 Performance: Top <strong>${
          100 - percentile
        }%</strong>. (Avg: ${stats.avg.toFixed(1)}%)`;
    }
  } catch (error) {
    console.error("Result save failed:", error);
    const el = statsLoadingEl();
    if (el) el.innerHTML = "Your result could not be saved to the cloud.";
    toastr.error("Failed to save result. You can retry below.");
    showRetrySaveButton(resultObject, leaderboardEntry, now, percentage);
  } finally {
    clearTimeout(statsTimeout);
  }
}

function showRetrySaveButton(resultObject, leaderboardEntry, now, percentage) {
  const actionsDiv = document.getElementById("result-actions");
  if (!actionsDiv || document.getElementById("retry-save-btn")) return;

  const btn = document.createElement("button");
  btn.id = "retry-save-btn";
  btn.className = "btn btn-outline-danger px-4 shadow";
  btn.textContent = "↻ Retry Save";
  btn.onclick = () => {
    btn.disabled = true;
    btn.textContent = "Saving...";
    saveResultToCloud(resultObject, leaderboardEntry, now, percentage).finally(
      () => {
        btn.disabled = false;
        btn.textContent = "↻ Retry Save";
      }
    );
  };
  actionsDiv.appendChild(btn);
}

/**
 * Builds and shows the submit summary modal (replaces the native confirm()).
 */
function openSubmitSummaryModal() {
  let answered = 0;
  let unattempted = 0;
  let marked = 0;
  let lowConfidence = 0;

  currentQuizData.forEach((q, i) => {
    const uAns = userAnswers[i];
    if (isValidAnswer(uAns)) answered++;
    else unattempted++;
    if (markedForReview[i]) marked++;
    const surety = uAns && uAns.surety;
    if (surety === 0 || surety === 50) lowConfidence++;
  });

  document.getElementById("summary-answered").textContent = answered;
  document.getElementById("summary-unattempted").textContent = unattempted;
  document.getElementById("summary-marked").textContent = marked;
  document.getElementById("summary-low-confidence").textContent = lowConfidence;

  const jumpUnattempted = document.getElementById("summary-jump-unattempted");
  const jumpMarked = document.getElementById("summary-jump-marked");
  jumpUnattempted.style.display = unattempted > 0 ? "" : "none";
  jumpMarked.style.display = marked > 0 ? "" : "none";

  const modalEl = document.getElementById("submitSummaryModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function jumpToFirstUnattempted() {
  const idx = currentQuizData.findIndex((q, i) => !isValidAnswer(userAnswers[i]));
  jumpToQuestionIndex(idx);
}

function jumpToFirstMarked() {
  const idx = currentQuizData.findIndex((q, i) => markedForReview[i]);
  jumpToQuestionIndex(idx);
}

function jumpToQuestionIndex(idx) {
  if (idx < 0) return;
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("submitSummaryModal")
  );
  if (modal) modal.hide();
  updateQuestionTimer();
  currentQuestionIndex = idx;
  renderQuestion();
  updateNavHighlights();
  saveQuizProgress();
}

function toggleMarkForReview() {
  if (quizSubmitted) return;

  if (markedForReview[currentQuestionIndex]) {
    delete markedForReview[currentQuestionIndex];
  } else {
    markedForReview[currentQuestionIndex] = true;
  }

  updateMarkButton();
  updateNavHighlights();
  saveQuizProgress();
}

function updateMarkButton() {
  const markBtn = document.getElementById("mark-review-btn");
  const markLabel = document.getElementById("mark-review-label");
  if (!markBtn) return;
  const isMarked = !!markedForReview[currentQuestionIndex];
  markBtn.classList.toggle("marked", isMarked);
  markBtn.setAttribute("aria-pressed", isMarked ? "true" : "false");
  markBtn.title = isMarked ? "Unmark for review" : "Mark for review";
  const icon = markBtn.querySelector("i");
  if (icon) icon.className = isMarked ? "bi bi-bookmark-fill" : "bi bi-bookmark";
  if (markLabel)
    markLabel.textContent = isMarked ? "Marked for review" : "Mark for review";
}

/* =========================================
   BOOKMARKS (P2-12)
   ========================================= */
function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem("user_bookmarks") || "[]");
  } catch (e) {
    return [];
  }
}

function isBookmarked() {
  const q = currentQuizData[currentQuestionIndex];
  if (!q) return false;
  return getBookmarks().some(
    (b) => b.chapterId === currentChapterId && b.text === q.text
  );
}

function toggleBookmark() {
  const q = currentQuizData[currentQuestionIndex];
  if (!q) return;
  let bookmarks = getBookmarks();
  const existing = bookmarks.findIndex(
    (b) => b.chapterId === currentChapterId && b.text === q.text
  );

  if (existing >= 0) {
    bookmarks.splice(existing, 1);
    toastr.info("Bookmark removed");
  } else {
    bookmarks.unshift({
      chapterId: currentChapterId,
      chapterName: currentChapterName,
      subject: currentSubject,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      savedAt: Date.now(),
    });
    toastr.success("Bookmark saved");
  }

  localStorage.setItem("user_bookmarks", JSON.stringify(bookmarks));
  updateBookmarkButton();
}

function updateBookmarkButton() {
  const btn = document.getElementById("bookmark-btn");
  const label = document.getElementById("bookmark-label");
  if (!btn) return;
  const bookmarked = isBookmarked();
  btn.classList.toggle("btn-primary-custom", bookmarked);
  btn.classList.toggle("btn-outline-secondary", !bookmarked);
  btn.title = bookmarked ? "Remove bookmark" : "Save to bookmarks";
  const icon = btn.querySelector("i");
  if (icon)
    icon.className = bookmarked ? "bi bi-bookmark-star-fill" : "bi bi-bookmark-star";
  if (label) label.textContent = bookmarked ? "Bookmarked" : "Bookmark";
}

function showBookmarks() {
  const bookmarks = getBookmarks();
  const container = document.getElementById("test-content-container");
  hideAllSections();
  document.getElementById("test-selection-section").style.display = "block";
  renderBreadcrumbs([
    { label: "Home", onclick: "showHome()" },
    { label: "Dashboard", onclick: "showDashboard()" },
    { label: "My Bookmarks" },
  ]);

  if (bookmarks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="display-1 opacity-25 mb-3">📑</div>
        <h5 class="text-muted">No bookmarks yet.</h5>
        <p class="text-muted small">Bookmark questions while taking a test to review them here.</p>
      </div>`;
    return;
  }

  const cards = bookmarks
    .map((b, i) => {
      const correctIndex = getCorrectIndex(b);
      const options = (b.options || [])
        .map((opt, oi) => {
          const cls =
            oi === correctIndex
              ? "bg-success-subtle border-success fw-bold text-success"
              : "border";
          return `<div class="option p-2 mb-2 border rounded ${cls}">${opt}</div>`;
        })
        .join("");
      return `
        <div class="card mb-4 shadow-sm border-0">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold text-primary mb-0">${b.subject} — ${b.chapterName}</h6>
              <button class="btn btn-outline-danger btn-sm" onclick="removeBookmark(${i})"><i class="bi bi-trash"></i></button>
            </div>
            <div class="fw-bold mb-3">${TextFormatter.formatQuestionText(b.text)}</div>
            <div class="mb-3">${options}</div>
            <div class="explanation shadow-sm mt-2"><strong>💡 Explanation:</strong><div class="mt-1 small">${
              b.explanation || "No explanation."
            }</div></div>
          </div>
        </div>`;
    })
    .join("");

  container.innerHTML = `
    <div class="text-center mb-4">
      <h4 class="fw-bold section-title">My Bookmarks</h4>
      <div class="title-underline mx-auto"></div>
    </div>
    ${cards}
  `;
}

function removeBookmark(index) {
  const bookmarks = getBookmarks();
  bookmarks.splice(index, 1);
  localStorage.setItem("user_bookmarks", JSON.stringify(bookmarks));
  showBookmarks();
}
