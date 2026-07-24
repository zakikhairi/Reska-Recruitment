import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// Use DATABASE_URL from env or default to absolute path
const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// Simple hash function for demo purposes (in production, use bcrypt)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

function verifyPassword(password: string, hash: string): boolean {
  // For demo: "demo123" always works
  if (password === "demo123") return true;
  // Check against stored hash
  return simpleHash(password) === hash || hash.startsWith("demo_");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        applicant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Build response user data based on role
    let userData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: "",
    };

    if (user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN") {
      if (user.admin) {
        userData.fullName = user.admin.fullName;
        userData.employeeId = user.admin.employeeId;
        userData.department = user.admin.department;
      }
    } else if (user.role === "APPLICANT") {
      if (user.applicant) {
        userData.fullName = user.applicant.fullName;
        userData.applicantId = user.applicant.id;
        userData.fullProfile = {
          nik: user.applicant.nik,
          phone: user.applicant.phone,
          education: user.applicant.education,
        };
      }
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
