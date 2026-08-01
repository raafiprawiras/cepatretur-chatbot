/**
 * Eligibility Service for CepatRetur
 * Deterministic return eligibility evaluation logic according to Simulation Policy rules.
 */

export function checkReturnEligibility({ orderNumber, sealAvailable, daysRange, reason }) {
  const validDays = ['0-7', '8-14', '>14'];
  const validReasons = ['wrong_size', 'damaged', 'not_as_described', 'changed_mind'];

  if (!daysRange || !validDays.includes(daysRange)) {
    return {
      valid: false,
      error: 'Rentang hari (daysRange) tidak dikenal. Nilai yang valid: "0-7", "8-14", ">14".'
    };
  }

  if (!reason || !validReasons.includes(reason)) {
    return {
      valid: false,
      error: 'Alasan pengembalian (reason) tidak dikenal. Nilai yang valid: "wrong_size", "damaged", "not_as_described", "changed_mind".'
    };
  }

  const isSealAvailable = Boolean(sealAvailable);

  // Rule 1: More than 14 days -> NOT ELIGIBLE
  if (daysRange === '>14') {
    return {
      valid: true,
      data: {
        eligible: false,
        reviewRequired: false,
        decisionCode: 'EXPIRED',
        reason: 'Pengajuan retur melebihi batas waktu maksimal 14 hari sejak barang diterima (Kebijakan Simulasi Final Project).',
        requirements: []
      }
    };
  }

  // Rule 2: Changed mind without seal -> NOT ELIGIBLE
  if (!isSealAvailable && reason === 'changed_mind') {
    return {
      valid: true,
      data: {
        eligible: false,
        reviewRequired: false,
        decisionCode: 'NOT_ELIGIBLE_SEAL_REMOVED',
        reason: 'Alasan berubah pikiran tidak dapat diproses jika label/segel barang sudah tidak tersedia atau dilepas (Kebijakan Simulasi Final Project).',
        requirements: []
      }
    };
  }

  // Rule 3: Wrong size without seal -> NOT ELIGIBLE
  if (!isSealAvailable && reason === 'wrong_size') {
    return {
      valid: true,
      data: {
        eligible: false,
        reviewRequired: false,
        decisionCode: 'SEAL_REQUIRED_FOR_SIZE',
        reason: 'Penukaran ukuran barang memerlukan label/segel barang yang masih utuh (Kebijakan Simulasi Final Project).',
        requirements: []
      }
    };
  }

  // Rule 4: Damaged / Not as described with damaged/missing seal -> ELIGIBLE WITH REVIEW
  if (!isSealAvailable && (reason === 'damaged' || reason === 'not_as_described')) {
    return {
      valid: true,
      data: {
        eligible: true,
        reviewRequired: true,
        decisionCode: 'REVIEW_REQUIRED_DAMAGED_SEAL',
        reason: 'Pengembalian barang rusak atau tidak sesuai pesanan dapat diproses meskipun segel rusak/dilepas, tetapi memerlukan bukti foto/video kondisi barang yang jelas (Kebijakan Simulasi Final Project).',
        requirements: [
          'Unggah foto/video bukti unboxing dan bagian barang yang rusak/tidak sesuai',
          'Sertakan kemasan asli barang (jika ada)',
          'Kemas barang secara aman dengan pelindung tambahan'
        ]
      }
    };
  }

  // Rule 5: 8-14 days for Damaged or Not as Described -> ELIGIBLE WITH REVIEW
  if (daysRange === '8-14' && (reason === 'damaged' || reason === 'not_as_described')) {
    return {
      valid: true,
      data: {
        eligible: true,
        reviewRequired: true,
        decisionCode: 'REVIEW_REQUIRED_EXTENDED_DAYS',
        reason: 'Pengajuan diterima pada rentang 8–14 hari untuk kategori barang rusak/tidak sesuai pesanan. Diperlukan pemeriksaan bukti kondisi barang oleh tim customer service (Kebijakan Simulasi Final Project).',
        requirements: [
          'Unggah foto/video bukti kerusakan/ketidaksesuaian barang',
          'Pastikan seluruh komponen produk lengkap'
        ]
      }
    };
  }

  // Rule 6: 8-14 days for Wrong size or Changed mind with seal -> ELIGIBLE WITH REVIEW
  if (daysRange === '8-14' && isSealAvailable) {
    return {
      valid: true,
      data: {
        eligible: true,
        reviewRequired: true,
        decisionCode: 'REVIEW_REQUIRED_LATE_RETURN',
        reason: 'Pengajuan diterima pada rentang 8–14 hari dengan segel utuh. Diperlukan verifikasi kelayakan stok dan kondisi oleh tim (Kebijakan Simulasi Final Project).',
        requirements: [
          'Barang dalam kondisi belum pernah digunakan atau dicuci',
          'Label dan segel produk wajib utuh terpasang'
        ]
      }
    };
  }

  // Rule 7: 0-7 days with seal available -> ELIGIBLE
  if (daysRange === '0-7' && isSealAvailable) {
    return {
      valid: true,
      data: {
        eligible: true,
        reviewRequired: false,
        decisionCode: 'ELIGIBLE',
        reason: 'Pengajuan masih dalam batas waktu 0–7 hari dan segel/label barang masih utuh dan tersedia (Kebijakan Simulasi Final Project).',
        requirements: [
          'Barang belum digunakan / belum dicuci',
          'Sertakan seluruh kemasan dan aksesori asli'
        ]
      }
    };
  }

  // Default fallback for any other combination
  return {
    valid: true,
    data: {
      eligible: false,
      reviewRequired: false,
      decisionCode: 'NOT_ELIGIBLE_DEFAULT',
      reason: 'Pengajuan tidak memenuhi syarat kelayakan retur (Kebijakan Simulasi Final Project).',
      requirements: []
    }
  };
}
