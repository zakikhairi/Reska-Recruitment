import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const CODE_STORE_FILE = path.join(process.cwd(), "tmp", "reset-codes.json");

interface ResetCode {
  email: string;
  code: string;
  expires: number;
  attempts: number;
}

function getCodes(): Record<string, ResetCode> {
  try {
    if (fs.existsSync(CODE_STORE_FILE)) {
      return JSON.parse(fs.readFileSync(CODE_STORE_FILE, "utf-8"));
    }
  } catch (e) {}
  return {};
}

function saveCodes(codes: Record<string, ResetCode>) {
  const dir = path.dirname(CODE_STORE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CODE_STORE_FILE, JSON.stringify(codes, null, 2));
}

function deleteCode(email: string) {
  const codes = getCodes();
  delete codes[email.toLowerCase()];
  saveCodes(codes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, resetToken } = body;

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
        return NextResponse.json(
          { error: "Token tidak valid" },
          { status: 400 }
        );
      }
    } catch (e) {
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

    // Check if code is still valid
    const codes = getCodes();
    const storedData = codes[email.toLowerCase()];

    if (!storedData || Date.now() > storedData.expires) {
      return NextResponse.json(
        { error: "Sesi reset sudah kadaluarsa. Silakan mulai ulang." },
        { status: 400 }
      );
    }

    // In a real app, you would update the password in the database here
    // For demo, we just log it and delete the code
    console.log(`[PASSWORD RESET] User: ${email}, New Password: ${newPassword}`);

    // Delete the code after successful reset
    deleteCode(email);

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
