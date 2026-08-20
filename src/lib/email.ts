import nodemailer from "nodemailer";

// Status labels in Indonesian
export const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu Review", color: "#FFA500" },
  ADMIN_CHECK: { label: "Sedang Diverifikasi", color: "#4169E1" },
  TEST_SCHEDULED: { label: "Tes Terjadwal", color: "#9B59B6" },
  IN_TEST: { label: "Sedang Tes", color: "#3498DB" },
  TEST_COMPLETED: { label: "Tes Selesai", color: "#2ECC71" },
  INTERVIEW: { label: "Wawancara", color: "#E74C3C" },
  MCU: { label: "MCU", color: "#1ABC9C" },
  OFFERING: { label: "Penawaran", color: "#F39C12" },
  ACCEPTED: { label: "Diterima", color: "#27AE60" },
  REJECTED: { label: "Ditolak", color: "#E74C3C" },
  WITHDRAWN: { label: "Dibatalkan", color: "#95A5A6" },
};

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const getEmailTemplate = (data: {
  applicantName: string;
  jobTitle: string;
  status: string;
  previousStatus?: string;
  notes?: string;
  interviewDate?: string;
  interviewLocation?: string;
  testDate?: string;
  testLocation?: string;
}) => {
  const { label, color } = statusLabels[data.status] || { label: data.status, color: "#333" };

  const statusMessage = getStatusMessage(data.status, data);
  const timelineIcon = getTimelineIcon(data.status);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notifikasi Status Lamaran</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00205B 0%, #001a3d 100%); padding: 30px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 15px;">
                    <div style="width: 50px; height: 50px; background-color: #FF5E00; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                      <span style="color: white; font-size: 24px;">🚂</span>
                    </div>
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">KAI Services</div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 12px;">Smart Recruitment System</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color: ${color}20; padding: 25px 30px; text-align: center; border-bottom: 3px solid ${color};">
              <div style="display: inline-block; background-color: ${color}; color: white; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
                ${timelineIcon} STATUS BERUBAH
              </div>
              <h1 style="margin: 0; font-size: 28px; color: #00205B; font-weight: 800;">${label}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Halo <strong>${data.applicantName}</strong>,
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; color: #555555; line-height: 1.6;">
                ${statusMessage}
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 10px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                          <span style="color: #888888; font-size: 13px;">Posisi</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                          <strong style="color: #00205B;">${data.jobTitle}</strong>
                        </td>
                      </tr>
                      ${data.previousStatus ? `
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                          <span style="color: #888888; font-size: 13px;">Status Sebelumnya</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                          <span style="color: #888888; text-decoration: line-through;">${statusLabels[data.previousStatus]?.label || data.previousStatus}</span>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">Status Baru</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: ${color}; font-weight: 700;">${label}</span>
                        </td>
                      </tr>
                      ${data.testDate ? `
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e9ecef;">
                          <span style="color: #888888; font-size: 13px;">📅 Tanggal Tes</span>
                        </td>
                        <td style="padding: 8px 0; border-top: 1px solid #e9ecef; text-align: right;">
                          <strong>${data.testDate}</strong>
                        </td>
                      </tr>
                      ` : ''}
                      ${data.testLocation ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">📍 Lokasi Tes</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong>${data.testLocation}</strong>
                        </td>
                      </tr>
                      ` : ''}
                      ${data.interviewDate ? `
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e9ecef;">
                          <span style="color: #888888; font-size: 13px;">📅 Tanggal Interview</span>
                        </td>
                        <td style="padding: 8px 0; border-top: 1px solid #e9ecef; text-align: right;">
                          <strong>${data.interviewDate}</strong>
                        </td>
                      </tr>
                      ` : ''}
                      ${data.interviewLocation ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">📍 Lokasi Interview</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong>${data.interviewLocation}</strong>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${data.notes ? `
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                <strong style="color: #856404;">📝 Catatan dari HR:</strong>
                <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">${data.notes}</p>
              </div>
              ` : ''}

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Anda dapat memantau status lamaran Anda kapan saja dengan masuk ke akun KAI Services Recruitment.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin: 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%); border-radius: 8px;">
                    <a href="${process.env.NEXTAUTH_URL}/applicant/dashboard" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px;">
                      Lihat Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #888888; text-align: center;">
                Email ini dikirim secara otomatis oleh sistem KAI Services Recruitment.
              </p>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #aaaaaa; text-align: center;">
                PT Reska Multi Usaha • Bagian dari PT Kereta Api Indonesia<br>
                © ${new Date().getFullYear()} KAI Services. Hak cipta dilindungi.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cccccc; text-align: center;">
                Jangan balas email ini. Untuk informasi lebih lanjut, hubungi tim HR kami.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
};

const getStatusMessage = (status: string, data: any): string => {
  const messages: Record<string, string> = {
    PENDING:
      "Lamaran Anda telah kami terima dan sedang dalam antrean untuk direview oleh tim HR kami.",
    ADMIN_CHECK:
      "Tim HR kami sedang memverifikasi dokumen dan data diri Anda. Mohon tunggu informasi selanjutnya.",
    TEST_SCHEDULED:
      `Selamat! Anda berhak mengikuti tes kompetensi. Tes dijadwalkan pada ${data.testDate || "tanggal yang akan diinformasikan"}. Silakan periksa detail tes di dashboard Anda.`,
    IN_TEST:
      "Anda saat ini sedang mengerjakan tes kompetensi. Tetap fokus dan lakukan yang terbaik!",
    TEST_COMPLETED:
      "Terima kasih telah menyelesaikan tes kompetensi. Tim HR sedang memproses hasil tes Anda.",
    INTERVIEW:
      `Selamat! Anda telah lulus tahap tes dan diundang untuk wawancara. Jadwal: ${data.interviewDate || "segera"}. Lokasi: ${data.interviewLocation || "akan diinformasikan"}.`,
    MCU:
      "Anda telah lulus wawancara! Tahap selanjutnya adalah Medical Check Up (MCU). Jadwal akan diinformasikan segera.",
    OFFERING:
      "Selamat! Kami很开心 ingin menawarkan posisi ini kepada Anda. Silakan cek detail penawaran di dashboard.",
    ACCEPTED:
      "🎉 Selamat! Selamat datang di keluarga besar PT Kereta Api Indonesia! Tim HR akan segera menghubungi Anda untuk proses onboarding.",
    REJECTED:
      "Mohon maaf, setelah mempertimbangkan secara menyeluruh, kami belum dapat melanjutkan proses rekrutmen Anda kali ini. Terima kasih atas minat Anda.",
    WITHDRAWN:
      "Lamaran Anda telah dibatalkan sesuai permintaan.",
  };

  return (
    messages[status] ||
    `Status lamaran Anda telah diperbarui menjadi "${status}". Silakan cek dashboard untuk informasi lebih lanjut.`
  );
};

const getTimelineIcon = (status: string): string => {
  const icons: Record<string, string> = {
    PENDING: "📋",
    ADMIN_CHECK: "🔍",
    TEST_SCHEDULED: "📝",
    IN_TEST: "⏱️",
    TEST_COMPLETED: "✅",
    INTERVIEW: "🎤",
    MCU: "🏥",
    OFFERING: "🎁",
    ACCEPTED: "🎊",
    REJECTED: "😔",
    WITHDRAWN: "🚪",
  };
  return icons[status] || "📌";
};

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Skip sending if EMAIL_USER is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email not configured, skipping:", options.subject);
      return { success: true };
    }

    const info = await transporter.sendMail({
      from: `"KAI Services Recruitment" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendStatusNotification(data: {
  applicantEmail: string;
  applicantName: string;
  jobTitle: string;
  status: string;
  previousStatus?: string;
  notes?: string;
  testDate?: string;
  testLocation?: string;
  interviewDate?: string;
  interviewLocation?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { label } = statusLabels[data.status] || { label: data.status };

  const html = getEmailTemplate(data);

  return sendEmail({
    to: data.applicantEmail,
    subject: `🔔 Update Status Lamaran: ${label} - ${data.jobTitle}`,
    html,
  });
}

export async function sendWelcomeEmail(data: {
  to: string;
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Selamat Datang</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5;">
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
            <td style="padding: 30px;">
              <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #00205B;">Selamat Datang, ${data.name}! 🎉</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #555555; line-height: 1.6;">
                Akun Anda telah berhasil dibuat. Berikut adalah informasi login Anda:
              </p>
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f8f9fa; border-radius: 10px; margin-bottom: 25px;">
                <tr>
                  <td><strong>Email:</strong></td>
                  <td style="text-align: right;">${data.email}</td>
                </tr>
                <tr>
                  <td><strong>Password:</strong></td>
                  <td style="text-align: right; font-family: monospace; background: #e9ecef; padding: 5px 10px; border-radius: 4px;">${data.password}</td>
                </tr>
              </table>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666;">
                <strong>⚠️ Penting:</strong> Ganti password Anda setelah login untuk keamanan akun.
              </p>
              <a href="${process.env.NEXTAUTH_URL}/auth/login" style="display: inline-block; background: linear-gradient(135deg, #FF5E00 0%, #ff7a2f 100%); color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Login Sekarang →
              </a>
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

  return sendEmail({
    to: data.to,
    subject: "🎉 Selamat Datang di KAI Services Recruitment!",
    html,
  });
}
