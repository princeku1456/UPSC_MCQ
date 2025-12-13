/* =========================================
   1. GLOBAL VARIABLES
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentSubject = '';
let currentChapterId = '';
let currentChapterName = '';
let currentQuizData = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let quizSubmitted = false;
let isReviewMode = false;
let isRegistering = false;
let userHistory = [];

/* =========================================
   2. INITIALIZATION & AUTH
   ========================================= */

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateUIForLogin();
        showDashboard();
    } else {
        currentUser = null;
        updateUIForLogout();
        showHome();
    }
});

function toggleAuthMode() {
    isRegistering = !isRegistering;
    const btn = document.getElementById('auth-submit-btn');
    const link = document.querySelector('.card-body small a');
    const title = document.getElementById('auth-title');
    const sub = document.getElementById('auth-subtitle');

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

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;

    if (isRegistering) {
        auth.createUserWithEmailAndPassword(email, pass)
            .then(() => toastr.success("Account created successfully!"))
            .catch(err => toastr.error(err.message));
    } else {
        auth.signInWithEmailAndPassword(email, pass)
            .then(() => toastr.success("Logged in successfully!"))
            .catch(err => toastr.error(err.message));
    }
});

function logoutUser() {
    auth.signOut().then(() => toastr.info("Logged out"));
}

function updateUIForLogin() {
    document.getElementById('user-profile').style.display = 'block';
    const userName = currentUser.email ? currentUser.email.split('@')[0] : 'User';
    document.getElementById('user-name-display').textContent = userName;
}

function updateUIForLogout() {
    document.getElementById('user-profile').style.display = 'none';
}

function handleLogoClick() {
    if (currentUser) showDashboard();
    else showHome();
}

function hideAllSections() {
    const sections = [
        'hero-section',
        'dashboard-section',
        'performance-section',
        'test-selection-section',
        'quiz-section'
    ];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showHome() {
    hideAllSections();
    document.getElementById('hero-section').style.display = 'flex';
}

function showDashboard() {
    if (!currentUser) return showHome();
    hideAllSections();
    document.getElementById('dashboard-section').style.display = 'block';
    loadUserDashboard();
}

function showPerformance() {
    hideAllSections();
    document.getElementById('performance-section').style.display = 'block';
}

function showTestSelection() {
    hideAllSections();
    document.getElementById('test-selection-section').style.display = 'block';
    renderSubjects();
}

function exitQuiz() {
    showDashboard();
}

/* =========================================
   3. DASHBOARD LOGIC (Stats & History)
   ========================================= */

async function loadUserDashboard() {
    if (!currentUser) return;

    const historyContainer = document.getElementById('history-container');
    if (historyContainer.children.length === 0) {
        historyContainer.innerHTML = '<div class="text-center w-100 py-5"><div class="spinner-border text-primary"></div></div>';
    }

    try {
        const snapshot = await db.collection('results')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get();

        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        userHistory = results;

        // Stats
        const totalTests = results.length;
        const avgScore = totalTests ? (results.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalTests).toFixed(1) : 0;

        const subjectCounts = {};
        results.forEach(r => {
            if (!subjectCounts[r.subject]) subjectCounts[r.subject] = 0;
            if (r.scorePercent > 70) subjectCounts[r.subject]++;
        });
        const bestSubject = Object.keys(subjectCounts).sort((a, b) => subjectCounts[b] - subjectCounts[a])[0] || "-";

        document.getElementById('stat-total-tests').textContent = totalTests;
        document.getElementById('stat-avg-score').textContent = avgScore + '%';
        document.getElementById('stat-best-subject').textContent = bestSubject;

        // Render History
        historyContainer.innerHTML = '';
        if (results.length === 0) {
            historyContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No tests taken yet.</div>`;
            return;
        }

        results.forEach(res => {
            const date = res.timestamp ? new Date(res.timestamp.toDate()).toLocaleDateString() : 'N/A';
            let borderClass = 'avg-score';
            if (res.scorePercent >= 80) borderClass = 'high-score';
            if (res.scorePercent < 50) borderClass = 'low-score';

            const card = document.createElement('div');
            card.className = 'col-lg-6 mb-3';
            card.innerHTML = `
                <div class="card history-card p-3 ${borderClass}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="overflow: hidden;">
                            <h6 class="fw-bold text-primary mb-1 text-truncate">${res.chapterName}</h6>
                            <small class="text-muted">${res.subject} • ${date}</small>
                        </div>
                        <div class="text-end ms-2">
                            <div class="fs-4 fw-bold ${res.scorePercent >= 50 ? 'text-success' : 'text-danger'}">
                                ${res.score.toFixed(1)} <span class="fs-6 text-muted">/ ${res.totalMarks}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary w-100 review-btn">👁 Review Performance</button>
                    </div>
                </div>
            `;

            card.querySelector('.review-btn').onclick = () => reviewTest(res);
            historyContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading dashboard:", error);
        historyContainer.innerHTML = `<p class="text-danger text-center">Failed to load history.</p>`;
    }
}

/* =========================================
   4. TAKE TEST LOGIC (Subjects & Chapters)
   ========================================= */

function renderSubjects() {
    const container = document.getElementById('test-content-container');

    if (typeof allQuizData === 'undefined' || !allQuizData) {
        container.innerHTML = '<div class="alert alert-danger text-center">Quiz Data not loaded! Please refresh.</div>';
        return;
    }

    // Injected here so it appears on "Select Subject" but is removed when Chapters are rendered
    container.innerHTML = `
        <button class="btn btn-primary-custom px-4 shadow" onclick="showDashboard()">← Back to Dashboard</button>
        <div class="text-center mb-4">
            <h4 class="fw-bold text-primary">Select a Subject</h4>
            <div class="title-underline mx-auto"></div>
        </div>
        <div class="row justify-content-center" id="subjects-row"></div>
    `;

    const row = document.getElementById('subjects-row');

    Object.keys(allQuizData).forEach(subjectKey => {
        const count = Object.keys(allQuizData[subjectKey]).length;
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
            <div class="card topic-card h-100" style="cursor: pointer;">
                <div class="card-body text-center p-4">
                    <div class="display-4 mb-3">📖</div>
                    <h5 class="card-title text-primary fw-bold">${subjectKey}</h5>
                    <span class="badge bg-light text-dark border">${count} Chapters</span>
                </div>
            </div>`;
        col.onclick = () => renderChapters(subjectKey);
        row.appendChild(col);
    });
}

function renderChapters(subjectKey) {
    const container = document.getElementById('test-content-container');
    // Overwrites container, removing "Back to Dashboard" and adding "Back to Subjects"
    container.innerHTML = `
        <button class="btn btn-primary-custom px-4 shadow" onclick="renderSubjects()">← Back to Subjects</button>
        <div class="text-center mb-4">
            <h4 class="fw-bold text-primary">Chapters: ${subjectKey}</h4>
            <div class="title-underline mx-auto"></div>
        </div>
        <div class="row" id="chapters-row"></div>
    `;

    const row = document.getElementById('chapters-row');
    const chapters = allQuizData[subjectKey];

    Object.keys(chapters).forEach(chapId => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const hasTaken = userHistory && userHistory.some(h => h.chapterId === chapId);
        const btnText = hasTaken ? "↻ Retake Test" : "🚀 Start Test";
        const btnClass = hasTaken ? "btn-primary-custom" : "btn-primary-custom";

        col.innerHTML = `
            <div class="card chapter-card h-100 border-0">
                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-dark">${chapId}</h5>
                    <p class="card-text flex-grow-1 text-muted small">Topic Quiz</p>
                    <button class="btn ${btnClass} w-100 mt-auto action-btn">
                        ${btnText}
                    </button>
                </div>
            </div>`;

        col.querySelector('.action-btn').onclick = () => {
            loadQuiz(subjectKey, chapId, encodeURIComponent(chapId));
        };
        row.appendChild(col);
    });
}

/* =========================================
   5. QUIZ CORE (Unchanged Logic)
   ========================================= */

function getCorrectIndex(question) {
    if (typeof question.correctAnswer === 'number') return question.correctAnswer;
    const optionIndex = question.options.indexOf(question.correctAnswer);
    if (optionIndex !== -1) return optionIndex;
    if (!isNaN(question.correctAnswer)) return Number(question.correctAnswer);
    return -1;
}

function loadQuiz(subjectKey, chapterId, chapterName, reviewMode = false, pastData = null) {
    currentSubject = subjectKey;
    currentChapterId = chapterId;
    currentChapterName = decodeURIComponent(chapterName);

    if (!allQuizData[subjectKey] || !allQuizData[subjectKey][chapterId]) {
        toastr.error("Quiz data not found!");
        return;
    }

    currentQuizData = allQuizData[subjectKey][chapterId];
    currentQuestionIndex = 0;
    isReviewMode = reviewMode;
    userAnswers = {};
    quizSubmitted = false;

    if (reviewMode && pastData) {
        userAnswers = pastData.userAnswers || {};
        quizSubmitted = true;
    }

    hideAllSections();
    document.getElementById('quiz-section').style.display = 'block';

    renderQuizLayout(currentChapterName);
    renderQuestion();
    renderNav();
}

function reviewTest(resultObj) {
    loadQuiz(resultObj.subject, resultObj.chapterId, resultObj.chapterName, true, resultObj);
}

function renderQuizLayout(title) {
    document.getElementById('quiz-content').innerHTML = `
        <h4 class="text-center mb-4 fw-bold text-primary">${title} ${isReviewMode ? '<span class="badge bg-secondary">Review Mode</span>' : ''}</h4>
        <div id="question-container"></div>
        <div class="d-flex justify-content-between mt-4">
            <button id="prev-btn" class="btn btn-primary-custom px-4 rounded-pill">Previous</button>
            <button id="clear-btn" class="btn btn-outline-warning px-4 rounded-pill">Clear</button>
            <button id="next-btn" class="btn btn-primary-custom px-4 rounded-pill">Next</button>
        </div>
        <div id="question-feedback" class="mt-3 text-center"></div>
        <div id="result" class="mt-4 text-center"></div>
    `;

    const submitBtnHTML = isReviewMode ? '' : `<button id="final-submit-btn" class="btn btn-success w-100 mt-4 rounded-pill py-2 fw-bold">Submit Test</button>`;
    const backToDashHTML = isReviewMode ? `<button class="btn btn-primary-custom px-4 shadow mt-5" onclick="showDashboard()">Back to Dashboard</button>` : '';

    document.getElementById('quiz-nav').innerHTML = `
        <div class="nav-header">Question Palette</div>
        <div id="nav-container" class="nav-grid"></div>
        ${submitBtnHTML}
        ${backToDashHTML}
    `;

    document.getElementById('prev-btn').addEventListener('click', () => navigateQuestions(-1));
    document.getElementById('next-btn').addEventListener('click', () => navigateQuestions(1));

    if (!isReviewMode) {
        document.getElementById('clear-btn').addEventListener('click', clearSelection);
        document.getElementById('final-submit-btn').addEventListener('click', submitAll);
    } else {
        document.getElementById('clear-btn').disabled = true;
    }
}

function renderQuestion() {
    const container = document.getElementById('question-container');
    container.innerHTML = '';
    const question = currentQuizData[currentQuestionIndex];
    const correctIndex = getCorrectIndex(question);

    const div = document.createElement('div');
    div.className = 'question';
    const text = question.text ? question.text.replace(/\n/g, '<br>') : '';
    div.innerHTML = `<p class="mb-3 lead"><strong>Q${currentQuestionIndex + 1}. ${text}</strong></p>`;

    question.options.forEach((opt, idx) => {
        const label = document.createElement('label');
        label.className = 'option shadow-sm';
        const uAns = userAnswers[currentQuestionIndex];
        const isSelected = uAns && uAns.answer === idx;

        let inputHTML = `<input type="radio" name="q${currentQuestionIndex}" value="${idx}" ${isSelected ? 'checked' : ''} ${quizSubmitted ? 'disabled' : ''}>`;
        label.innerHTML = `${inputHTML} <span>${opt}</span>`;

        if (quizSubmitted) {
            if (idx === correctIndex) label.classList.add('correct-answer-label');
            if (isSelected && idx !== correctIndex) label.classList.add('incorrect-answer-label');
        } else {
            label.querySelector('input').addEventListener('change', () => {
                userAnswers[currentQuestionIndex] = {
                    answer: idx
                };
                updateNavHighlights();
            });
        }
        div.appendChild(label);
    });

    if (quizSubmitted && question.explanation) {
        const exp = document.createElement('div');
        exp.className = 'explanation shadow-sm mt-3';
        exp.innerHTML = `<strong>💡 Explanation:</strong> <br>${question.explanation}`;
        div.appendChild(exp);
    }

    container.appendChild(div);
    updateButtonStates();
    if (quizSubmitted) showFeedbackText(correctIndex);
    else document.getElementById('question-feedback').textContent = "";
}

function showFeedbackText(correctIndex) {
    const resultDiv = document.getElementById('question-feedback');
    const uAns = userAnswers[currentQuestionIndex];
    if (uAns && uAns.answer === correctIndex) resultDiv.innerHTML = `<h5 class="text-success fw-bold">Correct! 🎉</h5>`;
    else if (uAns) resultDiv.innerHTML = `<h5 class="text-danger fw-bold">Incorrect. ❌</h5>`;
    else resultDiv.innerHTML = `<h5 class="text-secondary fw-bold">Unattempted. ⚪</h5>`;
}

function updateButtonStates() {
    const p = document.getElementById('prev-btn');
    const n = document.getElementById('next-btn');
    if (p) p.disabled = currentQuestionIndex === 0;
    if (n) n.disabled = currentQuestionIndex === currentQuizData.length - 1;
}

function navigateQuestions(dir) {
    const next = currentQuestionIndex + dir;
    if (next >= 0 && next < currentQuizData.length) {
        currentQuestionIndex = next;
        renderQuestion();
        updateNavHighlights();
    }
}

function clearSelection() {
    if (quizSubmitted) return;
    delete userAnswers[currentQuestionIndex];
    renderQuestion();
    updateNavHighlights();
}

function renderNav() {
    const nav = document.getElementById('nav-container');
    nav.innerHTML = '';
    currentQuizData.forEach((_, i) => {
        const item = document.createElement('div');
        item.className = 'nav-item shadow-sm';
        item.textContent = i + 1;
        item.onclick = () => {
            currentQuestionIndex = i;
            renderQuestion();
            updateNavHighlights();
        };
        nav.appendChild(item);
    });
    updateNavHighlights();
}

function updateNavHighlights() {
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.className = 'nav-item shadow-sm';
        if (i === currentQuestionIndex) item.classList.add('active');
        const uAns = userAnswers[i];
        if (quizSubmitted) {
            const correctIndex = getCorrectIndex(currentQuizData[i]);
            if (!uAns) item.classList.add('unattempted');
            else if (uAns.answer === correctIndex) item.classList.add('correct-nav');
            else item.classList.add('incorrect-nav');
        } else {
            if (uAns) item.classList.add('attempted');
        }
    });
}

function submitAll() {
    if (!confirm("Are you sure you want to submit?")) return;

    quizSubmitted = true;
    let score = 0;
    let correct = 0,
        incorrect = 0,
        unattempted = 0;
    const totalQ = currentQuizData.length;

    currentQuizData.forEach((q, i) => {
        const uAns = userAnswers[i];
        const cIdx = getCorrectIndex(q);

        if (uAns) {
            const isCorrect = (uAns.answer === cIdx);
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
    const percentage = totalMarks > 0 ? ((finalScore / totalMarks) * 100).toFixed(1) : 0;

    document.getElementById('result').innerHTML = `
        <div class="alert alert-primary mt-3 shadow-sm" role="alert">
            <h4 class="alert-heading fw-bold">Test Complete! 🏆</h4>
            <hr>
            <p>✅ Correct: <strong>${correct}</strong> | ❌ Incorrect: <strong>${incorrect}</strong></p>
            <p>⚪ Unattempted: <strong>${unattempted}</strong></p>
            <h3 class="text-primary mt-2">Score: ${finalScore} / ${totalMarks} (${percentage}%)</h3>
        </div>
        <button class="btn btn-outline-primary mt-2" onclick="showDashboard()">Return to Dashboard</button>
    `;

    document.getElementById('final-submit-btn').style.display = 'none';
    document.getElementById('clear-btn').disabled = true;
    renderQuestion();
    updateNavHighlights();

    if (currentUser) {
        db.collection('results').add({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            subject: currentSubject,
            chapterId: currentChapterId,
            chapterName: currentChapterName,
            score: finalScore,
            totalMarks: totalMarks,
            scorePercent: parseFloat(percentage),
            userAnswers: userAnswers,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            toastr.success("Result saved!");
            loadUserDashboard();
        }).catch(err => toastr.error("Could not save result."));
    }
}