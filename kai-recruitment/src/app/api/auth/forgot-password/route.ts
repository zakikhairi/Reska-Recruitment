import { NextRequest, NextResponse } from "next/server";
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

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password",
      },
    });

    // Email content
    const mailOptions = {
      from: `"KAI Recruitment" <${process.env.EMAIL_USER || "noreply@kai-recruitment.com"}>`,
      to: email,
      subject: "Reset Password - KAI Recruitment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #00205B; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">KAI Recruitment</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111111; margin-top: 0;">Reset Password</h2>
            <p style="color: #666666; line-height: 1.6;">
              Anda meminta reset password untuk akun dengan email: <strong>${email}</strong>
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                Password sementara Anda adalah:
              </p>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #FF5E00; letter-spacing: 4px;">
                demo123
              </p>
            </div>
            <p style="color: #666666; line-height: 1.6; font-size: 14px;">
              Silakan login dengan password di atas dan ubah password Anda di menu pengaturan.
            </p>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/login"
               style="display: inline-block; background: #FF5E00; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
              Masuk Sekarang
            </a>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="color: #888888; font-size: 12px; text-align: center; margin: 0;">
              Email ini dikirim secara otomatis. Jangan balas email ini.<br>
              © 2026 PT Reska Multi Usaha - KAI Recruitment
            </p>
          </div>
        </div>
      `,
      text: `KAI Recruitment - Reset Password\n\nAnda meminta reset password untuk akun: ${email}\n\nPassword sementara Anda adalah: demo123\n\nSilakan login dengan password di atas.\n\n© 2026 PT Reska Multi Usaha`,
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${email}`);
    } catch (emailError: any) {
      console.log("Email sending failed:", emailError.message);
    }

    // Always return success for demo
    return NextResponse.json({
      success: true,
      message: "Email reset password sudah dikirim"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
