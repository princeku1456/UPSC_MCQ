const { performance } = require('perf_hooks');

// Mock DataManager
const DataManager = {
    async fetchQuizManifest(force) {
        return new Promise(resolve => setTimeout(resolve, 50));
    },
    async fetchPracticeManifest(force) {
        return new Promise(resolve => setTimeout(resolve, 40));
    },
    async invalidateCacheByPrefix(prefix) {
        return new Promise(resolve => setTimeout(resolve, 30));
    }
};

async function baseline() {
    await DataManager.fetchQuizManifest(true);
    await DataManager.fetchPracticeManifest(true);
    await DataManager.invalidateCacheByPrefix("quiz_questions_");
    await DataManager.invalidateCacheByPrefix("practice_questions_");
    await DataManager.invalidateCacheByPrefix("global_stats_");
}

async function optimized_two_groups() {
    await Promise.all([
        DataManager.fetchQuizManifest(true),
        DataManager.fetchPracticeManifest(true)
    ]);

    await Promise.all([
        DataManager.invalidateCacheByPrefix("quiz_questions_"),
        DataManager.invalidateCacheByPrefix("practice_questions_"),
        DataManager.invalidateCacheByPrefix("global_stats_")
    ]);
}

async function optimized_all() {
    await Promise.all([
        DataManager.fetchQuizManifest(true),
        DataManager.fetchPracticeManifest(true),
        DataManager.invalidateCacheByPrefix("quiz_questions_"),
        DataManager.invalidateCacheByPrefix("practice_questions_"),
        DataManager.invalidateCacheByPrefix("global_stats_")
    ]);
}

async function runBenchmark() {
    let start = performance.now();
    await baseline();
    let t1 = performance.now() - start;

    start = performance.now();
    await optimized_two_groups();
    let t2 = performance.now() - start;

    start = performance.now();
    await optimized_all();
    let t3 = performance.now() - start;

    console.log(`Baseline (sequential): ${t1.toFixed(2)}ms`);
    console.log(`Optimized (two Promise.all groups): ${t2.toFixed(2)}ms`);
    console.log(`Optimized (one Promise.all): ${t3.toFixed(2)}ms`);
}

runBenchmark();
