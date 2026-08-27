// Seed questions for IT_STAFF division
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding questions for IT_STAFF division...");

  const division = "IT_STAFF";

  const questions = [
    // TECHNICAL Questions - IT
    { stem: "Apa yang harus dilakukan saat komputer restart tiba-tiba?", optionA: "Membuka semua file yang tadi", optionB: "Menyimpan pekerjaan secara berkala dan memastikan tidak ada masalah hardware", optionC: "Memukul komputer", optionD: "Tidak perlu khawatir", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa langkah pertama saat printer tidak mau print?", optionA: "Membuang printer", optionB: "Mengecek koneksi, tinta/toner, dan status antrian print", optionC: "Membeli printer baru", optionD: "Tidak usah print", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan 'backup data'?", optionA: "Menghapus data", optionB: "Membuat salinan data untuk jaga-jaga jika data asli hilang", optionC: "Mengubah data", optionD: "Memindahkan data", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa penting untuk mengupdate software secara berkala?", optionA: "Tidak penting", optionB: "Untuk menutup celah keamanan dan mendapatkan fitur terbaru", optionC: "Membuat komputer lambat", optionD: "Hanya formalitas", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika lupa password komputer?", optionA: "Membiarkan saja", optionB: "Menghubungi tim IT untuk reset password sesuai prosedur", optionC: "Mencoba semua kombinasi", optionD: "Membuka paksa", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi firewall dalam jaringan komputer?", optionA: "Memberi warna layar", optionB: "Melindungi jaringan dari akses yang tidak sah", optionC: "Mempercepat internet", optionD: "Menyimpan file", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menangani komputer yang lambat?", optionA: "Belikan komputer baru", optionB: "Mengecek penggunaan RAM, menutup aplikasi yang tidak perlu, dan membersihkan virus", optionC: "Diam saja", optionD: "Memukul keyboard", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan VPN?", optionA: "Video Player", optionB: "Virtual Private Network - koneksi aman untuk mengakses jaringan dari jauh", optionC: "Virus Protection Network", optionD: "Video Processing Node", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Mengapa tidak boleh menggunakan flashdisk sembarangan di komputer kantor?", optionA: "Karena mahal", optionB: "Untuk mencegah virus dan malware masuk ke sistem", optionC: "Tidak ada alasan", optionD: "Karena tidak dilarang", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat menerima email mencurigakan?", optionA: "Membuka semua link", optionB: "Tidak membuka link dan lampiran, lalu melapor ke tim IT", optionC: "Forward ke semua orang", optionD: "Mengabaikan sepenuhnya", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa perbedaan antara RAM dan ROM?", optionA: "Sama saja", optionB: "RAM adalah memori sementara, ROM adalah memori permanen", optionC: "RAM lebih besar", optionD: "Tidak ada hubungan", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Apa fungsi antivirus?", optionA: "Membuat komputer cepat", optionB: "Mendeteksi dan menghapus malware/virus dari komputer", optionC: "Mengganti Windows", optionD: "Mencetak dokumen", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara membuat password yang kuat?", optionA: "Nama sendiri", optionB: "Kombinasi huruf besar, kecil, angka, dan simbol yang panjang", optionC: "Tanggal lahir", optionD: "Password123", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan cloud storage?", optionA: "Penyimpanan awan", optionB: "Penyimpanan data di internet yang bisa diakses dari mana saja", optionC: "Hardisk besar", optionD: "USB", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa penting untuk logout dari komputer saat meninggalkan meja?", optionA: "Tidak penting", optionB: "Untuk mencegah akses tidak sah oleh orang lain", optionC: "Hemat listrik", optionD: "Buang waktu", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat jaringan internet kantor down?", optionA: "Bermain HP sendiri", optionB: "Mengecek koneksi perangkat, melapor ke tim IT, dan tunggu perbaikan", optionC: "Pulang saja", optionD: "Marah-marah", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa perbedaan antara LAN dan WAN?", optionA: "Tidak ada bedanya", optionB: "LAN untuk area lokal, WAN untuk area luas/mencakup banyak lokasi", optionC: "LAN lebih mahal", optionD: "WAN lebih kecil", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Apa fungsi DNS dalam jaringan?", optionA: "Download Name", optionB: "Menerjemahkan nama domain ke alamat IP", optionC: "Delete Network System", optionD: "Device Name Storage", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Mengapa tidak boleh install software sembarangan?", optionA: "Karena mahal", optionB: "Software tidak resmi bisa mengandung virus dan melanggar lisensi", optionC: "Tidak ada masalah", optionD: "Karena internet lemot", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan IP address?", optionA: "Internet Password", optionB: "Alamat unik yang diberikan ke perangkat dalam jaringan", optionC: "Internal Protocol", optionD: "Internet Provider", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara mengatasi error 'blue screen'?", optionA: "Diabaikan saja", optionB: "Catat kode error, restart komputer, dan hubungi tim IT jika terus terjadi", optionC: "Beli komputer baru", optionD: "Kecilkan layar", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Apa fungsi dari UPS?", optionA: "Membersihkan keyboard", optionB: "Memberi daya cadangan sementara saat listrik padam", optionC: "Mengcepatkan komputer", optionD: "Mendinginkan CPU", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Apa perbedaan antara hub dan switch?", optionA: "Sama saja", optionB: "Hub mengirim data ke semua port, switch mengirim data ke port tujuan saja", optionC: "Switch lebih mahal", optionD: "Hub lebih canggih", correctAnswer: "B", category: "TECHNICAL", difficulty: "HARD" },
    { stem: "Mengapa penting membuat strong password?", optionA: "Tidak penting", optionB: "Untuk melindungi akun dan data dari akses yang tidak sah", optionC: "Hanya iseng", optionD: "Buat rumit saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan enkripsi data?", optionA: "Menghapus data", optionB: "Mengubah data menjadi kode yang tidak bisa dibaca tanpa kunci", optionC: "Menggandakan data", optionD: "Merename file", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },

    // AKHLAK Questions
    { stem: "Apa arti budaya AKHLAK di KAI?", optionA: "Akhlak, Kerja, Iman", optionB: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", optionC: "Akurat, Kuat, Hebat", optionD: "Anti Korupsi, Loyalitas Tinggi", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa kejujuran penting dalam pekerjaan IT?", optionA: "Tidak penting", optionB: "Data dan sistem perusahaan bergantung pada kejujuran kita", optionC: "Hanya formalitas", optionD: "Tidak ada hubungannya", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika melihat kerentanan keamanan?", optionA: "Diam saja", optionB: "Melapor ke supervisor dan tim keamanan IT", optionC: "Manfaatkan celah tersebut", optionD: "Cerita ke teman", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menjadi IT staff yang колaboratif?", optionA: "Bekerja sendiri saja", optionB: "Saling membantu tim lain dan berbagi pengetahuan", optionC: "Tidak mau bantu", optionD: "Semangat kompetitor", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa保密 data penting?", optionA: "Tidak penting", optionB: "Melindungi informasi perusahaan dan privasi pengguna", optionC: "Hanya atasan yang perlu tahu", optionD: "Bebas sharing", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Kompeten' untuk IT staff?", optionA: "Bisa main game", optionB: "Memiliki pengetahuan IT yang memadai dan terus belajar teknologi baru", optionC: "Bisa ngetik cepat", optionD: "Punya komputer mahal", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menangani пользователь yang tidak paham teknologi?", optionA: "Marah-marah", optionB: "Bersabar объяснять dengan bahasa yang mudah dipahami", optionC: "Kerja sendiri", optionD: "Tidak melayani", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan etika dalam dunia IT?", optionA: "Tidak ada etika", optionB: "Menggunakan teknologi secara bertanggung jawab dan sesuai aturan", optionC: "Bebas sesuka hati", optionD: "Ikut budaya kantor saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa penting untuk selalu belajar teknologi baru?", optionA: "Tidak perlu", optionB: "Teknologi terus berkembang dan kita harus mengikuti perkembangannya", optionC: "Sudah cukup yang lama", optionD: "Hanya Formalitas", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat membuat kesalahan dalam konfigurasi sistem?", optionA: "Sembunyikan", optionB: "Akui kesalahan dan perbaiki secepat mungkin", optionC: "Salahkan orang lain", optionD: "Pura-pura tidak tahu", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },

    // APTITUDE Questions
    { stem: "Jika ada 20 komputer dan setiap komputer perlu update 30 menit, berapa total waktu?", optionA: "600 jam", optionB: "10 jam", optionC: "15 jam", optionD: "20 jam", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Kecepatan download 2 MB/detik. Berapa lama download file 100 MB?", optionA: "30 detik", optionB: "50 detik", optionC: "100 detik", optionD: "25 detik", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Dalam sehari ada 50 user yang butuh bantuan IT. Jika 1 ticket diselesaikan 10 menit, berapa jam?", optionA: "8.3 jam", optionB: "500 menit", optionC: "50 jam", optionD: "5 jam", correctAnswer: "A", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Berapa banyak device yang bisa di-monitor jika rasio 1 IT staff : 25 device dan ada 4 staff?", optionA: "50 device", optionB: "100 device", optionC: "75 device", optionD: "125 device", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Storage server 1 TB. Sudah terpakai 750 GB. Berapa % masih kosong?", optionA: "15%", optionB: "25%", optionC: "35%", optionD: "20%", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },

    // HOSPITALITY Questions
    { stem: "Bagaimana sebaiknya memberikan bantuan teknis kepada пользователь?", optionA: "Gunakan istilah teknis yang rumit", optionB: "Jelaskan dengan bahasa yang mudah dipahami pengguna", optionC: "Kerjakan saja untuk mereka", optionD: "Kirim manual tebal", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika пользователь marah karena masalah teknis?", optionA: "Marah balik", optionB: "Tetap tenang, dengarkan keluhan, dan fokus pada solusi", optionC: "Diam saja", optionD: " закрыть ticket", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Mengapa penting untuk mengikuti up saat pengguna?", optionA: "Tidak penting", optionB: "Untuk memahami kebutuhan dan проблема mereka secara langsung", optionC: "Hanya formalitas", optionD: "Bolos kerja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara memberikan layanan IT yang prima?", optionA: "Kerjakan seadanya", optionB: "Responsif, solutif, dan коммуникабельный dengan pengguna", optionC: "Tunda pekerjaan", optionD: "Salahkan pengguna", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika masalah tidak bisa diselesaikan hari itu?", optionA: "Diam saja", optionB: "Jelaskan kepada пользователь dan berikan estimasi waktu penyelesaian", optionC: "Paksa selesai", optionD: " закрыть без решения", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
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
