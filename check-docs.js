const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all applicants with their documents
    const applicants = await prisma.applicant.findMany({
      include: {
        documents: true,
        applications: true,
        user: {
          select: { email: true }
        }
      }
    });
    
    console.log('\n=== All Applicants with Documents ===\n');
    
    for (const app of applicants) {
      console.log(`Applicant: ${app.fullName} (${app.id})`);
      console.log(`  Email: ${app.user?.email}`);
      console.log(`  User ID: ${app.userId}`);
      console.log(`  Documents (${app.documents.length}):`);
      
      if (app.documents.length === 0) {
        console.log('    - No documents');
      } else {
        for (const doc of app.documents) {
          console.log(`    - ${doc.type}: ${doc.fileName} (${doc.fileUrl})`);
        }
      }
      
      console.log(`  Applications (${app.applications.length}):`);
      if (app.applications.length === 0) {
        console.log('    - No applications');
      } else {
        for (const a of app.applications) {
          console.log(`    - ${a.jobPostingId} (${a.status})`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
