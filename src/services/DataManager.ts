import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, endBefore, Timestamp, runTransaction, addDoc } from 'firebase/firestore';
import { QuizManifest, Question, HistoryEntry, PracticeEntry, GlobalStats } from '../types';

interface QuizAppDB extends DBSchema {
  app_cache: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
    };
  };
}

const DB_NAME = 'QuizAppDB';
const STORE_NAME = 'app_cache';

class DataManagerService {
  private dbPromise: Promise<IDBPDatabase<QuizAppDB>>;
  private cache: {
    quizManifest: QuizManifest | null;
    practiceManifest: any | null;
    quizzes: Record<string, Question[]>;
    practice: Record<string, Question[]>;
    geminiKey: string | null;
    globalStats: Record<string, GlobalStats>;
  } = {
    quizManifest: null,
    practiceManifest: null,
    quizzes: {},
    practice: {},
    geminiKey: null,
    globalStats: {}
  };

  constructor() {
    this.dbPromise = openDB<QuizAppDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      },
    });
  }

  async fetchWithCache<T>(key: string, fetcher: () => Promise<T | null>, ttl: number = 86400000, forceRefresh: boolean = false): Promise<T | null> {
    if (!forceRefresh) {
      const db = await this.dbPromise;
      const cached = await db.get(STORE_NAME, key);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < ttl) {
          return cached.data as T;
        }
      }
    }

    try {
      const data = await fetcher();
      if (data !== null && data !== undefined) {
        const db = await this.dbPromise;
        await db.put(STORE_NAME, {
          key,
          data,
          timestamp: Date.now()
        });
        return data;
      }
    } catch (error) {
      console.error(`Error fetching data for ${key}:`, error);
    }
    return null;
  }

  async invalidateCache(key: string) {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, key);
  }

  async invalidateCacheByPrefix(prefix: string) {
    const db = await this.dbPromise;
    const keys = await db.getAllKeys(STORE_NAME);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const promises: Promise<void>[] = [];

    keys.forEach((key) => {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        promises.push(store.delete(key));
      }
    });

    await Promise.all(promises);
    await tx.done;
  }

  async fetchQuizManifest(forceRefresh = false): Promise<QuizManifest | null> {
    if (!forceRefresh && this.cache.quizManifest) return this.cache.quizManifest;

    const data = await this.fetchWithCache<QuizManifest>(
      "quiz_manifest",
      async () => {
        const d = await getDoc(doc(db, "quiz_metadata", "quiz_manifest"));
        return d.exists() ? (d.data() as QuizManifest) : null;
      },
      86400000,
      forceRefresh
    );

    if (data) this.cache.quizManifest = data;
    return data;
  }

  async fetchQuizQuestions(chapterId: string): Promise<Question[] | null> {
    if (this.cache.quizzes[chapterId]) return this.cache.quizzes[chapterId];

    const data = await this.fetchWithCache<Question[]>(
      `quiz_questions_${chapterId}`,
      async () => {
        const d = await getDoc(doc(db, "quizzes", chapterId));
        return d.exists() ? (d.data()?.questions as Question[]) : null;
      },
      86400000
    );

    if (data) this.cache.quizzes[chapterId] = data;
    return data;
  }

  async fetchGlobalStats(chapterId: string, forceRefresh = false): Promise<GlobalStats | null> {
    if (!forceRefresh && this.cache.globalStats[chapterId]) return this.cache.globalStats[chapterId];

    const data = await this.fetchWithCache<GlobalStats>(
      `global_stats_${chapterId}`,
      async () => {
        const d = await getDoc(doc(db, "chapter_stats", chapterId));
        if (!d.exists()) return null;
        const data = d.data();
        return {
            avg: data.average || 0,
            highest: data.highestScore || 0,
            totalAttempts: data.totalAttempts || 0,
            allScores: data.allScores || [],
            leaderboard: data.leaderboard || [],
            correctCounts: data.correctCounts || [],
            attemptedCounts: data.attemptedCounts || []
        };
      },
      3600000,
      forceRefresh
    );

    if (data) this.cache.globalStats[chapterId] = data;
    return data;
  }

  async syncUserHistory(userId: string, forceRefresh = false): Promise<HistoryEntry[]> {
    const cacheKey = `user_history_${userId}`;
    let cachedData: HistoryEntry[] = [];

    if (!forceRefresh) {
      const db = await this.dbPromise;
      const entry = await db.get(STORE_NAME, cacheKey);
      if (entry) cachedData = entry.data;
    }

    let lastTimestamp: Date | null = null;
    if (cachedData.length > 0) {
      const maxDate = cachedData.reduce((max: Date | null, item: any) => {
        let current: Date | null = null;
        if (item.timestamp) {
           if (item.timestamp.seconds) current = new Date(item.timestamp.seconds * 1000);
           else if (typeof item.timestamp === 'string') current = new Date(item.timestamp);
           else if (item.timestamp instanceof Date) current = item.timestamp;
        }
        return (current && (!max || current > max)) ? current : max;
      }, null);
      if (maxDate) lastTimestamp = maxDate;
    }

    let q = query(
      collection(db, "results"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    if (lastTimestamp) {
      q = query(q, endBefore(Timestamp.fromDate(lastTimestamp)));
    }

    try {
      const snapshot = await getDocs(q);
      const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryEntry));

      if (newDocs.length === 0) return cachedData;

      const combined = [...newDocs, ...cachedData];
      const unique: HistoryEntry[] = [];
      const ids = new Set();
      for (const item of combined) {
        if (item.id && !ids.has(item.id)) {
          unique.push(item);
          ids.add(item.id);
        }
      }

      const db = await this.dbPromise;
      await db.put(STORE_NAME, {
        key: cacheKey,
        data: unique,
        timestamp: Date.now()
      });

      return unique;
    } catch (e) {
      console.error("History sync error", e);
      return cachedData;
    }
  }

  async syncPracticeHistory(userId: string, forceRefresh = false): Promise<PracticeEntry[]> {
      const cacheKey = `user_practice_history_${userId}`;
      let cachedData: PracticeEntry[] = [];

      if (!forceRefresh) {
        const db = await this.dbPromise;
        const entry = await db.get(STORE_NAME, cacheKey);
        if (entry) cachedData = entry.data;
      }

      let lastTimestamp: Date | null = null;
      if (cachedData.length > 0) {
        const maxDate = cachedData.reduce((max: Date | null, item: any) => {
            let current: Date | null = null;
            if (item.timestamp) {
                if (item.timestamp.seconds) current = new Date(item.timestamp.seconds * 1000);
                else if (typeof item.timestamp === 'string') current = new Date(item.timestamp);
                else if (item.timestamp instanceof Date) current = item.timestamp;
            }
            return (current && (!max || current > max)) ? current : max;
        }, null);
        if (maxDate) lastTimestamp = maxDate;
      }

      let q = query(
        collection(db, "practiceResult"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );

      if (lastTimestamp) {
        q = query(q, endBefore(Timestamp.fromDate(lastTimestamp)));
      }

      try {
        const snapshot = await getDocs(q);
        const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeEntry));

        if (newDocs.length === 0) return cachedData;

        const combined = [...newDocs, ...cachedData];
        const unique: PracticeEntry[] = [];
        const ids = new Set();
        for (const item of combined) {
            if (item.id && !ids.has(item.id)) {
                unique.push(item);
                ids.add(item.id);
            }
        }

        const db = await this.dbPromise;
        await db.put(STORE_NAME, {
            key: cacheKey,
            data: unique,
            timestamp: Date.now()
        });

        return unique;
      } catch (e) {
        console.error("Practice sync error", e);
        return cachedData;
      }
  }

  async fetchGeminiKey(): Promise<string | null> {
      if (this.cache.geminiKey) return this.cache.geminiKey;

      const data = await this.fetchWithCache<string>(
          "gemini_api_key",
          async () => {
              const d = await getDoc(doc(db, "app_config", "keys"));
              return d.exists() ? d.data().gemini_api_key : null;
          },
          86400000
      );

      if (data) this.cache.geminiKey = data;
      return data;
  }

  async fetchPracticeManifest(forceRefresh = false): Promise<any | null> {
    if (!forceRefresh && this.cache.practiceManifest) return this.cache.practiceManifest;

    const data = await this.fetchWithCache<any>(
      "practice_manifest",
      async () => {
        const d = await getDoc(doc(db, "quiz_metadata", "practice_manifest"));
        return d.exists() ? d.data() : null;
      },
      86400000,
      forceRefresh
    );

    if (data) this.cache.practiceManifest = data;
    return data;
  }

  async fetchPracticeQuestions(docId: string): Promise<Question[] | null> {
    if (this.cache.practice[docId]) return this.cache.practice[docId];

    const data = await this.fetchWithCache<Question[]>(
      `practice_questions_${docId}`,
      async () => {
        const d = await getDoc(doc(db, "practice_mcqs", docId));
        return d.exists() ? (d.data()?.questions as Question[]) : [];
      },
      86400000
    );

    if (data) this.cache.practice[docId] = data;
    return data || [];
  }

  async savePracticeResult(result: HistoryEntry) {
    try {
        const { id, ...resultData } = result;
        await addDoc(collection(db, "practiceResult"), resultData);
        await this.invalidateCache(`user_practice_history_${result.userId}`);
    } catch (e) {
        console.error("Save Practice Result Error", e);
        throw e;
    }
  }

  async saveQuizResult(result: HistoryEntry) {
    try {
        const { id, ...resultData } = result;
        const docRef = await addDoc(collection(db, "results"), resultData);
        const resultId = docRef.id;

        await this.invalidateCache(`user_history_${result.userId}`);

        const statsRef = doc(db, "chapter_stats", result.chapterId);
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(statsRef);

            const quizDocRef = doc(db, "quizzes", result.chapterId);
            const quizDoc = await transaction.get(quizDocRef);
            if (!quizDoc.exists()) throw "Quiz not found";

            const questions = quizDoc.data().questions as Question[];
            const totalQuestions = questions.length;

            const newScore = result.scorePercent;
            const leaderboardEntry = {
                userEmail: result.userEmail,
                scorePercent: newScore,
                score: result.score,
                rankTime: new Date().toISOString(),
                resultId
            };

            if (!sfDoc.exists()) {
                const initCorrectCounts = new Array(totalQuestions).fill(0);
                const initAttemptedCounts = new Array(totalQuestions).fill(0);

                Object.entries(result.userAnswers).forEach(([k, ans]) => {
                    const i = parseInt(k);
                    if (i < totalQuestions) {
                        initAttemptedCounts[i] = 1;
                        if (ans.isCorrect) initCorrectCounts[i] = 1;
                    }
                });

                transaction.set(statsRef, {
                    totalScore: newScore,
                    totalAttempts: 1,
                    average: newScore,
                    highestScore: newScore,
                    allScores: [newScore],
                    leaderboard: [leaderboardEntry],
                    correctCounts: initCorrectCounts,
                    attemptedCounts: initAttemptedCounts
                });
            } else {
                const data = sfDoc.data();
                const newAttempts = (data.totalAttempts || 0) + 1;
                const newAvg = ((data.totalScore || 0) + newScore) / newAttempts;

                let currentLeaderboard = data.leaderboard || [];
                currentLeaderboard.push(leaderboardEntry);
                currentLeaderboard.sort((a: any, b: any) => b.scorePercent - a.scorePercent);
                if (currentLeaderboard.length > 10) currentLeaderboard = currentLeaderboard.slice(0, 10);

                let cCounts = [...(data.correctCounts || [])];
                let aCounts = [...(data.attemptedCounts || [])];

                const maxLen = Math.max(cCounts.length, aCounts.length, totalQuestions);
                for (let j = 0; j < maxLen; j++) {
                    if (cCounts[j] == null) cCounts[j] = 0;
                    if (aCounts[j] == null) aCounts[j] = 0;
                }

                Object.entries(result.userAnswers).forEach(([k, ans]) => {
                    const i = parseInt(k);
                    if (i < maxLen) {
                        aCounts[i] = (aCounts[i] || 0) + 1;
                        if (ans.isCorrect) cCounts[i] = (cCounts[i] || 0) + 1;
                    }
                });

                transaction.update(statsRef, {
                    totalScore: (data.totalScore || 0) + newScore,
                    totalAttempts: newAttempts,
                    average: newAvg,
                    highestScore: Math.max(data.highestScore || 0, newScore),
                    allScores: [...(data.allScores || []), newScore],
                    leaderboard: currentLeaderboard,
                    correctCounts: cCounts,
                    attemptedCounts: aCounts
                });
            }
        });

        await this.invalidateCache(`global_stats_${result.chapterId}`);

    } catch (e) {
        console.error("Save Result Error", e);
        throw e;
    }
  }
}

export const DataManager = new DataManagerService();
