const { performance } = require('perf_hooks');

const questions = [];
// Generate a lot of questions to make the performance difference measurable
for (let i = 0; i < 10000; i++) {
  questions.push({
    options: ["Option A", "Option B", "Option C", "Option D"]
  });
}
const correctIndex = 1;
const uAns = { answer: 2 };
const status = "incorrect";

function testStringConcatenation() {
  const start = performance.now();
  let resultHtml = "";
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    let optionsHtml = "";
    for (let optIdx = 0; optIdx < question.options.length; optIdx++) {
      let opt = question.options[optIdx];
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
    }
    resultHtml += optionsHtml; // just to prevent optimization
  }
  const end = performance.now();
  return end - start;
}

function testArrayMapJoin() {
  const start = performance.now();
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
  const end = performance.now();
  return end - start;
}

function testArrayPushJoin() {
  const start = performance.now();
  let resultHtml = "";
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const optsArr = [];
    for (let optIdx = 0; optIdx < question.options.length; optIdx++) {
      let opt = question.options[optIdx];
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
      optsArr.push(`<div class="${optionClass}">${icon} <span class="ms-1">${opt}</span></div>`);
    }
    resultHtml += optsArr.join("");
  }
  const end = performance.now();
  return end - start;
}

// Warmup
testStringConcatenation();
testArrayMapJoin();
testArrayPushJoin();

let concatTime = 0;
let mapJoinTime = 0;
let pushJoinTime = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  concatTime += testStringConcatenation();
  mapJoinTime += testArrayMapJoin();
  pushJoinTime += testArrayPushJoin();
}

console.log(`String Concatenation (for loop instead of forEach): ${(concatTime / iterations).toFixed(3)} ms`);
console.log(`Array Map Join: ${(mapJoinTime / iterations).toFixed(3)} ms`);
console.log(`Array Push Join: ${(pushJoinTime / iterations).toFixed(3)} ms`);
