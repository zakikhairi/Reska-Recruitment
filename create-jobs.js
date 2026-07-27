const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Creating sample job postings...\n');

  const jobs = [
    {
      title: 'Pramugara / Pramugari Kereta Api',
      division: 'ON_TRAIN_SERVICE',
      location: 'Jakarta, Bandung, Surabaya',
      description: 'Melayani penumpang kereta api dengan ramah dan profesional. Bertanggung jawab atas kenyamanan dan keamanan penumpang selama perjalanan.',
      requirements: 'SMA/SMK semua jurusan, tinggi minimal 160cm (wanita) / 165cm (pria), usia 18-25 tahun, penampilan menarik dan ramah',
      minEducation: 'SMA',
      minHeight: 160,
      minAge: 18,
      maxAge: 25,
      status: 'ACTIVE',
      deadline: new Date('2026-08-15')
    },
    {
      title: 'Steward Kereta Api',
      division: 'ON_TRAIN_SERVICE',
      location: 'Bandung',
      description: 'Membantu kelancaran layanan di dalam kereta. Bertanggung jawab untuk makanan, minuman, dan kebutuhan penumpang.',
      requirements: 'SMA/SMK Pariwisata atau Perhotelan, tinggi badan minimal 158cm, pengalaman di bidang hospitality diutamakan',
      minEducation: 'SMA',
      minHeight: 158,
      minAge: 18,
      maxAge: 30,
      status: 'ACTIVE',
      deadline: new Date('2026-08-20')
    },
    {
      title: 'Staff IT Support',
      division: 'IT_STAFF',
      location: 'Jakarta',
      description: 'Mengelola sistem IT dan jaringan di seluruh cabang. Maintenance hardware dan software.',
      requirements: 'S1 Teknik Informatika / Sistem Informasi, IPK minimal 3.0, pengalaman IT support diutamakan',
      minEducation: 'S1',
      minAge: 22,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date('2026-08-10')
    },
    {
      title: 'Teknisi Maintenance Kereta',
      division: 'LOGISTICS',
      location: 'Madiun',
      description: 'Merawat dan memperbaiki komponen kereta api. Melakukan inspeksi dan perawatan berkala.',
      requirements: 'D3/S1 Teknik Mesin atau Elektro, bersertifikasi diutamakan',
      minEducation: 'D3',
      minAge: 20,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date('2026-08-25')
    },
    {
      title: 'Cleaning Service - ResClean',
      division: 'RES_CLEAN',
      location: 'Bandung, Jakarta',
      description: 'Membersihkan dan menjaga kebersihan stasiun dan kereta. Memastikan area kerja selalu bersih dan rapi.',
      requirements: 'SMA/SMK, pengalaman cleaning service diutamakan, bersedia bekerja shift',
      minEducation: 'SMA',
      minAge: 18,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date('2026-09-01')
    },
    {
      title: 'Staff Administrasi',
      division: 'ADMIN',
      location: 'Jakarta',
      description: 'Mengelola administrasi perkantoran. Menghandle dokumen, arsip, dan komunikasi kantor.',
      requirements: 'D3/S1 Administrasi Bisnis atau Komunikasi, mahir Microsoft Office, pengalaman admin diutamakan',
      minEducation: 'D3',
      minAge: 20,
      maxAge: 30,
      status: 'ACTIVE',
      deadline: new Date('2026-08-18')
    }
  ];

  for (const job of jobs) {
    const created = await prisma.jobPosting.create({ data: job });
    console.log(`Created: ${created.title} (${created.division})`);
  }

  console.log('\nAll jobs created successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
