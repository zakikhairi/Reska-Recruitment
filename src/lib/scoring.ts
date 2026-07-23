import { TestCategory, Question, ApplicantAnswer, TestConfig } from "@/types";

export interface CategoryScore {
  category: TestCategory;
  rawScore: number;
  totalQuestions: number;
  percentage: number;
  weightedScore: number;
  passed: boolean;
}

export interface TestScoreResult {
  totalScore: number;
  passed: boolean;
  categoryScores: CategoryScore[];
  breakdown: {
    category: TestCategory;
    correct: number;
    total: number;
    percentage: number;
    weight: number;
    weightedScore: number;
    passed: boolean;
    passingGrade: number;
  }[];
}

export function calculateTestScore(
  answers: (ApplicantAnswer & { question: Question })[],
  config: TestConfig,
  questionMap: Map<string, Question>
): TestScoreResult {
  const categories = config.categories;
  const weights = config.categoryWeights;
  const passingGrades = config.passingGrades;

  // Group answers by category
  const answersByCategory = new Map<TestCategory, typeof answers>();

  for (const category of categories) {
    answersByCategory.set(
      category,
      answers.filter((a) => {
        const question = questionMap.get(a.questionId);
        return question?.category === category;
      })
    );
  }

  // Calculate scores per category
  const breakdown: TestScoreResult["breakdown"] = [];
  let totalWeightedScore = 0;

  for (const category of categories) {
    const categoryAnswers = answersByCategory.get(category) || [];
    const totalQuestions = categoryAnswers.length;
    const correctAnswers = categoryAnswers.filter((a) => a.isCorrect).length;
    const percentage =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const weight = weights[category] || 0;
    const weightedScore = percentage * (weight / 100);
    const passingGrade = passingGrades[category] || 50;
    const passed = percentage >= passingGrade;

    breakdown.push({
      category,
      correct: correctAnswers,
      total: totalQuestions,
      percentage,
      weight,
      weightedScore,
      passed,
      passingGrade,
    });

    totalWeightedScore += weightedScore;
  }

  const totalScore = Math.round(totalWeightedScore);
  const allCategoriesPassed = breakdown.every((b) => b.passed);
  const overallPassed =
    allCategoriesPassed && totalScore >= config.overallPassingGrade;

  return {
    totalScore,
    passed: overallPassed,
    categoryScores: breakdown.map((b) => ({
      category: b.category,
      rawScore: b.correct,
      totalQuestions: b.total,
      percentage: b.percentage,
      weightedScore: b.weightedScore,
      passed: b.passed,
    })),
    breakdown,
  };
}

export function getRecommendationLevel(
  totalScore: number,
  categoryScores: CategoryScore[]
): {
  level: "STRONGLY_RECOMMENDED" | "RECOMMENDED" | "CONDITIONAL" | "NOT_RECOMMENDED";
  label: string;
  color: string;
  description: string;
} {
  const allPassed = categoryScores.every((cs) => cs.passed);

  if (totalScore >= 85 && allPassed) {
    return {
      level: "STRONGLY_RECOMMENDED",
      label: "Sangat Direkomendasikan",
      color: "emerald",
      description:
        "Kandidat memiliki performa excellent di semua kategori tes.",
    };
  }

  if (totalScore >= 70 && allPassed) {
    return {
      level: "RECOMMENDED",
      label: "Direkomendasikan",
      color: "blue",
      description:
        "Kandidat memenuhi standar minimum di semua kategori.",
    };
  }

  if (totalScore >= 50) {
    return {
      level: "CONDITIONAL",
      label: "Bersyarat",
      color: "yellow",
      description:
        "Kandidat memiliki potensi dengan catatan pada beberapa kategori.",
    };
  }

  return {
    level: "NOT_RECOMMENDED",
    label: "Tidak Direkomendasikan",
    color: "red",
    description: "Kandidat belum memenuhi passing grade yang ditentukan.",
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectQuestionsForTest(
  questions: Question[],
  config: TestConfig
): Question[] {
  const selectedQuestions: Question[] = [];
  const categories = config.categories;

  for (const category of categories) {
    const categoryQuestions = questions.filter(
      (q) => q.category === category && q.isActive
    );

    // Shuffle if configured
    let pool = config.shuffleQuestions
      ? shuffleArray(categoryQuestions)
      : categoryQuestions;

    // Select required number of questions
    const toSelect = pool.slice(0, config.questionsPerCategory);
    selectedQuestions.push(...toSelect);
  }

  return selectedQuestions;
}

export function validateAnswer(
  selectedAnswer: string,
  correctAnswer: string
): boolean {
  return selectedAnswer.toUpperCase() === correctAnswer.toUpperCase();
}
