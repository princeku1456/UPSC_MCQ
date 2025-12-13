/* =========================================
   1. GLOBAL VARIABLES & STATE
   ========================================= */
// Firebase Services (Assumes firebase is initialized in config.js)
const auth = firebase.auth();
const db = firebase.firestore();

// App State
let currentUser = null;
let currentSubject = '';
let currentChapterId = '';
let currentChapterName = '';
let currentQuizData = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // Format: { questionIndex: { answer: index, isCorrect: boolean } }
let quizSubmitted = false;
let isReviewMode = false;
let isRegistering = false; // Toggle between Login and Register

// UI References
const authModal = new bootstrap.Modal(document.getElementById('authModal'));

/* =========================================
   2. AUTHENTICATION LOGIC
   ========================================= */

// Listen for Auth State Changes
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateUIForLogin();
        loadUserDashboard();
    } else {
        currentUser = null;
        updateUIForLogout();
        showHome(); // Send to landing page on logout
    }
});

function toggleAuthMode() {
    isRegistering = !isRegistering;
    const btn = document.getElementById('auth-submit-btn');
    const link = document.querySelector('.modal-body small a');
    const title = document.querySelector('.modal-title');
    
    if (isRegistering) {
        title.textContent = "Create Account 🚀";
        btn.textContent = "Register";
        link.textContent = "Login here";
    } else {
        title.textContent = "Welcome Back! 👋";
        btn.textContent = "Login";
        link.textContent = "Register here";
    }
}

// Handle Login/Register Form Submit
document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;

    if (isRegistering) {
        auth.createUserWithEmailAndPassword(email, pass)
            .then(() => {
                authModal.hide();
                toastr.success("Account created successfully!");
            })
            .catch(err => toastr.error(err.message));
    } else {
        auth.signInWithEmailAndPassword(email, pass)
            .then(() => {
                authModal.hide();
                toastr.success("Logged in successfully!");
            })
            .catch(err => toastr.error(err.message));
    }
});

function logoutUser() {
    auth.signOut().then(() => toastr.info("Logged out"));
}

function showAuthModal() {
    authModal.show();
}

// UI Updates based on Auth State
function updateUIForLogin() {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-profile').style.display = 'block';
    
    // Show truncated email as username
    const userName = currentUser.email ? currentUser.email.split('@')[0] : 'User';
    document.getElementById('user-name-display').textContent = userName;
    
    // Update Hero CTA
    const heroCta = document.getElementById('hero-cta');
    if(heroCta) {
        heroCta.innerHTML = `
            <button class="btn btn-primary-custom btn-lg px-5 py-3 shadow-lg" onclick="showDashboard()">Go to Dashboard 📊</button>
        `;
    }
}

function updateUIForLogout() {
    document.getElementById('auth-buttons').style.display = 'block';
    document.getElementById('user-profile').style.display = 'none';
    
    const heroCta = document.getElementById('hero-cta');
    if(heroCta) {
        heroCta.innerHTML = `
            <button class="btn btn-primary-custom btn-lg px-5 py-3 shadow-lg" onclick="showAuthModal()">Get Started 🚀</button>
        `;
    }
}

/* =========================================
   3. NAVIGATION & VIEW MANAGEMENT
   ========================================= */

function handleLogoClick() {
    if (currentUser) showDashboard();
    else showHome();
}

function handleBackToHome() {
    if (currentUser) showDashboard();
    else showHome();
}

function hideAllSections() {
    const sections = ['hero-section', 'dashboard-section', 'subjects-section', 'chapters-section', 'quiz-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
}

function showHome() {
    hideAllSections();
    document.getElementById('hero-section').style.display = 'grid';
}

function showDashboard() {
    if (!currentUser) return showAuthModal();
    hideAllSections();
    document.getElementById('dashboard-section').style.display = 'block';
    loadUserDashboard(); // Refresh data
}

function showSubjects() {
    hideAllSections();
    document.getElementById('subjects-section').style.display = 'block';
    // Load subjects only if data exists
    if(typeof allQuizData !== 'undefined') generateSubjectCards();
}

function showChapters(subjectKey) {
    currentSubject = subjectKey;
    hideAllSections();
    document.getElementById('chapters-section').style.display = 'block';
    document.getElementById('chapters-title').textContent = subjectKey;
    generateChapterCards(subjectKey);
}

function goBackToChapters() {
    if (currentSubject) showChapters(currentSubject);
    else showSubjects();
}

/* =========================================
   4. DASHBOARD & HISTORY LOGIC
   ========================================= */

async function loadUserDashboard() {
    if (!currentUser) return;
    
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '<div class="text-center w-100 py-5"><div class="spinner-border text-primary"></div></div>';

    try {
        // Fetch history from Firestore
        const snapshot = await db.collection('results')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(20) // Limit to last 20 tests for performance
            .get();

        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate Stats
        const totalTests = results.length;
        const avgScore = totalTests ? (results.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalTests).toFixed(1) : 0;
        
        // Find best subject
        const subjectCounts = {};
        results.forEach(r => {
            if(!subjectCounts[r.subject]) subjectCounts[r.subject] = 0;
            if(r.scorePercent > 70) subjectCounts[r.subject]++; 
        });
        const bestSubject = Object.keys(subjectCounts).sort((a,b) => subjectCounts[b] - subjectCounts[a])[0] || "-";

        // Update Stats UI
        document.getElementById('stat-total-tests').textContent = totalTests;
        document.getElementById('stat-avg-score').textContent = avgScore + '%';
        document.getElementById('stat-best-subject').textContent = bestSubject;

        // Render List
        historyContainer.innerHTML = '';
        if (results.length === 0) {
            historyContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No tests taken yet. Start practicing!</div>`;
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
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary flex-fill review-btn">👁 Review</button>
                        <button class="btn btn-sm btn-primary-custom flex-fill retake-btn">↻ Retake</button>
                    </div>
                </div>
            `;
            
            // Attach event listeners safely
            const reviewBtn = card.querySelector('.review-btn');
            reviewBtn.onclick = () => reviewTest(res);

            const retakeBtn = card.querySelector('.retake-btn');
            retakeBtn.onclick = () => retakeTest(res.subject, res.chapterId, encodeURIComponent(res.chapterName));

            historyContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading dashboard:", error);
        historyContainer.innerHTML = `<p class="text-danger text-center">Failed to load history. <br> <small>${error.message}</small></p>`;
    }
}

/* =========================================
   5. QUIZ CORE LOGIC
   ========================================= */

// Helper: Handle weird answer formats in data
function getCorrectIndex(question) {
    if (typeof question.correctAnswer === 'number') return question.correctAnswer;
    const optionIndex = question.options.indexOf(question.correctAnswer);
    if (optionIndex !== -1) return optionIndex;
    if (!isNaN(question.correctAnswer)) return Number(question.correctAnswer);
    return -1;
}

// Start a Fresh Quiz
function loadQuiz(subjectKey, chapterId, chapterName, reviewMode = false, pastData = null) {
    currentSubject = subjectKey;
    currentChapterId = chapterId;
    currentChapterName = decodeURIComponent(chapterName); // Ensure clean name
    
    // Data check
    if (!allQuizData[subjectKey] || !allQuizData[subjectKey][chapterId]) {
        toastr.error("Quiz data not found!");
        return;
    }

    currentQuizData = allQuizData[subjectKey][chapterId];
    currentQuestionIndex = 0;
    isReviewMode = reviewMode;

    // Reset or Load State
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

function retakeTest(subject, chapterId, chapterNameEncoded) {
    // Wrapper to start fresh
    loadQuiz(subject, chapterId, chapterNameEncoded, false);
}

function reviewTest(resultObj) {
    // Wrapper to start review
    loadQuiz(resultObj.subject, resultObj.chapterId, resultObj.chapterName, true, resultObj);
}

/* =========================================
   6. QUIZ RENDERING
   ========================================= */

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

    // Sidebar
    const submitBtnHTML = isReviewMode ? '' : `<button id="final-submit-btn" class="btn btn-success w-100 mt-4 rounded-pill py-2 fw-bold">Submit Test</button>`;
    const backToDashHTML = isReviewMode ? `<button class="btn btn-outline-secondary w-100 mt-2 rounded-pill" onclick="showDashboard()">Back to Dashboard</button>` : '';

    document.getElementById('quiz-nav').innerHTML = `
        <div class="nav-header">Question Palette</div>
        <div id="nav-container" class="nav-grid"></div>
        ${submitBtnHTML}
        ${backToDashHTML}
    `;

    // Listeners
    document.getElementById('prev-btn').addEventListener('click', () => navigateQuestions(-1));
    document.getElementById('next-btn').addEventListener('click', () => navigateQuestions(1));
    
    if(!isReviewMode) {
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

    // Options
    question.options.forEach((opt, idx) => {
        const label = document.createElement('label');
        label.className = 'option shadow-sm';
        
        const uAns = userAnswers[currentQuestionIndex];
        const isSelected = uAns && uAns.answer === idx;
        
        // Input logic
        let inputHTML = `<input type="radio" name="q${currentQuestionIndex}" value="${idx}" ${isSelected ? 'checked' : ''} ${quizSubmitted ? 'disabled' : ''}>`;
        
        label.innerHTML = `${inputHTML} <span>${opt}</span>`;
        
        // Coloring Logic (Only when submitted/reviewing)
        if (quizSubmitted) {
            // 1. Always mark the correct answer GREEN
            if (idx === correctIndex) {
                label.classList.add('correct-answer-label');
            }
            // 2. If user chose this WRONG -> RED
            if (isSelected && idx !== correctIndex) {
                label.classList.add('incorrect-answer-label');
            }
        } else {
            // Live interaction
            label.querySelector('input').addEventListener('change', () => {
                userAnswers[currentQuestionIndex] = { answer: idx };
                updateNavHighlights();
            });
        }
        div.appendChild(label);
    });

    // Explanation (Only when submitted)
    if (quizSubmitted && question.explanation) {
        const exp = document.createElement('div');
        exp.className = 'explanation shadow-sm mt-3';
        exp.innerHTML = `<strong>💡 Explanation:</strong> <br>${question.explanation}`;
        div.appendChild(exp);
    }

    container.appendChild(div);
    updateButtonStates();
    
    // Feedback Text
    if (quizSubmitted) showFeedbackText(correctIndex);
    else document.getElementById('question-feedback').textContent = "";
}

function showFeedbackText(correctIndex) {
    const resultDiv = document.getElementById('question-feedback');
    const uAns = userAnswers[currentQuestionIndex];
    
    if (uAns && uAns.answer === correctIndex) {
        resultDiv.innerHTML = `<h5 class="text-success fw-bold">Correct! 🎉</h5>`;
    } else if (uAns) {
        resultDiv.innerHTML = `<h5 class="text-danger fw-bold">Incorrect. ❌</h5>`;
    } else {
        resultDiv.innerHTML = `<h5 class="text-secondary fw-bold">Unattempted. ⚪</h5>`;
    }
}

function updateButtonStates() {
    const p = document.getElementById('prev-btn');
    const n = document.getElementById('next-btn');
    if(p) p.disabled = currentQuestionIndex === 0;
    if(n) n.disabled = currentQuestionIndex === currentQuizData.length - 1;
}

function navigateQuestions(dir) {
    const next = currentQuestionIndex + dir;
    if(next >= 0 && next < currentQuizData.length) {
        currentQuestionIndex = next;
        renderQuestion();
        updateNavHighlights();
    }
}

function clearSelection() {
    if(quizSubmitted) return;
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
        item.onclick = () => { currentQuestionIndex = i; renderQuestion(); updateNavHighlights(); };
        nav.appendChild(item);
    });
    updateNavHighlights();
}

function updateNavHighlights() {
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.className = 'nav-item shadow-sm'; // reset
        if(i === currentQuestionIndex) item.classList.add('active');
        
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

/* =========================================
   7. SUBMISSION & SAVING
   ========================================= */

function submitAll() {
    if (!confirm("Are you sure you want to submit?")) return;

    quizSubmitted = true;
    let score = 0;
    let correct = 0, incorrect = 0, unattempted = 0;
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

    // Show Result UI
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

    // Lock Controls
    document.getElementById('final-submit-btn').style.display = 'none';
    document.getElementById('clear-btn').disabled = true;
    renderQuestion(); // Re-render to show colors
    updateNavHighlights();

    // SAVE TO FIREBASE
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
            userAnswers: userAnswers, // Save for review
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            toastr.success("Result saved to dashboard!");
        }).catch(err => {
            console.error("Save error:", err);
            toastr.error("Could not save result.");
        });
    } else {
        toastr.warning("Result not saved. Login to track progress.");
    }
}

/* =========================================
   8. CARD GENERATORS (Subjects & Chapters)
   ========================================= */

function generateSubjectCards() {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';
    
    Object.keys(allQuizData).forEach(subjectKey => {
        const count = Object.keys(allQuizData[subjectKey]).length;
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        
        col.innerHTML = `
            <div class="card topic-card h-100" style="cursor: pointer;" onclick="showChapters('${subjectKey}')">
                <div class="card-body text-center p-4">
                    <div class="display-4 mb-3">📖</div>
                    <h5 class="card-title text-primary fw-bold">${subjectKey}</h5>
                    <span class="badge bg-light text-dark border">${count} Chapters</span>
                </div>
            </div>`;
        container.appendChild(col);
    });
}

function generateChapterCards(subjectKey) {
    const container = document.getElementById('chapters-container');
    container.innerHTML = '';
    const chapters = allQuizData[subjectKey];
    
    Object.keys(chapters).forEach(chapId => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        col.innerHTML = `
            <div class="card chapter-card h-100 border-0">
                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-dark">${chapId}</h5>
                    <p class="card-text flex-grow-1 text-muted small">Master this topic.</p>
                    <button class="btn btn-primary-custom w-100 mt-auto" 
                        onclick="loadQuiz('${subjectKey}', '${chapId}', '${encodeURIComponent(chapId)}')">Start Test</button>
                </div>
            </div>`;
        container.appendChild(col);
    });
}

// Initial check to load data if already on subject page
document.addEventListener('DOMContentLoaded', () => {
   // Nothing specific needed here as auth listener handles initial view
});