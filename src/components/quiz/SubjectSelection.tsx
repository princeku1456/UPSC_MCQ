import React from 'react';
import { QuizManifest, HistoryEntry } from '../../types';
import { SortHelper } from '../../utils/helpers';

interface SubjectSelectionProps {
  manifest: QuizManifest;
  userHistory: HistoryEntry[];
  onSelect: (subject: string) => void;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({ manifest, userHistory, onSelect }) => {
  const sortedSubjects = Object.keys(manifest).sort(SortHelper.numerical);

  // Pre-calculate completed chapter IDs for O(1) lookup
  const completedChapterIds = new Set(userHistory.map(h => h.chapterId));

  return (
    <div className="row g-4 justify-content-center">
      {sortedSubjects.map(subject => {
        const chapters = manifest[subject];
        const chapterIds = Object.keys(chapters);
        const totalChapters = chapterIds.length;

        const subjectPrefix = subject.replace(/\s+/g, "_") + "_";

        const completedCount = chapterIds.filter(chapId => {
            const fullId = subjectPrefix + chapId;
            return completedChapterIds.has(fullId);
        }).length;

        const progress = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
        const isCompleted = progress === 100;

        return (
          <div key={subject} className="col-md-4 col-lg-3">
            <div
              className={`card topic-card h-100 ${isCompleted ? 'subject-completed' : ''}`}
              onClick={() => onSelect(subject)}
              role="button"
              style={{cursor: 'pointer', transition: 'transform 0.2s'}}
            >
              <div className="card-body text-center p-4 d-flex flex-column">
                <div className="display-4 mb-3">{isCompleted ? "🏆" : "📖"}</div>
                {isCompleted && <div className="badge bg-success mb-2 align-self-center">Completed</div>}
                <h5 className="card-title fw-bold text-primary">{subject}</h5>
                <p className="text-muted small mb-3">{completedCount} / {totalChapters} Chapters Done</p>
                <div className="mt-auto w-100">
                  <div className="progress" style={{height: '10px'}}>
                    <div
                      className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                      role="progressbar"
                      style={{width: `${progress}%`}}
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <small className={`fw-bold d-block mt-1 ${isCompleted ? 'text-success' : 'text-muted'}`}>
                    {progress}% Complete
                  </small>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
