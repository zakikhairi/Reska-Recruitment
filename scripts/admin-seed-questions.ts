// Seed questions for ADMIN division
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding questions for ADMIN division...");

  const division = "ADMIN";

  const questions = [
    // TECHNICAL Questions - Administration
    { stem: "Apa fungsi utama Microsoft Excel di departemen admin?", optionA: "Main game", optionB: "Mengelola data, membuat laporan, dan kalkulasi", optionC: "Menonton film", optionD: "Browsing internet", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara membuat table yang rapi di Excel?", optionA: "Ketik asal", optionB: "Gunakan fitur table, atur lebar kolom, dan tambahkan border", optionC: "Copy paste saja", optionD: "Tidak perlu rapih", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi mail merge dalam Microsoft Word?", optionA: "Mencetak amplop", optionB: "Membuat banyak dokumen serupa dengan data berbeda sekaligus", optionC: "Mengirim email", optionD: "Membuat tabel", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Mengapa filing system yang baik penting?", optionA: "Buat keren", optionB: "Agar dokumen mudah ditemukan dan terjaga keamanannya", optionC: "Hiburan", optionD: "Tidak penting", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat printer macet?", optionA: "Paksa kertas keluar", optionB: "Matikan printer, buka tutup, dan keluarkan kertas dengan hati-hati", optionC: "Beli printer baru", optionD: "Diam saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara mengirim email yang profesional?", optionA: "Tanpa subjek", optionB: "Gunakan subjek yang jelas, bahasa sopan, dan cantumkan lampiran jika perlu", optionC: "Ketik seadanya", optionD: "Besar kecil asal", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi CC dan BCC dalam email?", optionA: "Sama saja", optionB: "CC untuk kirim tembusan, BCC untuk kirim tembusan tersembunyi", optionC: "Untuk menghancurkan", optionD: "Untuk mempercepat", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Mengapa backup file penting?", optionA: "Tidak penting", optionB: "Untuk jaga-jaga jika file asli hilang atau rusak", optionC: "Buat keren", optionD: "Menambah kerja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan petty cash?", optionA: "Uang mainan", optionB: "Dana kecil untuk pengeluaran operasional sehari-hari", optionC: "Uang gaji", optionD: "Uang haram", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara menghitung totalsederhana di Excel?", optionA: "Kalkulator manual", optionB: "Gunakan fungsi SUM untuk menjumlahkan angka", optionC: "Hitung sendiri", optionD: "Serahkan ke会计", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi calendar invites dalam scheduling?", optionA: "Hiburan", optionB: "Mengatur jadwal meeting dan mengingatkan peserta", optionC: "Tidak penting", optionD: "Untuk makan siang", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa penting mencatat minutos rapat?", optionA: "Buat pajangan", optionB: "Sebagai dokumentasi keputusan dan tugas yang harus ditindaklanjuti", optionC: "Hiburan", optionD: "Untuk gossip", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat menerima telepon untuk orang lain?", optionA: "Diam saja", optionB: "Catat pesan dan sampaikan ke orang yang dituju", optionC: "Letakkan telepon", optionD: "Ceritakan ke orang lain", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara mengelola arsip yang efektif?", optionA: "Tumpuk sembarangan", optionB: "Organisir berdasarkan abjad, tanggal, atau kategori, dan Gunakan map khusus", optionC: "Simpan di lantai", optionD: "Buang saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi auto-save di komputer?", optionA: "Tidak penting", optionB: "Menyimpan dokumen secara otomatis untuk mencegah kehilangan data", optionC: "Membuat lambat", optionD: "Hiburan", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa password yang strong penting untuk email kantor?", optionA: "Tidak penting", optionB: "Melindungi informasi perusahaan dari akses tidak sah", optionC: "Hiburan", optionD: "Buat keren", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat meeting akan dimulai?", optionA: "Datang terlambat", optionB: "Siapkan ruangan, alat presentasi, dan daftar hadir", optionC: "Pergi dulu", optionD: "Diam saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara membuat presentasi yang menarik?", optionA: "Tulisan banyak", optionB: "Gunakan poin-poin singkat, visual, dan bahasa yang mudah dipahami", optionC: "Kalimat panjang", optionD: "Bacak dari awal saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi google calendar atau outlook calendar?", optionA: "Hiburan", optionB: "Mengatur dan mengingatkan jadwal kegiatan dan meeting", optionC: "Tidak penting", optionD: "Untuk main game", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa good communication skills penting untuk admin?", optionA: "Tidak penting", optionB: "Admin adalah penghubung, sehingga komunikasi yang baik esensial", optionC: "Hiburan", optionD: "Tidak ada hubungannya", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },

    // AKHLAK Questions
    { stem: "Apa arti budaya AKHLAK di KAI?", optionA: "Akhlak, Kerja, Iman", optionB: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", optionC: "Akurat, Kuat, Hebat", optionD: "Anti Korupsi, Loyalitas Tinggi", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa kerahasiaan dokumen penting?", optionA: "Tidak penting", optionB: "Untuk melindungi informasi sensitif perusahaan dan klien", optionC: "Hiburan", optionD: "Buat keren", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat ada tamu datang?", optionA: "Diabaikan", optionB: "Menyambut dengan ramah, tanyakan keperluan, dan arahkan", optionC: "Lari sendiri", optionD: "Marah-marah", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa ketepatan waktu penting untuk admin?", optionA: "Tidak penting", optionB: "Admin sering menjadi pengatur waktu, keterlambatan会影响 banyak orang", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Amanah' untuk pekerja admin?", optionA: "Bebas menggunakan uang perusahaan", optionB: "Menjaga kerahasiaan dan integritas dalam pengelolaan dokumen", optionC: "Menyimpan barang sendiri", optionD: "Bolos kerja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menangani informasi yang sensitif?", optionA: "Cerita ke semua orang", optionB: "Jaga kerahasiaannya dan hanya bagikan kepada yang berkepentingan", optionC: "Posting ke media sosial", optionD: "Simpan di HP", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan professionalism?", optionA: "Bekerja seenaknya", optionB: "Menunjukkan sikap dan penampilan yang sesuai dengan standar perusahaan", optionC: "Datang kapan saja", optionD: "Ikut-ikut saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa pentingnya menjaga kerapian meja kerja?", optionA: "Tidak penting", optionB: "Untuk efisiensi kerja dan meninggalkan kesan profesional", optionC: "Hiburan", optionD: "Biarkan berantakan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika membuat kesalahan dalam dokumen?", optionA: "Sembunyikan", optionB: "Akui kesalahan, perbaiki, dan beritahu pihak terkait", optionC: "Rubah diam-diam", optionD: "Diam saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa cross-check penting sebelum kirim dokumen?", optionA: "Tidak penting", optionB: "Untuk memastikan tidak ada kesalahan sebelum dokumen dikirim", optionC: "Buat ribet", optionD: "Hiburan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Kompeten' untuk admin?", optionA: "Tahu gosip", optionB: "Memahami prosedur kantor dan mampu menjalankan tugas dengan baik", optionC: "Bolos kerja", optionD: "Ikut budaya office saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menjadi хорошим административным сотрудником?", optionA: "Kerja seadanya", optionB: "Rajin, teliti, ramah, dan selalu belajar untuk meningkatkan kemampuan", optionC: "Ikut budaya office", optionD: "Santai saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },

    // APTITUDE Questions
    { stem: "Jika perlu membuat 50 surat dan setiap butuh 2 menit, berapa lama total?", optionA: "90 menit", optionB: "100 menit", optionC: "80 menit", optionD: "120 menit", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Anda memiliki 8 jam kerja. Jika 2 jam用于开会, berapa jam untuk bekerja?", optionA: "7 jam", optionB: "6 jam", optionC: "5 jam", optionD: "4 jam", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Jika harus bayar供应商 Rp500.000 dan sudah dibayar Rp300.000, berapa sisa?", optionA: "Rp100.000", optionB: "Rp200.000", optionC: "Rp250.000", optionD: "Rp150.000", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Dalam sehari ada 25 email dan setiap butuh 5 menit untuk dibalas, berapa jam?", optionA: "2 jam", optionB: "2.08 jam", optionC: "3 jam", optionD: "1.5 jam", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Karyawan mengambil cuti 5 hari. Jika mulai hari Senin, kapan kembali?", optionA: "Hari Senin berikutnya", optionB: "Hari Senin berikutnya setelah hari Jumat", optionC: "Hari Minggu", optionD: "Hari Sabtu", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Berapa rata-rata jika nilai adalah 80, 85, 90, dan 95?", optionA: "87", optionB: "87.5", optionC: "88", optionD: "86", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },

    // HOSPITALITY Questions
    { stem: "Bagaimana menyambut tamu yang datang ke kantor?", optionA: "Diabaikan", optionB: "Senyum, salam, tanyakan keperluan, dan bantu dengan ramah", optionC: "Diam saja", optionD: "Marah-marah", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat ada telepon masuk?", optionA: "Diam saja", optionB: "Angkat dengan salam, tanyakan keperluan, dan arahkan dengan sopan", optionC: "Angkat terus letakkan", optionD: "Diam terus", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani tamu yang tidak sabar?", optionA: "Marah balik", optionB: "Tetap tenang, minta maaf untuk waktu tunggu, dan layani dengan lebih cepat", optionC: "Diam saja", optionD: "Kerasukan", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Mengapa penampilan rapi penting untuk admin?", optionA: "Tidak penting", optionB: "Admin adalah wajah perusahaan, penampilan rapi mencerminkan profesionalisme", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan saat tamu menunggu terlalu lama?", optionA: "Biarkan saja", optionB: "Minta maaf, sediakan minuman, dan informasikan status", optionC: "Sembunyikan", optionD: "Diam saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Как ответить на вопрос visitor tentang produk компании?", optionA: "Diam saja", optionB: "Jawab dengan ramah, jika tidak tahu, arahkan ke yang lebih kompeten", optionC: "Bohong saja", optionD: "Kasar saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        ...q,
        jobDivision: division,
        points: q.difficulty === "EASY" ? 1 : q.difficulty === "MEDIUM" ? 2 : 3,
        isActive: true,
      },
    });
  }

  console.log(`✅ Added ${questions.length} questions for ${division}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
