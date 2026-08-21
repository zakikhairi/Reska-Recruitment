// Seed questions for RES_CLEAN division
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding questions for RES_CLEAN division...");

  const division = "RES_CLEAN";

  const questions = [
    // HOSPITALITY - Cleaning Service
    { stem: "Apa prioritas utama cleaning service di kereta?", optionA: "Membersihkan sesuai keinginan sendiri", optionB: "Menjaga kebersihan dan kenyamanan penumpang", optionC: "Hanya membersihkan saat ada instruction", optionD: "Membersihkan sekali sehari", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara menangani sampah di dalam kereta?", optionA: "Mengumpulkan dan membuang ke tempat sampah yang sesuai", optionB: "Mendorongnya ke bawah kursi", optionC: "Membiarkan saja", optionD: "Membakar sampah", correctAnswer: "A", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat menemukan barang hilang penumpang?", optionA: "Membawa pulang", optionB: "Menyerahkan ke petugas atau ruang kehilangan", optionC: "Membuka dan memeriksa", optionD: "Membuang", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Kapan waktu yang tepat untuk membersihkan kereta?", optionA: "Saat penumpang masih banyak", optionB: "Saat kereta sedang tidak beroperasi atau между perjalanan", optionC: "Kapan saja", optionD: "Tidak perlu membersihkan", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika ada noda sulit di kursi?", optionA: "Mengabaikan", optionB: "Menggunakan pembersih yang sesuai dan metode yang tepat", optionC: "Mengganti kursi", optionD: "Menutup dengan koran", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menjaga kebersihan toilet kereta?", optionA: "Sesekali saja", optionB: "Membersihkan secara berkala dan memastikan perlengkapan tersedia", optionC: "Tidak perlu dibersihkan", optionD: "Bersihkan saat bau saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat cleaning agent hampir habis?", optionA: "Tidak usah pakai", optionB: "Melapor ke supervisor untuk penambahan stok", optionC: "Meminta penumpang membelikan", optionD: "Membawa dari rumah sendiri", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara membersihkan lantai kereta yang licin?", optionA: "Membiarkan saja", optionB: "Menggunakan alat pel yang sesuai dan tanda peringatan basah", optionC: "Taburan bedak bayi", optionD: "Tidak perlu dibersihkan", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang dilakukan jika menemukan penumpang merokok di area yang dilarang?", optionA: "Mengabaikan", optionB: "Mengingatkan dengan sopan tentang aturan dan bahaya merokok", optionC: "Ikut merokok", optionD: "Memarahi penumpang", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara menangani heap被发现 di kereta?", optionA: "Menyentuhnya dengan tangan telanjang", optionB: "Menggunakan sarung tangan dan alat pelindung, lalu membersihkan area tersebut", optionC: "Mengabaikan", optionD: "Menaburkan bumbu", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang harus dilakukan setelah membersihkan jendela kereta?", optionA: "Meninggalkan seperti biasa", optionB: "Memastikan jendela bersih dan tidak ada bekas air", optionC: "Membiarkan basah", optionD: "Tidak perlu mengelap", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara membersihkan area dapur di kereta makanan?", optionA: "Dengan air saja", optionB: "Menggunakan desinfektan dan memastikan standar kebersihan makanan", optionC: "Tidak perlu dibersihkan", optionD: "Biarkan kotor", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang dilakukan jika menemukan kerusakan pada fasilitas kereta saat membersihkan?", optionA: "Mengabaikan", optionB: "Mencatat dan melapor ke tim maintenance", optionC: "Memperbaiki sendiri", optionD: "Menyembunyikan kerusakan", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara membersihkan kursi fabric yang kotor?", optionA: "Diganti saja", optionB: "Menggunakan vacuum cleaner dan spot cleaner yang sesuai", optionC: "Disiram air banyak", optionD: "Dibakar", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa pentingnya safety saat membersihkan kereta?", optionA: "Tidak penting", optionB: "Sangat penting untuk melindungi diri sendiri dan penumpang", optionC: "Hanya penting untuk penumpang", optionD: "Tidak perlu safety", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara membuang sampah basah dan kering?", optionA: "Dicampur jadi satu", optionB: "Dikelompokkan dan dibuang sesuai jenis sampahnya", optionC: "Dibiarkan menumpuk", optionD: "Dibakar", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika air pembersih tumpah di lantai?", optionA: "Diabaikan", optionB: "Langsung dibersihkan untuk mencegah lantai licin", optionC: "Dibiarkan sampai kering sendiri", optionD: "Ditambahkan lebih banyak air", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara membersihkan AC kereta yang berdebu?", optionA: "Tidak perlu", optionB: "Membersihkan filter AC secara berkala sesuai prosedur", optionC: "Disiram air", optionD: "Dibuka saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang dilakukan jika ada penumpang yang menyenggangkan kaki ke tempat duduk?", optionA: "Mengabaikan", optionB: "Mengingatkan dengan sopan tentang menjaga kebersihan dan kenyamanan bersama", optionC: "Memarahi", optionD: "Melaporkan ke polisi", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara menjaga kebersihan saat площадь kerja terbatas?", optionA: "Bekerja asal-asalan", optionB: "Bekerja secara sistematis dan优先 membersihan area prioritas", optionC: "Tidak membersihkan", optionD: "Melewati area tersebut", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },

    // AKHLAK Questions
    { stem: "Apa arti budaya AKHLAK di KAI?", optionA: "Akhlak, Kerja, Iman", optionB: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", optionC: "Akurat, Kuat, Hebat", optionD: "Anti Korupsi, Loyalitas Tinggi", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa jujur penting dalam pekerjaan cleaning service?", optionA: "Tidak penting", optionB: "Karena kepercayaan employers and passengers depend on it", optionC: "Hanya penting saat diawasi", optionD: "Tidak perlu jujur", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan работа в команде dalam cleaning service?", optionA: "Bekerja sendiri saja", optionB: "Bekerja sama dengan rekan untuk menyelesaikan tugas pembersihan", optionC: "Tidak perlu bekerja sama", optionD: "Saling menyalahkan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menunjukkan rasa hormat kepada penumpang?", optionA: "Mengabaikan mereka", optionB: "Bekerja dengan tenang dan tidak mengganggu penumpang", optionC: "Bicara keras", optionD: "Meludah di depan mereka", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika membuat kesalahan saat membersihkan?", optionA: "Sembunyikan", optionB: "Mengakui kesalahan dan memperbaiki segera", optionC: "Menyalahkan orang lain", optionD: "Berbohong", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa menjaga kebersihan adalah bentuk pelayanan?", optionA: "Tidak ada hubungannya", optionB: "Kebersihan直接影响 kenyamanan dan kesehatan penumpang", optionC: "Hanya tugas biasa", optionD: "Tidak perlu memikirkan penumpang", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Kompeten' untuk cleaning service?", optionA: "Tahu cara tidur yang enak", optionB: "Memahami prosedur pembersihan yang benar dan menggunakan alat dengan tepat", optionC: "Bekerja seenaknya", optionD: "Tidak perlu pelatihan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menjadi employee yang dapat dipercaya?", optionA: "Bekerja saat diawasan saja", optionB: "Menjalankan tugas dengan tanggung jawab bahkan tanpa pengawasan", optionC: "Malas-malasan", optionD: "Mencuri barang penumpang", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan 'Loyal' dalam pekerjaan?", optionA: "Setia pada atasan saja", optionB: "Komitmen untuk melakukan pekerjaan dengan baik dan menjaga nama baik perusahaan", optionC: "Menyebarkan gosip", optionD: "Bekerja asal-asalan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa penting untuk mengikuti prosedur yang benar?", optionA: "Tidak perlu", optionB: "Untuk memastikan kebersihan tercapai dan keselamatan terjaga", optionC: "Hanya formalitas", optionD: "Agar tidak ди惩罚", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },

    // APTITUDE Questions
    { stem: "Jika ada 8 kereta dan setiap kereta perlu 4 kali pembersihan, berapa total pembersihan?", optionA: "24 kali", optionB: "32 kali", optionC: "28 kali", optionD: "36 kali", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Seorang cleaning staff membersihkan 3 gerbong dalam 30 menit. Berapa menit untuk 1 gerbong?", optionA: "15 menit", optionB: "10 menit", optionC: "20 menit", optionD: "5 menit", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Berapa luas area yang bisa dibersihkan jika kecepatan 2 м2 в минуту selama 1 jam?", optionA: "100 m2", optionB: "120 m2", optionC: "90 m2", optionD: "150 m2", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Jika需要进行 تنظيف каждые 4 часа в течение 12-часового рабочего дня, сколько раз нужно чистить?", optionA: "2 раза", optionB: "3 раза", optionC: "4 раза", optionD: "1 раз", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Berapa banyak botol pembersih yang dibutuhkan jika setiap botol untuk 5 kereta dan ada 25 kereta?", optionA: "4 botol", optionB: "5 botol", optionC: "6 botol", optionD: "3 botol", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Jika член бригады заболел и обычно убирает 6 вагонов в день, сколько вагонов нужно分配其他人?", optionA: "6 вагонов", optionB: "Все 6 вагонов нужно разделить между оставшимися членами", optionC: "0 вагонов", optionD: "12 вагонов", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Jam kerja dimulai 06:00 dan berakhir 14:00. Berapa jam kerja?", optionA: "6 jam", optionB: "8 jam", optionC: "7 jam", optionD: "9 jam", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Jika tersedia 20 литров чистящего средства и каждый вагон использует 2 литра, сколько вагонов можно почистить?", optionA: "8 вагонов", optionB: "10 вагонов", optionC: "12 вагонов", optionD: "15 вагонов", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },

    // TECHNICAL Questions
    { stem: "Apa yang harus dilakukan jika alat pembersih rusak?", optionA: "Dipaksa pakai", optionB: "Segera melapor untuk diperbaiki atau diganti", optionC: "Membeli sendiri", optionD: "Menyimpan dulu", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara menggunakan vacuum cleaner dengan benar?", optionA: "Dorong secepat mungkin", optionB: "Gerakkan perlahan dan systematiz pentru hasil terbaik", optionC: "Hidupkan saja", optionD: "Tidak perlu tahu cara pakau", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika terjadi kebocoran air di kereta?", optionA: "Diabaikan", optionB: "Matikan valve и hubungi tim maintenance", optionC: "Biarkan terus mengalir", optionD: "Naikkan volume air", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menyimpan alat pembersih yang benar?", optionA: "Di mana saja", optionB: "Di tempat yang aman dan terpisah dari makanan", optionC: "Di dalam kereta", optionD: "Di luar kereta", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi desinfektan dalam pembersihan?", optionA: "Memberi wangi", optionB: "Membunuh kuman dan bakteri", optionC: "Mencuci lantai", optionD: "Meringankan kerja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
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
