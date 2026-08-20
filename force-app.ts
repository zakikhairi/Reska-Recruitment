import prisma from "./src/lib/db";

async function main() {
  // Get wubi user
  const wubi = await prisma.user.findUnique({
    where: { email: "wubisonodhanu888@gmail.com" },
    include: { applicant: true }
  });
  
  if (!wubi) {
    console.log("User wubi not found");
    return;
  }
  
  console.log("User:", wubi.email);
  
  if (!wubi.applicant) {
    console.log("Applicant not found - creating...");
    const job = await prisma.jobPosting.findFirst({ where: { status: "ACTIVE" } });
    if (!job) { console.log("No job"); return; }
    
    await prisma.applicant.create({
      data: {
        userId: wubi.id,
        nik: "9999888877776666",
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
  }
  
  // Get updated applicant
  const applicant = await prisma.applicant.findUnique({
    where: { userId: wubi.id }
  });
  
  if (!applicant) { console.log("Still no applicant"); return; }
  
  // Get active job
  const job = await prisma.jobPosting.findFirst({ where: { status: "ACTIVE" } });
  if (!job) { console.log("No active job"); return; }
  console.log("Job:", job.title);
  
  // Check existing apps
  const apps = await prisma.application.findMany({
    where: { applicantId: applicant.id },
    include: { interview: true }
  });
  console.log("Existing apps:", apps.length);
  apps.forEach(a => console.log("-", a.status, "| Interview:", !!a.interview));
  
  // Create new app with TEST_COMPLETED
  const newApp = await prisma.application.create({
    data: {
      applicantId: applicant.id,
      jobPostingId: job.id,
      status: "TEST_COMPLETED"
    }
  });
  console.log("Created app:", newApp.id, "status:", newApp.status);
}

main().catch(console.error).finally(() => prisma.$disconnect());
