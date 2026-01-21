/* =========================================
   UTILS.JS
   Shared utilities for Data Management, Timer, and Charts
   ========================================= */

// Ensure Firebase is ready
const getDb = () => firebase.firestore();

/* =========================================
   1. DATA MANAGER
   ========================================= */
const DataManager = {
    cache: {
        quizManifest: null,
        practiceManifest: null,
        quizzes: {},     // Cache for specific quiz/chapter data
        practice: {},
        geminiKey: null     // Cache for practice questions
    },

    /**
     * Fetches the quiz manifest (Subjects & Chapters)
     */
    async fetchQuizManifest(forceRefresh = false) {
        if (!forceRefresh && this.cache.quizManifest) {
            return this.cache.quizManifest;
        }
        try {
            const doc = await getDb().collection("quiz_metadata").doc("quiz_manifest").get();
            if (doc.exists) {
                this.cache.quizManifest = doc.data();
                // Maintain backward compatibility for existing code that uses global variable
                window.allQuizData = this.cache.quizManifest;
                return this.cache.quizManifest;
            }
        } catch (error) {
            console.error("Error fetching quiz manifest:", error);
        }
        return null;
    },

    async fetchGeminiKey() {
        if (this.cache.geminiKey) return this.cache.geminiKey;
        
        try {
            // Recommendation: Store in 'app_config' collection, 'keys' document
            const doc = await getDb().collection("app_config").doc("keys").get();
            if (doc.exists) {
                this.cache.geminiKey = doc.data().gemini_api_key;
                return this.cache.geminiKey;
            } else {
                console.error("API Key document not found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching Gemini key:", error);
        }
        return null;
    },

    /**
     * Fetches the practice manifest
     */
    async fetchPracticeManifest(forceRefresh = false) {
        if (!forceRefresh && this.cache.practiceManifest) {
            return this.cache.practiceManifest;
        }
        try {
            const doc = await getDb().collection("quiz_metadata").doc("practice_manifest").get();
            if (doc.exists) {
                this.cache.practiceManifest = doc.data();
                // Maintain backward compatibility
                window.allPracticeData = this.cache.practiceManifest;
                return this.cache.practiceManifest;
            }
        } catch (error) {
            console.error("Error fetching practice manifest:", error);
        }
        return null;
    },

    /**
     * Fetches questions for a specific chapter
     */
    async fetchQuizQuestions(chapterId) {
        if (this.cache.quizzes[chapterId]) {
            return this.cache.quizzes[chapterId];
        }
        try {
            const doc = await getDb().collection("quizzes").doc(chapterId).get();
            if (doc.exists) {
                const data = doc.data().questions;
                this.cache.quizzes[chapterId] = data;
                return data;
            }
        } catch (error) {
            console.error("Error fetching quiz questions:", error);
            throw error;
        }
        return null;
    },

    /**
     * Fetches practice questions
     */
    async fetchPracticeQuestions(docId) {
        if (this.cache.practice[docId]) {
            return this.cache.practice[docId];
        }
        try {
            const doc = await getDb().collection("practice_mcqs").doc(docId).get();
            if (doc.exists) {
                const data = doc.data().questions || [];
                this.cache.practice[docId] = data;
                return data;
            }
        } catch (error) {
            console.error("Error fetching practice questions:", error);
            throw error;
        }
        return [];
    }
};

/* =========================================
   2. QUIZ TIMER
   ========================================= */
class QuizTimer {
    constructor(displayElementId, onTick, onComplete) {
        this.displayElement = document.getElementById(displayElementId);
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.interval = null;
        this.secondsRemaining = 0;
        this.isPaused = false;
    }

    start(durationSeconds, startFrom = null) {
        this.stop();
        this.secondsRemaining = startFrom !== null ? startFrom : durationSeconds;
        this.isPaused = false;
        this.updateDisplay();

        this.interval = setInterval(() => {
            if (!this.isPaused) {
                this.secondsRemaining--;
                this.updateDisplay();

                if (this.onTick) this.onTick(this.secondsRemaining);

                if (this.secondsRemaining <= 0) {
                    this.stop();
                    if (this.onComplete) this.onComplete();
                }
            }
        }, 1000);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
    }

    updateDisplay() {
        if (!this.displayElement) {
             // Try to re-fetch element if it wasn't available at construction
             this.displayElement = document.getElementById("timer-display");
             if (!this.displayElement) return;
        }

        const m = Math.floor(this.secondsRemaining / 60);
        const s = this.secondsRemaining % 60;
        this.displayElement.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;

        if (this.secondsRemaining < 180) {
            this.displayElement.classList.add("low-time");
        } else {
            this.displayElement.classList.remove("low-time");
        }
    }
}

/* =========================================
   3. CHART HELPER
   ========================================= */
const ChartHelper = {
    renderConfidenceChart(ctx, values, stats) {
        if (!ctx) return null;

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#e5e7eb" : "#666";

        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["100% Confidence", "75% Confidence", "50% Confidence", "0% Confidence"],
                datasets: [{
                    label: "Accuracy %",
                    data: values,
                    backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444"],
                    borderRadius: 5,
                    borderWidth: 1,
                    barThickness: 35
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
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
                        ticks: {
                            color: textColor,
                            callback: (val) => val + "%"
                        }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    },

    renderPerformanceChart(ctx, data) {
        if (!ctx) return null;

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
        const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        const tooltipBg = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)";
        const tooltipText = isDark ? "#f3f4f6" : "#1f2937";
        const tooltipBorder = isDark ? "#334155" : "#e5e7eb";

        return new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
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
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: "index" },
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
                            title: (tooltipItems) => subjects[tooltipItems[0].dataIndex],
                            label: (context) => [
                                `📖 ${chapters[context.dataIndex]}`,
                                `📅 ${labels[context.dataIndex]}`,
                                `🎯 Score: ${context.raw}%`,
                            ],
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
                        grid: { color: gridColor, borderDash: [5, 5] },
                        ticks: {
                            color: textColor,
                            font: { size: 11 },
                            stepSize: 20,
                            callback: (value) => value + "%",
                        },
                    },
                },
            },
        });
    }
};
