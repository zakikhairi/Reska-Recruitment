import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword } = body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password tidak cocok" },
        { status: 400 }
      );
    }

    // Password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: "APPLICANT",
        emailVerified: false,
      },
    });

    console.log(`[REGISTER] New user: ${email} (ID: ${user.id})`);

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Silakan login.",
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
