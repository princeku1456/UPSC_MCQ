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

// NEW: Cache for lazy-loaded quiz data to prevent redundant fetches
const quizDataCache = {}; 

// OPTIMIZATION: Cache Variables
let userHistory = [];
let dashboardDataLoaded = false;
let globalStatsCache = {}; 
let leaderboardCache = {}; 
let performanceChartInstance = null;
let comparisonChartInstance = null;
let quizTimerInterval = null;
// NEW: Store stats for review mode rendering
let currentReviewStats = null;

/* =========================================
   2. INITIALIZATION & AUTH
   ========================================= */

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateUIForLogin();
        // Load dashboard if visible, otherwise just be ready
        if (document.getElementById('dashboard-section').style.display === 'block') {
            showDashboard();
        } else {
            showDashboard();
        }
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

// Check theme preference on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
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
    auth.signOut().then(() => {
        toastr.info("Logged out");
    });
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
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    showDashboard();
}

/* =========================================
   3. DASHBOARD LOGIC (Stats & History)
   ========================================= */

async function loadUserDashboard(forceRefresh = false) {
    if (!currentUser) return;

    const historyContainer = document.getElementById('history-container');
    
    if (!forceRefresh && dashboardDataLoaded && userHistory.length > 0) {
        renderDashboardUI();
        return;
    }

    if (historyContainer.children.length === 0) {
        historyContainer.innerHTML = '<div class="text-center w-100 py-5"><div class="spinner-border text-primary"></div></div>';
    }

    try {
        const snapshot = await db.collection('results')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(20) 
            .get();

        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        userHistory = results;
        dashboardDataLoaded = true;
        
        renderDashboardUI();

    } catch (error) {
        console.error("Error loading dashboard:", error);
        historyContainer.innerHTML = `<p class="text-danger text-center">Failed to load history.</p>`;
    }
}

function renderDashboardUI() {
    const historyContainer = document.getElementById('history-container');
    const results = userHistory;

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

    renderPerformanceChart(results);

    historyContainer.innerHTML = '';
    if (results.length === 0) {
        historyContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No tests taken yet.</div>`;
        return;
    }

    results.forEach(res => {
        let dateStr = 'Just now';
        if (res.timestamp) {
             if (res.timestamp.toDate) {
                 dateStr = new Date(res.timestamp.toDate()).toLocaleDateString();
             } else {
                 dateStr = new Date(res.timestamp).toLocaleDateString();
             }
        }

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
                        <small class="text-muted">${res.subject} • ${dateStr}</small>
                    </div>
                    <div class="text-end ms-2">
                        <div class="fs-4 fw-bold ${res.scorePercent >= 50 ? 'text-success' : 'text-danger'}">
                            ${res.score.toFixed(1)} <span class="fs-6 text-muted">/ ${res.totalMarks}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary-custom px-4 shadow w-100 review-btn">👁 Review Performance</button>
                </div>
            </div>
        `;

        card.querySelector('.review-btn').onclick = () => reviewTest(res);
        historyContainer.appendChild(card);
    });
}

function renderPerformanceChart(data) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    if (performanceChartInstance) {
        performanceChartInstance.destroy();
    }

    const chartData = [...data].reverse(); 
    
    const labels = chartData.map(item => {
        if (item.timestamp && item.timestamp.toDate) {
            return new Date(item.timestamp.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return 'Recently';
    });
    
    const scores = chartData.map(item => item.scorePercent);
    const subjects = chartData.map(item => item.subject);
    const chapters = chartData.map(item => item.chapterName);

    const canvasContext = ctx.getContext('2d');
    const gradientFill = canvasContext.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(37, 99, 235, 0.4)'); 
    gradientFill.addColorStop(1, 'rgba(37, 99, 235, 0.0)'); 

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#9ca3af' : '#6b7280'; 
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipText = isDark ? '#f3f4f6' : '#1f2937';
    const tooltipBorder = isDark ? '#334155' : '#e5e7eb';

    performanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Accuracy',
                data: scores,
                borderColor: '#2563eb', 
                borderWidth: 3,
                backgroundColor: gradientFill,
                fill: true,
                tension: 0.4, 
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#f59e0b', 
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipText,
                    bodyColor: tooltipText,
                    borderColor: tooltipBorder,
                    borderWidth: 1,
                    titleFont: { size: 13, weight: 'bold' },
                    padding: 12,
                    displayColors: false, 
                    callbacks: {
                        title: (tooltipItems) => {
                            const index = tooltipItems[0].dataIndex;
                            return subjects[index]; 
                        },
                        label: (context) => {
                            const index = context.dataIndex;
                            return [
                                `📖 ${chapters[index]}`,
                                `📅 ${labels[index]}`,
                                `🎯 Score: ${context.raw}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }, 
                    ticks: {
                        color: textColor,
                        font: { size: 11 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6 
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: gridColor,
                        borderDash: [5, 5] 
                    },
                    ticks: {
                        color: textColor,
                        font: { size: 11 },
                        stepSize: 20,
                        callback: function(value) { return value + '%' }
                    }
                }
            }
        }
    });
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

    container.innerHTML = `
        <button class="btn btn-primary-custom px-4 shadow" onclick="showDashboard()">← Back to Dashboard</button>
        <div class="text-center mb-4">
            <h4 class="fw-bold section-title">Select a Subject</h4>
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
    container.innerHTML = `
        <button class="btn btn-primary-custom px-4 shadow" onclick="renderSubjects()">← Back to Subjects</button>
        <div class="text-center mb-4">
            <h4 class="fw-bold section-title">Chapters: ${subjectKey}</h4>
            <div class="title-underline mx-auto"></div>
        </div>
        <div class="row" id="chapters-row"></div>
    `;

    const row = document.getElementById('chapters-row');
    const chapters = allQuizData[subjectKey];

    Object.keys(chapters).forEach(chapId => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const hasTaken = userHistory && userHistory.some(h => h.chapterId === (subjectKey.replace(/\s+/g, '_') + "_" + chapId));
        const btnText = hasTaken ? "↻ Retake Test" : "🚀 Start Test";
        
        col.innerHTML = `
            <div class="card chapter-card h-100 border-0">
                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-dark">${chapId}</h5>
                    
                    <button class="btn btn-primary-custom w-100 mt-auto action-btn">
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
   5. QUIZ CORE
   ========================================= */

function getCorrectIndex(question) {
    if (typeof question.correctAnswer === 'number') return question.correctAnswer;
    const optionIndex = question.options.indexOf(question.correctAnswer);
    if (optionIndex !== -1) return optionIndex;
    if (!isNaN(question.correctAnswer)) return Number(question.correctAnswer);
    return -1;
}

// Updated loadQuiz to be async for Lazy Loading
async function loadQuiz(subjectKey, chapterId, chapterName, reviewMode = false, pastData = null) {
    currentSubject = subjectKey;
    // Unique Chapter ID to prevent cross-subject collisions
    currentChapterId = subjectKey.replace(/\s+/g, '_') + "_" + chapterId; 
    currentChapterName = decodeURIComponent(chapterName);

    hideAllSections();
    document.getElementById('quiz-section').style.display = 'block';

    const quizContent = document.getElementById('quiz-content');
    
    // Show loading state while fetching questions
    quizContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading Questions...</p>
        </div>`;

    try {
        // LAZY LOADING LOGIC
        if (quizDataCache[currentChapterId]) {
            currentQuizData = quizDataCache[currentChapterId];
        } else {
            const doc = await db.collection('quizzes').doc(currentChapterId).get();
            if (!doc.exists) {
                toastr.error("Quiz questions not found in database!");
                showDashboard();
                return;
            }
            currentQuizData = doc.data().questions;
            quizDataCache[currentChapterId] = currentQuizData; // Store in cache
        }

        currentQuestionIndex = 0;
        isReviewMode = reviewMode;
        userAnswers = {};
        quizSubmitted = false;
        
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = '';
            timerDisplay.classList.remove('text-danger');
        }
        if (quizTimerInterval) clearInterval(quizTimerInterval);

        if (reviewMode && pastData) {
            userAnswers = pastData.userAnswers || {};
            quizSubmitted = true;
        }

        const quizNav = document.getElementById('quiz-nav');
        
        if (isReviewMode) {
            quizContent.parentElement.className = 'col-12';
            quizNav.parentElement.style.display = 'none'; 
            renderReviewMode(pastData); 
        } else {
            quizContent.parentElement.className = 'col-lg-8 mb-4';
            quizNav.parentElement.style.display = 'block'; 
            
            renderQuizLayout(currentChapterName);
            renderQuestion();
            renderNav();
            startTimer(currentQuizData.length);
        }
    } catch (error) {
        console.error("Firebase fetch error:", error);
        toastr.error("Failed to load questions. Please check connection.");
        showDashboard();
    }
}

function reviewTest(resultObj) {
    // Determine the original sub-chapter key from the combined ID
    const subjectPrefix = resultObj.subject.replace(/\s+/g, '_') + "_";
    const originalChapId = resultObj.chapterId.replace(subjectPrefix, "");
    loadQuiz(resultObj.subject, originalChapId, resultObj.chapterName, true, resultObj);
}

/* =========================================
   REVIEW MODE LOGIC, LEADERBOARD & STATS
   ========================================= */

async function getGlobalStats(chapterId) {
    if (globalStatsCache[chapterId]) {
        return globalStatsCache[chapterId];
    }
    try {
        const doc = await db.collection('chapter_stats').doc(chapterId).get();
        if (!doc.exists) return null;
        const data = doc.data();
        const stats = {
            avg: data.average || 0,
            highest: data.highestScore || 0,
            totalAttempts: data.totalAttempts || 0,
            allScores: data.allScores || [],
            leaderboard: data.leaderboard || [],
            correctCounts: data.correctCounts || [],
            attemptedCounts: data.attemptedCounts || [] 
        };
        globalStatsCache[chapterId] = stats;
        return stats;
    } catch (e) {
        console.error("Error fetching global stats", e);
        return null;
    }
}

async function loadLeaderboard(chapterId) {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    const stats = await getGlobalStats(chapterId);
    if (stats && stats.leaderboard) {
        renderLeaderboardHTML(container, stats.leaderboard);
    } else {
        renderLeaderboardHTML(container, []);
    }
}

function renderLeaderboardHTML(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="alert alert-light border text-center text-muted small">No other attempts yet. Be the first!</div>';
        return;
    }

    let rows = '';
    let rank = 1;
    
    data.forEach(entry => {
        const email = entry.userEmail || 'Guest';
        const rawName = email.split('@')[0];
        const displayName = rawName.length > 3 ? rawName.substring(0, 3) + '***' : rawName;
        const isMe = currentUser && entry.userEmail === currentUser.email;

        rows += `
            <tr class="${isMe ? 'table-warning fw-bold' : ''}">
                <td class="ps-3 text-secondary">#${rank++}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style="width:24px; height:24px; font-size:10px;">
                            ${rawName.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-dark">${displayName}</span>
                        ${isMe ? '<span class="badge bg-warning text-dark ms-2" style="font-size:0.6rem">YOU</span>' : ''}
                    </div>
                </td>
                <td class="text-end pe-3">
                    <span class="badge ${entry.scorePercent >= 80 ? 'bg-success' : 'bg-primary'}">${entry.scorePercent}%</span>
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

async function renderReviewMode(resultData) {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    
    currentQuizData.forEach((q, i) => {
        const uAns = userAnswers[i];
        const correctIndex = getCorrectIndex(q);
        
        if (!uAns) {
            unattempted++;
        } else if (uAns.answer === correctIndex) {
            correct++;
        } else {
            incorrect++;
        }
    });

    const totalQuestions = currentQuizData.length;
    const score = resultData ? resultData.score : ((correct * 2) - (incorrect * 0.66)).toFixed(2);
    const totalMarks = totalQuestions * 2;

    const content = document.getElementById('quiz-content');
    
    content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-bottom pb-3">
            <div>
                <h4 class="fw-bold text-primary m-0">${currentChapterName}</h4>
                <span class="badge bg-secondary">Review Mode</span>
            </div>
            <div class="btn-group shadow-sm" role="group">
                <button class="btn btn-outline-primary active" id="btn-all" onclick="filterReview('all', this)">All</button>
                <button class="btn btn-outline-success" id="btn-correct" onclick="filterReview('correct', this)">Correct</button>
                <button class="btn btn-outline-danger" id="btn-incorrect" onclick="filterReview('incorrect', this)">Incorrect</button>
                <button class="btn btn-outline-secondary" id="btn-unattempted" onclick="filterReview('unattempted', this)">Unattempted</button>
            </div>
        </div>

        <div class="card mb-4 border-0 shadow-sm card">
            <div class="card-body">
                <h5 class="fw-bold card-title mb-3">📊 Your Performance Index</h5>
                
                <div class="row g-3 text-center mb-4">
                    <div class="col-6 col-md">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-primary">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Total Qs</h6>
                            <h3 class="fw-bold text-dark m-0">${totalQuestions}</h3>
                        </div>
                    </div>
                    <div class="col-6 col-md">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-success">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Correct</h6>
                            <h3 class="fw-bold text-success m-0">${correct}</h3>
                        </div>
                    </div>
                    <div class="col-6 col-md">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-danger">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Incorrect</h6>
                            <h3 class="fw-bold text-danger m-0">${incorrect}</h3>
                        </div>
                    </div>
                    <div class="col-6 col-md">
                        <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-secondary">
                            <h6 class="text-uppercase text-muted small fw-bold mb-1">Skipped</h6>
                            <h3 class="fw-bold text-secondary m-0">${unattempted}</h3>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="p-3 bg-primary text-white rounded shadow-sm">
                            <h6 class="text-white-50 text-uppercase small fw-bold mb-1">Score</h6>
                            <h3 class="fw-bold m-0">${score} <span class="fs-6 text-white-50">/ ${totalMarks}</span></h3>
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
            </div>
        </div>
        
        <div id="review-container"></div>
        
        <div class="text-center mt-5">
            <button class="btn btn-primary-custom px-5 shadow py-2" onclick="showDashboard()">← Back to Dashboard</button>
        </div>
    `;

    currentReviewStats = await getGlobalStats(currentChapterId);

    filterReview('all', document.getElementById('btn-all'));

    loadLeaderboard(currentChapterId);

    const stats = currentReviewStats;
    const container = document.getElementById('global-stats-container');
    
    if (!stats) {
        container.innerHTML = `<div class="col-12 text-center text-muted">Not enough data for global comparison yet.</div>`;
        return;
    }

    const myScore = resultData ? resultData.scorePercent : 0;
    
    const betterThan = stats.allScores.filter(s => s < myScore).length;
    const percentile = stats.totalAttempts > 0 
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

    const ctx = document.getElementById('comparisonChart');
    if (comparisonChartInstance) comparisonChartInstance.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#666';

    comparisonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Global Avg', 'Your Score', 'Topper'],
            datasets: [{
                label: 'Score (%)',
                data: [stats.avg.toFixed(1), myScore.toFixed(1), stats.highest.toFixed(1)],
                backgroundColor: [
                    'rgba(108, 117, 125, 0.5)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgba(108, 117, 125, 1)',
                    'rgba(30, 58, 138, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { display: false },
                    ticks: { color: textColor }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            }
        }
    });
}

function filterReview(filterType, btnElement) {
    const buttons = document.querySelectorAll('.btn-group .btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderReviewQuestions(filterType);
}

function renderReviewQuestions(filterType) {
    const container = document.getElementById('review-container');
    container.innerHTML = '';
    
    let visibleCount = 0;

    currentQuizData.forEach((question, index) => {
        const correctIndex = getCorrectIndex(question);
        const uAns = userAnswers[index];
        
        let status = 'unattempted';
        if (uAns) {
            status = (uAns.answer === correctIndex) ? 'correct' : 'incorrect';
        }

        if (filterType !== 'all' && status !== filterType) return;
        visibleCount++;

        let badgeHtml = '';
        let borderClass = '';
        
        if (status === 'correct') {
            badgeHtml = '<span class="badge bg-success mb-2">Correct</span>';
            borderClass = 'border-success';
        } else if (status === 'incorrect') {
            badgeHtml = '<span class="badge bg-danger mb-2">Incorrect</span>';
            borderClass = 'border-danger';
        } else {
            badgeHtml = '<span class="badge bg-secondary mb-2">Unattempted</span>';
            borderClass = 'border-secondary';
        }

        let statsHtml = '';
        if (currentReviewStats && currentReviewStats.totalAttempts > 0) {
            const total = currentReviewStats.totalAttempts;
            const correctCount = (currentReviewStats.correctCounts && currentReviewStats.correctCounts[index]) || 0;
            const attemptedCount = (currentReviewStats.attemptedCounts && currentReviewStats.attemptedCounts[index]) || 0;
            
            const pCorrect = Math.round((correctCount / total) * 100);
            const pIncorrect = Math.round(((attemptedCount - correctCount) / total) * 100);
            const pUnattempted = 100 - pCorrect - pIncorrect;
            
            const textColorClass = pCorrect >= 50 ? 'text-success' : 'text-danger';

            statsHtml = `
                <div class="mt-2 mb-4 p-3 bg-light bg-opacity-75 rounded-3 border">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small fw-bold text-uppercase text-secondary" style="letter-spacing: 0.5px;">👥 Community Stats</span>
                        <span class="fw-bold ${textColorClass}">${pCorrect}% Correct</span>
                    </div>
                    <div class="progress shadow-sm" style="height: 40px;">
                        <div class="progress-bar bg-success border" role="progressbar" style="width: ${pCorrect}%" 
                             data-bs-toggle="tooltip" data-bs-placement="top"
                             aria-valuenow="${pCorrect}" aria-valuemin="0" aria-valuemax="100"
                             title="${pCorrect}% Answered Correctly">
                        </div>
                        <div class="progress-bar bg-danger bg-opacity-75 border" role="progressbar" style="width: ${pIncorrect}%" 
                             data-bs-toggle="tooltip" data-bs-placement="top"
                             aria-valuenow="${pIncorrect}" aria-valuemin="0" aria-valuemax="100"
                             title="${pIncorrect}% Answered Incorrectly">
                        </div>
                        <div class="progress-bar bg-secondary bg-opacity-25 border" role="progressbar" style="width: ${pUnattempted}%" 
                             data-bs-toggle="tooltip" data-bs-placement="top"
                             aria-valuenow="${pUnattempted}" aria-valuemin="0" aria-valuemax="100"
                             title="${pUnattempted}% Skipped this Question">
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-2 text-muted" style="font-size: 0.75rem;">
                        <span>${correctCount} students got this right</span>
                        <span>Based on ${total} attempts</span>
                    </div>
                </div>
            `;
        }

        let optionsHtml = '';
        question.options.forEach((opt, optIdx) => {
            let optionClass = 'option p-3 mb-2 border rounded';
            let icon = '';

            if (optIdx === correctIndex) {
                optionClass = 'option p-3 mb-2 border rounded bg-success-subtle border-success fw-bold text-success';
                icon = '✅';
            } else if (uAns && uAns.answer === optIdx && status === 'incorrect') {
                optionClass = 'option p-3 mb-2 border rounded bg-danger-subtle border-danger text-danger';
                icon = '❌';
            }

            optionsHtml += `
                <div class="${optionClass}">
                    ${icon} <span class="ms-1">${opt}</span>
                </div>
            `;
        });

        const card = document.createElement('div');
        card.className = `card mb-4 shadow-sm border-0 border-start border-5 ${borderClass}`;
        card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="text-muted fw-bold m-0">Question ${index + 1}</h6>
                    ${badgeHtml}
                </div>
                
                ${statsHtml} <p class="fs-5 fw-medium mb-3">${question.text ? question.text.replace(/\n/g, '<br>') : ''}</p>
                <div class="mb-3">${optionsHtml}</div>
                <div class="explanation mt-3 shadow-sm">
                    <strong>💡 Explanation:</strong>
                    <div class="mt-1 small">${question.explanation || "No explanation provided."}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = container.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    if (visibleCount === 0) {
        container.innerHTML = `<div class="alert alert-info text-center">No questions found for this filter.</div>`;
    }
}

/* =========================================
   6. TIMER & NAVIGATION
   ========================================= */

function startTimer(numQuestions) {
    let timeLeft = Math.floor(numQuestions * 1.8 * 60); 
    const display = document.getElementById('timer-display');
    updateTimerDisplay(display, timeLeft);

    quizTimerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(display, timeLeft);

        if (timeLeft <= 0) {
            clearInterval(quizTimerInterval);
            toastr.warning("Time's up! Submitting test...");
            submitAll(true);
        }
    }, 1000);
}

function updateTimerDisplay(element, seconds) {
    if(!element) return;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    element.textContent = `⏱ ${m}:${s < 10 ? '0' : ''}${s}`;
    if (seconds < 60) element.classList.add('text-danger');
    else element.classList.remove('text-danger');
}

function renderQuizLayout(title) {
    document.getElementById('quiz-content').innerHTML = `
        <h4 class="text-center mb-4 fw-bold text-primary">${title}</h4>
        <div id="question-container"></div>
        <div class="d-flex justify-content-between mt-4">
            <button id="prev-btn" class="btn btn-primary-custom px-4 rounded-pill">Previous</button>
            <button id="clear-btn" class="btn btn-outline-warning px-4 rounded-pill">Clear</button>
            <button id="next-btn" class="btn btn-primary-custom px-4 rounded-pill">Next</button>
        </div>
        <div id="question-feedback" class="mt-3 text-center"></div>
        <div id="result" class="mt-4 text-center"></div>
    `;

    document.getElementById('quiz-nav').innerHTML = `
        <div class="nav-header">Question Palette</div>
        <div id="nav-container" class="nav-grid"></div>
        <button id="final-submit-btn" class="btn btn-success w-100 mt-4 rounded-pill py-2 fw-bold">Submit Test</button>
    `;

    document.getElementById('prev-btn').addEventListener('click', () => navigateQuestions(-1));
    document.getElementById('next-btn').addEventListener('click', () => navigateQuestions(1));
    document.getElementById('clear-btn').addEventListener('click', clearSelection);
    document.getElementById('final-submit-btn').addEventListener('click', () => submitAll(false));
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

/* =========================================
   7. SUBMIT & STATISTICS
   ========================================= */

function submitAll(forceSubmit = false) {
    if (!forceSubmit && !confirm("Are you sure you want to submit?")) return;

    if (quizTimerInterval) clearInterval(quizTimerInterval);

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

    const leaderboardEntry = {
        userEmail: currentUser ? currentUser.email : 'guest',
        scorePercent: parseFloat(percentage),
        score: finalScore,
        timestamp: new Date().toISOString() 
    };

    const resultObject = {
        userId: currentUser ? currentUser.uid : 'guest',
        userEmail: currentUser ? currentUser.email : 'guest',
        subject: currentSubject,
        chapterId: currentChapterId,
        chapterName: currentChapterName,
        score: finalScore,
        totalMarks: totalMarks,
        scorePercent: parseFloat(percentage),
        userAnswers: userAnswers,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    };

    document.getElementById('result').innerHTML = `
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

    const actionsDiv = document.getElementById('result-actions');
    const reviewBtn = document.createElement('button');
    reviewBtn.className = "btn btn-primary-custom px-4 shadow";
    reviewBtn.innerHTML = "👁 Review Performance";
    reviewBtn.onclick = () => {
        const originalChapId = currentChapterId.split('_').pop();
        loadQuiz(currentSubject, originalChapId, encodeURIComponent(currentChapterName), true, resultObject);
    };
    actionsDiv.appendChild(reviewBtn);

    const submitBtn = document.getElementById('final-submit-btn');
    if(submitBtn) submitBtn.style.display = 'none';
    
    const clearBtn = document.getElementById('clear-btn');
    if(clearBtn) clearBtn.disabled = true;
    
    renderQuestion();
    updateNavHighlights();

    if (currentUser) {
        db.collection('results').add({
            ...resultObject
        }).then(async () => {
            // FIX: Local update before clearing cache
            userHistory.unshift(resultObject);
            if (userHistory.length > 20) userHistory.pop();
            dashboardDataLoaded = true;

            delete globalStatsCache[currentChapterId];
            delete leaderboardCache[currentChapterId];
            
            const statsRef = db.collection('chapter_stats').doc(currentChapterId);
            try {
                await db.runTransaction(async (transaction) => {
                    const sfDoc = await transaction.get(statsRef);
                    const newScore = parseFloat(percentage);

                    if (!sfDoc.exists) {
                        const initCorrectCounts = currentQuizData.map((q, i) => {
                             const uAns = userAnswers[i];
                             const cIdx = getCorrectIndex(q);
                             return (uAns && uAns.answer === cIdx) ? 1 : 0;
                        });
                        
                        const initAttemptedCounts = currentQuizData.map((q, i) => {
                             const uAns = userAnswers[i];
                             return uAns ? 1 : 0;
                        });

                        transaction.set(statsRef, {
                            totalScore: newScore,
                            totalAttempts: 1,
                            average: newScore,
                            highestScore: newScore,
                            allScores: [newScore],
                            leaderboard: [leaderboardEntry],
                            correctCounts: initCorrectCounts, 
                            attemptedCounts: initAttemptedCounts 
                        });
                    } else {
                        const data = sfDoc.data();
                        const newTotalScore = (data.totalScore || 0) + newScore;
                        const newTotalAttempts = (data.totalAttempts || 0) + 1;
                        const newAvg = newTotalScore / newTotalAttempts;
                        const newHighest = Math.max((data.highestScore || 0), newScore);
                        const newAllScores = [...(data.allScores || []), newScore];

                        let currentLeaderboard = data.leaderboard || [];
                        currentLeaderboard.push(leaderboardEntry);
                        currentLeaderboard.sort((a, b) => b.scorePercent - a.scorePercent);
                        if (currentLeaderboard.length > 10) currentLeaderboard = currentLeaderboard.slice(0, 10);

                        let currentCorrectCounts = data.correctCounts || [];
                        while(currentCorrectCounts.length < currentQuizData.length) currentCorrectCounts.push(0);
                        
                        let currentAttemptedCounts = data.attemptedCounts || [];
                        while(currentAttemptedCounts.length < currentQuizData.length) currentAttemptedCounts.push(0);

                        currentQuizData.forEach((q, i) => {
                             const uAns = userAnswers[i];
                             const cIdx = getCorrectIndex(q);
                             if (uAns) {
                                 currentAttemptedCounts[i]++; 
                                 if (uAns.answer === cIdx) currentCorrectCounts[i]++; 
                             }
                        });

                        transaction.update(statsRef, {
                            totalScore: newTotalScore,
                            totalAttempts: newTotalAttempts,
                            average: newAvg,
                            highestScore: newHighest,
                            allScores: newAllScores,
                            leaderboard: currentLeaderboard,
                            correctCounts: currentCorrectCounts,
                            attemptedCounts: currentAttemptedCounts 
                        });
                    }
                });
                
                // FIX: Toast moved inside success block of transaction
                toastr.success("Result and stats saved!");
                
            } catch (e) {
                console.error("Stats update failed:", e);
                toastr.warning("Result saved, but stats failed to update.");
            }
            
            const stats = await getGlobalStats(currentChapterId);
            if (stats) {
                const betterThan = stats.allScores.filter(s => s < parseFloat(percentage)).length;
                const percentile = stats.totalAttempts > 0 
                    ? ((betterThan / stats.totalAttempts) * 100).toFixed(0) 
                    : 0;
                
                const statsDiv = document.getElementById('stats-loading');
                if (statsDiv) {
                    statsDiv.innerHTML = `<strong>🌍 Global Index:</strong> You performed better than <strong>${percentile}%</strong> of users. (Avg: ${stats.avg.toFixed(1)}%)`;
                }
            }

        }).catch(err => {
            console.error("Save error:", err);
            toastr.error("Could not save result.");
        });
    }
}

/* =========================================
   8. THEME MANAGEMENT
   ========================================= */

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        btn.classList.toggle('btn-light', theme === 'dark');
        btn.classList.toggle('btn-outline-light', theme === 'light');
    }

    if (typeof Chart !== 'undefined') {
        const textColor = theme === 'dark' ? '#e5e7eb' : '#666';
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = theme === 'dark' ? '#374151' : '#e5e7eb';
        
        if (performanceChartInstance) {
            performanceChartInstance.options.scales.y.ticks.color = textColor;
            performanceChartInstance.update();
        }
        if (comparisonChartInstance) {
            comparisonChartInstance.options.scales.x.ticks.color = textColor;
            comparisonChartInstance.options.scales.y.ticks.color = textColor;
            comparisonChartInstance.update();
        }
    }
}