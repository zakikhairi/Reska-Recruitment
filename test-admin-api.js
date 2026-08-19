const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get a test application
    const app = await prisma.application.findFirst({
      where: { status: 'PENDING' },
      include: {
        applicant: {
          include: {
            documents: true,
            user: { select: { email: true } }
          }
        },
        jobPosting: { select: { id: true, title: true } }
      }
    });
    
    if (!app) {
      console.log('No application found');
      return;
    }
    
    console.log('\n=== Testing Admin API Response ===\n');
    console.log(`Application ID: ${app.id}`);
    console.log(`Applicant ID: ${app.applicant.id}`);
    console.log(`Applicant Name: ${app.applicant.fullName}`);
    console.log(`Email: ${app.applicant.user?.email}`);
    console.log('\nDocuments in database:');
    for (const doc of app.applicant.documents) {
      console.log(`  - ${doc.type}: ${doc.fileName} -> ${doc.fileUrl}`);
    }
    
    // Simulate what the admin page would receive
    const apiResponse = {
      success: true,
      data: {
        application: {
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
        },
        applicant: {
          id: app.applicant.id,
          fullName: app.applicant.fullName,
          email: app.applicant.user?.email || "",
          documents: app.applicant.documents.map(d => ({
            id: d.id,
            type: d.type,
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            fileSize: d.fileSize,
            uploadedAt: d.uploadedAt,
          })),
        },
        job: app.jobPosting,
      },
    };
    
    console.log('\n=== Simulated API Response ===');
    console.log(JSON.stringify(apiResponse, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
