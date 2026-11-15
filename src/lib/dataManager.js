import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  endBefore,
  addDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { IDB } from './storage';

const DataManager = {
  cache: {
    quizManifest: null,
    practiceManifest: null,
    quizzes: {},
    practice: {},
    geminiKey: null,
    globalStats: {},
  },

  async fetchWithCache(key, fetcher, ttl = 86400000, forceRefresh = false) {
    if (!forceRefresh) {
      const cachedEntry = await IDB.get(key);
      if (cachedEntry) {
        const age = Date.now() - cachedEntry.timestamp;
        if (age < ttl) return cachedEntry.data;
      }
    }

    try {
      const data = await fetcher();
      if (data !== null && data !== undefined) {
        await IDB.set(key, { data, timestamp: Date.now() });
        return data;
      }
    } catch (error) {
      console.error(`Error fetching data for "${key}":`, error);
    }
    return null;
  },

  async invalidateCache(key) {
    await IDB.delete(key);
  },

  async invalidateCacheByPrefix(prefix) {
    const keys = await IDB.getAllKeys();
    const promises = keys
      .filter((key) => typeof key === 'string' && key.startsWith(prefix))
      .map((key) => IDB.delete(key));
    await Promise.all(promises);
  },

  async fetchQuizManifest(forceRefresh = false) {
    if (!forceRefresh && this.cache.quizManifest) return this.cache.quizManifest;

    const data = await this.fetchWithCache(
      'quiz_manifest',
      async () => {
        const snap = await getDoc(doc(db, 'quiz_metadata', 'quiz_manifest'));
        return snap.exists() ? snap.data() : null;
      },
      86400000,
      forceRefresh
    );

    if (data) this.cache.quizManifest = data;
    return data;
  },

  async fetchGeminiKey() {
    if (this.cache.geminiKey) return this.cache.geminiKey;

    const data = await this.fetchWithCache(
      'gemini_api_key',
      async () => {
        const snap = await getDoc(doc(db, 'app_config', 'keys'));
        return snap.exists() ? snap.data().gemini_api_key : null;
      },
      86400000
    );

    if (data) this.cache.geminiKey = data;
    return data;
  },

  async fetchPracticeManifest(forceRefresh = false) {
    if (!forceRefresh && this.cache.practiceManifest) return this.cache.practiceManifest;

    const data = await this.fetchWithCache(
      'practice_manifest',
      async () => {
        const snap = await getDoc(doc(db, 'quiz_metadata', 'practice_manifest'));
        return snap.exists() ? snap.data() : null;
      },
      86400000,
      forceRefresh
    );

    if (data) this.cache.practiceManifest = data;
    return data;
  },

  async fetchQuizQuestions(chapterId) {
    if (this.cache.quizzes[chapterId]) return this.cache.quizzes[chapterId];

    const data = await this.fetchWithCache(
      `quiz_questions_${chapterId}`,
      async () => {
        const snap = await getDoc(doc(db, 'quizzes', chapterId));
        return snap.exists() ? snap.data().questions : null;
      },
      86400000
    );

    if (data) this.cache.quizzes[chapterId] = data;
    return data;
  },

  async fetchPracticeQuestions(docId) {
    if (this.cache.practice[docId]) return this.cache.practice[docId];

    const data = await this.fetchWithCache(
      `practice_questions_${docId}`,
      async () => {
        const snap = await getDoc(doc(db, 'practice_mcqs', docId));
        if (!snap.exists()) return null;
        const questions = snap.data().questions;
        return questions && questions.length > 0 ? questions : null;
      },
      86400000
    );

    const result = data || [];
    this.cache.practice[docId] = result;
    return result;
  },

  async fetchGlobalStats(chapterId, forceRefresh = false) {
    if (!forceRefresh && this.cache.globalStats[chapterId]) {
      return this.cache.globalStats[chapterId];
    }

    const data = await this.fetchWithCache(
      `global_stats_${chapterId}`,
      async () => {
        const snap = await getDoc(doc(db, 'chapter_stats', chapterId));
        if (!snap.exists()) return null;
        const d = snap.data();
        return {
          avg: d.average || 0,
          highest: d.highestScore || 0,
          totalAttempts: d.totalAttempts || 0,
          allScores: d.allScores || [],
          leaderboard: d.leaderboard || [],
          correctCounts: d.correctCounts || [],
          attemptedCounts: d.attemptedCounts || [],
        };
      },
      3600000,
      forceRefresh
    );

    if (data) this.cache.globalStats[chapterId] = data;
    return data;
  },

  async syncUserHistory(userId, forceRefresh = false) {
    return this.syncHistory({
      userId,
      forceRefresh,
      collectionName: 'results',
      cacheKey: `user_history_${userId}`,
    });
  },

  async syncPracticeHistory(userId, forceRefresh = false) {
    return this.syncHistory({
      userId,
      forceRefresh,
      collectionName: 'practiceResult',
      cacheKey: `user_practice_history_${userId}`,
    });
  },

  async syncHistory({ userId, forceRefresh, collectionName, cacheKey }) {
    let cachedData = null;

    if (!forceRefresh) {
      const entry = await IDB.get(cacheKey);
      if (entry) cachedData = entry.data;
    }

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
        return current && (!max || current > max) ? current : max;
      }, null);
      if (maxDate) lastTimestamp = maxDate;
    }

    let q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    if (lastTimestamp) {
      q = query(
        collection(db, collectionName),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        endBefore(lastTimestamp)
      );
    }

    try {
      const snapshot = await getDocs(q);
      const newDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (newDocs.length === 0) return cachedData || [];

      const combined = [...newDocs, ...(cachedData || [])];
      const unique = [];
      const ids = new Set();
      for (const item of combined) {
        if (!ids.has(item.id)) {
          unique.push(item);
          ids.add(item.id);
        }
      }

      await IDB.set(cacheKey, { data: unique, timestamp: Date.now() });
      return unique;
    } catch (e) {
      console.error(`${collectionName} sync error:`, e);
      return cachedData || [];
    }
  },

  // ---- Write helpers (Firestore) ----

  async addQuizResult(result) {
    return addDoc(collection(db, 'results'), result);
  },

  async addPracticeResult(result) {
    return addDoc(collection(db, 'practiceResult'), {
      ...result,
      timestamp: serverTimestamp(),
    });
  },

  async updateChapterStats(chapterId, updater) {
    return runTransaction(db, async (transaction) => {
      const ref = doc(db, 'chapter_stats', chapterId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        const initial = updater(null);
        transaction.set(ref, initial);
      } else {
        transaction.update(ref, updater(snap.data()));
      }
    });
  },

  async deleteResultAndRevertStats(resultDocId, chapterId, reverter) {
    return runTransaction(db, async (transaction) => {
      const resultRef = doc(db, 'results', resultDocId);
      transaction.delete(resultRef);

      const statsRef = doc(db, 'chapter_stats', chapterId);
      const statsSnap = await transaction.get(statsRef);
      if (statsSnap.exists()) {
        transaction.update(statsRef, reverter(statsSnap.data()));
      }
    });
  },

  async deleteResultDoc(resultDocId) {
    return deleteDoc(doc(db, 'results', resultDocId));
  },

  async updateDocField(collectionName, docId, data) {
    return updateDoc(doc(db, collectionName, docId), data);
  },
};

export default DataManager;
