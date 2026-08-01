/**
 * Return Service for CepatRetur
 * Generates unique return codes, category-specific packing instructions, and simulated shipping address.
 */

// Safe alphanumeric character set excluding ambiguous characters (0, O, I, 1)
const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateReturnCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_CHARS.length);
    randomPart += SAFE_CHARS[randomIndex];
  }

  return `RTR-${dateStr}-${randomPart}`;
}

export function getPackingInstructions(category) {
  const instructions = {
    fashion: [
      'Pastikan barang bersih, tidak berbau, dan belum pernah digunakan atau dicuci.',
      'Masukkan kembali produk ke dalam kemasan asli (pouch / kotak merk).',
      'Sertakan seluruh label, tag harga, dan aksesori produk yang terpasang.',
      'Gunakan plastik pelindung atau kardus tambahan saat membungkus paket.'
    ],
    electronics: [
      'Matikan perangkat elektronik secara total sebelum dikemas.',
      'Lepaskan akun pribadi, passcode/PIN, atau data pribadi yang tersimpan (jika relevan).',
      'Sertakan seluruh aksesori bawaan (kabel pengisi daya, adaptor, buku panduan, & kartu garansi).',
      'Lapisi kotak produk dengan bubble wrap minimal 2-3 lapis untuk meredam benturan.',
      'Gunakan kardus luar yang kokoh dengan isi gumpalan kertas/bubble wrap pada ruang kosong.'
    ],
    accessories: [
      'Bersihkan barang dari debu, sidik jari, atau noda.',
      'Simpan dalam kotak pouch atau wadah asli produk.',
      'Sertakan sertifikat keaslian, nota, atau aksesori pendukung jika ada.',
      'Bungkus dengan bubble wrap secukupnya agar tidak terbentur saat pengiriman.'
    ],
    home_appliances: [
      'Kosongkan dan keringkan sisa air atau cairan pada peralatan rumah tangga.',
      'Lepaskan komponen yang mudah terlepas dan bungkus secara terpisah.',
      'Sertakan buku panduan dan kelengkapan garansi resmi.',
      'Lapisi dengan bubble wrap tebal dan masukkan ke dalam kardus pembungkus yang kokoh.'
    ],
    other: [
      'Pastikan kondisi barang rapi, bersih, dan tidak cacat baru.',
      'Masukkan ke dalam kemasan asli jika masih tersedia.',
      'Bungkus dengan bubble wrap atau pelindung tambahan agar aman di perjalanan kurir.'
    ]
  };

  return instructions[category] || instructions.other;
}

export const SIMULATION_SHIPPING_ADDRESS = {
  name: 'Pusat Retur CepatRetur',
  street: 'Jl. Simulasi Logistik No. 10',
  city: 'Semarang',
  province: 'Jawa Tengah',
  postalCode: '50100',
  notice: 'Alamat ini hanya digunakan untuk Simulasi Final Project dan bukan alamat pengiriman nyata.'
};
