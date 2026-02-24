from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8080/index.html")

    page.evaluate("""
        const loader = document.getElementById("global-loader");
        if (loader) loader.style.display = "none";
        const hero = document.getElementById("hero-section");
        if (hero) hero.style.display = "none";

        window.currentQuizData = [
            {
                text: "Select the incorrect statement:\\nKey:Value\\nA:B",
                options: ["Option 1", "Option 2"],
                correctAnswer: 0
            }
        ];
        window.currentQuestionIndex = 0;
        window.userAnswers = {};
        window.markedForReview = {};
        window.quizSubmitted = false;

        currentQuizData = window.currentQuizData;
        currentQuestionIndex = 0;
        userAnswers = {};
        markedForReview = {};
        quizSubmitted = false;

        const quizSection = document.getElementById("quiz-section");
        if (quizSection) quizSection.style.display = "block";

        const quizContent = document.getElementById("quiz-content");
        if (quizContent) quizContent.innerHTML = '<div id="question-container"></div>';

        try {
            renderQuestion();
        } catch (e) {
            console.error("renderQuestion failed:", e);
        }
    """)
    page.screenshot(path="verification_screenshot_final.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
