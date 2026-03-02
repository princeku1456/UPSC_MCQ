const { chromium } = require('playwright');
const path = require('path');

async function runTest() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Use the already running server on port 8080
    await page.goto('http://localhost:8080');

    // Wait for the Dashboard
    await page.waitForSelector('#dashboard-section', { state: 'visible' });

    // Ensure mock data loads by evaluating logic similar to the test script if necessary,
    // but full_ui_test handles this. For visual verification let's inject a mock auth directly on the page

    await page.evaluate(() => {
        // mock auth to bypass login
        window.firebase = {
            auth: () => ({
                onAuthStateChanged: (cb) => {
                    cb({ uid: "testuser", email: "test@example.com" });
                }
            }),
            firestore: () => ({
                collection: () => ({
                    doc: () => ({
                        get: async () => ({
                            exists: true,
                            data: () => ({}),
                            size: 0,
                            docs: []
                        }),
                        collection: () => ({
                            get: async () => ({ size: 0, docs: [] })
                        })
                    })
                })
            })
        };
        // Trigger auth callback to load dashboard
        if(window.initApp) window.initApp();
    });

    // We'll give it a moment to mock render
    await page.waitForTimeout(2000);

    // Wait for "History" topic card
    try {
        await page.waitForSelector('.topic-card', { state: 'visible', timeout: 3000 });

        // Find Practice buttons
        const practiceBtns = await page.$$('.btn-outline-primary');
        if (practiceBtns.length > 0) {
            await practiceBtns[0].click();
            await page.waitForSelector('#practice-nav-container', { state: 'visible' });
            await page.waitForSelector('.nav-item-animate', { state: 'visible' });
        }
    } catch (e) {
        console.log("Could not find normal buttons, running UI test mocked page setup.");
    }

    // Screenshot
    await page.screenshot({ path: '/home/jules/verification/practice_nav.png' });
    console.log('Screenshot taken!');

    await browser.close();
}

runTest().catch(console.error);
