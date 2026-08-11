// Script to debug test session creation
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get first application with a test config
  const application = await prisma.application.findFirst({
    include: {
      jobPosting: {
        include: {
          testConfig: true,
        },
      },
      testSession: true,
    },
  })

  if (!application) {
    console.log('No application found')
    return
  }

  console.log('Application:', application.id)
  console.log('Job:', application.jobPosting.title)
  console.log('Division:', application.jobPosting.division)

  if (!application.jobPosting.testConfig) {
    console.log('No test config for this job!')
    return
  }

  const config = application.jobPosting.testConfig
  console.log('\nTest Config:')
  console.log('  Categories:', config.categories)
  console.log('  questionsPerCategory:', config.questionsPerCategory)

  // Try to select questions
  const categories = config.categories.split(',')
  console.log('\nSearching for questions in categories:', categories)

  const questions = await prisma.question.findMany({
    where: {
      category: { in: categories },
      isActive: true,
    },
  })

  console.log('Questions found:', questions.length)

  // Group by category
  const byCategory: Record<string, number> = {}
  questions.forEach(q => {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1
  })
  console.log('By category:', byCategory)

  // Calculate how many would be selected
  const neededPerCategory = config.questionsPerCategory
  console.log(`\nIf questionsPerCategory = ${neededPerCategory}:`)
  for (const cat of categories) {
    const available = byCategory[cat] || 0
    const selected = Math.min(available, neededPerCategory)
    console.log(`  ${cat}: ${selected} selected (${available} available)`)
  }

  const totalSelected = categories.reduce((sum, cat) => {
    const available = byCategory[cat] || 0
    return sum + Math.min(available, neededPerCategory)
  }, 0)
  console.log(`\nTotal questions would be selected: ${totalSelected}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
