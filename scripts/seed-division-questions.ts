import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const divisionQuestions = [
  // ============ ON_TRAIN_SERVICE (20 SOAL) ============
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "Seorang pramugara/pramugari kereta api harus menyambut penumpang dengan...", optionA: "Senyum dan salam", optionB: "Bisu dan diam", optionC: "Marah dan kesal", optionD: "Bantal dan selimut", correctAnswer: "A" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "\"Safety briefing\" di kereta api harus mencakup...", optionA: "Iklan produk", optionB: "Cara memesan makanan", optionC: "Prosedur darurat dan keselamatan", optionD: "Sejarah kereta api", correctAnswer: "C" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "Saat kereta akan bergerak, pramugara harus...", optionA: "Duduk santai", optionB: "Berdiri di dekat pintu", optionC: "Makan makanan", optionD: "Main HP", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "Jika terjadi keadaan darurat di kereta, prioritas utama pramugara adalah...", optionA: "Memfoto kejadian", optionB: "Menenangkan penumpang dan evacuate", optionC: "Mengambil barang penumpang", optionD: "Menelepon keluarga", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "\"Seat arrangement\" yang baik memastikan...", optionA: "Semua berdiri", optionB: "Penumpang duduk dengan nyaman", optionC: "Penumpang berdesakan", optionD: "Kereta kosong", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "Pramugara harus menangani penumpang yang mabuk perjalanan dengan...", optionA: "Mengabaikan", optionB: "Menyediakan kantung plastik dan bantuan", optionC: "Menyuruh turun", optionD: "Menertawakan", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "\"Selling on board\" kereta melibatkan...", optionA: "Memaksa penumpang beli", optionB: "Menawarkan dengan sopan produk onboard", optionC: "Mencuri uang", optionD: "Menjual obat tidur", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "Jika ada penumpang yang sakit di kereta, pramugara harus...", optionA: "Teriak minta tolong", optionB: "Hubungi stasiun terdekat dan berikan bantuan", optionC: "Lari kabur", optionD: "Beri minum alkohol", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "\"Cleanliness during journey\" harus...", optionA: "Diabaikan", optionB: "Dijaga selama perjalanan", optionC: "Dilakukan setelah kereta rusak", optionD: "Dilakukan sekali sehari", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "HARD", stem: "Penumpang internasional memerlukan penanganan khusus meliputi...", optionA: "Diskriminasi", optionB: "Komunikasi multibahasa dan budaya", optionC: "Penjara khusus", optionD: "Ditolak masuk", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "HARD", stem: "\"Service recovery\" saat lift tidak berfungsi di stasiun besar adalah...", optionA: "Biarkan saja", optionB: "ediakan alternatif dan informasikan", optionC: "Tutup stasiun", optionD: "Salahkan penumpang", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "HARD", stem: "Jika terjadi konflik antar penumpang, pramugara harus...", optionA: "Ikut berkelahi", optionB: "Mediasi dan pisahkan pihak", optionC: "Tonton saja", optionD: "Rekam untuk viral", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "HARD", stem: "\"Crowd control\" di kereta penuh melibatkan...", optionA: "Mendorong penumpang masuk paksa", optionB: "Pengaturan aliran dan komunikasi", optionC: "Menutup pintu permanen", optionD: "Menolak semua penumpang", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "\"Uniform\" pramugara harus...", optionA: "Kotor dan robek", optionB: "Rapi dan bersih", optionC: "Bawaan sendiri", optionD: "Tidak pakai uniform", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "Jam kerja pramugara kereta biasanya...", optionA: "Tidak teratur", optionB: "Mengikuti jadwal perjalanan kereta", optionC: "Hanya sekali seminggu", optionD: "Tidak ada jam kerja", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "\"First aid\" kit di kereta harus...", optionA: "Kosong", optionB: "Lengkap dan siap pakai", optionC: "Dikunci permanent", optionD: "Habis gunakan sendiri", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "Pramugara harus membantu penumpang...", optionA: "Bawa barang bawaan", optionB: "Naik dan turun kereta", optionC: "Masak di kereta", optionD: "Mandi di kereta", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "MEDIUM", stem: "\"Lost and found\" handling yang baik berarti...", optionA: "Diambil sendiri", optionB: "Dokumentasi dan pengembalian", optionC: "Dibuang", optionD: "Dijual", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "HARD", stem: "\"Passenger flow analysis\" membantu untuk...", optionA: "Meningkatkan kemacetan", optionB: "Mengoptimalkan pelayanan", optionC: "Mengurangi keamanan", optionD: "Menambah biaya", correctAnswer: "B" },
  { category: "HOSPITALITY", jobDivision: "ON_TRAIN_SERVICE", difficulty: "EASY", stem: "Komunikasi dengan penumpang menggunakan...", optionA: "Teriakan", optionB: "Bahasa yang sopan dan jelas", optionC: "Kode rahasia", optionD: "Bahasa kasar", correctAnswer: "B" },

  // ============ LOGISTICS (20 SOAL) ============
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "\"Loading\" barang di kereta api harus...", optionA: " Sembarangan", optionB: "Rapi dan sesuai prosedur", optionC: "Ditumpuk tinggi", optionD: "Dilempar", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "\"Manifest\" pengiriman barang berisi...", optionA: "Resep makanan", optionB: "Detail barang dan tujuan", optionC: "Cerita lucu", optionD: "Lagu", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "\"Cargo\" kereta api cocok untuk mengangkut...", optionA: "Hewan hidup", optionB: "Barang curian", optionC: "Barang dalam jumlah besar", optionD: "Orang utan", correctAnswer: "C" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Weight limit\" muatan kereta harus...", optionA: "Diabaikan", optionB: "Dihormati untuk keselamatan", optionC: "Dilampaui möglich", optionD: "Ditambah terus", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Forklift\" digunakan untuk...", optionA: "Membersihkan", optionB: "Memindahkan barang berat", optionC: "Menggambar", optionD: "Memancing", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Labeling\" barang yang benar harus mencakup...", optionA: "Goresan", optionB: "Informasi jelas tujuan dan pengirim", optionC: "Gambar mainan", optionD: "Kotak kosong", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Warehouse\" berfungsi sebagai...", optionA: "Tempat hiburan", optionB: "Gudang penyimpanan sementara", optionC: "Rumah sakit", optionD: "Sekolah", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Security\" barang di logistik railway adalah...", optionA: "Tidak penting", optionB: "Prioritas utama", optionC: "Opsional", optionD: "Boleh dilewati", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "HARD", stem: "\"Tracking system\" barang kereta api menggunakan...", optionA: "Merpati", optionB: "GPS dan barcode", optionC: "Kuda", optionD: "Semang", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "HARD", stem: "\"Dangerous goods\" (barang berbahaya) di kereta harus...", optionA: "Campur dengan makanan", optionB: "Dipisahkan dan diberi tanda khusus", optionC: "Dihilangkan", optionD: "Ditutup mata", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "HARD", stem: "\"Supply chain\" kereta api mengintegrasikan...", optionA: "Hanya stasiun", optionB: " متعددة pihak dari awal ke akhir", optionC: "Hanya gudang", optionD: "Satu orang saja", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "HARD", stem: "\"Cross-docking\" dalam logistik railway berarti...", optionA: "Menyimpan selamanya", optionB: "Transfer langsung tanpa penyimpanan", optionC: "Membuang barang", optionD: "Menjual langsung", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "\"Container\" kereta api digunakan untuk...", optionA: "Bermain", optionB: "Mengangkut barang", optionC: "Tidur", optionD: "Makan", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "Petugas logistics harus memastikan barang...", optionA: "Hilangnya", optionB: "Tiba dengan selamat", optionC: "Dijual", optionD: "Dibuang", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Custom clearance\" untuk barang impor via kereta adalah...", optionA: "Dilewati saja", optionB: "Prosedur resmi bea cukai", optionC: "Tidak ada", optionD: "Optional", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "\"Dispatch\" kereta barang berarti...", optionA: "Menghapus", optionB: "Mengirim kereta", optionC: "Menutup", optionD: "Mematikan", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Inventory management\" yang baik memastikan...", optionA: "Barang menumpuk", optionB: "Stok terkontrol dan efisien", optionC: "Rugi", optionD: "Bangkrut", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "HARD", stem: "\"Multimodal transport\" menggunakan...", optionA: "Satu moda saja", optionB: "Kombinasi kereta, kapal, pesawat, dll", optionC: "Hanya kereta", optionD: "Hanya jalan kaki", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "EASY", stem: "Kereta barang biasanya memiliki gerbong bertipe...", optionA: "Bermuatan air", optionB: "Terbuka dan tertutup", optionC: "Ber-AC", optionD: "Ber-TV", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "LOGISTICS", difficulty: "MEDIUM", stem: "\"Delivery schedule\" yang tepat penting untuk...", optionA: "Menyusahkan", optionB: "Memastikan barang sampai waktu", optionC: "Membuang waktu", optionD: "Meningkatkan biaya", correctAnswer: "B" },

  // ============ RES_CLEAN - Cleaning Service (15 SOAL) ============
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "\"Cleaning schedule\" di stasiun harus...", optionA: "Tidak pernah", optionB: "Rutin dan terjadwal", optionC: "Sekali sebulan", optionD: "Bebas", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "Membersihkan lantai stasiun sebaiknya menggunakan...", optionA: "Tangan kosong", optionB: "Alat pembersih yang sesuai", optionC: "Baju kotor", optionD: "Kotoran lain", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "\"Sanitizer\" tangan di stasiun penting untuk...", optionA: "Hiasan", optionB: "Kebersihan penumpang", optionC: "Makanan", optionD: "Pajak", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "MEDIUM", stem: "\"Deep cleaning\" toilet stasiun harus dilakukan...", optionA: "Tidak pernah", optionB: "Berkala dengan thorough", optionC: "Sekali setahun", optionD: "Tidak perlu", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "MEDIUM", stem: "\"Waste management\" di stasiun melibatkan...", optionA: "Buang sembarangan", optionB: "Pemilahan dan pembuangan bijak", optionC: "Bakar sampah", optionD: "Simpan forever", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "MEDIUM", stem: "Staff cleaning harus menggunakan...", optionA: "Baju robek", optionB: "PPE dan seragam resmi", optionC: "Bebas", optionD: "Sandals", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "MEDIUM", stem: "\"Disinfectant\" yang tepat untuk permukaan stasiun adalah...", optionA: "Air biasa", optionB: "Cairan disinfectan yang sesuai", optionC: "Minyak goreng", optionD: "Parfum", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "HARD", stem: "\"Green cleaning\" menggunakan...", optionA: "Bahan kimia keras", optionB: "Produk ramah lingkungan", optionC: "Air limbah", optionD: "Bahan beracun", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "HARD", stem: "\"Quality control\" kebersihan diukur dengan...", optionA: "Tidak diukur", optionB: "Inspeksi dan standar", optionC: "Feeling", optionD: "Tebas", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "Area tunggu stasiun harus...", optionA: "Kotor", optionB: "Bersih dan nyaman", optionC: "Basah terus", optionD: "Berdebu", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "\"Glass cleaning\" jendela stasiun最好 menggunakan...", optionA: "Baju kotor", optionB: "Pembersih kaca khusus", optionC: "Air comberan", optionD: "Tangan kosong", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "MEDIUM", stem: "\"Pest control\" di stasiun bertujuan untuk...", optionA: "Mengundang hama", optionB: "Mencegah hama dan serangga", optionC: "Membiakkan tikus", optionD: "Menambah kotoran", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "Setelah membersihkan, sampah harus...", optionA: "Dibiarkan", optionB: "Dibuang ke tempat sampah", optionC: "Dimakan", optionD: "Disimpan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "MEDIUM", stem: "\"Equipment maintenance\" alat pembersih penting untuk...", optionA: "Mempercepat kerja", optionB: "Keamanan dan efisiensi", optionC: "Merusak", optionD: "Mubazir", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_CLEAN", difficulty: "EASY", stem: "Staff cleaning harus bekerja...", optionA: "Bermain-main", optionB: "Profesional dan efisien", optionC: "Malas", optionD: "Tidak ada jadwal", correctAnswer: "B" },

  // ============ RES_PARKING - Parking (15 SOAL) ============
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "\"Parking fee\" yang benar harus...", optionA: "Diabaikan", optionB: "Dikenakan sesuai tarif", optionC: "Gratis semua", optionD: "Sesuka hati", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "Petugas parking harus...", optionA: "Tidur", optionB: "Mengatur lalu lintas kendaraan", optionC: "Main HP terus", optionD: "Pergi saja", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "\"Parking lot\" yang baik harus...", optionA: "Berlubang", optionB: "Rapi dan aman", optionC: "Sampah menumpuk", optionD: "Gelap total", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "MEDIUM", stem: "\"Lost ticket\" di parking harus...", optionA: "Buang", optionB: "Bayar sesuai ketentuan", optionC: "Dilepas", optionD: "Dimakan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "MEDIUM", stem: "\"Security\" area parking melibatkan...", optionA: "Biarkan rampas", optionB: "CCTV dan patroli", optionC: "Tidak ada keamanan", optionD: "Parkir liar", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "MEDIUM", stem: "Petugas parking harus membantu...", optionA: "Mobil pelanggan", optionB: "Mengendarai mobil orang", optionC: "Mencuri", optionD: "Merusak", correctAnswer: "A" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "MEDIUM", stem: "\"Vehicle damage\" di parking harus...", optionA: "Diabaikan", optionB: "Didokumentasi dan dilaporkan", optionC: "Ditutup-tutupi", optionD: "Dibiarkan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "HARD", stem: "\"Valet parking\" service berarti...", optionA: "Parkir sendiri", optionB: "Petugas parkir替 pelanggan", optionC: "Gratis", optionD: "Ditolak", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "HARD", stem: "\"Capacity management\" parking berguna untuk...", optionA: "Selalu penuh", optionB: "Mengatur kapasitas kendaraan", optionC: "Menyusahkan", optionD: "Meningkatkan kemacetan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "\"Marking\" tempat parkir harus...", optionA: "Hilang", optionB: "Jelas dan terlihat", optionC: "Di hapus", optionD: "Miring", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "Petugas parking harus berpakaian...", optionA: "Bebas", optionB: "Rapi dan menggunakan rompi", optionC: "Kotor", optionD: "Tradisional", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "MEDIUM", stem: "\"Disabled parking\" harus...", optionA: "Dipakai umum", optionB: "Disediakan di tempat strategis", optionC: "Ditutup", optionD: "Dibongkar", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "Kartu parking harus...", optionA: "Dirobek", optionB: "Diserahkan saat masuk/keluar", optionC: "Ditukar", optionD: "Diabaikan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "MEDIUM", stem: "\"Cash handling\" di parking harus...", optionA: "Diselewengkan", optionB: "Transparan dan accounting", optionC: "Ditutup-tutupi", optionD: "Bebas", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "RES_PARKING", difficulty: "EASY", stem: "Petugas parking harus berkomunikasi dengan...", optionA: "Teriakan", optionB: "Sopan dan jelas", optionC: "Basa-basi", optionD: "Kasar", correctAnswer: "B" },

  // ============ IT_STAFF (15 SOAL) ============
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "\"IT support\" railway membantu...", optionA: "Merusak sistem", optionB: "Menjaga sistem tetap berjalan", optionC: "Menghapus data", optionD: "Membajak", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "\"Server\" railway harus...", optionA: "Dimatikan terus", optionB: "Berjalan 24/7", optionC: "Dibuang", optionD: "Dibuka untuk umum", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "\"Password\" yang kuat harus...", optionA: "123456", optionB: "Kombinasi unik dan aman", optionC: "Nama sendiri", optionD: "Tidak pakai password", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "MEDIUM", stem: "\"Backup\" data railway harus dilakukan...", optionA: "Tidak pernah", optionB: "Berkala dan teratur", optionC: "Sekali saja", optionD: "Tidak penting", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "MEDIUM", stem: "\"Network security\" railway melindungi dari...", optionA: "Biarkan masuk", optionB: "Serangan cyber", optionC: "Penghapusan", optionD: "Pencurian biasa", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "MEDIUM", stem: "\"Hardware maintenance\" komputer railway meliputi...", optionA: "Biarkan rusak", optionB: "Perawatan berkala", optionC: "Penggunaan kasar", optionD: "Tidak pernah cek", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "MEDIUM", stem: "\"Software update\" penting untuk...", optionA: "Menambah bug", optionB: "Keamanan dan fitur baru", optionC: "Memperlambat sistem", optionD: "Membuang waktu", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "HARD", stem: "\"Firewall\" railway berfungsi untuk...", optionA: "Membuka semua akses", optionB: "Menyaring lalu lintas jaringan", optionC: "Menghapus firewall", optionD: "Menambah virus", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "HARD", stem: "\"VPN\" (Virtual Private Network) digunakan untuk...", optionA: "Memata-matai", optionB: "Koneksi aman jarak jauh", optionC: "Memperlambat internet", optionD: "Hiburan", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "\"Helpdesk\" IT menerima...", optionA: "Keluhan main-main", optionB: "Keluhan teknis pengguna", optionC: "Pemesanan makanan", optionD: "Hiburan", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "IT staff harus...", optionA: "Tidak bisa komputer", optionB: "Terus belajar teknologi baru", optionC: "Malas", optionD: "Tidak ada tanggung jawab", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "MEDIUM", stem: "\"Ticketing system\" IT membantu...", optionA: "Menyusahkan", optionB: "Melacak masalah secara terorganisir", optionC: "Diabaikan", optionD: "Menambah masalah", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "\"Email\" perusahaan harus...", optionA: "Tidak digunakan", optionB: "Digunakan secara profesional", optionC: "Untuk spam", optionD: "Diabaikan", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "MEDIUM", stem: "\"Cloud computing\" dalam railway berarti...", optionA: "Awan nyata", optionB: "Penyimpanan dan layanan online", optionC: "Cuaca", optionD: "Hiburan", correctAnswer: "B" },
  { category: "TECHNICAL", jobDivision: "IT_STAFF", difficulty: "EASY", stem: "IT staff harus...", optionA: "Bekerja sendiri saja", optionB: "Bekerja sama dengan departemen lain", optionC: "Menolak membantu", optionD: "Menyusahkan", correctAnswer: "B" },

  // ============ ADMIN (15 SOAL) ============
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "\"Administrative\" tugas utama adalah...", optionA: "Main game", optionB: "Mengelola dokumen dan data", optionC: "Tidur", optionD: "Hiburan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "\"Filing system\" yang baik harus...", optionA: "Berserakan", optionB: "Tertata dan mudah ditemukan", optionC: "Di bakar", optionD: "Di robek", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "\"Meeting\" yang efisien harus...", optionA: "Berjam-jam tanpa hasil", optionB: "Terstruktur dan tepat waktu", optionC: "Dihindari", optionD: "Tidak pernah ada", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "MEDIUM", stem: "\"Report writing\" yang baik harus...", optionA: "Membosankan", optionB: "Jelas, ringkas, dan akurat", optionC: "Palsu", optionD: "Dianggap angin lalu", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "MEDIUM", stem: "\"Time management\" penting untuk...", optionA: "Menghilangkan produktivitas", optionB: "Efisiensi kerja", optionC: "Membuang waktu", optionD: "Menunda semua", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "MEDIUM", stem: "\"Communication\" yang efektif dalam admin adalah...", optionA: "Basa-basi saja", optionB: "Jelas dan tepat sasaran", optionC: "Teriak-teriak", optionD: "Silent treatment", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "MEDIUM", stem: "\"Data entry\" harus...", optionA: "Asal isi", optionB: "Akurat dan teliti", optionC: "Diubah-ubah", optionD: "Dibiarkan kosong", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "HARD", stem: "\"Confidentiality\" dokumen perusahaan harus...", optionA: "Dibagi ke semua", optionB: "Dijaga ketat", optionC: "Diupload ke internet", optionD: "Dianggap tidak penting", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "HARD", stem: "\"Process improvement\" dalam administrasi bertujuan...", optionA: "Menambah pekerjaan", optionB: "Mempermudah dan mempercepat kerja", optionC: "Mubazir", optionD: "Menyusahkan", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "\"Office supplies\" harus...", optionA: "Diambil sendiri", optionB: "Tersedia dan terpakai wajar", optionC: "Ditimbun", optionD: "Dicuri", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "Admin staff harus...", optionA: "Tidak bisa komputer", optionB: "Mahir menggunakan aplikasi office", optionC: "Malas", optionD: "Tidak jujur", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "MEDIUM", stem: "\"Correspondence\" (surat-menyurat) harus...", optionA: "Diabaikan", optionB: "Direspons dengan cepat", optionC: "Ditumpuk", optionD: "Dibuang", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "\"Calendar management\" membantu...", optionA: "Melewatkan jadwal", optionB: "Mengatur jadwal dengan baik", optionC: "Menambah konflik", optionD: "Memperbanyak masalah", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "MEDIUM", stem: "\"Stakeholder management\" dalam railway adalah...", optionA: "Diabaikan", optionB: "Mengelola hubungan dengan semua pihak", optionC: "Memusuhi semua", optionD: "Tidak perlu", correctAnswer: "B" },
  { category: "FACILITY", jobDivision: "ADMIN", difficulty: "EASY", stem: "\"Customer service\" admin harus...", optionA: "Kasar", optionB: "Ramah dan profesional", optionC: "Tidak peduli", optionD: "Marah-marah", correctAnswer: "B" },
];

async function main() {
  console.log("Starting to seed division-specific questions...");

  // Create new questions
  const createdQuestions = [];
  for (const q of divisionQuestions) {
    const question = await prisma.question.create({
      data: {
        stem: q.stem,
        category: q.category,
        jobDivision: q.jobDivision,
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

  console.log(`Successfully created ${createdQuestions.length} division-specific questions`);

  // Show count by division
  const counts = await prisma.question.groupBy({
    by: ["jobDivision"],
    _count: { id: true },
  });

  console.log("\nQuestions by division:");
  for (const c of counts) {
    if (c.jobDivision) {
      console.log(`  ${c.jobDivision.replace(/_/g, " ")}: ${c._count.id} questions`);
    } else {
      console.log(`  General (no division): ${c._count.id} questions`);
    }
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
