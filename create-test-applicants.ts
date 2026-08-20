import prisma from "./src/lib/db";

async function main() {
  console.log("Creating test applicants...");

  // Create test applicant 1
  const user1 = await prisma.user.upsert({
    where: { email: "testpelamar1@kai.com" },
    update: {},
    create: {
      email: "testpelamar1@kai.com",
      passwordHash: "demo_hash",
      role: "APPLICANT",
    },
  });

  await prisma.applicant.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      nik: "1111222233334441",
      fullName: "Ahmad Fauzi",
      phone: "081234567891",
      dateOfBirth: new Date("1997-03-10"),
      placeOfBirth: "Surabaya",
      gender: "MALE",
      address: "Jl. Pemuda No. 10",
      city: "Surabaya",
      postalCode: "60111",
      education: "S1",
    },
  });

  console.log("Created: testpelamar1@kai.com - Ahmad Fauzi");

  // Create test applicant 2
  const user2 = await prisma.user.upsert({
    where: { email: "testpelamar2@kai.com" },
    update: {},
    create: {
      email: "testpelamar2@kai.com",
      passwordHash: "demo_hash",
      role: "APPLICANT",
    },
  });

  await prisma.applicant.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      nik: "1111222233334442",
      fullName: "Rina Wulandari",
      phone: "089876543219",
      dateOfBirth: new Date("1998-11-25"),
      placeOfBirth: "Yogyakarta",
      gender: "FEMALE",
      address: "Jl. Malioboro No. 25",
      city: "Yogyakarta",
      postalCode: "55111",
      education: "D3",
    },
  });

  console.log("Created: testpelamar2@kai.com - Rina Wulandari");
  console.log("\n2 test applicants created!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
