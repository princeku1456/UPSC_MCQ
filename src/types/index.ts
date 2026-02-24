export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface Question {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
  sourceLink?: string;
  videoLink?: string;
  explanationImage?: string;
}

export interface QuizManifest {
  [subject: string]: {
    [chapterId: string]: boolean | any; // The value type isn't strictly defined in vanilla JS usage, usually just existence matters or it's an object
  };
}

export interface UserAnswer {
  answer: number;
  surety: number; // 0, 50, 75, 100
  isCorrect?: boolean;
}

export interface HistoryEntry {
  id?: string;
  userId: string;
  userEmail: string;
  subject: string;
  chapterId: string;
  chapterName: string;
  score: number;
  totalMarks?: number;
  scorePercent: number;
  userAnswers: { [questionIndex: number]: UserAnswer };
  questionTimeSpent?: { [questionIndex: number]: number };
  timestamp: any; // Firestore Timestamp or Date
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
}

export interface PracticeEntry extends HistoryEntry {
  // specific practice fields if any
}

export interface GlobalStats {
  avg: number;
  highest: number;
  totalAttempts: number;
  allScores: number[];
  leaderboard: LeaderboardEntry[];
  correctCounts: number[];
  attemptedCounts: number[];
}

export interface LeaderboardEntry {
  userEmail: string;
  scorePercent: number;
  score: number;
  rankTime: string;
  resultId?: string;
}
