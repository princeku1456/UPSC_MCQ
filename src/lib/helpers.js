export function getCorrectIndex(question) {
  if (typeof question.correctAnswer === 'number') return question.correctAnswer;
  const optionIndex = question.options.indexOf(question.correctAnswer);
  if (optionIndex !== -1) return optionIndex;
  if (!isNaN(question.correctAnswer)) return Number(question.correctAnswer);
  return -1;
}

export function calculateConfidenceStats(results) {
  const confStats = {
    100: { total: 0, correct: 0 },
    75: { total: 0, correct: 0 },
    50: { total: 0, correct: 0 },
    0: { total: 0, correct: 0 },
  };

  (results || []).forEach((res) => {
    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach((ans) => {
        if (ans && ans.surety !== undefined) {
          confStats[ans.surety].total++;
          if (ans.isCorrect) confStats[ans.surety].correct++;
        }
      });
    }
  });

  const confValues = [
    confStats[100].total > 0 ? (confStats[100].correct / confStats[100].total) * 100 : 0,
    confStats[75].total > 0 ? (confStats[75].correct / confStats[75].total) * 100 : 0,
    confStats[50].total > 0 ? (confStats[50].correct / confStats[50].total) * 100 : 0,
    confStats[0].total > 0 ? (confStats[0].correct / confStats[0].total) * 100 : 0,
  ].map((v) => (typeof v === 'number' ? Number(v.toFixed(1)) : 0));

  return { confValues, confStats };
}

export const DifficultyHelper = {
  calculate(correctCount, totalAttempts) {
    if (!totalAttempts || totalAttempts <= 0) {
      return { label: 'Medium', color: 'warning', percentage: 0 };
    }
    const percentage = Math.round((correctCount / totalAttempts) * 100);
    if (percentage >= 70) return { label: 'Easy', color: 'success', percentage };
    if (percentage <= 40) return { label: 'Hard', color: 'danger', percentage };
    return { label: 'Medium', color: 'warning', percentage };
  },
};

export const TextFormatter = {
  formatQuestionText(text) {
    if (!text) return '';
    const lines = text.split(/\r?\n/);
    const output = [];
    let inTable = false;
    let tableLines = [];
    let currentSeparator = null;

    const renderTable = (linesArr, separator = '|') => {
      if (linesArr.length === 0) return '';
      let html =
        '<div class="table-responsive my-3"><table class="table table-bordered table-sm table-hover align-middle mb-0"><thead>';
      const headers = linesArr[0].split(separator);
      html += '<tr class="table-light">';
      html += headers.map((h) => `<th class="fw-bold text-secondary text-uppercase small" scope="col">${h.trim()}</th>`).join('');
      html += '</tr></thead><tbody>';
      for (let i = 1; i < linesArr.length; i++) {
        const cells = linesArr[i].split(separator);
        html += `<tr>${cells.map((c) => `<td>${c.trim()}</td>`).join('')}</tr>`;
      }
      html += '</tbody></table></div>';
      return html;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let separator = null;
      if (line.includes('|')) separator = '|';
      else if (line.includes(' - ') && !line.trim().startsWith('-')) separator = ' - ';

      if (inTable) {
        if (separator === currentSeparator) {
          tableLines.push(line);
        } else {
          output.push(renderTable(tableLines, currentSeparator));
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
      } else if (separator) {
        inTable = true;
        currentSeparator = separator;
        tableLines.push(line);
      } else {
        output.push(line);
      }
    }

    if (inTable) output.push(renderTable(tableLines, currentSeparator));
    return output.join('<br>');
  },
};

export function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
