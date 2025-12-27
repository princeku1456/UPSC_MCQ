/* =========================================
   1. CONFIG & AUTH
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('admins').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    toastr.success("Admin verified successfully");
                    showDashboard();
                    loadSubjects();
                } else {
                    throw new Error("Access Denied: You do not have admin privileges.");
                }
            })
            .catch((error) => {
                console.error("Admin Auth Failed:", error);
                toastr.error("Access Denied: Unauthorized.");
                auth.signOut();
                showLogin();
            });
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
    auth.signOut();
}

/* =========================================
   3. DATA LOADING (Updated for Firestore Sync)
   ========================================= */
function loadSubjects() {
    const subSelect = document.getElementById('subject-select');
    subSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
    
    // Still use allQuizData keys for the dropdown structure
    if (typeof allQuizData === 'undefined') {
        toastr.error("Local data files missing. Subject list may be incomplete.");
        return;
    }

    Object.keys(allQuizData).forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subSelect.appendChild(opt);
    });

    subSelect.removeEventListener('change', loadChapters);
    subSelect.addEventListener('change', loadChapters);
}

function loadChapters() {
    const sub = document.getElementById('subject-select').value;
    const chapSelect = document.getElementById('chapter-select');
    chapSelect.innerHTML = '<option value="">-- Choose Test --</option>';
    
    if (!sub || !allQuizData[sub]) {
        chapSelect.disabled = true;
        return;
    }

    Object.keys(allQuizData[sub]).forEach(chapId => {
        const opt = document.createElement('option');
        // Unique ID logic must match app.js for Firestore queries
        opt.value = sub.replace(/\s+/g, '_') + "_" + chapId; 
        opt.textContent = chapId; 
        chapSelect.appendChild(opt);
    });

    chapSelect.disabled = false;
}

/* =========================================
   4. ANALYSIS LOGIC (UPDATED FOR LAZY LOADING)
   ========================================= */

async function loadTestAnalysis() {
    const subject = document.getElementById('subject-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    const dbChapterId = chapterSelect.value; 
    const container = document.getElementById('analysis-container');

    if (!subject || !dbChapterId) {
        toastr.warning("Please select both Subject and Test.");
        return;
    }

    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Syncing with Firestore & Analyzing Results...</p>
        </div>`;

    try {
        // NEW: Fetch questions from Firestore (Lazy Loading Match)
        // This ensures admin sees exactly what users are currently taking
        const quizDoc = await db.collection('quizzes').doc(dbChapterId).get();
        if (!quizDoc.exists) {
            throw new Error("Quiz content not found in Firestore. Check your upload script.");
        }
        const quizQuestions = quizDoc.data().questions;

        // 1. Fetch Aggregated Stats (Leaderboard & Community Data)
        const statsDoc = await db.collection('chapter_stats').doc(dbChapterId).get();
        let leaderboardData = [];
        let statsData = { totalAttempts: 0, average: 0, correctCounts: [], attemptedCounts: [] };

        if (statsDoc.exists) {
            const d = statsDoc.data();
            leaderboardData = d.leaderboard || [];
            statsData.totalAttempts = d.totalAttempts || 0;
            statsData.average = d.average || 0;
            statsData.correctCounts = d.correctCounts || [];
            statsData.attemptedCounts = d.attemptedCounts || [];
        }

        renderOptimizedLeaderboard(container, leaderboardData, statsData);

        // 2. Fetch Detailed Results for specific user breakdown
        const snapshot = await db.collection('results')
            .where('chapterId', '==', dbChapterId)
            .orderBy('timestamp', 'desc')
            .limit(50) 
            .get();

        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // 3. Render Question Analysis with Community Accuracy Bars
        renderQuestionAnalysis(container, quizQuestions, results, statsData);

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="alert alert-danger shadow-sm border-0">
                <h5 class="fw-bold">Analysis Failed</h5>
                <p class="mb-0">${error.message}</p>
                <hr>
                <small>Ensure the quiz has been uploaded to the 'quizzes' collection.</small>
            </div>`;
    }
}

function renderOptimizedLeaderboard(container, leaderboardArr, stats) {
    container.innerHTML = ''; 

    let rows = '';
    if (!leaderboardArr || leaderboardArr.length === 0) {
        rows = '<tr><td colspan="4" class="text-center text-muted py-3">No attempts recorded yet.</td></tr>';
    } else {
        leaderboardArr.forEach((entry, index) => {
            let dateStr = 'Recently';
            if (entry.timestamp) {
                dateStr = entry.timestamp.toDate ? entry.timestamp.toDate().toLocaleDateString() : new Date(entry.timestamp).toLocaleDateString();
            }

            const badgeClass = entry.scorePercent >= 80 ? 'bg-success' : (entry.scorePercent < 40 ? 'bg-danger' : 'bg-secondary');

            rows += `
                <tr>
                    <td class="fw-bold text-secondary">#${index + 1}</td>
                    <td>
                        <div class="fw-bold text-dark">${entry.userEmail || 'Guest'}</div>
                        <small class="text-muted">${dateStr}</small>
                    </td>
                    <td class="fw-bold">${entry.score.toFixed(1)}</td>
                    <td><span class="badge ${badgeClass}">${entry.scorePercent}%</span></td>
                </tr>
            `;
        });
    }

    const html = `
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold text-primary mb-1">🏆 Student Leaderboard</h5>
                    <small class="text-muted">Total Attempts: ${stats.totalAttempts} • Global Avg: ${stats.average.toFixed(1)}%</small>
                </div>
                <div class="display-6">📊</div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0 align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th scope="col" class="ps-4">Rank</th>
                            <th scope="col">User</th>
                            <th scope="col">Score</th>
                            <th scope="col">Accuracy</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML += html;
}

function renderQuestionAnalysis(container, questions, results, globalStats) {
    const questionsHeader = document.createElement('h5');
    questionsHeader.className = 'fw-bold text-dark mb-4 border-start border-4 border-primary ps-3';
    questionsHeader.textContent = `Question-by-Question Accuracy`;
    container.appendChild(questionsHeader);

    questions.forEach((q, index) => {
        const correctUsers = [];
        const wrongUsers = [];
        const unattemptedUsers = [];

        // Correct Answer Logic
        let correctIndex = -1;
        if (typeof q.correctAnswer === 'number') correctIndex = q.correctAnswer;
        else correctIndex = q.options.indexOf(q.correctAnswer);

        results.forEach(res => {
            const userIdentifier = res.userEmail ? res.userEmail.split('@')[0] : "Anon";
            const uAnswers = res.userAnswers || {};
            const uAnsObj = uAnswers[index]; 

            if (!uAnsObj) unattemptedUsers.push(userIdentifier);
            else if (uAnsObj.answer === correctIndex) correctUsers.push(userIdentifier);
            else wrongUsers.push(userIdentifier);
        });

        // Community Accuracy Calculation (from chapter_stats if available)
        const qCorrect = (globalStats.correctCounts && globalStats.correctCounts[index]) || 0;
        const qTotal = (globalStats.attemptedCounts && globalStats.attemptedCounts[index]) || globalStats.totalAttempts || 0;
        const accuracyPercent = qTotal > 0 ? Math.round((qCorrect / qTotal) * 100) : 0;

        const card = document.createElement('div');
        card.className = 'card mb-5 shadow-sm border-0 rounded-4 admin-q-card';
        
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            const isCorrect = i === correctIndex;
            optionsHtml += `
                <div class="option-box ${isCorrect ? 'correct-option' : ''} d-flex align-items-start">
                    <span class="me-2">${isCorrect ? '✅' : '⚪'}</span>
                    <span>${opt}</span>
                </div>`;
        });

        const renderBadges = (users, colorClass) => {
            if (!users.length) return '<small class="text-muted fst-italic">No data</small>';
            return users.map(u => `<span class="badge bg-${colorClass} bg-opacity-10 text-${colorClass} border border-${colorClass} border-opacity-25 me-1 mb-1">${u}</span>`).join('');
        };

        card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-primary m-0">Question ${index + 1}</h6>
                    <div class="d-flex align-items-center gap-2">
                        <small class="text-muted fw-bold">Accuracy:</small>
                        <div class="progress" style="width: 100px; height: 10px;">
                            <div class="progress-bar ${accuracyPercent > 50 ? 'bg-success' : 'bg-warning'}" style="width: ${accuracyPercent}%"></div>
                        </div>
                        <span class="badge bg-light text-dark border">${accuracyPercent}%</span>
                    </div>
                </div>
                <p class="fs-5 fw-medium mb-4 text-dark">${q.text ? q.text.replace(/\n/g, '<br>') : 'Missing text'}</p>
                
                <div class="row g-4">
                    <div class="col-lg-7">
                        <div class="mb-4">${optionsHtml}</div>
                        <div class="explanation-box shadow-sm">
                            <strong>💡 Official Explanation:</strong>
                            <div class="mt-2 text-secondary small">${q.explanation || 'No explanation provided.'}</div>
                        </div>
                    </div>
                    <div class="col-lg-5">
                         <div class="d-flex flex-column gap-3">
                            <div class="border rounded-3">
                                <div class="bg-success bg-opacity-10 px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                                    <strong class="text-success small">✅ CORRECT USERS</strong><span class="badge bg-success">${correctUsers.length}</span>
                                </div>
                                <div class="p-2" style="max-height: 100px; overflow-y: auto;">${renderBadges(correctUsers, 'success')}</div>
                            </div>
                            <div class="border rounded-3">
                                <div class="bg-danger bg-opacity-10 px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                                    <strong class="text-danger small">❌ INCORRECT USERS</strong><span class="badge bg-danger">${wrongUsers.length}</span>
                                </div>
                                <div class="p-2" style="max-height: 100px; overflow-y: auto;">${renderBadges(wrongUsers, 'danger')}</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}