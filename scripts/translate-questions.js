// Script to update foreign language questions to Indonesian
// Run with: node scripts/translate-questions.js

const API_BASE = 'http://localhost:3000/api/admin/questions';

// Common English words/phrases -> Indonesian translations
const TRANSLATIONS = {
  // Single words
  'tourists': 'wisatawan',
  'tourist': 'wisatawan',
  'foreigners': 'orang asing',
  'foreigner': 'orang asing',
  'foreign': 'asing',
  'accident': 'kecelakaan',
  'accidente': 'kecelakaan',
  'when': 'saat',
  'driver': 'sopir',
  'drivers': 'sopir',
  'customer': 'pelanggan',
  'customers': 'pelanggan',
  'visitor': 'pengunjung',
  'visitors': 'pengunjung',
  'staff': 'staf',
  'employee': 'karyawan',
  'employees': 'karyawan',
  'service': 'layanan',
  'services': 'layanan',
  'management': 'pengelolaan',
  'manager': 'manajer',
  'problem': 'masalah',
  'problems': 'masalah',
  'solution': 'solusi',
  'solutions': 'solusi',
  'vehicle': 'kendaraan',
  'vehicles': 'kendaraan',
  'parking': 'parkir',
  'maximum': 'maksimal',
  'capacity': 'kapasitas',
  'damage': 'kerusakan',
  'damaged': 'rusak',
  'process': 'proses',
  'professionalism': 'profesionalisme',
  'documentation': 'dokumentasi',
  'document': 'dokumen',
  'documents': 'dokumen',
  'delivery': 'pengiriman',
  'shipping': 'pengiriman',
  'warehouse': 'gudang',
  'emotion': 'emosi',
  'emotional': 'emosi',
  'emotions': 'emosi',
  'professional': 'profesional',
  'error': 'kesalahan',
  'errors': 'kesalahan',
  'mistake': 'kesalahan',
  'mistakes': 'kesalahan',
  'confidentiality': 'kerahasiaan',
  'honesty': 'kejujuran',
  'discipline': 'disiplin',
  'safety': 'keselamatan',
  'secure': 'aman',
  'security': 'keamanan',
  'check': 'periksa',
  'checking': 'pemeriksaan',
  'automatic': 'otomatis',
  'gate': 'gerbang',
  'barrier': 'penghalang',
  'lamp': 'lampu',
  'lights': 'lampu',
  'light': 'lampu',
  'slot': 'tempat',
  'product': 'produk',
  'products': 'produk',
  'information': 'informasi',
  'limited': 'terbatas',
  'important': 'penting',
  'importance': 'pentingnya',
  'should': 'seharusnya',
  'must': 'harus',
  'need': 'perlu',
  'pay': 'bayar',
  'payment': 'pembayaran',
  'product': 'produk',
  // Common articles to remove
  'the ': ' ',
  ' a ': ' ',
  ' an ': ' ',
  ' and ': ' dan ',
  ' or ': ' atau ',
  ' to ': ' ke ',
  ' of ': ' dari ',
  ' for ': ' untuk ',
  ' with ': ' dengan ',
  ' in ': ' di ',
  ' on ': ' di ',
  ' at ': ' di ',
};

function translateText(text) {
  if (!text) return text;

  let result = text;

  // Sort by length (longest first)
  const keys = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    const regex = new RegExp(key, 'gi');
    result = result.replace(regex, TRANSLATIONS[key]);
  }

  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

function hasForeignWords(text) {
  if (!text) return false;

  const patterns = [
    /\btourists?\b/i,
    /\bforeigners?\b/i,
    /\baccidente\b/i,
    /\bwhen\b/i,
    /\bdrivers?\b/i,
    /\bcustomers?\b/i,
    /\bvisitors?\b/i,
    /\bprofessionalism\b/i,
    /\blead time\b/i,
    /\bcross.docking\b/i,
    /\bloading\/unloading\b/i,
    /\bcapacity\b/i,
    /\bmaximum\b/i,
    /\bproduct[s]?\b/i,
    /\bvisitor[s]?\b/i,
    /\bor\b/i,
    /\band\b/i,
    /\bthe\b/i,
  ];

  return patterns.some(p => p.test(text));
}

async function fetchQuestions() {
  const response = await fetch(API_BASE);
  const data = await response.json();
  return data.questions;
}

async function updateQuestion(id, data) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function main() {
  console.log('Fetching questions from database...');
  const questions = await fetchQuestions();
  console.log(`Total questions: ${questions.length}`);

  // Find questions that need translation
  const questionsToUpdate = [];

  for (const q of questions) {
    const needsUpdate =
      hasForeignWords(q.stem) ||
      hasForeignWords(q.optionA) ||
      hasForeignWords(q.optionB) ||
      hasForeignWords(q.optionC) ||
      hasForeignWords(q.optionD);

    if (needsUpdate) {
      questionsToUpdate.push(q);
    }
  }

  console.log(`Questions needing translation: ${questionsToUpdate.length}`);
  console.log('');

  // Show samples
  console.log('=== Sample questions to be translated ===');
  questionsToUpdate.slice(0, 10).forEach(q => {
    console.log(`[${q.id.substring(0, 8)}...] [${q.category}]`);
    console.log(`  BEFORE: ${q.stem}`);
    console.log(`  AFTER:  ${translateText(q.stem)}`);
    console.log('');
  });

  // Update all
  console.log('Starting translation update...');
  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questionsToUpdate.length; i++) {
    const q = questionsToUpdate[i];

    const translatedStem = translateText(q.stem);
    const translatedA = translateText(q.optionA);
    const translatedB = translateText(q.optionB);
    const translatedC = translateText(q.optionC);
    const translatedD = translateText(q.optionD);

    // Check if any translation happened
    const hasChange =
      translatedStem !== q.stem ||
      translatedA !== q.optionA ||
      translatedB !== q.optionB ||
      translatedC !== q.optionC ||
      translatedD !== q.optionD;

    if (hasChange) {
      try {
        await updateQuestion(q.id, {
          stem: translatedStem,
          optionA: translatedA,
          optionB: translatedB,
          optionC: translatedC,
          optionD: translatedD,
        });

        updatedCount++;
        process.stdout.write(`[${i + 1}/${questionsToUpdate.length}] Updated: ${q.id.substring(0, 8)}...\n`);
      } catch (error) {
        errorCount++;
        console.error(`Error updating ${q.id}: ${error.message}`);
      }
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Total questions checked: ${questionsToUpdate.length}`);
  console.log(`Questions updated: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('Done!');
}

main().catch(console.error);
