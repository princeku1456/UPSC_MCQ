const auth = firebase.auth();
const db = firebase.firestore();

/* --- Auth & UI Management --- */
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('admins').doc(user.uid).get().then((doc) => {
            if (doc.exists) { showDashboard(); loadSubjects(); }
            else { auth.signOut(); showLogin(); }
        });
    } else { showLogin(); }
});

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
    auth.signInWithEmailAndPassword(document.getElementById('admin-email').value, document.getElementById('admin-password').value)
        .catch(err => toastr.error(err.message));
});

function logoutAdmin() { auth.signOut(); }

/* --- Data Selection --- */
function loadSubjects() {
    const subSelect = document.getElementById('subject-select');
    subSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
    Object.keys(allQuizData).forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub; opt.textContent = sub;
        subSelect.appendChild(opt);
    });
    subSelect.addEventListener('change', loadChapters);
}

function loadChapters() {
    const sub = document.getElementById('subject-select').value;
    const chapSelect = document.getElementById('chapter-select');
    chapSelect.innerHTML = '<option value="">-- Choose Test --</option>';
    if (!sub) { chapSelect.disabled = true; return; }
    Object.keys(allQuizData[sub]).forEach(chapId => {
        const opt = document.createElement('option');
        opt.value = sub.replace(/\s+/g, '_') + "_" + chapId;
        opt.textContent = chapId;
        chapSelect.appendChild(opt);
    });
    chapSelect.disabled = false;
}

/* --- Redesigned Analysis Logic --- */
async function loadTestAnalysis() {
    const dbChapterId = document.getElementById('chapter-select').value;
    const container = document.getElementById('analysis-container');
    if (!dbChapterId) return toastr.warning("Select Subject and Test.");

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const [quizDoc, statsDoc, resultsSnap] = await Promise.all([
            db.collection('quizzes').doc(dbChapterId).get(),
            db.collection('chapter_stats').doc(dbChapterId).get(),
            db.collection('results').where('chapterId', '==', dbChapterId).orderBy('timestamp', 'desc').limit(100).get()
        ]);

        if (!quizDoc.exists) throw new Error("Quiz content not found.");
        
        const quizQuestions = quizDoc.data().questions;
        const statsData = statsDoc.exists ? statsDoc.data() : { totalAttempts: 0, average: 0 };
        const results = resultsSnap.docs.map(doc => doc.data());

        container.innerHTML = '';
        renderOptimizedLeaderboard(container, statsData.leaderboard || [], statsData);
        renderQuestionAnalysis(container, quizQuestions, results);

    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function renderQuestionAnalysis(container, questions, results) {
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-4 mt-5';
    header.innerHTML = `<h4 class="fw-bold text-dark border-start border-4 border-primary ps-3">📊 Discussion Dashboard</h4>`;
    container.appendChild(header);

    questions.forEach((q, qIdx) => {
        const optionBuckets = q.options.map(() => []);
        const skippedUsers = [];
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : q.options.indexOf(q.correctAnswer);

        results.forEach(res => {
            const userName = res.userEmail ? res.userEmail.split('@')[0] : "Guest";
            const choice = res.userAnswers ? res.userAnswers[qIdx] : null;
            if (!choice || choice.answer === undefined || choice.answer === -1) skippedUsers.push(userName);
            else if (optionBuckets[choice.answer]) optionBuckets[choice.answer].push(userName);
        });

        const accuracy = results.length > 0 ? Math.round((optionBuckets[correctIndex].length / results.length) * 100) : 0;
        const card = document.createElement('div');
        card.className = `card mb-5 shadow-sm border-0 rounded-4 admin-q-card ${accuracy < 40 ? 'high-error' : ''}`;

        let optionsHtml = '';
        q.options.forEach((opt, oIdx) => {
            const isCorrect = oIdx === correctIndex;
            const users = optionBuckets[oIdx];
            const percent = results.length > 0 ? Math.round((users.length / results.length) * 100) : 0;

            optionsHtml += `
                <div class="p-3 border rounded-3 mb-2 ${isCorrect ? 'bg-success bg-opacity-10 border-success' : 'bg-white'}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge ${isCorrect ? 'bg-success' : 'bg-secondary'} me-2">${String.fromCharCode(65 + oIdx)}</span>
                            <span class="${isCorrect ? 'fw-bold text-success' : ''}">${opt}</span>
                        </div>
                        <span class="fw-bold">${users.length} Users (${percent}%)</span>
                    </div>
                    <div class="d-flex flex-wrap gap-1 mt-2 user-list-container">
                        ${users.map(u => `<span class="badge user-tag">${u}</span>`).join('')}
                    </div>
                </div>`;
        });

        card.innerHTML = `
            <div class="card-body p-4">
                <div class="d-flex justify-content-between mb-3">
                    <span class="badge bg-primary bg-opacity-10 text-primary">Question ${qIdx + 1}</span>
                    <span class="badge bg-light text-dark border">Accuracy: ${accuracy}%</span>
                </div>
                <h5 class="fw-bold mb-4">${q.text.replace(/\n/g, '<br>')}</h5>
                <div class="row g-4">
                    <div class="col-lg-8">
                        ${optionsHtml}
                        <div class="mt-3 p-2 bg-light rounded-3 border-dashed border-2">
                            <small class="text-muted fw-bold">⚪ SKIPPED (${skippedUsers.length})</small>
                            <div class="d-flex flex-wrap gap-1 mt-1">${skippedUsers.map(u => `<span class="badge user-tag border-secondary text-secondary">${u}</span>`).join('') || 'None'}</div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="explanation-box mb-3">
                            <h6 class="fw-bold text-warning-emphasis"><i class="bi bi-lightbulb"></i> Explanation:</h6>
                            <p class="small m-0">${q.explanation || 'No explanation.'}</p>
                        </div>
                        <div class="p-3 bg-primary bg-opacity-10 rounded-3">
                            <small class="fw-bold text-primary d-block mb-1">DISCUSSION TIP</small>
                            <p class="small m-0 text-primary-emphasis">
                                ${accuracy < 40 ? "⚠️ Critical concept failure. Address the high error rate." : "✅ Concept generally understood."}
                                ${skippedUsers.length > results.length / 3 ? " Question might be too difficult (high skip rate)." : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function renderOptimizedLeaderboard(container, leaderboardArr, stats) {
    let rows = leaderboardArr.map((entry, i) => `
        <tr>
            <td class="fw-bold">#${i + 1}</td>
            <td>${entry.userEmail.split('@')[0]}</td>
            <td>${entry.score.toFixed(1)}</td>
            <td><span class="badge ${entry.scorePercent >= 80 ? 'bg-success' : 'bg-secondary'}">${entry.scorePercent}%</span></td>
        </tr>`).join('');

    container.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div class="card-header bg-white border-bottom p-4">
                <h5 class="fw-bold text-primary m-0">🏆 Leaderboard</h5>
                <small class="text-muted">Total Attempts: ${stats.totalAttempts} | Global Avg: ${stats.average.toFixed(1)}%</small>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light"><tr><th>Rank</th><th>User</th><th>Score</th><th>Accuracy</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" class="text-center">No records.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
}