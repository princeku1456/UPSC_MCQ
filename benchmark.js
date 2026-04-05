const subjectStats = {
    "Polity": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    "Economy": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    "History": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    "Geography": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    "Environment": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    "Science and Tech": { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    "IR": { total: 0, correct: 0, incorrect: 0, unattempted: 0 }
};

// Generate 10000 fake questions
const subjects = ["Polity", " economy", "HISTORY ", "Geography", "Environment", "Science and tech", "IR", "Unknown"];
const questions = [];
for (let i = 0; i < 10000; i++) {
    questions.push({ subject: subjects[i % subjects.length] });
}

function runBaseline() {
    let matchedCount = 0;
    const start = process.hrtime.bigint();
    for (let i = 0; i < questions.length; i++) {
        const qSubj = questions[i].subject.trim();
        let matchedSubj = Object.keys(subjectStats).find(
            s => s.toLowerCase() === qSubj.toLowerCase()
        );

        if (!matchedSubj && subjectStats[qSubj]) {
            matchedSubj = qSubj;
        }
        if (matchedSubj) matchedCount++;
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // ms
}

function runOptimized() {
    let matchedCount = 0;
    const start = process.hrtime.bigint();
    const subjectMap = {};
    const keys = Object.keys(subjectStats);
    for (let i = 0; i < keys.length; i++) {
        subjectMap[keys[i].toLowerCase()] = keys[i];
    }

    for (let i = 0; i < questions.length; i++) {
        const qSubj = questions[i].subject.trim();
        let matchedSubj = subjectMap[qSubj.toLowerCase()];

        if (!matchedSubj && subjectStats[qSubj]) {
            matchedSubj = qSubj;
        }
        if (matchedSubj) matchedCount++;
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // ms
}

// Warmup
runBaseline();
runOptimized();

let baseTime = 0;
let optTime = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
    baseTime += runBaseline();
    optTime += runOptimized();
}

console.log(`Baseline Avg: ${(baseTime / iterations).toFixed(3)} ms`);
console.log(`Optimized Avg: ${(optTime / iterations).toFixed(3)} ms`);
console.log(`Improvement: ${((1 - (optTime / baseTime)) * 100).toFixed(2)}%`);
