/* =========================================
   3. DASHBOARD LOGIC (Stats & Graph)
   ========================================= */

/* =========================================
   3. DASHBOARD LOGIC (Stats & Graph)
   ========================================= */

async function loadUserDashboard(forceRefresh = false) {
  if (!currentUser || !currentUser.emailVerified) return;

  // Use in-memory check to prevent redundant calls during the same session.
  // Check if either history is populated or if we have attempted to load (dashboardDataLoaded)
  if (!forceRefresh && dashboardDataLoaded && (userHistory.length > 0 || practiceHistory.length > 0)) {
    renderDashboardUI();
    return;
  }

  try {
    // Incrementally sync user history (Smart Sync)
    // This fetches only new records if local cache exists
    const historyData = await DataManager.syncUserHistory(currentUser.uid, forceRefresh);
    const practiceData = await DataManager.syncPracticeHistory(currentUser.uid, forceRefresh);

    if (historyData) {
        userHistory = historyData;
    }
    if (practiceData) {
        practiceHistory = practiceData;
    }

    if (historyData || practiceData) {
        dashboardDataLoaded = true;
        renderDashboardUI();
    }
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
 * Calculates confidence statistics from user history results.
 * @param {Array} results - The user history array.
 * @returns {Object} { confValues, confStats }
 */
function calculateConfidenceStats(results) {
  // Initialize Global Confidence Trackers
  const confStats = {
    100: { total: 0, correct: 0 },
    75: { total: 0, correct: 0 },
    50: { total: 0, correct: 0 },
    0: { total: 0, correct: 0 }
  };

  // Aggregate data from all tests
  results.forEach(res => {
    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach(ans => {
        // Aggregate Confidence Data for charts
        if (ans.surety !== undefined) {
          confStats[ans.surety].total++;
          if (ans.isCorrect) confStats[ans.surety].correct++;
        }
      });
    }
  });

  // Prepare Confidence Data for Charting
  const confValues = [
    confStats[100].total > 0 ? (confStats[100].correct / confStats[100].total * 100).toFixed(1) : 0,
    confStats[75].total > 0 ? (confStats[75].correct / confStats[75].total * 100).toFixed(1) : 0,
    confStats[50].total > 0 ? (confStats[50].correct / confStats[50].total * 100).toFixed(1) : 0,
    confStats[0].total > 0 ? (confStats[0].correct / confStats[0].total * 100).toFixed(1) : 0
  ];

  return { confValues, confStats };
}

/**
 * Refreshes only the dashboard charts without re-running full UI logic.
 * Useful for theme changes.
 */
function refreshDashboardChartsOnly() {
    if (!userHistory || userHistory.length === 0) return;

    // Refresh Performance Chart
    if (performanceChartInstance) {
        renderPerformanceChart(userHistory);
    }

    // Refresh Global Confidence Chart
    if (globalConfidenceChartInstance) {
         const { confValues, confStats } = calculateConfidenceStats(userHistory);
         renderGlobalConfidenceChart(confValues, confStats);
    }
}

function switchDashboardMode(mode) {
    currentDashboardMode = mode;

    // Update active class on buttons if needed, but the radio inputs handle visual state mostly.
    // If using custom styling on labels, might need to ensure they update.
    // The Bootstrap 'btn-check' + label approach handles visual toggle automatically.

    renderDashboardUI();
}

/**
 * Renders UI.
 * Stats are cumulative (Test + Practice).
 * Charts are toggled based on currentDashboardMode.
 */
function renderDashboardUI() {
  const combinedHistory = [...userHistory, ...practiceHistory];
  const chartData = currentDashboardMode === 'quiz' ? userHistory : practiceHistory;

  // 1. Cumulative Stats Calculation
  const totalTests = combinedHistory.length;
  const avgScore = totalTests
    ? (combinedHistory.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalTests).toFixed(1)
    : 0;

  // Initialize accumulators for cumulative metrics
  let totalCorrect = 0, 
      totalIncorrect = 0, 
      totalAttempted = 0, 
      totalQs = 0;
  
  // Aggregate data (cumulative)
  combinedHistory.forEach(res => {
    if (res.totalMarks) {
      totalQs += (res.totalMarks / 2);
    } else {
       totalQs += (res.correctCount + res.incorrectCount + res.unattemptedCount) || 0;
    }

    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach(ans => {
        if (ans && (ans.answer !== undefined && ans.answer !== -1)) {
            totalAttempted++;
            if (ans.isCorrect) totalCorrect++;
            else totalIncorrect++;
        }
      });
    }
  });

  const totalUnattempted = totalQs - totalAttempted;

  const precisionRate = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0;
  const negativeLoss = totalIncorrect * 0.66;
  const positiveGain = totalCorrect * 2;
  const negativeDrain = positiveGain ? ((negativeLoss / positiveGain) * 100).toFixed(1) : 0;

  // 2. Update Standard UI Elements (Cumulative)
  document.getElementById("stat-total-tests").textContent = totalTests;
  document.getElementById("stat-avg-score").textContent = avgScore + "%";
  
  document.getElementById("stat-all-total").textContent = totalQs;
  document.getElementById("stat-all-attempted").textContent = totalAttempted;
  document.getElementById("stat-all-unattempted").textContent = Math.max(0, totalUnattempted);
  document.getElementById("stat-all-correct").textContent = totalCorrect;
  document.getElementById("stat-all-incorrect").textContent = totalIncorrect;

  document.getElementById("stat-precision-rate").textContent = precisionRate + "%";
  document.getElementById("stat-negative-drain").textContent = negativeDrain + "%";

  // 3. Prepare Confidence Data & Render Charts (Toggled Source)
  const { confValues, confStats } = calculateConfidenceStats(chartData);

  renderPerformanceChart(chartData);
  renderGlobalConfidenceChart(confValues, confStats);

  // Concept Gap Analysis (Cumulative, but practically only Quizzes contribute due to missing global stats for Practice)
  updateConceptGapStat(combinedHistory);
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

  globalConfidenceChartInstance = ChartHelper.renderConfidenceChart(ctx, values, stats);
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
    
    // Fetch stats for all unique chapters in history in parallel using Cache
    const promises = uniqueChapters.map(async (id) => {
        const stats = await DataManager.fetchGlobalStats(id);
        if (stats) statsMap[id] = stats;
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

  performanceChartInstance = ChartHelper.renderPerformanceChart(ctx, data);
}

/* =========================================
   4. AI MENTOR LOGIC
   ========================================= */

async function generateAIReview() {
  // Use global configuration key
  const key = await DataManager.fetchGeminiKey();
  const GEMINI_MODEL = "gemini-flash-latest"; // Validated working alias
   
  if (!key) {
    toastr.warning("AI Service not configured in Firebase. Please contact admin.");
    console.error("Missing gemini_api_key in Firestore (app_config/keys)");
    return;
  }
  
  console.log("Using Gemini Key:", key ? "Loaded" : "MISSING");
  if (!key || key === "YOUR_GEMINI_API_KEY_HERE") {
    toastr.warning("AI Service not configured. Please contact support or check config.js");
    console.error("Missing GEMINI_API_KEY in config.js");
    return;
  }

  const btn = document.getElementById("btn-generate-ai");
  const spinner = document.getElementById("ai-loading-spinner");
  const btnText = document.getElementById("ai-btn-text");
  const contentDiv = document.getElementById("ai-review-content");

  // UI Loading State
  btn.disabled = true;
  spinner.classList.remove("d-none");
  btnText.textContent = "Analyzing...";
  contentDiv.innerHTML = `<div class="text-center text-muted"><p>Thinking...</p></div>`;

  try {
    // Recalculate essentials from userHistory for cleaner data
    if (!userHistory || userHistory.length === 0) {
      throw new Error("No test history available to analyze.");
    }

    // --- 1. Calculate Metrics from Fresh Data ---
    const totalTests = userHistory.length;

    // Aggregators
    let totalScoreSum = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalAttempted = 0;

    // Subject Aggregation
    const subjectStats = {};

    userHistory.forEach((r) => {
      totalScoreSum += r.scorePercent;

      // Subject stats
      if (!subjectStats[r.subject]) {
        subjectStats[r.subject] = { totalScore: 0, count: 0 };
      }
      subjectStats[r.subject].totalScore += r.scorePercent;
      subjectStats[r.subject].count++;

      // Answer stats
      if (r.userAnswers) {
        Object.values(r.userAnswers).forEach((ans) => {
          totalAttempted++;
          if (ans.isCorrect) totalCorrect++;
          else totalIncorrect++;
        });
      }
    });

    // Derived Metrics
    const avgScore = totalTests ? (totalScoreSum / totalTests).toFixed(1) + "%" : "0%";
    const precision = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) + "%" : "0%";

    const negativeLoss = totalIncorrect * 0.66;
    const positiveGain = totalCorrect * 2;
    const drainVal = positiveGain ? ((negativeLoss / positiveGain) * 100).toFixed(1) : 0;
    const drain = drainVal + "%";

    // Concept Gap (must rely on DOM or previous async calc as it requires external chapter stats)
    const gapEl = document.getElementById("stat-concept-gap");
    const gap = gapEl ? gapEl.textContent : "Pending Analysis";

    // Identify Weakest Subject
    let weakestSubject = "N/A";
    let weakestScore = 100;
    Object.entries(subjectStats).forEach(([subj, data]) => {
      const avg = data.totalScore / data.count;
      if (avg < weakestScore) {
        weakestScore = avg;
        weakestSubject = `${subj} (${avg.toFixed(1)}%)`;
      }
    });

    // --- 2. Full History Data Construction ---
    // Map ALL tests for deep pattern analysis
    const allTestsDetailed = userHistory.map((r) => {
      let correct = 0,
        incorrect = 0,
        unattempted = 0;
      if (r.userAnswers) {
        Object.values(r.userAnswers).forEach((ans) => {
          if (ans.isCorrect) correct++;
          else incorrect++;
        });
      }
      // Estimate total questions
      const totalQs = r.totalMarks ? r.totalMarks / 2 : correct + incorrect;
      unattempted = Math.max(0, totalQs - (correct + incorrect));

      // Format date
      const dateStr = r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleDateString() : "Unknown Date";

      return `
      - ${dateStr}: ${r.chapterName} (${r.subject})
        Score: ${r.scorePercent}% | Breakdown: ${correct} Correct, ${incorrect} Incorrect, ${unattempted} Unattempted.
      `;
    }).join("\n");

    // Construct Prompt
    const prompt = `
      Act as the **Lead Academic Strategist** for a premier UPSC Civil Services coaching institute. Your objective is to conduct a **Clinical Performance Audit** for a student using the psychometric and academic datasets provided below. 

      ### **1. STUDENT PERFORMANCE DATASET**
      **Core Metrics:**
      - **Stamina (Total Tests):** ${totalTests} (Reliability of data sample)
      - **Baseline Competency (Avg Score):** ${avgScore}
      - **Efficiency Index (Precision/Accuracy):** ${precision}
      - **Risk Impact (Negative Drain):** ${drain}
      - **Foundational Integrity (Concept Gap):** ${gap} (Critical: Easy questions missed)
      - **High-Priority Weakness:** ${weakestSubject}

      **Raw Longitudinal History:**
      ${allTestsDetailed}

      ---

      ### **2. ANALYTICAL REQUIREMENTS & INSTRUCTIONS**
      Perform your analysis using a **data-first diagnostic approach**. Your review MUST include:

      #### **A. Root Cause Analysis (RCA): Weakest Subject**
      Don't just suggest reading more. Diagnose if the failure in **${weakestSubject}** is due to *Conceptual Fog* (fundamental misunderstanding) or *Application Failure* (unable to eliminate options). Provide a 3-step hierarchical fix (Foundational → Applied → Simulated).

      #### **B. Behavioral Response Mapping**
      Scan the **Longitudinal History** for psychological trends:
      - **Fatigue Decay:** Do scores drop in later tests or during specific streaks?
      - **The Guesswork Trap:** Compare 'Precision' vs 'Negative Drain'. Is the student's "Calculated Risk" actually hurting their net gain?
      - **Volatity vs. Plateau:** Is the student consistently average, or experiencing wild swings in performance?

      #### **C. The 48-Hour Tactical Roadmap**
      Provide exactly **3 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) Tasks** for the very next study session. These must be hyper-specific (e.g., "Review 50 previous 'Easy' misses" rather than "Study more").

      ### **3. STYLE & TONE CONSTRAINTS**
      - **Tone:** authoritative, clinical, data-driven, yet high-conviction and encouraging.
      - **Formatting:** Use **Bold** for critical insights and code blocks or bullet points for specific techniques.
      - **Goal:** Move the student from "Hard Work" to "Precision Work."
    `;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Failed to fetch AI response");
    }

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;

    // Render Response using marked.js for full Markdown support
    // @ts-ignore
    const formattedText = marked.parse(aiText);

    contentDiv.innerHTML = `<div class="animate-fade-in markdown-content">${formattedText}</div>`;
  } catch (error) {
    console.error("AI Error:", error);
    toastr.error("AI Analysis Failed: " + error.message);
    contentDiv.innerHTML = `<p class="text-danger">Failed to generate review. Please check the system configuration.</p>`;
  } finally {
    btn.disabled = false;
    spinner.classList.add("d-none");
    btnText.textContent = "⚡ Analyze My Performance";
  }
}

function toggleMainChart(viewType) {
    const accBtn = document.getElementById("btn-chart-accuracy");
    const confBtn = document.getElementById("btn-chart-confidence");
    const accContainer = document.getElementById("accuracy-chart-container");
    const confContainer = document.getElementById("confidence-chart-container");
    const title = document.getElementById("main-chart-title");

    if (viewType === 'accuracy') {
        accBtn.classList.add("active");
        confBtn.classList.remove("active");

        accContainer.style.display = "block";
        confContainer.style.display = "none";

        title.textContent = "📈 Accuracy Trend";
    } else {
        confBtn.classList.add("active");
        accBtn.classList.remove("active");

        confContainer.style.display = "block";
        accContainer.style.display = "none";

        title.textContent = "🎯 Overall Confidence Analysis";
    }
}
