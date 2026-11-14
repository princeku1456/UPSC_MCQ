// Basic smoke test for the MCQ portal (P3-7).
// Run with: node e2e_smoke.js  (requires a static server on localhost:8080)
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("http://localhost:8080/index.html", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  // Auth screen and navbar are present
  await page.waitForSelector("#auth-form", { timeout: 10000 });
  await page.waitForSelector("#theme-toggle");
  await page.waitForSelector("#mainNav");

  // Login/Register segmented control works
  await page.click("label[for='auth-mode-register']");
  await page.waitForSelector("#auth-password-hint");
  await page.click("label[for='auth-mode-login']");

  // Theme toggle toggles the data-theme attribute
  const before = await page.getAttribute("html", "data-theme");
  await page.click("#theme-toggle");
  const after = await page.getAttribute("html", "data-theme");
  if (before === after) errors.push("theme toggle did not change data-theme");

  console.log("--- Smoke test result ---");
  console.log(errors.length ? "FAILED" : "PASSED");
  if (errors.length) console.log(errors.join("\n"));

  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => {
  console.error("Smoke test error:", e.message);
  process.exit(1);
});
