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

  performanceChartInstance = ChartHelper.renderPerformanceChart(ctx, data);
}

/* =========================================
   4. AI MENTOR LOGIC
   ========================================= */

function getStoredApiKey() {
  return localStorage.getItem("gemini_api_key");
}

function saveApiKey() {
  const input = document.getElementById("gemini-api-key");
  const key = input.value.trim();
  if (key) {
    localStorage.setItem("gemini_api_key", key);
    toastr.success("API Key saved securely.");
    updateAIUIState();
  } else {
    toastr.warning("Please enter a valid API Key.");
  }
}

function clearApiKey() {
  localStorage.removeItem("gemini_api_key");
  document.getElementById("ai-review-content").innerHTML = `
    <p>Get a personalized performance review powered by Google Gemini AI. Analyze your weak spots, negative marking patterns, and confidence gaps.</p>
  `;
  updateAIUIState();
  toastr.info("API Key removed.");
}

function updateAIUIState() {
  const key = getStoredApiKey();
  const keyContainer = document.getElementById("ai-key-container");
  const clearBtn = document.getElementById("btn-clear-key");
  const generateBtn = document.getElementById("btn-generate-ai");

  if (key) {
    keyContainer.style.display = "none";
    clearBtn.style.display = "inline-block";
    generateBtn.disabled = false;
  } else {
    keyContainer.style.display = "block";
    clearBtn.style.display = "none";
  }
}

async function generateAIReview() {
  const key = getStoredApiKey();
  if (!key) {
    toastr.warning("Please enter your Google Gemini API Key first.");
    document.getElementById("gemini-api-key").focus();
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

    // Prepare Data Summary
    const totalTests = userHistory.length;
    const avgScore = document.getElementById("stat-avg-score").textContent;
    const precision =
      document.getElementById("stat-precision-rate").textContent;
    const drain = document.getElementById("stat-negative-drain").textContent;
    const gap = document.getElementById("stat-concept-gap").textContent;

    // Get recent scores (last 5)
    const recentScores = userHistory
      .slice(0, 5)
      .map((r) => `${r.scorePercent}% (${r.chapterName})`)
      .join(", ");

    // Construct Prompt
    const prompt = `
      You are an expert UPSC exam mentor. Analyze this student's performance based on the following metrics:
      - Total Tests Taken: ${totalTests}
      - Average Score: ${avgScore}
      - Precision (Net Accuracy): ${precision}
      - Negative Drain (Marks lost to negative marking): ${drain}
      - Concept Gap (Easy questions missed): ${gap}
      - Recent Test Scores: ${recentScores}

      Provide a personalized, strategic review in 3 concise bullet points.
      1. Identify the biggest weakness (e.g., negative marking, concept clarity).
      2. Highlight a strength or improvement area.
      3. Give one specific actionable advice for the next test.

      Keep the tone professional, encouraging, and direct. Use bolding for key terms.
    `;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
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

    // Render Response (Simple Markdown to HTML conversion for bold/lists)
    const formattedText = aiText
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    contentDiv.innerHTML = `<div class="animate-fade-in">${formattedText}</div>`;
  } catch (error) {
    console.error("AI Error:", error);
    toastr.error("AI Analysis Failed: " + error.message);
    contentDiv.innerHTML = `<p class="text-danger">Failed to generate review. Please check your API Key and try again.</p>`;
    // If auth error, maybe clear key?
    if (error.message.includes("API key")) {
      clearApiKey();
    }
  } finally {
    btn.disabled = false;
    spinner.classList.add("d-none");
    btnText.textContent = "⚡ Analyze My Performance";
  }
}

// Initialize AI UI state on load
document.addEventListener("DOMContentLoaded", () => {
  updateAIUIState();
});