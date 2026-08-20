// Script to check test sessions with questions
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sessions = await prisma.testSession.findMany({
    include: {
      application: {
        include: {
          applicant: true,
          jobPosting: true,
        },
      },
    },
  })

  console.log('Total Sessions:', sessions.length)
  console.log('')

  for (const session of sessions) {
    console.log('='.repeat(60))
    console.log('Session ID:', session.id)
    console.log('Applicant:', session.application.applicant.fullName)
    console.log('Job:', session.application.jobPosting.title)
    console.log('Status:', session.status)
    console.log('scheduledAt:', session.scheduledAt)
    console.log('startedAt:', session.startedAt)
    console.log('Has questions field:', session.questions !== null)

    if (session.questions) {
      const questionIds = JSON.parse(session.questions)
      console.log('Questions count:', questionIds.length)
      console.log('First 3 question IDs:', questionIds.slice(0, 3))
    } else {
      console.log('Questions: NULL - needs to be selected!')
    }
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
