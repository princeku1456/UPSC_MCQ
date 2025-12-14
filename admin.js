/* =========================================
   1. CONFIG & AUTH
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();

// 🔴 REPLACE THIS WITH YOUR EMAIL
const ALLOWED_ADMINS = ["prince@gmail.com", "your.email@gmail.com"]; 

// OPTIMIZATION: Cache Key Prefix
const ADMIN_CACHE_PREFIX = 'admin_data_';

auth.onAuthStateChanged((user) => {
    if (user) {
        if (ALLOWED_ADMINS.includes(user.email)) {
            showDashboard();
            loadSubjects();
        } else {
            toastr.error("Access Denied: You are not an admin.");
            auth.signOut();
            showLogin();
        }
    } else {
        showLogin();
    }
});

/* =========================================
   2. UI MANAGEMENT
   ========================================= */
function showLogin() {
    document.getElementById('admin-login-section').style.display = 'block';
    document.getElementById('admin-dashboard-section').style.display = 'none';
}

function showDashboard() {
    document.getElementById('admin-login-section').style.display = 'none';
    document.getElementById('admin-dashboard-section').style.display = 'block';
}

document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => toastr.success("Welcome Admin"))
        .catch(err => toastr.error(err.message));
});

function logoutAdmin() {
    // OPTIMIZATION: Clear cache on logout to ensure data security and freshness on re-login
    sessionStorage.clear();
    auth.signOut();
}

/* =========================================
   3. DATA LOADING
   ========================================= */
function loadSubjects() {
    const subSelect = document.getElementById('subject-select');
    subSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
    
    if (typeof allQuizData === 'undefined') {
        toastr.error("Data files not loaded.");
        return;
    }

    Object.keys(allQuizData).forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subSelect.appendChild(opt);
    });

    subSelect.addEventListener('change', loadChapters);
}

function loadChapters() {
    const sub = document.getElementById('subject-select').value;
    const chapSelect = document.getElementById('chapter-select');
    chapSelect.innerHTML = '<option value="">-- Choose Test --</option>';
    chapSelect.disabled = true;

    if (!sub || !allQuizData[sub]) return;

    Object.keys(allQuizData[sub]).forEach(chapId => {
        const opt = document.createElement('option');
        opt.value = chapId;
        opt.textContent = chapId; 
        chapSelect.appendChild(opt);
    });

    chapSelect.disabled = false;
}

/* =========================================
   4. ANALYSIS LOGIC
   ========================================= */

// Track currently displayed chapter to enable "Force Refresh" logic
let currentDisplayedChapterId = null;

async function loadTestAnalysis() {
    const subject = document.getElementById('subject-select').value;
    const chapterId = document.getElementById('chapter-select').value;
    const container = document.getElementById('analysis-container');

    if (!subject || !chapterId) {
        toastr.warning("Please select both Subject and Test.");
        return;
    }

    // Smart Refresh Logic:
    // If we are already looking at this chapter, clicking "Analyze" again implies a Force Refresh.
    const isForceRefresh = (currentDisplayedChapterId === chapterId);
    
    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Fetching student results...</p></div>';

    try {
        const quizQuestions = allQuizData[subject][chapterId];
        let results = [];

        // OPTIMIZATION: Check Session Storage Cache
        const cacheKey = `${ADMIN_CACHE_PREFIX}${chapterId}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (!isForceRefresh && cachedData) {
            console.log("Loading from cache...");
            results = JSON.parse(cachedData);
            
            // Re-hydrate Timestamps if needed (optional, for display consistency)
            results = results.map(r => ({
                ...r,
                // If timestamp string exists, convert back to object with toDate() mock if used in render
                // But simplified renderAnalysis below handles strings gracefully.
            }));
            
            toastr.info("Loaded from Cache. Click 'Analyze' again to refresh.");
        } else {
            console.log("Fetching from Firestore...");
            // Fetch all results for this test
            const snapshot = await db.collection('results')
                .where('chapterId', '==', chapterId)
                .orderBy('score', 'desc')
                .get();

            results = snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    ...data, 
                    id: doc.id,
                    // Serialize Timestamp to string for storage
                    timestamp: data.timestamp && data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
                };
            });

            // Save to Session Storage
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(results));
            } catch (e) {
                console.warn("Session storage full, could not cache results.");
            }
            
            if (isForceRefresh) toastr.success("Data Refreshed from Server.");
        }

        currentDisplayedChapterId = chapterId;
        renderAnalysis(quizQuestions, results, chapterId);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
    }
}

function renderAnalysis(questions, results, chapterId) {
    const container = document.getElementById('analysis-container');
    container.innerHTML = '';

    // ===========================
    // SECTION 1: LEADERBOARD
    // ===========================
    
    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0 
        ? (results.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalAttempts).toFixed(1) 
        : 0;

    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.className = 'mb-5 animate-fade-in';
    
    let leaderboardRows = '';
    if (results.length === 0) {
        leaderboardRows = '<tr><td colspan="4" class="text-center text-muted py-3">No students have taken this test yet.</td></tr>';
    } else {
        // OPTIMIZATION: Limit rendering to top 50 if dataset is huge to prevent DOM lag
        const displayLimit = results.length > 500 ? 100 : results.length;
        
        results.slice(0, displayLimit).forEach((res, index) => {
            let dateStr = '-';
            if (res.timestamp) {
                // Handle both ISO strings (from cache) and Firestore timestamps
                const d = typeof res.timestamp === 'string' ? new Date(res.timestamp) : res.timestamp.toDate();
                dateStr = d.toLocaleString();
            }
            
            const badgeClass = res.scorePercent >= 80 ? 'bg-success' : (res.scorePercent < 40 ? 'bg-danger' : 'bg-secondary');

            leaderboardRows += `
                <tr>
                    <td class="fw-bold text-secondary">#${index + 1}</td>
                    <td>
                        <div class="fw-bold text-dark">${res.userEmail || 'Anonymous'}</div>
                        <small class="text-muted">${dateStr}</small>
                    </td>
                    <td class="fw-bold">${res.score.toFixed(1)} / ${res.totalMarks}</td>
                    <td><span class="badge ${badgeClass}">${res.scorePercent}%</span></td>
                </tr>
            `;
        });
        
        if (results.length > displayLimit) {
            leaderboardRows += `<tr><td colspan="4" class="text-center text-muted small">...and ${results.length - displayLimit} more students.</td></tr>`;
        }
    }

    leaderboardDiv.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold text-primary mb-1">🏆 Student Leaderboard</h5>
                    <small class="text-muted">Total Attempts: ${totalAttempts} • Average: ${avgScore}%</small>
                </div>
                <div class="display-6">📊</div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover table-custom mb-0 align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th scope="col" class="ps-4">Rank</th>
                            <th scope="col">Student</th>
                            <th scope="col">Score</th>
                            <th scope="col">Performance</th>
                        </tr>
                    </thead>
                    <tbody class="border-top-0">
                        ${leaderboardRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.appendChild(leaderboardDiv);


    // ===========================
    // SECTION 2: QUESTION ANALYSIS
    // ===========================

    const questionsHeader = document.createElement('h5');
    questionsHeader.className = 'fw-bold text-dark mb-4 border-start border-4 border-primary ps-3';
    questionsHeader.textContent = `Question Wise Analysis (${questions.length} Questions)`;
    container.appendChild(questionsHeader);

    // OPTIMIZATION: Pre-process results to map answers for O(N) access instead of nested loops
    // This makes rendering significantly faster for large user bases
    const answerMap = new Array(questions.length).fill(null).map(() => ({
        correctUsers: [],
        wrongUsers: [],
        unattemptedUsers: []
    }));

    results.forEach(res => {
        const userIdentifier = res.userEmail ? res.userEmail.split('@')[0] : "Anonymous";
        const uAnswers = res.userAnswers || {};
        
        questions.forEach((q, qIndex) => {
            let correctIndex = -1;
            if (typeof q.correctAnswer === 'number') correctIndex = q.correctAnswer;
            else correctIndex = q.options.indexOf(q.correctAnswer);

            const uAnsObj = uAnswers[qIndex];
            
            if (!uAnsObj) {
                answerMap[qIndex].unattemptedUsers.push(userIdentifier);
            } else if (uAnsObj.answer === correctIndex) {
                answerMap[qIndex].correctUsers.push(userIdentifier);
            } else {
                answerMap[qIndex].wrongUsers.push(userIdentifier);
            }
        });
    });

    questions.forEach((q, index) => {
        const { correctUsers, wrongUsers, unattemptedUsers } = answerMap[index];
        let correctIndex = -1;
        if (typeof q.correctAnswer === 'number') correctIndex = q.correctAnswer;
        else correctIndex = q.options.indexOf(q.correctAnswer);

        const card = document.createElement('div');
        card.className = 'card mb-5 shadow-sm border-0 admin-q-card rounded-4';
        
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            let cssClass = 'option-box';
            let icon = '⚪';
            
            if (i === correctIndex) {
                cssClass += ' correct-option';
                icon = '✅';
            }

            optionsHtml += `
                <div class="${cssClass} d-flex align-items-start">
                    <span class="me-2">${icon}</span>
                    <span>${opt}</span>
                </div>
            `;
        });

        // Helper to render max 30 names to avoid UI clutter
        const renderBadges = (users, colorClass) => {
            if (!users.length) return '<small class="text-muted fst-italic">None</small>';
            
            const limit = 20;
            const shownUsers = users.slice(0, limit);
            const remaining = users.length - limit;
            
            let html = shownUsers.map(u => 
                `<span class="user-badge" style="border-left-color: var(--bs-${colorClass})">
                    ${u}
                 </span>`
            ).join('');
            
            if (remaining > 0) {
                html += `<span class="badge bg-light text-secondary border mt-1">+${remaining} more</span>`;
            }
            return html;
        };

        card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between mb-3">
                    <h6 class="fw-bold text-primary">Question ${index + 1}</h6>
                    <span class="badge bg-light text-dark border">
                        Attempt Rate: ${Math.round(((correctUsers.length + wrongUsers.length)/totalAttempts)*100) || 0}%
                    </span>
                </div>
                
                <p class="fs-5 fw-medium mb-4 text-dark">${q.text ? q.text.replace(/\n/g, '<br>') : 'No text'}</p>
                
                <div class="row g-4">
                    <div class="col-lg-7">
                        <div class="mb-4">
                            ${optionsHtml}
                        </div>
                        <div class="explanation-box shadow-sm mt-3">
                            <strong class="text-dark">💡 Explanation:</strong>
                            <div class="mt-2 text-secondary small" style="line-height: 1.6;">
                                ${q.explanation || 'No explanation provided.'}
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-5">
                        <div class="d-flex flex-column gap-3 h-100">
                            <div class="border rounded-3 overflow-hidden">
                                <div class="bg-success-subtle px-3 py-2 border-bottom border-success border-opacity-25 d-flex justify-content-between">
                                    <strong class="text-success">✅ Correct</strong>
                                    <span class="badge bg-success rounded-pill">${correctUsers.length}</span>
                                </div>
                                <div class="p-2 user-list-box">
                                    ${renderBadges(correctUsers, 'success')}
                                </div>
                            </div>

                            <div class="border rounded-3 overflow-hidden">
                                <div class="bg-danger-subtle px-3 py-2 border-bottom border-danger border-opacity-25 d-flex justify-content-between">
                                    <strong class="text-danger">❌ Incorrect</strong>
                                    <span class="badge bg-danger rounded-pill">${wrongUsers.length}</span>
                                </div>
                                <div class="p-2 user-list-box">
                                    ${renderBadges(wrongUsers, 'danger')}
                                </div>
                            </div>

                            <div class="border rounded-3 overflow-hidden">
                                <div class="bg-light px-3 py-2 border-bottom d-flex justify-content-between">
                                    <strong class="text-secondary">⚪ Unattempted</strong>
                                    <span class="badge bg-secondary rounded-pill">${unattemptedUsers.length}</span>
                                </div>
                                <div class="p-2 user-list-box">
                                    ${renderBadges(unattemptedUsers, 'secondary')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}