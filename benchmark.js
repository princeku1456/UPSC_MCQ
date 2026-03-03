const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <select id="chapSelect"></select>
      <script>
        window.runBenchmark = () => {
          const iterations = 100;
          const sortedChapters = Array.from({length: 1000}, (_, i) => \`Test-\${i}\`);
          const sub = "Subject";

          const chapSelect = document.getElementById("chapSelect");

          // Baseline
          let start1 = performance.now();
          for (let i = 0; i < iterations; i++) {
              chapSelect.innerHTML = '';
              sortedChapters.forEach((chapId) => {
                  const opt = document.createElement("option");
                  opt.value = sub.replace(/\\s+/g, "_") + "_" + chapId;
                  opt.textContent = chapId;
                  chapSelect.appendChild(opt);
              });
              // Force layout recalculation
              chapSelect.offsetHeight;
          }
          let end1 = performance.now();
          const baselineMs = end1 - start1;

          // Optimized
          let start2 = performance.now();
          for (let i = 0; i < iterations; i++) {
              chapSelect.innerHTML = '';
              const fragment = document.createDocumentFragment();
              sortedChapters.forEach((chapId) => {
                  const opt = document.createElement("option");
                  opt.value = sub.replace(/\\s+/g, "_") + "_" + chapId;
                  opt.textContent = chapId;
                  fragment.appendChild(opt);
              });
              chapSelect.appendChild(fragment);
              // Force layout recalculation
              chapSelect.offsetHeight;
          }
          let end2 = performance.now();
          const optimizedMs = end2 - start2;

          return { baselineMs, optimizedMs };
        };
      </script>
    </body>
    </html>
  `);

  const results = await page.evaluate(() => window.runBenchmark());
  console.log('Results:', results);
  await browser.close();
})();
