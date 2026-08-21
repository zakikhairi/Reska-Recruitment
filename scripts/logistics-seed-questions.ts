// Seed questions for LOGISTICS division
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding questions for LOGISTICS division...");

  const division = "LOGISTICS";

  const questions = [
    // TECHNICAL Questions - Logistics
    { stem: "Apa fungsi utama sistem manajemen gudang?", optionA: "Tempat bermain", optionB: "Mengatur penerimaan, penyimpanan, dan pengeluaran barang", optionC: "Untuk pajangan", optionD: "Hiburan", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat barang datang tidak sesuai pesanan?", optionA: "Menerima begitu saja", optionB: "Mengecek quantity dan kualitas, lalu laporkan ketidaksesuaian", optionC: "Menolak semua barang", optionD: "Diam saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa penting mencatat setiap penerimaan barang?", optionA: "Buat ramai", optionB: "Untuk tracking dan memastikan akuntabilitas inventory", optionC: "Tidak penting", optionD: "Cuma formalitas", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan FIFO dalam pengelolaan barang?", optionA: "First In First Out - barang yang masuk duluan keluar duluan", optionB: "First In First Out - barang yang masuk duluan keluar terakhir", optionC: "Free In Free Out", optionD: "Fix In Fix Out", correctAnswer: "A", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara menghemat ruang penyimpanan di gudang?", optionA: "Menumpuk sembarangan", optionB: "Menggunakan sistem rak yang efisien dan mengatur barang dengan sistematis", optionC: "Membeli gudang baru", optionD: "Menambah gudang", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat ada barang rusak di gudang?", optionA: "Disembunyikan", optionB: "Mengecek, mendokumentasikan, dan melaporkan untuk klaim asuransi", optionC: "Dibuang diam-diam", optionD: "Dijual murah", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa barcode scanning penting dalam logistik?", optionA: "Tidak penting", optionB: "Untuk mempercepat proses dan mengurangi kesalahan manusia", optionC: "Hiburan saja", optionD: "Buat keren", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsi forklift di gudang?", optionA: "Alat makan", optionB: "Mengangkat dan memindahkan barang berat", optionC: "Alat musik", optionD: "Hiburan", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara memastikan barang dikirim ke tujuan yang benar?", optionA: "Ambil angka ajaib", optionB: "Double check alamat, gunakan label yang jelas, dan konfirmasi dengan penerima", optionC: "Serahin ke kurir saja", optionD: "Tidak perlu cek", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan tracking shipment?", optionA: "Menonton film", optionB: "Memantau lokasi dan status pengiriman barang secara real-time", optionC: "Menunggu di rumah", optionD: "Tidak ada artinya", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa safety gear penting saat bekerja di gudang?", optionA: "Tidak perlu", optionB: "Untuk melindungi diri dari cedera saat mengangkat barang berat", optionC: "Buat pajangan", optionD: "Hanya formalitas", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika menemukan barang mencurigakan?", optionA: "Membukanya", optionB: "Segera melapor ke security dan tidak menyentuhnya", optionC: "Membawanya pulang", optionD: "Mengabaikannya", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara mengelola barang expire date?", optionA: "Tidak usah peduli", optionB: "Pisahkan dan prioritaskan barang dengan expire date terdekat", optionC: "Campurkan saja", optionD: "Diamkan saja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan cross-docking?", optionA: "Menyeberangkan bebek", optionB: "Proses langsung mengirim barang dari inbound ke outbound tanpa penyimpanan", optionC: "Mendocking kapal", optionD: "Tidak tahu", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Mengapa dokumentasi pengiriman penting?", optionA: "Buat koleksi", optionB: "Sebagai bukti pengiriman dan untuk klaim jika terjadi kehilangan/kerusakan", optionC: "Hiburan", optionD: "Tidak penting", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat forklift mogok?", optionA: "Perbaiki sendiri asal", optionB: "Amankan area, melapor ke teknisi, gunakan alat bantu lain jika memungkinkan", optionC: "Diam saja", optionD: "Paksa dijalankan", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Bagaimana cara menangani perbedaan stock saat stock opname?", optionA: "Diam saja", optionB: "Investigasi perbedaan, cek catatan, dan temukan penyebabnya", optionC: "Rubah angka saja", optionD: "Salahkan orang lain", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa fungsiManifest dalam pengiriman?", optionA: "Undangan", optionB: "Daftar rincian barang yang dikirim beserta jumlahnya", optionC: "Nota pembayaran", optionD: "Surat cinta", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Mengapa perlu ada area loading/unloading yang terpisah?", optionA: "Buat bingung", optionB: "Untuk keamanan dan efisiensi proses bongkar muat barang", optionC: "Tidak perlu", optionD: "Hiburan", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan lead time dalam logistik?", optionA: "Waktu yang dibutuhkan dari pesanan sampai barang diterima", optionB: "Waktu istirahat", optionC: "Durasi meeting", optionD: "Waktu makan siang", correctAnswer: "A", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Bagaimana cara memaksimalkan penggunaan ruang gudang?", optionA: "Tumpuk tinggi saja", optionB: "Optimalkan dengan vertikal storage dan organize berdasarkan frekuensi pengambilan", optionC: "Biarkan kosong", optionD: "Simpan sembarangan", correctAnswer: "B", category: "TECHNICAL", difficulty: "MEDIUM" },
    { stem: "Apa fungsi digital inventory system?", optionA: "Hiburan", optionB: "Memudahkan tracking stock secara real-time dan mengurangi kesalahan manual", optionC: "Buat berat", optionD: "Menambah kerja", correctAnswer: "B", category: "TECHNICAL", difficulty: "EASY" },

    // HOSPITALITY Questions
    { stem: "Bagaimana sebaiknya memberikan informasi ke customer tentang status pengiriman?", optionA: "Diam saja", optionB: "Jelas, tepat waktu, dan jujur tentang status pengiriman", optionC: "Terlambat sekali没关系", optionD: "Bohong kalau terlambat", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan saat customer komplain barang terlambat?", optionA: "Marah balik", optionB: "Minta maaf, cek status, dan berikan solusi/kompensasi jika memungkinkan", optionC: "Salahkan kurir", optionD: "Diam saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Mengapa penting ramah dalam melayani customer?", optionA: "Tidak penting", optionB: "Membangun hubungan baik dan kepercayaan customer", optionC: "Tidak ada hubungan", optionD: "Hiburan saja", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Bagaimana menangani customer yang emosi karena barang rusak?", optionA: "Marah balik", optionB: "Dengarkan dengan empati, minta maaf, dan berikan solusi penggantian", optionC: "Diam saja", optionD: "Kerasukan", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },
    { stem: "Apa yang dilakukan jika barang yang dikirim salah?", optionA: "Dipertahankan saja", optionB: "Minta maaf, atur pengambilan dan pengiriman ulang yang benar", optionC: "Diam saja", optionD: "Jual murah", correctAnswer: "B", category: "HOSPITALITY", difficulty: "EASY" },

    // AKHLAK Questions
    { stem: "Apa arti budaya AKHLAK di KAI?", optionA: "Akhlak, Kerja, Iman", optionB: "Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif", optionC: "Akurat, Kuat, Hebat", optionD: "Anti Korupsi, Loyalitas Tinggi", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa kejujuran penting dalam logistik?", optionA: "Tidak penting", optionB: "Karena kesalahan pencatatan bisa menyebabkan kehilangan dan kerugian", optionC: "Hanya formalitas", optionD: "Tidak ada hubungan", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang harus dilakukan jika menemukan barang yang jatuh?", optionA: "Diabaikan", optionB: "Diangkat, dicek kondisinya, dan dikembalikan ke tempat yang benar", optionC: "Dibawa pulang", optionD: "Ditendang", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa keamanan barang adalah tanggung jawab semua orang?", optionA: "Tidak penting", optionB: "Agar barang tidak hilang atau rusak selama proses pengiriman", optionC: "Hiburan", optionD: "Buat ramai", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa arti 'Amanah' untuk pekerja logistik?", optionA: "Menyimpan rahasia", optionB: "Bertanggung jawab menjaga keamanan dan keutuhan barang", optionC: "Bebas mengambil", optionD: "Menyembunyikan barang", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Bagaimana menunjukkan kolaboratif dalam tim?", optionA: "Kerja sendiri saja", optionB: "Saling membantu dalam proses bongkar muat dan pengecekan barang", optionC: "Tolak semua bantuan", optionD: "Semangat kompetitor", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Apa yang dimaksud dengan integritas dalam pekerjaan?", optionA: "Bohong seperlunya", optionB: "Melakukan hal yang benar bahkan saat tidak ada yang mengawasi", optionC: "Menyontek pekerjaan", optionD: "Ikut-ikut saja", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },
    { stem: "Mengapa disiplin penting dalam logistik?", optionA: "Tidak penting", optionB: "Untuk memastikan setiap barang tercatat dan terkirim dengan benar", optionC: "Hiburan", optionD: "Semangat kompetitor", correctAnswer: "B", category: "AKHLAK", difficulty: "EASY" },

    // APTITUDE Questions
    { stem: "Jika ada 100 barang dan harus dibagi ke 4 truk sama rata, berapa per truk?", optionA: "20", optionB: "25", optionC: "30", optionD: "15", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Pengiriman memakan waktu 3 hari. Jika berangkat hari Senin, kapan sampai?", optionA: "Hari Kamis", optionB: "Hari Jumat", optionC: "Hari Sabtu", optionD: "Hari Minggu", correctAnswer: "A", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Berat paket 2.5 kg. Ongkir per kg adalah Rp10.000. Berapa total ongkir?", optionA: "Rp20.000", optionB: "Rp25.000", optionC: "Rp30.000", optionD: "Rp15.000", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Gudang площадь 500 m2. Sudah terpakai 350 m2. Berapa % kosong?", optionA: "15%", optionB: "30%", optionC: "25%", optionD: "20%", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Satpam kerja 8 jam shift. Jika shift 1 dimulai 06:00, jam berapa shift 3 berakhir?", optionA: "22:00", optionB: "21:00", optionC: "20:00", optionD: "23:00", correctAnswer: "A", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Jika 需要卸载 150 картонок за 5 часов, berapa картонок в час?", optionA: "30", optionB: "25", optionC: "35", optionD: "20", correctAnswer: "A", category: "APTITUDE", difficulty: "EASY" },
    { stem: "Berat maksimal kontainer 20 ton. Sekarang ada 15.8 ton. Berapa sisa kapasitas?", optionA: "3.2 ton", optionB: "4.2 ton", optionC: "5 ton", optionD: "2.5 ton", correctAnswer: "B", category: "APTITUDE", difficulty: "EASY" },
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
