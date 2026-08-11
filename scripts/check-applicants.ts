// Script to check applicant data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all applicants with their applications
  const applicants = await prisma.applicant.findMany({
    include: {
      applications: {
        include: {
          jobPosting: true,
          testSession: true,
        },
      },
    },
  })

  console.log('Total Applicants:', applicants.length)
  console.log('\n')

  for (const applicant of applicants) {
    console.log('='.repeat(60))
    console.log('Applicant:', applicant.fullName)
    console.log('User ID:', applicant.userId)
    console.log('Email:', applicant.email)
    console.log('Applications:', applicant.applications.length)

    for (const app of applicant.applications) {
      console.log('\n  Application:', app.id)
      console.log('  Job:', app.jobPosting.title)
      console.log('  Status:', app.status)
      console.log('  TestSession:', app.testSession ? 'YES' : 'NO')
      if (app.testSession) {
        console.log('    - ID:', app.testSession.id)
        console.log('    - Status:', app.testSession.status)
        console.log('    - scheduledAt:', app.testSession.scheduledAt)
      }
    }
    console.log('')
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
