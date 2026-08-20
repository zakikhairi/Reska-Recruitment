// Script to update questions with isActive: true
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating questions to set isActive: true...')

  const result = await prisma.question.updateMany({
    where: {
      isActive: false
    },
    data: {
      isActive: true
    }
  })

  console.log(`Updated ${result.count} questions`)

  // Verify the update
  const activeQuestions = await prisma.question.count({
    where: { isActive: true }
  })
  const inactiveQuestions = await prisma.question.count({
    where: { isActive: false }
  })

  console.log(`\nTotal questions with isActive: true: ${activeQuestions}`)
  console.log(`Total questions with isActive: false: ${inactiveQuestions}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
