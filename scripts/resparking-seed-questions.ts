// Seed questions for RES_PARKING division
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding questions for RES_PARKING division...");

  const division = "RES_PARKING";

  const questions = [
    // HOSPITALITY Questions - Parking
    { stem: "Apa prioritas utama petugas parkir?", optionA: "Mengumpulkan uang sebanyak-banyaknya", optionB: "Menjamin keselamatan dan kelancaran lalu lintas kendaraan", optionC: "Bekerja santai", optionD: "Tidur saat duty", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara menyambut pengemudi yang datang ke area parkir?", optionA: "Mengabaikan mereka", optionB: "Menyapa dengan ramah dan arahkan ke tempat parkir yang kosong", optionC: "Marah-marah", optionD: "Teriak dari jauh", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat ada kendaraan parkir sembarangan?", optionA: "Diam saja", optionB: "Minggat dan arahkan ke tempat yang benar dengan sopan", optionC: "Memasang boot langsung", optionD: "Merusak kendaraan", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani pengemudi yang emosi?", optionA: "Marah balik", optionB: "Tetap tenang, dengarkan, dan bantu cari solusi", optionC: "Diam saja", optionD: "Panggil satpam", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Mengapa penting memberikan informasi yang jelas kepada pengemudi?", optionA: "Tidak penting", optionB: "Untuk menghindari kebingungan dan kecelakaan di area parkir", optionC: "Hiburan", optionD: "Tidak perlu", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika ada kendaraan mencurigakan?", optionA: "Diam saja", optionB: "Lapor ke security dan perhatikan pergerakan kendaraan tersebut", optionC: "Buka pintu kendaraan", optionD: "Ikut masuk", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani lansia yang kesulitan парковаться?", optionA: "Mengabaikan", optionB: "Bantu mengarahkan dan berikan waktu lebih untuk парковаться", optionC: "Teriak biar cepat", optionD: "Tolak membantu", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat area parkir penuh?", optionA: "Biarkan kendaraan masuk terus", optionB: "Jelaskan dengan sopan dan arahkan ke tempat parkir lain", optionC: "Tolak semua kendaraan", optionD: "Diam saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani situasi when driver tidak mau bayar?", optionA: "Berkelahi", optionB: "Jelaskan tarif dengan sopan dan minta bantuan security jika perlu", optionC: "Diam saja", optionD: "Pukul pengemudi", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan saat ada acidente di area parkir?", optionA: "Lari dari lokasi", optionB: "Amankan lokasi, bantu korban, dan segera hubungi bantuan", optionC: "Biarkan saja", optionD: "Ambil barang korban", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana berkomunikasi dengan tourists atau foreigners?", optionA: "Bingung dan diam saja", optionB: "Gunakan bahasa Inggris sederhana dan gestur yang jelas", optionC: "Kasar saja", optionD: "Lari dari situ", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang harus dilakukan saat ada keluhan dari пользователь?", optionA: "Marah balik", optionB: "Dengarkan dengan baik, minta maaf, dan cari solusi terbaik", optionC: "Diam saja", optionD: "Tutup telinga", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Mengapa kerapian penampilan penting untuk petugas parkir?", optionA: "Tidak penting", optionB: "Penampilan rapi mencerminkan profesionalisme dan keamanan area parkir", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara memberikan directions yang jelas?", optionA: "Gestur asal", optionB: "Gunakan tangan dengan jelas dan pastikan pengemudi mengerti", optionC: "Bilang sendiri-sendiri", optionD: "Diam saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika ada anak bermain di area parkir?", optionA: "Diabaikan", optionB: "Segera amankan dan ingatkan orang tua untuk menjaga anak mereka", optionC: "Ikut bermain", optionD: "Marah ke anak", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani kendaraan besar yang sulit парковаться?", optionA: "Diam saja", optionB: "Bantu mengarahkan dengan sabar dan berikan waktu lebih", optionC: "Sering-sering klakson", optionD: "Tolak kendaraan besar", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Mengapa good service penting dalam parkir?", optionA: "Tidak penting", optionB: "Memberikan impression positif kepada pengguna dan meningkatkan loyalitas", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat hujan deras?", optionA: "Pergi cari tempat perlindungan", optionB: "Tetap di posto dan pastikan pengemudi mendapat informasi keamanan", optionC: "Diam saja", optionD: "Lari ke rumah", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana mengelola area parkir yang terbatas ruang?", optionA: "Biarkan berantakan", optionB: "Atur kendaraan dengan sistematis dan pastikan ada ruang untuk manuver", optionC: "Tolak kendaraan baru", optionD: "Diam saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang dilakukan saat ada kendaraan mewah parkir?", optionA: "Benci mobil mewah", optionB: "Tetap layani dengan baik dan profesional tanpa membedakan", optionC: "Minta tip dulu", optionD: "Jual nomor antrian", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },

    // AKHLAK Questions
    { stem: "Apa arti budaya AKHLAK di KAI?", optionA: "Akhlak, Kerja, Iman", optionB: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", optionC: "Akurat, Kuat, Hebat", optionD: "Anti Korupsi, Loyalitas Tinggi", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa kejujuran penting dalam pekerjaan parkir?", optionA: "Tidak penting", optionB: "Untuk menjaga kepercayaan pengguna dan integritas perusahaan", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika melihat rekan melanggar aturan?", optionA: "Diam saja", optionB: "Ingatkan dengan baik dan laporkan keatasan jika diperlukan", optionC: "Ikut melanggar juga", optionD: "Sembunyikan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa disiplin penting untuk petugas parkir?", optionA: "Tidak penting", optionB: "Untuk menjaga keamanan dan kelancaran area parkir", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti Loyal untuk petugas parkir?", optionA: "Setia pada uang", optionB: "Komitmen menjalankan tugas dengan baik meskipun tanpa pengawasan", optionC: "Setia pada bos", optionD: "Bolos kerja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menunjukkan integritas saat ada kesempatan untuk menerima suap?", optionA: "Terima suap", optionB: "Tolak dengan tegas dan laporkan insiden tersebut", optionC: "Diam saja", optionD: "Terima saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan bekerja sama dalam tim parkir?", optionA: "Bekerja sendiri saja", optionB: "Bekerja sama dengan rekan untuk mengatur lalu lintas dengan baik", optionC: "Saling menyalahkan", optionD: "Tolak semua bantuan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa penting untuk selalu safety first?", optionA: "Tidak penting", optionB: "Untuk melindungi diri sendiri dan pengguna area parkir", optionC: "Hiburan", optionD: "Tidak ada pengaruh", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika membuat kesalahan saat duty?", optionA: "Sembunyikan", optionB: "Akui kesalahan, perbaiki jika memungkinkan, dan belajar darinya", optionC: "Salahkan orang lain", optionD: "Diam saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti Kompeten untuk petugas parkir?", optionA: "Tahu cara tidur saat duty", optionB: "Memahami aturan lalu lintas dan mampu mengarahkan kendaraan dengan baik", optionC: "Punya kendaraan sendiri", optionD: "Ikut-ikut saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa Adaptif penting untuk petugas parkir?", optionA: "Tidak penting", optionB: "Situasi parkir bisa berubah, kita harus bisa menyesuaikan diri", optionC: "Tetap di zona nyaman", optionD: "Tidak perlu berubah", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },

    // APTITUDE Questions
    { stem: "Jika ada 100 kendaraan dan setiap butuh tempat 5 m2, berapa total ruang yang dibutuhkan?", optionA: "400 m2", optionB: "500 m2", optionC: "600 m2", optionD: "450 m2", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Petugas bekerja 8 jam shift. Jika shift mulai 06:00, jam berapa selesai?", optionA: "14:00", optionB: "14:00", optionC: "15:00", optionD: "13:00", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Dalam 1 jam ada 30 kendaraan masuk dan 25 kendaraan keluar. Berapa net perubahan?", optionA: "5 kendaraan", optionB: "5 kendaraan masuk", optionC: "55 kendaraan", optionD: "10 kendaraan", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Jika tarif parkir Rp3.000/jam dan kendaraan parkir 5 jam, berapa biaya?", optionA: "Rp12.000", optionB: "Rp15.000", optionC: "Rp18.000", optionD: "Rp10.000", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Area parkir kapasitas 50 kendaraan. Sekarang ada 35. Berapa slot kosong?", optionA: "10", optionB: "15", optionC: "20", optionD: "25", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Petugas rotate setiap 4 jam. Jika mulai pagi jam 06:00, jam berapa shift ketiga mulai?", optionA: "14:00", optionB: "14:00", optionC: "18:00", optionD: "10:00", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Jika 20% dari 200 kendaraan adalah mobil besar, berapa mobil besar?", optionA: "30", optionB: "40", optionC: "50", optionD: "60", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },

    // TECHNICAL Questions
    { stem: "Apa yang harus dilakukan saat alat pembayaran elektronik tidak berfungsi?", optionA: "Diam saja", optionB: "Gunakan metode pembayaran alternatif dan coba restart perangkat", optionC: "Paksa terima cash saja", optionD: "Tutup area parkir", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa penting untuk mencatat setiap kendaraan masuk?", optionA: "Hiburan", optionB: "Untuk accounting dan tracking kendaraan di area parkir", optionC: "Tidak penting", optionD: "Buat rumit saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi CCTV di area parkir?", optionA: "Hiburan", optionB: "Untuk keamanan dan membantu identifikasi jika terjadi insiden", optionC: "Pajangan", optionD: "Buat keren", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara menggunakan portable payment device?", optionA: "Tekan tombol acak", optionB: "Ikuti prosedur yang sudah training dan pastikan transaksi berhasil", optionC: "Diam saja", optionD: "Paksa coba semua", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat ada kerusakan lampu di area parkir?", optionA: "Diabaikan", optionB: "Lapor ke tim maintenance untuk perbaikan segera", optionC: "Pasang sendiri", optionD: "Biarkan gelap", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa barrier atau gate penting di area parkir?", optionA: "Pajangan", optionB: "Untuk mengontrol akses kendaraan masuk dan keluar", optionC: "Hiburan", optionD: "Tidak penting", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dilakukan saat terjadi kerusakan pada gate otomatis?", optionA: "Paksa buka", optionB: "Gunakan mode manual dan hubungi teknisi untuk perbaikan", optionC: "Diam saja", optionD: "Pukul gate", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Bagaimana memastikan safety di area парковка saat malam hari?", optionA: "Matikan semua lampu", optionB: "Pastikan pencahayaan cukup, patroli rutin, dan selalu berkomunikasi dengan security", optionC: "Tidur saja", optionD: "Pergi dari posto", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
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
