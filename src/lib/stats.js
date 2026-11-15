export function getCorrectIndex(question) {
  if (typeof question.correctAnswer === 'number') return question.correctAnswer;
  const optionIndex = (question.options || []).indexOf(question.correctAnswer);
  if (optionIndex !== -1) return optionIndex;
  if (question.correctAnswer !== null && question.correctAnswer !== undefined && !isNaN(question.correctAnswer)) {
    return Number(question.correctAnswer);
  }
  return -1;
}

export function calculateConfidenceStats(results) {
  const confStats = {
    100: { total: 0, correct: 0 },
    75: { total: 0, correct: 0 },
    50: { total: 0, correct: 0 },
    0: { total: 0, correct: 0 },
  };

  results.forEach((res) => {
    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach((ans) => {
        if (ans.surety !== undefined) {
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
  ].map((v) => (typeof v === 'number' ? v.toFixed(1) : v));

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

export const CORRECT_MARKS = 2;
export const INCORRECT_PENALTY = 0.66;

export function isAnswered(answer) {
  return answer && answer.answer !== undefined && answer.answer !== -1;
}
