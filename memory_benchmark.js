const { performance } = require('perf_hooks');

const questions = [];
for (let i = 0; i < 50000; i++) {
  questions.push({
    options: ["Option A", "Option B", "Option C", "Option D"]
  });
}
const correctIndex = 1;
const uAns = { answer: 2 };
const status = "incorrect";

function testStringConcatenationForEach() {
  let resultHtml = "";
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    let optionsHtml = "";
    question.options.forEach((opt, optIdx) => {
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
    resultHtml += optionsHtml;
  }
  return resultHtml.length;
}

function testArrayMapJoin() {
  let resultHtml = "";
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const optionsHtml = question.options.map((opt, optIdx) => {
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
    resultHtml += optionsHtml;
  }
  return resultHtml.length;
}

function measureMemory(fn) {
  global.gc(); // Force garbage collection if started with --expose-gc
  const startMemory = process.memoryUsage().heapUsed;
  const start = performance.now();
  fn();
  const end = performance.now();
  const endMemory = process.memoryUsage().heapUsed;
  global.gc();
  return { time: end - start, memory: endMemory - startMemory };
}

// Warmup
testStringConcatenationForEach();
testArrayMapJoin();

let concatMetrics = { time: 0, memory: 0 };
let mapJoinMetrics = { time: 0, memory: 0 };
const iterations = 20;

for (let i = 0; i < iterations; i++) {
  const cRes = measureMemory(testStringConcatenationForEach);
  concatMetrics.time += cRes.time;
  concatMetrics.memory += cRes.memory;

  const mRes = measureMemory(testArrayMapJoin);
  mapJoinMetrics.time += mRes.time;
  mapJoinMetrics.memory += mRes.memory;
}

console.log(`String Concatenation: Time=${(concatMetrics.time / iterations).toFixed(2)}ms, Memory Avg=${(concatMetrics.memory / iterations / 1024 / 1024).toFixed(2)} MB`);
console.log(`Array Map Join: Time=${(mapJoinMetrics.time / iterations).toFixed(2)}ms, Memory Avg=${(mapJoinMetrics.memory / iterations / 1024 / 1024).toFixed(2)} MB`);
