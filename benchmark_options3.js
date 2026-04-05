const { performance } = require('perf_hooks');

const questions = Array.from({ length: 1000 }, (_, i) => ({
    options: ["Option A", "Option B", "Option C", "Option D"]
}));

function baseline() {
    let result = "";
    questions.forEach((q, i) => {
        let optionsHtml = "";
        const correctIndex = 1;
        const uAns = { answer: 2 };
        const status = "incorrect";
        q.options.forEach((opt, optIdx) => {
          let optionClass = "option p-3 mb-2 border rounded";
          let icon = "";
          if (optIdx === correctIndex) {
            optionClass =
              "option p-3 mb-2 border rounded bg-success-subtle border-success fw-bold text-success";
            icon = "✅";
          } else if (uAns && uAns.answer === optIdx && status === "incorrect") {
            optionClass =
              "option p-3 mb-2 border rounded bg-danger-subtle border-danger text-danger";
            icon = "❌";
          }
          optionsHtml += `<div class="${optionClass}">${icon} <span class="ms-1">${opt}</span></div>`;
        });
        result += optionsHtml;
    });
    return result;
}

function optimized() {
    let result = "";
    questions.forEach((q, i) => {
        const correctIndex = 1;
        const uAns = { answer: 2 };
        const status = "incorrect";

        let optionsHtml = q.options.map((opt, optIdx) => {
          let optionClass = "option p-3 mb-2 border rounded";
          let icon = "";
          if (optIdx === correctIndex) {
            optionClass =
              "option p-3 mb-2 border rounded bg-success-subtle border-success fw-bold text-success";
            icon = "✅";
          } else if (uAns && uAns.answer === optIdx && status === "incorrect") {
            optionClass =
              "option p-3 mb-2 border rounded bg-danger-subtle border-danger text-danger";
            icon = "❌";
          }
          return `<div class="${optionClass}">${icon} <span class="ms-1">${opt}</span></div>`;
        }).join("");
        result += optionsHtml;
    });
    return result;
}

function optimized2() {
    let optionsHtmlArray = [];
    questions.forEach((q, i) => {
        const correctIndex = 1;
        const uAns = { answer: 2 };
        const status = "incorrect";

        let opts = q.options.map((opt, optIdx) => {
          let optionClass = "option p-3 mb-2 border rounded";
          let icon = "";
          if (optIdx === correctIndex) {
            optionClass =
              "option p-3 mb-2 border rounded bg-success-subtle border-success fw-bold text-success";
            icon = "✅";
          } else if (uAns && uAns.answer === optIdx && status === "incorrect") {
            optionClass =
              "option p-3 mb-2 border rounded bg-danger-subtle border-danger text-danger";
            icon = "❌";
          }
          return `<div class="${optionClass}">${icon} <span class="ms-1">${opt}</span></div>`;
        });
        optionsHtmlArray.push(opts.join(''));
    });
    return optionsHtmlArray.join('');
}


function runBenchmark() {
    const iter = 1000;

    // warm up
    for(let i=0; i<100; i++) { baseline(); optimized(); optimized2(); }

    const t0 = performance.now();
    for(let i=0; i<iter; i++) baseline();
    const t1 = performance.now();

    const t2 = performance.now();
    for(let i=0; i<iter; i++) optimized();
    const t3 = performance.now();

    const t4 = performance.now();
    for(let i=0; i<iter; i++) optimized2();
    const t5 = performance.now();


    console.log(`Baseline: ${t1 - t0} ms`);
    console.log(`Optimized (map.join): ${t3 - t2} ms`);
    console.log(`Optimized2 (array.push.join): ${t5 - t4} ms`);
}

runBenchmark();
