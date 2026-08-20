import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Fetch all applicants with their applications
    const users = await prisma.user.findMany({
      where: {
        role: "APPLICANT",
      },
      include: {
        applicant: {
          include: {
            applications: {
              include: {
                jobPosting: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data
    const applicants = users.map((user: typeof users[number]) => {
      const applications = user.applicant?.applications || [];
      const app = applications[0];
      return {
        id: user.id,
        name: user.applicant?.fullName || user.email.split("@")[0],
        nik: user.applicant?.nik || "-",
        email: user.email,
        phone: user.applicant?.phone || "-",
        job: app?.jobPosting?.title || "-",
        division: app?.jobPosting?.division || "-",
        appliedDate: app?.createdAt?.toISOString().split("T")[0] || user.createdAt.toISOString().split("T")[0],
        status: app?.status || "PENDING",
        score: null,
        education: user.applicant?.education || "-",
      };
    });

    return NextResponse.json(applicants);
  } catch (error) {
    console.error("Applicants API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}
