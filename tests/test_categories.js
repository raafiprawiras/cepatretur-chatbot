import 'dotenv/config';
import { getPackingInstructions, generateReturnCode, SIMULATION_SHIPPING_ADDRESS } from '../services/returnService.js';

const testCategories = ['fashion', 'electronics', 'accessories'];

console.log('=== PENGUJIAN 3 KATEGORI BARANG (MILESTONE 6) ===\n');

testCategories.forEach((cat, index) => {
  const returnCode = generateReturnCode();
  const instructions = getPackingInstructions(cat);

  console.log(`[UJI ${index + 1}] Kategori: "${cat.toUpperCase()}"`);
  console.log(`- Kode Retur Backend: ${returnCode}`);
  console.log(`- Alamat Simulasi: ${SIMULATION_SHIPPING_ADDRESS.name}, ${SIMULATION_SHIPPING_ADDRESS.street}, ${SIMULATION_SHIPPING_ADDRESS.city}`);
  console.log(`- Panduan Pengemasan:`);
  instructions.forEach((inst, i) => {
    console.log(`   ${i + 1}. ${inst}`);
  });
  console.log('--------------------------------------------------\n');
});
