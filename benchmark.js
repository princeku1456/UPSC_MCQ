const { chromium } = require('playwright');
const path = require('path');

async function runBenchmark() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Serve a simple HTML file with the JS
    await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                #practice-nav-container { display: flex; flex-wrap: wrap; }
                .nav-item { width: 30px; height: 30px; margin: 2px; }
            </style>
        </head>
        <body>
            <div id="practice-nav-container"></div>
            <script>
                // Mock data
                window.practiceQuizData = new Array(5000).fill({});
                window.practiceCurrentIndex = 0;
                window.renderPracticeQuestion = () => {};
                window.updatePracticeNavHighlights = () => {};

                function renderPracticeNav() {
                    const nav = document.getElementById("practice-nav-container");
                    nav.innerHTML = "";

                    // Original implementation
                    practiceQuizData.forEach((_, i) => {
                        const item = document.createElement("div");
                        item.className = "nav-item shadow-sm nav-item-animate";
                        item.textContent = i + 1;
                        item.style.setProperty("--animation-delay", \`\${i * 30}ms\`);

                        // Accessibility Attributes
                        item.setAttribute("role", "button");
                        item.setAttribute("tabindex", "0");
                        item.setAttribute("aria-label", \`Question \${i + 1}\`);
                        item.onkeydown = (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                item.click();
                            }
                        };

                        item.onclick = () => {
                        practiceCurrentIndex = i;
                        renderPracticeQuestion();
                        updatePracticeNavHighlights();
                        };
                        nav.appendChild(item);
                    });
                    updatePracticeNavHighlights();
                }

                window.runTest = () => {
                    const start = performance.now();
                    renderPracticeNav();
                    const end = performance.now();
                    return end - start;
                };
            </script>
        </body>
        </html>
    `);

    // Warm up
    await page.evaluate(() => window.runTest());

    // Run benchmark
    const runs = 10;
    let totalTime = 0;
    for (let i = 0; i < runs; i++) {
        const time = await page.evaluate(() => window.runTest());
        totalTime += time;
    }

    console.log(`Average time: ${(totalTime / runs).toFixed(2)}ms`);

    await browser.close();
}

runBenchmark().catch(console.error);
