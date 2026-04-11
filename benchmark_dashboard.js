const userHistory = [];
// Generate mock user history
for (let i = 0; i < 5000; i++) {
  const userAnswers = {};
  for (let j = 0; j < 100; j++) {
    userAnswers[`q${j}`] = { isCorrect: Math.random() > 0.5 };
  }
  userHistory.push({
    scorePercent: Math.random() * 100,
    subject: `Subject${i % 5}`,
    userAnswers,
    totalMarks: 200,
    chapterName: `Chapter ${i}`,
    timestamp: { seconds: Date.now() / 1000 - i * 86400 }
  });
}

function original() {
  const totalTests = userHistory.length;
  let totalScoreSum = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalAttempted = 0;
  const subjectStats = {};

  userHistory.forEach((r) => {
    totalScoreSum += r.scorePercent;

    if (!subjectStats[r.subject]) {
      subjectStats[r.subject] = { totalScore: 0, count: 0 };
    }
    subjectStats[r.subject].totalScore += r.scorePercent;
    subjectStats[r.subject].count++;

    if (r.userAnswers) {
      Object.values(r.userAnswers).forEach((ans) => {
        totalAttempted++;
        if (ans.isCorrect) totalCorrect++;
        else totalIncorrect++;
      });
    }
  });

  const allTestsDetailed = userHistory.map((r) => {
    let correct = 0, incorrect = 0, unattempted = 0;
    if (r.userAnswers) {
      Object.values(r.userAnswers).forEach((ans) => {
        if (ans.isCorrect) correct++;
        else incorrect++;
      });
    }
    const totalQs = r.totalMarks ? r.totalMarks / 2 : correct + incorrect;
    unattempted = Math.max(0, totalQs - (correct + incorrect));
    const dateStr = r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleDateString() : "Unknown Date";
    return `
      - ${dateStr}: ${r.chapterName} (${r.subject})
        Score: ${r.scorePercent}% | Breakdown: ${correct} Correct, ${incorrect} Incorrect, ${unattempted} Unattempted.
      `;
  }).join("\n");

  return allTestsDetailed.length;
}

function optimized() {
  const totalTests = userHistory.length;
  let totalScoreSum = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalAttempted = 0;
  const subjectStats = {};

  const allTestsDetailedArray = [];

  for (let i = 0; i < userHistory.length; i++) {
    const r = userHistory[i];
    totalScoreSum += r.scorePercent;

    if (!subjectStats[r.subject]) {
      subjectStats[r.subject] = { totalScore: 0, count: 0 };
    }
    subjectStats[r.subject].totalScore += r.scorePercent;
    subjectStats[r.subject].count++;

    let correct = 0, incorrect = 0;
    if (r.userAnswers) {
      for (const key in r.userAnswers) {
        const ans = r.userAnswers[key];
        totalAttempted++;
        if (ans.isCorrect) {
          totalCorrect++;
          correct++;
        } else {
          totalIncorrect++;
          incorrect++;
        }
      }
    }

    const totalQs = r.totalMarks ? r.totalMarks / 2 : correct + incorrect;
    const unattempted = Math.max(0, totalQs - (correct + incorrect));
    const dateStr = r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleDateString() : "Unknown Date";

    allTestsDetailedArray.push(`
      - ${dateStr}: ${r.chapterName} (${r.subject})
        Score: ${r.scorePercent}% | Breakdown: ${correct} Correct, ${incorrect} Incorrect, ${unattempted} Unattempted.
      `);
  }

  const allTestsDetailed = allTestsDetailedArray.join("\n");
  return allTestsDetailed.length;
}

// Warmup
for (let i = 0; i < 5; i++) {
  original();
  optimized();
}

const t1 = performance.now();
for (let i = 0; i < 10; i++) original();
const t2 = performance.now();

const t3 = performance.now();
for (let i = 0; i < 10; i++) optimized();
const t4 = performance.now();

console.log(`Original: ${t2 - t1}ms`);
console.log(`Optimized: ${t4 - t3}ms`);
console.log(`Improvement: ${((t2 - t1 - (t4 - t3)) / (t2 - t1) * 100).toFixed(2)}%`);
