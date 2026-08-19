// Email Service - Kirim notifikasi email ke pelamar
// Modul: NOT-001 s/d NOT-005

import nodemailer from "nodemailer";

// Create transporter (reuse configuration)
function getTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // If email not configured, return null
  if (!emailUser || !emailPass || emailPass === "your-app-password-here") {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

// Common email header/footer template
function getEmailTemplate(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #00205B 0%, #003d8f 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">KAI Recruitment</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Sistem Rekrutmen Cerdas - PT Reska Multi Usaha</p>
      </div>
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 16px 16px;">
        ${content}
      </div>
      <div style="text-align: center; padding: 20px; color: #888888; font-size: 12px;">
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 16px;">
        Email ini dikirim secara otomatis oleh sistem KAI Recruitment.<br>
        Jika Anda tidak merasa melakukan aktivitas ini, abaikan email ini.<br><br>
        © 2026 PT Reska Multi Usaha - PT Kereta Api Indonesia
      </div>
    </div>
  `;
}

// Send email helper
async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();

  // Development mode: log to console
  if (!transporter) {
    console.log(`[EMAIL DEV] To: ${to}`);
    console.log(`[EMAIL DEV] Subject: ${subject}`);
    console.log(`[EMAIL DEV] Preview: ${html.substring(0, 200)}...`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: '"KAI Recruitment" <noreply@kai-recruitment.com>',
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] ✓ Sent to: ${to} - ${subject}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL] ✗ Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// NOT-001: Email Konfirmasi Pendaftaran
// ============================================
export async function sendRegistrationEmail(email: string, fullName: string): Promise<{ success: boolean; error?: string }> {
  const subject = "Pendaftaran Berhasil - KAI Recruitment";
  const html = getEmailTemplate(`
    <h2 style="color: #111111; margin: 0 0 20px; font-size: 22px;">🎉 Pendaftaran Berhasil!</h2>
    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      Selamat <strong>${fullName}</strong>! akun Anda berhasil terdaftar di sistem KAI Recruitment.
    </p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">Detail Akun:</p>
      <p style="margin: 0; color: #00205B; font-size: 15px;">
        <strong>Email:</strong> ${email}<br>
        <strong>Nama:</strong> ${fullName}
      </p>
    </div>
    <p style="color: #666666; margin: 20px 0; font-size: 15px; line-height: 1.6;">
      Silakan lengkapi profil Anda dan Lamar posisi yang tersedia.
    </p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/applicant/complete-profile"
       style="display: inline-block; background: #FF5E00; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0;">
      Lengkapi Profil →
    </a>
    <p style="color: #888888; margin: 20px 0 0; font-size: 13px;">
      Tim HRD kami akan menghubungi Anda setelah proses seleksi dimulai.
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ============================================
// NOT-002: Email Notifikasi Status Lamaran
// ============================================
export async function sendStatusChangeEmail(
  email: string,
  fullName: string,
  position: string,
  oldStatus: string,
  newStatus: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const statusLabels: Record<string, { label: string; emoji: string; description: string }> = {
    PENDING: { label: "Menunggu Review", emoji: "⏳", description: "Lamaran Anda sedang dalam antrean untuk direview oleh tim HRD." },
    ADMIN_CHECK: { label: "Sedang Dicek", emoji: "📋", description: "Tim HRD sedang memverifikasi dokumen dan data diri Anda." },
    TEST_SCHEDULED: { label: "Tes Dijadwalkan", emoji: "📅", description: "Selamat! Anda dijadwalkan untuk mengikuti tes kompetensi." },
    IN_TEST: { label: "Sedang Tes", emoji: "✍️", description: "Anda sedang mengikuti tes kompetensi." },
    TEST_COMPLETED: { label: "Tes Selesai", emoji: "✅", description: "Tes kompetensi telah selesai. Menunggu hasil." },
    INTERVIEW: { label: "Wawancara", emoji: "🎤", description: "Selamat! Anda lolos ke tahap wawancara." },
    MCU: { label: "Medical Check-Up", emoji: "🏥", description: "Anda akan menjalani medical check-up." },
    OFFERING: { label: "Penawaran", emoji: "📄", description: "Selamat! Anda menerima penawaran kerja." },
    ACCEPTED: { label: "Diterima", emoji: "🎊", description: "Selamat! Anda resmi diterima di PT Reska Multi Usaha." },
    REJECTED: { label: "Ditolak", emoji: "😔", description: "Mohon maaf, lamaran Anda belum memenuhi kriteria pada kesempatan ini." },
    WITHDRAWN: { label: "Dibatalkan", emoji: "🚫", description: "Lamaran telah dibatalkan." },
  };

  const statusInfo = statusLabels[newStatus] || { label: newStatus, emoji: "📌", description: "Status lamaran berubah." };

  const subject = `Update Status Lamaran: ${position} - ${statusInfo.label}`;
  const html = getEmailTemplate(`
    <h2 style="color: #111111; margin: 0 0 20px; font-size: 22px;">${statusInfo.emoji} Status Lamaran Diperbarui</h2>
    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      Halo <strong>${fullName}</strong>, ada update untuk lamaran Anda.
    </p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">Detail Perubahan:</p>
      <p style="margin: 0 0 5px; font-size: 15px;">
        <strong>Posisi:</strong> ${position}
      </p>
      <p style="margin: 0 0 5px; font-size: 15px;">
        <strong>Status Lama:</strong> ${statusLabels[oldStatus]?.label || oldStatus}
      </p>
      <p style="margin: 0 0 15px; font-size: 15px;">
        <strong>Status Baru:</strong> <span style="color: #FF5E00; font-weight: bold;">${statusInfo.label}</span>
      </p>
      <p style="margin: 0; color: #00205B; font-size: 15px;">
        ${statusInfo.description}
      </p>
      ${notes ? `<p style="margin: 15px 0 0; color: #666666; font-size: 14px;"><strong>Catatan:</strong> ${notes}</p>` : ''}
    </div>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/applicant/applications"
       style="display: inline-block; background: #00205B; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0;">
      Lihat Detail Lamaran →
    </a>
    <p style="color: #888888; margin: 20px 0 0; font-size: 13px;">
      Terima kasih atas kepercayaan Anda melamar di PT Reska Multi Usaha.
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ============================================
// NOT-003: Email Reminder Tes
// ============================================
export async function sendTestReminderEmail(
  email: string,
  fullName: string,
  position: string,
  testDate: Date,
  testDuration: number // in minutes
): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Date(testDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(testDate).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = "Reminder: Tes Kompetensi Besok - KAI Recruitment";
  const html = getEmailTemplate(`
    <h2 style="color: #111111; margin: 0 0 20px; font-size: 22px;">⏰ Reminder Tes Kompetensi</h2>
    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      Halo <strong>${fullName}</strong>, ini adalah pengingat bahwa Anda dijadwalkan mengikuti tes kompetensi besok.
    </p>
    <div style="background: linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF5E00;">
      <p style="margin: 0 0 10px; font-size: 16px;"><strong>📋 Detail Tes:</strong></p>
      <p style="margin: 0 0 5px; font-size: 15px;"><strong>Posisi:</strong> ${position}</p>
      <p style="margin: 0 0 5px; font-size: 15px;"><strong>Tanggal:</strong> ${formattedDate}</p>
      <p style="margin: 0 0 5px; font-size: 15px;"><strong>Waktu:</strong> ${formattedTime} WIB</p>
      <p style="margin: 0; font-size: 15px;"><strong>Durasi:</strong> ${testDuration} menit</p>
    </div>
    <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0; color: #2e7d32; font-size: 14px; font-weight: bold;">✅ Tips Persiapan:</p>
      <ul style="margin: 10px 0 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Pastikan koneksi internet stabil</li>
        <li>Siapkan tempat yang tenang</li>
        <li>Jangan lupa membawa alat tulis</li>
        <li>Login 15 menit sebelum tes dimulai</li>
      </ul>
    </div>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/applicant/schedule"
       style="display: inline-block; background: #FF5E00; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0;">
      Lihat Jadwal Tes →
    </a>
  `);

  return sendEmail(email, subject, html);
}

// ============================================
// NOT-004: Email Hasil Tes
// ============================================
export async function sendTestResultEmail(
  email: string,
  fullName: string,
  position: string,
  score: number,
  passed: boolean,
  details?: string
): Promise<{ success: boolean; error?: string }> {
  const emoji = passed ? "🎉" : "😔";
  const title = passed ? "Selamat! Anda Lulus Tes" : "Hasil Tes Kompetensi";
  const subtitle = passed
    ? "Selamat! Anda memenuhi passing grade dan berhak melanjutkan ke tahap berikutnya."
    : "Mohon maaf, nilai Anda belum memenuhi passing grade yang ditetapkan.";

  const subject = passed
    ? `🎉 Selamat! Anda Lulus Tes - ${position}`
    : `Hasil Tes Kompetensi - ${position}`;

  const html = getEmailTemplate(`
    <h2 style="color: #111111; margin: 0 0 20px; font-size: 22px;">${emoji} ${title}</h2>
    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      Halo <strong>${fullName}</strong>, berikut hasil tes kompetensi Anda:
    </p>
    <div style="background: ${passed ? '#e8f5e9' : '#fff3e0'}; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #666;">Skor Tes Anda</p>
      <p style="margin: 0; font-size: 48px; font-weight: bold; color: ${passed ? '#2e7d32' : '#FF5E00'};">
        ${score}%
      </p>
      <p style="margin: 10px 0 0; font-size: 16px; color: ${passed ? '#2e7d32' : '#e65100'}; font-weight: bold;">
        ${passed ? '✅ LULUS' : '❌ BELUM LULUS'}
      </p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0 0 10px; font-size: 14px;"><strong>Detail:</strong></p>
      <p style="margin: 0 0 5px; font-size: 15px;"><strong>Posisi:</strong> ${position}</p>
      <p style="margin: 0 0 5px; font-size: 15px;"><strong>Tanggal Tes:</strong> ${new Date().toLocaleDateString("id-ID")}</p>
      <p style="margin: 0; font-size: 15px;"><strong>Passing Grade:</strong> Ditetapkan oleh HRD</p>
    </div>
    <p style="color: #666666; margin: 20px 0; font-size: 15px; line-height: 1.6;">
      ${subtitle}
    </p>
    ${details ? `<p style="color: #666666; margin: 20px 0; font-size: 14px;"><em>${details}</em></p>` : ''}
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/applicant/applications"
       style="display: inline-block; background: #00205B; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0;">
      Lihat Detail Lamaran →
    </a>
    <p style="color: #888888; margin: 20px 0 0; font-size: 13px;">
      ${passed ? 'Tim HRD akan menghubungi Anda untuk jadwal selanjutnya.' : 'Jangan menyerah! Masih banyak kesempatan di masa depan.'}
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ============================================
// NOT-005: Email Pengumuman Kelulusan (Offer)
// ============================================
export async function sendOfferEmail(
  email: string,
  fullName: string,
  position: string,
  startDate?: Date
): Promise<{ success: boolean; error?: string }> {
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : "Akan diinformasikan lebih lanjut";

  const subject = "🎊 Selamat! Anda Diterima di PT Reska Multi Usaha";
  const html = getEmailTemplate(`
    <h2 style="color: #111111; margin: 0 0 20px; font-size: 22px;">🎊 Selamat! Anda Diterima</h2>
    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      Selamat <strong>${fullName}</strong>! Setelah melewati serangkaian proses seleksi, dengan senang hati kami sampaikan bahwa Anda <strong style="color: #2e7d32;">diterima</strong> di PT Reska Multi Usaha.
    </p>
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #2e7d32;">Posisi yang Ditawarkan</p>
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #00205B;">
        ${position}
      </p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold;">📋 Langkah Selanjutnya:</p>
      <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 2;">
        <li>Tim HRD akan menghubungi Anda untuk konfirmasi.</li>
        <li>Siapkan dokumen yang diperlukan.</li>
        <li>Masa Orientasi akan dijadwalkan segera.</li>
      </ol>
    </div>
    <p style="color: #666666; margin: 20px 0; font-size: 15px;">
      <strong>Tanggal Mulai:</strong> ${formattedStartDate}
    </p>
    <p style="color: #666666; margin: 20px 0; font-size: 15px; line-height: 1.6;">
      Selamat bergabung bersama keluarga besar PT Kereta Api Indonesia. Kami menantikan kontribusi terbaik Anda!
    </p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/applicant/dashboard"
       style="display: inline-block; background: #2e7d32; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0;">
      Buka Dashboard →
    </a>
    <p style="color: #888888; margin: 20px 0 0; font-size: 13px;">
      Jika ada pertanyaan, silakan hubungi tim HRD kami.
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ============================================
// REG-007: Email Verifikasi Registrasi (OTP)
// ============================================
export async function sendRegistrationOTPEmail(
  email: string,
  fullName: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  const subject = "Verifikasi Email - KAI Recruitment";
  const html = getEmailTemplate(`
    <h2 style="color: #111111; margin: 0 0 20px; font-size: 22px;">📧 Verifikasi Email Anda</h2>
    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
      Halo <strong>${fullName}</strong>, terima kasih telah mendaftar di KAI Recruitment.
      Masukkan kode verifikasi di bawah ini untuk melanjutkan:
    </p>
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%); padding: 30px; border-radius: 16px; margin: 20px auto; max-width: 280px; border: 2px dashed #ddd; text-align: center;">
      <p style="margin: 0 0 12px; color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Kode Verifikasi:</p>
      <p style="margin: 0; font-size: 42px; font-weight: bold; color: #FF5E00; letter-spacing: 12px; font-family: 'Courier New', monospace;">
        ${otpCode}
      </p>
    </div>
    <p style="color: #888888; font-size: 13px; margin: 20px 0; text-align: center;">
      ⏰ Kode berlaku selama <strong>15 menit</strong>
    </p>
    <div style="background: #fff3cd; padding: 16px; border-radius: 10px; margin: 20px 0; text-align: left;">
      <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
        <strong>⚠️ Penting:</strong><br>
        • Jangan bagikan kode ini ke siapapun<br>
        • Tim KAI Recruitment tidak akan meminta kode ini<br>
        • Jika Anda tidak merasa mendaftar, abaikan email ini
      </p>
    </div>
    <p style="color: #888888; margin: 20px 0 0; font-size: 13px;">
      Setelah email diverifikasi, Anda bisa langsung login dan melamar posisi yang tersedia.
    </p>
  `);

  return sendEmail(email, subject, html);
}
