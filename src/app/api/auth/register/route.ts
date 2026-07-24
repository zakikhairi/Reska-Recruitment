import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { z } from "zod";

// Create Prisma client with LibSQL adapter
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// Simple hash function for demo (must match login route)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

// Validation schema
const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName, nik, phone } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Check if NIK already exists
    const existingApplicant = await prisma.applicant.findUnique({
      where: { nik },
    });

    if (existingApplicant) {
      return NextResponse.json(
        { error: "NIK sudah terdaftar" },
        { status: 400 }
      );
    }

    // Create user with applicant profile
    const passwordHash = simpleHash(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "APPLICANT",
        emailVerified: false,
        applicant: {
          create: {
            nik,
            fullName,
            phone,
            dateOfBirth: new Date("1995-01-01"),
            placeOfBirth: "",
            gender: "MALE",
            address: "",
            city: "",
            postalCode: "",
            education: "SMA",
          },
        },
      },
      include: {
        applicant: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: fullName,
        applicantId: user.applicant?.id,
        fullProfile: {
          nik: nik,
          phone: phone,
          education: "SMA",
        },
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
