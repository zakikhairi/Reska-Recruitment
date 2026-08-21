import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  // ============ AKHLAK (20 SOAL) ============
  { category: "AKHLAK", difficulty: "EASY", stem: "Apa singkatan dari nilai-nilai AKHLAK yang menjadi budaya perusahaan BUMN?", optionA: "Amanah, Kompeten, Harmonis, Loyal, Akhir", optionB: "Amanah, Kompeten, Harmonis, Loyal, Akhlak", optionC: "Amanah, Kuat, Harmonis, Loyal, Akhlak", optionD: "Amanah, Kreatif, Harmonis, Loyal, Akhlak", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "EASY", stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" merupakan definisi dari nilai...", optionA: "Kompeten", optionB: "Harmonis", optionC: "Amanah", optionD: "Loyal", correctAnswer: "C" },
  { category: "AKHLAK", difficulty: "EASY", stem: "Nilai AKHLAK yang berarti kemampuan untuk terus belajar dan mengembangkan diri disebut...", optionA: "Amanah", optionB: "Kompeten", optionC: "Harmonis", optionD: "Adaptif", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "EASY", stem: "\"Saling peduli dan menghargai sesama\" merupakan implementasi dari nilai...", optionA: "Harmonis", optionB: "Loyal", optionC: "Amanah", optionD: "Kolaboratif", correctAnswer: "A" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "\"Menjadi contoh dan inspirator bagi orang lain dalam menerapkan nilai-nilai perusahaan\" adalah definisi dari...", optionA: "Kompeten", optionB: "Amanah", optionC: "Leader", optionD: "Teladan", correctAnswer: "D" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "Perilaku yang menunjukkan nilai \"Loyal\" di lingkungan kerja adalah...", optionA: "Menyimpan rahasia perusahaan", optionB: "Mendukung keputusan perusahaan", optionC: "Bekerja lembur tanpa diminta", optionD: "Menghindari kesalahan", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "\"Menghargai perbedaan pendapat dan siap menerima kritik konstruktif\" merupakan penerapan nilai...", optionA: "Harmonis", optionB: "Adaptif", optionC: "Akhlak", optionD: "Kompeten", correctAnswer: "A" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "Nilai \"Amanah\" dalam konteks pelayanan publik berarti...", optionA: "Melayani dengan cepat", optionB: "Menjaga kepercayaan yang diberikan", optionC: "Bekerja sesuai SOP", optionD: "Tidak menerima suap", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "\"Mengembangkan kompetensi diri melalui pelatihan dan sertifikasi\" adalah bentuk penerapan nilai...", optionA: "Loyal", optionB: "Kompeten", optionC: "Harmonis", optionD: "Amanah", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "Berikut yang merupakan contoh perilaku \"Kompeten\" adalah...", optionA: "Rajin berdoa sebelum bekerja", optionB: "Mengikuti pelatihan teknis", optionC: "Menjaga hubungan baik dengan kolega", optionD: "Menyelesaikan tugas tepat waktu", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "HARD", stem: "Dalam situasi konflik kepentingan, penerapan nilai AKHLAK yang paling tepat adalah...", optionA: "Memilih keputusan yang menguntungkan diri sendiri", optionB: "Melakukan negosiasi untuk mencari titik tengah", optionC: "Mendahulukan kepentingan pribadi", optionD: "Menghindari keputusan sulit", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "HARD", stem: "\"Professionalitas dan integritas\" merupakan inti dari nilai...", optionA: "Loyal", optionB: "Amanah", optionC: "Kompeten", optionD: "Harmonis", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "HARD", stem: "Ketika atasan memberikan instruksi yang bertentangan dengan prosedur, penerapan nilai AKHLAK yang benar adalah...", optionA: "Melaksanakan tanpa bertanya", optionB: "Mengklarifikasi dengan sopan", optionC: "Menolak指令", optionD: "Melaporkan ke pihak lain", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "HARD", stem: "Integritas dalam nilai AKHLAK mencakup aspek...", optionA: "Kecerdasan emosional", optionB: "Konsistensi antara ucapan dan tindakan", optionC: "Kecepatan kerja", optionD: "Jumlah tugas yang diselesaikan", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "EASY", stem: "\"Pantang menyerah dalam menyelesaikan tugas\" merupakan ciri nilai...", optionA: "Amanah", optionB: "Kompeten", optionC: "Loyal", optionD: "Adaptif", correctAnswer: "C" },
  { category: "AKHLAK", difficulty: "EASY", stem: "Nilai \"Harmonis\" mendorong karyawan untuk...", optionA: "Bekerja sendiri", optionB: "Membangun hubungan baik", optionC: "Menghindari komunikasi", optionD: "Fokus pada target pribadi", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "\"Mengakui dan menghargai kontribusi tim\" adalah bentuk penerapan nilai...", optionA: "Kolaboratif", optionB: "Kompeten", optionC: "Amanah", optionD: "Loyal", correctAnswer: "A" },
  { category: "AKHLAK", difficulty: "HARD", stem: "Seorang pemimpin yang menerapkan nilai AKHLAK harus mampu...", optionA: "Mengambil keputusan sepihak", optionB: "Melakukan supervisi ketat", optionC: "Menjadi teladan dalam berperilaku", optionD: "Memaksakan kehendak", correctAnswer: "C" },
  { category: "AKHLAK", difficulty: "MEDIUM", stem: "\"Melakukan perbaikan terus-menerus\" merupakan perwujudan dari nilai...", optionA: "Stabil", optionB: "Kompeten", optionC: "Amanah", optionD: "Loyal", correctAnswer: "B" },
  { category: "AKHLAK", difficulty: "EASY", stem: "\"Tegas dan adil\" dalam mengambil keputusan merupakan bagian dari nilai...", optionA: "Amanah", optionB: "Kompeten", optionC: "Harmonis", optionD: "Adaptif", correctAnswer: "A" },

  // ============ HOSPITALITY (20 SOAL) ============
  { category: "HOSPITALITY", difficulty: "EASY", stem: "\"Service excellence\" dalam konteks layanan kereta api berarti...", optionA: "Layanan standar sesuai prosedur", optionB: "Layanan terbaik yang melebihi ekspektasi pelanggan", optionC: "Layanan tercepat yang tersedia", optionD: "Layanan termurah yang bisa diberikan", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "EASY", stem: "Langkah pertama saat menangani penumpang yang mengeluh adalah...", optionA: "Mengabaikan keluhannya", optionB: "Mendengarkan dengan penuh perhatian", optionC: "Menyalahkan penumpang lain", optionD: "Langsung memberikan solusi", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "EASY", stem: "Senyum yang tulus kepada penumpang termasuk dalam...", optionA: "Keterampilan teknis", optionB: "Etika pelayanan", optionC: "Prosedur keselamatan", optionD: "Pengetahuan produk", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "EASY", stem: "\"Melayani dengan penuh kesabaran\" merupakan prinsip dasar dalam...", optionA: "Manajemen waktu", optionB: "Hospitality", optionC: "Teknis kereta api", optionD: "Keamanan", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "Seorang pramugara/pramugari kereta api harus memiliki kemampuan untuk menangani penumpang dengan berbagai tingkah laku. Ini termasuk dalam aspek...", optionA: "Keterampilan teknis", optionB: "Manajemen konflik", optionC: "Keterampilan komunikasi", optionD: "Kepemimpinan", correctAnswer: "C" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "\"Intonasi suara yang ramah\" saat berbicara dengan penumpang merupakan aspek...", optionA: "Komunikasi verbal", optionB: "Komunikasi non-verbal", optionC: "Bahasa tubuh", optionD: "Etika digital", correctAnswer: "A" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "Jika penumpang bertanya tentang rute perjalanan yang tidak Anda ketahui, yang harus dilakukan adalah...", optionA: "Menyatakan tidak tahu dan mengabaikan", optionB: "Mengarahkan ke petugas yang tepat", optionC: "Memberikan informasi asal-asalan", optionD: "Meminta penumpang mencari sendiri", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "\"Empati dalam melayani\" berarti...", optionA: "Merasa kasihan terhadap penumpang", optionB: "Memahami kebutuhan penumpang", optionC: "Menyayangi semua penumpang", optionD: "Menghibur penumpang sedih", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "Penampilan yang rapi dan profesional saat bertugas menunjukkan...", optionA: "Kepribadian diri", optionB: "Dedikasi terhadap perusahaan", optionC: "Keahlian teknis", optionD: "Semua jawaban benar", correctAnswer: "D" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "\"Proaktif dalam membantu\" artinya...", optionA: "Menunggu instruksi dari penumpang", optionB: "Menawarkan bantuan sebelum diminta", optionC: "Melihat masalah tanpa bertindak", optionD: "Bekerja sesuai jam kerja saja", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "HARD", stem: "Dalam menangani penumpang dari berbagai budaya, sikap yang paling tepat adalah...", optionA: "Mengabaikan perbedaan budaya", optionB: "Menyesuaikan gaya pelayanan", optionC: "Meminta penumpang beradaptasi", optionD: "Melayani sama semua tanpa perubahan", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "HARD", stem: "\"Handling complaint\" yang efektif meliputi langkah...", optionA: "Dengar, maafkan, lupakan", optionB: "Dengar, empati, selesaikan, follow-up", optionC: "Maaf, maaf, maaf", optionD: "Jelaskan, defend,说服", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "HARD", stem: "Ketika menghadapi penumpang yang marah dan emosi, prioritas pertama adalah...", optionA: "Memberikan solusi segera", optionB: "Menenangkan emosi penumpang", optionC: "Menyalahkan pihak lain", optionD: "Meminta maaf berkali-kali", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "HARD", stem: "\"Service recovery\" yang baik ketika terjadi kesalahan layanan adalah...", optionA: "Menyalahkan karyawan", optionB: "Mengakui kesalahan dan memberikan kompensasi", optionC: "Menyembunyikan masalah", optionD: "Menunda penanganan", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "EASY", stem: "\"Memanggil penumpang dengan sopan\" termasuk dalam kategori...", optionA: "Prosedur keselamatan", optionB: "Etika komunikasi", optionC: "Tugas teknis", optionD: "Administrasi", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "EASY", stem: "Memberikan informasi yang jelas dan akurat kepada penumpang adalah bagian dari...", optionA: "Tanggung jawab sosial", optionB: "Pelayanan prima", optionC: "Keamanan kerja", optionD: "Administrasi", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "\"Body language\" yang tepat saat melayani penumpang meliputi...", optionA: "Berdiri tegak dengan tangan disilangkan", optionB: "Menghadap penumpang dengan Postur terbuka", optionC: "Menunduk saat berbicara", optionD: "Menatap tajam penumpang", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "HARD", stem: "Untuk penumpang berkebutuhan khusus, pelayanan yang optimal mencakup...", optionA: "Perlakuan berbeda yang diskriminatif", optionB: "Assistensi khusus sesuai kebutuhan", optionC: "Mengabaikan kebutuhan khusus", optionD: "Melayani tanpa bantuan", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "MEDIUM", stem: "\"First impression\" penumpang terhadap layanan kereta api sangat dipengaruhi oleh...", optionA: "Warna seragam", optionB: "Sikap dan penampilan saat menyapa", optionC: "Jumlah karyawan", optionD: "Fasilitas stasiun", correctAnswer: "B" },
  { category: "HOSPITALITY", difficulty: "EASY", stem: "\"Menyambut penumpang dengan salam\" merupakan contoh...", optionA: "Prosedur keselamatan", optionB: "Budaya perusahaan", optionC: "Tata ruang", optionD: "Sistem informasi", correctAnswer: "B" },

  // ============ TECHNICAL (20 SOAL) ============
  { category: "TECHNICAL", difficulty: "EASY", stem: "AC pada kereta api singkatan dari...", optionA: "Air Conditioner", optionB: "Automatic Control", optionC: "Alternating Current", optionD: "Air Compressor", correctAnswer: "A" },
  { category: "TECHNICAL", difficulty: "EASY", stem: "Komponen utama yang menghubungkan antar gerbong kereta api disebut...", optionA: "Trunion", optionB: "Coupler", optionC: "Bogie", optionD: "Buffer", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "EASY", stem: "\"KRL\" adalah singkatan dari...", optionA: "Kereta Rail Listrik", optionB: "Kereta Rel Listrik", optionC: "Kereta Cepat Lokal", optionD: "Kereta Commuter Line", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "EASY", stem: "Sistem persinyalan kereta api berfungsi untuk...", optionA: "Mendinginkan kereta", optionB: "Mengatur lalu lintas kereta", optionC: "Membersihkan rel", optionD: "Menghitung penumpang", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "Sistem rem darurat pada kereta api bekerja berdasarkan prinsip...", optionA: "Tekanan hidrolik", optionB: "Tekanan udara comprimida", optionC: "Pegas mekanik", optionD: "Elektromagnetik", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "\"Bogie\" pada kereta api berfungsi sebagai...", optionA: "Penghubung gerbong", optionB: "Penerangan", optionC: "Roda dan suspensi", optionD: "Pendingin ruangan", correctAnswer: "C" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "Sistem \"Pantograph\" pada kereta listrik berfungsi untuk...", optionA: "Mengangkat penumpang", optionB: "Mengambil daya dari overhead wire", optionC: "Menghentikan kereta", optionD: "Membuka pintu", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "\"ATC\" (Automatic Train Control) berfungsi untuk...", optionA: "Otomatisasi pembersihan", optionB: "Mengontrol kecepatan dan keamanan kereta", optionC: "Mengatur tiket", optionD: "Memantau cuaca", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "Rel kereta api terbuat dari bahan...", optionA: "Aluminium", optionB: "Baja", optionC: "Tembaga", optionD: "Plastik", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "\"Gording\" pada struktur kereta api berfungsi untuk...", optionA: "Dekorasi", optionB: "Memperkuat rangka atap", optionC: "Tempat duduk", optionD: "Pendingin", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "HARD", stem: "\"Coupler\" jenis \"Janney\" digunakan untuk...", optionA: "Mengunci pintu", optionB: "Menghubungkan gerbong secara otomatis", optionC: "Mengatur kecepatan", optionD: "Mengukur beban", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "HARD", stem: "Sistem \"Regenerative braking\" pada kereta modern berfungsi untuk...", optionA: "Meningkatkan kecepatan", optionB: "Mengembalikan energi ke sistem", optionC: "Mengurangi kenyamanan", optionD: "Menambah berat", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "HARD", stem: "\"Wheel profile\" yang aus dapat menyebabkan...", optionA: "Peningkatan kenyamanan", optionB: "Getaran dan ketidakstabilan", optionC: "Penghematan energi", optionD: "Peningkatan kecepatan", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "HARD", stem: "Sistem \"DOORS\" pada KRL berfungsi untuk...", optionA: "Pendingin ruangan", optionB: "Membuka dan menutup pintu otomatis", optionC: "Mengatur pencahayaan", optionD: "Memutar balik kereta", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "EASY", stem: "\"LRT\" adalah singkatan dari...", optionA: "Light Railway Transit", optionB: "Long Rail Train", optionC: "Local Rapid Transit", optionD: "Light Rapid Train", correctAnswer: "A" },
  { category: "TECHNICAL", difficulty: "EASY", stem: "Fungsi utama rem pada kereta api adalah...", optionA: "Mempercepat kereta", optionB: "Menghentikan atau memperlambat kereta", optionC: "Mendinginkan mesin", optionD: "Menghias kereta", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "\"Otomatis\" dalam sistem kereta modern berarti...", optionA: "Tanpa operator", optionB: "Tanpa pemeliharaan", optionC: "Tanpa biaya", optionD: "Tanpa jadwal", correctAnswer: "A" },
  { category: "TECHNICAL", difficulty: "HARD", stem: "\"Track circuit\" dalam sistem persinyalan berfungsi untuk...", optionA: "Mengukur suhu rel", optionB: "Mendeteksi keberadaan kereta", optionC: "Membersihkan rel", optionD: "Mengukur kecepatan angin", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "MEDIUM", stem: "\"Tinggi platform\" stasiun disesuaikan dengan...", optionA: "Warna kereta", optionB: "Ketinggian lantai kereta", optionC: "Jumlah penumpang", optionD: "Harga tiket", correctAnswer: "B" },
  { category: "TECHNICAL", difficulty: "EASY", stem: "\"MW\" pada spesifikasi teknis kereta adalah singkatan dari...", optionA: "Mega Watt", optionB: "Mega Wheel", optionC: "Medium Weight", optionD: "Main Width", correctAnswer: "A" },

  // ============ APTITUDE (20 SOAL) ============
  { category: "APTITUDE", difficulty: "HARD", stem: "Jika semua X adalah Y, dan beberapa Y adalah Z, maka...", optionA: "Semua X adalah Z", optionB: "Beberapa X adalah Z", optionC: "Tidak ada X yang adalah Z", optionD: "Tidak dapat ditentukan", correctAnswer: "D" },
  { category: "APTITUDE", difficulty: "HARD", stem: "Deret angka: 2, 6, 12, 20, 30, ... Bilangan selanjutnya adalah?", optionA: "40", optionB: "42", optionC: "44", optionD: "46", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "HARD", stem: "Jika A = 1, B = 2, C = 3, ..., Z = 26, maka nilai dari KAI adalah...", optionA: "11 + 1 + 9", optionB: "11 + 1 + 9 = 21", optionC: "20 + 1 + 9 = 30", optionD: "10 + 1 + 9 = 20", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "Deret huruf: A, C, E, G, I, ... Huruf selanjutnya adalah...", optionA: "J", optionB: "K", optionC: "L", optionD: "M", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "Jika 8 + 2 = 16106, maka 5 + 4 = ...", optionA: "91", optionB: "92", optionC: "95", optionD: "97", correctAnswer: "A" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "Ada 6 orang dalam ruangan. Setiap orang berjabat tangan dengan setiap orang lainnya. Berapa total jabat tangan?", optionA: "12", optionB: "15", optionC: "18", optionD: "21", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "HARD", stem: "Pak Budi bekerja dari Senin hingga Jumat. Setiap hari ia menabung Rp10.000. Di Sabtu dan Minggu ia menghabiskan Rp15.000/hari. Berapa tabungan bersih Pak Budi dalam 4 minggu?", optionA: "Rp40.000", optionB: "Rp80.000", optionC: "Rp100.000", optionD: "Rp120.000", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "1, 4, 9, 16, 25, ... Barisan ini mengikuti pola...", optionA: "Ditambah 3", optionB: "Ditambah bilangan genap", optionC: "Kuadrat bilangan asli", optionD: "Ditambah 5", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "EASY", stem: "Sebuah jam terlambat 5 menit setiap jam. Setelah 12 jam, berapa menit jam tersebut terlambat?", optionA: "50 menit", optionB: "55 menit", optionC: "60 menit", optionD: "65 menit", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "EASY", stem: "Jika 3x + 5 = 20, maka nilai x adalah...", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "HARD", stem: "Tiga mesin dapat memproduksi 90 unit dalam 6 jam. Berapa unit yang diproduksi 5 mesin dalam 8 jam?", optionA: "180", optionB: "200", optionC: "220", optionD: "240", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "Perbandingan pria dan wanita di sebuah kantor adalah 3:4. Jika totalnya 35 orang, berapa jumlah wanita?", optionA: "15", optionB: "20", optionC: "25", optionD: "30", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "75% dari 80 adalah...", optionA: "55", optionB: "60", optionC: "65", optionD: "70", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "HARD", stem: "Seekor kucing mengejar tikus. Tikus berlari 20 langkah lebih dulu. Setiap 5 langkah kucing sama dengan 7 langkah tikus. Kucing menyusul setelah langkah ke berapa?", optionA: "50", optionB: "60", optionC: "70", optionD: "80", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "EASY", stem: "Bilangan bulat positif terkecil yang habis dibagi 3, 4, dan 5 adalah...", optionA: "30", optionB: "45", optionC: "60", optionD: "90", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "EASY", stem: "Deret: 2, 4, 8, 16, ... Nilai berikutnya adalah...", optionA: "24", optionB: "28", optionC: "32", optionD: "36", correctAnswer: "C" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "Rina lebih tua dari Siti. Siti lebih tua dari Ani. Ani lebih tua dari Rina. Jika pernyataan ketiga salah, maka...", optionA: "Ani paling tua", optionB: "Rina paling muda", optionC: "Siti paling muda", optionD: "Rina paling tua", correctAnswer: "D" },
  { category: "APTITUDE", difficulty: "HARD", stem: "Berapa lama waktu yang dibutuhkan untuk mengisi kolam jika keran A mengisi dalam 4 jam, keran B dalam 6 jam, dan pembuangan mengosongkan dalam 8 jam?", optionA: "2 jam 24 menit", optionB: "3 jam 12 menit", optionC: "4 jam", optionD: "5 jam", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "MEDIUM", stem: "Sebuah裙子 harganya turun 20%, lalu naik 20% dari harga baru. Harga akhir dibandingkan harga awal...", optionA: "Sama", optionB: "Lebih rendah 4%", optionC: "Lebih tinggi 4%", optionD: "Lebih rendah 20%", correctAnswer: "B" },
  { category: "APTITUDE", difficulty: "EASY", stem: "Jika semua roses adalah flowers, dan semua flowers are beautiful, maka...", optionA: "Semua roses tidak indah", optionB: "Semua roses indah", optionC: "Tidak ada roses yang indah", optionD: "Tidak dapat ditentukan", correctAnswer: "B" },

  // ============ FACILITY (20 SOAL) ============
  { category: "FACILITY", difficulty: "EASY", stem: "Fungsi utama fasilitas stasiun kereta api adalah...", optionA: "Tempat makan", optionB: "Tempat menunggu dan naik kereta", optionC: "Tempat parkir", optionD: "Tempat belanja", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "EASY", stem: "\"Warning board\" di stasiun berfungsi untuk...", optionA: "Hiasan", optionB: "Memberikan informasi peringatan", optionC: "Tempat iklan", optionD: "Dekorasi", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "EASY", stem: "Fasilitas \"accessibility\" untuk penyandang disabilitas di stasiun meliputi...", optionA: "Tangga saja", optionB: "Lift dan jalur khusus", optionC: "Toilet khusus", optionD: "Ruang khusus", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "EASY", stem: "\"Information board\" di stasiun menampilkan...", optionA: "Iklan produk", optionB: "Jadwal dan informasi kereta", optionC: "Peta kota", optionD: "Berita", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "Sistem \"SCADA\" pada fasilitas kereta api berfungsi untuk...", optionA: "Pembersihan otomatis", optionB: "Monitoring dan kontrol jarak jauh", optionC: "Pengaturan tiket", optionD: "Pencahayaan", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "\"Platform screen door\" berfungsi untuk...", optionA: "Mencegah masuknya hewan", optionB: "Keamanan dan efisiensi energi", optionC: "Tempat duduk tambahan", optionD: "Tempat sholat", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "Fasilitas \"CCTV\" di stasiun berfungsi untuk...", optionA: "Menonton film", optionB: "Keamanan dan pemantauan", optionC: "Iklan digital", optionD: " Hiburan", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "\"PMS\" (Passenger Management System) mengelola...", optionA: "Pemeliharaan mesin", optionB: "Informasi dan komunikasi penumpang", optionC: "Pencatatan keuangan", optionD: "Pengelolaan karyawan", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "Sistem \"PIDS\" (Passenger Information Display System) menampilkan...", optionA: "Hanya jam", optionB: "Informasi jadwal dan kedatangan kereta", optionC: "Hanya berita", optionD: "Hanya cuaca", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "\"Ticketing system\" yang modern menggunakan...", optionA: "Karcis kertas", optionB: "Tiket elektronik dan contactless", optionC: "Telepon", optionD: "Surat", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "HARD", stem: "\"Building Management System\" mengintegrasikan...", optionA: "Hanya pencahayaan", optionB: "HVAC, listrik, keamanan, dan lainnya", optionC: "Hanya pendingin ruangan", optionD: "Hanya lift", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "HARD", stem: "\"Fire alarm system\" pada fasilitas kereta harus...", optionA: "Hanya berbunyi", optionB: "Mendeteksi, memberi tanda, dan terintegrasi dengan pemadaman", optionC: "Hanya menyala", optionD: "Dapat dimatikan manual saja", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "HARD", stem: "\"Energy management system\" bertujuan untuk...", optionA: "Memboroskan energi", optionB: "Mengoptimalkan penggunaan energi", optionC: "Mematikan semua sistem", optionD: "Menambah konsumsi", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "HARD", stem: "\"Vertical transportation\" di stasiun meliputi...", optionA: "Kereta api", optionB: "Lift, eskalator, dan elevator", optionC: "Bus", optionD: "Sepeda", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "EASY", stem: "\"Waiting room\" di stasiun sebaiknya dilengkapi dengan...", optionA: "AC, kursi nyaman, dan informasi", optionB: "Hanya tempat duduk", optionC: "Hanya AC", optionD: "Hanya tv", correctAnswer: "A" },
  { category: "FACILITY", difficulty: "EASY", stem: "Fasilitas \"toilet\" di stasiun harus...", optionA: "Tidak perlu ada", optionB: "Bersih dan berfungsi baik", optionC: "Bebas biaya", optionD: "Berbayar mahal", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "\"Crowd management\" di stasiun melibatkan...", optionA: "Hanya satu pintu", optionB: "Penyesuaian kapasitas dan aliran penumpang", optionC: "Penutupan stasiun", optionD: "Pengurangan karyawan", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "HARD", stem: "\"Predictive maintenance\" menggunakan...", optionA: "Perbaikan setelah rusak", optionB: "Data dan sensor untuk merawat sebelum rusak", optionC: "Pengabaian sistem", optionD: "Penggantian rutin", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "MEDIUM", stem: "\"WiFi\" di stasiun termasuk dalam kategori...", optionA: "Keamanan", optionB: "Fasilitas pendukung kenyamanan", optionC: "Persinyalan", optionD: "Propulsi", correctAnswer: "B" },
  { category: "FACILITY", difficulty: "EASY", stem: "\"Signage\" di stasiun berfungsi untuk...", optionA: "Hiasan", optionB: "Mengarahkan penumpang", optionC: "Pemasangan iklan", optionD: "Dekorasi", correctAnswer: "B" },
];

async function main() {
  console.log("Starting to seed questions...");

  // Delete existing questions
  await prisma.question.deleteMany({});
  console.log("Deleted existing questions");

  // Create new questions
  const createdQuestions = [];
  for (const q of questions) {
    const question = await prisma.question.create({
      data: {
        stem: q.stem,
        category: q.category,
        jobDivision: null,
        difficulty: q.difficulty,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: null,
        points: 1,
        isActive: true,
      },
    });
    createdQuestions.push(question);
  }

  console.log(`Successfully created ${createdQuestions.length} questions`);

  // Show count by category
  const counts = await prisma.question.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  console.log("\nQuestions by category:");
  for (const c of counts) {
    console.log(`  ${c.category}: ${c._count.id} questions`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
