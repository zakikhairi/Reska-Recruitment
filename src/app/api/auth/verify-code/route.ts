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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan kode harus diisi" },
        { status: 400 }
      );
    }

    const codes = getCodes();
    const storedData = codes[email.toLowerCase()];

    if (!storedData) {
      return NextResponse.json(
        { error: "Kode sudah kadaluarsa atau tidak ditemukan. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Check if expired
    if (Date.now() > storedData.expires) {
      delete codes[email.toLowerCase()];
      saveCodes(codes);
      return NextResponse.json(
        { error: "Kode sudah kadaluarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Check attempts
    if (storedData.attempts >= 5) {
      delete codes[email.toLowerCase()];
      saveCodes(codes);
      return NextResponse.json(
        { error: "Terlalu banyak percobaan salah. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Verify code
    if (storedData.code !== code) {
      storedData.attempts += 1;
      saveCodes(codes);
      return NextResponse.json(
        {
          error: "Kode tidak benar",
          attemptsLeft: 5 - storedData.attempts
        },
        { status: 400 }
      );
    }

    // Code is valid - generate a temporary token for password reset
    const resetToken = Buffer.from(`${email.toLowerCase()}:${Date.now()}`).toString("base64");

    // Extend the expiry for the reset flow
    storedData.expires = Date.now() + 30 * 60 * 1000; // 30 minutes to complete reset
    saveCodes(codes);

    return NextResponse.json({
      success: true,
      message: "Kode terverifikasi",
      resetToken,
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
