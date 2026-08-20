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

    console.log("[VERIFY] Email:", email);
    console.log("[VERIFY] Input code:", code);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { passwordReset: true }
    });

    if (!user || !user.passwordReset) {
      console.log("[VERIFY] No reset request found");
      return NextResponse.json(
        { error: "Kode sudah kadaluarsa atau tidak ditemukan. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    const resetData = user.passwordReset;

    // Check if expired
    if (Date.now() > resetData.expires.getTime()) {
      await prisma.passwordReset.delete({
        where: { userId: user.id }
      });
      console.log("[VERIFY] Code expired");
      return NextResponse.json(
        { error: "Kode sudah kadaluarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Check attempts
    if (resetData.attempts >= 5) {
      await prisma.passwordReset.delete({
        where: { userId: user.id }
      });
      console.log("[VERIFY] Too many attempts");
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
      console.log("[VERIFY] Wrong code, attempts:", resetData.attempts + 1);
      return NextResponse.json(
        {
          error: "Kode tidak benar",
          attemptsLeft: 5 - resetData.attempts - 1
        },
        { status: 400 }
      );
    }

    console.log("[VERIFY] Code verified successfully!");

    // Generate reset token (valid for 30 minutes)
    const resetToken = Buffer.from(`${email.toLowerCase()}:${Date.now()}`).toString("base64");

    // Extend expiry for reset flow
    await prisma.passwordReset.update({
      where: { userId: user.id },
      data: { expires: new Date(Date.now() + 30 * 60 * 1000) }
    });

    return NextResponse.json({
      success: true,
      message: "Kode terverifikasi",
      resetToken,
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
