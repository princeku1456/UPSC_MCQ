/* =========================================
   1. CONFIG & AUTH
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();

// Secure Authentication check against the 'admins' collection
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
   3. DATA LOADING (FIXED DROPDOWNS)
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

    // Reset listener to ensure clean execution
    subSelect.removeEventListener('change', loadChapters);
    subSelect.addEventListener('change', loadChapters);
}

function loadChapters() {
    const sub = document.getElementById('subject-select').value;
    const chapSelect = document.getElementById('chapter-select');
    chapSelect.innerHTML = '<option value="">-- Choose Test --</option>';
    
    if (!sub || !allQuizData[sub] || Object.keys(allQuizData[sub]).length === 0) {
        chapSelect.disabled = true;
        return;
    }

    Object.keys(allQuizData[sub]).forEach(chapId => {
        const opt = document.createElement('option');
        // Unique ID logic to match app.js (e.g., "Modern_History_PYQ_Chapter-Name")
        opt.value = sub.replace(/\s+/g, '_') + "_" + chapId; 
        opt.textContent = chapId; 
        // Store original ID for local JS data lookup
        opt.dataset.originalId = chapId;
        chapSelect.appendChild(opt);
    });

    chapSelect.disabled = false;
}

/* =========================================
   4. ANALYSIS LOGIC
   ========================================= */

async function loadTestAnalysis() {
    const subject = document.getElementById('subject-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    const dbChapterId = chapterSelect.value; 
    const originalChapId = chapterSelect.options[chapterSelect.selectedIndex]?.dataset.originalId;
    const container = document.getElementById('analysis-container');

    if (!subject || !dbChapterId) {
        toastr.warning("Please select both Subject and Test.");
        return;
    }

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Fetching analysis data...</p></div>';

    try {
        // Fetch local question data using the original chapter ID
        const quizQuestions = allQuizData[subject][originalChapId];

        // 1. Fetch Global Stats using the Unique ID
        const statsDoc = await db.collection('chapter_stats').doc(dbChapterId).get();
        let leaderboardData = [];
        let statsData = { totalAttempts: 0, average: 0 };

        if (statsDoc.exists) {
            const d = statsDoc.data();
            leaderboardData = d.leaderboard || [];
            statsData.totalAttempts = d.totalAttempts || 0;
            statsData.average = d.average || 0;
        }

        renderOptimizedLeaderboard(container, leaderboardData, statsData);

        // 2. Fetch Detailed Results for Question Analysis
        const snapshot = await db.collection('results')
            .where('chapterId', '==', dbChapterId)
            .get();

        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // 3. Render detailed Question-by-Question breakdown
        renderQuestionAnalysis(container, quizQuestions, results);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
    }
}

function renderOptimizedLeaderboard(container, leaderboardArr, stats) {
    container.innerHTML = ''; 

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
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold text-primary mb-1">🏆 Top Performers</h5>
                    <small class="text-muted">Total Attempts: ${stats.totalAttempts} • Average: ${stats.average.toFixed(1)}%</small>
                </div>
                <div class="display-6">📊</div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0 align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th scope="col" class="ps-4">Rank</th>
                            <th scope="col">Student</th>
                            <th scope="col">Score</th>
                            <th scope="col">Performance</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
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

        // Determine correct index from standard formats
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
        card.className = 'card mb-5 shadow-sm border-0 rounded-4';
        
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            let cssClass = 'option-box p-2 border rounded mb-1';
            let icon = '⚪';
            if (i === correctIndex) { 
                cssClass = 'option-box p-2 border rounded mb-1 bg-success-subtle border-success'; 
                icon = '✅'; 
            }
            optionsHtml += `<div class="${cssClass} d-flex align-items-start"><span class="me-2">${icon}</span><span>${opt}</span></div>`;
        });

        const renderBadges = (users, colorClass) => {
            if (!users.length) return '<small class="text-muted fst-italic">None</small>';
            return users.map(u => `<span class="badge bg-${colorClass} bg-opacity-10 text-${colorClass} border border-${colorClass} border-opacity-25 me-1 mb-1">${u}</span>`).join('');
        };

        card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between mb-3">
                    <h6 class="fw-bold text-primary">Question ${index + 1}</h6>
                    <span class="badge bg-light text-dark border">
                        Attempt Rate: ${totalAttempts > 0 ? Math.round(((correctUsers.length + wrongUsers.length)/totalAttempts)*100) : 0}%
                    </span>
                </div>
                <p class="fs-5 fw-medium mb-4 text-dark">${q.text?.replace(/\n/g, '<br>') || 'No text'}</p>
                <div class="row g-4">
                    <div class="col-lg-7">
                        <div class="mb-4">${optionsHtml}</div>
                        <div class="p-3 bg-light rounded shadow-sm">
                            <strong>💡 Explanation:</strong>
                            <div class="mt-2 text-secondary small">${q.explanation || 'No explanation provided.'}</div>
                        </div>
                    </div>
                    <div class="col-lg-5">
                         <div class="d-flex flex-column gap-3">
                            <div class="border rounded-3">
                                <div class="bg-success bg-opacity-10 px-3 py-2 border-bottom d-flex justify-content-between">
                                    <strong class="text-success">✅ Correct</strong><span class="badge bg-success">${correctUsers.length}</span>
                                </div>
                                <div class="p-2">${renderBadges(correctUsers, 'success')}</div>
                            </div>
                            <div class="border rounded-3">
                                <div class="bg-danger bg-opacity-10 px-3 py-2 border-bottom d-flex justify-content-between">
                                    <strong class="text-danger">❌ Incorrect</strong><span class="badge bg-danger">${wrongUsers.length}</span>
                                </div>
                                <div class="p-2">${renderBadges(wrongUsers, 'danger')}</div>
                            </div>
                            <div class="border rounded-3">
                                <div class="bg-secondary bg-opacity-10 px-3 py-2 border-bottom d-flex justify-content-between">
                                    <strong class="text-secondary">⚪ Skipped</strong><span class="badge bg-secondary">${unattemptedUsers.length}</span>
                                </div>
                                <div class="p-2">${renderBadges(unattemptedUsers, 'secondary')}</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}