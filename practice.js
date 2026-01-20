/* =========================================
   PRACTICE MODE LOGIC (practice.js)
   ========================================= */
let practiceSubmitted = false;
let practiceQuestionLimit = 0;
let practiceUserAnswers = {};
let practiceMarkedForReview = {};
let practiceCurrentIndex = 0;
let practiceQuizData = [];
let practiceSubject = "";
let practiceChapter = "";
const practiceDataCache = {};

/**
 * Starts the timer for Practice Mode
 */
function startPracticeTimer(limit) {
  if (currentQuizTimer) currentQuizTimer.stop();

  let timeLeft = Math.floor(limit * 1.2 * 60); // 1.2 minutes per question (matching quiz logic)
  
  currentQuizTimer = new QuizTimer("timer-display",
    null, // No per-tick action needed for practice mode persistence yet
    () => {
        toastr.warning("Time's up! Finishing practice session...");
        submitPractice(true);
    }
  );
  currentQuizTimer.start(timeLeft);
}

/**
 * Entry point from Dashboard - Renders the Dropdown Selection UI
 */
function startPracticeSelection() {
  // isPracticeMode = true;
  practiceSubmitted = false;
  hideAllSections();
  document.getElementById("test-selection-section").style.display = "block";
  renderPracticeUI();
}

/**
 * Renders the consolidated Dropdown interface
 * UPDATED: Now uses allPracticeData from practiceMcqData.js
 */
/**
 * Renders the consolidated Dropdown interface
 */
async function renderPracticeUI() {
  if (typeof allPracticeData === "undefined") {
    await DataManager.fetchPracticeManifest();
  }
  const container = document.getElementById("test-content-container");

  container.innerHTML = `
        <button class="btn btn-secondary-custom px-4 shadow-sm mb-4" onclick="showDashboard()">← Back to Dashboard</button>
        <div class="text-center mb-5">
            <h2 class="fw-bold section-title">Practice MCQ</h2>
            <div class="title-underline mx-auto"></div>
            <p class="text-muted mt-3">Configure your custom practice session below.</p>
        </div>

        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <div class="mb-4">
                        <label class="form-label fw-bold text-muted small text-uppercase">Subject</label>
                        <select id="practice-subject-select" class="form-select form-select-lg" onchange="updatePracticeTopics()">
                            <option value="" selected disabled>Choose a Subject...</option>
                            ${Object.keys(allPracticeData)
                              .map(
                                (subject) =>
                                  `<option value="${subject}">${subject}</option>`
                              )
                              .join("")}
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold text-muted small text-uppercase">Topic / Chapter</label>
                        <select id="practice-topic-select" class="form-select form-select-lg" disabled>
                            <option value="" selected disabled>Select Subject first...</option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-bold text-muted small text-uppercase">Number of Questions</label>
                        <select id="practice-limit-select" class="form-select form-select-lg">
                            <option value="10" selected>10 Questions</option>
                            <option value="20">20 Questions</option>
                            <option value="30">30 Questions</option>
                            <option value="40">40 Questions</option>
                            <option value="50">50 Questions</option>
                            <option value="75">75 Questions</option>
                            <option value="100">100 Questions</option>
                            </select>
                    </div>

                    <button class="btn btn-primary-custom w-100 py-3 fw-bold fs-5 shadow-sm" onclick="handleGeneratePractice()">
                         Start Practice
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Dynamically updates the Topic dropdown based on the selected Subject
 * UPDATED: Maps chapters from allPracticeData
 */
/**
 * Dynamically updates the Topic dropdown based on the selected Subject
 */
function updatePracticeTopics() {
  const subjectSelect = document.getElementById("practice-subject-select");
  const topicSelect = document.getElementById("practice-topic-select");
  const selectedSubject = subjectSelect.value;

  if (!selectedSubject) return;

  const chapters = allPracticeData[selectedSubject];
  // Added "All Topics" option at the beginning of the list
  topicSelect.innerHTML =
    `<option value="" selected disabled>Choose a Topic...</option>` +
    `<option value="all">All Topics</option>` +
    Object.keys(chapters)
      .map((chapId) => `<option value="${chapId}">${chapId}</option>`)
      .join("");

  topicSelect.disabled = false;
}

/**
 * Validates selection and triggers the quiz
 */
function handleGeneratePractice() {
  const subject = document.getElementById("practice-subject-select").value;
  const topic = document.getElementById("practice-topic-select").value;
  const limit = parseInt(
    document.getElementById("practice-limit-select").value
  );

  if (!subject || !topic) {
    toastr.error("Please select both a Subject and a Topic.");
    return;
  }

  loadPracticeQuiz(subject, topic, limit);
}

/**
 * Fetches questions from Firebase
 * UPDATED: Now fetches from "practice_mcqs" collection
 */
/**
 * Fetches questions from Firebase and randomizes selection
 */
/* =========================================
   PRACTICE MODE LOGIC (Updated loadPracticeQuiz)
   ========================================= */
async function loadPracticeQuiz(subject, chapter, limit) {
  practiceSubject = subject;
  practiceChapter = chapter === "all" ? "All Topics" : chapter;
  practiceQuestionLimit = limit;
  practiceSubmitted = false;
  practiceMarkedForReview = {}; 

  hideAllSections();
  document.getElementById("quiz-section").style.display = "block";
  document.getElementById("quiz-content").innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-info" role="status"></div>
            <p class="mt-2 text-muted">Optimizing your session...</p>
        </div>`;

  try {
    let allQuestions = [];
    const chapterIds =
      chapter === "all" ? Object.keys(allPracticeData[subject]) : [chapter];

    for (const chapId of chapterIds) {
      const docId = subject.replace(/\s+/g, "_") + "_" + chapId;
      const data = await DataManager.fetchPracticeQuestions(docId);
      allQuestions = allQuestions.concat(data);
    }

    if (allQuestions.length === 0)
      return toastr.error("No questions available.");

    const randomized = [...allQuestions].sort(() => 0.5 - Math.random());
    practiceQuizData = randomized.slice(0, limit);

    practiceCurrentIndex = 0;
    practiceUserAnswers = {};

    setupPracticeLayout();
    renderPracticeQuestion();
    renderPracticeNav();
    startPracticeTimer(limit);
  } catch (error) {
    console.error("Fetch Error:", error);
    toastr.error("Failed to load questions.");
  }
}

function setupPracticeLayout() {
  document.getElementById("quiz-content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold text-primary m-0">${practiceChapter}</h4>
            <button id="practice-mark-review-btn" class="btn btn-secondary-custom btn-sm fw-bold" onclick="togglePracticeMarkForReview()">
                <i class="bi bi-bookmark"></i> Mark for Review
            </button>
        </div>
        <div id="practice-result-summary" class="mb-4"></div>
        <div id="practice-question-container"></div>
        <div class="d-flex justify-content-between mt-5 gap-3">
            <button class="btn btn-secondary-custom px-4" onclick="navPractice(-1)"><i class="bi bi-arrow-left me-1"></i> Prev</button>
            <button class="btn btn-outline-secondary px-4" id="practice-clear-btn" onclick="clearPracticeSelection()">Clear</button>
            <button class="btn btn-primary-custom px-4" onclick="navPractice(1)">Next <i class="bi bi-arrow-right ms-1"></i></button>
        </div>
    `;

  document.getElementById("quiz-nav").innerHTML = `
        <div class="nav-header">Question Palette</div>
        <div class="timer-container mb-4">
            <span class="text-uppercase small fw-bold text-muted d-block mb-1">Time Remaining</span>
            <div id="timer-display" class="timer-value">00:00</div>
        </div>
        <div id="practice-nav-container" class="nav-grid"></div>
        <button id="practice-submit-btn" class="btn btn-success-custom w-100 mt-4 py-3 fw-bold shadow-sm" onclick="submitPractice()">Finish Practice</button>
    `;
}

function renderPracticeQuestion() {
  const container = document.getElementById("practice-question-container");
  const q = practiceQuizData[practiceCurrentIndex];
  const cIdx = typeof q.correctAnswer === "number" ? q.correctAnswer : q.options.indexOf(q.correctAnswer);

  const markBtn = document.getElementById("practice-mark-review-btn");
  if (markBtn) {
    if (practiceMarkedForReview[practiceCurrentIndex]) {
      markBtn.innerHTML = `<i class="bi bi-bookmark-fill"></i> Unmark Review`;
      markBtn.style.backgroundColor = "#7e22ce";
      markBtn.style.color = "#ffffff";
    } else {
      markBtn.innerHTML = `<i class="bi bi-bookmark"></i> Mark for Review`;
      markBtn.style.backgroundColor = "transparent";
      markBtn.style.color = "#7e22ce";
    }
    markBtn.style.display = practiceSubmitted ? "none" : "block";
  }

  const currentSurety = practiceUserAnswers[practiceCurrentIndex]?.surety;

  container.innerHTML = `<div class="question">
        <p class="mb-3 lead"><strong>Q${practiceCurrentIndex + 1}.</strong> ${q.text.replace(/\n/g, "<br>")}</p>
        <div id="practice-options"></div>
        
        <div class="mt-4 mb-2 animate-fade-in">
            <div class="surety-label">Confidence Level</div>
            <div class="surety-matrix shadow-sm">
                <div class="surety-opt surety-100 ${currentSurety === 100 ? 'selected' : ''}" data-val="100">100%</div>
                <div class="surety-opt surety-75 ${currentSurety === 75 ? 'selected' : ''}" data-val="75">75%</div>
                <div class="surety-opt surety-50 ${currentSurety === 50 ? 'selected' : ''}" data-val="50">50%</div>
                <div class="surety-opt surety-0 ${currentSurety === 0 ? 'selected' : ''}" data-val="0">0%</div>
            </div>
        </div>
    </div>`;

  const optionsDiv = container.querySelector("#practice-options");
  q.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "option shadow-sm";
    const uAns = practiceUserAnswers[practiceCurrentIndex]?.answer;
    const isSelected = uAns === idx;

    if (practiceSubmitted) {
      if (idx === cIdx) label.classList.add("correct-answer-label");
      if (isSelected && idx !== cIdx) label.classList.add("incorrect-answer-label");
    }

    label.innerHTML = `<input type="radio" name="pQ" value="${idx}" ${isSelected ? "checked" : ""} ${practiceSubmitted ? "disabled" : ""}><span>${opt}</span>`;

    if (!practiceSubmitted) {
      label.querySelector("input").onchange = () => {
        if (!practiceUserAnswers[practiceCurrentIndex]) practiceUserAnswers[practiceCurrentIndex] = {};
        practiceUserAnswers[practiceCurrentIndex].answer = idx;
        updatePracticeNavHighlights();
      };
    }
    optionsDiv.appendChild(label);
  });

  const suretyOpts = container.querySelectorAll(".surety-opt");
  if (!practiceSubmitted) {
    suretyOpts.forEach(opt => {
        opt.onclick = function() {
            const val = parseInt(this.getAttribute("data-val"));
            if (!practiceUserAnswers[practiceCurrentIndex]) practiceUserAnswers[practiceCurrentIndex] = { answer: -1 };
            practiceUserAnswers[practiceCurrentIndex].surety = val;
            
            // Only toggle selected class
            suretyOpts.forEach(o => o.classList.remove("selected"));
            this.classList.add("selected");
        };
    });
  }

  if (practiceSubmitted && q.explanation) {
    const exp = document.createElement("div");
    exp.className = "explanation shadow-sm mt-3 animate-fade-in";
    exp.innerHTML = `<strong> Explanation:</strong> <br>${q.explanation}`;
    container.appendChild(exp);
  }
}
function updatePracticeNavHighlights() {
  document
    .querySelectorAll("#practice-nav-container .nav-item")
    .forEach((item, i) => {
      item.className = "nav-item shadow-sm";
      if (i === practiceCurrentIndex) item.classList.add("active");

      const uAns = practiceUserAnswers[i];
      const isMarked = practiceMarkedForReview[i];

      if (practiceSubmitted) {
        const q = practiceQuizData[i];
        const cIdx =
          typeof q.correctAnswer === "number"
            ? q.correctAnswer
            : q.options.indexOf(q.correctAnswer);
        
        // FIX: Compare uAns.answer to cIdx and handle undefined/unselected cases
        if (!uAns || uAns.answer === undefined || uAns.answer === -1) {
          item.classList.add("unattempted");
        } else if (uAns.answer === cIdx) {
          item.classList.add("correct-nav");
        } else {
          item.classList.add("incorrect-nav");
        }
      } else {
        // FIX: Mark as attempted only if an option is actually selected
        if (uAns && uAns.answer !== undefined && uAns.answer !== -1) {
          item.classList.add("attempted");
        }
        if (isMarked) item.classList.add("marked-nav");
      }
    });
}


function navPractice(dir) {
  const next = practiceCurrentIndex + dir;
  if (next >= 0 && next < practiceQuizData.length) {
    practiceCurrentIndex = next;
    renderPracticeQuestion();
    updatePracticeNavHighlights();
  }
}

function clearPracticeSelection() {
  if (practiceSubmitted) return;
  delete practiceUserAnswers[practiceCurrentIndex];
  renderPracticeQuestion();
  updatePracticeNavHighlights();
}

function renderPracticeNav() {
  const nav = document.getElementById("practice-nav-container");
  nav.innerHTML = "";
  practiceQuizData.forEach((_, i) => {
    const item = document.createElement("div");
    item.className = "nav-item shadow-sm";
    item.textContent = i + 1;
    item.onclick = () => {
      practiceCurrentIndex = i;
      renderPracticeQuestion();
      updatePracticeNavHighlights();
    };
    nav.appendChild(item);
  });
  updatePracticeNavHighlights();
}

function submitPractice(forceSubmit = false) {
  if (!forceSubmit && !confirm("Finish this practice session?")) return;
  
  if (currentQuizTimer) currentQuizTimer.stop();
  practiceSubmitted = true;

  let score = 0;
  let correct = 0,
    incorrect = 0,
    unattempted = 0;

  practiceQuizData.forEach((q, i) => {
    const uAns = practiceUserAnswers[i];
    const cIdx =
      typeof q.correctAnswer === "number"
        ? q.correctAnswer
        : q.options.indexOf(q.correctAnswer);

    // FIX: Access .answer for scoring logic
    if (uAns && uAns.answer !== undefined && uAns.answer !== -1) {
      if (uAns.answer === cIdx) {
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

  const totalQuestions = practiceQuizData.length;
  const totalPossibleMarks = totalQuestions * 2;
  const accuracy = ((correct / (correct + incorrect)) * 100 || 0).toFixed(1);

  const negativeLoss = incorrect * 0.66;
  const positiveGain = correct * 2;
  const negativeDrain = positiveGain
    ? ((negativeLoss / positiveGain) * 100).toFixed(1)
    : 0;

  document.getElementById("practice-result-summary").innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center animate-fade-in mb-4">
            <h4 class="fw-bold text-primary mb-4"><i class="bi bi-check-circle-fill me-2"></i>Practice Complete</h4>
            <div class="row g-3 mb-4">
                <div class="col-md-4 col-12">
                    <div class="stats-card">
                        <small class="stats-label">Total Score</small>
                        <h3 class="stats-value text-primary">${score.toFixed(
                          2
                        )} <span class="fs-6 text-muted">/ ${totalPossibleMarks}</span></h3>
                    </div>
                </div>
                <div class="col-md-4 col-6">
                    <div class="stats-card">
                        <small class="stats-label">Accuracy</small>
                        <h4 class="stats-value text-success">${accuracy}%</h4>
                    </div>
                </div>
                <div class="col-md-4 col-6">
                    <div class="stats-card">
                        <small class="stats-label">Neg. Drain</small>
                        <h4 class="stats-value text-danger">${negativeDrain}%</h4>
                    </div>
                </div>
            </div>
            <div class="row g-2">
                <div class="col-4">
                    <div class="p-3 bg-light rounded-3">
                        <small class="text-success d-block fw-bold">Correct</small>
                        <span class="fw-bold fs-5">${correct}</span>
                    </div>
                </div>
                <div class="col-4">
                    <div class="p-3 bg-light rounded-3">
                        <small class="text-danger d-block fw-bold">Incorrect</small>
                        <span class="fw-bold fs-5">${incorrect}</span>
                    </div>
                </div>
                <div class="col-4">
                    <div class="p-3 bg-light rounded-3">
                        <small class="text-muted d-block fw-bold">Skipped</small>
                        <span class="fw-bold fs-5">${unattempted}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.getElementById("practice-submit-btn").style.display = "none";
  document.getElementById("practice-clear-btn").disabled = true;

  renderPracticeQuestion();
  updatePracticeNavHighlights();
}

/**
 * Toggles the Mark for Review state for the current practice question
 */
function togglePracticeMarkForReview() {
  if (practiceSubmitted) return;
  if (practiceMarkedForReview[practiceCurrentIndex]) {
    delete practiceMarkedForReview[practiceCurrentIndex];
    toastr.info("Removed from Review");
  } else {
    practiceMarkedForReview[practiceCurrentIndex] = true;
    toastr.success("Marked for Review");
  }

  renderPracticeQuestion(); // Refresh button UI
  updatePracticeNavHighlights(); // Refresh palette UI
}
