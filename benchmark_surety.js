const { performance } = require('perf_hooks');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
global.document = dom.window.document;

function createSuretyDiv() {
    const suretyDiv = document.createElement("div");
    suretyDiv.innerHTML = `
        <div class="surety-opt surety-100" data-val="100">100%</div>
        <div class="surety-opt surety-75" data-val="75">75%</div>
        <div class="surety-opt surety-50" data-val="50">50%</div>
        <div class="surety-opt surety-0" data-val="0">0%</div>
    `;
    return suretyDiv;
}

// Unoptimized Version
function setupUnoptimized(suretyDiv) {
    suretyDiv.querySelectorAll(".surety-opt").forEach((opt) => {
        opt.onclick = function () {
            suretyDiv.querySelectorAll(".surety-opt").forEach((o) => {
                o.classList.remove("selected");
                o.setAttribute("aria-checked", "false");
            });
            this.classList.add("selected");
            this.setAttribute("aria-checked", "true");
        };
    });
}

// Optimized Version
function setupOptimized(suretyDiv) {
    const suretyOpts = suretyDiv.querySelectorAll(".surety-opt");
    suretyOpts.forEach((opt) => {
        opt.onclick = function () {
            suretyOpts.forEach((o) => {
                o.classList.remove("selected");
                o.setAttribute("aria-checked", "false");
            });
            this.classList.add("selected");
            this.setAttribute("aria-checked", "true");
        };
    });
}

const ITERATIONS = 100000;

function runBenchmark() {
    // Unoptimized
    const divUnoptimized = createSuretyDiv();
    setupUnoptimized(divUnoptimized);
    const optsUnoptimized = divUnoptimized.querySelectorAll(".surety-opt");

    let startUnopt = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optsUnoptimized[i % 4].onclick();
    }
    let endUnopt = performance.now();
    const timeUnoptimized = endUnopt - startUnopt;

    // Optimized
    const divOptimized = createSuretyDiv();
    setupOptimized(divOptimized);
    const optsOptimized = divOptimized.querySelectorAll(".surety-opt");

    let startOpt = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optsOptimized[i % 4].onclick();
    }
    let endOpt = performance.now();
    const timeOptimized = endOpt - startOpt;

    console.log(`Unoptimized Time: ${timeUnoptimized.toFixed(2)} ms`);
    console.log(`Optimized Time: ${timeOptimized.toFixed(2)} ms`);
    console.log(`Improvement: ${((timeUnoptimized - timeOptimized) / timeUnoptimized * 100).toFixed(2)}%`);
}

runBenchmark();
