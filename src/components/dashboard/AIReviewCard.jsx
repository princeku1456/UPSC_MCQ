import { useState } from 'react';
import DataManager from '../../lib/dataManager';
import { renderMarkdown } from '../../lib/markdown';
import { toastr } from '../../lib/toast';

const GEMINI_MODEL = 'gemini-flash-latest';

export default function AIReviewCard({ userHistory }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState('');

  async function generateAIReview() {
    const key = await DataManager.fetchGeminiKey();
    if (!key) {
      toastr.warning('AI Service not configured. Please contact admin.');
      return;
    }

    setLoading(true);
    setContent('<div class="text-center text-muted"><p>Thinking...</p></div>');

    try {
      if (!userHistory || userHistory.length === 0) {
        throw new Error('No test history available to analyze.');
      }

      const totalTests = userHistory.length;
      let totalScoreSum = 0;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalAttempted = 0;

      const subjectStats = {};
      const allTestsDetailedArray = [];

      for (const r of userHistory) {
        totalScoreSum += r.scorePercent;

        if (!subjectStats[r.subject]) subjectStats[r.subject] = { totalScore: 0, count: 0 };
        subjectStats[r.subject].totalScore += r.scorePercent;
        subjectStats[r.subject].count++;

        let correct = 0;
        let incorrect = 0;
        let unattempted = 0;

        if (r.userAnswers) {
          for (const ans of Object.values(r.userAnswers)) {
            totalAttempted++;
            if (ans.isCorrect) {
              totalCorrect++;
              correct++;
            } else {
              totalIncorrect++;
              incorrect++;
            }
          }
        }

        const totalQs = r.totalMarks ? r.totalMarks / 2 : correct + incorrect;
        unattempted = Math.max(0, totalQs - (correct + incorrect));

        const dateStr = r.timestamp
          ? new Date(r.timestamp.seconds ? r.timestamp.seconds * 1000 : r.timestamp).toLocaleDateString()
          : 'Unknown Date';

        allTestsDetailedArray.push(
          `- ${dateStr}: ${r.chapterName} (${r.subject})\n  Score: ${r.scorePercent}% | Breakdown: ${correct} Correct, ${incorrect} Incorrect, ${unattempted} Unattempted.`
        );
      }

      const allTestsDetailed = allTestsDetailedArray.join('\n');
      const avgScore = totalTests ? `${(totalScoreSum / totalTests).toFixed(1)}%` : '0%';
      const precision = totalAttempted ? `${((totalCorrect / totalAttempted) * 100).toFixed(1)}%` : '0%';

      const negativeLoss = totalIncorrect * 0.66;
      const positiveGain = totalCorrect * 2;
      const drainVal = positiveGain ? ((negativeLoss / positiveGain) * 100).toFixed(1) : 0;

      let weakestSubject = 'N/A';
      let weakestScore = 100;
      Object.entries(subjectStats).forEach(([subj, data]) => {
        const avg = data.totalScore / data.count;
        if (avg < weakestScore) {
          weakestScore = avg;
          weakestSubject = `${subj} (${avg.toFixed(1)}%)`;
        }
      });

      const prompt = `
Act as the Lead Academic Strategist for a premier UPSC Civil Services coaching institute.
Conduct a Clinical Performance Audit for a student using the datasets below.

### STUDENT PERFORMANCE DATASET
- Stamina (Total Tests): ${totalTests}
- Baseline Competency (Avg Score): ${avgScore}
- Efficiency Index (Precision/Accuracy): ${precision}
- Risk Impact (Negative Drain): ${drainVal}%
- High-Priority Weakness: ${weakestSubject}

Raw Longitudinal History:
${allTestsDetailed}

### ANALYTICAL REQUIREMENTS
1. Root Cause Analysis for the weakest subject (Conceptual Fog vs Application Failure) with a 3-step fix.
2. Behavioral Response Mapping: fatigue decay, guesswork trap, volatility vs plateau.
3. 48-Hour Tactical Roadmap: exactly 3 SMART tasks for the next study session.

Format with bold headings and bullets. Be clinical, data-driven, and encouraging.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to fetch AI response');
      }

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text;
      const formattedText = renderMarkdown(aiText);

      setContent(`<div class="animate-fade-in markdown-content">${formattedText}</div>`);
      setMeta(`Last review: ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error('AI Error:', error);
      toastr.error(`AI Analysis Failed: ${error.message}`);
      setContent(
        `<div class="alert alert-warning border-0 mb-0"><strong>Couldn't generate review.</strong><br>${error.message}</div>`
      );
      setMeta('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center mb-5">
      <div className="col-12">
        <div
          className="card border-0 shadow-sm rounded-4 p-4"
          style={{
            background:
              'linear-gradient(135deg, var(--bg-card) 0%, var(--option-hover) 100%)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary mb-0">✨ AI Personalized Mentor</h5>
            <span className="badge bg-primary rounded-pill">Gemini</span>
          </div>

          <div
            className="mb-3 text-muted"
            dangerouslySetInnerHTML={{
              __html:
                content ||
                '<p>Get a personalized performance review powered by Google Gemini AI. Analyze your weak spots, negative marking patterns, and confidence gaps.</p>',
            }}
          />

          {meta && <div className="small text-muted mb-2">{meta}</div>}

          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-primary-custom px-4" onClick={generateAIReview} disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
              {loading ? 'Analyzing...' : '⚡ Analyze My Performance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
