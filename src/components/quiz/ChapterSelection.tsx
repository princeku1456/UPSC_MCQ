import React from 'react';
import { HistoryEntry } from '../../types';
import { SortHelper } from '../../utils/helpers';

interface ChapterSelectionProps {
  subject: string;
  chapters: Record<string, boolean | any>;
  userHistory: HistoryEntry[];
  onSelect: (chapterId: string, chapterName: string) => void;
  onReview: (result: HistoryEntry) => void;
}

export const ChapterSelection: React.FC<ChapterSelectionProps> = ({ subject, chapters, userHistory, onSelect, onReview }) => {
  const sortedChapterIds = Object.keys(chapters).sort(SortHelper.numerical);

  const subjectPrefix = subject.replace(/\s+/g, "_") + "_";

  // Create O(1) lookup map for user history
  const latestResultsMap = new Map<string, HistoryEntry>();
  userHistory.forEach((h) => {
    // Assuming userHistory is sorted by timestamp desc, or just take the first one found if we iterate carefully?
    // DataManager.syncUserHistory returns unique items, but multiple attempts for same chapter exist.
    // We want the LATEST attempt for "Review Performance" usually, or maybe the best?
    // quiz.js says "latestResult".
    // Sync logic sorts by timestamp desc. So first match is latest.
    if (!latestResultsMap.has(h.chapterId)) {
      latestResultsMap.set(h.chapterId, h);
    }
  });

  return (
    <div className="row g-4">
      {sortedChapterIds.map(chapId => {
        const fullChapterId = subjectPrefix + chapId;
        const latestResult = latestResultsMap.get(fullChapterId);
        const hasTaken = !!latestResult;
        const startBtnText = hasTaken ? "↻ Retake Test" : "🚀 Start Test";

        return (
          <div key={chapId} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body d-flex flex-column p-4">
                <h5 className="card-title fw-bold text-dark">{chapId}</h5>
                <div className="mt-auto">
                  <button
                    className="btn btn-primary w-100 mb-2"
                    onClick={() => onSelect(fullChapterId, chapId)}
                  >
                    {startBtnText}
                  </button>
                  {hasTaken && latestResult && (
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => onReview(latestResult)}
                    >
                        👁 Review Performance
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
