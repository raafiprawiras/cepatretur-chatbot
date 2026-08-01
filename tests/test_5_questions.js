import 'dotenv/config';
import { generateChatResponse } from '../services/geminiService.js';

const questions = [
  'Bagaimana cara mengembalikan barang rusak?',
  'Apakah barang salah ukuran dapat ditukar?',
  'Bagaimana cara mengemas barang elektronik?',
  'Kapan refund diproses?',
  'Apa yang harus dilakukan jika kode retur tidak ditemukan?'
];

async function runTests() {
  console.log('=== PENGUJIAN 5 PERTANYAAN MILESTONE 4 ===\n');

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`[UJI ${i + 1}] Pertanyaan: "${q}"`);

    const response = await generateChatResponse([{ role: 'user', text: q }]);

    if (response.error) {
      console.log(`❌ ERROR: ${response.message}\n`);
    } else {
      console.log(`✅ HASIL (Model: ${response.model}):`);
      console.log(response.result);
      console.log('--------------------------------------------------\n');
    }
  }
}

runTests();
