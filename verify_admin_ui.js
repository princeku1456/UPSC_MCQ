const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Route interception to inject mocks before scripts load
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.url().includes("config.js")) {
        // Provide mock config
        route.fulfill({
            status: 200,
            contentType: "application/javascript",
            body: `
                console.log("Injecting Mock Config...");
                window.firebase = {
                  auth: () => ({
                    onAuthStateChanged: (cb) => {
                      cb({ uid: "mock-admin-id", email: "admin@test.com" });
                    },
                    signInWithEmailAndPassword: async () => {},
                    signOut: async () => {}
                  }),
                  firestore: () => ({
                    collection: (colPath) => ({
                      doc: (docId) => ({
                        get: async () => {
                          const mockDbData = {
                            "admins": { "mock-admin-id": { role: "admin" } }
                          };
                          const docData = mockDbData[colPath]?.[docId];
                          return {
                            exists: !!docData,
                            data: () => docData || {}
                          };
                        }
                      }),
                      get: async () => {
                          const mockDbData = {
                              "results": {
                                "result1": { userEmail: "test1@gmail.com", score: 10 },
                                "result2": { userEmail: "guest", score: 5 },
                                "result3": { userEmail: "test2@gmail.com", score: 20 },
                                "result4": { userEmail: "test1@gmail.com", score: 15 }
                              }
                          };
                          const colData = mockDbData[colPath] || {};
                          const docs = Object.values(colData).map(data => ({
                              data: () => data
                          }));
                          return {
                              empty: docs.length === 0,
                              forEach: (cb) => docs.forEach(cb)
                          };
                      }
                    })
                  })
                };
            `
        });
    } else if (request.url().includes("auth.js") || request.url().includes("utils.js")) {
        // Provide mock utils to prevent real firebase interactions
        route.fulfill({
            status: 200,
            contentType: "application/javascript",
            body: `
                window.DataManager = {
                    fetchQuizManifest: async () => ({ "Math": { "Test-1": {} } })
                };
            `
        });
    } else if (request.url().includes("www.gstatic.com")) {
        // Block external firebase
        route.fulfill({ status: 200, body: "" });
    } else {
        route.continue();
    }
  });

  // Navigate to the admin page
  await page.goto("http://localhost:8080/admin.html");

  // Actually, wait for the dashboard to be visible
  await page.waitForSelector("#admin-dashboard-section", { state: "visible" });
  console.log("Admin dashboard loaded.");

  // Let the async code (loadAllUserEmails) execute
  await page.waitForTimeout(500);

  const optionsCount = await page.evaluate(() => {
    const list = document.getElementById("user-emails-list");
    return list ? list.options.length : 0;
  });

  const optionValues = await page.evaluate(() => {
    const list = document.getElementById("user-emails-list");
    if (!list) return [];
    return Array.from(list.options).map(opt => opt.value);
  });

  if (optionsCount === 2 && optionValues.includes("test1@gmail.com") && optionValues.includes("test2@gmail.com")) {
      console.log("✅ Datalist populated correctly!");
  } else {
      console.error("❌ Datalist failed to populate. Found values:", optionValues);
      process.exit(1);
  }

  await browser.close();
  console.log("🎉 ALL TESTS PASSED!");
})();