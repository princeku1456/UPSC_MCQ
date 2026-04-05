const { performance } = require('perf_hooks');

const questions = [];
for (let i = 0; i < 10000; i++) {
  questions.push({
    options: ["Option A", "Option B", "Option C", "Option D"]
  });
}
const correctIndex = 1;
const uAns = { answer: 2 };
const status = "incorrect";

function testStringConcatenationForEach() {
  const start = performance.now();
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

// Warmup
testStringConcatenationForEach();
testArrayMapJoin();

let concatTime = 0;
let mapJoinTime = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  concatTime += testStringConcatenationForEach();
  mapJoinTime += testArrayMapJoin();
}

console.log(`String Concatenation with forEach: ${(concatTime / iterations).toFixed(3)} ms`);
console.log(`Array Map Join: ${(mapJoinTime / iterations).toFixed(3)} ms`);
