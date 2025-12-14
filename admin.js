/* =========================================
   1. CONFIG & AUTH
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();

// 🔴 REPLACE THIS WITH YOUR EMAIL
const ALLOWED_ADMINS = ["prince@gmail.com", "your.email@gmail.com"]; 

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

async function loadTestAnalysis() {
    const subject = document.getElementById('subject-select').value;
    const chapterId = document.getElementById('chapter-select').value;
    const container = document.getElementById('analysis-container');

    if (!subject || !chapterId) {
        toastr.warning("Please select both Subject and Test.");
        return;
    }

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Fetching analysis data...</p></div>';

    try {
        const quizQuestions = allQuizData[subject][chapterId];

        // 1. Fetch Stats & Leaderboard Array (Cheap Read)
        const statsDoc = await db.collection('chapter_stats').doc(chapterId).get();
        let leaderboardData = [];
        let statsData = { totalAttempts: 0, average: 0 };

        if (statsDoc.exists) {
            const d = statsDoc.data();
            leaderboardData = d.leaderboard || [];
            statsData.totalAttempts = d.totalAttempts || 0;
            statsData.average = d.average || 0;
        }

        // 2. Render Leaderboard IMMEDIATELY
        renderOptimizedLeaderboard(container, leaderboardData, statsData);

        // 3. Fetch Full Results for Question Analysis (Expensive Read)
        const snapshot = await db.collection('results')
            .where('chapterId', '==', chapterId)
            .get();

        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // 4. Render Question Analysis
        renderQuestionAnalysis(container, quizQuestions, results);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
    }
}

function renderOptimizedLeaderboard(container, leaderboardArr, stats) {
    container.innerHTML = ''; // Clear loading spinner

    let rows = '';
    if (!leaderboardArr || leaderboardArr.length === 0) {
        rows = '<tr><td colspan="4" class="text-center text-muted py-3">No attempts recorded yet.</td></tr>';
    } else {
        leaderboardArr.forEach((entry, index) => {
            let dateStr = '-';
            if (typeof entry.timestamp === 'string') {
                dateStr = new Date(entry.timestamp).toLocaleString();
            } else if (entry.timestamp && entry.timestamp.toDate) {
                dateStr = entry.timestamp.toDate().toLocaleString();
            }

            const badgeClass = entry.scorePercent >= 80 ? 'bg-success' : (entry.scorePercent < 40 ? 'bg-danger' : 'bg-secondary');

            rows += `
                <tr>
                    <td class="fw-bold text-secondary">#${index + 1}</td>
                    <td>
                        <div class="fw-bold text-dark">${entry.userEmail || 'Anonymous'}</div>
                        <small class="text-muted">${dateStr}</small>
                    </td>
                    <td class="fw-bold">${entry.score.toFixed(1)}</td>
                    <td><span class="badge ${badgeClass}">${entry.scorePercent}%</span></td>
                </tr>
            `;
        });
    }

    const html = `
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5 animate-fade-in">
            <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold text-primary mb-1">🏆 Top Performers (Cached)</h5>
                    <small class="text-muted">Total Attempts: ${stats.totalAttempts} • Average: ${stats.average.toFixed(1)}%</small>
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
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML += html;
}

function renderQuestionAnalysis(container, questions, results) {
    const questionsHeader = document.createElement('h5');
    questionsHeader.className = 'fw-bold text-dark mb-4 border-start border-4 border-primary ps-3';
    questionsHeader.textContent = `Detailed Question Analysis`;
    container.appendChild(questionsHeader);

    const totalAttempts = results.length;

    questions.forEach((q, index) => {
        const correctUsers = [];
        const wrongUsers = [];
        const unattemptedUsers = [];

        let correctIndex = -1;
        if (typeof q.correctAnswer === 'number') correctIndex = q.correctAnswer;
        else correctIndex = q.options.indexOf(q.correctAnswer);

        results.forEach(res => {
            const userIdentifier = res.userEmail ? res.userEmail.split('@')[0] : "Anonymous";
            const uAnswers = res.userAnswers || {};
            const uAnsObj = uAnswers[index]; 

            if (!uAnsObj) {
                unattemptedUsers.push(userIdentifier);
            } else if (uAnsObj.answer === correctIndex) {
                correctUsers.push(userIdentifier);
            } else {
                wrongUsers.push(userIdentifier);
            }
        });

        const card = document.createElement('div');
        card.className = 'card mb-5 shadow-sm border-0 admin-q-card rounded-4';
        
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            let cssClass = 'option-box';
            let icon = '⚪';
            if (i === correctIndex) { cssClass += ' correct-option'; icon = '✅'; }
            optionsHtml += `<div class="${cssClass} d-flex align-items-start"><span class="me-2">${icon}</span><span>${opt}</span></div>`;
        });

        const renderBadges = (users, colorClass) => {
            if (!users.length) return '<small class="text-muted fst-italic">None</small>';
            return users.map(u => `<span class="user-badge" style="border-left-color: var(--bs-${colorClass})">${u}</span>`).join('');
        };

        card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between mb-3">
                    <h6 class="fw-bold text-primary">Question ${index + 1}</h6>
                    <span class="badge bg-light text-dark border">
                        Attempt Rate: ${Math.round(((correctUsers.length + wrongUsers.length)/totalAttempts)*100) || 0}%
                    </span>
                </div>
                <p class="fs-5 fw-medium mb-4 text-dark">${q.text || 'No text'}</p>
                <div class="row g-4">
                    <div class="col-lg-7">
                        <div class="mb-4">${optionsHtml}</div>
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
                                    <strong class="text-success">✅ Correct</strong><span class="badge bg-success rounded-pill">${correctUsers.length}</span>
                                </div>
                                <div class="p-2 user-list-box">${renderBadges(correctUsers, 'success')}</div>
                            </div>
                            <div class="border rounded-3 overflow-hidden">
                                <div class="bg-danger-subtle px-3 py-2 border-bottom border-danger border-opacity-25 d-flex justify-content-between">
                                    <strong class="text-danger">❌ Incorrect</strong><span class="badge bg-danger rounded-pill">${wrongUsers.length}</span>
                                </div>
                                <div class="p-2 user-list-box">${renderBadges(wrongUsers, 'danger')}</div>
                            </div>
                            <div class="border rounded-3 overflow-hidden">
                                <div class="bg-light px-3 py-2 border-bottom d-flex justify-content-between">
                                    <strong class="text-secondary">⚪ Unattempted</strong>
                                    <span class="badge bg-secondary rounded-pill">${unattemptedUsers.length}</span>
                                </div>
                                <div class="p-2 user-list-box">${renderBadges(unattemptedUsers, 'secondary')}</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}