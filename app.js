let currentSubject = '';
let currentChapterId = '';
let currentQuizData = [];
let currentQuestionIndex = 0;
const userAnswers = {};
let quizSubmitted = false;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    if (typeof allQuizData !== 'undefined') {
        generateSubjectCards();
    } else {
        console.error("allQuizData not loaded.");
    }
});

// --- NAVIGATION & UI ---

function generateSubjectCards() {
    const subjectsContainer = document.getElementById('subjects-container');
    subjectsContainer.innerHTML = '';

    Object.keys(allQuizData).forEach((subjectKey) => {
        const subject = {
            name: subjectKey,
            icon: '📖',
            description: `Master the concepts of ${subjectKey}`,
            color: 'primary',
            chapters: Object.keys(allQuizData[subjectKey]).map(chapterName => ({
                name: chapterName,
                id: chapterName
            }))
        };
        const chapterCount = Object.keys(allQuizData[subjectKey]).length;

        const subjectCard = document.createElement('div');
        subjectCard.className = 'col-md-4 col-lg-3 mb-4';
        subjectCard.innerHTML = `
            <div class="card topic-card h-100" onclick="showChapters('${subjectKey}')">
                <div class="card-body text-center p-4">
                    <div class="display-4 mb-3">${subject.icon}</div>
                    <h5 class="card-title text-${subject.color} fw-bold">${subject.name}</h5>
                    <p class="card-text text-muted small">${subject.description}</p>
                    <div class="mt-3">
                        <span class="badge bg-light text-dark border">${chapterCount} Chapter${chapterCount > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `;
        subjectsContainer.appendChild(subjectCard);
    });
}

function showChapters(subjectKey) {
    currentSubject = subjectKey;
    const subject = {
        name: subjectKey,
        chapters: Object.keys(allQuizData[subjectKey]).map(chapterName => ({
            name: chapterName,
            id: chapterName
        }))
    };

    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'block';
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('chapters-title').textContent = `${subject.name}`;

    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = '';

    subject.chapters.forEach((chapter) => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'col-md-6 col-lg-4 mb-4';
        chapterCard.innerHTML = `
            <div class="card chapter-card h-100 border-0">
                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-dark">${chapter.name}</h5>
                    <p class="card-text flex-grow-1 text-muted small">Practice MCQs for this chapter</p>
                    <div class="mt-auto">
                        <button class="btn btn-primary-custom w-100 quiz-start-btn" 
                            data-subject="${subjectKey}"
                            data-chapter-id="${chapter.id}"
                            data-chapter-name="${encodeURIComponent(chapter.name)}" 
                            type="button">
                            Start Test
                        </button>
                    </div>
                </div>
            </div>
        `;
        chaptersContainer.appendChild(chapterCard);
    });
}

function showSubjects() {
    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'block';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'none';
}

function goBackToChapters() {
    currentSubject ? showChapters(currentSubject) : showSubjects();
}

// --- QUIZ LOGIC ---

document.addEventListener('click', function (e) {
    if (e.target.matches('.quiz-start-btn')) {
        const subjectKey = e.target.dataset.subject;
        const chapterId = e.target.dataset.chapterId;
        const chapterName = decodeURIComponent(e.target.dataset.chapterName);
        loadQuiz(subjectKey, chapterId, chapterName);
    }
});

function loadQuiz(subjectKey, chapterId, chapterName) {
    currentSubject = subjectKey;
    currentChapterId = chapterId;
    currentQuizData = allQuizData[subjectKey][chapterId];
    currentQuestionIndex = 0;
    
    // Reset answers
    for (let key in userAnswers) delete userAnswers[key];
    quizSubmitted = false;

    // Switch view
    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';

    renderQuizLayout(chapterName);
    renderQuestion();
    renderNav();
}

function renderQuizLayout(chapterName) {
    document.getElementById('quiz-content').innerHTML = `
        <h4 class="text-center mb-4 fw-bold text-primary">${chapterName}</h4>
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
    document.getElementById('clear-btn').addEventListener('click', clearSelection);
    document.getElementById('next-btn').addEventListener('click', () => navigateQuestions(1));
    document.getElementById('final-submit-btn').addEventListener('click', submitAll);
}

function clearSelection() {
    if (!quizSubmitted) {
        const selectedOption = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (selectedOption) selectedOption.checked = false;
        delete userAnswers[currentQuestionIndex];
        updateNavHighlights();
    }
}

// --- RENDERING QUESTIONS ---

function renderQuestion() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';
    const question = currentQuizData[currentQuestionIndex];
    
    // SAFETY: Convert correctAnswer to a Number to prevent "1" == 1 type errors
    const correctIndex = Number(question.correctAnswer);

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    
    // Text formatting
    const formattedText = question.text ? question.text.replace(/\n/g, '<br>') : '';
    questionDiv.innerHTML = `<p class="mb-3 lead"><strong>Q${currentQuestionIndex + 1}. ${formattedText}</strong></p>`;

    // Render Options
    question.options.forEach((option, optIndex) => {
        const label = document.createElement('label');
        label.className = 'option shadow-sm';
        
        label.innerHTML = `
            <input type="radio" name="q${currentQuestionIndex}" value="${optIndex}" />
            ${option}
        `;
        
        const radioInput = label.querySelector('input');
        const userAnswerObj = userAnswers[currentQuestionIndex];

        // 1. If user previously selected this, check the box
        if (userAnswerObj && userAnswerObj.answer === optIndex) {
            radioInput.checked = true;
        }

        // 2. Interaction Logic
        if (!quizSubmitted) {
            radioInput.addEventListener('change', (e) => {
                userAnswers[currentQuestionIndex] = { answer: parseInt(e.target.value), isCorrect: false };
                updateNavHighlights();
            });
        } else {
            // --- SUBMITTED STATE (READ ONLY) ---
            radioInput.disabled = true;
            label.style.pointerEvents = 'none'; // Prevent clicks

            // A. ALWAYS highlight the Correct Answer (GREEN)
            // We use correctIndex to be safe against string/number mismatches
            if (optIndex === correctIndex) {
                label.classList.add('correct-answer-label');
            }

            // B. If User Chose this option AND it is WRONG -> Highlight RED
            if (userAnswerObj && userAnswerObj.answer === optIndex && optIndex !== correctIndex) {
                label.classList.add('incorrect-answer-label');
            }
        }
        
        questionDiv.appendChild(label);
    });

    // --- EXPLANATION (Show only if submitted) ---
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation shadow-sm mt-3';
    explanationDiv.style.display = quizSubmitted ? 'block' : 'none';
    explanationDiv.innerHTML = `<strong>💡 Explanation:</strong> <br> ${question.explanation}`;
    questionDiv.appendChild(explanationDiv);

    questionContainer.appendChild(questionDiv);

    updateButtonStates();

    // Show text feedback (Correct/Incorrect/Unattempted)
    if (quizSubmitted) {
        showFeedbackText(correctIndex);
    } else {
        document.getElementById('question-feedback').textContent = "";
    }
}

function showFeedbackText(correctIndex) {
    const resultDiv = document.getElementById('question-feedback');
    const userAnswerObj = userAnswers[currentQuestionIndex];
    const selectedVal = userAnswerObj ? userAnswerObj.answer : undefined;

    if (selectedVal === correctIndex) {
        resultDiv.innerHTML = `<h5 class="text-success fw-bold">Correct! 🎉</h5>`;
    } else if (selectedVal !== undefined) {
        resultDiv.innerHTML = `<h5 class="text-danger fw-bold">Incorrect. ❌</h5>`;
    } else {
        resultDiv.innerHTML = `<h5 class="text-secondary fw-bold">Unattempted. ⚪</h5>`;
    }
}

function updateButtonStates() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === currentQuizData.length - 1;
    }
}

function renderNav() {
    const navContainer = document.getElementById('nav-container');
    navContainer.innerHTML = '';

    currentQuizData.forEach((q, i) => {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item shadow-sm';
        navItem.textContent = i + 1;
        navItem.dataset.index = i;

        navItem.addEventListener('click', (e) => {
            currentQuestionIndex = parseInt(e.currentTarget.dataset.index, 10);
            renderQuestion();
            updateNavHighlights();
        });

        navContainer.appendChild(navItem);
    });
    updateNavHighlights();
}

function updateNavHighlights() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
        item.classList.remove('active', 'correct-nav', 'incorrect-nav', 'unattempted', 'attempted');
        const itemIndex = parseInt(item.dataset.index, 10);
        
        // Safety convert for checking correctness
        const qCorrectIndex = Number(currentQuizData[itemIndex].correctAnswer);

        if (itemIndex === currentQuestionIndex) {
            item.classList.add('active');
        }
        
        if (quizSubmitted) {
            const uAns = userAnswers[itemIndex];
            if (uAns === undefined) {
                item.classList.add('unattempted');
            } else {
                const isCorrect = uAns.answer === qCorrectIndex;
                item.classList.add(isCorrect ? 'correct-nav' : 'incorrect-nav');
            }
        } else {
             if (userAnswers[itemIndex] !== undefined) item.classList.add('attempted');
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

// --- SUBMISSION ---

function submitAll() {
    let finalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    
    quizSubmitted = true;
    
    // Calculate Score
    currentQuizData.forEach((question, index) => {
        const uAns = userAnswers[index];
        const correctIdx = Number(question.correctAnswer); // Safety convert

        if (uAns !== undefined) {
            const isCorrect = uAns.answer === correctIdx;
            userAnswers[index].isCorrect = isCorrect;
            
            if (isCorrect) {
                finalScore += 2;
                correctCount++;
            } else {
                finalScore -= 0.66; // Standard negative marking
                incorrectCount++;
            }
        } else {
            unattemptedCount++;
        }
    });
    
    const totalQuestions = currentQuizData.length;

    document.getElementById('result').innerHTML = `
        <div class="alert alert-primary mt-3 shadow-sm" role="alert">
            <h4 class="alert-heading fw-bold">Test Complete! 🏆</h4>
            <hr>
            <p class="mb-0">✅ Correct: <strong>${correctCount}</strong></p>
            <p class="mb-0">❌ Incorrect: <strong>${incorrectCount}</strong></p>
            <p class="mb-0">⚪ Unattempted: <strong>${unattemptedCount}</strong></p>
            <h5 class="mt-2 text-primary">Your Score: ${finalScore.toFixed(2)} / ${totalQuestions * 2}</h5>
        </div>
    `;

    // Lock UI
    updateNavHighlights();
    document.getElementById('clear-btn').disabled = true;
    const submitBtn = document.getElementById('final-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitted";
    
    // Re-render CURRENT question to show the Red/Green logic immediately
    renderQuestion(); 
}