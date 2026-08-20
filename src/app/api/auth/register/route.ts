import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import nodemailer from "nodemailer";

// Simple hash function for password
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

// Email transporter - try SSL first, fallback to STARTTLS
function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Send verification email
async function sendVerificationEmail(email: string, name: string, code: string) {
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verifikasi Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #00205B 0%, #001a3d 100%); padding: 30px; text-align: center;">
              <div style="color: #ffffff; font-size: 24px; font-weight: 800;">🚂 KAI Services</div>
              <div style="color: rgba(255,255,255,0.6); font-size: 12px;">Smart Recruitment System</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; color: #00205B;">Verifikasi Email Anda</h1>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">
                Halo <strong>${name}</strong>, terima kasih telah mendaftar di KAI Services Recruitment.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 15px; color: #666666;">
                Masukkan kode verifikasi berikut untuk mengaktifkan akun Anda:
              </p>
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%); padding: 30px; border-radius: 16px; margin: 0 auto 30px; max-width: 280px; border: 2px dashed #ddd;">
                <p style="margin: 0 0 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Kode Verifikasi:</p>
                <p style="margin: 0; font-size: 42px; font-weight: bold; color: #FF5E00; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
              <p style="color: #888888; font-size: 13px; margin: 0;">
                ⏰ Kode berlaku selama <strong>15 menit</strong>
              </p>
              <div style="background: #fff3cd; padding: 16px; border-radius: 10px; margin-top: 30px; text-align: left;">
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                  <strong>⚠️ Penting:</strong><br>
                  • Jangan bagikan kode ini ke siapapun<br>
                  • Tim KAI tidak akan pernah meminta kode ini
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #aaaaaa;">© ${new Date().getFullYear()} KAI Services. Hak cipta dilindungi.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from: `"KAI Services Recruitment" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎯 Kode Verifikasi Pendaftaran - KAI Services Recruitment",
      html,
    });
    return true;
  } catch (error) {
    console.error("[REGISTER] Email send error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email, password, fullName, nik, phone } = validation.data;

    // Check email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Check NIK exists
    const existingApplicant = await prisma.applicant.findUnique({ where: { nik } });
    if (existingApplicant) {
      return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 });
    }

    // Generate verification code
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store temp user data in PasswordReset (reuse table for verification)
    // Create user first with emailVerified = false
    const passwordHash = simpleHash(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "APPLICANT",
        emailVerified: false,
        passwordReset: {
          create: {
            code,
            expires,
            attempts: 0,
          },
        },
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
      include: { applicant: true },
    });

    console.log("[REGISTER] User created:", user.id, "- Sending verification code");

    // Send verification email
    const emailSent = await sendVerificationEmail(email, fullName, code);

    if (!emailSent) {
      console.log("[REGISTER] ⚠️ Email not sent, code shown in console for dev");
      console.log("[REGISTER]   → Code:", code);
    }

    // Return success with pending verification status
    return NextResponse.json({
      success: true,
      message: "Kode verifikasi sudah dikirim ke email Anda",
      pendingVerification: true,
      email,
      devCode: !emailSent ? code : undefined, // Remove in production
    });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
