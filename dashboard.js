/* =========================================
   3. DASHBOARD LOGIC (Stats & Graph)
   ========================================= */

/* =========================================
   3. DASHBOARD LOGIC (Stats & Graph)
   ========================================= */

async function loadUserDashboard(forceRefresh = false) {
  if (!currentUser || !currentUser.emailVerified) return;

  // Use in-memory check to prevent redundant calls during the same session.
  // We no longer use localStorage because Firestore handles persistence natively.
  if (!forceRefresh && dashboardDataLoaded && userHistory.length > 0) {
    renderDashboardUI();
    return;
  }

  try {
    // Firestore automatically checks its internal IndexedDB cache first.
    // If the data is available and hasn't changed, it serves it instantly.
    const snapshot = await db
      .collection("results")
      .where("userId", "==", currentUser.uid)
      .orderBy("timestamp", "desc")
      .get();

    userHistory = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    dashboardDataLoaded = true;
    renderDashboardUI();
  } catch (error) {
    console.error("Error loading dashboard:", error);
    toastr.error("Failed to load performance data.");
  }
}
/**
 * UPDATED: Renders UI with Precision, Negative Drain, and Concept Gap analysis.
 * Removed "Best Subject" logic.
 */
/**
 * Renders UI with Cumulative Metrics, Precision, Negative Drain, 
 * and Concept Gap analysis based on user history.
 */
function renderDashboardUI() {
  const results = userHistory;

  // 1. Standard Stats Calculation
  const totalTests = results.length;
  const avgScore = totalTests
    ? (results.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalTests).toFixed(1)
    : 0;

  // Initialize accumulators for cumulative metrics
  let totalCorrect = 0, 
      totalIncorrect = 0, 
      totalAttempted = 0, 
      totalQs = 0;
  
  // Initialize Global Confidence Trackers
  const confStats = {
    100: { total: 0, correct: 0 },
    75: { total: 0, correct: 0 },
    50: { total: 0, correct: 0 },
    0: { total: 0, correct: 0 }
  };
  
  // Aggregate data from all tests in a single loop
  results.forEach(res => {
    // Accumulate total possible questions (assuming 2 marks per question)
    if (res.totalMarks) {
      totalQs += (res.totalMarks / 2);
    }

    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach(ans => {
        totalAttempted++;
        if (ans.isCorrect) totalCorrect++;
        else totalIncorrect++;

        // Aggregate Confidence Data for charts
        if (ans.surety !== undefined) {
          confStats[ans.surety].total++;
          if (ans.isCorrect) confStats[ans.surety].correct++;
        }
      });
    }
  });

  // Calculate unattempted questions
  const totalUnattempted = totalQs - totalAttempted;

  // Secondary analysis metrics
  const precisionRate = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0;
  const negativeLoss = totalIncorrect * 0.66;
  const positiveGain = totalCorrect * 2;
  const negativeDrain = positiveGain ? ((negativeLoss / positiveGain) * 100).toFixed(1) : 0;

  // 2. Update Standard UI Elements
  document.getElementById("stat-total-tests").textContent = totalTests;
  document.getElementById("stat-avg-score").textContent = avgScore + "%";
  
  // Update the new cumulative matrix elements
  if (document.getElementById("stat-all-total"))
    document.getElementById("stat-all-total").textContent = totalQs;
  if (document.getElementById("stat-all-attempted"))
    document.getElementById("stat-all-attempted").textContent = totalAttempted;
  if (document.getElementById("stat-all-unattempted"))
    document.getElementById("stat-all-unattempted").textContent = Math.max(0, totalUnattempted);
  if (document.getElementById("stat-all-correct"))
    document.getElementById("stat-all-correct").textContent = totalCorrect;
  if (document.getElementById("stat-all-incorrect"))
    document.getElementById("stat-all-incorrect").textContent = totalIncorrect;

  // Update precision and drain stats if elements exist
  if (document.getElementById("stat-precision-rate")) 
    document.getElementById("stat-precision-rate").textContent = precisionRate + "%";
  if (document.getElementById("stat-negative-drain")) 
    document.getElementById("stat-negative-drain").textContent = negativeDrain + "%";

  // 3. Prepare Confidence Data for Charting
  const confValues = [
    confStats[100].total > 0 ? (confStats[100].correct / confStats[100].total * 100).toFixed(1) : 0,
    confStats[75].total > 0 ? (confStats[75].correct / confStats[75].total * 100).toFixed(1) : 0,
    confStats[50].total > 0 ? (confStats[50].correct / confStats[50].total * 100).toFixed(1) : 0,
    confStats[0].total > 0 ? (confStats[0].correct / confStats[0].total * 100).toFixed(1) : 0
  ];

  // 4. Render All Graphs and Advanced Analysis
  updateConceptGapStat(results);
  renderPerformanceChart(results);
  renderGlobalConfidenceChart(confValues, confStats);
}

/**
 * Renders the Horizontal Global Confidence Chart
 */
// In dashboard.js
function renderGlobalConfidenceChart(values, stats) { // Added stats
  const ctx = document.getElementById("globalConfidenceChart");
  if (!ctx) return;

  if (globalConfidenceChartInstance) {
    globalConfidenceChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#9ca3af" : "#6b7280";

  globalConfidenceChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["100% Confidence", "75% Confidence", "50% Confidence", "0% Confidence"],
      datasets: [
        {
          label: "Aggregate Accuracy",
          data: values,
          backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444"],
          borderRadius: 6,
          borderWidth: 0,
          barThickness: 35
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // Updated tooltip callback
            label: (context) => {
                const idx = context.dataIndex;
                const confKey = [100, 75, 50, 0][idx];
                const s = stats[confKey];
                return [
                    ` Accuracy: ${context.raw}%`,
                    ` Total Attempted: ${s.total}`,
                    ` Total Correct: ${s.correct}`
                ];
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: { display: false },
          ticks: {
            color: textColor,
            callback: (val) => val + "%"
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: textColor,
            font: { weight: '600' }
          },
        },
      },
    },
  });
}

/**
 * NEW: Analyzes global stats to identify "Silly Mistakes" (Concept Gaps).
 * Compares user misses against questions where Global Accuracy is > 65%.
 */
async function updateConceptGapStat(results) {
  const el = document.getElementById("stat-concept-gap");
  if (!el) return;
  el.textContent = "Analyzing...";

  try {
    const uniqueChapters = [...new Set(results.map(r => r.chapterId))];
    const statsMap = {};
    
    // Fetch stats for all unique chapters in history in parallel
    const promises = uniqueChapters.map(async (id) => {
        const doc = await db.collection("chapter_stats").doc(id).get();
        if (doc.exists) statsMap[id] = doc.data();
    });
    await Promise.all(promises);

    let sillyMistakes = 0;
    let totalQuestionsAttempted = 0;

    results.forEach(res => {
        const stats = statsMap[res.chapterId];
        if (!stats || !res.userAnswers) return;

        Object.entries(res.userAnswers).forEach(([index, ans]) => {
            totalQuestionsAttempted++;
            if (!ans.isCorrect) {
                const qIdx = parseInt(index);
                const commCorrect = (stats.correctCounts && stats.correctCounts[qIdx]) || 0;
                const commTotal = (stats.attemptedCounts && stats.attemptedCounts[qIdx]) || 1;
                const commAccuracy = (commCorrect / commTotal) * 100;

                // Flag if user missed a question that 65%+ of the community got right
                if (commAccuracy > 65) sillyMistakes++;
            }
        });
    });

    const gapPercent = totalQuestionsAttempted ? ((sillyMistakes / totalQuestionsAttempted) * 100).toFixed(1) : 0;
    el.textContent = gapPercent + "%";
    
    // Dynamic color coding based on threshold
    const container = el.parentElement;
    if (gapPercent > 15) {
        container.classList.remove("border-info", "border-success");
        container.classList.add("border-danger");
    } else {
        container.classList.remove("border-info", "border-danger");
        container.classList.add("border-success");
    }

  } catch (error) {
    console.error("Concept gap calculation error:", error);
    el.textContent = "N/A";
  }
}

function renderPerformanceChart(data) {
  const ctx = document.getElementById("performanceChart");
  if (!ctx) return;

  if (performanceChartInstance) {
    performanceChartInstance.destroy();
  }

  const chartData = [...data].reverse();

  const labels = chartData.map((item) => {
    if (item.timestamp && item.timestamp.toDate) {
      return new Date(item.timestamp.toDate()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return "Recently";
  });

  const scores = chartData.map((item) => item.scorePercent);
  const subjects = chartData.map((item) => item.subject);
  const chapters = chartData.map((item) => item.chapterName);

  const canvasContext = ctx.getContext("2d");
  const gradientFill = canvasContext.createLinearGradient(0, 0, 0, 400);
  gradientFill.addColorStop(0, "rgba(37, 99, 235, 0.4)");
  gradientFill.addColorStop(1, "rgba(37, 99, 235, 0.0)");

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.05)";
  const tooltipBg = isDark
    ? "rgba(30, 41, 59, 0.95)"
    : "rgba(255, 255, 255, 0.95)";
  const tooltipText = isDark ? "#f3f4f6" : "#1f2937";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";

  performanceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Accuracy",
          data: scores,
          borderColor: "#2563eb",
          borderWidth: 3,
          backgroundColor: gradientFill,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#2563eb",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#f59e0b",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipText,
          bodyColor: tooltipText,
          borderColor: tooltipBorder,
          borderWidth: 1,
          titleFont: { size: 13, weight: "bold" },
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return subjects[index];
            },
            label: (context) => {
              const index = context.dataIndex;
              return [
                `📖 ${chapters[index]}`,
                `📅 ${labels[index]}`,
                `🎯 Score: ${context.raw}%`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: textColor,
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
        },
        y: {
          beginAtZero: true,
          max: 110,
          grid: {
            color: gridColor,
            borderDash: [5, 5],
          },
          ticks: {
            color: textColor,
            font: { size: 11 },
            stepSize: 20,
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });
}