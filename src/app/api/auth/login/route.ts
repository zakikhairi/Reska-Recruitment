import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// Create Prisma client with LibSQL adapter
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// Simple password verification (for demo)
function verifyPassword(password: string, storedPassword: string): boolean {
  // For demo: accept these passwords
  if (password === "demo123") return true;
  if (password === "demo456") return true;
  if (password === storedPassword) return true;
  return false;
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
