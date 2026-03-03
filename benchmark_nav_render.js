const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <div id="nav-container"></div>
  `);

  await page.evaluate(() => {
    window.currentQuizData = new Array(100).fill({});
    window.updateQuestionTimer = () => {};
    window.renderQuestion = () => {};
    window.updateNavHighlights = () => {};
    window.saveQuizProgress = () => {};
    window.currentQuestionIndex = 0;

    // Original function
    window.renderNavOriginal = function() {
      const nav = document.getElementById("nav-container");
      nav.innerHTML = "";
      currentQuizData.forEach((_, i) => {
        const item = document.createElement("div");
        item.className = "nav-item shadow-sm nav-item-animate";
        item.textContent = i + 1;
        item.style.setProperty("--animation-delay", `${i * 30}ms`);

        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-label", `Question ${i + 1}`);
        item.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        };

        item.onclick = () => {
          updateQuestionTimer();
          currentQuestionIndex = i;
          renderQuestion();
          updateNavHighlights();
          saveQuizProgress();
        };
        nav.appendChild(item);
      });
      updateNavHighlights();
    };

    window.renderNavOptimized = function() {
      const nav = document.getElementById("nav-container");
      nav.innerHTML = "";
      const fragment = document.createDocumentFragment();
      currentQuizData.forEach((_, i) => {
        const item = document.createElement("div");
        item.className = "nav-item shadow-sm nav-item-animate";
        item.textContent = i + 1;
        item.style.setProperty("--animation-delay", `${i * 30}ms`);

        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-label", `Question ${i + 1}`);
        item.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        };

        item.onclick = () => {
          updateQuestionTimer();
          currentQuestionIndex = i;
          renderQuestion();
          updateNavHighlights();
          saveQuizProgress();
        };
        fragment.appendChild(item);
      });
      nav.appendChild(fragment);
      updateNavHighlights();
    };
  });

  const results = await page.evaluate(() => {
    const iters = 1000;

    // Warmup
    for (let i = 0; i < 100; i++) {
        renderNavOriginal();
        renderNavOptimized();
    }

    let start = performance.now();
    for (let i = 0; i < iters; i++) {
        renderNavOriginal();
    }
    const tOriginal = performance.now() - start;

    start = performance.now();
    for (let i = 0; i < iters; i++) {
        renderNavOptimized();
    }
    const tOptimized = performance.now() - start;

    return {
      original: tOriginal,
      optimized: tOptimized
    };
  });

  console.log(`Baseline (Live DOM Append): ${results.original.toFixed(2)}ms`);
  console.log(`Optimized (DocumentFragment): ${results.optimized.toFixed(2)}ms`);
  const improvement = ((results.original - results.optimized) / results.original * 100).toFixed(2);
  console.log(`Improvement: ${improvement}% faster`);

  await browser.close();
})();
