const { chromium } = require('playwright');

async function benchmark() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // To simulate realistic DOM structure, we create some elements.
    await page.setContent(`
        <div id="container">
            <h1>Admin Panel</h1>
            <div id="wrapper">
                <select id="subject-select"></select>
                <select id="chapter-select"></select>
                <div id="main-content">
                    <p>Some text</p>
                    <p>More text</p>
                </div>
            </div>
        </div>
    `);

    // We'll benchmark inserting 500 options, more realistic for subjects/chapters
    let numOptions = 500;

    let directTimes = [];
    let fragmentTimes = [];

    // run 20 times each, alternating to reduce bias
    for(let i=0; i<20; i++) {
        const directAppend = await page.evaluate((numOptions) => {
            const subSelect = document.getElementById('subject-select');
            subSelect.innerHTML = ''; // clear

            const start = performance.now();
            for(let j=0; j<numOptions; j++) {
                const opt = document.createElement("option");
                opt.value = "subject-" + j;
                opt.textContent = "subject-" + j;
                subSelect.appendChild(opt);
                // force reflow to mimic real-world browser rendering mid-task if the browser decides to
                subSelect.offsetHeight;
            }
            const end = performance.now();
            return end - start;
        }, numOptions);
        directTimes.push(directAppend);

        const fragmentAppend = await page.evaluate((numOptions) => {
            const subSelect = document.getElementById('subject-select');
            subSelect.innerHTML = ''; // clear

            const start = performance.now();
            const fragment = document.createDocumentFragment();
            for(let j=0; j<numOptions; j++) {
                const opt = document.createElement("option");
                opt.value = "subject-" + j;
                opt.textContent = "subject-" + j;
                fragment.appendChild(opt);
            }
            subSelect.appendChild(fragment);
            // force reflow to mimic real-world browser rendering mid-task if the browser decides to
            subSelect.offsetHeight;
            const end = performance.now();
            return end - start;
        }, numOptions);
        fragmentTimes.push(fragmentAppend);
    }

    const avgDirect = directTimes.reduce((a,b)=>a+b,0)/directTimes.length;
    const avgFragment = fragmentTimes.reduce((a,b)=>a+b,0)/fragmentTimes.length;

    console.log(`Direct append avg time: ${avgDirect.toFixed(2)} ms`);
    console.log(`Fragment append avg time: ${avgFragment.toFixed(2)} ms`);
    console.log(`Improvement: ${((avgDirect - avgFragment) / avgDirect * 100).toFixed(2)}%`);
    await browser.close();
}

benchmark();
