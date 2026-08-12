// Script to test starting a test session
import { PrismaClient } from '@prisma/client'
import { selectQuestionsForTest } from '../src/lib/scoring'
import { TestCategory } from '../src/types'

const prisma = new PrismaClient()

async function main() {
  // Get the first NOT_STARTED session without questions
  const session = await prisma.testSession.findFirst({
    where: {
      status: 'NOT_STARTED',
      questions: null,
    },
    include: {
      application: {
        include: {
          applicant: true,
          jobPosting: {
            include: {
              testConfig: true,
            },
          },
        },
      },
    },
  })

  if (!session) {
    console.log('No session found without questions')
    return
  }

  console.log('Found session:', session.id)
  console.log('Applicant:', session.application?.applicant?.fullName || 'N/A')
  console.log('Job:', session.application?.jobPosting?.title || 'N/A')

  if (!session.application?.jobPosting?.testConfig) {
    console.log('No test config!')
    return
  }

  const config = session.application.jobPosting.testConfig
  console.log('\nTest Config:')
  console.log('  Categories:', config.categories)
  console.log('  questionsPerCategory:', config.questionsPerCategory)

  // Simulate what the POST handler does
  const categories = config.categories.split(',')

  // Get questions from question bank
  const allQuestions = await prisma.question.findMany({
    where: {
      category: { in: categories },
      isActive: true,
    },
  })

  console.log('\nQuestions found:', allQuestions.length)

  // Select questions
  const selectedQuestions = selectQuestionsForTest(
    allQuestions.map((q) => ({
      id: q.id,
      category: q.category as TestCategory,
      stem: q.stem,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer as "A" | "B" | "C" | "D",
      difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
      points: q.points,
      isActive: q.isActive,
    })),
    {
      categories: categories as TestCategory[],
      categoryWeights: JSON.parse(config.categoryWeights),
      passingGrades: JSON.parse(config.passingGrades),
      overallPassingGrade: config.overallPassingGrade,
      totalDurationMinutes: config.totalDurationMinutes,
      questionsPerCategory: config.questionsPerCategory,
      shuffleQuestions: config.shuffleQuestions,
      shuffleAnswers: config.shuffleAnswers,
      id: '',
      jobPostingId: session.application.jobPostingId,
      allowTabSwitch: config.allowTabSwitch,
      maxTabSwitches: config.maxTabSwitches,
      isActive: config.isActive,
    }
  )

  console.log('Selected questions:', selectedQuestions.length)

  if (selectedQuestions.length === 0) {
    console.log('\nERROR: No questions selected!')
    console.log('This is the bug - questionsPerCategory:', config.questionsPerCategory)
    console.log('Questions per category available:', {
      AKHLAK: allQuestions.filter(q => q.category === 'AKHLAK').length,
      HOSPITALITY: allQuestions.filter(q => q.category === 'HOSPITALITY').length,
    })
  } else {
    console.log('\nSUCCESS: Questions can be selected!')
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
