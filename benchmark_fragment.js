const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Create a simple test page
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="container"></div>
      </body>
    </html>
  `);

  const numItems = 1000;

  // Evaluate baseline (appending directly in a loop)
  const baselineTime = await page.evaluate((numItems) => {
    return new Promise((resolve) => {
      const container = document.getElementById('container');
      container.innerHTML = '';

      const start = performance.now();
      for (let i = 0; i < numItems; i++) {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = 'Item ' + i;
        container.appendChild(div); // Causes reflows/repaints
      }

      // Force layout to ensure it's rendered
      container.offsetHeight;

      const end = performance.now();
      resolve(end - start);
    });
  }, numItems);

  console.log(`Baseline (Direct Append): ${baselineTime.toFixed(2)}ms`);

  // Evaluate optimized (using DocumentFragment)
  const optimizedTime = await page.evaluate((numItems) => {
    return new Promise((resolve) => {
      const container = document.getElementById('container');
      container.innerHTML = '';

      const start = performance.now();
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < numItems; i++) {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = 'Item ' + i;
        fragment.appendChild(div);
      }
      container.appendChild(fragment); // One single DOM update

      // Force layout
      container.offsetHeight;

      const end = performance.now();
      resolve(end - start);
    });
  }, numItems);

  console.log(`Optimized (DocumentFragment): ${optimizedTime.toFixed(2)}ms`);

  const improvement = ((baselineTime - optimizedTime) / baselineTime) * 100;
  console.log(`Improvement: ${improvement.toFixed(2)}%`);

  await browser.close();
})();
