import prisma from "./src/lib/db";

async function main() {
  // Get Wubi applicant
  const wubi = await prisma.user.findUnique({
    where: { email: "wubisonodhanu888@gmail.com" },
    include: { applicant: true }
  });
  
  console.log("User:", wubi?.email);
  console.log("Applicant:", wubi?.applicant ? "ADA" : "TIDAK ADA");
  
  if (!wubi?.applicant) {
    console.log("Creating applicant for Wubi...");
    // Get first job posting
    const job = await prisma.jobPosting.findFirst({ where: { status: "ACTIVE" } });
    if (!job) {
      console.log("No active job found!");
      return;
    }
    console.log("Job:", job.title);
    
    // Create applicant if not exists
    await prisma.applicant.create({
      data: {
        userId: wubi!.id,
        nik: "9999888877776661",
        fullName: "Wubi Sonodhanu",
        phone: "081234567890",
        dateOfBirth: new Date("1995-01-01"),
        placeOfBirth: "Jakarta",
        gender: "MALE",
        address: "Jl Test",
        city: "Jakarta",
        postalCode: "11111",
        education: "S1",
      }
    });
    
    // Create application with TEST_COMPLETED status
    const app = await prisma.application.create({
      data: {
        applicantId: wubi!.applicant?.id || (await prisma.applicant.findFirst({ where: { userId: wubi!.id } }))!.id,
        jobPostingId: job.id,
        status: "TEST_COMPLETED", // Langsung set ke TEST_COMPLETED supaya eligible interview
      }
    });
    
    console.log("Created application:", app.id, "with status:", app.status);
  } else {
    // Check applications
    const apps = await prisma.application.findMany({
      where: { applicantId: wubi.applicant.id },
      include: { interview: true, jobPosting: true }
    });
    
    console.log("\nApplications:", apps.length);
    apps.forEach(app => {
      console.log("-", app.jobPosting.title, "| Status:", app.status, "| Has Interview:", !!app.interview);
    });
    
    // Get first ACTIVE job
    const job = await prisma.jobPosting.findFirst({ where: { status: "ACTIVE" } });
    if (!job) {
      console.log("No active job!");
      return;
    }
    
    // Create new application with TEST_COMPLETED if none exists
    const existingApp = apps.find(a => a.status === "TEST_COMPLETED" && !a.interview);
    if (!existingApp) {
      const newApp = await prisma.application.create({
        data: {
          applicantId: wubi.applicant.id,
          jobPostingId: job.id,
          status: "TEST_COMPLETED",
        }
      });
      console.log("Created new application:", newApp.id, "with status:", newApp.status);
    } else {
      console.log("Existing eligible app found:", existingApp.id);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
