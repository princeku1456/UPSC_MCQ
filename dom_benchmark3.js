const { chromium } = require('playwright');
const fs = require('fs');

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Benchmark</title>
</head>
<body>
    <table class="table">
        <tbody id="tbody"></tbody>
    </table>
    <script>
        const snapshot = [];
        for (let i = 0; i < 5000; i++) {
            snapshot.push({
                data: () => ({
                    timestamp: { toDate: () => new Date() },
                    subject: 'Math',
                    chapterName: 'Algebra',
                    scorePercent: 85
                }),
                id: \`doc_\${i}\`
            });
        }

        window.runBaseline = function() {
            const tbody = document.getElementById('tbody');
            tbody.innerHTML = '';

            const start = performance.now();
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "N/A";

                const tr = document.createElement("tr");
                tr.innerHTML = \`
                    <td><small class="text-muted">\${date}</small></td>
                    <td><span class="fw-bold">\${data.subject}</span></td>
                    <td>\${data.chapterName}</td>
                    <td><span class="badge bg-primary">\${data.scorePercent}%</span></td>
                    <td class="text-end">
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteAttempt('\${doc.id}', '\${data.chapterName}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                \`;
                tbody.appendChild(tr);
            });
            // Force layout recalculation
            tbody.offsetHeight;
            return performance.now() - start;
        };

        window.runOptimized = function() {
            const tbody = document.getElementById('tbody');
            tbody.innerHTML = '';

            const start = performance.now();
            const fragment = document.createDocumentFragment();
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "N/A";

                const tr = document.createElement("tr");
                tr.innerHTML = \`
                    <td><small class="text-muted">\${date}</small></td>
                    <td><span class="fw-bold">\${data.subject}</span></td>
                    <td>\${data.chapterName}</td>
                    <td><span class="badge bg-primary">\${data.scorePercent}%</span></td>
                    <td class="text-end">
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteAttempt('\${doc.id}', '\${data.chapterName}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                \`;
                fragment.appendChild(tr);
            });
            tbody.appendChild(fragment);
            // Force layout recalculation
            tbody.offsetHeight;
            return performance.now() - start;
        };
    </script>
</body>
</html>
`;

fs.writeFileSync('bench.html', html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${process.cwd()}/bench.html`);

  let baselineTotal = 0;
  let optimizedTotal = 0;
  const iters = 20;

  // warmup
  for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.runBaseline());
      await page.evaluate(() => window.runOptimized());
  }

  for (let i = 0; i < iters; i++) {
      baselineTotal += await page.evaluate(() => window.runBaseline());
      optimizedTotal += await page.evaluate(() => window.runOptimized());
  }

  console.log(`Baseline (appendChild in loop): ${baselineTotal.toFixed(2)}ms`);
  console.log(`Optimized (DocumentFragment): ${optimizedTotal.toFixed(2)}ms`);
  console.log(`Improvement: ${((baselineTotal - optimizedTotal) / baselineTotal * 100).toFixed(2)}%`);

  await browser.close();
})();
