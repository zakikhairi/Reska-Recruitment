import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    console.log("[FORGOT] Email requested:", email);

    // Find user by email in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log("[FORGOT] User found:", user ? "YES (ID: " + user.id + ")" : "NO");

    if (!user) {
      // Return success anyway for security (don't reveal if email exists)
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, kode verifikasi sudah dikirim"
      });
    }

    // Generate 6-digit code
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store or update code in database
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        code,
        expires,
        attempts: 0
      },
      create: {
        userId: user.id,
        code,
        expires,
        attempts: 0
      }
    });

    console.log("[FORGOT] ✓ Code generated:", code);

    // Check if email is configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass || emailPass === "your-app-password-here") {
      console.log("[FORGOT] ⚠ Email not configured. Showing code in response for dev:");
      console.log("[FORGOT]   → Email:", email);
      console.log("[FORGOT]   → Code:", code);
      console.log("[FORGOT]   → expires:", expires.toISOString());

      return NextResponse.json({
        success: true,
        message: "Mode pengembangan - kode ditampilkan di console",
        devCode: code, // Remove this in production!
        hint: "Konfigurasi EMAIL_USER dan EMAIL_PASS di file .env untuk mengirim email sungguhan"
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Email content with 6-digit code
    const mailOptions = {
      from: `"KAI Recruitment" <${emailUser}>`,
      to: email,
      subject: "Kode Verifikasi Reset Password - KAI Recruitment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00205B 0%, #003d8f 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">KAI Recruitment</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Sistem Rekrutmen Cerdas</p>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 16px 16px; text-align: center;">
            <h2 style="color: #111111; margin: 0 0 16px; font-size: 22px;">🔐 Kode Verifikasi</h2>
            <p style="color: #666666; margin: 0 0 30px; font-size: 15px; line-height: 1.6;">
              Masukkan kode berikut untuk mereset password Anda:<br>
              <strong style="color: #00205B;">${email}</strong>
            </p>

            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%); padding: 30px; border-radius: 16px; margin: 0 auto 30px; max-width: 280px; border: 2px dashed #ddd;">
              <p style="margin: 0 0 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Kode Verifikasi:</p>
              <p style="margin: 0; font-size: 42px; font-weight: bold; color: #FF5E00; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>

            <p style="color: #888888; font-size: 13px; margin: 0 0 30px;">
              ⏰ Kode berlaku selama <strong>15 menit</strong>
            </p>

            <div style="background: #fff3cd; padding: 16px; border-radius: 10px; margin-bottom: 30px; text-align: left;">
              <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                <strong>⚠️ Penting:</strong><br>
                • Jangan bagikan kode ini ke siapapun<br>
                • Tim KAI Recruitment tidak akan meminta kode ini
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 24px;">
            <p style="color: #888888; font-size: 12px; margin: 0;">
              Email ini dikirim secara otomatis.<br>
              Jika Anda tidak merasa meminta reset password, abaikan email ini.<br><br>
              © 2026 PT Reska Multi Usaha - KAI Recruitment
            </p>
          </div>
        </div>
      `,
      text: `KAI Recruitment - Kode Verifikasi Reset Password\n\nKode verifikasi Anda: ${code}\n\nKode ini berlaku selama 15 menit.\n\nJika Anda tidak merasa meminta reset password, abaikan email ini.\n\n© 2026 PT Reska Multi Usaha`,
    };

    // Send email
    console.log("[FORGOT] Attempting to send email...");

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log("[EMAIL] ✓ Sent successfully to:", email);
      console.log("[EMAIL] Message ID:", result.messageId);
    } catch (emailError: any) {
      console.error("[EMAIL] ✗ Failed to send:", emailError.message);
      console.log("[EMAIL] Full error:", emailError);

      // Common Gmail errors
      let hint = "Pastikan EMAIL_PASS di .env adalah App Password (bukan password biasa)";
      if (emailError.message?.includes("Invalid login")) {
        hint = "Gmail Authentication gagal. Pastikan EMAIL_PASS adalah App Password 16 karakter";
      } else if (emailError.message?.includes("Network")) {
        hint = "Gagal koneksi ke server Gmail. Periksa koneksi internet Anda";
      }

      return NextResponse.json({
        success: false,
        error: `Gagal mengirim email: ${emailError.message}`,
        hint
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Kode verifikasi sudah dikirim ke email Anda"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
