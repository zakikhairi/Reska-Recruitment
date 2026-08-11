// Script to check questions in database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking questions in database...\n')

  // Get all questions
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      category: true,
      stem: true,
      isActive: true,
    }
  })

  console.log(`Total questions: ${questions.length}`)

  // Group by category
  const byCategory: Record<string, number> = {}
  const byCategoryActive: Record<string, number> = {}

  questions.forEach(q => {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1
    if (q.isActive) {
      byCategoryActive[q.category] = (byCategoryActive[q.category] || 0) + 1
    }
  })

  console.log('\nQuestions by category (total / active):')
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${count} total, ${byCategoryActive[cat] || 0} active`)
  }

  // Get test configs
  const configs = await prisma.testConfig.findMany({
    include: {
      jobPosting: true,
    }
  })

  console.log('\nTest configs:')
  for (const config of configs) {
    const categories = config.categories.split(',')
    console.log(`  ${config.jobPosting.title}:`)
    console.log(`    Categories: ${categories.join(', ')}`)
    console.log(`    questionsPerCategory: ${config.questionsPerCategory}`)
    console.log(`    Total questions needed: ${categories.length * config.questionsPerCategory}`)
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
