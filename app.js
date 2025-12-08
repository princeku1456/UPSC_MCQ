let currentSubject = '';
let currentChapterId = '';
let currentQuizData = [];
let currentQuestionIndex = 0;
const userAnswers = {};
let quizSubmitted = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    generateSubjectCards();
});

// Generate subject cards dynamically
function generateSubjectCards() {
    const subjectsContainer = document.getElementById('subjects-container');
    subjectsContainer.innerHTML = '';

    // Define icons for subjects (you can expand this map)
    const icons = {
        'Current Affairs': '🌍',
        'Modern History': '📜',
        'Science': '🧬',
        'Bihar Special': '🏛️',
        'default': '📚'
    };

    Object.keys(allQuizData).forEach((subjectKey) => {
        const chapterCount = Object.keys(allQuizData[subjectKey]).length;
        const icon = icons[subjectKey] || icons['default'];

        const subjectCard = document.createElement('div');
        subjectCard.className = 'col-md-6 col-lg-4 col-xl-3';
        subjectCard.innerHTML = `
            <div class="topic-card p-4 text-center cursor-pointer" onclick="showChapters('${subjectKey}')">
                <div class="card-icon mb-3">${icon}</div>
                <h5 class="card-title mb-2">${subjectKey}</h5>
                <p class="text-muted small mb-0">${chapterCount} Chapters</p>
            </div>
        `;
        subjectsContainer.appendChild(subjectCard);
    });
}

// Show chapters on subject click
function showChapters(subjectKey) {
    currentSubject = subjectKey;
    const chapters = Object.keys(allQuizData[subjectKey]);

    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'block';
    document.getElementById('quiz-section').style.display = 'none';

    document.getElementById('chapters-title').innerHTML = `<span class="text-primary">${subjectKey}</span> Chapters`;

    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = '';

    chapters.forEach((chapterName, index) => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'col-md-6 col-lg-4';
        chapterCard.innerHTML = `
            <div class="chapter-card p-4 d-flex flex-column h-100">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="badge bg-light text-primary border border-primary-subtle">Chapter ${index + 1}</span>
                </div>
                <h5 class="card-title mb-3">${chapterName}</h5>
                <div class="mt-auto">
                    <button class="btn btn-primary w-100 quiz-start-btn rounded-pill" 
                        data-subject="${subjectKey}"
                        data-chapter-id="${chapterName}"
                        type="button">
                        Start Quiz
                    </button>
                </div>
            </div>
        `;
        chaptersContainer.appendChild(chapterCard);
    });
}

// Navigation Functions
function showSubjects() {
    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'block';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'none';
    window.scrollTo(0,0);
}

function showHome() {
    document.getElementById('hero-section').style.display = 'flex'; // Hero is flex
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'none';
    window.scrollTo(0,0);
}

function goBackToChapters() {
    if (currentSubject) {
        showChapters(currentSubject);
    } else {
        showSubjects();
    }
}

// Event Delegation for Quiz Start
document.addEventListener('click', function (e) {
    if (e.target.matches('.quiz-start-btn')) {
        const subjectKey = e.target.dataset.subject;
        const chapterId = e.target.dataset.chapterId;
        loadQuiz(subjectKey, chapterId);
    }
});

function loadQuiz(subjectKey, chapterId) {
    currentSubject = subjectKey;
    currentChapterId = chapterId;
    currentQuizData = allQuizData[subjectKey][chapterId];
    currentQuestionIndex = 0;
    
    // Clear previous session data
    for (const key in userAnswers) delete userAnswers[key];
    quizSubmitted = false;

    // View Switching
    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';

    renderQuizLayout(chapterId);
    renderQuestion();
    renderNav();
}

function renderQuizLayout(chapterName) {
    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="mb-0 text-primary">${chapterName}</h4>
            <span class="badge bg-light text-dark border">Q. ${currentQuestionIndex + 1} / ${currentQuizData.length}</span>
        </div>
        
        <div id="question-container"></div>
        
        <div class="d-flex gap-2 mt-4 pt-3 border-top">
            <button id="prev-btn" class="btn btn-outline-secondary px-4">Previous</button>
            <button id="clear-btn" class="btn btn-outline-danger">Clear</button>
            <button id="next-btn" class="btn btn-primary px-4 ms-auto">Next</button>
        </div>
        
        <div id="result-container"></div>
    `;

    const quizNav = document.getElementById('quiz-nav');
    quizNav.innerHTML = `
        <div class="nav-header">Question Navigator</div>
        <div id="nav-container" class="nav-grid"></div>
        
        <div class="mt-4 pt-3 border-top">
            <div class="d-flex justify-content-between text-muted small mb-3">
                <span><span class="badge bg-primary p-1 rounded-circle me-1"> </span> Attempted</span>
                <span><span class="badge bg-light border p-1 rounded-circle me-1"> </span> Skipped</span>
            </div>
            <button id="final-submit-btn" class="btn btn-success w-100 py-2 fw-semibold shadow-sm">Submit Quiz</button>
        </div>
    `;

    document.getElementById('prev-btn').addEventListener('click', () => navigateQuestions(-1));
    document.getElementById('clear-btn').addEventListener('click', clearSelection);
    document.getElementById('next-btn').addEventListener('click', () => navigateQuestions(1));
    document.getElementById('final-submit-btn').addEventListener('click', submitAll);
}

function renderQuestion() {
    const questionContainer = document.getElementById('question-container');
    const question = currentQuizData[currentQuestionIndex];

    // Update question number badge
    const badge = document.querySelector('.quiz-card .badge');
    if(badge) badge.innerText = `Q. ${currentQuestionIndex + 1} / ${currentQuizData.length}`;

    let html = `
        <p class="question-text">${question.text}</p>
        <div class="options-list">
    `;

    question.options.forEach((option, index) => {
        const isChecked = userAnswers[currentQuestionIndex]?.answer === index ? 'checked' : '';
        html += `
            <label class="option-label" id="opt-label-${index}">
                <input type="radio" name="q${currentQuestionIndex}" value="${index}" ${isChecked}>
                <span class="ms-2">${String.fromCharCode(65 + index)}. ${option}</span>
            </label>
        `;
    });

    html += `</div>`; // Close options list

    // Explanation Area (Initially Hidden)
    html += `
        <div id="explanation-box" class="explanation-box" style="display: none;">
            <strong><i class="bi bi-info-circle"></i> Explanation:</strong><br>
            ${question.explanation}
        </div>
    `;

    questionContainer.innerHTML = html;

    // Event Listeners for Options
    const radioInputs = questionContainer.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (!quizSubmitted) {
                userAnswers[currentQuestionIndex] = { 
                    answer: parseInt(e.target.value), 
                    isCorrect: false 
                };
                updateNavHighlights();
            }
        });
    });

    // Button States
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    document.getElementById('next-btn').disabled = currentQuestionIndex === currentQuizData.length - 1;

    // Show feedback if submitted
    if (quizSubmitted) {
        showFeedback();
    }
}

function clearSelection() {
    if (!quizSubmitted) {
        const checked = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (checked) checked.checked = false;
        delete userAnswers[currentQuestionIndex];
        updateNavHighlights();
    }
}

function renderNav() {
    const navContainer = document.getElementById('nav-container');
    navContainer.innerHTML = '';

    currentQuizData.forEach((_, i) => {
        const btn = document.createElement('div');
        btn.className = 'nav-item-box';
        btn.innerText = i + 1;
        btn.dataset.index = i;
        btn.onclick = () => {
            currentQuestionIndex = i;
            renderQuestion();
            updateNavHighlights();
        };
        navContainer.appendChild(btn);
    });
    updateNavHighlights();
}

function updateNavHighlights() {
    const items = document.querySelectorAll('.nav-item-box');
    items.forEach(item => {
        item.className = 'nav-item-box'; // Reset
        const idx = parseInt(item.dataset.index);

        if (idx === currentQuestionIndex) item.classList.add('active');

        if (quizSubmitted) {
            const userAnswer = userAnswers[idx];
            if (userAnswer) {
                const isCorrect = userAnswer.answer === currentQuizData[idx].correctAnswer;
                item.classList.add(isCorrect ? 'correct' : 'incorrect');
            } else {
                item.classList.add('unattempted-final');
            }
        } else {
            if (userAnswers[idx] !== undefined) item.classList.add('attempted');
        }
    });
}

function navigateQuestions(direction) {
    const nextIndex = currentQuestionIndex + direction;
    if (nextIndex >= 0 && nextIndex < currentQuizData.length) {
        currentQuestionIndex = nextIndex;
        renderQuestion();
        updateNavHighlights();
    }
}

function submitAll() {
    if(!confirm("Are you sure you want to submit the quiz?")) return;

    quizSubmitted = true;
    let score = 0;
    let correct = 0;
    let wrong = 0;

    // Calculate Score
    currentQuizData.forEach((q, i) => {
        if (userAnswers[i]) {
            if (userAnswers[i].answer === q.correctAnswer) {
                score += 1;
                correct++;
            } else {
                score -= 0.33; // 1/3 negative marking
                wrong++;
            }
        }
    });

    // Disable inputs
    const inputs = document.querySelectorAll('input[type="radio"]');
    inputs.forEach(inp => inp.disabled = true);
    
    // Disable submit/clear buttons
    document.getElementById('final-submit-btn').disabled = true;
    document.getElementById('clear-btn').disabled = true;

    // Update Nav colors
    updateNavHighlights();

    // Show current question feedback
    showFeedback();

    // Show Score Card
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="result-card fade-in-up">
            <h4 class="text-muted">Quiz Results</h4>
            <div class="score-display">${score.toFixed(2)} <span class="fs-6 text-muted">/ ${currentQuizData.length}</span></div>
            <div class="row text-center mt-3">
                <div class="col-4 border-end">
                    <div class="text-success fw-bold">${correct}</div>
                    <small class="text-muted">Correct</small>
                </div>
                <div class="col-4 border-end">
                    <div class="text-danger fw-bold">${wrong}</div>
                    <small class="text-muted">Wrong</small>
                </div>
                <div class="col-4">
                    <div class="text-secondary fw-bold">${currentQuizData.length - (correct + wrong)}</div>
                    <small class="text-muted">Skipped</small>
                </div>
            </div>
        </div>
    `;
    
    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function showFeedback() {
    const question = currentQuizData[currentQuestionIndex];
    const explanationBox = document.getElementById('explanation-box');
    const labels = document.querySelectorAll('.option-label');

    // Highlight options
    labels.forEach((label, index) => {
        label.classList.remove('correct-answer', 'incorrect-answer');
        
        // Always highlight the correct answer
        if (index === question.correctAnswer) {
            label.classList.add('correct-answer');
        }

        // Highlight user's wrong answer
        if (userAnswers[currentQuestionIndex]?.answer === index && index !== question.correctAnswer) {
            label.classList.add('incorrect-answer');
        }
    });

    // Show Explanation
    if (explanationBox) explanationBox.style.display = 'block';
}