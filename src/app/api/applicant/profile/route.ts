import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findFirst({ where: { userId } });

    if (!applicant) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: applicant });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findFirst({ where: { userId } });

    if (!applicant) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        fullName: profileData.fullName,
        nik: profileData.nik,
        phone: profileData.phone,
        placeOfBirth: profileData.placeOfBirth || "",
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
        gender: profileData.gender || "MALE",
        address: profileData.address || "",
        city: profileData.city || "",
        postalCode: profileData.postalCode || "",
        height: profileData.height ? parseFloat(profileData.height) : null,
        weight: profileData.weight ? parseFloat(profileData.weight) : null,
        education: profileData.education || "SMA",
        university: profileData.university || null,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// Also support PUT method (used by frontend)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findFirst({ where: { userId } });

    if (!applicant) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        fullName: profileData.fullName,
        nik: profileData.nik,
        phone: profileData.phone,
        placeOfBirth: profileData.placeOfBirth || "",
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
        gender: profileData.gender || "MALE",
        address: profileData.address || "",
        city: profileData.city || "",
        postalCode: profileData.postalCode || "",
        height: profileData.height ? parseFloat(profileData.height) : null,
        weight: profileData.weight ? parseFloat(profileData.weight) : null,
        education: profileData.education || "SMA",
        university: profileData.university || null,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
