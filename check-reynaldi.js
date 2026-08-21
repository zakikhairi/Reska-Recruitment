const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Search for Reynaldi
    const applicants = await prisma.applicant.findMany({
      where: {
        fullName: {
          contains: 'Reynaldi',
          mode: 'insensitive'
        }
      },
      include: {
        documents: true,
        user: { select: { email: true } },
        applications: true
      }
    });
    
    console.log('\n=== Search Results for "Reynaldi" ===\n');
    
    if (applicants.length === 0) {
      console.log('No applicants found with name containing "Reynaldi"');
      
      // Also search by email
      const byEmail = await prisma.user.findFirst({
        where: { email: { contains: 'reynaldi', mode: 'insensitive' } }
      });
      
      if (byEmail) {
        console.log('Found by email:', byEmail);
        const app = await prisma.applicant.findFirst({
          where: { userId: byEmail.id },
          include: { documents: true, applications: true }
        });
        console.log('Applicant:', app);
      }
    }
    
    for (const app of applicants) {
      console.log(`Applicant: ${app.fullName}`);
      console.log(`  ID: ${app.id}`);
      console.log(`  Email: ${app.user?.email}`);
      console.log(`  Documents (${app.documents.length}):`);
      for (const doc of app.documents) {
        console.log(`    - ${doc.type}: ${doc.fileName}`);
      }
      console.log(`  Applications (${app.applications.length}):`);
      for (const a of app.applications) {
        console.log(`    - ID: ${a.id}, Status: ${a.status}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
