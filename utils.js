/* =========================================
   UTILS.JS
   Shared utilities for Data Management, Timer, and Charts
   ========================================= */

// Ensure Firebase is ready
const getDb = () => firebase.firestore();

/* =========================================
   0. INDEXED DB WRAPPER (To bypass 5MB localStorage limit)
   ========================================= */
const DB_CONFIG = {
    name: 'QuizAppDB',
    version: 1,
    storeName: 'app_cache'
};

const IDB = {
    dbPromise: null,

    open() {
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject("IndexedDB failed to open");
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
                    db.createObjectStore(DB_CONFIG.storeName, { keyPath: 'key' });
                }
            };
        });
        return this.dbPromise;
    },

    async get(key) {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([DB_CONFIG.storeName], 'readonly');
                const store = transaction.objectStore(DB_CONFIG.storeName);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error("IDB Get Error", e);
            return null;
        }
    },

    async set(key, data) {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.storeName);
                const request = store.put({ key, ...data });

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error("IDB Set Error", e);
        }
    },

    async delete(key) {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([DB_CONFIG.storeName], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error("IDB Delete Error", e);
        }
    },

    async getAllKeys() {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([DB_CONFIG.storeName], 'readonly');
                const store = transaction.objectStore(DB_CONFIG.storeName);
                const request = store.getAllKeys();

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error("IDB GetAllKeys Error", e);
            return [];
        }
    }
};

/* =========================================
   1. DATA MANAGER
   ========================================= */
const DataManager = {
    cache: {
        quizManifest: null,
        practiceManifest: null,
        quizzes: {},     // Cache for specific quiz/chapter data
        practice: {},
        geminiKey: null,     // Cache for practice questions
        globalStats: {} // NEW: In-memory cache for global stats
    },

    /**
     * Generic caching wrapper
     * @param {string} key - Cache key
     * @param {function} fetcher - Async function to fetch data if cache is miss
     * @param {number} ttl - Time to live in ms (default 24h)
     * @param {boolean} forceRefresh - Ignore cache
     */
    async fetchWithCache(key, fetcher, ttl = 86400000, forceRefresh = false) {
        if (!forceRefresh) {
            const cachedEntry = await IDB.get(key);
            if (cachedEntry) {
                const age = Date.now() - cachedEntry.timestamp;
                if (age < ttl) {
                    return cachedEntry.data;
                }
            }
        }

        try {
            const data = await fetcher();
            if (data !== null && data !== undefined) {
                await IDB.set(key, {
                    data: data,
                    timestamp: Date.now()
                });
                return data;
            }
        } catch (error) {
            console.error(`Error fetching data for ${key}:`, error);
        }
        return null;
    },

    /**
     * Clears a specific cache entry
     */
    async invalidateCache(key) {
        await IDB.delete(key);
    },

    /**
     * Clears all cache entries starting with a prefix
     */
    async invalidateCacheByPrefix(prefix) {
        const keys = await IDB.getAllKeys();
        const promises = [];
        keys.forEach(key => {
            if (typeof key === 'string' && key.startsWith(prefix)) {
                promises.push(IDB.delete(key));
            }
        });
        await Promise.all(promises);
    },

    /**
     * Fetches the quiz manifest (Subjects & Chapters)
     */
    async fetchQuizManifest(forceRefresh = false) {
        // Check memory cache first
        if (!forceRefresh && this.cache.quizManifest) {
            return this.cache.quizManifest;
        }

        const data = await this.fetchWithCache(
            "quiz_manifest",
            async () => {
                const doc = await getDb().collection("quiz_metadata").doc("quiz_manifest").get();
                return doc.exists ? doc.data() : null;
            },
            86400000, // 24 hours
            forceRefresh
        );

        if (data) {
            this.cache.quizManifest = data;
            // Maintain backward compatibility
            window.allQuizData = data;
        }
        return data;
    },

    async fetchGeminiKey() {
        if (this.cache.geminiKey) return this.cache.geminiKey;
        
        const data = await this.fetchWithCache(
            "gemini_api_key",
            async () => {
                const doc = await getDb().collection("app_config").doc("keys").get();
                return doc.exists ? doc.data().gemini_api_key : null;
            },
            86400000 // 24 hours
        );

        if (data) {
            this.cache.geminiKey = data;
        }
        return data;
    },

    /**
     * Fetches the practice manifest
     */
    async fetchPracticeManifest(forceRefresh = false) {
        if (!forceRefresh && this.cache.practiceManifest) {
            return this.cache.practiceManifest;
        }

        const data = await this.fetchWithCache(
            "practice_manifest",
            async () => {
                const doc = await getDb().collection("quiz_metadata").doc("practice_manifest").get();
                return doc.exists ? doc.data() : null;
            },
            86400000, // 24 hours
            forceRefresh
        );

        if (data) {
            this.cache.practiceManifest = data;
            window.allPracticeData = data;
        }
        return data;
    },

    /**
     * Fetches questions for a specific chapter
     */
    async fetchQuizQuestions(chapterId) {
        if (this.cache.quizzes[chapterId]) {
            return this.cache.quizzes[chapterId];
        }

        const data = await this.fetchWithCache(
            `quiz_questions_${chapterId}`,
            async () => {
                const doc = await getDb().collection("quizzes").doc(chapterId).get();
                return doc.exists ? doc.data().questions : null;
            },
            86400000 // 24 hours
        );

        if (data) {
            this.cache.quizzes[chapterId] = data;
        }
        return data;
    },

    /**
     * Fetches practice questions
     */
    async fetchPracticeQuestions(docId) {
        if (this.cache.practice[docId]) {
            return this.cache.practice[docId];
        }

        const data = await this.fetchWithCache(
            `practice_questions_${docId}`,
            async () => {
                const doc = await getDb().collection("practice_mcqs").doc(docId).get();
                return doc.exists ? (doc.data().questions || []) : [];
            },
            86400000 // 24 hours
        );

        if (data) {
            this.cache.practice[docId] = data;
        }
        return data || [];
    },

    /**
     * Fetches global stats for a chapter (NEW)
     */
    async fetchGlobalStats(chapterId, forceRefresh = false) {
        if (!forceRefresh && this.cache.globalStats[chapterId]) {
            return this.cache.globalStats[chapterId];
        }

        const data = await this.fetchWithCache(
            `global_stats_${chapterId}`,
            async () => {
                const doc = await getDb().collection("chapter_stats").doc(chapterId).get();
                if (!doc.exists) return null;
                const d = doc.data();
                return {
                    avg: d.average || 0,
                    highest: d.highestScore || 0,
                    totalAttempts: d.totalAttempts || 0,
                    allScores: d.allScores || [],
                    leaderboard: d.leaderboard || [],
                    correctCounts: d.correctCounts || [],
                    attemptedCounts: d.attemptedCounts || []
                };
            },
            3600000, // 1 hour TTL
            forceRefresh
        );

        if (data) {
            this.cache.globalStats[chapterId] = data;
        }
        return data;
    },

    /**
     * Syncs user history incrementally
     */
    async syncUserHistory(userId, forceRefresh = false) {
        const cacheKey = `user_history_${userId}`;
        let cachedData = null;

        // 1. Try to load from IDB
        if (!forceRefresh) {
            const entry = await IDB.get(cacheKey);
            if (entry) {
                cachedData = entry.data; // This is the array of history items
            }
        }

        // 2. Determine latest timestamp
        let lastTimestamp = null;
        if (cachedData && cachedData.length > 0) {
            // Use 'reduce' to safely find the max timestamp, in case IDB order isn't guaranteed
            const maxDate = cachedData.reduce((max, item) => {
                let current = null;
                if (item.timestamp) {
                    if (item.timestamp.seconds) {
                         current = new Date(item.timestamp.seconds * 1000);
                    } else if (typeof item.timestamp === 'string') {
                         current = new Date(item.timestamp);
                    }
                }
                return (current && (!max || current > max)) ? current : max;
            }, null);

            if (maxDate) {
                lastTimestamp = maxDate;
            }
        }

        console.log("Last Sync Timestamp:", lastTimestamp);

        // 3. Query Firestore
        let query = getDb().collection("results")
            .where("userId", "==", userId)
            .orderBy("timestamp", "desc");

        if (lastTimestamp) {
            // "endBefore" with DESC sort fetches items NEWER than the cursor
            // Important: endBefore requires the actual value or DocumentSnapshot.
            // If passing a Date object, ensure it matches the Firestore field type exactly.
            query = query.endBefore(lastTimestamp);
        }

        try {
            const snapshot = await query.get();
            console.log("Firestore Snapshot Size:", snapshot.size);

            // 4. Merge Data
            const newDocs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (newDocs.length === 0) {
                console.log("No new history to sync.");
                return cachedData || [];
            }

            console.log(`Synced ${newDocs.length} new records.`);

            // Deduplicate based on ID (safety against timestamp precision issues)
            const combined = [...newDocs, ...(cachedData || [])];
            const unique = [];
            const ids = new Set();
            for (const item of combined) {
                if (!ids.has(item.id)) {
                    unique.push(item);
                    ids.add(item.id);
                }
            }

            // 5. Update Cache
            await IDB.set(cacheKey, {
                data: unique,
                timestamp: Date.now()
            });

            return unique;

        } catch (e) {
            console.error("History Sync Error:", e);
            return cachedData || [];
        }
    },

    /**
     * Syncs practice history incrementally
     */
    async syncPracticeHistory(userId, forceRefresh = false) {
        const cacheKey = `user_practice_history_${userId}`;
        let cachedData = null;

        // 1. Try to load from IDB
        if (!forceRefresh) {
            const entry = await IDB.get(cacheKey);
            if (entry) {
                cachedData = entry.data;
            }
        }

        // 2. Determine latest timestamp
        let lastTimestamp = null;
        if (cachedData && cachedData.length > 0) {
            const maxDate = cachedData.reduce((max, item) => {
                let current = null;
                if (item.timestamp) {
                    if (item.timestamp.seconds) {
                         current = new Date(item.timestamp.seconds * 1000);
                    } else if (typeof item.timestamp === 'string') {
                         current = new Date(item.timestamp);
                    }
                }
                return (current && (!max || current > max)) ? current : max;
            }, null);

            if (maxDate) {
                lastTimestamp = maxDate;
            }
        }

        console.log("Last Practice Sync Timestamp:", lastTimestamp);

        // 3. Query Firestore
        let query = getDb().collection("practiceResult")
            .where("userId", "==", userId)
            .orderBy("timestamp", "desc");

        if (lastTimestamp) {
            query = query.endBefore(lastTimestamp);
        }

        try {
            const snapshot = await query.get();
            console.log("Firestore Practice Snapshot Size:", snapshot.size);

            // 4. Merge Data
            const newDocs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (newDocs.length === 0) {
                console.log("No new practice history to sync.");
                return cachedData || [];
            }

            console.log(`Synced ${newDocs.length} new practice records.`);

            // Deduplicate
            const combined = [...newDocs, ...(cachedData || [])];
            const unique = [];
            const ids = new Set();
            for (const item of combined) {
                if (!ids.has(item.id)) {
                    unique.push(item);
                    ids.add(item.id);
                }
            }

            // 5. Update Cache
            await IDB.set(cacheKey, {
                data: unique,
                timestamp: Date.now()
            });

            return unique;

        } catch (e) {
            console.error("Practice History Sync Error:", e);
            return cachedData || [];
        }
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
            } else if (item.timestamp && typeof item.timestamp === 'string') {
                 // Handle string timestamp from cache
                 return new Date(item.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
            } else if (item.timestamp && item.timestamp.seconds) {
                 return new Date(item.timestamp.seconds * 1000).toLocaleDateString("en-US", {
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

/* =========================================
   4. TEXT FORMATTER
   ========================================= */
const TextFormatter = {
    formatQuestionText(text) {
        if (!text) return "";

        // Split by newline to process line by line, handling various line endings
        const lines = text.split(/\r?\n/);
        let output = [];
        let inTable = false;
        let tableLines = [];
        let currentSeparator = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Detect separator
            let separator = null;
            if (line.includes('|')) separator = '|';
            else if (line.includes(' - ') && !line.trim().startsWith('-')) separator = ' - ';

            // If we are already in a table
            if (inTable) {
                // Check if the current line continues the table (must have same separator)
                if (separator === currentSeparator) {
                     tableLines.push(line);
                } else {
                     // End of table
                     output.push(this.renderTable(tableLines, currentSeparator));
                     inTable = false;
                     tableLines = [];

                     // Check if this line starts a NEW table
                     if (separator) {
                         inTable = true;
                         currentSeparator = separator;
                         tableLines.push(line);
                     } else {
                         output.push(line);
                     }
                }
            } else {
                // Not in table, check if we should start one
                if (separator) {
                    inTable = true;
                    currentSeparator = separator;
                    tableLines.push(line);
                } else {
                    output.push(line);
                }
            }
        }

        // Handle case where table is at the end
        if (inTable) {
            output.push(this.renderTable(tableLines, currentSeparator));
        }

        return output.join('<br>');
    },

    renderTable(lines, separator = '|') {
        if (lines.length === 0) return "";

        let html = '<div class="table-responsive my-3"><table class="table table-bordered table-sm table-hover align-middle mb-0"><thead>';

        // First line is header
        const headers = lines[0].split(separator);
        html += '<tr class="table-light">';
        headers.forEach(h => {
            html += `<th class="fw-bold text-secondary text-uppercase small" scope="col">${h.trim()}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Remaining lines are body
        for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(separator);
            html += '<tr>';
            cells.forEach(c => {
                html += `<td>${c.trim()}</td>`;
            });
            html += '</tr>';
        }

        html += '</tbody></table></div>';
        return html;
    }
};

/* =========================================
   5. SHARED HELPERS
   ========================================= */

function getCorrectIndex(question) {
  if (typeof question.correctAnswer === "number") return question.correctAnswer;
  const optionIndex = question.options.indexOf(question.correctAnswer);
  if (optionIndex !== -1) return optionIndex;
  if (!isNaN(question.correctAnswer)) return Number(question.correctAnswer);
  return -1;
}

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

/* =========================================
   6. DIFFICULTY HELPER
   ========================================= */
const DifficultyHelper = {
    /**
     * Calculates difficulty label based on community accuracy.
     * @param {number} correctCount - Number of correct attempts
     * @param {number} totalAttempts - Total number of attempts
     * @returns {Object} { label: "Easy"|"Medium"|"Hard", color: "success"|"warning"|"danger", percentage: number }
     */
    calculate(correctCount, totalAttempts) {
        if (!totalAttempts || totalAttempts <= 0) {
             return { label: "Medium", color: "warning", percentage: 0 };
        }

        const percentage = Math.round((correctCount / totalAttempts) * 100);

        if (percentage >= 70) {
            return { label: "Easy", color: "success", percentage };
        } else if (percentage <= 40) {
            return { label: "Hard", color: "danger", percentage };
        } else {
            return { label: "Medium", color: "warning", percentage };
        }
    }
};
