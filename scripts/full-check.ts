// Script to check full application and test scheduling status
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== FULL DATABASE CHECK ===\n')

  // 1. Get all applicants
  const applicants = await prisma.applicant.findMany({
    include: {
      user: true,
      applications: {
        include: {
          jobPosting: true,
          testSession: true,
        },
      },
    },
  })

  console.log(`Total Applicants: ${applicants.length}\n`)

  for (const applicant of applicants) {
    console.log('='.repeat(70))
    console.log(`Applicant: ${applicant.fullName}`)
    console.log(`User ID: ${applicant.userId}`)
    console.log(`Email: ${applicant.user?.email || 'N/A'}`)
    console.log(`Applications: ${applicant.applications.length}`)

    for (const app of applicant.applications) {
      console.log('\n  --- Application ---')
      console.log(`  ID: ${app.id}`)
      console.log(`  Job: ${app.jobPosting.title} (${app.jobPosting.division})`)
      console.log(`  Status: ${app.status}`)

      if (app.testSession) {
        console.log(`  TestSession: YES`)
        console.log(`    - Session ID: ${app.testSession.id}`)
        console.log(`    - Session Status: ${app.testSession.status}`)
        console.log(`    - scheduledAt: ${app.testSession.scheduledAt}`)
      } else {
        console.log(`  TestSession: NO`)
      }
    }
  }

  // 2. Check all test sessions
  console.log('\n\n=== ALL TEST SESSIONS ===')
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

  console.log(`Total Sessions: ${sessions.length}`)
  for (const s of sessions) {
    console.log(`\n  Session: ${s.id}`)
    console.log(`  Applicant: ${s.application.applicant.fullName}`)
    console.log(`  Job: ${s.application.jobPosting.title}`)
    console.log(`  Status: ${s.status}`)
    console.log(`  scheduledAt: ${s.scheduledAt}`)
  }

  // 3. Check applications with TEST_SCHEDULED status
  console.log('\n\n=== APPLICATIONS WITH STATUS TEST_SCHEDULED ===')
  const scheduledApps = await prisma.application.findMany({
    where: { status: 'TEST_SCHEDULED' },
    include: {
      applicant: true,
      jobPosting: true,
      testSession: true,
    },
  })

  console.log(`Total: ${scheduledApps.length}`)
  for (const app of scheduledApps) {
    console.log(`\n  ${app.applicant.fullName} - ${app.jobPosting.title}`)
    console.log(`  Application ID: ${app.id}`)
    console.log(`  TestSession: ${app.testSession ? 'YES (' + app.testSession.id + ')' : 'NO'}`)
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
