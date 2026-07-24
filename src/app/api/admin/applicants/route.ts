import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Fetch all applicants with their applications
    const applicants = await prisma.user.findMany({
      where: {
        role: "APPLICANT",
      },
      include: {
        profile: true,
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                division: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match frontend expected format
    const transformedApplicants = applicants.map((user) => ({
      id: user.id,
      name: user.profile?.fullName || user.email.split("@")[0],
      nik: user.profile?.nik || "-",
      email: user.email,
      phone: user.profile?.phone || "-",
      position: user.applications[0]?.job?.title || "-",
      division: user.applications[0]?.job?.division || "-",
      appliedDate: user.applications[0]?.createdAt?.toISOString().split("T")[0] || user.createdAt.toISOString().split("T")[0],
      status: user.applications[0]?.status || "PENDING",
      score: user.applications[0]?.testScore,
      education: user.profile?.education || "-",
    }));

    return NextResponse.json(transformedApplicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
