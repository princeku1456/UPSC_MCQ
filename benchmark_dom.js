const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // We will inject a simple HTML page to test DOM thrashing vs DocumentFragment
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
        <div id="container"></div>
        <script>
            function runThrashing(items) {
                const container = document.getElementById('container');
                container.innerHTML = '';
                const start = performance.now();
                for (let i = 0; i < items; i++) {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.innerHTML = '<span>Item ' + i + '</span>';
                    container.appendChild(div);
                }
                // force reflow
                container.offsetHeight;
                return performance.now() - start;
            }

            function runFragment(items) {
                const container = document.getElementById('container');
                container.innerHTML = '';
                const start = performance.now();
                const fragment = document.createDocumentFragment();
                for (let i = 0; i < items; i++) {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.innerHTML = '<span>Item ' + i + '</span>';
                    fragment.appendChild(div);
                }
                container.appendChild(fragment);
                // force reflow
                container.offsetHeight;
                return performance.now() - start;
            }
        </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);

    // Warmup
    await page.evaluate(() => { runThrashing(100); runFragment(100); });

    const items = 5000;
    const runs = 10;

    let thrashingTotal = 0;
    for(let i=0; i<runs; i++) {
        thrashingTotal += await page.evaluate((items) => runThrashing(items), items);
    }

    let fragmentTotal = 0;
    for(let i=0; i<runs; i++) {
        fragmentTotal += await page.evaluate((items) => runFragment(items), items);
    }

    console.log(`Baseline (Thrashing) average for ${items} items: ${(thrashingTotal/runs).toFixed(2)}ms`);
    console.log(`Optimized (DocumentFragment) average for ${items} items: ${(fragmentTotal/runs).toFixed(2)}ms`);

    await browser.close();
})();
