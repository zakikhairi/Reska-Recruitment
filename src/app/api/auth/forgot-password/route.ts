import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi" },
        { status: 400 }
      );
    }

    // Find user by email in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway for security (don't reveal if email exists)
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset sudah dikirim"
      });
    }

    // Get stored password (hashed, we need to show original for demo)
    // In real app, you'd generate a new temp password
    const storedPassword = "demo123"; // Default for demo

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"KAI Recruitment" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recovery Password - KAI Recruitment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00205B 0%, #003d8f 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">KAI Recruitment</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Sistem Rekrutmen Cerdas</p>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 16px 16px; text-align: center;">
            <h2 style="color: #111111; margin: 0 0 16px; font-size: 22px;">🔑 Password Akun Anda</h2>
            <p style="color: #666666; margin: 0 0 30px; font-size: 15px; line-height: 1.6;">
              Berikut adalah password untuk akun Anda:<br>
              <strong style="color: #00205B;">${email}</strong>
            </p>

            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%); padding: 30px; border-radius: 16px; margin: 0 auto 30px; max-width: 280px; border: 2px dashed #ddd;">
              <p style="margin: 0 0 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Password Anda:</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #FF5E00; letter-spacing: 4px; font-family: monospace;">
                ${storedPassword}
              </p>
            </div>

            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/login"
               style="display: inline-block; background: linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%); color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(255,94,0,0.35);">
              Masuk Sekarang
            </a>

            <div style="background: #fff3cd; padding: 16px; border-radius: 10px; margin-top: 30px; text-align: left;">
              <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                <strong>⚠️ Penting:</strong><br>
                • Segera ubah password setelah login<br>
                • Jangan bagikan password ini ke siapapun<br>
                • Tim KAI Recruitment tidak akan meminta password ini
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="color: #888888; font-size: 12px; margin: 0;">
              Email ini dikirim secara otomatis.<br>
              Jika Anda tidak merasa meminta recovery password, abaikan email ini.<br><br>
              © 2026 PT Reska Multi Usaha - KAI Recruitment
            </p>
          </div>
        </div>
      `,
      text: `KAI Recruitment - Password Recovery\n\nPassword untuk akun ${email}:\n\n${storedPassword}\n\nLogin di: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/login\n\n© 2026 PT Reska Multi Usaha`,
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Password recovery sent to: ${email}`);
    } catch (emailError: any) {
      console.log("[EMAIL] Failed:", emailError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, password sudah dikirim"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
