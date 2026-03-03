const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/index.html');

  await page.evaluate(() => {
    // Inject our mock layout
    document.body.innerHTML = `
      <div id="quiz-section">
        <div class="row">
          <div class="col-lg-8" id="quiz-content-wrapper">
             <div id="quiz-content"></div>
          </div>
          <div class="col-lg-4" style="display:block;">
             <div id="quiz-nav" class="card p-3 shadow-sm sticky-top" style="top: 20px;">
                <div class="nav-header">Question Palette</div>
                <div class="timer-container shadow-sm position-relative" style="padding-bottom: 45px !important;">
                    <span class="timer-label">Time Remaining</span>
                    <div id="timer-display" class="timer-value">00:00</div>
                </div>
                <div id="nav-container" class="nav-grid"></div>
             </div>
          </div>
        </div>
      </div>
    `;

    // Inject mock data for quiz
    window.currentQuizData = new Array(30).fill({});
    window.currentQuestionIndex = 3;
    window.userAnswers = {
        0: { answer: 1 },
        1: { answer: 2 },
        2: { answer: 0 }
    };
    window.markedForReview = { 4: true, 5: true };
    window.quizSubmitted = false;

    // Mock functions
    window.updateQuestionTimer = () => {};
    window.renderQuestion = () => {};
    window.saveQuizProgress = () => {};
    window.getCorrectIndex = () => 0; // Mock this since it's used in updateNavHighlights

    // Call our actual rendering function
    window.renderNav();
  });

  // Take screenshot of the navigation area specifically
  await page.waitForTimeout(1000); // Give animations time to complete

  const navElement = await page.$('#quiz-nav');
  if (navElement) {
    await navElement.screenshot({ path: '/tmp/quiz_nav.png' });
  } else {
    await page.screenshot({ path: '/tmp/quiz_nav.png', clip: { x: 0, y: 0, width: 800, height: 600 } });
  }

  await browser.close();
})();
