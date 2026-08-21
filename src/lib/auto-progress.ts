import prisma from "@/lib/db";

/**
 * Auto-progression system for application status
 * Automatically updates status based on events
 */

export async function handleTestCompleted(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        testSession: true,
      },
    });

    if (!application) return;

    // If test passed, move to INTERVIEW
    // If test failed, mark as REJECTED
    if (application.testSession?.passed === true) {
      await updateApplicationStatus(applicationId, "TEST_COMPLETED", "Tes selesai, hasil lulus");
    } else if (application.testSession?.passed === false) {
      await updateApplicationStatus(applicationId, "REJECTED", "Tidak memenuhi standar tes");
    }
  } catch (error) {
    console.error("Error in test completed progression:", error);
  }
}

export async function handleInterviewCompleted(applicationId: string, result: string, score: number) {
  try {
    if (result === "PASSED" && score >= 70) {
      await updateApplicationStatus(applicationId, "MCU", "Lulus interview");
    } else {
      await updateApplicationStatus(applicationId, "REJECTED", "Tidak lulus interview");
    }
  } catch (error) {
    console.error("Error in interview completed progression:", error);
  }
}

export async function handleMCUCompleted(applicationId: string, result: string) {
  try {
    if (result === "FIT") {
      await updateApplicationStatus(applicationId, "OFFERED", "Lulus MCU, offer diberikan");
    } else if (result === "CONDITIONAL") {
      await updateApplicationStatus(applicationId, "OFFERED", "MCU bersyarat, offer diberikan");
    } else {
      await updateApplicationStatus(applicationId, "REJECTED", "Tidak lulus MCU");
    }
  } catch (error) {
    console.error("Error in MCU completed progression:", error);
  }
}

export async function handleOfferAccepted(applicationId: string) {
  try {
    await updateApplicationStatus(applicationId, "ACCEPTED", "Offer diterima");
  } catch (error) {
    console.error("Error in offer accepted progression:", error);
  }
}

export async function handleOfferDeclined(applicationId: string) {
  try {
    await updateApplicationStatus(applicationId, "REJECTED", "Offer ditolak");
  } catch (error) {
    console.error("Error in offer declined progression:", error);
  }
}

async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  notes: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) return;

  // Create status history
  await prisma.statusHistory.create({
    data: {
      applicationId,
      fromStatus: application.status,
      toStatus: newStatus,
      notes,
    },
  });

  // Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  console.log(`Application ${applicationId} status updated to ${newStatus}`);
}

// Status flow:
// PENDING -> ADMIN_CHECK -> TEST_SCHEDULED -> IN_TEST -> TEST_COMPLETED
// TEST_COMPLETED -> INTERVIEW -> MCU -> OFFERED -> ACCEPTED/REJECTED

export const STATUS_FLOW = {
  PENDING: "ADMIN_CHECK",
  ADMIN_CHECK: "TEST_SCHEDULED",
  TEST_SCHEDULED: "IN_TEST",
  IN_TEST: "TEST_COMPLETED",
  TEST_COMPLETED: "INTERVIEW",
  INTERVIEW: "MCU",
  MCU: "OFFERED",
  OFFERED: "ACCEPTED",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  ADMIN_CHECK: "Verifikasi Admin",
  TEST_SCHEDULED: "Tes Dijadwalkan",
  IN_TEST: "Sedang Tes",
  TEST_COMPLETED: "Tes Selesai",
  INTERVIEW: "Interview",
  MCU: "MCU",
  OFFERED: "Ditawarkan",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  WITHDRAWN: "Dibatalkan",
};

export const REJECTABLE_STATUSES = [
  "ADMIN_CHECK", // Admin bisa tolak
  "TEST_COMPLETED", // Jika tidak lulus tes
  "INTERVIEW", // Jika tidak lulus interview
  "MCU", // Jika tidak lulus MCU
  "OFFERED", // Jika offer ditolak
];
