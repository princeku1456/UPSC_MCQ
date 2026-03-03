const { chromium } = require('playwright');
const http = require('http');
const { exec } = require('child_process');

async function runBenchmark() {
  console.log('Starting Benchmark...');

  // Start server
  const serverProcess = exec('python3 -m http.server 8080');

  // Give server time to fully start
  await new Promise(resolve => setTimeout(resolve, 3000));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  // Mock Dialogs (Alerts/Confirms)
  page.on('dialog', async dialog => {
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

  await page.addInitScript(() => {
    // Generate mock data for performance testing (a lot of chapters)
    const mockChapters = {};
    for (let i = 1; i <= 2000; i++) {
      mockChapters[`Test-${i}`] = `Test-${i}`;
    }

    const mockData = {
      'quiz_metadata/quiz_manifest': {
        'History': mockChapters
      }
    };

    window.firebase = {
      apps: [],
      initializeApp: () => { console.log('Firebase App Initialized'); },
      auth: () => ({
        onAuthStateChanged: (cb) => {
          setTimeout(() => cb({ uid: 'test-user-123', reload: () => Promise.resolve() }), 100);
          return () => {};
        },
        currentUser: { uid: 'test-user-123', reload: () => Promise.resolve() }
      }),
      firestore: () => ({
        settings: () => {},
        collection: (colName) => ({
          doc: (docId) => ({
            get: () => {
              const key = `${colName}/${docId}`;
              const data = mockData[key] || {};
              return Promise.resolve({ exists: true, data: () => data });
            }
          }),
          where: () => ({
             orderBy: () => ({
                 get: () => Promise.resolve({ docs: [], size: 0 })
             })
          })
        })
      })
    };
    window.firebase.auth.GoogleAuthProvider = class {};
    window.firebase.firestore.persistentLocalCache = () => ({});
    window.firebase.firestore.persistentMultipleTabManager = () => ({});

  });

  try {
    await page.goto('http://localhost:8080/index.html');

    // Wait for Dashboard to load
    await page.waitForSelector('#dashboard-section', { state: 'visible', timeout: 10000 });

    // Go to Subjects
    await page.click('h3.text-success:has-text("Take Test")');
    await page.waitForSelector('#test-selection-section', { state: 'visible' });

    // Click History to trigger renderChapters
    await page.evaluate(() => {
      window.performance.mark('start-render-chapters');
    });

    console.log("Clicking history...");
    await page.click('h5.card-title:has-text("History")');

    // Wait for the first chapter to be rendered
    await page.waitForSelector('h5.card-title:has-text("Test-1")', { state: 'visible', timeout: 10000 });

    const measure = await page.evaluate(() => {
      window.performance.mark('end-render-chapters');
      window.performance.measure('renderChapters', 'start-render-chapters', 'end-render-chapters');
      return window.performance.getEntriesByName('renderChapters')[0].duration;
    });

    console.log(`Render time for chapters: ${measure.toFixed(2)} ms`);
    return measure;
  } catch (error) {
    console.error('Benchmark failed:', error);
  } finally {
    await browser.close();
    serverProcess.kill();
  }
}

runBenchmark();
