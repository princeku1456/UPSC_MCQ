/* =========================================
   3. DASHBOARD LOGIC (Stats & Graph)
   ========================================= */

async function loadUserDashboard(forceRefresh = false) {
  if (!currentUser || !currentUser.emailVerified) return;

  // OPTIMIZATION: Load from local cache first to save reads
  if (!forceRefresh) {
    const cachedHistory = localStorage.getItem("user_history_cache");
    if (cachedHistory && userHistory.length === 0) {
      userHistory = JSON.parse(cachedHistory);
      renderDashboardUI();
      if (dashboardDataLoaded) return;
    }
  }

  if (!forceRefresh && dashboardDataLoaded && userHistory.length > 0) {
    renderDashboardUI();
    return;
  }

  try {
    const snapshot = await db
      .collection("results")
      .where("userId", "==", currentUser.uid)
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    userHistory = results;
    
    // OPTIMIZATION: Sync to local storage
    localStorage.setItem("user_history_cache", JSON.stringify(results));
    
    dashboardDataLoaded = true;
    renderDashboardUI();
  } catch (error) {
    console.error("Error loading dashboard:", error);
    toastr.error("Failed to load performance data.");
  }
}

function renderDashboardUI() {
  const results = userHistory;

  // Calculate Statistics
  const totalTests = results.length;
  const avgScore = totalTests
    ? (
        results.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalTests
      ).toFixed(1)
    : 0;

  const subjectCounts = {};
  results.forEach((r) => {
    if (!subjectCounts[r.subject]) subjectCounts[r.subject] = 0;
    if (r.scorePercent > 70) subjectCounts[r.subject]++;
  });
  const bestSubject =
    Object.keys(subjectCounts).sort(
      (a, b) => subjectCounts[b] - subjectCounts[a]
    )[0] || "-";

  // Update UI Elements in index.html
  document.getElementById("stat-total-tests").textContent = totalTests;
  document.getElementById("stat-avg-score").textContent = avgScore + "%";
  document.getElementById("stat-best-subject").textContent = bestSubject;

  // Render the Chart
  renderPerformanceChart(results);
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