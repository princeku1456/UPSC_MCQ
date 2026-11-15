const { performance } = require('perf_hooks');

const q = { options: ['Option A', 'Option B', 'Option C', 'Option D'] };
const correctIndex = 1;
const optionBuckets = [
    [{ name: 'User 1', surety: 100 }, { name: 'User 2', surety: 50 }],
    [{ name: 'User 3', surety: 100 }, { name: 'User 4', surety: 100 }, { name: 'User 5', surety: 75 }],
    [],
    [{ name: 'User 6', surety: 50 }]
];
const results = Array(6).fill({});

function concatApproach() {
    let optionsHtml = "";
    q.options.forEach((opt, oIdx) => {
      const isCorrect = oIdx === correctIndex;
      const users = optionBuckets[oIdx];
      const percent = results.length > 0 ? Math.round((users.length / results.length) * 100) : 0;

      optionsHtml += `
        <div class="p-3 border rounded-3 mb-2 ${isCorrect ? "bg-success bg-opacity-10 border-success" : "bg-white"}">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge ${isCorrect ? "bg-success" : "bg-secondary"} me-2">${String.fromCharCode(65 + oIdx)}</span>
                    <span class="${isCorrect ? "fw-bold text-success" : ""}">${opt}</span>
                </div>
                <span class="fw-bold text-muted small">${users.length} Users (${percent}%)</span>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-2 user-list-container">
                ${users.map(u => `
                    <span class="badge user-tag d-flex align-items-center gap-1">
                        ${u.name}
                        <strong class="text-primary" style="font-size: 0.65rem; border-left: 1px solid #ddd; padding-left: 4px;">
                            ${u.surety}
                        </strong>
                    </span>
                `).join("")}
            </div>
        </div>`;
    });
    return optionsHtml;
}

function mapJoinApproach() {
    const optionsHtml = q.options.map((opt, oIdx) => {
      const isCorrect = oIdx === correctIndex;
      const users = optionBuckets[oIdx];
      const percent = results.length > 0 ? Math.round((users.length / results.length) * 100) : 0;

      return `
        <div class="p-3 border rounded-3 mb-2 ${isCorrect ? "bg-success bg-opacity-10 border-success" : "bg-white"}">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge ${isCorrect ? "bg-success" : "bg-secondary"} me-2">${String.fromCharCode(65 + oIdx)}</span>
                    <span class="${isCorrect ? "fw-bold text-success" : ""}">${opt}</span>
                </div>
                <span class="fw-bold text-muted small">${users.length} Users (${percent}%)</span>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-2 user-list-container">
                ${users.map(u => `
                    <span class="badge user-tag d-flex align-items-center gap-1">
                        ${u.name}
                        <strong class="text-primary" style="font-size: 0.65rem; border-left: 1px solid #ddd; padding-left: 4px;">
                            ${u.surety}
                        </strong>
                    </span>
                `).join("")}
            </div>
        </div>`;
    }).join('');
    return optionsHtml;
}

// Warmup
for (let i = 0; i < 1000; i++) {
  concatApproach();
  mapJoinApproach();
}

const ITERATIONS = 100000;

const startConcat = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  concatApproach();
}
const endConcat = performance.now();
console.log(`String concatenation: ${(endConcat - startConcat).toFixed(2)} ms for ${ITERATIONS} iterations`);

const startArray = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  mapJoinApproach();
}
const endArray = performance.now();
console.log(`Array map + join: ${(endArray - startArray).toFixed(2)} ms for ${ITERATIONS} iterations`);
