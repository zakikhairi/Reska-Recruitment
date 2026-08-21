const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all applicants ordered by creation date (newest first)
    const applicants = await prisma.applicant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        user: { select: { email: true, createdAt: true } },
        applications: {
          include: { jobPosting: { select: { title: true } } }
        }
      }
    });
    
    console.log('\n=== 10 Applicants Terbaru (dengan dokumen) ===\n');
    
    for (const app of applicants) {
      const docCount = app.documents.length;
      console.log(`Nama: ${app.fullName}`);
      console.log(`  Email: ${app.user?.email}`);
      console.log(`  Dibuat: ${app.user?.createdAt || app.createdAt}`);
      console.log(`  Dokumen: ${docCount} file`);
      if (docCount > 0) {
        for (const doc of app.documents) {
          console.log(`    - ${doc.type}: ${doc.fileName} (${doc.uploadedAt})`);
        }
      }
      console.log(`  Lamaran: ${app.applications.length}`);
      if (app.applications.length > 0) {
        console.log(`    - ${app.applications[0].jobPosting?.title} (${app.applications[0].status})`);
      }
      console.log('');
    }
    
    // Count total documents
    const totalDocs = await prisma.document.count();
    const totalApplicants = await prisma.applicant.count();
    console.log(`Total Dokumen di DB: ${totalDocs}`);
    console.log(`Total Pelamar di DB: ${totalApplicants}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
