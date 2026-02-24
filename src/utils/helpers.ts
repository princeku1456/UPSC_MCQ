import DOMPurify from 'dompurify';
import { Question } from '../types';

export const DifficultyHelper = {
  calculate(correctCount: number, totalAttempts: number) {
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

export const SortHelper = {
  numerical: (a: string, b: string) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }
};

export const TextFormatter = {
  formatQuestionText(text: string): string {
    if (!text) return "";

    const lines = text.split(/\r?\n/);
    let output: string[] = [];
    let inTable = false;
    let tableLines: string[] = [];
    let currentSeparator: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let separator: string | null = null;
      if (line.includes('|')) separator = '|';
      else if (line.includes(' - ') && !line.trim().startsWith('-')) separator = ' - ';

      if (inTable) {
        if (separator === currentSeparator) {
          tableLines.push(line);
        } else {
          output.push(this.renderTable(tableLines, currentSeparator || '|'));
          inTable = false;
          tableLines = [];

          if (separator) {
            inTable = true;
            currentSeparator = separator;
            tableLines.push(line);
          } else {
            output.push(line);
          }
        }
      } else {
        if (separator) {
          inTable = true;
          currentSeparator = separator;
          tableLines.push(line);
        } else {
          output.push(line);
        }
      }
    }

    if (inTable) {
      output.push(this.renderTable(tableLines, currentSeparator || '|'));
    }

    return DOMPurify.sanitize(output.join('<br>'));
  },

  renderTable(lines: string[], separator: string = '|') {
    if (lines.length === 0) return "";

    let html = '<div class="table-responsive my-3"><table class="table table-bordered table-sm table-hover align-middle mb-0"><thead>';

    const headers = lines[0].split(separator);
    html += '<tr class="table-light">';
    headers.forEach(h => {
      html += `<th class="fw-bold text-secondary text-uppercase small" scope="col">${h.trim()}</th>`;
    });
    html += '</tr></thead><tbody>';

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

export function getCorrectIndex(question: Question): number {
  if (typeof question.correctAnswer === "number") return question.correctAnswer;
  if (!question.options) return -1;
  const optionIndex = question.options.indexOf(question.correctAnswer as string);
  if (optionIndex !== -1) return optionIndex;
  if (!isNaN(Number(question.correctAnswer))) return Number(question.correctAnswer);
  return -1;
}

export function calculateConfidenceStats(results: any[]) {
  const confStats: any = {
    100: { total: 0, correct: 0 },
    75: { total: 0, correct: 0 },
    50: { total: 0, correct: 0 },
    0: { total: 0, correct: 0 }
  };

  results.forEach(res => {
    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach((ans: any) => {
        if (ans.surety !== undefined) {
          const s = ans.surety;
          if (confStats[s]) {
             confStats[s].total++;
             if (ans.isCorrect) confStats[s].correct++;
          }
        }
      });
    }
  });

  const confValues = [
    confStats[100].total > 0 ? parseFloat(((confStats[100].correct / confStats[100].total) * 100).toFixed(1)) : 0,
    confStats[75].total > 0 ? parseFloat(((confStats[75].correct / confStats[75].total) * 100).toFixed(1)) : 0,
    confStats[50].total > 0 ? parseFloat(((confStats[50].correct / confStats[50].total) * 100).toFixed(1)) : 0,
    confStats[0].total > 0 ? parseFloat(((confStats[0].correct / confStats[0].total) * 100).toFixed(1)) : 0
  ];

  return { confValues, confStats };
}
