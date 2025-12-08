
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

    Object.keys(allQuizData).forEach((subjectKey) => {
        const subject = {
            name: subjectKey,
            icon: '📖', // Updated icon
            description: `Master the concepts of ${subjectKey}`,
            color: 'primary', // CHANGED: Changed from 'dark' to 'primary' to match new theme
            chapters: Object.keys(allQuizData[subjectKey]).map(chapterName => ({
                name: chapterName,
                id: chapterName
            }))
        };
        const chapterCount = Object.keys(allQuizData[subjectKey]).length;

        const subjectCard = document.createElement('div');
        subjectCard.className = 'col-md-4 col-lg-3 mb-4';
        // Removed border-{color} class to use custom CSS shadow instead
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

// Show chapters on subject click
function showChapters(subjectKey) {
    currentSubject = subjectKey;

    const subject = {
        name: subjectKey,
        color: 'primary', // CHANGED: Consistent color scheme
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
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;
        chaptersContainer.appendChild(chapterCard);
    });
}

// Back to subjects from chapters
function showSubjects() {
    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'block';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'none';
}

function showHome() {
    document.getElementById('hero-section').style.display = 'block';
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'none';
}

// Back to chapters from quiz
function goBackToChapters() {
    if (currentSubject) {
        showChapters(currentSubject);
    } else {
        showSubjects();
    }
}

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
    Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
    quizSubmitted = false;

    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('subjects-section').style.display = 'none';
    document.getElementById('chapters-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';

    renderQuizLayout(chapterName);
    renderQuestion();
    renderNav();
}

function renderQuizLayout(chapterName) {
    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML = `
        <h4 class="text-center mb-4 fw-bold text-primary">${chapterName}</h4>
        <div id="question-container"></div>
        <div class="d-flex justify-content-between mt-4">
            <button id="prev-btn" class="btn btn-primary-custom px-4 rounded-pill">Previous</button>
            <button id="clear-btn" class="btn btn-outline-warning px-4 rounded-pill">Clear</button>
            <button id="next-btn" class="btn btn-primary-custom px-4 rounded-pill">Next</button>
        </div>
        <div id="result" class="mt-4 text-center"></div>
    `;

    const quizNav = document.getElementById('quiz-nav');
    quizNav.innerHTML = `
        <div class="nav-header">Question Palette</div>
        <div id="nav-container" class="nav-grid"></div>
        <button id="final-submit-btn" class="btn btn-success w-100 mt-4 rounded-pill py-2 fw-bold">Submit Quiz</button>
    `;

    document.getElementById('prev-btn').addEventListener('click', navigateQuestions.bind(null, -1));
    document.getElementById('clear-btn').addEventListener('click', clearSelection);
    document.getElementById('next-btn').addEventListener('click', navigateQuestions.bind(null, 1));
    document.getElementById('final-submit-btn').addEventListener('click', submitAll);
}

function clearSelection() {
    if (!quizSubmitted) {
        const selectedOption = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (selectedOption) {
            selectedOption.checked = false;
        }
        delete userAnswers[currentQuestionIndex];
        updateNavHighlights();
    }
}

function renderQuestion() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';
    const question = currentQuizData[currentQuestionIndex];

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `<p class="mb-3 lead"><strong>Q${currentQuestionIndex + 1}. ${question.text}</strong></p>`;

    question.options.forEach((option, optIndex) => {
        const label = document.createElement('label');
        label.className = 'option shadow-sm';
        label.innerHTML = `
            <input type="radio" name="q${currentQuestionIndex}" value="${optIndex}" />
            ${option}
        `;
        
        const radioInput = label.querySelector('input');
        radioInput.addEventListener('change', (e) => {
            if (!quizSubmitted) {
                userAnswers[currentQuestionIndex] = { answer: parseInt(e.target.value), isCorrect: false };
                updateNavHighlights();
            }
        });
        
        questionDiv.appendChild(label);
    });

    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation shadow-sm';
    explanationDiv.id = `explanation${currentQuestionIndex}`;
    explanationDiv.style.display = 'none';
    explanationDiv.innerHTML = `<strong>💡 Explanation:</strong> ${question.explanation}`;
    questionDiv.appendChild(explanationDiv);

    questionContainer.appendChild(questionDiv);

    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    document.getElementById('next-btn').disabled = currentQuestionIndex === currentQuizData.length - 1;

    if (userAnswers[currentQuestionIndex] !== undefined) {
        const selectedOption = document.querySelector(`input[name="q${currentQuestionIndex}"][value="${userAnswers[currentQuestionIndex].answer}"]`);
        if (selectedOption) {
            selectedOption.checked = true;
        }
    }
    
    // Only show feedback if the quiz has been submitted
    if (quizSubmitted) {
        showFeedback();
    } else {
        hideFeedback();
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

        if (itemIndex === currentQuestionIndex) {
            item.classList.add('active');
        }
        
        if (quizSubmitted) {
            if (userAnswers[itemIndex] === undefined) {
                item.classList.add('unattempted');
            } else {
                const isCorrect = userAnswers[itemIndex].answer === currentQuizData[itemIndex].correctAnswer;
                item.classList.add(isCorrect ? 'correct-nav' : 'incorrect-nav');
            }
        } else {
             if (userAnswers[itemIndex] !== undefined) {
                item.classList.add('attempted');
            }
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

function showFeedback() {
    const resultDiv = document.getElementById('result');
    const question = currentQuizData[currentQuestionIndex];
    const explanationDiv = document.getElementById(`explanation${currentQuestionIndex}`);
    const options = document.querySelectorAll('.option');

    options.forEach(option => option.style.pointerEvents = 'none');
    
    const selectedAnswer = userAnswers[currentQuestionIndex]?.answer;
    const isCorrect = selectedAnswer !== undefined && selectedAnswer === question.correctAnswer;

    if (userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex].isCorrect = isCorrect;
    }

    if (isCorrect) {
        resultDiv.innerHTML = `<h5 class="text-success fw-bold">Correct! 🎉</h5>`;
    } else if (selectedAnswer !== undefined) {
        resultDiv.innerHTML = `<h5 class="text-danger fw-bold">Incorrect. ❌</h5>`;
    } else {
        resultDiv.innerHTML = `<h5 class="text-secondary fw-bold">Unattempted. ⚪</h5>`;
    }
    
    if (question.correctAnswer !== undefined) {
        options[question.correctAnswer].classList.add('correct-answer-label');
    }

    if (selectedAnswer !== undefined && !isCorrect) {
        options[selectedAnswer].classList.add('incorrect-answer-label');
    }
    
    if (explanationDiv) {
        explanationDiv.style.display = 'block';
    }
}

function hideFeedback() {
    document.getElementById('result').textContent = "";
    const explanationDiv = document.getElementById(`explanation${currentQuestionIndex}`);
    if (explanationDiv) {
        explanationDiv.style.display = 'none';
    }
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.style.pointerEvents = 'auto';
        option.classList.remove('correct-answer-label', 'incorrect-answer-label');
    });
}

function submitAll() {
    let finalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    quizSubmitted = true;
    
    // First, evaluate all answers and update the userAnswers object
    currentQuizData.forEach((question, index) => {
        if (userAnswers[index] !== undefined) {
            userAnswers[index].isCorrect = userAnswers[index].answer === question.correctAnswer;
        }
    });

    // Then, calculate the final score and counts based on the updated userAnswers
    currentQuizData.forEach((question, index) => {
        if (userAnswers[index] !== undefined) {
            if (userAnswers[index].isCorrect) {
                finalScore += 1;
                correctCount += 1;
            } else {
                finalScore -= 1/3;
                incorrectCount += 1;
            }
        } else {
            unattemptedCount += 1;
        }
    });
    
    const totalQuestions = currentQuizData.length;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="alert alert-primary mt-3 shadow-sm" role="alert">
            <h4 class="alert-heading fw-bold">Quiz Complete! 🏆</h4>
            <hr>
            <p class="mb-0">✅ Correct: <strong>${correctCount}</strong></p>
            <p class="mb-0">❌ Incorrect: <strong>${incorrectCount}</strong></p>
            <p class="mb-0">⚪ Unattempted: <strong>${unattemptedCount}</strong></p>
            <h5 class="mt-2 text-primary">Your Score: ${finalScore.toFixed(2)} / ${totalQuestions}</h5>
        </div>
    `;

    document.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
    
    // We update the navigation highlights here to reflect the results
    updateNavHighlights();
    
    // Disable the navigation buttons after submission
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
    // Keep 'Clear' button disabled too
    document.getElementById('clear-btn').disabled = true;
    
    // Show feedback for the currently viewed question immediately
    showFeedback();
}