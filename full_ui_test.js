const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function run() {
  console.log('Starting UI Test...');

  // Start server (use 'python' on Windows, 'python3' on Linux/Mac)
  const serverProcess = exec('python -m http.server 8080');
  console.log('Server starting on port 8080...');

  // Give server time to fully start
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('Server started on port 8080');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  // Mock Dialogs (Alerts/Confirms)
  page.on('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });

  // Intercept Firebase Scripts
  await page.route('**/firebase*.js', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: ''
    });
  });

  // Inject Mock Firebase
  await page.addInitScript(() => {
    console.log("Injecting Mock Firebase...");

    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      emailVerified: true,
      reload: () => Promise.resolve()
    };

    const mockData = {
      'quiz_metadata/quiz_manifest': {
        'History': { 'Ancient_India': 'Test-1' }
      },
      'quizzes/History_Ancient_India': {
        questions: [
          { text: 'Who built the Red Fort?', options: ['Shah Jahan', 'Akbar', 'Aurangzeb', 'Jahangir'], correctAnswer: 0, explanation: 'Shah Jahan built it.' },
          { text: 'Capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correctAnswer: 1, explanation: 'New Delhi is the capital.' }
        ]
      },
      'quiz_metadata/practice_manifest': {
        'History': { 'Ancient_India': 'Test-1' }
      },
      'practice_mcqs/History_Ancient_India': {
        questions: [
          { text: 'Practice Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'Exp 1' },
          { text: 'Practice Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 1, explanation: 'Exp 2' }
        ]
      },
      'chapter_stats/History_Ancient_India': {
        average: 60, highestScore: 100, totalAttempts: 5, allScores: [50, 60, 70, 80, 40], leaderboard: []
      }
    };

    window.firebase = {
      apps: [],
      initializeApp: () => { console.log('Firebase App Initialized'); },
      auth: () => ({
        onAuthStateChanged: (cb) => {
          setTimeout(() => cb(mockUser), 100);
          return () => {};
        },
        signInWithPopup: () => Promise.resolve({ user: mockUser }),
        signInWithEmailAndPassword: () => Promise.resolve({ user: mockUser }),
        createUserWithEmailAndPassword: () => Promise.resolve({ user: { ...mockUser, sendEmailVerification: () => {} } }),
        signOut: () => { console.log('Signed Out'); return Promise.resolve(); },
        currentUser: mockUser
      }),
      firestore: () => ({
        settings: () => {},
        collection: (colName) => ({
          doc: (docId) => ({
            get: () => {
              const key = `${colName}/${docId}`;
              const data = mockData[key];
              console.log(`Fetching ${key}: ${data ? 'Found' : 'Not Found'}`);
              return Promise.resolve({
                exists: !!data,
                data: () => data || {}
              });
            },
            set: () => Promise.resolve(),
            update: () => Promise.resolve()
          }),
          where: () => ({
             orderBy: () => ({
                 get: () => Promise.resolve({ docs: [], size: 0 }) // Mock user history
             })
          }),
          add: () => Promise.resolve({ id: 'new-doc-id' })
        }),
        runTransaction: (updateFunction) => {
            // Minimal transaction mock
            return updateFunction({
                get: (ref) => Promise.resolve({ exists: false, data: () => null }),
                set: () => {},
                update: () => {}
            });
        }
      })
    };

    window.firebase.auth.GoogleAuthProvider = class {};
    window.firebase.firestore.persistentLocalCache = () => ({});
    window.firebase.firestore.persistentMultipleTabManager = () => ({});

    // Add these specifically because they are used in config.js
    window.firebase.apps = [];
  });

  try {
    console.log('Navigating to index.html...');
    await page.goto('http://localhost:8080/index.html');

    // 1. Verify Login Flow (Mock automatically logs in)
    console.log('Waiting for Dashboard...');
    await page.waitForSelector('#dashboard-section', { state: 'visible', timeout: 10000 });
    console.log('✅ Dashboard loaded.');

    // 2. Start Quiz Flow
    console.log('Starting Test...');
    await page.click('.card:has-text("Take Test")'); // .card-title.text-success in topic-card

    await page.waitForSelector('#test-selection-section', { state: 'visible' });
    console.log('✅ Test Selection loaded.');

    await page.waitForSelector('h5.card-title:has-text("History")', { timeout: 5000 });
    console.log('✅ Subject "History" found.');
    await page.click('h5.card-title:has-text("History")');

    await page.waitForSelector('h5.card-title:has-text("Ancient_India")', { timeout: 5000 });
    console.log('✅ Chapter "Ancient_India" found.');

    // Click "Start Test" on the chapter card to open modal
    await page.click('.card button:has-text("Start Test")');

    // Wait for the modal button to be ready and click it
    const modalStartBtn = page.locator('#start-quiz-btn');
    await modalStartBtn.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await modalStartBtn.click();

    await page.waitForSelector('#quiz-section', { state: 'visible' });
    console.log('✅ Quiz Section loaded.');

    // Debug content
    // const content = await page.content();
    // console.log(content);

    const questionText = await page.textContent('.question .lead');
    if (questionText.includes('Red Fort')) {
        console.log('✅ Question 1 verified.');
    } else {
        throw new Error('Question text mismatch: ' + questionText);
    }

    // Answer Q1 Correctly (Index 0)
    await page.click('input[value="0"]');

    // Set Confidence (optional, but good for coverage)
    await page.click('.confidence__chip[data-val="100"]');

    await page.click('#next-btn');
    console.log('✅ Navigated to Next Question.');

    // Answer Q2 Incorrectly (Index 0, correct is 1)
    await page.click('input[value="0"]');
    await page.click('.confidence__chip[data-val="50"]');

    // Submit
    console.log('Submitting Test...');
    await page.click('#final-submit-btn');
    // Dialog handled automatically

    await page.waitForSelector('.alert-primary h4:has-text("Test Complete!")');
    console.log('✅ Test Submitted and Result shown.');

    // Exit
    // Use the ID to be precise and avoid matching hidden "Back" buttons in other sections
    await page.click('#quiz-back-btn');
    console.log('✅ Exited Quiz.');

    // Go back to Dashboard to access Practice Mode
    console.log('Navigating back to Dashboard...');
    await page.click('.nav__brand');
    await page.waitForSelector('#dashboard-section', { state: 'visible' });

    // 3. Practice Mode
    console.log('Testing Practice Mode...');
    await page.click('.card:has-text("Practice MCQ")');
    await page.waitForSelector('#test-selection-section', { state: 'visible' });
    console.log('✅ Practice Selection loaded.');

    await page.selectOption('#practice-subject-select', 'History');
    await page.waitForTimeout(500); // Wait for updatePracticeTopics
    await page.selectOption('#practice-topic-select', 'Ancient_India');

    await page.click('button:has-text("Generate Practice")');

    await page.waitForSelector('#quiz-section', { state: 'visible' });
    console.log('✅ Practice Quiz loaded.');

    const pQuestionText = await page.textContent('.question .lead');
    if (pQuestionText.includes('Practice Q')) {
        console.log('✅ Practice Question verified.');
    }

    await page.click('#practice-submit-btn');
    // Dialog handled
    console.log('✅ Practice Submitted.');

    console.log('🎉 ALL TESTS PASSED!');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    await page.screenshot({ path: 'failure.png' });
  } finally {
    await browser.close();
    serverProcess.kill();
  }
}

run();
