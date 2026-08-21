// Seed questions for each division - ON_TRAIN_SERVICE
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding questions for ON_TRAIN_SERVICE division...");

  const division = "ON_TRAIN_SERVICE";

  const questions = [
    // HOSPITALITY Questions
    { stem: "Apa yang harus dilakukan saat penumpang meminta bantuan khusus?", optionA: "Mengabaikan permintaan tersebut", optionB: "Mengarahkan ke staf lain", optionC: "Membantu dengan ramah sesuai prosedur", optionD: "Menolak dengan tegas", correctAnswer: "C", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa prioritas utama seorang pramugara kereta?", optionA: "Kenyamanan pribadi", optionB: "Keselamatan dan kenyamanan penumpang", optionC: "Menyelesaikan tugas administrasi", optionD: "Beristirahat di kabin", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara menangani penumpang yang marah?", optionA: "Membalas dengan marah", optionB: "Mengabaikan", optionC: "Tetap tenang dan empati, cari solusi", optionD: "Melapor ke polisi", correctAnswer: "C", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang harus dilakukan saat kereta akan berhenti di stasiun?", optionA: "Langsung turun dulu", optionB: "Membiarkan penumpang berdesakan", optionC: "Membimbing penumpang turun dengan tertib", optionD: "Melanjutkan pekerjaan lain", correctAnswer: "C", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menyambut penumpang yang naik ke kereta?", optionA: "Mengabaikan mereka", optionB: "Menyapa dengan salam dan senyum", optionC: "Meminta mereka出示票", optionD: "Bekerja sendiri tanpa menyapa", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika ada penumpang duduk di tempat yang salah?", optionA: "Memarahi penumpang", optionB: "Mengabaikan", optionC: "Meng arahkan dengan sopan ke tempat duduk yang benar", optionD: "Memaksa turun", correctAnswer: "C", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani penumpang lanjut usia yang sulit berjalan?", optionA: "Membantu mereka duduk dan menawarkan bantuan", optionB: "Meminta mereka berdiri saja", optionC: "Tidak memberi perhatian khusus", optionD: "Menolak mereka masuk kereta", correctAnswer: "A", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika terjadi keadaan darurat di kereta?", optionA: "Panik dan berlari", optionB: "Mengikuti prosedur darurat yang sudah培训", optionC: "Melihat乘客 lain bereaksi", optionD: "Menyembunyikan diri", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menjaga kebersihan di dalam kereta?", optionA: "Menyuruh penumpang membersihkan", optionB: "Membersihkan secara berkala dan mengingatkan penumpang", optionC: "Tidak perlu membersihkan", optionD: "Membersihkan sekali sehari saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika ada penumpang yang sakit?", optionA: "Mengabaikan", optionB: "Menawarkan bantuan dan联系 работодатель medis jika diperlukan", optionC: "Meminta mereka turun", optionD: "Tidak melakukan apa-apa", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana menangani багаж yang ditinggalkan penumpang?", optionA: "Membuka dan memeriksa sendiri", optionB: "Segera melapor ke начальник и принимать меры по обеспечению безопасности", optionC: "Mengambil untuk sendiri", optionD: "Tidak peduli", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang harus dilakukan saat kereta mengalami keterlambatan?", optionA: "Bekerja sama dengan tim untuk menginformasikan penumpang", optionB: "Menyalahkan perusahaan kereta", optionC: "Tidak memberi informasi", optionD: "Menyalahkan penumpang", correctAnswer: "A", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara menangani anak-anak yang单独旅行?", optionA: "Tidak memperhatikan", optionB: "Memberikan pengawasan ekstra dan perhatian", optionC: "Meminta mereka tenang saja", optionD: "Menolak menerima mereka di kereta", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang harus dilakukan jika ada penumpang merokok di kereta?", optionA: "Mengabaikan", optionB: "Mengingatkan bahwa merokok dilarang dan действовать sesuai aturan", optionC: "Ikut merokok juga", optionD: "Melapor ke polisi saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana cara memastikan semua penumpang memiliki tiket yang valid?", optionA: "Tidak perlu memeriksa", optionB: "Melakukan проверка билетов dengan sopan kepada semua penumpang", optionC: "Memeriksa hanya penumpang yang mencurigakan", optionD: "Percaya pada semua penumpang", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika ada紧急事件 seperti api di kereta?", optionA: "Panik", optionB: "Mengaktifkan alarm dan mengikuti prosedur evakuasi", optionC: "Lari sendiri", optionD: "Bersembunyi", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menangani penumpang yang ingin menurunkan barang di tengah perjalanan?", optionA: "Membolehkan turun di sembarang tempat", optionB: "Menjelaskan bahwa penurunan hanya bisa dilakukan di stasiun", optionC: "Mengabaikan permintaan", optionD: "Memaksa mereka turun", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat kondisi kereta overcrowded?", optionA: "Membiarkan situasi tetap拥挤", optionB: "Bekerja sama dengan tim untuk mengatur fluxo и обеспечить безопасность", optionC: "Menolak penumpang masuk", optionD: "Tidak melakukan apapun", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menangani penumpang asing yang tidak bisa Bahasa Indonesia?", optionA: "Mengabaikan mereka", optionB: "Menggunakan bahasa isyarat atau bahasa Inggris sederhana", optionC: "Meminta mereka turun", optionD: "Berteriak supaya mengerti", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Apa yang dilakukan jika ada penumpang yang требует kompensasi?", optionA: "Memberikan uang sendiri", optionB: "Mendengarkan complaints и melaporkan ke atasan sesuai prosedur", optionC: "Menolak semua permintaan", optionD: "Menghina penumpang", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menjaga keamanan di dalam kereta?", optionA: "Tidak perlu担心", optionB: "Selalu waspada dan melapor jika ada tindakan mencurigakan", optionC: "Mengabaikan situasi", optionD: "Berpura-pura tidak lihat", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika ada konflik antar penumpang?", optionA: "Ikut Perkelahian", optionB: "Berdiri di antara mereka dan minta tenang, lalu laporkan ke keamanan", optionC: "Mengabaikan", optionD: "Menyuruh turun semua", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara memberikan pelayanan terbaik kepada penumpang?", optionA: "Bekerja seadanya", optionB: "Selalu ramah, tanggap, dan mengutamakan kebutuhan penumpang", optionC: "Tidak perlu ramah", optionD: "Melayaninya dengan marah", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika AC kereta tidak berfungsi?", optionA: "Tidak peduli", optionB: "Melapor ke teknisi dan menginformasikan penumpang sambil menunggu perbaikan", optionC: "Minta penumpang sabar saja", optionD: "Buka semua jendela", correctAnswer: "B", category: "HOSPITALITY", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menangani багаж yang terlalu besar?", optionA: "Membuangnya", optionB: "Mengarahkan ke tempat penyimpanan yang sesuai atau membantu penyimpanan", optionC: "Menolak semua багаж", optionD: "Membukanya paksa", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },

    // AKHLAK Questions
    { stem: "Apa arti budaya AKHLAK di KAI?", optionA: "Akhlak, Kerja, Iman", optionB: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", optionC: "Akurat, Kuat, Hebat", optionD: "Anti Korupsi, Loyalitas Tinggi", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan 'Kompeten' dalam AKHLAK?", optionA: "Selalu datang tepat waktu", optionB: "Memiliki pengetahuan dan keterampilan yang memadai", optionC: "Berpenampilan rapi", optionD: "Banyak membaca buku", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Loyal' dalam budaya AKHLAK?", optionA: "Setia kepada perusahaan saja", optionB: "Setia dan berkomitmen terhadap tugas dan perusahaan", optionC: "Tidak pernah请假", optionD: "Selalu patuh tanpa pikir", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menerapkan 'Harmonis' di tempat kerja?", optionA: "Tidak bersosialisasi dengan siapapun", optionB: "Membangun hubungan kerja yang baik dengan rekan kerja", optionC: "Bekerja sendiri saja", optionD: "Selalu berbeda pendapat", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud 'Adaptif' dalam AKHLAK?", optionA: "Tidak mau berubah", optionB: "Mampu menyesuaikan diri dengan perubahan dan tantangan baru", optionC: "Bekerja dengan cara yang sama terus", optionD: "Menolak teknologi baru", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa 'Kolaboratif' penting dalam tim?", optionA: "Tidak perlu bekerja sama", optionB: "Karena hasil kerja akan lebih baik dengan kerja sama tim", optionC: "Hanya perlu bekerja sendiri", optionD: "Kolaborasi tidak diperlukan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Amanah' dalam AKHLAK?", optionA: "Menyimpan rahasia perusahaan", optionB: "Dapat dipercaya dan bertanggung jawab dalam menjalankan tugas", optionC: "Bekerja tanpa pengawasan", optionD: "Menyimpan uang perusahaan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menunjukkan loyalitas terhadap perusahaan?", optionA: "Bekerja sesuai jam kerja saja", optionB: "Bekerja dengan semangat, menjaga nama baik, dan berkontribusi positif", optionC: "Menyebarkan gosip", optionD: "Tidak peduli dengan perusahaan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat melihat rekan kerja melakukan kesalahan?", optionA: "Diam saja", optionB: "Mengingatkan dengan cara yang baik dan mendukung perbaikan", optionC: "Melapor ke manajemen tanpa bicara dulu", optionD: "Menyebarkan ke semua orang", correctAnswer: "B", category: "AKHLAK", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara menjadi karyawan yang kolaboratif?", optionA: "Bekerja sendiri saja", optionB: "Saling membantu, berbagi pengetahuan, dan mendukung rekan kerja", optionC: "Menolak semua bantuan", optionD: "Tidak pernah bertanya", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa Adaptif penting dalam dunia kerja?", optionA: "Karena lingkungan kerja selalu berubah", optionB: "Karena perubahan adalah konstan dan kita harus bisa mengikutinya", optionC: "Tidak perlu adaptif", optionD: "Pekerjaan tidak akan berubah", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa dampak jika tidak memiliki kompetensi yang memadai?", optionA: "Bekerja dengan santai", optionB: "Kualitas layanan menurun dan penumpang tidak puas", optionC: "Tidak ada masalah", optionD: "Justru lebih baik", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },

    // APTITUDE Questions
    { stem: "Jika kereta harus tiba pukul 10:00 dan sekarang jam 09:45, masih berapa menit waktu yang tersisa?", optionA: "10 menit", optionB: "15 menit", optionC: "20 menit", optionD: "25 menit", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Dalam satu gerbong terdapat 48 kursi. Jika 3 gerbong penuh, berapa total kursi?", optionA: "120 kursi", optionB: "144 kursi", optionC: "140 kursi", optionD: "150 kursi", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Kereta menempuh jarak 120 km dalam 2 jam. Berapa kecepatan rata-rata?", optionA: "50 km/jam", optionB: "60 km/jam", optionC: "70 km/jam", optionD: "80 km/jam", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Urutan angka: 2, 4, 6, 8, ... apa angka berikutnya?", optionA: "9", optionB: "10", optionC: "11", optionD: "12", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Jika 3 kereta meninggalkan stasiun dengan间隔 15 menit, berapa menit antara kereta pertama dan keempat?", optionA: "30 menit", optionB: "45 menit", optionC: "60 menit", optionD: "15 menit", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "一枚车票 berharga Rp50.000. Jika beli 5枚, berapa total?", optionA: "Rp200.000", optionB: "Rp250.000", optionC: "Rp300.000", optionD: "Rp225.000", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Dalam kelompok 100 penumpang, 60% adalah dewasa. Berapa jumlah anak-anak?", optionA: "30 orang", optionB: "40 orang", optionC: "50 orang", optionD: "20 orang", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Urutan angka: 1, 3, 6, 10, ... apa angka berikutnya?", optionA: "14", optionB: "15", optionC: "16", optionD: "17", correctAnswer: "B", category: "APTITUDE", difficulty: "MEDIUM" },
    { stem: "Jika sebuah kereta berangkat pukul 08:00 dan tiba pukul 12:30, berapa lama perjalanan?", optionA: "4 jam", optionB: "4 jam 30 menit", optionC: "5 jam", optionD: "3 jam 30 menit", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Seorang pramugara menangani 6 gerbong. Jika setiap gerbong ada 50 penumpang, berapa total penumpang?", optionA: "300 orang", optionB: "350 orang", optionC: "400 orang", optionD: "250 orang", correctAnswer: "A", category: "APTITUDE", difficulty: "EASY" },
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
