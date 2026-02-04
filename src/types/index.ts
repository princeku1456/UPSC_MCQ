export interface UserProfile {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
}

export interface Question {
    id: string; // or number index if implicit
    question: string;
    options: string[];
    correctAnswer: string | number;
    explanation?: string;
    explanationImage?: string;
    sourceLink?: string;
    videoLink?: string;
}

export interface QuizManifest {
    [subject: string]: {
        [chapterId: string]: {
            title: string;
            id: string;
            questions?: number; // count
        }
    }
}

// Based on usage: window.allQuizData[subject] seems to be iterating over chapters.
// We will refine this as we migrate the DataManager.

export interface UserAnswer {
    answer: number; // Option index
    surety: number; // 0, 50, 75, 100
    isCorrect: boolean;
}

export interface HistoryEntry {
    id?: string;
    userId: string;
    subject: string;
    chapterId: string;
    chapterName: string;
    scorePercent: number;
    totalMarks: number;
    timestamp: any; // Firestore Timestamp
    userAnswers: Record<string, UserAnswer>; // Keyed by question index (stringified)
}

export interface GlobalStats {
    avg: number;
    highest: number;
    totalAttempts: number;
    correctCounts: number[];
    attemptedCounts: number[];
}
