const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get an applicant with documents
    const applicant = await prisma.applicant.findFirst({
      where: {
        applications: { some: {} }
      },
      include: {
        documents: true,
        applications: {
          include: { jobPosting: true }
        }
      }
    });
    
    if (!applicant) {
      console.log('No applicant found');
      return;
    }
    
    console.log('\n=== Applicant Data ===\n');
    console.log(`Name: ${applicant.fullName}`);
    console.log(`Applicant ID: ${applicant.id}`);
    console.log(`User ID: ${applicant.userId}`);
    console.log('\nDocuments:');
    for (const doc of applicant.documents) {
      console.log(`  - ${doc.type}: ${doc.fileName}`);
    }
    console.log('\nApplications:');
    for (const app of applicant.applications) {
      console.log(`  - Application ID: ${app.id}`);
      console.log(`    Status: ${app.status}`);
      console.log(`    Job: ${app.jobPosting?.title}`);
    }
    
    console.log('\n=== To Test ===');
    console.log(`1. Go to: http://localhost:3000/admin/applicants/${applicant.applications[0]?.id}`);
    console.log(`2. Check if documents are visible`);
    console.log(`3. Expected: CV, KTPCARD, IJAZAH should show as uploaded`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
