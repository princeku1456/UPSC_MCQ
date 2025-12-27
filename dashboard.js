/* =========================================
   3. DASHBOARD LOGIC (Stats & History)
   ========================================= */

async function loadUserDashboard(forceRefresh = false) {
  if (!currentUser || !currentUser.emailVerified) return;

  const historyContainer = document.getElementById("history-container");

  if (!forceRefresh && dashboardDataLoaded && userHistory.length > 0) {
    renderDashboardUI();
    return;
  }

  if (historyContainer.children.length === 0) {
    historyContainer.innerHTML =
      '<div class="text-center w-100 py-5"><div class="spinner-border text-primary"></div></div>';
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
    dashboardDataLoaded = true;

    renderDashboardUI();
  } catch (error) {
    console.error("Error loading dashboard:", error);
    historyContainer.innerHTML = `<p class="text-danger text-center">Failed to load history.</p>`;
  }
}

function renderDashboardUI() {
  const historyContainer = document.getElementById("history-container");
  const results = userHistory;

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

  document.getElementById("stat-total-tests").textContent = totalTests;
  document.getElementById("stat-avg-score").textContent = avgScore + "%";
  document.getElementById("stat-best-subject").textContent = bestSubject;

  renderPerformanceChart(results);

  historyContainer.innerHTML = "";
  if (results.length === 0) {
    historyContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No tests taken yet.</div>`;
    return;
  }

  results.forEach((res) => {
    let dateStr = "Just now";
    if (res.timestamp) {
      if (res.timestamp.toDate) {
        dateStr = new Date(res.timestamp.toDate()).toLocaleDateString();
      } else {
        dateStr = new Date(res.timestamp).toLocaleDateString();
      }
    }

    let borderClass = "avg-score";
    if (res.scorePercent >= 80) borderClass = "high-score";
    if (res.scorePercent < 50) borderClass = "low-score";

    const card = document.createElement("div");
    card.className = "col-lg-6 mb-3";
    card.innerHTML = `
            <div class="card history-card p-3 ${borderClass}">
                <div class="d-flex justify-content-between align-items-center">
                    <div style="overflow: hidden;">
                        <h6 class="fw-bold text-primary mb-1 text-truncate">${
                          res.chapterName
                        }</h6>
                        <small class="text-muted">${
                          res.subject
                        } • ${dateStr}</small>
                    </div>
                    <div class="text-end ms-2">
                        <div class="fs-4 fw-bold ${
                          res.scorePercent >= 50
                            ? "text-success"
                            : "text-danger"
                        }">
                            ${res.score.toFixed(
                              1
                            )} <span class="fs-6 text-muted">/ ${
      res.totalMarks
    }</span>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary-custom px-4 shadow w-100 review-btn">👁 Review Performance</button>
                </div>
            </div>
        `;

    // Klik dari dashboard/performance diset sebagai source 'performance'
    card.querySelector(".review-btn").onclick = () => reviewTest(res, "performance");
    historyContainer.appendChild(card);
  });
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