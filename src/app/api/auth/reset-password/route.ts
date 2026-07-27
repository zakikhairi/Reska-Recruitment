import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, resetToken } = body;

    console.log("[RESET] Request received for:", email);

    if (!email || !newPassword || !resetToken) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Validate reset token
    try {
      const decoded = Buffer.from(resetToken, "base64").toString("utf-8");
      const [storedEmail] = decoded.split(":");

      if (storedEmail !== email.toLowerCase()) {
        console.log("[RESET] Invalid token - email mismatch");
        return NextResponse.json(
          { error: "Token tidak valid" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.log("[RESET] Invalid token - decode error");
      return NextResponse.json(
        { error: "Token tidak valid" },
        { status: 400 }
      );
    }

    // Validate password
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Find user with reset data
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { passwordReset: true }
    });

    if (!user || !user.passwordReset) {
      console.log("[RESET] No reset session found");
      return NextResponse.json(
        { error: "Sesi reset sudah kadaluarsa. Silakan mulai ulang." },
        { status: 400 }
      );
    }

    // Check if still valid
    if (Date.now() > user.passwordReset.expires.getTime()) {
      await prisma.passwordReset.delete({
        where: { userId: user.id }
      });
      console.log("[RESET] Session expired");
      return NextResponse.json(
        { error: "Sesi reset sudah kadaluarsa. Silakan mulai ulang." },
        { status: 400 }
      );
    }

    // Hash new password using the same method as login/register
    const passwordHash = simpleHash(newPassword);

    // Update password in database
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
    });

    // Delete reset code
    await prisma.passwordReset.delete({
      where: { userId: user.id }
    });

    console.log("[RESET] Password updated for:", email);

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
