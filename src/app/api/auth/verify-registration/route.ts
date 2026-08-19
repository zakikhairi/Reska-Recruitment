// API Route: Verify Registration Email OTP
// POST /api/auth/verify-registration

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan kode harus diisi" },
        { status: 400 }
      );
    }

    console.log("[VERIFY REGISTRATION] Email:", email);
    console.log("[VERIFY REGISTRATION] Input code:", code);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { passwordReset: true }
    });

    if (!user) {
      console.log("[VERIFY REGISTRATION] User not found");
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log("[VERIFY REGISTRATION] Email already verified");
      return NextResponse.json({
        success: true,
        message: "Email sudah terverifikasi sebelumnya"
      });
    }

    if (!user.passwordReset) {
      console.log("[VERIFY REGISTRATION] No OTP found");
      return NextResponse.json(
        { error: "Kode OTP tidak ditemukan. Silakan daftar ulang atau minta kode baru." },
        { status: 400 }
      );
    }

    const resetData = user.passwordReset;

    // Check if expired
    if (Date.now() > resetData.expires.getTime()) {
      console.log("[VERIFY REGISTRATION] OTP expired");
      return NextResponse.json(
        { error: "Kode OTP sudah kadaluarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Check attempts
    if (resetData.attempts >= 5) {
      console.log("[VERIFY REGISTRATION] Too many attempts");
      await prisma.passwordReset.delete({
        where: { userId: user.id }
      });
      return NextResponse.json(
        { error: "Terlalu banyak percobaan salah. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Verify code
    if (resetData.code !== code) {
      await prisma.passwordReset.update({
        where: { userId: user.id },
        data: { attempts: resetData.attempts + 1 }
      });
      console.log("[VERIFY REGISTRATION] Wrong code, attempts:", resetData.attempts + 1);
      return NextResponse.json(
        {
          error: "Kode OTP tidak benar",
          attemptsLeft: 5 - resetData.attempts - 1
        },
        { status: 400 }
      );
    }

    console.log("[VERIFY REGISTRATION] ✓ Code verified successfully!");

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    });

    // Delete the OTP record
    await prisma.passwordReset.delete({
      where: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      message: "Email berhasil diverifikasi! Sekarang Anda bisa login.",
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error("Verify registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT: Resend OTP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email sudah terverifikasi"
      });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Get applicant name
    const applicant = await prisma.applicant.findUnique({
      where: { id: user.applicantId || "" }
    });

    // Store OTP
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        code: otpCode,
        expires: otpExpires,
        attempts: 0
      },
      create: {
        userId: user.id,
        code: otpCode,
        expires: otpExpires,
        attempts: 0
      }
    });

    // Send email
    const { sendRegistrationOTPEmail } = await import("@/lib/email");
    sendRegistrationOTPEmail(
      email,
      applicant?.fullName || "Pengguna",
      otpCode
    ).catch(err => {
      console.error("[RESEND OTP] Failed to send:", err);
    });

    console.log("[RESEND OTP] New OTP for", email, ":", otpCode);

    return NextResponse.json({
      success: true,
      message: "Kode OTP baru sudah dikirim ke email Anda"
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
