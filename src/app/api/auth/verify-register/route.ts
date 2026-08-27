import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan kode verifikasi harus diisi" },
        { status: 400 }
      );
    }

    console.log("[VERIFY-REGISTER] Email:", email);
    console.log("[VERIFY-REGISTER] Code:", code);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        passwordReset: true,
        applicant: true
      }
    });

    if (!user) {
      console.log("[VERIFY-REGISTER] User not found");
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log("[VERIFY-REGISTER] Email already verified");
      return NextResponse.json(
        { error: "Email sudah terverifikasi sebelumnya" },
        { status: 400 }
      );
    }

    const resetData = user.passwordReset;

    if (!resetData) {
      console.log("[VERIFY-REGISTER] No verification code found");
      return NextResponse.json(
        { error: "Kode verifikasi tidak ditemukan. Silakan daftar ulang." },
        { status: 400 }
      );
    }

    // Check if expired
    if (Date.now() > resetData.expires.getTime()) {
      console.log("[VERIFY-REGISTER] Code expired");
      // Delete the expired code and user
      await prisma.passwordReset.delete({
        where: { userId: user.id }
      });
      await prisma.applicant.delete({
        where: { userId: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
      return NextResponse.json(
        { error: "Kode sudah kadaluarsa. Silakan daftar ulang." },
        { status: 400 }
      );
    }

    // Check attempts
    if (resetData.attempts >= 5) {
      console.log("[VERIFY-REGISTER] Too many attempts");
      // Delete the code and user
      await prisma.passwordReset.delete({
        where: { userId: user.id }
      });
      await prisma.applicant.delete({
        where: { userId: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
      return NextResponse.json(
        { error: "Terlalu banyak percobaan salah. Silakan daftar ulang." },
        { status: 400 }
      );
    }

    // Verify code
    if (resetData.code !== code) {
      await prisma.passwordReset.update({
        where: { userId: user.id },
        data: { attempts: resetData.attempts + 1 }
      });
      console.log("[VERIFY-REGISTER] Wrong code, attempts:", resetData.attempts + 1);
      return NextResponse.json(
        {
          error: "Kode tidak benar",
          attemptsLeft: 5 - resetData.attempts - 1
        },
        { status: 400 }
      );
    }

    console.log("[VERIFY-REGISTER] ✓ Code verified! Activating account...");

    // Parse registration data
    let registrationData: { nik: string; fullName: string; phone: string } | null = null;
    if (user.registrationData) {
      try {
        registrationData = JSON.parse(user.registrationData);
      } catch (e) {
        console.error("[VERIFY-REGISTER] Failed to parse registration data");
      }
    }

    // Create applicant from registration data
    if (registrationData) {
      await prisma.applicant.create({
        data: {
          userId: user.id,
          nik: registrationData.nik,
          fullName: registrationData.fullName,
          phone: registrationData.phone,
          dateOfBirth: new Date("1995-01-01"),
          placeOfBirth: "",
          gender: "MALE",
          address: "",
          city: "",
          postalCode: "",
          education: "SMA",
        },
      });
      console.log("[VERIFY-REGISTER] ✓ Applicant created for:", registrationData.fullName);
    }

    // Activate user - update emailVerified to true and clear registration data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        registrationData: null, // Clear temp data
      },
      include: { applicant: true }
    });

    // Delete the verification code
    await prisma.passwordReset.delete({
      where: { userId: user.id }
    });

    console.log("[VERIFY-REGISTER] ✓ Account activated:", user.email);

    return NextResponse.json({
      success: true,
      message: "Email berhasil diverifikasi! Silakan login.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: user.applicant?.fullName,
        applicantId: user.applicant?.id,
      }
    });

  } catch (error) {
    console.error("Verify register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
