/* =========================================
   1. CONFIG & AUTH
   ========================================= */
const auth = firebase.auth();
const db = firebase.firestore();

// 🔴 REPLACE THIS WITH YOUR EMAIL
const ALLOWED_ADMINS = ["princeiitk@gmail.com", "your.email@gmail.com"]; 

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

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Fetching student results...</p></div>';

    try {
        const quizQuestions = allQuizData[subject][chapterId];

        // Fetch all results for this test
        const snapshot = await db.collection('results')
            .where('chapterId', '==', chapterId)
            .orderBy('score', 'desc') // Order by score to show top students first
            .get();

        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

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
    
    // Calculate Average
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
        results.forEach((res, index) => {
            let dateStr = '-';
            if (res.timestamp && res.timestamp.toDate) {
                dateStr = res.timestamp.toDate().toLocaleString();
            }
            
            // Highlight high scores
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

    questions.forEach((q, index) => {
        const correctUsers = [];
        const wrongUsers = [];
        const unattemptedUsers = [];

        let correctIndex = -1;
        if (typeof q.correctAnswer === 'number') correctIndex = q.correctAnswer;
        else correctIndex = q.options.indexOf(q.correctAnswer);

        // Sort users into buckets
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
        
        // Generate Options HTML
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            let cssClass = 'option-box';
            let icon = '⚪';
            
            // Admin View: Always highlight the Correct Answer
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

        // User Badges Helper
        const renderBadges = (users, colorClass) => {
            if (!users.length) return '<small class="text-muted fst-italic">None</small>';
            return users.map(u => 
                `<span class="user-badge" style="border-left-color: var(--bs-${colorClass})">
                    ${u}
                 </span>`
            ).join('');
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