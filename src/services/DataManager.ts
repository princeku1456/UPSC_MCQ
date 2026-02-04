import { doc, getDoc, collection, query, where, orderBy, getDocs, endBefore, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { localDB } from "./db";
import type { HistoryEntry, GlobalStats } from "../types";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const DataManager = {
  async fetchWithCache<T>(key: string, fetcher: () => Promise<T | null>, ttl = CACHE_TTL, forceRefresh = false): Promise<T | null> {
    if (!forceRefresh) {
      const cached = await localDB.get(key);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < ttl) return cached.data as T;
      }
    }

    try {
      const data = await fetcher();
      if (data) {
        await localDB.set(key, { data, timestamp: Date.now() });
        return data;
      }
    } catch (err) {
      console.error(`Fetch error for ${key}:`, err);
    }
    return null;
  },

  async fetchQuizManifest(forceRefresh = false) {
    return this.fetchWithCache("quiz_manifest", async () => {
      const snap = await getDoc(doc(db, "quiz_metadata", "quiz_manifest"));
      return snap.exists() ? snap.data() : null;
    }, CACHE_TTL, forceRefresh);
  },

  async fetchGlobalStats(chapterId: string, forceRefresh = false) {
     return this.fetchWithCache<GlobalStats>(`global_stats_${chapterId}`, async () => {
        const snap = await getDoc(doc(db, "chapter_stats", chapterId));
        if (!snap.exists()) return null;
        const d = snap.data();
        return {
            avg: d.average || 0,
            highest: d.highestScore || 0,
            totalAttempts: d.totalAttempts || 0,
            correctCounts: d.correctCounts || [],
            attemptedCounts: d.attemptedCounts || []
        } as GlobalStats;
     }, 3600 * 1000, forceRefresh);
  },

  async syncUserHistory(userId: string, forceRefresh = false): Promise<HistoryEntry[]> {
      const cacheKey = `user_history_${userId}`;
      let cachedData: HistoryEntry[] = [];

      if (!forceRefresh) {
          const entry = await localDB.get(cacheKey);
          if (entry) cachedData = entry.data;
      }

      // Find max timestamp
      let lastTimestamp: Date | null = null;
      if (cachedData.length > 0) {
           const maxDate = cachedData.reduce((max: Date | null, item: any) => {
                let current = null;
                if (item.timestamp?.seconds) {
                     current = new Date(item.timestamp.seconds * 1000);
                } else if (typeof item.timestamp === 'string') {
                     current = new Date(item.timestamp);
                }
                return (current && (!max || current > max)) ? current : max;
            }, null);
            if (maxDate) lastTimestamp = maxDate;
      }

      // Query
      const historyRef = collection(db, "results");
      let q = query(historyRef, where("userId", "==", userId), orderBy("timestamp", "desc"));

      if (lastTimestamp) {
          q = query(q, endBefore(Timestamp.fromDate(lastTimestamp)));
      }

      try {
          const snapshot = await getDocs(q);
          const newDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as HistoryEntry));

          if (newDocs.length === 0) return cachedData;

          // Merge and Dedup
          const combined = [...newDocs, ...cachedData];
          const uniqueMap = new Map();
          combined.forEach(item => {
              if (item.id && !uniqueMap.has(item.id)) {
                  uniqueMap.set(item.id, item);
              }
          });

          const unique = Array.from(uniqueMap.values());

          // Sort by timestamp desc to be safe
          unique.sort((a: any, b: any) => {
              const tA = a.timestamp?.seconds || (new Date(a.timestamp).getTime()/1000);
              const tB = b.timestamp?.seconds || (new Date(b.timestamp).getTime()/1000);
              return tB - tA;
          });

          await localDB.set(cacheKey, { data: unique, timestamp: Date.now() });
          return unique;
      } catch (e) {
          console.error("Sync History Error", e);
          return cachedData;
      }
  },

  async fetchGeminiKey() {
      return this.fetchWithCache("gemini_api_key", async () => {
          const snap = await getDoc(doc(db, "app_config", "keys"));
          return snap.exists() ? snap.data().gemini_api_key : null;
      });
  }
};
