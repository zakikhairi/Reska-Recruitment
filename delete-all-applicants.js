const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🗑️  Menghapus semua data pelamar...\n');

    // Hapus semua applications
    const deletedApplications = await prisma.application.deleteMany({});
    console.log(`✅ Applications dihapus: ${deletedApplications.count}`);

    // Hapus semua documents
    const deletedDocuments = await prisma.document.deleteMany({});
    console.log(`✅ Documents dihapus: ${deletedDocuments.count}`);

    // Hapus semua applicants
    const deletedApplicants = await prisma.applicant.deleteMany({});
    console.log(`✅ Applicants dihapus: ${deletedApplicants.count}`);

    // Hapus semua users dengan role APPLCANT
    const deletedUsers = await prisma.user.deleteMany({
      where: { role: 'APPLICANT' }
    });
    console.log(`✅ Users (pelamar) dihapus: ${deletedUsers.count}`);

    console.log('\n🎉 Semua data pelamar berhasil dihapus!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
